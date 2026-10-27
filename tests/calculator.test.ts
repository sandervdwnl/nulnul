/**
 * Unit tests voor de Nulnul pizzadeeg-calculator
 * Validatie tegen AVPN-normen en referentiepunten
 */

import {
  berekenBolgewicht,
  berekenInchEquivalent,
  berekenTotaalDeeggewicht,
} from "../src/calculator/bolgewicht";

import {
  HYDRATATIE_PER_BLOEM,
  STANDAARD_ZOUT_PERCENTAGE,
  berekenIngrediënten,
  berekenPerBol,
  berekenTotaal as berekenTotaalPercentages,
} from "../src/calculator/percentages";

import {
  berekenGistPercentage,
  berekenGistGewicht,
  berekenGistKoelkast,
} from "../src/calculator/gist";

import { berekenDeeg, berekenSnel } from "../src/calculator/index";

// ============================================
// 1. Bolgewicht Tests
// ============================================

describe("Bolgewicht", () => {
  test("Standaard maten uit tabel", () => {
    expect(berekenBolgewicht(16)).toBe(140);
    expect(berekenBolgewicht(20)).toBe(170);
    expect(berekenBolgewicht(24)).toBe(210);
    expect(berekenBolgewicht(28)).toBe(250);
    expect(berekenBolgewicht(32)).toBe(290);
    expect(berekenBolgewicht(36)).toBe(320);
  });

  test("Lineaire interpolatie voor tussengelegen maten", () => {
    // 22 cm ligt tussen 20 cm (170g) en 24 cm (210g)
    // Verwacht: 170 + (22-20)/(24-20) * (210-170) = 170 + 0.5 * 40 = 190g
    expect(berekenBolgewicht(22)).toBe(190);
    
    // 30 cm ligt tussen 28 cm (250g) en 32 cm (290g)
    // Verwacht: 250 + (30-28)/(32-28) * (290-250) = 250 + 0.5 * 40 = 270g
    expect(berekenBolgewicht(30)).toBe(270);
  });

  test("Clamping naar minimale/maximale diameter", () => {
    expect(berekenBolgewicht(10)).toBe(140); // Minimaal 16 cm
    expect(berekenBolgewicht(50)).toBe(320); // Maximaal 36 cm
  });

  test("Inch-equivalenten", () => {
    expect(berekenInchEquivalent(24)).toBeCloseTo(9.4, 0.1);
    expect(berekenInchEquivalent(28)).toBe(11.0);
    expect(berekenInchEquivalent(32)).toBeCloseTo(12.6, 0.1);
  });

  test("Totaal deeggewicht", () => {
    expect(berekenTotaalDeeggewicht(24, 2)).toBe(420); // 210g * 2
    expect(berekenTotaalDeeggewicht(28, 3)).toBe(750); // 250g * 3
  });
});

// ============================================
// 2. Baker's Percentages Tests
// ============================================

describe("Baker's Percentages", () => {
  test("Hydratatie per bloemtype", () => {
    expect(HYDRATATIE_PER_BLOEM["Tipo 00"]).toBe(62);
    expect(HYDRATATIE_PER_BLOEM["Tipo 00 canotto"]).toBe(68);
    expect(HYDRATATIE_PER_BLOEM["Tipo 0"]).toBe(60);
    expect(HYDRATATIE_PER_BLOEM["Nederlandse tarwebloem"]).toBe(58);
  });

  test("Standaard zoutpercentage", () => {
    expect(STANDAARD_ZOUT_PERCENTAGE).toBe(2.5);
  });

  test("Ingrediënten berekenen", () => {
    const result = berekenIngrediënten(1000, 62, 2.5);
    expect(result.bloem).toBe(1000);
    expect(result.water).toBe(620); // 62% van 1000g
    expect(result.zout).toBe(25);  // 2.5% van 1000g
    expect(result.totaal).toBe(1645); // 1000 + 620 + 25
  });

  test("Per bol berekenen", () => {
    // Bolgewicht = 250g, hydratatie = 62%, zout = 2.5%
    // Bloem = 250 / (1 + 0.62 + 0.025) ≈ 250 / 1.645 ≈ 152g
    const result = berekenPerBol(250, 62, 2.5);
    expect(result.bloem).toBeCloseTo(152, 0);
    expect(result.water).toBeCloseTo(94, 0); // 152 * 0.62 ≈ 94
    expect(result.zout).toBeCloseTo(4, 0);   // 152 * 0.025 ≈ 4
    expect(result.totaal).toBeCloseTo(250, 0);
  });

  test("Totaal berekenen voor meerdere bollen", () => {
    const result = berekenTotaalPercentages(250, 2, 62, 2.5);
    expect(result.perBol.bloem).toBeCloseTo(152, 0);
    expect(result.bloem).toBeCloseTo(304, 0); // 152 * 2
    expect(result.water).toBeCloseTo(188, 0); // 94 * 2
    expect(result.zout).toBeCloseTo(8, 0);    // 4 * 2
  });
});

// ============================================
// 3. Gistberekening Tests
// ============================================

