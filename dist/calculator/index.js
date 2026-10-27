/**
 * Hoofdmodule voor de Nulnul pizzadeeg-calculator
 * Combineert bolgewicht, percentages en gistberekening
 */
import { berekenBolgewicht, berekenInchEquivalent, berekenTotaalDeeggewicht, } from "./bolgewicht";
import { HYDRATATIE_PER_BLOEM, STANDAARD_ZOUT_PERCENTAGE, berekenIngrediënten, berekenPerBol, berekenTotaal as berekenTotaalPercentages, } from "./percentages";
import { berekenGistPercentage, berekenGistGewicht, berekenGistKoelkast, } from "./gist";
/**
 * Hoofd-functie: bereken compleet deegrecept
 */
export function berekenDeeg(input) {
    // 1. Bolgewicht berekenen
    const bolgewicht = berekenBolgewicht(input.diameter);
    const inchEquivalent = berekenInchEquivalent(input.diameter);
    // 2. Hydratatie en zoutpercentage ophalen
    const hydratatie = HYDRATATIE_PER_BLOEM[input.bloemType] || 62;
    const zoutPercentage = STANDAARD_ZOUT_PERCENTAGE;
    // 3. Hoeveelheden per bol berekenen
    const perBol = berekenPerBol(bolgewicht, hydratatie, zoutPercentage);
    // 4. Gist berekenen
    let gistGewicht;
    let gistPercentage;
    if (input.koelkastTijd && input.koelkastTijd > 0) {
        // Koelkast-schema: bv. 4u kamer + 20u koelkast
        const kamerTijd = input.fermentatieTijd - input.koelkastTijd;
        gistGewicht = berekenGistKoelkast(perBol.bloem, input.temperatuur, input.koelkastTemp || 5, kamerTijd, input.koelkastTijd, input.gistType);
        // Gemiddeld percentage voor weergave
        gistPercentage = gistGewicht / perBol.bloem;
    }
    else {
        // Standaard schema
        gistGewicht = berekenGistGewicht(perBol.bloem, input.temperatuur, input.fermentatieTijd, input.gistType);
        gistPercentage = berekenGistPercentage(input.temperatuur, input.fermentatieTijd, input.gistType);
    }
    // 5. Totaal berekenen
    const totaal = {
        bloem: perBol.bloem * input.aantal,
        water: perBol.water * input.aantal,
        zout: perBol.zout * input.aantal,
        gist: Math.round(gistGewicht * input.aantal * 10) / 10, // Afronden op 0.1g
        deeg: perBol.totaal * input.aantal + Math.round(gistGewicht * input.aantal * 10) / 10,
    };
    // 6. Baker's percentages
    const bakersPercentages = {
        bloem: 100,
        water: hydratatie,
        zout: zoutPercentage,
        gist: gistPercentage * 100, // Omzetten naar percentage
    };
    return {
        bolgewicht,
        inchEquivalent,
        perBol: {
            ...perBol,
            gist: gistGewicht,
        },
        totaal,
        hydratatie,
        zoutPercentage,
        gistPercentage: gistPercentage * 100,
        bakersPercentages,
    };
}
/**
 * Vereenvoudigde versie voor snelle berekening (zonder koelkast)
 */
export function berekenSnel(diameter, aantal, bloemType = "Tipo 00", tijd = 24, temp = 22, gistType = "IDY") {
    return berekenDeeg({
        diameter,
        aantal,
        bloemType,
        fermentatieTijd: tijd,
        temperatuur: temp,
        gistType,
    });
}
// Exporteer alle submodules voor direct gebruik
export { berekenBolgewicht, berekenInchEquivalent, berekenTotaalDeeggewicht, HYDRATATIE_PER_BLOEM, STANDAARD_ZOUT_PERCENTAGE, berekenIngrediënten, berekenPerBol, berekenTotaalPercentages, };
export { berekenGistPercentage, berekenGistGewicht, berekenGistKoelkast, };
