// Points on the map (explore.html), separate from PLACES (the carousel and the place pages).
// Each point: id, cat, coords [lat, lon] (null: not on the map yet), name and short in EN and BS, and slug when it has a page.
// Sources: every coordinate names its source: an OpenStreetMap element (fetched with the Overpass API on 2026-10-24,
// area: relation 2528261 "Općina Sanski Most") or "given by Meho" (Mulež, ZAVNOBiH); texts come from FACTS.md and the language files, or only say what the OSM tags say.
// Points with a page copy their texts from i18n/en.js and i18n/bs.js; the map shows the live texts from there.
// What could not be confirmed is listed in poi-todo.md.
// Memorials are added only after Meho approves each one (source for both the location and the nature of the place).
// Camps are not on the map; they stay in the timeline (Meho, 2026-10-24). The category is kept so the colour stays reserved.

const POI_CATS = [
  { id: "nature", color: "#5b9a5f" },
  { id: "water", color: "#4db6d6" },
  { id: "history", color: "#b89b72" },
  { id: "culture", color: "#8e6bb0" },
  { id: "camps", color: "#8c4a4a" },
  { id: "memorials", color: "#8a8f98" }
];

const POI = [
  {
    // OSM node 4411996013 (waterway=waterfall); texts: i18n/en.js, i18n/bs.js
    id: "blihe",
    slug: "blihe",
    cat: "water",
    coords: [44.788988, 16.5247591],
    name: { en: "Blihe Waterfall", bs: "Vodopad Blihe" },
    short: { en: "A protected natural monument where the Bliha river drops about 56 m.", bs: "Zaštićeni spomenik prirode gdje rijeka Bliha pada oko 56 m." }
  },
  {
    // OSM node 4409177788 (historic=archaeological_site, "Tvrđava Stari Grad"); texts: i18n/en.js, i18n/bs.js
    id: "kamengrad",
    slug: "kamengrad",
    cat: "history",
    coords: [44.7797073, 16.5630776],
    name: { en: "Kamengrad Fortress", bs: "Tvrđava Kamengrad" },
    short: { en: "A medieval fortress above Donji Kamengrad, first mentioned in 1374. A national monument since 2008.", bs: "Srednjovjekovna tvrđava iznad Donjeg Kamengrada, prvi put spomenuta 1374. Nacionalni spomenik od 2008." }
  },
  {
    // OSM node 519029537 (amenity=place_of_worship, "Fatihova Musalla", wikidata Q17997763); texts: i18n/en.js, i18n/bs.js
    id: "musalla",
    slug: "musalla",
    cat: "culture",
    coords: [44.7855807, 16.571875],
    name: { en: "Fatih’s Musalla", bs: "Fatihova musala" },
    short: { en: "An Ottoman-era open-air prayer place in Donji Kamengrad, a national monument since 2003.", bs: "Mjesto za molitvu na otvorenom iz osmanskog perioda, u Donjem Kamengradu; nacionalni spomenik od 2003." }
  },
  {
    // OSM way 346178044 (amenity=place_of_worship); texts: i18n/en.js, i18n/bs.js
    id: "hamzibegova",
    slug: "hamzibegova",
    cat: "culture",
    coords: [44.7638251, 16.6648616],
    name: { en: "Hamzibeg Mosque", bs: "Hamzibegova džamija" },
    short: { en: "Built before 1557, destroyed in 1992 and reopened on 6 August 2000.", bs: "Izgrađena prije 1557, srušena 1992. i ponovo otvorena 6. augusta 2000." }
  },
  {
    // OSM node 11146153554 (historic=memorial); texts: i18n/en.js, i18n/bs.js
    id: "korcanica",
    slug: "korcanica",
    cat: "memorials",
    coords: [44.6872744, 16.4375984],
    name: { en: "Korčanica", bs: "Korčanica" },
    short: { en: "A WWII memorial complex at Grmeč mountain, opened in 1979.", bs: "Spomen-kompleks iz Drugog svjetskog rata na planini Grmeč, otvoren 1979." }
  },
  {
    // OSM node 5613053430 (natural=cave_entrance); texts: i18n/en.js, i18n/bs.js
    id: "hrustovacka",
    slug: "hrustovacka",
    cat: "nature",
    coords: [44.6726663, 16.7006463],
    name: { en: "Hrustovačka Cave", bs: "Hrustovačka pećina" },
    short: { en: "A prehistoric shelter with finds of the Vučedol culture.", bs: "Praistorijsko sklonište s nalazima vučedolske kulture." }
  },
  {
    // OSM node 5613084883 (natural=cave_entrance); texts: i18n/en.js, i18n/bs.js
    id: "dabarska",
    slug: "dabarska",
    cat: "water",
    coords: [44.7100635, 16.6384232],
    name: { en: "Dabar Cave", bs: "Dabarska pećina" },
    short: { en: "The source of the Dabar river, with a lake inside.", bs: "Izvor rijeke Dabar, s jezerom u unutrašnjosti." }
  },
  {
    // OSM way 1202275847 (natural=water), search position as in places.js; texts: i18n/en.js, i18n/bs.js
    id: "bobijasko-oko",
    slug: "bobijasko-oko",
    cat: "water",
    coords: [44.7016006, 16.4632008],
    name: { en: "Bobijaško Oko", bs: "Bobijaško oko" },
    short: { en: "A vertical karst shaft that looks like an eye from above.", bs: "Vertikalna kraška jama koja odozgo izgleda kao oko." }
  },
  {
    // given by Meho on 2026-10-25 (no Mulež object in OSM; the point is inside Općina Sanski Most, relation 2528261); texts: i18n/en.js, i18n/bs.js
    id: "mulez",
    slug: "mulez",
    cat: "nature",
    coords: [44.65399773076312, 16.81145299681311],
    name: { en: "Mulež", bs: "Mulež" },
    short: { en: "A mountain above the Sana canyon, with a via ferrata along a 90 m rock wall.", bs: "Planina iznad kanjona Sane, s via ferratom duž stijene od 90 m." }
  },
  {
    // given by Meho ("dao Meho"), one point for the forest (not a trail or an entrance); no forest element in OSM (only the peaks Mala Bobija, node 12621109050, and Velika Bobija, node 12621109051).
    // Checked 2026-10-26: inside Općina Sanski Most (OSM relation 2528261), 19.98 km in a straight line from the town centre. Texts: i18n/en.js, i18n/bs.js
    id: "grmec-forest",
    slug: "grmec-forest",
    cat: "nature",
    coords: [44.673051955468395, 16.449710576267698],
    name: { en: "Grmeč Forest", bs: "Prašuma na Grmeču" },
    short: { en: "A primeval forest of over 100 hectares, with trees over 500 years old.", bs: "Prašuma na više od 100 hektara, sa stablima starijim od 500 godina." }
  },
  {
    // given by Meho on 2026-10-25, the site of the building (same point as the OSM street "ZAVNOBIH-a", way 41075160); texts: i18n/en.js, i18n/bs.js
    id: "zavnobih",
    slug: "zavnobih",
    cat: "history",
    coords: [44.76558562977139, 16.670158483327427],
    name: { en: "ZAVNOBiH 1944", bs: "ZAVNOBiH 1944" },
    short: { en: "The second session of ZAVNOBiH was held in Sanski Most, 30 June – 2 July 1944.", bs: "Drugo zasjedanje ZAVNOBiH-a održano je u Sanskom Mostu od 30. juna do 2. jula 1944." }
  },
  {
    // OSM way 393580870 (amenity=place_of_worship, denomination=sunni), way centre; text: FACTS.md ("General Mehmed Alagic" mosque, opened 19 Jul 2008)
    id: "dzamija-alagic",
    cat: "culture",
    coords: [44.7899811, 16.5132525],
    name: { en: "Džamija Generala Mehmeda Alagića", bs: "Džamija Generala Mehmeda Alagića" },
    short: { en: "A mosque that bears the name of General Mehmed Alagić, opened on 19 July 2008.", bs: "Džamija koja nosi ime generala Mehmeda Alagića, otvorena 19. jula 2008." }
  },
  {
    // OSM way 292142674 (amenity=place_of_worship, denomination=sunni), way centre; the OSM description "built 1463" is not used: not in FACTS.md
    id: "sultan-fatih-dzamija",
    cat: "culture",
    coords: [44.7863119, 16.574623],
    name: { en: "Sultan Mehmed Fatihova džamija", bs: "Sultan Mehmed Fatihova džamija" },
    short: { en: "Mosque.", bs: "Džamija." }
  },
  {
    // OSM way 301906019 (amenity=place_of_worship, denomination=sunni), way centre
    id: "nova-dzamija-donji-kamengrad",
    cat: "culture",
    coords: [44.7895608, 16.56905],
    name: { en: "Nova džamija Donji Kamengrad", bs: "Nova džamija Donji Kamengrad" },
    short: { en: "Mosque.", bs: "Džamija." }
  },
  {
    // OSM way 245401682 (amenity=place_of_worship, denomination=sunni), way centre
    id: "trnavska-dzamija",
    cat: "culture",
    coords: [44.8025494, 16.6683527],
    name: { en: "Trnavska džamija", bs: "Trnavska džamija" },
    short: { en: "Mosque.", bs: "Džamija." }
  },
  {
    // OSM way 346175347 (amenity=place_of_worship, denomination=sunni), way centre
    id: "dzamija-bosanskih-muhadzira",
    cat: "culture",
    coords: [44.7594107, 16.6802943],
    name: { en: "Džamija bosanskih muhadžira", bs: "Džamija bosanskih muhadžira" },
    short: { en: "Mosque.", bs: "Džamija." }
  },
  {
    // OSM way 686387624 (amenity=place_of_worship), way centre
    id: "mesdzid-sanski-most",
    cat: "culture",
    coords: [44.7580483, 16.7100305],
    name: { en: "Mesdžid Sanski Most", bs: "Mesdžid Sanski Most" },
    short: { en: "Mosque.", bs: "Džamija." }
  },
  {
    // OSM way 291591158 (amenity=place_of_worship, denomination=sunni), way centre
    id: "dzamija-dosci",
    cat: "culture",
    coords: [44.8009428, 16.5380913],
    name: { en: "Džamija Došci", bs: "Džamija Došci" },
    short: { en: "Mosque.", bs: "Džamija." }
  },
  {
    // OSM way 591569126 (amenity=place_of_worship, denomination=sunni), way centre; the OSM name has a typo ("Džamijs Vrše")
    id: "dzamija-vrse",
    cat: "culture",
    coords: [44.814603, 16.5515193],
    name: { en: "Džamija Vrše", bs: "Džamija Vrše" },
    short: { en: "Mosque.", bs: "Džamija." }
  },
  {
    // OSM way 447353526 (amenity=place_of_worship, denomination=sunni), way centre
    id: "dzamija-stari-majdan",
    cat: "culture",
    coords: [44.8284918, 16.6060847],
    name: { en: "Džamija Stari Majdan", bs: "Džamija Stari Majdan" },
    short: { en: "Mosque.", bs: "Džamija." }
  },
  {
    // OSM way 447355423 (amenity=place_of_worship, denomination=sunni), way centre
    id: "dzamija-gornji-utris",
    cat: "culture",
    coords: [44.8328666, 16.6063769],
    name: { en: "Džamija Gornji Utriš", bs: "Džamija Gornji Utriš" },
    short: { en: "Mosque.", bs: "Džamija." }
  },
  {
    // OSM way 346183794 (amenity=place_of_worship, denomination=sunni), way centre
    id: "tominska-dzamija",
    cat: "culture",
    coords: [44.7027899, 16.7339197],
    name: { en: "Tominska džamija", bs: "Tominska džamija" },
    short: { en: "Mosque.", bs: "Džamija." }
  },
  {
    // OSM way 587635000 (amenity=place_of_worship), way centre
    id: "dzamija-gornje-hrustovo",
    cat: "culture",
    coords: [44.6650332, 16.7156496],
    name: { en: "Džamija Gornje Hrustovo", bs: "Džamija Gornje Hrustovo" },
    short: { en: "Mosque.", bs: "Džamija." }
  },
  {
    // OSM way 245559589 (historic=yes, tourism=yes, tomb=mausoleum, denomination=sunni), way centre
    id: "alijino-turbe",
    cat: "culture",
    coords: [44.8078421, 16.6670191],
    name: { en: "Alijino turbe", bs: "Alijino turbe" },
    short: { en: "A turbe (mausoleum).", bs: "Turbe." }
  },
  {
    // OSM way 346174697 (amenity=place_of_worship, denomination=serbian_orthodox), way centre
    id: "hram-petra-i-pavla",
    cat: "culture",
    coords: [44.7638367, 16.6679159],
    name: { en: "Hram Svetih apostola Petra i Pavla", bs: "Hram Svetih apostola Petra i Pavla" },
    short: { en: "Serbian Orthodox church.", bs: "Srpska pravoslavna crkva." }
  },
  {
    // OSM way 295993730 (amenity=place_of_worship, denomination=roman_catholic), way centre
    id: "crkva-uznesenja-bdm",
    cat: "culture",
    coords: [44.7689041, 16.6729232],
    name: { en: "Crkva Uznesenja Blažene Djevice Marije", bs: "Crkva Uznesenja Blažene Djevice Marije" },
    short: { en: "Catholic parish church.", bs: "Katolička župna crkva." }
  },
  {
    // OSM way 254466568 (amenity=place_of_worship, denomination=catholic), way centre
    id: "crkva-uznesenja-bdm-2",
    cat: "culture",
    coords: [44.7988543, 16.7384968],
    name: { en: "Crkva Uznesenja BDM", bs: "Crkva Uznesenja BDM" },
    short: { en: "Catholic church.", bs: "Katolička crkva." }
  },
  {
    // OSM way 393586321 (amenity=place_of_worship, denomination=orthodox), way centre
    id: "hram-vaznesenja",
    cat: "culture",
    coords: [44.7422154, 16.4200146],
    name: { en: "Hram Vaznesenja Gospodnjeg", bs: "Hram Vaznesenja Gospodnjeg" },
    short: { en: "Orthodox church.", bs: "Pravoslavna crkva." }
  },
  {
    // OSM way 447355421 (amenity=place_of_worship, denomination=orthodox), way centre
    id: "hram-uspenja-stari-majdan",
    cat: "culture",
    coords: [44.8281856, 16.6047495],
    name: { en: "Hram Uspenja Presvete Bogorodice", bs: "Hram Uspenja Presvete Bogorodice" },
    short: { en: "Orthodox church.", bs: "Pravoslavna crkva." }
  },
  {
    // OSM way 587634998 (amenity=place_of_worship, denomination=serbian_orthodox), way centre; OSM name "Crkva u Kljevcima -Sveti arhiđakon Stefan"
    id: "crkva-kljevci",
    cat: "culture",
    coords: [44.6997853, 16.6845494],
    name: { en: "Crkva Svetog arhiđakona Stefana, Kljevci", bs: "Crkva Svetog arhiđakona Stefana, Kljevci" },
    short: { en: "Serbian Orthodox church.", bs: "Srpska pravoslavna crkva." }
  },
  {
    // OSM way 1389398662 (amenity=place_of_worship, denomination=serbian_orthodox), way centre; OSM name in Cyrillic, "Црква Св. Ћирила и Методија"
    id: "crkva-cirila-i-metodija",
    cat: "culture",
    coords: [44.7187033, 16.7829855],
    name: { en: "Crkva Sv. Ćirila i Metodija", bs: "Crkva Sv. Ćirila i Metodija" },
    short: { en: "Serbian Orthodox church.", bs: "Srpska pravoslavna crkva." }
  },
  {
    // OSM node 2357053322 (amenity=library)
    id: "gradska-biblioteka",
    cat: "culture",
    coords: [44.7649187, 16.6681266],
    name: { en: "Gradska biblioteka", bs: "Gradska biblioteka" },
    short: { en: "Town library.", bs: "Gradska biblioteka." }
  },
  {
    // OSM way 1080915298 (historic=building), way centre; name:en in OSM
    id: "stara-zeljeznicka-stanica",
    cat: "history",
    coords: [44.7657002, 16.6719104],
    name: { en: "Old railway station", bs: "Stara željeznička stanica" },
    short: { en: "Old railway station building.", bs: "Zgrada stare željezničke stanice." }
  },
  {
    // OSM node 4414461537 (natural=spring); text: FACTS.md (Japra is one of the nine rivers)
    id: "izvor-japre",
    cat: "water",
    coords: [44.7773771, 16.4024586],
    name: { en: "Source of the Japra", bs: "Izvor Japre" },
    short: { en: "The source of the Japra, one of the nine rivers.", bs: "Izvor Japre, jedne od devet rijeka." }
  },
  {
    // OSM node 2181547841 (natural=spring)
    id: "dabarsko-vrelo",
    cat: "water",
    coords: [44.7095564, 16.6388084],
    name: { en: "Dabarsko vrelo", bs: "Dabarsko vrelo" },
    short: { en: "Spring.", bs: "Izvor." }
  },
  {
    // OSM node 5613064782 (natural=spring)
    id: "kljevacko-vrelo",
    cat: "water",
    coords: [44.67484, 16.6998833],
    name: { en: "Kljevačko vrelo", bs: "Kljevačko vrelo" },
    short: { en: "Spring.", bs: "Izvor." }
  },
  {
    // OSM node 5613163252 (natural=spring)
    id: "kljevak",
    cat: "water",
    coords: [44.7025279, 16.6966935],
    name: { en: "Kljevak", bs: "Kljevak" },
    short: { en: "Spring.", bs: "Izvor." }
  },
  {
    // OSM node 5613074293 (natural=spring)
    id: "crkveni-bunar",
    cat: "water",
    coords: [44.6974664, 16.6830871],
    name: { en: "Crkveni bunar", bs: "Crkveni bunar" },
    short: { en: "Spring.", bs: "Izvor." }
  },
  {
    // OSM node 7597493824 (natural=spring)
    id: "slatinsko-vrelo",
    cat: "water",
    coords: [44.8465491, 16.4790189],
    name: { en: "Slatinsko vrelo", bs: "Slatinsko vrelo" },
    short: { en: "Spring.", bs: "Izvor." }
  },
  {
    // OSM node 7636215190 (natural=spring)
    id: "dobra-voda",
    cat: "water",
    coords: [44.7239038, 16.3590988],
    name: { en: "Dobra voda", bs: "Dobra voda" },
    short: { en: "Spring.", bs: "Izvor." }
  },
  {
    // OSM node 7726346022 (natural=spring); drinking_water=yes
    id: "kamenica",
    cat: "water",
    coords: [44.6502489, 16.6587119],
    name: { en: "Kamenica", bs: "Kamenica" },
    short: { en: "Spring with drinking water.", bs: "Izvor pitke vode." }
  },
  {
    // OSM node 13241426555 (waterway=waterfall)
    id: "vodopad-mostisce",
    cat: "water",
    coords: [44.6609116, 16.727461],
    name: { en: "Mostišće Waterfall", bs: "Vodopad Mostišće" },
    short: { en: "Waterfall.", bs: "Vodopad." }
  },
  {
    // OSM node 4414474719 (natural=cave_entrance)
    id: "kerkezova-pecina",
    cat: "nature",
    coords: [44.7484428, 16.4088543],
    name: { en: "Kerkezova pećina", bs: "Kerkezova pećina" },
    short: { en: "Cave.", bs: "Pećina." }
  },
  {
    // OSM way 227924209 (leisure=park), way centre
    id: "sudski-park",
    cat: "nature",
    coords: [44.7642939, 16.668973],
    name: { en: "Sudski park", bs: "Sudski park" },
    short: { en: "Park.", bs: "Park." }
  },
  {
    // OSM way 40699110 (leisure=park), way centre
    id: "mali-park",
    cat: "nature",
    coords: [44.7648945, 16.6632473],
    name: { en: "Mali park", bs: "Mali park" },
    short: { en: "Park.", bs: "Park." }
  },
  {
    // OSM way 40699044 (leisure=park), way centre; approved by Meho 2026-10-24: name only
    id: "park-generala-alagica",
    cat: "nature",
    coords: [44.7653832, 16.6671918],
    name: { en: "Park generala Mehmeda Alagića", bs: "Park generala Mehmeda Alagića" },
    short: { en: "", bs: "" }
  },
  {
    // OSM way 459823166 (historic=memorial_site, leisure=park), way centre; M1, name:en in OSM
    id: "susnjar-memorijalni-kompleks",
    cat: "memorials",
    coords: [44.7622452, 16.6836748],
    name: { en: "Šušnjar Memorial Complex", bs: "Memorijalni kompleks Šušnjar" },
    short: { en: "Memorial complex.", bs: "Memorijalni kompleks." }
  },
  {
    // OSM node 4748626666 (historic=monument); M2, name:en, artist and start_date in OSM
    id: "spomenik-zrtvama-fasizma",
    cat: "memorials",
    coords: [44.7622845, 16.6839306],
    name: { en: "Monument to the Victims of Fascism and the Fighters of the National Liberation War", bs: "Spomenik žrtvama fašizma" },
    short: { en: "Monument by Petar Krstić, 1970.", bs: "Spomenik, rad Petra Krstića, 1970." }
  },
  {
    // OSM node 14219675362 (historic=memorial); M3
    id: "sehidsko-obiljezje-lijeva-obala",
    cat: "memorials",
    coords: [44.7617664, 16.665582],
    name: { en: "Šehidsko spomen obilježje Lijeva obala", bs: "Šehidsko spomen obilježje Lijeva obala" },
    short: { en: "War memorial.", bs: "Spomen-obilježje." }
  },
  {
    // OSM node 1420902067 (historic=memorial); M4, no name in OSM; named by Meho, the inscription is not quoted
    id: "spomen-ploca",
    cat: "memorials",
    coords: [44.7650347, 16.6678397],
    name: { en: "Memorial plaque", bs: "Spomen-ploča" },
    short: { en: "", bs: "" }
  },
  {
    // OSM node 14243684902 (historic=memorial); M5, no name in OSM; named by Meho, without the date
    id: "obiljezje-prvim-zrtvama",
    cat: "memorials",
    coords: [44.763364, 16.6581016],
    name: { en: "Memorial to the first victims", bs: "Spomen-obilježje prvim žrtvama" },
    short: { en: "War memorial.", bs: "Spomen-obilježje." }
  },
  {
    // OSM node 6685067489 (historic=memorial); M6
    id: "hrastova-glavica",
    cat: "memorials",
    coords: [44.8444547, 16.4852355],
    name: { en: "Hrastova glavica massacre", bs: "Masakr na Hrastovoj glavici" },
    short: { en: "Memorial at the Hrastova glavica pit.", bs: "Spomen-obilježje kod jame Hrastova glavica." }
  },
  {
    // OSM node 7636215266 (historic=memorial); M7
    id: "jama-zvecarka",
    cat: "memorials",
    coords: [44.7741394, 16.356426],
    name: { en: "Jama Zvečarka", bs: "Jama Zvečarka" },
    short: { en: "Memorial stele.", bs: "Spomen-stela." }
  },
  {
    // OSM node 7711478666 (historic=memorial); M8, year from the OSM inscription
    id: "cvijet-sjecanja-stari-majdan",
    cat: "memorials",
    coords: [44.828204, 16.6060079],
    name: { en: "Flower of Remembrance, Stari Majdan", bs: "Cvijet sjećanja Stari Majdan" },
    short: { en: "Memorial, 2017.", bs: "Spomen-obilježje, 2017." }
  },
  {
    // OSM way 600410602 (), way centre; M9
    id: "sehidsko-mezarje-vrhpolje-hrustovo",
    cat: "memorials",
    coords: [44.6852399, 16.7335559],
    name: { en: "Šehidsko mezarje Vrhpolje-Hrustovo", bs: "Šehidsko mezarje Vrhpolje-Hrustovo" },
    short: { en: "Cemetery.", bs: "Mezarje." }
  },
  {
    // OSM node 4409248503 (historic=monument); M10
    id: "spomenik-turskim-sehidima",
    cat: "memorials",
    coords: [44.7830848, 16.5694461],
    name: { en: "Spomenik turskim šehidima", bs: "Spomenik turskim šehidima" },
    short: { en: "Monument.", bs: "Spomenik." }
  },
  {
    // OSM node 7176728466 (historic=memorial); M11, approved for history; OSM name "Drevni kameni nišan", named after its inscription
    id: "nisan-mustafe-alagica",
    cat: "history",
    coords: [44.7791519, 16.6719786],
    name: { en: "Nišan Mustafe Alagića", bs: "Nišan Mustafe Alagića" },
    short: { en: "Stone gravestone (nišan).", bs: "Kameni nišan." }
  }
];
