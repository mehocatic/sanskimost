// Suggested routes: the "Routes" section on the home page and explore.html?route=<id>.
// Stops are slugs from places.js; route names, texts and notes are i18n keys (i18n/en.js, i18n/bs.js).
// km: distance from town, only where FACTS.md confirms it (Hrustovacka ~13, Blihe ~14, Grmec forest and Bobijasko oko ~20).
// note: at most one practical note per stop, taken from the existing texts.
const ROUTES = [
  {
    id: "half-day",
    stops: [{ slug: "kamengrad" }, { slug: "musalla" }, { slug: "hamzibegova" }]
  },
  {
    id: "water",
    stops: [{ slug: "dabarska" }, { slug: "bobijasko-oko", km: 20, note: "note.bobijasko" }, { slug: "blihe", km: 14 }],
    // the Cvjetna trail has no page, so it is a plain note on this route
    extra: "note.cvjetna"
  },
  {
    id: "adventure",
    stops: [{ slug: "mulez", note: "note.ferrata" }, { slug: "hrustovacka", km: 13, note: "note.cave" }]
  },
  {
    id: "grmec",
    stops: [{ slug: "grmec-forest", km: 20 }, { slug: "korcanica" }]
  }
];
