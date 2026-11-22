# CLAUDE.md

## O projektu
- Statički promo sajt za Sanski Most. HTML, CSS i JS, bez build koraka.
- Jezici: EN i BS preko `i18n/en.js` i `i18n/bs.js`. Bosanski je zadani jezik.
- Pokretanje: `npx serve -l 3000`

## Pravila
- Nikad ne commituj i ne pushaj bez izričitog traženja.
- Bez Co-Authored-By.
- Bez em dasheva.
- EN i BS uvijek imaju isti broj ključeva.
- Mobilni je prioritet. Provjera na 360 i 1440 px, na oba jezika, konzola bez grešaka.
- Tekstovi su trezveni, bez superlativa.
- Činjenice samo iz `FACTS.md` ili od Mehe.
- Sve neprovjereno označiti kao `TODO(verify)`.
- Ništa ne izmišljati.

## Osjetljivi tekstovi
- Ratne i druge osjetljive tekstove ne mijenjati bez odobrenja.

## Fotografije
- Ništa ne povećavati iznad prirodne veličine.
- Originale držati u `originals/`.

## Kraj svakog zadatka
Kratak izvještaj:
- šta je promijenjeno
- popis fajlova
- prijedlog commita

## Hero frejmovi
- Scroll video su frejmovi u `frames-v2/` (desktop, 220) i `frames-m-v2/` (mobitel, 110); brojevi su u `data-frames` i `data-frames-m` na canvasu u `index.html`.
- Novi set: `tools/extract-frames.sh <video> [start_s] [length_s]`, pa upisati nove brojeve u `index.html`.
- Izvorni klip je prvu sekundu mutan, zato se počinje od 41. sekunde.
- `script.js` miješa dva susjedna frejma, pa nije potrebno više frejmova da bi kretanje bilo glatko.

## Struktura
- HTML stranice su u korijenu da adrese ostanu iste (`explore`, `place`, `pogodi` ...).
- `css/`: stilovi (`base.css` je zajednički, ostali su po stranici).
- `js/`: skripte po stranici i zajedničke (`lib`, `i18n`, `nav`, `fx`, `sound`).
- `js/data/`: podaci (`places`, `poi`, `routes`, `arhiv-data`, `licnosti-data`, `pogodi-data`). `quiz-config.js` se generira pri objavi i nije u gitu.
- `i18n/`, `vendor/`, `photos/`, `frames-v2/`, `frames-m-v2/`: kao i prije.
- `docs/`: radni dokumenti i nacrti. `tools/`: skripte za frejmove, kviz-config i provjeru kviza (`node tools/provjeri-pogodi.js`).
- Dinamički uvozi iz `js/` ka `vendor/` pišu se kao `../vendor/...`.
