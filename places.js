// Single source of truth for the places carousel, the place pages and the routes.
// The texts of a place (name, short, long, note, "Also worth seeing") are NOT here: they are under `places` in
// i18n/en.js and i18n/bs.js, with the same keys in both. This file holds what does not depend on the language.
//
// slug    : address of the place page (place.html?slug=...) and key of its texts
// coords  : [lat, lon] for the map on explore.html (a place without it has no marker); the comment names the source
// see     : links of the "Also worth seeing" entries, in the same order as the texts in the language files:
//           the slug of a place the entry links to, or null for a plain text entry (omit when there is none)
// photos  : the first photo is the cover on the card (shown cropped to the card). Each entry is created with pic(name, extra):
//           { src, srcset, author, license, sourceUrl, alt, main, hero, pos, posM }
//           - author, license, sourceUrl: shown as a small credit in the photo viewer (all optional, empty ones are left out;
//             nothing is filled in on assumption)
//           - alt: the alt text of the photo (not shown; the same text in both languages), otherwise the place name is used
//           - srcset: a smaller file for phones, e.g. "photos/a-1200.webp 1200w, photos/a.webp 2400w"
//           - hero: true marks the one photo that fills the top of the place page, cropped (object-fit: cover). Only for a
//             landscape photo at least about 1600 px wide. A place without one gets a banner: its main photo (main: true,
//             otherwise the first) blurred and darkened across the whole width, with the same photo sharp and whole on it,
//             never larger than it is. Nothing is ever enlarged by the banner.
//           - pos / posM: object-position of the hero on wide screens / on phones (CSS, e.g. "50% 30%")
//           The gallery is a masonry of the other photos, each whole in its own proportions (the photo at the top of the page
//           is not repeated there, but it is in the viewer). In the viewer every photo is shown whole (object-fit: contain).
// Photos listed more than once are shown more than once, so list each photo once.
// Photos that are not listed here are kept in originals/ (not in the repository, see .gitignore).
// A path whose file does not exist shows a neutral placeholder with the place name.
// TODO: fill in author, license and sourceUrl for each photo; only the author of musalla.jpeg is known (from the file).
const pic = (name, extra) => ({ src: `photos/${name}`, author: "", license: "", sourceUrl: "", ...extra });