describe("Gistberekening", () => {
  test("Gistpercentage voor standaard omstandigheden", () => {
    // 24 uur bij 22°C met IDY: verwacht ~0.12% (uit tabel)
    const percentage = berekenGistPercentage(22, 24, "IDY");
    expect(percentage).toBeCloseTo(0.0012, 0.0005); // ~0.12%
  });

  test("Gistpercentage voor korte fermentatie", () => {
    // 4 uur bij 22°C met IDY: verwacht ~0.35% (uit tabel)
    const percentage = berekenGistPercentage(22, 4, "IDY");
    expect(percentage).toBeCloseTo(0.0035, 0.001); // ~0.35%
  });

  test("Gistgewicht berekenen", () => {
    // 1000g bloem, 22°C, 24 uur, IDY
    const gist = berekenGistGewicht(1000, 22, 24, "IDY");
    expect(gist).toBeCloseTo(1.2, 0.5); // ~1.2g
  });

  test("Gisttype omrekening", () => {
    // Verse gist = 3x IDY
    const idy = berekenGistGewicht(1000, 22, 24, "IDY");
    const verse = berekenGistGewicht(1000, 22, 24, "verse");
    expect(verse).toBeCloseTo(idy * 3, 0.1);
    
    // ADY = 1.2x IDY
    const ady = berekenGistGewicht(1000, 22, 24, "ADY");
    expect(ady).toBeCloseTo(idy * 1.2, 0.1);
  });

  test("Koelkast-schema gistberekening", () => {
    // 4 uur kamer (22°C) + 20 uur koelkast (5°C) = 24 uur bij gemiddelde temp
    // Gemiddelde temp = (22*4 + 5*20)/24 ≈ (88 + 100)/24 ≈ 7.83°C
    const gist = berekenGistKoelkast(1000, 22, 5, 4, 20, "IDY");
    // Verwacht: gist voor 24u bij ~7.83°C (tussen 5°C en 10°C)
    expect(gist).toBeGreaterThan(0);
    expect(gist).toBeLessThan(2); // Redelijke bovengrens voor koelkast-schema
  });
});

// ============================================
// 4. Complete Deegberekening Tests
// ============================================

describe("Complete Deegberekening", () => {
  test("Standaard napolitaans deeg (24cm, 1 pizza, Tipo 00, 24u, 22°C)", () => {
    const result = berekenSnel(24, 1, "Tipo 00", 24, 22, "IDY");
    
    // Bolgewicht voor 24cm = 210g
    expect(result.bolgewicht).toBe(210);
    expect(result.inchEquivalent).toBeCloseTo(9.4, 0.1);
    
    // Hydratatie voor Tipo 00 = 62%
    expect(result.hydratatie).toBe(62);
    expect(result.zoutPercentage).toBe(2.5);
    
    // Per bol: bloem + water (62%) + zout (2.5%) ≈ 210g
    expect(result.perBol.totaal).toBeCloseTo(210, 1);
    
    // Totaal voor 1 pizza
    expect(result.totaal.deeg).toBeCloseTo(210 + result.perBol.gist, 0.1);
    
    // Baker's percentages
    expect(result.bakersPercentages.bloem).toBe(100);
    expect(result.bakersPercentages.water).toBe(62);
    expect(result.bakersPercentages.zout).toBe(2.5);
  });

  test("Meerdere pizza's (28cm, 2 pizza's, Tipo 00 canotto, 48u, 20°C)", () => {
    const result = berekenDeeg({
      diameter: 28,
      aantal: 2,
      bloemType: "Tipo 00 canotto",
      fermentatieTijd: 48,
      temperatuur: 20,
      gistType: "IDY",
      koelkastTijd: 44, // 4u kamer + 44u koelkast
      koelkastTemp: 5,
    });
    
    // Bolgewicht voor 28cm = 250g
    expect(result.bolgewicht).toBe(250);
    
    // Hydratatie voor canotto = 68%
    expect(result.hydratatie).toBe(68);
    
    // Totaal deeg voor 2 pizza's
    expect(result.totaal.deeg).toBeGreaterThan(500); // 250g * 2 + gist
  });

  test("AVPN-norm validatie: gist 0.1-3 g per liter water", () => {
    // AVPN: gist 0.1-3 g per liter water
    // Voor 1000g bloem met 62% hydratatie: 620g water = 0.62L
    // Verwacht: gist tussen 0.062g en 1.86g
    
    const result1 = berekenSnel(24, 1, "Tipo 00", 24, 22, "IDY");
    const gist1 = result1.perBol.gist;
    expect(gist1).toBeGreaterThanOrEqual(0.06);
    expect(gist1).toBeLessThanOrEqual(2);
    
    const result2 = berekenSnel(24, 1, "Tipo 00", 4, 24, "IDY");
    const gist2 = result2.perBol.gist;
    expect(gist2).toBeGreaterThanOrEqual(0.06);
    expect(gist2).toBeLessThanOrEqual(2);
  });

  test("Bolgewicht binnen AVPN-norm (200-280g voor 24cm+)", () => {
    // AVPN: bollen 200-280g
    expect(berekenBolgewicht(24)).toBe(210); // Binnen norm
    expect(berekenBolgewicht(28)).toBe(250); // Binnen norm
    expect(berekenBolgewicht(32)).toBe(290); // Net boven norm (bewust)
  });
});
