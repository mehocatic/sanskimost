// Single source of truth for the places carousel, the place pages and the routes.
// The texts of a place (name, short, long, note, "Also worth seeing") are NOT here: they are under `places` in
// i18n/en.js and i18n/bs.js, with the same keys in both. This file holds what does not depend on the language.
//
// slug    : address of the place page (place.html?slug=...) and key of its texts
// coords  : [lat, lon] for the map on explore.html (a place without it has no marker); the comment names the source
// km      : approximate distance from town in km, only where FACTS.md or the place text states it (shown on the place page and on /plan)
// alt     : elevation in m, only where a source states it (shown on the place page)
// thenNow : an old and a new photo of the same thing, shown as "then and now" under the text (thennow.js):
//           { old, now, ar, posOld, posNow } (paths under photos/, the box's aspect ratio, object-position of each photo);
//           its caption is `tn` in the place's texts
// see     : links of the "Also worth seeing" entries, in the same order as the texts in the language files:
//           the slug of a place the entry links to, or null for a plain text entry (omit when there is none)
// photos  : the first photo is the cover on the card (shown cropped to the card). Each entry is created with pic(name, extra):
//           { src, srcset, author, license, sourceUrl, alt, main, hero, pos, posM }
//           - author, license, sourceUrl: shown as a small credit in the photo viewer (all optional, empty ones are left out;
//             nothing is filled in on assumption)
//           - archive: an old photo, postcard or document; true shows "Archive" on the slide, a string (a year) shows that
//           - source: where an old photo comes from when its author is not known (a book, an archive), shown as "Source: ..."
//           - alt: the alt text of the photo (not shown; the same text in both languages), otherwise the place name is used
//           - srcset: a smaller file for phones, e.g. "photos/a-1200.webp 1200w, photos/a.webp 2400w"
//             (slider photos: the small file is as wide as a 3x phone needs for the 300 px row, at most 1080 px; made from originals/)
//           - hero: true marks the one photo that fills the top of the place page, cropped (object-fit: cover). Only for a
//             landscape photo at least about 1600 px wide. A place without one gets a banner: its main photo (main: true,
//             otherwise the first) blurred and darkened across the whole width, with the same photo sharp and whole on it,
//             never larger than it is. Nothing is ever enlarged by the banner.
//           - pos / posM: object-position of the hero on wide screens / on phones (CSS, e.g. "50% 30%")
//           The gallery is a masonry of the other photos, each whole in its own proportions (the photo at the top of the page
//           is not repeated there, but it is in the viewer). In the viewer every photo is shown whole (object-fit: contain).
// Photos listed more than once are shown more than once, so list each photo once.
// Photos that are not listed here are kept in originals/ (not in the repository, see .gitignore), together with the files
// as they were before they were re-encoded for the site (WebP, quality 75, long side at most 1600 px, heroes 2400 px; a file
// is kept in its old format when WebP would not be smaller). Nothing is scaled up.
// A path whose file does not exist shows a neutral placeholder with the place name.
// TODO: fill in author, license and sourceUrl for each photo; only the author of musalla.webp is known (from the file).
const pic = (name, extra) => ({ src: `photos/${name}`, author: "", license: "", sourceUrl: "", ...extra });
// the book most of the old photos and facts on the site come from
const BOOK = "J. Zukanović, „Sanski Most nekad i sad“ (2024)";