const PLACES = [
  {
    slug: "blihe",
    // coords: OpenStreetMap node 4411996013 (waterway=waterfall, "Bliha Skok")
    coords: [44.7889880, 16.5247591],
    photos: [
      pic("bliha3.webp"), // the cover on the card
      // hero: 2400 px wide WebP (and 1200 px for phones) made from the 5464 x 3640 px original, which is in originals/bliha2.jpg
      pic("bliha2.webp", { hero: true, pos: "50% 30%", posM: "54% 45%", srcset: "photos/bliha2-1200.webp 1200w, photos/bliha2.webp 2400w" }),
      pic("bliha.jpg"),
      pic("bliha4.webp"),
      pic("bliha5.webp"),
      pic("bliha6.jpg")
    ]
  },
  {
    slug: "kamengrad",
    // coords: OpenStreetMap node 4409177788 (historic=archaeological_site, "Tvrđava Stari Grad"); English Wikipedia "Kamengrad Fort" gives 44.7786, 16.5631, the same spot
    coords: [44.7797073, 16.5630776],
    // TODO(verify): Meho's text says first mentioned in 1373 (and, for the musalla, "in the 13th century"); FACTS.md and the site say 1374.
    // TODO(verify): dates of the Ottoman conquest differ: 1463 and 11 years later (Meho), 1498 (FACTS.md), in Ottoman hands in 1499 (Kreševljaković).
    // The site now lists the dates as "sources differ" and no longer says that most historians give 1463.
    // TODO(verify): Meho's text says the Kamengrad kadiluk was founded around 1541 and that from 1624 the town was the seat of a captaincy
    // (Stari Majdan, Sanski Most "Vakuf"). Neither is in FACTS.md, so both sentences were taken off the site (EN and BS).
    // TODO(verify): the text also names the Babonić Blagajski princes, a nahija under a dizdar, the lower town Donji Grad (Palanka) and walls
    // of 5 to 7 m; none of it is in FACTS.md either. Left on the site from the earlier session, to be confirmed or cut.
    see: [null, null],
    photos: [
      pic("kamengrad.webp"),
      pic("kamengrad2.jpeg"), // a drawing, not a photo
      pic("kamengrad3.jpg"),
      pic("kamengrad4.webp")
    ]
  },
  {
    slug: "musalla",
    // coords: not set here. In OpenStreetMap it is node 519029537 (amenity=place_of_worship, "Fatihova Musalla"), and poi.js uses it for the map.
    see: [null],
    photos: [
      pic("musalla.jpeg", { author: "Almedin Handanovic" }), // author: EXIF Artist tag of the file (Copyright tag says "Gorsak na salasu", not a license)
      pic("musalla2.jpeg"),
      // photos/musalla3.jpg (in originals/) shows the monument to the Turkish martyrs (OSM node 4409248503), not the musalla; no place page for it
      pic("musalla4.jpg")
    ]
  },
  {
    slug: "hamzibegova",
    // coords: OpenStreetMap way 346178044 (amenity=place_of_worship, "Hamza-begova džamija")
    coords: [44.7638251, 16.6648616],
    // TODO(verify): Meho's text says members of the Army of Republika Srpska demolished the mosque on 27 June 1992 and that
    // the building material and gravestones were taken to a dump. No source is named, so only the date is on the site.
    // TODO(verify): the text says "the largest mosque in Sanski Most"; left out (superlative, no source).
    // TODO(verify): hamzibegova4.jpg (a prayer, wooden mihrab, looks like a scanned print) does not look like the interior in
    // hamzibegova2 and 3 (white walls, teal carpet). Meho to confirm it is the Hamzibeg Mosque.
    see: [null, null, null],
    photos: [
      pic("hamzibegova.jpg"),
      pic("hamzibegova5.jpg", { main: true }), // the mosque with four minarets, shown at the top (1024 x 1472)
      pic("hamzibegova2.jpg"),
      pic("hamzibegova3.jpg"),
      pic("hamzibegova4.jpg")
    ]
  },
  {
    slug: "korcanica",
    // coords: OpenStreetMap node 11146153554 (historic=memorial, "Korčanica Monument to the Revolution at Grmeč")
    coords: [44.6872744, 16.4375984],
    // TODO(verify): Meho's text gives 316 fallen fighters buried in two tombs, and 2732 m2 for the hospital; no source is named, so left out.
    // The earlier text said "central white concrete sculpture shaped like an opening bud" and "underground museum"; Meho's text says
    // two semicircular marble walls. The material and the museum are left out until a source settles it.
    see: [null],
    photos: [
      pic("korcanica.jpg"),
      pic("korcanica2.jpg"),
      pic("korcanica3.jpg", { main: true }), // the monument, shown at the top (738 x 416)
      pic("korcanica4.avif") // the ruined hotel; AVIF, works in current browsers
    ]
  },
  {
    slug: "hrustovacka",
    // coords: given by the site owner; matches OpenStreetMap node 5613053430 (natural=cave_entrance)
    coords: [44.6726663, 16.7006463],
    // hrustovacka2.jpg and hrustovacka5.jpeg show a lit cave with a walkway and a group: Meho confirmed they are Hrustovačka Cave
    // (visits with an organised group). The text "self-guided, bring a torch" is unchanged.
    see: [null, null],
    photos: [
      pic("hrustovacka.jpg"),
      pic("hrustovacka3.webp", { main: true }), // the entrance, shown at the top (1180 x 885)
      pic("hrustovacka2.jpg"),
      pic("hrustovacka4.webp"),
      pic("hrustovacka5.jpeg")
    ]
  },
  {
    slug: "dabarska",
    // coords: OpenStreetMap node 5613084883 (natural=cave_entrance, "Dabarska pećina")
    coords: [44.7100635, 16.6384232],
    // Meho's text says the cave was inhabited "in the Neolithic" and also names the Vučedol culture (Copper Age); the page says "prehistoric times".
    // Left out: "drinkable from the spring to the mouth" (hearsay on drinking water).
    see: [null],
    photos: [
      pic("dabarska.jpg"),
      // dabarska2.jpg and dabarska7.jpg carry the Canva authors "lejla avdagic" / "Antonio Ivičević" in their metadata; that is the
      // account that exported the file, not necessarily the photographer, so no author is set
      pic("dabarska2.jpg", { hero: true, pos: "50% 50%", posM: "60% 50%" }), // 1640 x 924
      pic("dabarska3.jpg"),
      pic("dabarska4.jpg"),
      pic("dabarska6.jpg"), // has a "DOK" mark at the bottom, probably the author's
      pic("dabarska7.jpg")
    ]
  },
  {
    slug: "bobijasko-oko",
    // coords: OpenStreetMap way 1202275847 (natural=water, "Bobijaško oko"), point given is the way’s search position
    coords: [44.7016006, 16.4632008],
    // TODO(verify): bobijasko-oko2.jpg (a river that runs under a rock arch, from above) may show the Dabar spring and not the shaft.
    photos: [
      pic("bobijasko-oko.webp"),
      pic("bobijasko-oko2.webp"),
      pic("bobijasko-oko3.jpg"),
      pic("bobijasko-oko4.jpg")
    ]
  },
  {
    slug: "mulez",
    // coords: given by Meho (2026-10-25). Checked against OpenStreetMap: the point is inside Općina Sanski Most (relation 2528261),
    // about 17 km from the town centre; OSM has no object called Mulež or a via ferrata there, so there is no OSM id to cite.
    coords: [44.65399773076312, 16.81145299681311],
    // TODO(verify): the highest peak, V. Divić, is given as 1013 m by one source. Not shown until verified.
    photos: [
      pic("mulez.jpg", { hero: true, pos: "50% 50%", posM: "40% 50%" }), // 2048 x 1152
      pic("mulez2.jpg"),
      pic("mulez3.jpg"),
      pic("mulez4.jpg"),
      pic("mulez5.jpg")
    ]
  },
  {
    slug: "grmec-forest",
    // coords: given by Meho (2026-10-25), a single point for the forest, not a trail or an entrance.
    // TODO(verify): the point is NOT inside Općina Sanski Most. OpenStreetMap puts it in Općina Bosanski Petrovac (relation 2528168),
    // 25.8 km in a straight line from the town centre, 8.2 km west of Bobijaško oko and 5.8 km from Korčanica. The text says the forest is
    // in the municipality of Sanski Most, about 20 km from the town; the peak Velika Bobija (OSM node 12621109051) is in Sanski Most, 8.6 km east of this point.
    // OSM has no forest element here (natural=wood, landuse=forest, protected_area and names with Bobij / Prašum / Grmeč searched on 2026-10-25).
    coords: [44.67459772049096, 16.36658428841864],
    see: ["korcanica", "bobijasko-oko"],
    photos: [
      pic("grmec.jpg"),
      // photos/grmec2.jpg (in originals/) is a duplicate of grmec.jpg (same photo, 1 px taller)
      // note: none of these photos shows the primeval forest itself (a viewpoint with a table, and a rocky gorge)
      pic("grmec3.webp")
    ]
  },
  {
    slug: "turbe-alagic",
    // Facts: FACTS.md, "Fajtovci / General Mehmed Alagic", Meho's text, and the decision that this card is only about the general (no village, mosque or waterfall).
    // TODO coords: the turbe's location is not known yet (Meho will provide it), so no marker on the map.
    // TODO(verify): a park named after General Alagić is not confirmed in the sources. OSM has leisure=park "Park generala Mehmeda Alagića" (way 40699044), which is on the map as a name only.
    // TODO(verify): Meho's text names no source for the military career; it is written as plain facts, without his evaluations.
    // Left out on purpose: birthplace and parents, and the passages that judge his command (they are opinion, not fact).
    photos: [
      pic("turbe.jpg"),
      pic("turbe2.jpg"), // the gravestone, "General Mehmed Alagić 1947-2003"
      pic("turbe3.jpg", { alt: "General Mehmed Alagić" }) // a portrait, no visible caption; Meho confirmed who it shows and that it may be published
    ]
  },
  {
    slug: "zavnobih",
    // coords: given by Meho (2026-10-25), the site of the building. It matches the OpenStreetMap street "ZAVNOBIH-a" (way 41075160, same point).
    coords: [44.76558562977139, 16.670158483327427],
    // TODO(verify): Meho's text says works on the revitalisation were planned to start on Tuesday 27 October (the year is not stated).
    // The page only says the project has been contracted; update it when the works start.
    // TODO(verify): the year of the first session (25 November, Mrkonjić Grad) is not in Meho's text.
    // TODO(verify): the text says the declaration was adopted in the "Sokolski dom"; it does not say outright that this is the building of the session.
    photos: [
      pic("zavnobih.webp"), // a photo of the old building in a book; no author or license known
      // photos/zavnobih2.jpg (in originals/) is a computer render of the planned building, not a photo of it
      pic("zavnobih3.jpg"), // the memorial slab "Dom ZAVNOBiH-a"
      pic("zavnobih4.jpg") // a view of the town, the building is not in it
    ]
  }
];
