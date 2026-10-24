// English texts, by key. i18n/bs.js uses the same keys; a key missing there shows the English text.
// Place names and descriptions are in places.js (English) and under `places` in i18n/bs.js.
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

  // optional river sound (sound.js, off by default)
  'sound.label': 'River sound',
  'sound.on': 'On',
  'sound.off': 'Off'
};
