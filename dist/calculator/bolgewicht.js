/**
 * Bolgewicht-berekening voor napolitaans pizzadeeg
 * Bron: AVPN disciplinare 2024 + pizzamaking.com (9-inch ≈ 23 cm ≈ 200g)
 */
// Bolgewicht-tabel per diameter (cm) met inch-equivalenten
// Lineaire interpolatie voor tussengelegen diameters
const BOLGEWICHT_TABEL = [
    { diameter: 16, gewicht: 140, inch: 6.3 },
    { diameter: 20, gewicht: 170, inch: 7.9 },
    { diameter: 24, gewicht: 210, inch: 9.4 },
    { diameter: 26, gewicht: 230, inch: 10.2 },
    { diameter: 28, gewicht: 250, inch: 11.0 },
    { diameter: 32, gewicht: 290, inch: 12.6 },
    { diameter: 36, gewicht: 320, inch: 14.2 },
];
/**
 * Lineaire interpolatie tussen twee punten
 */
function lineaireInterpolatie(x, x1, y1, x2, y2) {
    if (x <= x1)
        return y1;
    if (x >= x2)
        return y2;
    const ratio = (x - x1) / (x2 - x1);
    return y1 + ratio * (y2 - y1);
}
/**
 * Bereken bolgewicht voor een gegeven diameter (cm)
 * @param diameter - Diameter in centimeters (16-36)
 * @returns Bolgewicht in grammen (afgerond op hele gram)
 */
export function berekenBolgewicht(diameter) {
    if (diameter < 16)
        diameter = 16;
    if (diameter > 36)
        diameter = 36;
    // Zoek de twee dichtstbijzijnde punten in de tabel
    for (let i = 0; i < BOLGEWICHT_TABEL.length - 1; i++) {
        const current = BOLGEWICHT_TABEL[i];
        const next = BOLGEWICHT_TABEL[i + 1];
        if (diameter >= current.diameter && diameter <= next.diameter) {
            return Math.round(lineaireInterpolatie(diameter, current.diameter, current.gewicht, next.diameter, next.gewicht));
        }
    }
    // Fallback: laatste waarde in tabel
    return BOLGEWICHT_TABEL[BOLGEWICHT_TABEL.length - 1].gewicht;
}
/**
 * Bereken inch-equivalent voor een gegeven diameter (cm)
 * @param diameter - Diameter in centimeters
 * @returns Inch-equivalent (afgerond op 1 decimaal)
 */
export function berekenInchEquivalent(diameter) {
    if (diameter < 16)
        diameter = 16;
    if (diameter > 36)
        diameter = 36;
    for (let i = 0; i < BOLGEWICHT_TABEL.length - 1; i++) {
        const current = BOLGEWICHT_TABEL[i];
        const next = BOLGEWICHT_TABEL[i + 1];
        if (diameter >= current.diameter && diameter <= next.diameter) {
            return parseFloat(lineaireInterpolatie(diameter, current.diameter, current.inch, next.diameter, next.inch).toFixed(1));
        }
    }
    return BOLGEWICHT_TABEL[BOLGEWICHT_TABEL.length - 1].inch;
}
/**
 * Bereken totaal deeggewicht voor meerdere pizza's
 * @param diameter - Diameter in centimeters
 * @param aantal - Aantal pizza's
 * @returns Totaal deeggewicht in grammen
 */
export function berekenTotaalDeeggewicht(diameter, aantal) {
    const bolgewicht = berekenBolgewicht(diameter);
    return bolgewicht * aantal;
}
