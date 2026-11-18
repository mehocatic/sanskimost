// People of Sanski Most (licnosti.html). Every entry rests on the source named in `src`.
// kind: 'born' = born in Sanski Most (or its villages); 'origin' = family roots in Sanski Most, born elsewhere.
// Rules: no ethnicity, no private details, no photos of people. Ranges use "do" (no dashes).
// TODO(verify): Budimir (current role), Pantelic (birthplace, from one article), Alagic (from Meho's notes, see FACTS.md).
window.LICNOSTI_CATS = [
  { id: 'sport', bs: 'Sport', en: 'Sport' },
  { id: 'politika', bs: 'Politika', en: 'Politics' },
  { id: 'nauka', bs: 'Nauka i književnost', en: 'Science and literature' },
  { id: 'muzika', bs: 'Muzika', en: 'Music' },
  { id: 'rat', bs: 'Rat i odbrana', en: 'War and defence' }
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
    src: { label: 'Eurovision', url: 'https://eurovision.tv/video/bosnia-herzegovina-eurovision-song-contest-2010' } }
];
