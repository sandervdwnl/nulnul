# Nulnul

**"nulnul"** — verwijst naar *tipo 00*, dé bloem voor echte napolitaanse pizza. Twee nullen, geen gedoe. Net als de app zelf.

---

## 1. Concept

Nulnul is een minimalistische pizzadeeg-calculator die je in **vijf korte vragen** van "zin in pizza" naar een compleet napolitaans deegrecept brengt — inclusief tijdschema en instructies. Geen style-keuzes, geen advanced settings, geen advertenties: **altijd napolitaans**.

Geïnspireerd op [dough00.com](https://dough00.com), maar dan:

| Dough00 | Nulnul |
|---|---|
| 7+ pizzastyles | **Altijd napolitaans** |
| Veel invoervelden (olie, suiker, eiwit%, meerdere bloemen, mixer, preferment...) | **5-6 vragen max** |
| Website | **PWA** — installeerbaar, volledig offline |
| Kleinste maat te groot | **Vanaf 16 cm** (mini-pizza's en kids-maten) |
| Recepten niet terug te kijken | **Receptgeschiedenis** |
| Drukke UI (chef-recepten, testimonials, donatie-modals) | Rustig, minimaal, Italiaans |

### Kernprincipes
1. **Napolitaans of niks** — geen stijlselectie. De enige variatie is *canotto* (hoog randje) als sub-optie.
2. **Vijf vragen, één resultaat** — alle defaults zijn napolitaans uitgedacht; wie wil kan bijstellen via een optionele "fijnafstelling".
3. **Offline-first PWA** — alles rekent in de browser, geen accounts, geen server, geen tracking.
4. **Italiaanse stilering** — warm, kalm, alsof de app in Napels gedrukt is.

---

## 2. De vragen (input-flow)

Een wizard van 5 stappen, één vraag per scherm, grote knoppen. Terug bladeren kan altijd.

1. **Diameter** — 16 tm 36 cm (slider + quick picks: 16 / 20 / 24 / 28 / 32 / 36). *Dit lost het dough00-probleem op: kleine maten zijn first-class citizens.*
2. **Aantal pizza's** — 1 tm 12 (+tevengrote bollen 20% extra v.d. formaatfouten? — keuzeveld)
3. **Bloem** — bepaalt hydratatie en advies:
   - Tipo 00 (klassiek) — hydratatie 62%
   - Tipo 00 *canotto* — hydratatie 68% (hoog randje)
   - Tipo 0 — hydratatie 60%
   - Nederlandse tarwebloem (bakkersbloem) — hydratatie 58%
4. **Hoeveel tijd heb je?** — geen veld met uren typen, maar duidelijke opties:
   - *Nu honger!* — 4 uur (snelle, laag-gist)
   - *Vanavond* — 8 uur
   - *Morgen* — 24 uur (deels koelkast)
   - *Weekend-planning* — 48 uur (koelkast, smaakbombonade)
5. **Gist die je in huis hebt** — verse gist / instant drooggist / actieve drooggist (wordt omgerekend)
6. **Hoe warm is het bij je?** — kamertemperatuur. Of: locatie-knop die via [Open-Meteo](https://open-meteo.com) (gratis, geen API-key) de buitentemperatuur ophaalt en als schatting voor de kamertemperatuur invult. Handmatig overschrijven mag altijd.

### Fijnafstelling (optioneel, standaard ingeklapt)
- Hydratatie ± (met uitleg "hoger = luchtiger, plakkeriger")
- Zout ± (standaard 2,5%)
- Eigen naam/hulpje voor gist-procent (expert-modus)

Deze instellingen staan uit het zicht, want **het antwoord van de app moet zonder nadenken te volgen zijn.**

---

## 3. De berekening

Volledig client-side, gebaseerd op de formules die het team gedestilleerd heeft uit dough00 en gangbare napolitaanse naslagwerken. De exacte waarden zijn verbeterpunten en nog in te stellen, maar dit is het uitgangspunt:

### 3.1 Bolgewicht per diameter (napolitaans, incl. cornicione)

| Diameter | Bolgewicht |
|---|---|
| 16 cm | 140 g |
| 20 cm | 170 g |
| 24 cm | 210 g |
| 26 cm | 230 g |
| 28 cm | 250 g |
| 32 cm | 290 g |
| 36 cm | 320 g |

Tussenliggende diameters: lineaire interpolatie.

### 3.2 Baker's percentages (napolitaans)

- Bloem = 100%
- Water = hydratatie (58-68% naar bloem, zie vraag 3)
- Zout = 2,5%
- Olie = 0% · Suiker = 0% (*het napolitaanse deeg kent die niet — daarom vragen we er niet naar*)
- Gist = zie 3.3

Totale deegmassa = som × (bolgewicht × aantal bollen), terugrekenen naar bloem en water.

### 3.3 Gistberekening (de kern van de app)

Gistpercentage wordt **afgeleid uit tijd en temperatuur** — de gebruiker hoeft niets te weten:

```text
timeFactor = (6 / max(fermentatieUren, 1)) ^ 0,8
tempFactor = max(1 + (kamertempC − 21) × 0,04 ; 0,2)
gistPct    = 0,5 × timeFactor / tempFactor

// correcties:
koelkastfermentatie      → gistPct × 0,3
verse gist               → × 3,0
actieve drooggist        → × 1,2
instant drooggist        → × 1,0
clamp tussen 0,01 en 2,0 %
```

Voor de volledige 24/48-uurs-schema's: 4 uur op kamertemperatuur (bulk), rest in de koelkast.

### 3.4 Water-temperatuur (optioneel nice-to-have)

Doeldeegtemperatuur ~23°C. `waterTemp = doeldeegTemp − bloemTemp − frictie (°C)` — in v2, alleen tonen als er een mixer-tijd ingevoerd kan worden zonder extra vraag (anders: advies "lauw water als het koud is in huis").

---

## 4. Het resultaat

Eén rustig scherm, printvriendelijk, in drie blokken:

### 4.1 Ingrediënten
- Tabel per bol **én** totaal, in gram (afgerond op hele grammen; gist op 0,1 g)
- Baker's percentages in kleine lettertjes erbij
- Mini-legenda: "00 = bloem · water = 62% = 62 g per 100 g bloem"

### 4.2 Tijdschema
Concretiseren in kloktijden, met de **starttijd = nu** (of eigen gekozen startmoment):
- Mengen & kneden → 20 min
- Bulkfermentatie → afhankelijk van tijd-keuze
- Onteilen & bollen → 2 min per bol
- Rijpen (koelkast/kamer) → tot 2 uur voor bakken
- **"Haal je bollen uit de koelkast om 17:00"** → 2 uur terugkeer op kamertemperatuur
- *Bakmoment:* 🍕

### 4.3 Instructies (stappenplan, kort en zelfverzekerd)
1. Bloem + gist droog mengen, water erbij, 10 min kneden (of 15-20 min met de hand, tot het deeg glad is en terugverend voelt)
2. Zout pas na 5 min toevoegen (kneden met rust), suiker nooit
3. Bulk: afgedekt op kamertemperatuur
4. Onteilen, bollen, deeg in gesloten bakken (of bak met deksel, vochtige doek mag)
5. Rijpen volgens tijdschema
6. 2 uur voor bakken: uit de koelkast, opentrekken **uitsluitend met vingers** (nooit deegrol — dat doodt de lucht van je cornicione)
7. Bakken: 430-480°C op steen/staal zo heet mogelijk (anders: max stand van je oven), 60-90 seconden, halverwege draaien

Per stap een "waarom"-regel op een subtiele plek (zo leert de gebruiker bij zonder drukte).

---

## 5. Receptgeschiedenis

- Elke berekening wordt automatisch opgeslagen in `localStorage` (of IndexedDB) met:
  - datum + tijdstip, naam (auto: "3 × 28 cm · za 25 okt", bewerkbaar)
  - alle invoer (diameter, bloem, gist, tijd, temperatuur) en het resultaat (grammen)
- Geschiedenis-scherm: chronologische lijst, zoeken + filteren
- Antwoord-details: nogmaals openen, **of als kopie hergebruiken** ("maak deze weer")
- Exporteren als tekst/JSON + delen via URL (alleen de querystring — geen server)
- Recepten bewaren/verwijderen per item; geen accounts, geen cloud

---

## 6. PWA-eisen

- **Installable:** manifest.json, icons (192/512 + maskable), shortcuts ("Nieuw deeg", "Mijn recepten"), theme-color
- **Offline-first:** service worker die de volledige app cachen; alles werkt zonder netwerk (alleen de locatie-weerfunctie heeft internet nodig, met nette fallback)
- **App-gevoel:** geen browser-chrome-ruis, full-screen splash, iOS "voeg toe aan beginscherm"-instructie bij eerste bezoek
- Elke release een bumpende `service-worker.js` cache-versie (geen "oude versie blijft hangen"-problematiek)
- Statische hosting volstaat: GitHub Pages of vergelijkbaar

---

## 7. Visueel ontwerp — "moderno napoletano"

**Vibe:** de rust van een oud Italiaans kookboek, de helderheid van een moderne tool. Wit/warm crèmewit papier, één accentkleur, veel witruimte.

- **Kleuren:**
  - Achtergrond: warm crème `#FAF4EB` (binnenwerk papier)
  - Tekst: koolzwart `#221E1D`
  - Accent: pomodoor-rood `#C0392B` (knoppen, actieve slider, logo)
  - Secundair accent: basilicum-groen `#4A7023` (details, success-meldingen)
  - Behandeling: bloem-lijnen en accenten in bloemkleur `#F1E6D6`
- **Typografie:**
  - Display: een karaktervolle serif (bijv. *Fraunces* of *Libre Caslon*) — totaal geen stijl-keuze, wel warmte
  - Body: rustige sans (bijv. *Inter* of system-ui)
  - Handgeschreven accenten (bijv. "buon appetito") in *Caveat* — spaarzaam
- **Iconen:** minimalistisch, lijn-icoontjes; één mascotte-idee: de dubbelnul "00" gestyled als twee pizza-randen
- **Micro-interacties:** zachte overgangen, geen animatie-overdaad; slider met vleugje veerkracht
- Alles responsive, gecentreerd, één kolom op mobiel, grotendeels één kolom op desktop (het is een *tool voor je keuken*, geen dashboard)

---

## 8. Technische opzet

### Aanbevolen stack (eenvoud = feature)
- **Vanilla TypeScript + Vite** — geen framework nodig voor één wizard-scherm, een resultatenpagina en een lijst. Of: Svelte 5 als we reactive structuur willen; keuze valt bij kickoff.
- **Geen backend** — 100% statische PWA, alle data lokaal
- **localStorage/IndexedDB** voor geschiedenis (IndexedDB zodra we afbeeldingen/notities toevoegen)
- **Open-Meteo API** voor de temperatuurschatting (gratis, keyless, met cachen zodat we onbeleefd weinig requests doen)
- **Testing:** Vitest voor de calculator (hét kritieke stuk van de app — de formules moeten exact kloppen), Playwright later eventueel
- **Hosting:** GitHub Pages (of Cloudflare Pages)

### Structuur
```
nulnul/
├── PLAN.MD                  ← dit bestand
├── index.html
├── manifest.json
├── sw.js
├── src/
│   ├── calculator/         ← zuivere functies: bolgewicht, percentages, gist
│   ├── ui/                 ← wizard, resultaat, geschiedenis, componenten
│   ├── storage/            ← recepten opslaan/laden
│   ├── weather/            ← open-meteo client + fallback
│   └── styles/
└── tests/
    └── calculator.test.ts
```

### Wat we nodig hebben (checklist)
- [x] Formules uit dough00 gedestilleerd (done — zie §3)
- [ ] Logo + iconen (192, 512, maskable, favicon, splash) — ontwerpen of AI-genereren
- [ ] Fontkeuze definitief (Fraunces vs. alternatieven, met self-hosting voor offline PWA)
- [ ] Bolgewicht-tabel valideren (§3.1) tegen eigen bakervaring
- [ ] Open-Meteo testen: geolocation → temperatuur → realistische kamertemp-schatting (±2°C corrigeren naar binnenklimaat)
- [ ] Vertaling: Nederlands eerst; Engels/Italiaans later (i18n-structuur van af day één meenemen)
- [ ] Domain-check: nulnul.app / nulnul.nl beschikbaarheid

---

## 9. Roadmap

| Mijlpaal | Scope |
|---|---|
| **M1 — Rekenkern** | calculator + unit tests, formules exact kloppend |
| **M2 — Wizard + resultaat** | 5 vragen, recept, tijdschema, instructies (nog zonder opslag) |
| **M3 — PWA** | manifest, service worker, icons, offline werkt |
| **M4 — Geschiedenis** | opslaan, lijst, hergebruiken, exporteren |
| **M5 — Polish** | definitieve vormgeving, animaties, locatie-temperatuur, delen via URL |
| **v2 (later)** | canotto-slider, water-temperatuuradvies, Italiaans/Engels, *Poolish/biga-modus* voor gevorderden, sourdough-support |

---

## 10. Openstaande beslissingen

1. **Stack:** vanilla TS+Vite (simpelste, kleinste bundle) vs. Svelte (snellere UI-bouw). Voorstel: vanilla — de app is klein genoeg, en "geen framework" is minimalistisch.
2. **Bolgewicht-tabel:** klopt de curve uit §3.1 met de praktijkervaring van Sander? (dough00 gebruikt iets andere waarden; onze tabel moet gebaseerd zijn op eigen bakervaring)
3. **Teveel-bollen-optie (vraag 2):** standaard 1 extra bol aanraden voor beginners? Of puur laten?
4. **Taal:** NL-first bevestigd, EN/IT in v2?
5. **Locatie-weerschatting:** direct actief bij eerste gebruik, of pas na expliciete knop ("privacy-first")?
6. **Naam vast:** nulnul — definitief? (domeincheck volgt)

---

*Nulnul — perché la buona pizza comincia dalla farina.* 🍕
