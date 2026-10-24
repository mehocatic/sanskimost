// Single source of truth for the places carousel and the detail view.
// To add photos: drop the file into photos/ and add its path to the `photos` array
// (e.g. photos: ["photos/bliha.jpg", "photos/blihe-2.jpg"]). WebP or JPG both work.
// A path whose file does not exist shows a neutral placeholder with the place name.
// TODO: photos[0] is the real cover photo. The other three entries are the stand-in photos/placeholder.jpg
// (a frame from the waterfall video), only there so the gallery has something to show.
// Replace PH with real photo paths for each place, e.g. photos: ["photos/bliha.jpg", "photos/bliha-2.jpg"].
// Photos listed more than once are shown more than once, so list each real photo once.
// An entry is a path, or { src, author, license, sourceUrl } to show a photo credit in the photo viewer
// (all three are optional; empty ones are left out). The placeholder PH has no credit.
// TODO: fill in author, license and sourceUrl for each real photo.
const PH = "photos/placeholder.jpg";

// `coords` is [lat, lon] for the map on explore.html (a place without it has no marker).
// `see` is the "Also worth seeing" list in the detail view (an empty list hides the section).
// An entry is either plain text or { slug, text }, which links the text to that place's page.
const PLACES = [
  {
    slug: "blihe",
    // coords: OpenStreetMap node 4411996013 (waterway=waterfall, "Bliha Skok")
    coords: [44.7889880, 16.5247591],
    name: "Blihe Waterfall",
    short: "A protected natural monument where the Bliha river drops about 56 m.",
    long: "Blihe Waterfall, known locally as Blihin skok, lies about 14 km from Sanski Most. Here the Bliha river drops about 56 m. It is a protected natural monument. The “Cvjetna” hiking trail, about 15 km long, links Kamengrad, the waterfall and the Jasice recreation area.",
    see: [
      "The \u201CCvjetna\u201D trail (about 15 km) links Kamengrad, the waterfall and the Jasice recreation area.",
      { slug: "fajtovci", text: "Fajtovci, the village on the Bliha river where the waterfall drops." }
    ],
    photos: [{ src: "photos/bliha.jpg", author: "", license: "", sourceUrl: "" }, PH, PH, PH]
  },
  {
    slug: "kamengrad",
    // coords: OpenStreetMap node 4409177788 (historic=archaeological_site, "Tvrđava Stari Grad"); English Wikipedia "Kamengrad Fort" gives 44.7786, 16.5631, the same spot
    coords: [44.7797073, 16.5630776],
    name: "Kamengrad Fortress",
    short: "A medieval fortress above Donji Kamengrad, first mentioned in 1374.",
    long: "Kamengrad is a medieval fortress above Donji Kamengrad. It was first mentioned in 1374 and was taken by the Ottomans in 1498. It has been a national monument since 2008.",
    note: "Local legend says the Ottomans besieged the fortress for eleven years.",
    see: [
      "Fatih\u2019s Musalla, below the fortress.",
      "The \u201CCvjetna\u201D trail, which links Kamengrad, Blihe Waterfall and the Jasice recreation area."
    ],
    photos: [{ src: "photos/kamengrad.webp", author: "", license: "", sourceUrl: "" }, PH, PH, PH]
  },
  {
    slug: "musalla",
    // TODO coords: not found in OpenStreetMap, so no marker on the map. Add coords: [lat, lon] once verified.
    name: "Fatih’s Musalla",
    short: "An Ottoman-era open-air prayer place in Kamengrad.",
    long: "Fatih’s Musalla in Kamengrad is an Ottoman-era open-air prayer place, dated to 1463 in some sources. Friday prayers and an annual event are held there.",
    note: "A local source calls it the only one of its kind preserved in the Balkans. This is that source’s claim.",
    see: [
      "Kamengrad Fortress, above it."
    ],
    photos: [{ src: "photos/musalla.jpeg", author: "", license: "", sourceUrl: "" }, PH, PH, PH]
  },
  {
    slug: "hamzibegova",
    // coords: OpenStreetMap way 346178044 (amenity=place_of_worship, "Hamza-begova džamija")
    coords: [44.7638251, 16.6648616],
    name: "Hamzibeg Mosque",
    short: "Built before 1557, destroyed in 1992 and reopened on 6 August 2000.",
    long: "The Hamzibeg Mosque was built before 1557 by sanjak-bey Hamza-beg Biharović. It is reportedly the only mosque in Bosnia and Herzegovina with four minarets. It was rebuilt in 1705 after war damage, and destroyed on 27 June 1992. Reconstruction began in 1997 and the mosque reopened on 6 August 2000.",
    see: [
      "The adjoining Muslim cemetery, with gravestones from about 1751\u201352.",
      "Rafting on the Sana can start near the mosque.",
      "The city bridge over the Sana, lit at night by LED lights."
    ],
    photos: [{ src: "photos/hamzibegova.jpg", author: "", license: "", sourceUrl: "" }, PH, PH, PH]
  },
  {
    slug: "korcanica",
    // coords: OpenStreetMap node 11146153554 (historic=memorial, "Korčanica Monument to the Revolution at Grmeč")
    coords: [44.6872744, 16.4375984],
    name: "Korčanica",
    short: "A WWII memorial complex on Grmeč mountain, opened in 1979.",
    long: "Korčanica is a WWII memorial complex on Grmeč mountain, on the site of a Partisan hospital built in 1942 with 19 wooden buildings. The memorial is by sculptor Ljubomir Denković and was opened on 27 July 1979. A central white concrete sculpture is shaped like an opening bud, and the complex also holds an underground museum and graves. Today it is largely forgotten and hard to find.",
    see: [
      "The Grme\u010D primeval forest, about 20 km from the town: over 100 ha, with trees over 500 years old."
    ],
    photos: [{ src: "photos/korcanica.jpg", author: "", license: "", sourceUrl: "" }, PH, PH, PH]
  },
  {
    slug: "hrustovacka",
    // coords: given by the site owner; matches OpenStreetMap node 5613053430 (natural=cave_entrance)
    coords: [44.6726663, 16.7006463],
    name: "Hrustovačka Cave",
    short: "A prehistoric shelter with finds of the Vučedol culture.",
    long: "Hrustovačka Cave is a prehistoric shelter with finds of the Vučedol culture, locally called the “Hrustovo type”, which are exhibited in the National Museum in Sarajevo. A passage of about 500 m ends in a small lake. The cave has been a national monument since 2014 and was used as a hideout in several wars.",
    note: "Self-guided: bring a torch and never go alone.",
    see: [
      "The karst spring of the Glibaje river, just below the entrance, with a picnic area.",
      "Dabar Cave."
    ],
    photos: [{ src: "photos/hrustovacka.jpg", author: "", license: "", sourceUrl: "" }, PH, PH, PH]
  },
  {
    slug: "dabarska",
    // coords: OpenStreetMap node 5613084883 (natural=cave_entrance, "Dabarska pećina")
    coords: [44.7100635, 16.6384232],
    name: "Dabar Cave",
    short: "The source of the Dabar river, with a lake inside.",
    long: "Dabar Cave is the source of the Dabar river. It has a large entrance hall and a lake inside, and was once home to the olm, the “human fish”. It is a protected natural monument.",
    see: [
      "Bobija\u0161ko Oko, whose outflow reappears here."
    ],
    photos: [{ src: "photos/dabarska.jpg", author: "", license: "", sourceUrl: "" }, PH, PH, PH]
  },
  {
    slug: "bobijasko-oko",
    // coords: OpenStreetMap way 1202275847 (natural=water, "Bobijaško oko"), point given is the way’s search position
    coords: [44.7016006, 16.4632008],
    name: "Bobijaško Oko",
    short: "A vertical karst shaft that looks like an eye from above.",
    long: "Bobijaško Oko is a vertical karst shaft near Jelašinovci that looks like an eye from above. The water level changes its look, from a deep blue pool to a lake. The outflow forms the Jezernica brook, which sinks and reappears at Dabar Cave.",
    note: "Best seen after snowmelt or heavy rain.",
    see: [
      "Dabar Cave, where the outflow reappears."
    ],
    photos: [{ src: "photos/bobijasko-oko.webp", author: "", license: "", sourceUrl: "" }, PH, PH, PH]
  },
  {
    slug: "mulez",
    // TODO coords: not verified, so no marker on the map. Add coords: [lat, lon] once verified.
    // TODO(verify): the highest peak, V. Divić, is given as 1013 m by one source. Not shown until verified.
    name: "Mulež",
    short: "A mountain above the Sana canyon, with a via ferrata along a 90 m rock wall.",
    long: "Mulež is a mountain above the Sana canyon. A via ferrata (a secured climbing route), open since September 2024, runs along a 90 m rock wall; it was built by the mountaineering society SPD “Mulež”. A new 60 m suspension bridge links two rock faces above deep gorges. A sulphur spring at Ilidža lies at the foot of the mountain.",
    note: "For experienced hikers. A helmet, harness and cables are recommended; follow the safety signs.",
    see: [
      "The via ferrata along the 90 m rock wall, open since September 2024.",
      "The sulphur spring at Ilidža, at the foot of the mountain."
    ],
    // TODO: no photo yet, so the neutral placeholder with the name is shown
    photos: []
  },
  {
    slug: "grmec-forest",
    // TODO coords: not verified, so no marker on the map. Add coords: [lat, lon] once verified.
    name: "Grmeč Forest",
    short: "A primeval forest of over 100 hectares, with trees over 500 years old.",
    long: "The primeval forest on Grmeč lies about 20 km from the town. It covers over 100 hectares and is one of the largest in Bosnia and Herzegovina, with trees over 500 years old.",
    see: [
      { slug: "korcanica", text: "Korčanica, a WWII memorial complex on Grmeč mountain." },
      { slug: "bobijasko-oko", text: "Bobijaško Oko, a vertical karst shaft that looks like an eye from above." }
    ],
    // TODO: no photo yet, so the neutral placeholder with the name is shown
    photos: []
  },
  {
    slug: "fajtovci",
    // TODO coords: not verified, so no marker on the map. Add coords: [lat, lon] once verified.
    // TODO(verify): a turbe and a park named after General Alagić are not confirmed in the sources. Do not add them until confirmed.
    name: "Fajtovci",
    short: "A village on the Bliha river, where the Blihe waterfall drops about 56 m.",
    long: "Fajtovci is a village on the Bliha river, where the Blihe waterfall drops about 56 m. The village mosque bears the name of General Mehmed Alagić (1947–2003), who was born in Fajtovci. He commanded an Army of the Republic of Bosnia and Herzegovina corps and was later the first post-war mayor of Sanski Most. He laid the foundation stone of the mosque, which was reopened on 19 July 2008, and he is buried in the mosque cemetery. His death anniversary is commemorated on 7 March; a memorial room is planned.",
    see: [
      { slug: "blihe", text: "Blihe Waterfall, where the Bliha river drops about 56 m." }
    ],
    // TODO: no photo yet, so the neutral placeholder with the name is shown
    photos: []
  },
  {
    slug: "zavnobih",
    // TODO coords: the building is not confirmed, so no marker on the map.
    name: "ZAVNOBiH 1944",
    short: "The second session of ZAVNOBiH was held in Sanski Most, 30 June – 2 July 1944.",
    // TODO: no confirmed information yet about the building where the session was held
    // or its reconstruction. Do not add any claim about it until it is confirmed.
    long: "The second session of ZAVNOBiH was held in Sanski Most from 30 June to 2 July 1944. It declared the equality of Serbs, Muslims (Bosniaks) and Croats, and Bosnia and Herzegovina as a state within the Yugoslav federation.",
    // TODO: no confirmed information yet, so there is no "Also worth seeing" for this place.
    see: [],
    photos: [{ src: "photos/zavnobih.webp", author: "", license: "", sourceUrl: "" }, PH, PH, PH]
  }
];