const PLACES = [
  {
    slug: "blihe",
    // coords: OpenStreetMap node 4411996013 (waterway=waterfall, "Bliha Skok")
    coords: [44.7889880, 16.5247591],
    km: 14, // FACTS.md: about 14 km from town
    photos: [
      pic("bliha3.webp", { srcset: "photos/bliha3-721.webp 721w, photos/bliha3.webp 1080w" }), // the cover on the card
      // hero: 2400 px wide WebP (and 1200 px for phones) made from the 5464 x 3640 px original, which is in originals/bliha2.jpg
      pic("arhiv/bliha-jesen.webp", { author: "Đana Talić", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:The_Bliha_Waterfall,_Sanski_Most.jpg" }),
      pic("bliha2.webp", { hero: true, pos: "50% 30%", posM: "54% 45%", srcset: "photos/bliha2-1200.webp 1200w, photos/bliha2.webp 2400w" }),
      pic("bliha.webp"),
      pic("bliha4.webp"),
      pic("bliha5.webp"),
      pic("bliha6.webp"),
      pic("bliha-vodopad-staza.webp", { alt: "Staza do vodopada Blihe" }), // 512 x 768, the original is in originals/blihinVodopad.jpg; author not known (TODO(verify))
      // an old photograph of the waterfall, 1942 (file name in Meho's folder); it carries the mark of aukcije.hr, where it was offered
      pic("arhiv/blihe-1942.webp", { archive: "1942", source: "aukcije.hr" })
    ]
  },
  {
    slug: "kamengrad",
    // coords: OpenStreetMap node 4409177788 (historic=archaeological_site, "Tvrđava Stari Grad"); English Wikipedia "Kamengrad Fort" gives 44.7786, 16.5631, the same spot
    coords: [44.7797073, 16.5630776],
    // Checked 2026-11-15: first mention is 3 May 1374 (Kreševljaković, KONS, bs Wikipedia); no source found for 1373, so the site says 1374.
    // Dates of the Ottoman conquest differ in sources: 1463 (tradition, Fatih's musalla), 1498 (KONS decision), 1499 (Kreševljaković); the site lists them as "sources differ".
    // The site now lists the dates as "sources differ" and no longer says that most historians give 1463.
    // TODO(verify): Meho's text says the Kamengrad kadiluk was founded around 1541 and that from 1624 the town was the seat of a captaincy
    // (Stari Majdan, Sanski Most "Vakuf"). Neither is in FACTS.md, so both sentences were taken off the site (EN and BS).
    // TODO(verify): the text also names the Babonić Blagajski princes, a nahija under a dizdar, the lower town Donji Grad (Palanka) and walls
    // of 5 to 7 m; none of it is in FACTS.md either. Left on the site from the earlier session, to be confirmed or cut.
    see: ["musalla", "blihe"],
    photos: [
      pic("kamengrad.webp"),
      pic("kamengrad2.webp"), // a drawing, not a photo
      pic("kamengrad3.jpg"),
      pic("kamengrad4.webp"),
      pic("kamengrad5.webp") // the hill of the fortress from the air; from the Maezaei material in Meho's notes, author not known
    ]
  },
  {
    slug: "musalla",
    // coords: not set here. In OpenStreetMap it is node 519029537 (amenity=place_of_worship, "Fatihova Musalla"), and poi.js uses it for the map.
    see: ["kamengrad"],
    photos: [
      pic("musalla.webp", { author: "Almedin Handanovic" }), // author: EXIF Artist tag of the file (Copyright tag says "Gorsak na salasu", not a license)
      pic("musalla2.webp"),
      // photos/musalla3.jpg (in originals/) shows the monument to the Turkish martyrs (OSM node 4409248503), not the musalla; no place page for it
      pic("musalla4.webp"),
      // an old postcard, "Musalla Sultan Fatih Mehmed II. - D. Kamengrad"; from Meho's notes, the publisher is not known
      pic("arhiv/musala-razglednica.webp", { archive: true, alt: "Musalla Sultan Fatih Mehmed II., D. Kamengrad" })
    ]
  },
  {
    slug: "hamzibegova",
    // coords: OpenStreetMap way 346178044 (amenity=place_of_worship, "Hamza-begova džamija")
    coords: [44.7638251, 16.6648616],
    // Demolition date: bs Wikipedia, Inmedia and the Medžlis (2007) say 27 June 1992; a 2025 Medžlis text says 27 May (probably an error). The 1992 timeline entry now says only "in June". Meho's text says members of the Army of Republika Srpska demolished the mosque and that
    // the building material and gravestones were taken to a dump. No source is named, so only the date is on the site.
    // TODO(verify): the text says "the largest mosque in Sanski Most"; left out (superlative, no source).
    // TODO(verify): hamzibegova4.webp (a prayer, wooden mihrab, looks like a scanned print) does not look like the interior in
    // hamzibegova2 and 3 (white walls, teal carpet). Meho to confirm it is the Hamzibeg Mosque.
    see: [null, null, null],
    photos: [
      pic("hamzibegova.webp"),
      pic("hamzibegova5.webp", { main: true }), // the mosque with four minarets, shown at the top (1024 x 1472)
      pic("hamzibegova2.webp"),
      pic("hamzibegova3.webp"),
      pic("hamzibegova4.webp"),
      // TODO(verify): from Meho's notes from the book; the book is the source, the photographer is not known
      pic("arhiv/sanski-most-1938.webp", { archive: "1938" }),
      pic("arhiv/most-1939.webp", { archive: "1939", source: BOOK }),
      pic("arhiv/hamzibegova-1946.webp", { archive: "1946", source: BOOK }),
      // the mosque being built, April 1998; the album pages are signed "Foto: Edin Šarčević" (one also "Copyright © by Edin Šarčević").
      // The printed caption of one page says 10 April 1997, the handwritten date and the other pages say 10 April 1998; the site uses 1998.
      pic("arhiv/dzamija-gradnja-b.webp", { archive: "1998", author: "Edin Šarčević" }),
      pic("arhiv/dzamija-gradnja-c.webp", { archive: "1998", author: "Edin Šarčević" }),
      pic("arhiv/dzamija-gradnja-d.webp", { archive: "1998", author: "Edin Šarčević" }),
      pic("arhiv/dzamija-gradnja-a.webp", { archive: "1998", author: "Edin Šarčević" }),
      pic("arhiv/dzamija-ulica-1998.webp", { archive: "1998", author: "Edin Šarčević" })
    ],
    // the old mosque in 1946 (one minaret) and the one rebuilt in 2000 (four minarets)
    thenNow: { old: "arhiv/hamzibegova-1946.webp", now: "hamzibegova5.webp", ar: "3 / 4", posOld: "50% 40%", posNow: "50% 55%" }
  },
  {
    slug: "korcanica",
    // coords: OpenStreetMap node 11146153554 (historic=memorial, "Korčanica Monument to the Revolution at Grmeč")
    coords: [44.6872744, 16.4375984],
    km: 32, // the Korčanica text says about 32 km from town
    alt: 836, // elevation in m: Zukanović, "Sanski Most nekad i sad" (2024)
    // TODO(verify): Meho's text gives 316 fallen fighters buried in two tombs, and 2732 m2 for the hospital; no source is named, so left out.
    // The book describes the monument as a "split flower bud", which is what the two semicircular walls in the photos are.
    // The material and the "underground museum" of an earlier text are left out until a source settles them.
    // Left out: the book says the battle for the wounded on the Neretva started from here; no second source.
    see: ["grmec-forest"],
    photos: [
      pic("korcanica.jpg"),
      pic("korcanica2.jpg"),
      pic("korcanica3.jpg", { main: true }), // the monument, shown at the top (738 x 416)
      pic("korcanica4.webp"), // the ruined hotel
      pic("korcanica-snijeg.webp"), // the ruined hotel from the front, in snow (from Meho's folder, korcanicaHotel.jpg)
      // TODO(verify): an old postcard of the hotel; it is in Meho's notes from the book, the publisher of the postcard is not known
      pic("arhiv/korcanica-razglednica.webp", { archive: true, source: BOOK })
    ],
    // the hotel on the postcard (cut out of it) and the same hotel now, from the front as on the postcard; caption: `tn` in the language files
    thenNow: { old: "arhiv/korcanica-hotel.webp", now: "korcanica-snijeg.webp", ar: "4 / 3", posOld: "50% 45%", posNow: "52% 50%" }
  },
  {
    slug: "hrustovacka",
    // coords: given by the site owner; matches OpenStreetMap node 5613053430 (natural=cave_entrance)
    coords: [44.6726663, 16.7006463],
    km: 13, // FACTS.md: about 13 km from town
    // hrustovacka2.jpg and hrustovacka5.webp show a lit cave with a walkway and a group: Meho confirmed they are Hrustovačka Cave
    // (visits with an organised group). The text "self-guided, bring a torch" is unchanged.
    see: [null, null],
    photos: [
      pic("hrustovacka.jpg"),
      pic("hrustovacka3.webp", { main: true }), // the entrance, shown at the top (1180 x 885)
      pic("hrustovacka2.jpg"),
      pic("hrustovacka4.webp"),
      pic("hrustovacka5.webp")
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
      // dabarska2.webp and dabarska7.webp carry the Canva authors "lejla avdagic" / "Antonio Ivičević" in their metadata; that is the
      // account that exported the file, not necessarily the photographer, so no author is set
      pic("dabarska2.webp", { hero: true, pos: "50% 50%", posM: "60% 50%", srcset: "photos/dabarska2-1200.webp 1200w, photos/dabarska2.webp 1640w" }), // 1640 x 924
      pic("dabarska3.jpg"),
      pic("dabarska4.jpg"),
      pic("dabarska6.jpg"), // has a "DOK" mark at the bottom, probably the author's
      pic("dabarska7.webp")
    ]
  },
  {
    slug: "bobijasko-oko",
    // coords: OpenStreetMap way 1202275847 (natural=water, "Bobijaško oko"), point given is the way’s search position
    coords: [44.7016006, 16.4632008],
    km: 20, // FACTS.md: about 20 km from town
    // TODO(verify): identify bobijasko-oko2.webp before using it here or at the Dabar spring.
    photos: [
      pic("bobijasko-oko.webp"),
      pic("bobijasko-oko3.jpg"),
      pic("bobijasko-oko4.webp")
    ]
  },
  {
    slug: "mulez",
    // coords: given by Meho (2026-10-25). Checked against OpenStreetMap: the point is inside Općina Sanski Most (relation 2528261),
    // about 17 km from the town centre; OSM has no object called Mulež or a via ferrata there, so there is no OSM id to cite.
    coords: [44.65399773076312, 16.81145299681311],
    // TODO(verify): the highest peak, V. Divić, is given as 1013 m by one source. Not shown until verified.
    photos: [
      pic("mulez.jpg", { hero: true, pos: "50% 50%", posM: "40% 50%", srcset: "photos/mulez-1200.webp 1200w, photos/mulez.jpg 2048w" }), // 2048 x 1152; the JPEG stays, a WebP of it was not smaller
      pic("mulez2.jpg"),
      pic("mulez3.jpg"),
      pic("mulez4.webp"),
      pic("mulez5.webp"),
      // a view over the valley from a ridge, kept with the "SanUM" mark it came with; TODO(verify): confirm that the view is from Mulež and who owns the photo
      pic("mulez-pogled.webp", { author: "SanUM", alt: "Pogled s planine na dolinu" })
    ]
  },
  {
    slug: "grmec-forest",
    // coords: given by Meho ("dao Meho"), a single point for the forest, not a trail or an entrance.
    // Checked 2026-10-26 against OpenStreetMap: the point is inside Općina Sanski Most (relation 2528261), 17.41 km in a straight line from the town
    // centre (44.7658, 16.6663), 3.2 km from Korčanica and 2.3 km from Bobijaško oko. The text says about 17 km (rounded).
    // OSM has no forest element here (natural=wood, landuse=forest, protected_area and names with Bobij / Prašum / Grmeč searched on 2026-10-25).
    coords: [44.684125390645384, 16.478326730966664],
    km: 17,
    kmKey: "place.km.air",
    see: ["korcanica", "bobijasko-oko"],
    photos: [
      pic("grmec.jpg", { captionKey: "photo.grmec.view" }),
      // photos/grmec2.jpg (in originals/) is a duplicate of grmec.jpg (same photo, 1 px taller)
      // note: none of these photos shows the primeval forest itself (a viewpoint with a table, and a rocky gorge)
      pic("grmec3.webp", { captionKey: "photo.grmec.gorge" })
    ]
  },
  {
    slug: "turbe-alagic",
    // Facts: FACTS.md, "Fajtovci / General Mehmed Alagic", Meho's text, and the decision that this card is only about the general (no village, mosque or waterfall).
    // TODO coords: no marker on the map. OpenStreetMap has no object for this turbe (searched the municipality on 2026-10-26: "Alijino turbe", way 245559589,
    // is a different one); add coords when Meho gives them or the turbe is mapped.
    // The Medžlis confirmed that the turbe exists, that a park in the town bears the general's name (OSM leisure=park, way 40699044, on the map as a name only)
    // and that the portrait may be published.
    // TODO(verify): Meho's text names no source for the military career; it is written as plain facts, without his evaluations.
    // Left out on purpose: birthplace and parents, and the passages that judge his command (they are opinion, not fact).
    photos: [
      pic("turbe.webp"),
      pic("turbe2.webp"), // the gravestone, "General Mehmed Alagić 1947-2003"
      pic("turbe3.webp", { alt: "General Mehmed Alagić" }) // a portrait, no visible caption; the Medžlis confirmed who it shows and that it may be published
    ]
  },
  {
    slug: "zavnobih",
    // coords: given by Meho (2026-10-25), the site of the building. It matches the OpenStreetMap street "ZAVNOBIH-a" (way 41075160, same point).
    coords: [44.76558562977139, 16.670158483327427],
    // TODO(verify): Meho's text says works on the revitalisation were planned to start on Tuesday 27 October (the year is not stated).
    // The page only says the project has been contracted; update it when the works start.
    // Confirmed 2026-11-15 (ANUBiH, parlament.ba): first session 25-26 November 1943 in Mrkonjić Grad; the site now says 1943.
    // The Sokolski dom (1939) is the building of the session: zavnobih.webp, a page of a book, shows it with the caption "the building of the
    // Fiskulturni dom in Sanski Most in which the Second Session of ZAVNOBiH was held", and Zukanović's book says the same; burnt and demolished in 1995.
    photos: [
      pic("zavnobih.webp"), // a photo of the old building in a book; no author or license known
      // the same building, the Sokolski dom; TODO(verify): from Meho's notes from the book, the photographer is not known
      pic("arhiv/sokolski-dom.webp", { archive: "1939", source: BOOK, alt: "Sokolski dom" }),
      // a large group in front of a building; Meho thinks they are the people who built the Sokolski dom (not stated on the site)
      pic("arhiv/zavnobih-ljudi.webp", { archive: true, alt: "Grupa mještana ispred zgrade" }),
      // photos/zavnobih2.jpg (in originals/) is a computer render of the planned building, not a photo of it
      pic("zavnobih3.jpg"), // the memorial slab "Dom ZAVNOBiH-a"
      pic("zavnobih4.jpg") // a view of the town, the building is not in it
    ]
  },
  {
    slug: "susnjar",
    // coords: OpenStreetMap way 459823166 (historic=memorial_site), the same point poi.js uses for "susnjar-memorijalni-kompleks"
    coords: [44.7622452, 16.6836748],
    // Facts: Meho's text, which follows the register of the Institute for the Protection of Cultural Heritage Bihać (KONS). Sources disagree on the year
    // of completion (1970 in spomenikdatabase.org and Wikipedia, 1971 in spomenicinob.info), so the page says only "the 1970s" and 1970 for the design.
    // Meho (2026-11-22) asked for the changes made to the memorial during the war to be on the page, and for the Bosniaks among the fallen to be named.
    // The page says it briefly and without numbers of victims. Source of the changes: the KONS register text (Pečenković) and one interview (istinomjer.ba);
    // no independent second source was found, so the note names both. The executions of 1941 are deliberately not described (Meho: nothing too dark).
    photos: [
      // the mark "#ArchitectonicTravels" is on the photograph itself and was left there; TODO(verify): author and license
      pic("susnjar.webp", { author: "ArchitectonicTravels", alt: "Obelisk memorijalnog kompleksa Šušnjar" })
    ]
  },
  {
    slug: "stari-majdan-most",
    // coords: not known (no marker). TODO(verify): the location of the bridge, its age and the year it was declared a monument
    // (the Commission to Preserve National Monuments declared a "Rimski most" on the river Orlja a historic monument in 2011; not confirmed to be this bridge).
    // TODO(verify): the source text (KONS, Pečenković) dates the town both to the middle of the 18th century and says that in the first half of
    // the 18th century it had 2 large and 3 small cannons and 300 border guards; the cannon sentence was left out because of that.
    see: ["kamengrad"],
    photos: [
      pic("stari-majdan-most.webp", { alt: "Kameni most u Starom Majdanu" }) // 1600 x 1200; author not known (TODO(verify))
    ]
  }
];
