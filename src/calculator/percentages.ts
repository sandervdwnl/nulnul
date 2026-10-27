/**
 * Baker's percentages voor napolitaans pizzadeeg
 * Bron: AVPN disciplinare 2024 (§2.1.2-2.1.4)
 * 
 * Standaardwaarden:
 * - Bloem: 100%
 * - Water: 58-68% (afhankelijk van bloemtype)
 * - Zout: 2.5%
 * - Olie/Suiker: 0% (napolitaans deeg kent deze niet)
 */

// Hydratatie per bloemtype (water percentage ten opzichte van bloem)
export const HYDRATATIE_PER_BLOEM: Record<string, number> = {
  "Tipo 00": 62,      // Klassiek napolitaans
  "Tipo 00 canotto": 68, // Hoog randje
  "Tipo 0": 60,       // Alternatief
  "Nederlandse tarwebloem": 58, // Bakkersbloem
};

// Standaard zoutpercentage (2.5% volgens AVPN)
export const STANDAARD_ZOUT_PERCENTAGE = 2.5;

/**
 * Bereken hoeveelheden op basis van baker's percentages
 * @param bloemGewicht - Hoeveelheid bloem in grammen
 * @param hydratatie - Waterpercentage (bv. 62 voor 62%)
 * @param zoutPercentage - Zoutpercentage (standaard 2.5)
 * @returns Object met berekende hoeveelheden in grammen
 */
export function berekenIngrediënten(
  bloemGewicht: number,
  hydratatie: number = 62,
  zoutPercentage: number = STANDAARD_ZOUT_PERCENTAGE
): {
  bloem: number;
  water: number;
  zout: number;
  totaal: number;
} {
  const water = Math.round((bloemGewicht * hydratatie) / 100);
  const zout = Math.round((bloemGewicht * zoutPercentage) / 100);
  const totaal = bloemGewicht + water + zout;

  return {
    bloem: Math.round(bloemGewicht),
    water,
    zout,
    totaal,
  };
}

/**
 * Bereken hoeveelheden per bol
 * @param bolgewicht - Gewenst bolgewicht in grammen
 * @param hydratatie - Waterpercentage
 * @param zoutPercentage - Zoutpercentage
 * @returns Object met hoeveelheden per bol
 */
export function berekenPerBol(
  bolgewicht: number,
  hydratatie: number = 62,
  zoutPercentage: number = STANDAARD_ZOUT_PERCENTAGE
): {
  bloem: number;
  water: number;
  zout: number;
  totaal: number;
} {
  // Bloem is 100%, dus: bloem = bolgewicht / (1 + hydratatie/100 + zoutPercentage/100)
  const bloemFactor = 1 + hydratatie / 100 + zoutPercentage / 100;
  const bloem = Math.round(bolgewicht / bloemFactor);
  
  return berekenIngrediënten(bloem, hydratatie, zoutPercentage);
}

/**
 * Bereken hoeveelheden voor meerdere bollen
 * @param bolgewicht - Gewenst bolgewicht in grammen
 * @param aantal - Aantal bollen
 * @param hydratatie - Waterpercentage
 * @param zoutPercentage - Zoutpercentage
 * @returns Object met totale hoeveelheden
 */
export function berekenTotaal(
  bolgewicht: number,
  aantal: number,
  hydratatie: number = 62,
  zoutPercentage: number = STANDAARD_ZOUT_PERCENTAGE
): {
  bloem: number;
  water: number;
  zout: number;
  totaal: number;
  perBol: {
    bloem: number;
    water: number;
    zout: number;
    totaal: number;
  };
} {
  const perBol = berekenPerBol(bolgewicht, hydratatie, zoutPercentage);
  
  return {
    bloem: perBol.bloem * aantal,
    water: perBol.water * aantal,
    zout: perBol.zout * aantal,
    totaal: perBol.totaal * aantal,
    perBol,
  };
}
