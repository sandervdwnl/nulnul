/**
 * Gistberekening voor napolitaans pizzadeeg
 * Bron: November's Baker's Yeast Percentages chart (pizzamaking.com, 2012)
 *
 * Gistpercentage wordt afgeleid uit:
 * - Fermentatietijd (uren)
 * - Temperatuur (°C)
 * - Gisttype (IDY, ADY, verse gist)
 *
 * We gebruiken een vereenvoudigde twee-staps lineaire interpolatie:
 * 1. Interpoleer op temperatuur voor elke tijd
 * 2. Interpoleer op tijd voor de gevraagde temperatuur
 *
 * Fallback: dichtstbijzijnd punt als interpolatie niet mogelijk is.
 */
// Omrekenfactoren: ADY = 1.2x IDY, verse gist = 3x IDY (volgens AVPN)
const GIST_FACTOREN = {
    IDY: 1.0,
    ADY: 1.2, // Actieve drooggist is iets minder potent dan IDY
    verse: 3.0, // Verse gist is 3x minder geconcentreerd dan IDY
};
/**
 * Vereenvoudigde November-tabel voor gistpercentages (IDY)
 * Format: { temperatuur: °C, tijd: uren, percentage: % }
 *
 * Bron: November's Baker's Yeast Percentages chart
 * Opmerking: Dit is een vereenvoudigde subset voor mobiele app.
 * Percentages zijn in **decimaal** (bv. 0.0012 = 0.12%).
 */
const NOVEMBER_TABEL_IDY = [
    // Korte fermentatie (4 uur) - kamertemperatuur
    { temp: 18, tijd: 4, percentage: 0.009 }, // 0.9%
    { temp: 20, tijd: 4, percentage: 0.008 }, // 0.8%
    { temp: 22, tijd: 4, percentage: 0.007 }, // 0.7%
    { temp: 24, tijd: 4, percentage: 0.006 }, // 0.6%
    { temp: 26, tijd: 4, percentage: 0.005 }, // 0.5%
    // Korte fermentatie (8 uur)
    { temp: 18, tijd: 8, percentage: 0.0045 }, // 0.45%
    { temp: 20, tijd: 8, percentage: 0.004 }, // 0.4%
    { temp: 22, tijd: 8, percentage: 0.0035 }, // 0.35%
    { temp: 24, tijd: 8, percentage: 0.003 }, // 0.3%
    // Middellange fermentatie (12 uur)
    { temp: 18, tijd: 12, percentage: 0.003 }, // 0.3%
    { temp: 20, tijd: 12, percentage: 0.0025 }, // 0.25%
    { temp: 22, tijd: 12, percentage: 0.002 }, // 0.2%
    { temp: 24, tijd: 12, percentage: 0.0018 }, // 0.18%
    // Middellange fermentatie (24 uur)
    { temp: 18, tijd: 24, percentage: 0.0018 }, // 0.18%
    { temp: 20, tijd: 24, percentage: 0.0015 }, // 0.15%
    { temp: 22, tijd: 24, percentage: 0.0012 }, // 0.12%
    { temp: 24, tijd: 24, percentage: 0.001 }, // 0.1%
    // Lange fermentatie (48 uur) - koelkast (~5°C)
    { temp: 5, tijd: 48, percentage: 0.0005 }, // 0.05%
    { temp: 10, tijd: 48, percentage: 0.0008 }, // 0.08%
    // Zeer lange fermentatie (72 uur)
    { temp: 5, tijd: 72, percentage: 0.0003 }, // 0.03%
];
/**
 * Lineaire interpolatie tussen twee punten
 */
function lineaireInterpolatie1D(x, x1, y1, x2, y2) {
    if (x <= x1)
        return y1;
    if (x >= x2)
        return y2;
    const ratio = (x - x1) / (x2 - x1);
    return y1 + ratio * (y2 - y1);
}
/**
 * Twee-staps lineaire interpolatie voor gistpercentage:
 * 1. Interpoleer op temperatuur voor elke tijd
 * 2. Interpoleer op tijd voor de gevraagde temperatuur
 */
