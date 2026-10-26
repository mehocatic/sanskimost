// NEEDS REVIEW: machine-drafted Bosnian translation, not yet checked by a native speaker.
// Same keys as i18n/en.js. A key that is missing (or deleted) here shows the English text.
// `places` holds the place texts by slug (name, short, long, note, see); `see` is in the same order as in places.js.
// The texts written by Meho (Kamengrad, Musalla, Hamzibeg, Korčanica, Dabar, Bobijaško oko, Mulež, Grmeč, turbe, ZAVNOBiH)
// are Bosnian, condensed from his text; the English ones in en.js are translations for review.
window.I18N = window.I18N || {};
I18N.bs = {
  // menu
  'nav.label': 'Glavni meni',
  'nav.home': 'Početna',
  'nav.explore': 'Istraži',
  'nav.lang': 'Jezik',

  // home: head and hero
  'home.meta': 'Sanski Most, Bosna i Hercegovina: grad na devet rijeka, sa srednjovjekovnom tvrđavom, pećinama, Hamzibegovom džamijom s četiri munare i vodopadom Blihe.',
  'hero.caption': 'Vodopad Blihe',
  'hero.scroll': 'Skrolajte',
  'hero.outro': 'Sanski Most · Bosna i Hercegovina',

  // intro
  'intro.label': 'Uvod',
  'intro.text': 'Devet rijeka. Jedan grad.',
  'intro.sub': 'Sanski Most ima srednjovjekovnu tvrđavu, pećine, džamiju s četiri munare i vodopad visok oko 56 m.',

  // places carousel
  'places.eyebrow': 'Mjesta',
  'places.title.html': 'Sanski Most <br>i okolina',
  'card.more': 'Saznaj više',
  'card.aria': '{name}: saznaj više',
  'cursor.view': 'Pogledaj',

  // routes (routes.js)
  'routes.eyebrow': 'Prijedlozi',
  'routes.title': 'Rute',
  'routes.map': 'Vidi na karti',
  'routes.km': 'Oko {km} km od grada',
  'routes.conditions': 'Provjerite uslove prije polaska.',
  'route.half-day.name': 'Pola dana',
  'route.half-day.text': 'Srednjovjekovna tvrđava, musala ispod nje i džamija s četiri munare.',
  'route.water.name': 'Dan uz vodu',
  'route.water.text': 'Dvije kraške lokacije povezane istom vodom, pa vodopad.',
  'route.adventure.name': 'Avantura',
  'route.adventure.text': 'Osigurana penjačka staza na stijeni od 90 m i pećinski hodnik dug oko 500 m.',
  'route.grmec.name': 'Grmeč',
  'route.grmec.text': 'Prašuma i spomen-kompleks iz Drugog svjetskog rata na istoj planini.',
  'note.cave': 'Ponesite baterijsku lampu i nikad ne idite sami.',
  'note.ferrata': 'Za iskusne planinare; preporučuju se kaciga, pojas i sajle.',
  'note.bobijasko': 'Najbolje ga je vidjeti nakon otapanja snijega ili jakih kiša.',
  'note.cvjetna': 'Staza Cvjetna, duga oko 15 km, povezuje Kamengrad, vodopad i Jasice.',

  // history
  'history.eyebrow': 'Historija',
  'history.name.title': 'Kako je grad dobio ime',
  'history.name.html': 'Ime dolazi od rijeke Sane, od latinskog <em>sana</em> („zdrava“), kao u <em>Aqua Sana</em>. Godine 1717, u osmanskom periodu, utvrđeni grad spominje se kao <em>Džisr-i Sana</em> (<em>džisr</em> = most).',
  'history.centuries': 'Kroz stoljeća',
  'tl.1.yr': '6.–3. st. p. n. e.',
  'tl.1': 'Željeznodobno naselje s nekropolom od 176 grobova.',
  'tl.2': 'Prvi spomen Kamengrada; područje pripada župi Sana.',
  'tl.3': 'Osmanlije zauzimaju područje.',
  'tl.4.yr': '16. st.',
  'tl.4': 'Gradi se Hamzibegova džamija (prije 1557).',
  'tl.5': 'Austrougarska okupacija; Sanski Most postaje sjedište kotara.',
  'tl.6': 'Ovdje se održava drugo zasjedanje ZAVNOBiH-a.',
  // TODO(verify): check the 1992 entry with a local source before publishing.
  'tl.7': 'Nakon što Vojska Republike Srpske preuzme kontrolu nad općinom, nesrpski civili su ubijani i zatvarani u logore; oko 800 ubijenih stanovnika kasnije je pronađeno u više od 30 grobnica. Na mostu u Vrhpolju 31. maja ubijeno je 19 civila; 27. juna srušena je Hamzibegova džamija.',
  'tl.8': 'Armija RBiH ulazi u grad u operaciji Sana 95, 9. i 10. oktobra.',
  'tl.9': 'Hamzibegova džamija ponovo je otvorena nakon obnove.',

  // numbers
  'numbers.title': 'U brojkama',
  'num.1': 'Rijeka se sastaje u gradu i oko njega.',
  'num.2': 'Dužina rijeke Sane, koja se kod Novog Grada ulijeva u Unu.',
  'num.3': 'Visina vodopada Blihe.',
  'num.4': 'Munare Hamzibegove džamije, koja je, prema navodima, jedina džamija u Bosni i Hercegovini s četiri munare.',
  'num.5': 'Godina u kojoj se tvrđava Kamengrad prvi put spominje.',
  'num.6': 'Grobova u željeznodobnoj nekropoli iz 6.–3. stoljeća p. n. e.',

  // rivers
  'rivers.eyebrow': 'Devet rijeka',
  'rivers.title.html': 'Grad na<br>devet rijeka',
  'rivers.fact': 'Sana je duga oko 142 km i ulijeva se u Unu kod Novog Grada.',

  // footer
  'footer.country': 'Bosna i Hercegovina',
  'footer.top': 'Na vrh',

  // place page
  'place.meta': 'Mjesta u Sanskom Mostu i okolini, Bosna i Hercegovina.',
  'place.back': 'Sva mjesta',
  'place.see': 'Vrijedi vidjeti i',
  'place.others': 'Ostala mjesta',
  'place.prev': 'Prethodno mjesto',
  'place.next': 'Sljedeće mjesto',
  'place.notfound': 'Mjesto nije pronađeno',
  'place.notfound.text': 'Na ovoj adresi nema mjesta. Odaberite neko sa spiska.',
  'place.photo': '{name}: otvori fotografiju {i} od {n}',
  'lb.label': 'Pregled fotografija',
  'lb.close': 'Zatvori',
  'lb.close.aria': 'Zatvori fotografiju',
  'lb.prev': 'Prethodna fotografija',
  'lb.next': 'Sljedeća fotografija',
  'lb.photo': 'Fotografija',
  'lb.source': 'Izvor',

  // explore page
  'explore.doctitle': 'Istraži · Sanski Most',
  'explore.meta': 'Karta mjesta u Sanskom Mostu i okolini, Bosna i Hercegovina.',
  'explore.eyebrow': 'Istraži',
  'explore.title': 'Mjesta na karti',
  'explore.map': 'Karta mjesta oko Sanskog Mosta',
  'explore.view': 'Pogledaj mjesto →',
  'explore.filter': 'Filtriraj kartu po kategoriji',
  'explore.all': 'Sve',
  'explore.legend': 'Legenda',
  'explore.list': 'Na karti',
  'explore.route': 'Ruta: {name}',
  'explore.showAll': 'Prikaži sva mjesta',
  'explore.missing': 'Još nisu na karti: {names}.',
  'cat.nature': 'Priroda',
  'cat.water': 'Voda',
  'cat.history': 'Historija',
  'cat.culture': 'Kultura',
  'cat.camps': 'Logori',
  'cat.memorials': 'Spomenici',

  // optional river sound
  'sound.label': 'Zvuk rijeke',
  'sound.on': 'Uklj.',
  'sound.off': 'Isklj.',

  places: {
    'blihe': {
      name: 'Vodopad Blihe',
      short: 'Zaštićeni spomenik prirode gdje rijeka Bliha pada oko 56 m.',
      long: 'Vodopad Blihe, kod mještana poznat kao Blihin skok, nalazi se oko 14 km od Sanskog Mosta. Ovdje rijeka Bliha pada oko 56 m. Zaštićen je kao spomenik prirode.\n\nPlaninarska staza „Cvjetna“, duga oko 15 km, povezuje Kamengrad, vodopad i izletište Jasice.',
      see: []
    },
    'kamengrad': {
      name: 'Tvrđava Kamengrad',
      short: 'Srednjovjekovna tvrđava iznad Donjeg Kamengrada, prvi put spomenuta 1374. Nacionalni spomenik od 2008.',
      long: 'Kamengrad je srednjovjekovna tvrđava na strmom brdu iznad Donjeg Kamengrada. Prvi put se spominje 1374. Prije Osmanlija pripadao je knezovima Babonićima Blagajskim.\n\nIzvori navode različite datume kada su ga Osmanlije zauzele: 1463, oko jedanaest godina kasnije i 1498. Prema historičaru Hamdiji Kreševljakoviću, 1499. bio je u osmanskim rukama. Osmanlije su ga učinile sjedištem nahije u sastavu župe Sana, s posadom na čijem je čelu bio dizdar.\n\nPodno tvrđave Osmanlije su sagradile Donji Grad, koji stanovništvo zove Palanka, zaštićen visokim zidovima s palisadama. Ostaci kamenih zidova, visoki od pet do sedam metara, vidljivi su i danas, obrasli šumom.\n\nStari grad Kamengrad proglašen je nacionalnim spomenikom 2008.',
      note: 'Lokalna legenda kaže da su Osmanlije opsjedale tvrđavu jedanaest godina.',
      see: [
        'Fatihova musala, ispod tvrđave.',
        'Staza „Cvjetna“, koja povezuje Kamengrad, vodopad Blihe i izletište Jasice.'
      ]
    },
    'musalla': {
      name: 'Fatihova musala',
      short: 'Mjesto za molitvu na otvorenom iz osmanskog perioda, u Donjem Kamengradu; nacionalni spomenik od 2003.',
      long: 'Fatihova musala je mjesto za molitvu na otvorenom u Donjem Kamengradu. Prema narodnom kazivanju, sultan Mehmed Fatih je pri osvajanju Kamengrada ovdje klanjao džuma-namaz, a na tom mjestu je izgrađena musala; neki izvori je datiraju u 1463.\n\nRiječ je o prostoru opasanom zidom, s mihrabom, uzdignutim mjestom za hatiba i nadstrešnicom s drvenom kupolom na četiri drvena stuba.\n\nMusale ovog tipa postepeno su nestajale, najviše u doba austrougarske uprave. Ova je preživjela i nekoliko puta je obnavljana, između ostalog 1909, a posljednji put nakon rata.\n\nU kompleksu se nalazi mezarje koje se zove Musalla; jedan nišan ima natpis iz 1782. Musala je 2003. proglašena nacionalnim spomenikom.\n\nOvdje se održava godišnja manifestacija Musalla, a njen središnji dio je džuma-namaz prvog petka u julu.',
      note: 'Direktor manifestacije Mirsad Spahić navodi da je to jedina preostala musala iz tog perioda na cijelom Balkanu. To je njegova tvrdnja; jedan tekst je opisuje kao jednu od rijetkih koje su preživjele.',
      see: [
        'Tvrđava Kamengrad, iznad nje.'
      ]
    },
    'hamzibegova': {
      name: 'Hamzibegova džamija',
      short: 'Izgrađena prije 1557, srušena 1992. i ponovo otvorena 6. augusta 2000.',
      long: 'Hamza-begovu džamiju sagradio je i uvakufio sandžak-beg Hamza-beg Biharović, porijeklom iz okoline Sanskog Mosta, vjerovatno iz Kamengrada. Sagrađena je prije 1557, godine kada je umro njen osnivač, a pretpostavlja se da je postojala već 1555.\n\nPrvobitna džamija imala je jednu munaru, od kamena a s drvenom unutrašnjošću. Obnovljena je 1705. nakon ratnih oštećenja, a posljednja rekonstrukcija izvršena je 1984.\n\nSrušena je 27. juna 1992. Izgradnja nove džamije počela je u julu 1997, a otvorena je 6. augusta 2000.\n\nPrema navodima, to je jedina džamija u Bosni i Hercegovini s četiri munare. Komisija za očuvanje nacionalnih spomenika stavila ju je na privremenu listu nacionalnih spomenika Bosne i Hercegovine.',
      see: [
        'Mezarje uz džamiju, s nišanima iz otprilike 1751–52.',
        'Rafting na Sani može početi kod džamije.',
        'Gradski most preko Sane, noću osvijetljen LED rasvjetom.'
      ]
    },
    'korcanica': {
      name: 'Korčanica',
      short: 'Spomen-kompleks iz Drugog svjetskog rata na planini Grmeč, otvoren 1979.',
      long: 'Memorijalna zona Korčanica posvećena je Narodnooslobodilačkoj borbi u Drugom svjetskom ratu. Nalazi se oko 32 km od Sanskog Mosta, kod planine Grmeč, a obuhvata nekoliko objekata, među njima česmu i dvije grobnice.\n\nU ovom području su 1942. i 1943. djelovala partizanska bolnica sa 19 objekata.\n\nSpomenik „Revolucije“, rad vajara Ljubomira Denkovića, otvoren je 27. jula 1979. na mjestu spomen-obeliska. Čine ga dva velika polukružna zida, visoka oko 15 m, koji okružuju unutrašnji prostor s maketom terena i bolnice, te veliki refleksioni bazen ispred njih.\n\nPrije rata područje je bilo hortikulturno uređeno, a posjećivali su ga turisti i učenici. Od 1990-ih je zapušteno i uglavnom zaboravljeno.',
      see: [
        'Prašuma na Grmeču, oko 20 km od grada: više od 100 ha, sa stablima starijim od 500 godina.'
      ]
    },
    'hrustovacka': {
      name: 'Hrustovačka pećina',
      short: 'Praistorijsko sklonište s nalazima vučedolske kulture.',
      long: 'Hrustovačka pećina je praistorijsko sklonište s nalazima vučedolske kulture, lokalno nazvane „hrustovački tip“, koji su izloženi u Zemaljskom muzeju u Sarajevu.\n\nHodnik dug oko 500 m završava malim jezerom. Pećina je nacionalni spomenik od 2014, a u nekoliko ratova služila je kao skrovište.',
      note: 'Obilazak bez vodiča: ponesite baterijsku lampu i nikad ne idite sami.',
      see: [
        'Kraško vrelo rijeke Glibaje, odmah ispod ulaza, s mjestom za piknik.',
        'Dabarska pećina.'
      ]
    },
    'dabarska': {
      name: 'Dabarska pećina',
      short: 'Izvor rijeke Dabar, s jezerom u unutrašnjosti.',
      long: 'Dabarska pećina nalazi se na izvoru rijeke Dabar, koja teče oko sedam kilometara kroz kanjon i uliva se u Sanu. Ulaz u pećinu visok je dvadesetak metara.\n\nOko 200 m može se hodati bez opreme, do jezera; dalji prolaz moguć je samo čamcem i uz ronilačku opremu. Speleološka istraživanja pokazala su da se pećina račva u dva kanala, a najduži završava sifonskim jezerom.\n\nIstraživanja iz 2016. potvrdila su tri vrste pećinskih paukova, veći broj slijepih miševa i pećinske škampe vrste Troglocaris bosnica. U jednom od unutrašnjih jezera pronađena je čovječja ribica.\n\nGrnčarija i artefakti vučedolske kulture pokazuju da je pećina bila nastanjena u praistoriji. Izvor i pećina su zaštićeni spomenik prirode.',
      note: 'Unutra je i ljeti desetak stepeni hladnije nego vani.',
      see: [
        'Bobijaško oko, čija voda ovdje ponovo izbija na površinu.'
      ]
    },
    'bobijasko-oko': {
      name: 'Bobijaško oko',
      short: 'Vertikalna kraška jama koja odozgo izgleda kao oko.',
      long: 'Bobijaško oko je kraški fenomen podno planine Grmeč, kod Jelašinovaca, oko 20 km od Sanskog Mosta. Odozgo izgleda kao oko. Riječ je o jezeru povezanom s izvorima rijeka Dabar i Zdena.\n\nVoda se u njemu kreće dvosmjerno: pri obilnim padavinama ponaša se kao vrelo, a pri niskom vodostaju postaje ponor. Izgled mu se mijenja s nivoom vode, od dubokog plavog vira do jezera. Voda koja otječe čini potok Jezernicu, koji ponire i ponovo izbija kod Dabarske pećine.\n\nEngleski ronioci speleolozi pronašli su u njemu čovječju ribicu.\n\nPrema lokalnim legendama, vile i vilenjaci noću plešu po njemu, a ovca koja je upala u ponor navodno je nekoliko dana kasnije pronađena na obližnjem izvoru.',
      note: 'Najbolje ga je vidjeti nakon otapanja snijega ili jakih kiša. Kupanje je zabranjeno. Lokalitet nije prilagođen posjetama: put je loš, navigacija može uputiti na pogrešnu stranu, a posljednji dio je makadam, zatim parkiranje na livadi i hod od nekoliko minuta.',
      see: []
    },
    'mulez': {
      name: 'Mulež',
      short: 'Planina iznad kanjona Sane, s via ferratom duž stijene od 90 m.',
      long: 'Mulež je planina iznad kanjona Sane s planinarskim stazama, od lakših, pogodnih za porodice i početnike, do zahtjevnih uspona.\n\nVia ferrata (osigurana penjačka staza), otvorena od septembra 2024, vodi uz stijenu visoku 90 m, po sajlama i metalnim stepenicama. Izgradilo ju je planinarsko društvo SPD „Mulež“, a namijenjena je iskusnim planinarima.\n\nNovoizgrađeni viseći most dug 60 m spaja dvije stijene iznad dubokih provalija. Sa rute se vide kanjon rijeke Sane i sanska kotlina.\n\nU podnožju planine, na Ilidži, nalazi se sumporni izvor.',
      note: 'Za iskusne planinare. Preporučuju se kaciga, pojas i sajle; pratite sigurnosne oznake.',
      see: []
    },
    'grmec-forest': {
      name: 'Prašuma na Grmeču',
      short: 'Prašuma na više od 100 hektara, sa stablima starijim od 500 godina.',
      long: 'Prašuma Bobija nalazi se na Grmeču, u općini Sanski Most, oko 20 km od grada. Prostire se na više od 100 hektara i jedna je od najvećih u Bosni i Hercegovini.\n\nNajzastupljenija su stabla bukve i jele, bijelog i crnog bora, hrasta, javora, brijesta, jasena i smreke. Neka stabla starija su od 500 godina.\n\nU blizini se nalazi Bobijaško oko.',
      see: [
        'Korčanica, spomen-kompleks iz Drugog svjetskog rata kod planine Grmeč.',
        'Bobijaško oko, vertikalna kraška jama koja odozgo izgleda kao oko.'
      ]
    },
    'turbe-alagic': {
      name: 'Turbe generala Alagića',
      short: 'General Mehmed Alagić (1947–2003), komandant korpusa i prvi poslijeratni načelnik Sanskog Mosta.',
      long: 'Mehmed Alagić (rođen 8. jula 1947, umro 7. marta 2003) bio je general Armije Republike Bosne i Hercegovine i prvi poslijeratni načelnik Sanskog Mosta.\n\nPo izbijanju rata bio je u sastavu 17. krajiške brigade. Postao je komandant Operativne grupe Bosanska krajina, a nakratko i komandant 3. korpusa. Na njegovu inicijativu formiran je 7. korpus, kojim je komandovao i u kojem je unaprijeđen u čin generala.\n\nU noći sa 9. na 10. oktobar 1995. 7. korpus je zajedno s 5. korpusom, pod komandom Atifa Dudakovića, ušao u Sanski Most.\n\nGodišnjica njegove smrti obilježava se 7. marta.',
      see: []
    },
    'zavnobih': {
      name: 'ZAVNOBiH 1944',
      short: 'Drugo zasjedanje ZAVNOBiH-a održano je u Sanskom Mostu od 30. juna do 2. jula 1944.',
      long: 'Drugo zasjedanje ZAVNOBiH-a održano je u Sanskom Mostu od 30. juna do 2. jula 1944. Na njemu je proglašena ravnopravnost Srba, Muslimana (Bošnjaka) i Hrvata, te Bosna i Hercegovina kao država u okviru jugoslavenske federacije.\n\nDana 1. jula, u „Sokolskom domu“, donesena je deklaracija o pravima građana u Bosni i Hercegovini. Ona se nadovezala na zaključke prvog zasjedanja, održanog 25. novembra u Mrkonjić Gradu, a na osnovu tih zaključaka ustrojena je poslijeratna Socijalistička Republika Bosna i Hercegovina.\n\nZgrada u kojoj je zasjedanje održano srušena je. Projekt njene revitalizacije, kao nacionalnog spomenika, ugovoren je između Zavoda za zaštitu kulturnog naslijeđa Unsko-sanskog kantona i izvođača radova.',
      see: []
    }
  }
};
