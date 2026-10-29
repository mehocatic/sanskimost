// English texts, by key. i18n/bs.js uses the same keys; a key missing there shows the English text.
// Place texts are under `places` here and in i18n/bs.js (places.js only holds links, coordinates and photos).
// Keys ending in .html may contain markup (<br>, <em>).
window.I18N = window.I18N || {};
I18N.en = {
  // menu
  'nav.label': 'Main',
  'nav.home': 'Home',
  'nav.explore': 'Explore',
  'nav.lang': 'Language',

  // home: head and hero
  'home.meta': 'Sanski Most, Bosnia and Herzegovina: a town on nine rivers, with a medieval fortress, caves, the four-minaret Hamzibeg Mosque and Blihe Waterfall.',
  'hero.caption': 'Blihe Waterfall',
  'hero.scroll': 'Scroll',
  'hero.outro': 'Sanski Most · Bosnia and Herzegovina',

  // intro
  'intro.label': 'Introduction',
  'intro.text': 'Nine rivers. One town.',
  'intro.sub': 'Sanski Most has a medieval fortress, caves, a mosque with four minarets and a waterfall of about 56 m.',

  // places carousel
  'places.eyebrow': 'Places',
  'places.title.html': 'Around <br>Sanski Most',
  'card.more': 'Read more',
  'card.aria': '{name}: read more',
  'cursor.view': 'View',

  // routes (routes.js)
  'routes.eyebrow': 'Suggestions',
  'routes.title': 'Routes',
  'routes.map': 'View on map',
  'routes.km': 'About {km} km from town',
  'routes.conditions': 'Check conditions before you go.',
  'route.half-day.name': 'Half a day',
  'route.half-day.text': 'The medieval fortress, the musalla below it and the mosque with four minarets.',
  'route.water.name': 'A day by the water',
  'route.water.text': 'Two karst sites linked by the same water, then the waterfall.',
  'route.adventure.name': 'Adventure',
  'route.adventure.text': 'A secured climbing route on a 90 m rock wall and a cave passage of about 500 m.',
  'route.grmec.name': 'Grmeč',
  'route.grmec.text': 'The primeval forest and the WWII memorial complex on the same mountain.',
  'note.cave': 'Bring a torch and never go alone.',
  'note.ferrata': 'For experienced hikers; a helmet, harness and cables are recommended.',
  'note.bobijasko': 'Best after snowmelt or heavy rain.',
  'note.cvjetna': 'The Cvjetna trail, about 15 km, links Kamengrad, the waterfall and Jasice.',

  // history
  'history.eyebrow': 'History',
  'history.name.title': 'How the town got its name',
  'history.name.html': 'The name comes from the river Sana, from the Latin <em>sana</em> (“healthy”), as in <em>Aqua Sana</em>. In 1717, in the Ottoman period, the fortress town is mentioned as <em>Džisr-i Sana</em> (<em>džisr</em> = bridge).',
  'history.centuries': 'Through the centuries',
  'tl.1.yr': '6th–3rd c. BC',
  'tl.1': 'An Iron Age settlement with a necropolis of 176 graves.',
  'tl.2': 'Kamengrad is first mentioned; the area belongs to the Sana county (župa).',
  'tl.3': 'The Ottomans take the area.',
  'tl.4.yr': '16th c.',
  'tl.4': 'The Hamzibeg Mosque is built (before 1557).',
  'tl.5': 'Austro-Hungarian occupation; Sanski Most becomes a district seat.',
  'tl.6': 'The second session of ZAVNOBiH is held here.',
  // TODO(verify): check the 1992 entry with a local source before publishing.
  'tl.7': 'After the Army of Republika Srpska takes control of the municipality, non-Serb civilians are killed and held in camps; about 800 killed residents are later found in more than 30 graves. On 31 May, 19 civilians are killed on the Vrhpolje bridge; on 27 June the Hamzibeg Mosque is demolished.',
  'tl.8': 'The Bosnian Army enters the town in Operation Sana 95, on 9–10 October.',
  'tl.9': 'The Hamzibeg Mosque reopens after reconstruction.',

  // numbers
  'numbers.title': 'In numbers',
  'num.1': 'Rivers meet in and around the town.',
  'num.2': 'The length of the Sana river, which flows into the Una at Novi Grad.',
  'num.3': 'The drop of the Blihe waterfall.',
  'num.4': 'Minarets on the Hamzibeg Mosque, reportedly the only mosque in Bosnia and Herzegovina with four.',
  'num.5': 'The year Kamengrad fortress is first mentioned.',
  'num.6': 'Graves in an Iron Age necropolis from the 6th–3rd century BC.',

  // rivers (river names are the same in both languages and stay in the HTML)
  'rivers.eyebrow': 'Nine rivers',
  'rivers.title.html': 'The town on<br>nine rivers',
  'rivers.fact': 'The Sana is about 142 km long and flows into the Una at Novi Grad.',

  // footer
  'footer.country': 'Bosnia and Herzegovina',
  'footer.top': 'Back to top',

  // place page
  'place.meta': 'Places around Sanski Most, Bosnia and Herzegovina.',
  'place.back': 'All places',
  'place.see': 'Also worth seeing',
  'place.others': 'Other places',
  'place.prev': 'Previous place',
  'place.next': 'Next place',
  'place.notfound': 'Place not found',
  'place.notfound.text': 'There is no place with this address. Choose one from the list.',
  'place.photo': '{name}: open photo {i} of {n}',
  'lb.label': 'Photo viewer',
  'lb.close': 'Close',
  'lb.close.aria': 'Close photo',
  'lb.prev': 'Previous photo',
  'lb.next': 'Next photo',
  'lb.photo': 'Photo',
  'lb.source': 'Source',

  // explore page
  'explore.doctitle': 'Explore · Sanski Most',
  'explore.meta': 'Map of the places around Sanski Most, Bosnia and Herzegovina.',
  'explore.eyebrow': 'Explore',
  'explore.title': 'Places on the map',
  'explore.map': 'Map of places around Sanski Most',
  'explore.view': 'View place →',
  'explore.filter': 'Filter the map by category',
  'explore.all': 'All',
  'explore.legend': 'Legend',
  'explore.list': 'On the map',
  'explore.route': 'Route: {name}',
  'explore.showAll': 'Show all places',
  'explore.missing': 'Not on the map yet: {names}.',
  'cat.nature': 'Nature',
  'cat.water': 'Water',
  'cat.history': 'History',
  'cat.culture': 'Culture',
  'cat.camps': 'Camps',
  'cat.memorials': 'Memorials',

  // 404 page (its buttons use nav.home and nav.explore)
  'notfound.doctitle': 'Page not found · Sanski Most',
  'notfound.title': 'Page not found.',
  'notfound.text': 'Check the address or go back to the home page.',

  // optional river sound (sound.js, off by default)
  'sound.label': 'River sound',
  'sound.on': 'On',
  'sound.off': 'Off',

  // place texts by slug (same keys as in bs.js)
  places: {
    'blihe': {
      name: 'Blihe Waterfall',
      short: 'A protected natural monument where the Bliha river drops about 56 m.',
      long: 'Blihe Waterfall, known locally as Blihin skok, lies about 14 km from Sanski Most. Here the Bliha river drops about 56 m. It is a protected natural monument.\n\nThe “Cvjetna” hiking trail, about 15 km long, links Kamengrad, the waterfall and the Jasice recreation area.',
      see: []
    },
    'kamengrad': {
      name: 'Kamengrad Fortress',
      short: 'A medieval fortress above Donji Kamengrad, first mentioned in 1374. A national monument since 2008.',
      long: 'Kamengrad is a medieval fortress on a steep hill above Donji Kamengrad. It is first mentioned in 1374. Before the Ottomans it belonged to the Babonić Blagajski princes.\n\nSources give different dates for when the Ottomans took it: 1463, about eleven years later, and 1498. According to the historian Hamdija Kreševljaković, it was in Ottoman hands in 1499. The Ottomans made it the seat of a nahija within the Sana county (župa), with a garrison under a dizdar.\n\nBelow the fortress the Ottomans built a lower town, Donji Grad, known locally as Palanka, protected by high walls with palisades. Stone walls five to seven metres high are still visible, overgrown by forest.\n\nThe old town of Kamengrad was declared a national monument in 2008.',
      note: 'Local legend says the Ottomans besieged the fortress for eleven years.',
      see: [
        'Fatih’s Musalla, below the fortress.',
        'The “Cvjetna” trail, which links Kamengrad, Blihe Waterfall and the Jasice recreation area.'
      ]
    },
    'musalla': {
      name: 'Fatih’s Musalla',
      short: 'An Ottoman-era open-air prayer place in Donji Kamengrad, a national monument since 2003.',
      long: 'Fatih’s Musalla is an open-air prayer place in Donji Kamengrad. According to local tradition, Sultan Mehmed Fatih performed the Friday prayer here when Kamengrad was taken, and the musalla was built on that spot; some sources date it to 1463.\n\nIt is a space enclosed by a wall, with a mihrab, a raised place for the preacher (hatib) and a canopy with a wooden dome on four wooden pillars.\n\nMusallas of this type disappeared gradually, mostly under Austro-Hungarian rule. This one survived and was renovated several times, among others in 1909 and most recently after the last war.\n\nA cemetery called Musalla lies in the same complex; one of its gravestones is dated 1782. The musalla was declared a national monument in 2003.\n\nThe annual event Musalla is held here, and its central part is the Friday prayer on the first Friday of July.',
      note: 'The director of the event, Mirsad Spahić, says it is the only musalla from that period left in the whole of the Balkans. This is his claim; another text calls it one of the few that survived.',
      see: [
        'Kamengrad Fortress, above it.'
      ]
    },
    'hamzibegova': {
      name: 'Hamzibeg Mosque',
      short: 'Built before 1557, destroyed in 1992 and reopened on 6 August 2000.',
      long: 'The Hamzibeg Mosque was built and endowed (as a vakuf) by the sanjak-bey Hamza-beg Biharović, who came from the area of Sanski Most, probably from Kamengrad. It was built before 1557, the year its founder died, and is assumed to have existed in 1555.\n\nThe original building had one minaret, of stone with a wooden interior. The mosque was rebuilt in 1705 after war damage and last reconstructed in 1984.\n\nIt was destroyed on 27 June 1992. Construction of the new mosque began in July 1997, and it was opened on 6 August 2000.\n\nIt is reportedly the only mosque in Bosnia and Herzegovina with four minarets. The Commission to Preserve National Monuments has put it on the provisional list of national monuments of Bosnia and Herzegovina.',
      see: [
        'The adjoining Muslim cemetery, with gravestones from about 1751–52.',
        'Rafting on the Sana can start near the mosque.',
        'The city bridge over the Sana, lit at night by LED lights.'
      ]
    },
    'korcanica': {
      name: 'Korčanica',
      short: 'A WWII memorial complex at Grmeč mountain, opened in 1979.',
      long: 'The Korčanica memorial zone is dedicated to the National Liberation Struggle in the Second World War. It lies about 32 km from Sanski Most, at Grmeč mountain, and includes several structures, among them a fountain and two tombs.\n\nIn 1942 and 1943 a Partisan hospital with 19 buildings operated in this area.\n\nThe monument “Revolution”, by the sculptor Ljubomir Denković, was opened on 27 July 1979, on the site of the memorial obelisk. It consists of two large semicircular walls, about 15 m high, that enclose an inner space with a model of the terrain and the hospital, and a large reflecting pool in front of them.\n\nBefore the war the site was landscaped and visited by tourists and school groups. Since the 1990s it has been neglected and is largely forgotten.',
      see: [
        'The Grmeč primeval forest, about 17 km from the town: over 100 ha, with trees over 500 years old.'
      ]
    },
    'hrustovacka': {
      name: 'Hrustovačka Cave',
      short: 'A prehistoric shelter with finds of the Vučedol culture.',
      long: 'Hrustovačka Cave is a prehistoric shelter with finds of the Vučedol culture, locally called the “Hrustovo type”, which are exhibited in the National Museum in Sarajevo.\n\nA passage of about 500 m ends in a small lake. The cave has been a national monument since 2014 and was used as a hideout in several wars.',
      note: 'Self-guided: bring a torch and never go alone.',
      see: [
        'The karst spring of the Glibaje river, just below the entrance, with a picnic area.',
        'Dabar Cave.'
      ]
    },
    'dabarska': {
      name: 'Dabar Cave',
      short: 'The source of the Dabar river, with a lake inside.',
      long: 'Dabar Cave lies at the source of the Dabar river, which flows for about seven kilometres through a canyon and joins the Sana. The entrance is about twenty metres high.\n\nAbout 200 m can be walked without equipment, up to a lake; beyond it the passage can be followed only by boat and with diving equipment. Speleological research found that the cave divides into two channels, and the longest ends in a siphon lake.\n\nResearch in 2016 confirmed three species of cave spiders, a number of bats and the cave shrimp Troglocaris bosnica. An olm, the “human fish”, has been found in one of the inner lakes.\n\nPottery and artefacts of the Vučedol culture show that the cave was inhabited in prehistoric times. The spring and the cave are a protected natural monument.',
      note: 'Inside it is about ten degrees cooler than outside, even in summer.',
      see: [
        'Bobijaško Oko, whose outflow reappears here.'
      ]
    },
    'bobijasko-oko': {
      name: 'Bobijaško Oko',
      short: 'A vertical karst shaft that looks like an eye from above.',
      long: 'Bobijaško Oko is a karst feature at the foot of Grmeč mountain, near Jelašinovci, about 20 km from Sanski Most. Seen from above it looks like an eye. It is a lake connected with the sources of the Dabar and Zdena rivers.\n\nThe water moves in both directions: after heavy rain it behaves like a spring, and at low water it becomes a sinkhole. Its look changes with the water level, from a deep blue pool to a lake. The outflow forms the Jezernica brook, which sinks and reappears at Dabar Cave.\n\nEnglish cave divers found an olm, the “human fish”, in it.\n\nLocal legends tell of fairies and elves who dance on it at night, and of a sheep that fell into the sinkhole and was said to have been found days later at a nearby spring.',
      note: 'Best seen after snowmelt or heavy rain. Swimming is forbidden. The site is not adapted for visitors: the road is poor, navigation may send you the wrong way, and the last part is a gravel road, then parking on a meadow and a walk of a few minutes.',
      see: []
    },
    'mulez': {
      name: 'Mulež',
      short: 'A mountain above the Sana canyon, with a via ferrata along a 90 m rock wall.',
      long: 'Mulež is a mountain above the Sana canyon, with hiking trails from easy ones, suitable for families and beginners, to demanding climbs.\n\nThe via ferrata (a secured climbing route), open since September 2024, runs up a 90 m rock wall on cables and metal steps. It was built by the mountaineering society SPD “Mulež” and is meant for experienced hikers.\n\nA newly built suspension bridge, 60 m long, links two rock faces above deep gorges. From the route there are views of the Sana canyon and the Sana basin.\n\nA sulphur spring at Ilidža lies at the foot of the mountain.',
      note: 'For experienced hikers. A helmet, harness and cables are recommended; follow the safety signs.',
      see: []
    },
    'grmec-forest': {
      name: 'Grmeč Forest',
      short: 'A primeval forest of over 100 hectares, with trees over 500 years old.',
      long: 'The primeval forest Bobija lies on Grmeč, in the municipality of Sanski Most, about 17 km from the town. It covers more than 100 hectares.\n\nThe most common trees are beech and fir, white and black pine, oak, maple, elm, ash and spruce. Some trees are more than 500 years old.\n\nThe karst feature Bobijaško Oko lies nearby.',
      see: [
        'Korčanica, a WWII memorial complex at Grmeč mountain.',
        'Bobijaško Oko, a vertical karst shaft that looks like an eye from above.'
      ]
    },
    'turbe-alagic': {
      name: 'Turbe Generala Alagića',
      short: 'General Mehmed Alagić (1947–2003), corps commander and the first post-war mayor of Sanski Most.',
      long: 'Mehmed Alagić (born 8 July 1947, died 7 March 2003) was a general of the Army of the Republic of Bosnia and Herzegovina and the first post-war mayor of Sanski Most.\n\nWhen the war began he was in the 17th Krajina Brigade. He became commander of the Operational Group Bosanska Krajina and, for a short time, commander of the 3rd Corps. The 7th Corps was formed on his initiative; he commanded it and was promoted to general.\n\nOn the night of 9 to 10 October 1995 the 7th Corps entered Sanski Most together with the 5th Corps, under Atif Dudaković.\n\nThe anniversary of his death is marked on 7 March.',
      see: []
    },
    'zavnobih': {
      name: 'ZAVNOBiH 1944',
      short: 'The second session of ZAVNOBiH was held in Sanski Most, 30 June – 2 July 1944.',
      long: 'The second session of ZAVNOBiH was held in Sanski Most from 30 June to 2 July 1944. It declared the equality of Serbs, Muslims (Bosniaks) and Croats, and Bosnia and Herzegovina as a state within the Yugoslav federation.\n\nOn 1 July, in the “Sokolski dom”, the session adopted a declaration on the rights of citizens in Bosnia and Herzegovina. It built on the conclusions of the first session, held on 25 November in Mrkonjić Grad, and the post-war Socialist Republic of Bosnia and Herzegovina was organised on the basis of those conclusions.\n\nThe building in which the session was held was demolished. A project to revitalise it, as a national monument, has been contracted between the Institute for the Protection of Cultural Heritage of Una-Sana Canton and a contractor.',
      see: []
    }
  }
};