function tweeStapsInterpolatie(temp, tijd, tabel) {
    // Groepeer tabel per tijd
    const perTijd = {};
    for (const entry of tabel) {
        if (!perTijd[entry.tijd]) {
            perTijd[entry.tijd] = [];
        }
        perTijd[entry.tijd].push({ temp: entry.temp, percentage: entry.percentage });
    }
    // Zoek de twee dichtstbijzijnde tijden
    const tijdPunten = Object.keys(perTijd).map(Number).sort((a, b) => a - b);
    let tijd1 = -Infinity;
    let tijd2 = Infinity;
    for (const t of tijdPunten) {
        if (t <= tijd && t > tijd1)
            tijd1 = t;
        if (t >= tijd && t < tijd2)
            tijd2 = t;
    }
    // Als geen omringende tijden, gebruik dichtstbijzijnde
    if (tijd1 === -Infinity || tijd2 === Infinity) {
        const dichtstbij = tijdPunten.reduce((prev, curr) => Math.abs(curr - tijd) < Math.abs(prev - tijd) ? curr : prev);
        tijd1 = dichtstbij;
        tijd2 = dichtstbij;
    }
    // Interpoleer op temperatuur voor tijd1 en tijd2
    const getPercentageAtTemp = (t) => {
        const entries = perTijd[t];
        if (!entries)
            return 0;
        // Sorteer op temperatuur
        entries.sort((a, b) => a.temp - b.temp);
        // Zoek omringende temperaturen
        let temp1 = -Infinity;
        let temp2 = Infinity;
        let p1 = 0;
        let p2 = 0;
        for (const entry of entries) {
            if (entry.temp <= temp && entry.temp > temp1) {
                temp1 = entry.temp;
                p1 = entry.percentage;
            }
            if (entry.temp >= temp && entry.temp < temp2) {
                temp2 = entry.temp;
                p2 = entry.percentage;
            }
        }
        // Als geen omringende temperaturen, gebruik dichtstbijzijnde
        if (temp1 === -Infinity || temp2 === Infinity) {
            const dichtstbij = entries.reduce((prev, curr) => Math.abs(curr.temp - temp) < Math.abs(prev.temp - temp) ? curr : prev);
            return dichtstbij.percentage;
        }
        return lineaireInterpolatie1D(temp, temp1, p1, temp2, p2);
    };
    const p1 = getPercentageAtTemp(tijd1);
    const p2 = getPercentageAtTemp(tijd2);
    // Interpoleer op tijd
    return lineaireInterpolatie1D(tijd, tijd1, p1, tijd2, p2);
}
/**
 * Zoek het dichtstbijzijnde percentage in de tabel (fallback)
 */
function zoekDichtstbijzijndPercentage(temp, tijd, tabel) {
    let besteMatch = tabel[0].percentage;
    let kleinsteAfstand = Infinity;
    for (const entry of tabel) {
        const tempDiff = Math.abs(entry.temp - temp);
        const tijdDiff = Math.abs(entry.tijd - tijd);
        const afstand = Math.sqrt(tempDiff * tempDiff + tijdDiff * tijdDiff);
        if (afstand < kleinsteAfstand) {
            kleinsteAfstand = afstand;
            besteMatch = entry.percentage;
        }
    }
    return besteMatch;
}
/**
 * Bereken gistpercentage voor gegeven temperatuur en tijd
 * @param temp - Temperatuur in °C
 * @param tijd - Fermentatietijd in uren
 * @param gistType - Type gist (IDY, ADY, verse)
 * @returns Gistpercentage (als decimaal, bv. 0.01 = 1%)
 */
export function berekenGistPercentage(temp, tijd, gistType = "IDY") {
    // Clamp temperatuur tussen 4°C en 30°C
    temp = Math.max(4, Math.min(30, temp));
    // Clamp tijd tussen 3 en 72 uur
    tijd = Math.max(3, Math.min(72, tijd));
    // Bereken IDY percentage met twee-staps interpolatie
    let idyPercentage;
    try {
        idyPercentage = tweeStapsInterpolatie(temp, tijd, NOVEMBER_TABEL_IDY);
        // Als interpolatie NaN retourneert, gebruik fallback
        if (isNaN(idyPercentage)) {
            idyPercentage = zoekDichtstbijzijndPercentage(temp, tijd, NOVEMBER_TABEL_IDY);
        }
    }
    catch (e) {
        idyPercentage = zoekDichtstbijzijndPercentage(temp, tijd, NOVEMBER_TABEL_IDY);
    }
    // Pas aan voor gisttype
    return idyPercentage * GIST_FACTOREN[gistType];
}
/**
 * Bereken hoeveelheid gist in grammen
 * @param bloemGewicht - Hoeveelheid bloem in grammen
 * @param temp - Temperatuur in °C
 * @param tijd - Fermentatietijd in uren
 * @param gistType - Type gist
 * @returns Hoeveelheid gist in grammen (afgerond op 0.1g)
 */
export function berekenGistGewicht(bloemGewicht, temp, tijd, gistType = "IDY") {
    const percentage = berekenGistPercentage(temp, tijd, gistType);
    const gistGewicht = bloemGewicht * percentage;
    // Afronden op 0.1g voor nauwkeurigheid
    return Math.round(gistGewicht * 10) / 10;
}
/**
 * Bereken gist voor koelkast-schema's (bv. 24u: 4u kamer + 20u koelkast)
 *
 * Aanpak: Bereken de **gemiddelde temperatuur** gewogen door tijd,
 * en gebruik deze voor de totale fermentatietijd.
 *
 * @param bloemGewicht - Hoeveelheid bloem in grammen
 * @param kamerTemp - Kamertemperatuur in °C
 * @param koelkastTemp - Koelkasttemperatuur in °C (standaard 5°C)
 * @param kamerTijd - Tijd op kamertemperatuur in uren
 * @param koelkastTijd - Tijd in koelkast in uren
 * @param gistType - Type gist
 * @returns Hoeveelheid gist in grammen
 */
export function berekenGistKoelkast(bloemGewicht, kamerTemp, koelkastTemp = 5, kamerTijd = 4, koelkastTijd, gistType = "IDY") {
    const totaleTijd = kamerTijd + koelkastTijd;
    // Bereken gemiddelde temperatuur (gewogen door tijd)
    const gemiddeldeTemp = (kamerTemp * kamerTijd + koelkastTemp * koelkastTijd) / totaleTijd;
    // Bereken gist voor totale tijd bij gemiddelde temperatuur
    return berekenGistGewicht(bloemGewicht, gemiddeldeTemp, totaleTijd, gistType);
}
