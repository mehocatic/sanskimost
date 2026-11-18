// People of Sanski Most (licnosti.html). Every entry rests on the source named in `src`.
// kind: 'born' = born in Sanski Most (or its villages); 'origin' = family roots in Sanski Most, born elsewhere.
// Rules: no ethnicity, no private details, no photos of people. Ranges use "do" (no dashes).
// TODO(verify): Budimir (current role), Pantelic (birthplace, from one article), Alagic (from Meho's notes, see FACTS.md).
window.LICNOSTI_CATS = [
  { id: 'sport', bs: 'Sport', en: 'Sport' },
  { id: 'politika', bs: 'Politika', en: 'Politics' },
  { id: 'nauka', bs: 'Nauka i književnost', en: 'Science and literature' },
  { id: 'muzika', bs: 'Muzika', en: 'Music' },
  { id: 'rat', bs: 'Rat i odbrana', en: 'War and defence' },
  { id: 'kultura', bs: 'Umjetnost i mediji', en: 'Art and media' },
  { id: 'zdravstvo', bs: 'Zdravstvo', en: 'Health' }
];

window.LICNOSTI = [
  { id: 'vukic', cat: 'sport', kind: 'born', name: 'Milan Vukić',
    role: { bs: 'Šahovski velemajstor', en: 'Chess grandmaster' },
    text: {
      bs: 'Rođen u Sanskom Mostu 19. augusta 1942. Titulu velemajstora dobio je 1975. godine. Dugo je igrao za sarajevski Željezničar, a opisuju ga kao vjerovatno najboljeg blic igrača na Balkanu. Prvak Bosne i Hercegovine bio je 2005.',
      en: 'Born in Sanski Most on 19 August 1942. He became a grandmaster in 1975 and played for years for Željezničar of Sarajevo. He is described as probably the best blitz player in the Balkans, and was Bosnian champion in 2005.' },
    src: { label: 'Chessgames', url: 'https://www.chessgames.com/perl/chessplayer?pid=14954' } },

  { id: 'zoric', cat: 'sport', kind: 'born', name: 'Milenko Zorić',
    role: { bs: 'Kajakaš', en: 'Canoeist' },
    text: {
      bs: 'Rođen u Sanskom Mostu 2. aprila 1989. Za Srbiju je u Riju 2016. osvojio srebrnu olimpijsku medalju u disciplini K-2 1000 m, u dvosjedu s Markom Tomićevićem. Na olimpijskim igrama nastupao je i 2012.',
      en: 'Born in Sanski Most on 2 April 1989. Racing for Serbia, he won Olympic silver in the K-2 1000 m in Rio 2016, paired with Marko Tomićević. He also competed at the 2012 Games.' },
    src: { label: 'Olympedia', url: 'https://www.olympedia.org/athletes/122421' } },

  { id: 'milka', cat: 'sport', kind: 'born', name: 'Milka Milinković',
    role: { bs: 'Paraolimpijka', en: 'Paralympic athlete' },
    text: {
      bs: 'Rođena 7. aprila 1955. u Dabru kod Sanskog Mosta, umrla 11. juna 2017. u Rijeci. Takmičila se u bacanju koplja i kugle. Postala je najuspješnija hrvatska paraolimpijka: osam medalja na deset paraolimpijskih igara.',
      en: 'Born on 7 April 1955 in Dabar near Sanski Most, died on 11 June 2017 in Rijeka. She competed in javelin and shot put and became Croatia\'s most successful Paralympian, with eight medals at ten Games.' },
    src: { label: 'Paralympic.org', url: 'https://www.paralympic.org/news/milka-milinkovic-dies-62' } },

  { id: 'nikola', cat: 'sport', kind: 'born', name: 'Nikola Milinković',
    role: { bs: 'Fudbaler', en: 'Footballer' },
    text: {
      bs: 'Rođen u Sanskom Mostu 19. marta 1968, karijeru je počeo u Radničkom iz Zdene. Otac je fudbalera Sergeja i Vanje Milinković-Savić, reprezentativaca Srbije.',
      en: 'Born in Sanski Most on 19 March 1968, he started out at Radnički Zdena. He is the father of the Serbia internationals Sergej and Vanja Milinković-Savić.' },
    src: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Nikola_Milinkovi%C4%87' } },

  { id: 'pantelic', cat: 'sport', kind: 'born', name: 'Ilija Pantelić',
    role: { bs: 'Golman', en: 'Goalkeeper' },
    text: {
      bs: 'Rođen u Kozici na Grmeču. Branio je za reprezentaciju Jugoslavije i klubove Vojvodinu, Bastiu, Paris Saint-Germain i Olympique iz Marseillea.',
      en: 'Born in Kozica on Grmeč. He kept goal for Yugoslavia and for Vojvodina, Bastia, Paris Saint-Germain and Olympique Marseille.' },
    src: { label: 'Mondo.ba', url: 'https://mondo.ba/Sport/Fudbal/a1119416/Fudbaleri-porijeklom-iz-Sanskog-Mosta.html' } },

  { id: 'handanovic', cat: 'sport', kind: 'origin', name: 'Samir Handanović',
    role: { bs: 'Golman', en: 'Goalkeeper' },
    text: {
      bs: 'Porijeklom iz sela Hrustovo, petnaestak kilometara od Sanskog Mosta. Reprezentativac Slovenije i dugogodišnji golman milanskog Intera.',
      en: 'His family comes from the village of Hrustovo, about 15 km from Sanski Most. A Slovenia international and for many years the goalkeeper of Inter Milan.' },
    src: { label: 'Mondo.ba', url: 'https://mondo.ba/Sport/Fudbal/a1119416/Fudbaleri-porijeklom-iz-Sanskog-Mosta.html' } },

  { id: 'seferovic', cat: 'sport', kind: 'origin', name: 'Haris Seferović',
    role: { bs: 'Fudbaler', en: 'Footballer' },
    text: {
      bs: 'Porijeklom iz Hrustova. Porodica se krajem osamdesetih preselila u Švicarsku, za čiju reprezentaciju igra. Nastupao je za Grasshoppers, Fiorentinu, Real Sociedad, Eintracht iz Frankfurta i Benficu.',
      en: 'His family comes from Hrustovo and moved to Switzerland in the late 1980s. He plays for the Swiss national team and has played for Grasshoppers, Fiorentina, Real Sociedad, Eintracht Frankfurt and Benfica.' },
    src: { label: 'InMedia', url: 'https://www.inmedia.ba/fudbaleri-porijeklom-iz-sanskog-mosta-od-bilbije-preko-handanovica-do-brace-milinkovic-savic-i-seferovica/' } },

  { id: 'ilicic', cat: 'sport', kind: 'origin', name: 'Josip Iličić',
    role: { bs: 'Fudbaler', en: 'Footballer' },
    text: {
      bs: 'Rođen u Prijedoru, porijeklom iz sela Škrljevita kod Sanskog Mosta, gdje je sahranjen njegov otac. Reprezentativac Slovenije, igrao je za Fiorentinu i Atalantu.',
      en: 'Born in Prijedor, with family roots in the village of Škrljevita near Sanski Most. A Slovenia international who played for Fiorentina and Atalanta.' },
    src: { label: 'InMedia', url: 'https://www.inmedia.ba/nogometas-fiorentine-josip-ilicic-porijeklom-iz-sanskog-mosta/' } },

  { id: 'ibricic', cat: 'sport', kind: 'origin', name: 'Senijad Ibričić',
    role: { bs: 'Fudbaler', en: 'Footballer' },
    text: {
      bs: 'Rođen u Kotor Varošu, a prve fudbalske korake napravio je u sanskom FK Podgrmeč. Igrao je za reprezentaciju Bosne i Hercegovine te za Zagreb, Hajduk i Domžale.',
      en: 'Born in Kotor Varoš, he took his first football steps at FK Podgrmeč in Sanski Most. He played for Bosnia and Herzegovina and for Zagreb, Hajduk and Domžale.' },
    src: { label: 'Mondo.ba', url: 'https://mondo.ba/Sport/Fudbal/a1119416/Fudbaleri-porijeklom-iz-Sanskog-Mosta.html' } },

  { id: 'burnic', cat: 'sport', kind: 'origin', name: 'Dženis Burnić',
    role: { bs: 'Fudbaler', en: 'Footballer' },
    text: {
      bs: 'Rođen u Hammu u Njemačkoj, otac mu je iz Sanskog Mosta. Nastupio je za Bosnu i Hercegovinu na Svjetskom prvenstvu 2026. U julu iste godine dočekan je na gradskom Trgu u okviru manifestacije Ljeto na Sani.',
      en: 'Born in Hamm, Germany, his father is from Sanski Most. He played for Bosnia and Herzegovina at the 2026 World Cup and in July that year was welcomed on the town square during Ljeto na Sani.' },
    src: { label: 'RTV USK', url: 'https://www.rtvusk.ba/clanak/ljeto-na-sani-dzenisu-burnicu-prireden-nezaboravan-docek-u-sanskom-mostu/16581' } },

  { id: 'alagic', cat: 'rat', kind: 'born', name: 'Mehmed Alagić',
    role: { bs: 'General Armije RBiH', en: 'General of the ARBiH' },
    text: {
      bs: 'Rođen 8. jula 1947. u Fajtovcima, umro 7. marta 2003. u Sanskom Mostu. Komandant korpusa u Armiji RBiH. Sa snagama 5. korpusa ušao je u Sanski Most 9. i 10. oktobra 1995, a poslije rata bio je prvi načelnik općine. Sahranjen je na haremu džamije u Fajtovcima.',
      en: 'Born on 8 July 1947 in Fajtovci, died on 7 March 2003 in Sanski Most. A corps commander in the ARBiH. He entered Sanski Most with the 5th Corps on 9 and 10 October 1995 and after the war was the first mayor. He is buried in the grounds of the Fajtovci mosque.' },
    src: { label: 'Mehmed Alagić', url: 'place?slug=turbe-alagic', internal: true } },

  { id: 'ibrisagic', cat: 'politika', kind: 'born', name: 'Anna Ibrisagic',
    role: { bs: 'Političarka u Švedskoj', en: 'Swedish politician' },
    text: {
      bs: 'Rođena u Sanskom Mostu 23. maja 1967. Članica Moderatne stranke (Moderaterna). U švedskom parlamentu bila je od 2002. do 2004, a u Evropskom parlamentu od 2004. do 2014.',
      en: 'Born in Sanski Most on 23 May 1967. A member of the Moderate Party. She sat in the Swedish parliament from 2002 to 2004 and in the European Parliament from 2004 to 2014.' },
    src: { label: 'Riksdagen', url: 'https://www.riksdagen.se/en/members-and-parties/member/anna-ibrisagic_9e76df5e-9ed0-4504-99bd-b54ea205d5e8/' } },

  { id: 'halimovic', cat: 'politika', kind: 'born', name: 'Sanjin Halimović',
    role: { bs: 'Političar, doktor veterinarskih nauka', en: 'Politician, doctor of veterinary science' },
    text: {
      bs: 'Rođen u Sanskom Mostu 31. maja 1969. Bio je načelnik općine od 2004. do 2011, federalni ministar razvoja, poduzetništva i obrta od 2011. do 2015, a zatim stalni predstavnik Bosne i Hercegovine pri Ujedinjenim nacijama u Beču.',
      en: 'Born in Sanski Most on 31 May 1969. He was mayor from 2004 to 2011, Federation minister of development, entrepreneurship and crafts from 2011 to 2015, and then Bosnia and Herzegovina\'s permanent representative to the UN in Vienna.' },
    src: { label: 'UN Vienna', url: 'https://unis.unvienna.org/unis/en/pressrels/2015/unisbio1087.html' } },

  { id: 'budimir', cat: 'politika', kind: 'born', name: 'Željko Budimir',
    role: { bs: 'Pravnik, ministar u Vladi RS', en: 'Lawyer, minister in the RS government' },
    text: {
      bs: 'Rođen u Sanskom Mostu 1977. Diplomirao je na Pravnom fakultetu u Banjoj Luci. Obavljao je ministarske dužnosti u Vladi Republike Srpske.',
      en: 'Born in Sanski Most in 1977. He graduated from the Faculty of Law in Banja Luka and has held ministerial posts in the government of Republika Srpska.' },
    src: { label: 'MUP RS', url: 'https://mup.vladars.rs/eng/ministarstvo/ministar' } },

  { id: 'redzic', cat: 'nauka', kind: 'born', name: 'Enver Redžić',
    role: { bs: 'Historičar, akademik', en: 'Historian, academician' },
    text: {
      bs: 'Rođen 4. maja 1915. u Starom Majdanu kod Sanskog Mosta, umro 4. novembra 2009. u Sarajevu. Historičar i profesor, osnivač izdavačke kuće Svjetlost. U Drugom svjetskom ratu bio je član ZAVNOBiH-a i AVNOJ-a.',
      en: 'Born on 4 May 1915 in Stari Majdan near Sanski Most, died on 4 November 2009 in Sarajevo. A historian and professor and the founder of the publishing house Svjetlost. In the Second World War he was a member of ZAVNOBiH and AVNOJ.' },
    src: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Enver_Red%C5%BEi%C4%87' } },

  { id: 'talic', cat: 'nauka', kind: 'born', name: 'Amir Talić',
    role: { bs: 'Pisac i novinar', en: 'Writer and journalist' },
    text: {
      bs: 'Rođen u Sanskom Mostu 1953. Piše poeziju i prozu za djecu i odrasle i bavi se književnom kritikom. Član je Društva pisaca Bosne i Hercegovine, a njegova djela prevođena su na više jezika, među njima slovenski, njemački, švedski, francuski, ruski, engleski i albanski.',
      en: 'Born in Sanski Most in 1953. He writes poetry and prose for children and adults and works as a literary critic. A member of the Writers\' Society of Bosnia and Herzegovina, his work has been translated into several languages, among them Slovenian, German, Swedish, French, Russian, English and Albanian.' },
    src: { label: 'Dnevni avaz', url: 'https://avaz.ba/vijesti/bih/898235/rasim-delic-14-godisnjica-smrti-generala-armije-rbih' } },

  { id: 'kljucanin', cat: 'nauka', kind: 'born', name: 'Zilhad Ključanin',
    role: { bs: 'Pjesnik i prozaist', en: 'Poet and prose writer' },
    text: {
      bs: 'Rođen 1960. u Trnovi kod Sanskog Mosta. Studirao je filozofiju i sociologiju u Sarajevu i književnost u Zagrebu. Piše poeziju, prozu i drame, a dobitnik je nagrade Max Dizdar (1983. i 1985).',
      en: 'Born in 1960 in Trnova near Sanski Most. He studied philosophy and sociology in Sarajevo and literature in Zagreb. He writes poetry, prose and plays and won the Max Dizdar award in 1983 and 1985.' },
    src: { label: 'Traduki', url: 'https://database.traduki.eu/?p=6481' } },

  { id: 'sansky', cat: 'nauka', kind: 'born', name: 'Dinko Husadžić Sansky',
    role: { bs: 'Književnik i jazz kritičar', en: 'Writer and jazz critic' },
    text: {
      bs: 'Rođen u Sanskom Mostu 1965, gdje je završio osnovnu i srednju školu. Piše romane i jazz kritiku, a kao profesor hrvatskog jezika i književnosti radi u Velikoj Ludini.',
      en: 'Born in Sanski Most in 1965, where he finished primary and secondary school. He writes novels and jazz criticism and teaches Croatian language and literature in Velika Ludina.' },
    src: { label: 'Wikipedia (hr)', url: 'https://hr.wikipedia.org/wiki/Dinko_Husad%C5%BEi%C4%87_Sansky' } },

  { id: 'malovcic', cat: 'muzika', kind: 'born', name: 'Kemal Malovčić',
    role: { bs: 'Pjevač', en: 'Singer' },
    text: {
      bs: 'Rođen u Sanskom Mostu. Pjevati je počeo šezdesetih, a prvi singl objavio je za Diskos. Osamdesetih je bio član grupe Južni Vetar.',
      en: 'Born in Sanski Most. He began singing in the 1960s and released his first single on Diskos. In the 1980s he was a member of the band Južni Vetar.' },
    src: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Kemal_Malov%C4%8Di%C4%87' } },

  { id: 'brajic', cat: 'muzika', kind: 'born', name: 'Vukašin Brajić',
    role: { bs: 'Pjevač', en: 'Singer' },
    text: {
      bs: 'Rođen u Sanskom Mostu 9. februara 1984. Drugo mjesto zauzeo je u prvoj sezoni Operacije trijumf. Bosnu i Hercegovinu predstavljao je na Pjesmi Eurovizije 2010. u Oslu s pjesmom Munja i grom i završio na sedamnaestom mjestu u finalu.',
      en: 'Born in Sanski Most on 9 February 1984. He finished second in the first season of Operacija trijumf. He represented Bosnia and Herzegovina at Eurovision 2010 in Oslo with "Munja i grom" ("Thunder and Lightning") and placed seventeenth in the final.' },
    src: { label: 'Eurovision', url: 'https://eurovision.tv/video/bosnia-herzegovina-eurovision-song-contest-2010' } },

  { id: 'demirovic', cat: 'sport', kind: 'origin', name: 'Ermedin Demirović',
    role: { bs: 'Nogometaš', en: 'Footballer' },
    text: {
      bs: 'Rođen u Hamburgu, a porodica mu je porijeklom iz Sanskog Mosta, gdje je posjećivao rodbinu. Napadač je reprezentacije Bosne i Hercegovine. Lokalni portal Inmedia zabilježio je njegovu vezu sa Sanom još 2019, dok je igrao za St. Gallen.',
      en: 'Born in Hamburg, with family roots in Sanski Most, where he visited relatives. He is a striker for the Bosnia and Herzegovina national team. The local portal Inmedia noted his link with the Sana as early as 2019, when he played for St. Gallen.' },
    src: { label: 'Inmedia', url: 'https://inmedia.ba/jos-jedan-nogometni-talent-porijeklom-iz-sane/' } },

  { id: 'muharemovic', cat: 'sport', kind: 'origin', name: 'Tarik Muharemović',
    role: { bs: 'Nogometaš', en: 'Footballer' },
    text: {
      bs: 'Rođen 28. februara 2003. u Ljubljani. Majka mu je iz Sanskog Mosta, a otac iz Zavidovića, pa je raspuste kao dijete provodio u oba kraja. Stoper je reprezentacije Bosne i Hercegovine.',
      en: 'Born on 28 February 2003 in Ljubljana. His mother is from Sanski Most and his father from Zavidovići, so as a child he spent holidays in both places. He is a centre-back for the Bosnia and Herzegovina national team.' },
    src: { label: 'Klix', url: 'https://www.klix.ba/sport/nogomet/tarik-muharemovic-za-klixba-krilatica-bojim-se-samo-boga-mi-se-savrseno-uklapa-s-uzorom-spahicem/260410135' } },

  { id: 'jhandanovic', cat: 'sport', kind: 'origin', name: 'Jasmin Handanović',
    role: { bs: 'Golman', en: 'Goalkeeper' },
    text: {
      bs: 'Porodica mu potiče iz Hrustova, a u izvještaju iz tog mjesta spominje se uz Samira Handanovića među golmanima porijeklom iz mjesne zajednice. Branio je za reprezentaciju Slovenije.',
      en: 'His family comes from Hrustovo, and a report from the village lists him alongside Samir Handanović among goalkeepers with roots there. He played in goal for the Slovenia national team.' },
    src: { label: 'Dnevni avaz', url: 'https://avaz.ba/vijesti/bih/663090/haris-seferovic-je-poslao-kuci-mbapea-pogbu-grizmana-sve-je-pocelo-u-hrustovu-kod-sanskog-mosta' } },

  { id: 'hasanbeg', cat: 'politika', kind: 'born', name: 'Hasan-beg Čekić',
    role: { bs: 'Upravitelj i gradonačelnik', en: 'Administrator and mayor' },
    text: {
      bs: 'Bio je sanski upravitelj, a kasnije gradonačelnik. Jedan je od predvodnika otpora austrougarskoj okupaciji 1878, a zabilježena je i njegova uloga u podizanju i održavanju drvenog mosta preko Sane.',
      en: 'He was the administrator of Sanski Most and later its mayor. He was one of the leaders of resistance to the Austro-Hungarian occupation in 1878, and his part in building and maintaining the wooden bridge over the Sana is on record.' },
    src: { label: 'Stav (arhiv)', url: 'https://arhiv.stav.ba/ko-su-bile-vodje-otpora-u-krajini-i-kakva-je-njihova-sudbina/' } },

  { id: 'ivanc', cat: 'nauka', kind: 'born', name: 'Ivan Čavlović',
    role: { bs: 'Muzikolog i kompozitor', en: 'Musicologist and composer' },
    text: {
      bs: 'Rođen 20. augusta 1949. u Kruharima kod Sanskog Mosta, umro 14. maja 2021. u Sarajevu. U mladosti je svirao u orkestru KUD Grmeč i u sanskoj grupi Boemi. Bio je profesor emeritus i dekan Muzičke akademije Univerziteta u Sarajevu, a napisao je Historiju muzike u Bosni i Hercegovini (2011).',
      en: 'Born on 20 August 1949 in Kruhari near Sanski Most, died on 14 May 2021 in Sarajevo. In his youth he played in the KUD Grmeč orchestra and in the Sanski Most band Boemi. He was professor emeritus and dean of the Academy of Music of the University of Sarajevo, and wrote the History of Music in Bosnia and Herzegovina (2011).' },
    src: { label: 'Muzička akademija Sarajevo', url: 'https://www.mas.unsa.ba/en/node/454' } },

  { id: 'abilajbegovic', cat: 'nauka', kind: 'born', name: 'Asim Bilajbegović',
    role: { bs: 'Geodet i profesor', en: 'Geodesist and professor' },
    text: {
      bs: 'Rođen u Sanskom Mostu, gdje je počeo školovanje. Od 1985. do 1987. bio je dekan Geodetskog fakulteta u Zagrebu, predavao je u Dresdenu, a među pionirima je primjene GPS tehnologije u geodeziji u Bosni i Hercegovini i Hrvatskoj.',
      en: 'Born in Sanski Most, where he began his schooling. From 1985 to 1987 he was dean of the Faculty of Geodesy in Zagreb, he taught in Dresden, and he was among the pioneers of GPS in geodesy in Bosnia and Herzegovina and Croatia.' },
    src: { label: 'Univerzitet u Sarajevu', url: 'https://www.unsa.ba/node/4619' } },

  { id: 'dedic', cat: 'nauka', kind: 'linked', name: 'Enes Dedić',
    role: { bs: 'Historičar', en: 'Historian' },
    text: {
      bs: 'Osnovnu i srednju školu završio je u Sanskom Mostu. Historičar je na Institutu za historiju Univerziteta u Sarajevu, a autor je knjige Bosansko Kraljevstvo i Srpska Despotovina (1402 do 1459).',
      en: 'He finished primary and secondary school in Sanski Most. He is a historian at the Institute for History of the University of Sarajevo and the author of the book Bosansko Kraljevstvo i Srpska Despotovina (1402 to 1459).' },
    src: { label: 'Institut za historiju', url: 'https://iis.unsa.ba/osoblje/enes-dedic/' } },

  { id: 'tontic', cat: 'nauka', kind: 'born', name: 'Stevan Tontić',
    role: { bs: 'Pjesnik i prevodilac', en: 'Poet and translator' },
    text: {
      bs: 'Rođen u Grdanovcima kod Sanskog Mosta. Pjesnik, esejist i prevodilac, a zbirka Sarajevski rukopis nastala je iz iskustva rata u Sarajevu.',
      en: 'Born in Grdanovci near Sanski Most. A poet, essayist and translator, whose collection Sarajevski rukopis grew out of the experience of the war in Sarajevo.' },
    src: { label: 'Matica srpska', url: 'https://www.maticasrpska.org.rs/stariSajt/casopisi/LLMS_6.pdf' } },

  { id: 'julka', cat: 'nauka', kind: 'born', name: 'Julka Popović-Srdić',
    role: { bs: 'Učiteljica i književnica', en: 'Teacher and writer' },
    text: {
      bs: 'Rođena 1885. u Sanskom Mostu, gdje je i odrasla. Učiteljica i književnica, pisala je o životu žena na selu, o majčinstvu i o Petru Kočiću, a njeni tekstovi svjedoče o iskustvima krajiških žena prije Drugog svjetskog rata.',
      en: 'Born in 1885 in Sanski Most, where she also grew up. A teacher and writer, she wrote about the lives of village women, about motherhood and about Petar Kočić, and her texts record the experience of women in the Krajina before the Second World War.' },
    src: { label: 'Nezavisne novine', url: 'https://www.nezavisne.com/novosti/banjaluka/Istaknute-istorijske-licnosti-Banjaluke-XXXIX-Julka-Popovic-Srdic/282098' } },

  { id: 'jasarevic', cat: 'nauka', kind: 'born', name: 'Senudin Jašarević',
    role: { bs: 'Novinar i pisac', en: 'Journalist and writer' },
    text: {
      bs: 'Rođen iznad učionice u Hrustovu, gdje mu je otac bio učitelj. Bio je prvi direktor Unsko-sanskih novina Krajina, a poslije je vodio RTV Unsko-sanskog kantona.',
      en: 'Born above a classroom in Hrustovo, where his father was a teacher. He was the first director of the Una-Sana daily Krajina and later headed RTV of the Una-Sana Canton.' },
    src: { label: 'Una-sana Krajina', url: 'https://usnkrajina.ba/clanak/senudin-jasarevic-roden-iznad-ucionice-a-cijeli-zivot-proveo-izmedu-vojske-novina-i-knjizevnosti/1050' } },

  { id: 'ikurtovic', cat: 'muzika', kind: 'linked', name: 'Ismet Kurtović',
    role: { bs: 'Pjevač i kompozitor', en: 'Singer and composer' },
    text: {
      bs: 'Rođen u Srnetici, a u Sanski Most porodica mu se preselila kad je imao oko pet godina. Tu je počeo školovanje i prva muzička iskustva. Frontmen je grupe Drugi način, a s bratom Fikretom stvorio je pjesmu Sano moja, sanjam te.',
      en: 'Born in Srnetica, he moved to Sanski Most with his family at about five years old. There he began school and gained his first musical experience. He is the frontman of the band Drugi način and, with his brother Fikret, created the song Sano moja, sanjam te.' },
    src: { label: 'Telegraf', url: 'https://www.telegraf.rs/pop-i-kultura/muzika/3436999-ismet-kurtovic-drugi-nacin-veliki-intervju' } },

  { id: 'fkurtovic', cat: 'muzika', kind: 'linked', name: 'Fikret Kurtović Fifi',
    role: { bs: 'Tekstopisac', en: 'Lyricist' },
    text: {
      bs: 'Napisao je tekstove pjesama Mojoj dragoj BiH i Piši mi grupe Drugi način, a Sano moja, sanjam te i otpjevao. U Sanskom Mostu vodio je ustanovu Kult media, a s Amirom Talićem i drugima potpisao je knjigu Sanska posla (2018).',
      en: 'He wrote the lyrics of Mojoj dragoj BiH and Piši mi for the band Drugi način, and also sang Sano moja, sanjam te. In Sanski Most he ran the institution Kult media, and with Amir Talić and others he co-wrote the book Sanska posla (2018).' },
    src: { label: 'Grad na devet rijeka', url: 'https://gradnadevetrijeka.ba/2024/07/05/video-da-li-je-ovo-najljepsa-pjesma-o-sanskom-mostu/' } },

  { id: 'kazic', cat: 'muzika', kind: 'born', name: 'Amir Kazić Leo',
    role: { bs: 'Pjevač', en: 'Singer' },
    text: {
      bs: 'Prema vlastitom kazivanju, rođen je u Tomini. Prva muzička iskustva stekao je u Kulturnom društvu Grmeč, kroz folklor, hor i tamburaški orkestar, a u srednjoj školi svirao je u bendu Elektronci. Kasnije je otišao u Istru i tamo izgradio karijeru.',
      en: 'By his own account he was born in Tomina. He had his first musical experience at the Grmeč cultural society, through folklore, choir and a tamburitza orchestra, and played in the band Elektronci at secondary school. He later moved to Istria and built his career there.' },
    src: { label: 'Klix', url: 'https://www.klix.ba/magazin/muzika/amir-kazic-leo-u-mojim-pocecima-bilo-je-mnogo-teze-doci-do-publike-danas-mladi-ne-moraju-ni-izaci-iz-sobe/260419010' } },

  { id: 'zonic', cat: 'muzika', kind: 'linked', name: 'Šejla Zonić',
    role: { bs: 'Pjevačica', en: 'Singer' },
    text: {
      bs: 'Rođena u Njemačkoj, a djetinjstvo je provela u Sanskom Mostu, u Gornjem Kamengradu. Pohađala je muzičku školu, a pobjednica je takmičenja Zvezde Granda u sezoni 2023/24.',
      en: 'Born in Germany, she spent her childhood in Sanski Most, in Gornji Kamengrad. She attended music school and won the competition Zvezde Granda in the 2023/24 season.' },
    src: { label: 'Kurir', url: 'https://www.kurir.rs/stars/4400503/sejla-zonic-je-najobrazovanija-takmicarka-zvezda-granda' } },

  { id: 'ceric', cat: 'kultura', kind: 'linked', name: 'Džafer Cerić',
    role: { bs: 'Slikar', en: 'Painter' },
    text: {
      bs: 'S Perom Mandićem bio je među osnivačima sanske kolonije naive, iz koje su nastala međunarodna Ljetnja drugovanja na Sani. Učesnici kolonije ostavili su gradu više od 500 slika i skulptura, a velik dio zbirke stradao je u ratu. Cerić je 2017. izložbom obilježio četiri decenije umjetničkog rada.',
      en: 'With Pero Mandić he was among the founders of the Sanski Most naive art colony, which gave rise to the international Summer Gatherings on the Sana. Participants left the town more than 500 paintings and sculptures, and much of the collection was lost in the war. In 2017 Cerić marked four decades of his art with an exhibition.' },
    src: { label: 'Al Jazeera Balkans', url: 'https://balkans.aljazeera.net/amp/teme/2017/8/27/ozivljavanje-prve-kolonije-naive-u-bih' } },

  { id: 'mandic', cat: 'kultura', kind: 'linked', name: 'Pero Mandić',
    role: { bs: 'Slikar', en: 'Painter' },
    text: {
      bs: 'S Džaferom Cerićem bio je među osnivačima sanske kolonije naive. Autor je ciklusa od 14 slika Križni put Isusa Krista, koji se čuva u crkvi Uznesenja Blažene Djevice Marije u Sanskom Mostu.',
      en: 'With Džafer Cerić he was among the founders of the Sanski Most naive art colony. He is the author of a cycle of 14 paintings, the Way of the Cross, kept in the church of the Assumption of the Blessed Virgin Mary in Sanski Most.' },
    src: { label: 'Al Jazeera Balkans', url: 'https://balkans.aljazeera.net/amp/teme/2017/8/27/ozivljavanje-prve-kolonije-naive-u-bih' } },

  { id: 'hadzija', cat: 'kultura', kind: 'born', name: 'Hadžija Hadžibajramović',
    role: { bs: 'Glumica i direktorica pozorišta', en: 'Actress and theatre director' },
    text: {
      bs: 'Rođena 1942. u Sanskom Mostu. Diplomirala je matematiku i fiziku, a karijeru je posvetila pozorištu: bila je glumica i dugogodišnja direktorica Narodnog pozorišta Mostar.',
      en: 'Born in 1942 in Sanski Most. She graduated in mathematics and physics and devoted her career to the theatre, as an actress and for many years director of the National Theatre Mostar.' },
    src: { label: 'Dnevni avaz', url: 'https://avaz.ba/vijesti/kultura/699945/preminula-glumica-i-dugogodisnja-direktorica-narodnog-pozorista-mostar' } },

  { id: 'hbilajbegovic', cat: 'kultura', kind: 'origin', name: 'Haris Bilajbegović',
    role: { bs: 'Filmski autor', en: 'Filmmaker' },
    text: {
      bs: 'Filmski autor sanskog porijekla. U dokumentarcima Most i Svjedok obradio je zločine počinjene 1992. u selima oko Sanskog Mosta, a Most je dobio nagrade u Londonu i Moskvi.',
      en: 'A filmmaker with roots in Sanski Most. In the documentaries Most and Svjedok he dealt with crimes committed in 1992 in villages around Sanski Most, and Most won awards in London and Moscow.' },
    src: { label: 'Etto', url: 'https://etto.ba/clanak/harisova-dva-dokumentarna-filma-sada-su-dio-filmskog-arhiva-austrije' } },

  { id: 'tabakovic', cat: 'kultura', kind: 'linked', name: 'Emir Tabaković',
    role: { bs: 'Radijski novinar', en: 'Radio journalist' },
    text: {
      bs: 'Učestvovao je u poslijeratnoj obnovi Radio Sane. Ostavio je zapis o ponovnom pokretanju programa 13. januara 1996. i obraćanju slušaocima riječima Ovdje Radio Sana.',
      en: 'He took part in the post-war revival of Radio Sana. He left a record of the programme starting again on 13 January 1996 and of addressing listeners with the words Ovdje Radio Sana.' },
    src: { label: 'Inmedia', url: 'https://inmedia.ba/1996-godina-ovdje-radio-sana-emir-tabakovic/' } },

  { id: 'biscevic', cat: 'zdravstvo', kind: 'linked', name: 'Faik Biščević Fajko',
    role: { bs: 'Stomatolog', en: 'Dentist' },
    text: {
      bs: 'Prema porodičnoj biografiji, bio je prvi sanski diplomirani zubar. Fakultet je završio 1962, a njegova biografija bilježi početke stručne stomatološke zaštite u Sanskom Mostu.',
      en: 'According to a family biography he was the first qualified dentist from Sanski Most. He graduated in 1962, and his biography records the beginnings of professional dental care in the town.' },
    src: { label: 'Porodična biografija', url: 'https://nedimbiscevic.info/biografija/' } },

  { id: 'pisteljic', cat: 'zdravstvo', kind: 'linked', name: 'Slavko Pišteljić',
    role: { bs: 'Ljekar', en: 'Physician' },
    text: {
      bs: 'Od 1925. do 1935. radio je u Sanskom Mostu kao sreski ljekar i ljekar udružene zdravstvene opštine. Liječio je radnike osigurane preko Bratinske blagajne i radio kao željeznički ljekar.',
      en: 'From 1925 to 1935 he worked in Sanski Most as district physician and physician of the joint health municipality. He treated workers insured through the Brotherhood Fund and worked as a railway doctor.' },
    src: { label: 'Ljekarska komora RS', url: 'https://www.komoradoktorars.org/v3/kod%2034print.pdf' } },

  { id: 'sabanovic', cat: 'zdravstvo', kind: 'linked', name: 'Enis Šabanović',
    role: { bs: 'Ljekar internista', en: 'Internist' },
    text: {
      bs: 'Ljekar iz Trnove. Do aprila 1992. bio je načelnik interne medicine u Domu zdravlja Sanski Most. Od juna do novembra 1992. bio je zatočen u logoru Manjača, a njegov položaj i zatočeništvo dokumentovani su u presudama Haškog tribunala.',
      en: 'A physician from Trnova. Until April 1992 he headed internal medicine at the Sanski Most health centre. From June to November 1992 he was held in the Manjača camp, and his position and detention are documented in judgements of the Hague Tribunal.' },
    src: { label: 'Haški tribunal', url: 'https://ucr.irmct.org/LegalRef/CMSDocStore/Public/BCS/Judgement/NotIndexable/IT-09-92/JUD275R0000636710.pdf' } },

  { id: 'albahari', cat: 'rat', kind: 'born', name: 'Moris Albahari',
    role: { bs: 'Partizan i pilot', en: 'Partisan and pilot' },
    text: {
      bs: 'Rođen 30. oktobra 1930. u Sanskom Mostu, umro 2022. u Sarajevu. Preživio je holokaust i kao dječak učestvovao u partizanskom pokretu, a poslije rata postao je pilot i direktor sarajevskog aerodroma. Poznavanje ladina, jezika sefardskih Jevreja, pomoglo mu je da preživi.',
      en: 'Born on 30 October 1930 in Sanski Most, died in 2022 in Sarajevo. He survived the Holocaust and as a boy took part in the partisan movement, and after the war became a pilot and director of Sarajevo airport. Knowing Ladino, the language of Sephardic Jews, helped him survive.' },
    src: { label: 'Jerusalem Post', url: 'https://www.jpost.com/diaspora/article-723030' } },

  { id: 'ahukanovic', cat: 'rat', kind: 'linked', name: 'Arif Hukanović',
    role: { bs: 'Komandant odbrane Vrhpolja', en: 'Commander in the defence of Vrhpolje' },
    text: {
      bs: 'Bio je jedan od organizatora odbrane Vrhpolja 1992. Komandovao je jedinicom Teritorijalne odbrane Vrhpolja, a potom je bio zamjenik komandanta Ključko-sanskog bataljona.',
      en: 'He was one of the organisers of the defence of Vrhpolje in 1992. He commanded the Vrhpolje Territorial Defence unit and later served as deputy commander of the Ključ-Sana battalion.' },
    src: { label: 'Grad na devet rijeka', url: 'https://gradnadevetrijeka.ba/2025/06/13/sve-sto-moras-znati-o-herojskom-vrhpolju-foto-video/' } },

  { id: 'catic', cat: 'rat', kind: 'linked', name: 'Aziz Ćatić',
    role: { bs: 'Preživjeli i svjedok', en: 'Survivor and witness' },
    text: {
      bs: 'Preživio je strijeljanje zatočenika u logoru Sanakeram na području Sanskog Mosta u oktobru 1995, kao jedini preživjeli iz grupe, kad je imao 25 godina. O zločinu je svjedočio, a njegovo ime zabilježeno je u izvještaju o presudi Kantonalnog suda u Bihaću iz 2011.',
      en: 'He survived the shooting of detainees at the Sanakeram camp in the Sanski Most area in October 1995, as the only survivor of the group, at the age of 25. He testified about the crime, and his name is recorded in the report on the 2011 verdict of the Cantonal Court in Bihać.' },
    src: { label: 'Inmedia', url: 'https://inmedia.ba/prezivio-strijeljanje-u-sanakeramu-svjedocenje-aziza-catica/' } }
];
