// Video recordings 1992-1995: every recording on the shelf of snimci.html (snimci.js).
// Nothing is hosted here: each recording is a link to its original source on YouTube.
// id: used in the address (#snimak=<id>) and in the i18n keys sn.g.<id> (kind) and sn.s.<id> (description)
// cat: logori | sana | tribunal | doc, the same order as the themes on the page
// y: year shown on the spine; min: length in minutes; yt: YouTube video id; src: who made or published it
// title and src stay as published (they are not translated).
//
// TODO(verify) for the whole list: the descriptions come from Meho and are not in FACTS.md, except the Vrhpolje bridge (31 May 1992).
// y: stays as it is for now; Meho will replace the years on the spines with pictures later.
window.SNIMCI = {
  films: [
    { id: 'aziz-catic', cat: 'logori', y: 1992, min: 42, yt: 'nh4WTYZyMBg', cover: 'nh4WTYZyMBg.webp', src: 'USMENO SVJEDOČANSTVO / LOGORAŠI',
      title: 'Svjedočenje Aziza Čatića – Logori Betonirka i Manjača' },
    { id: 'ap-sana-zauzeta', cat: 'sana', y: 1995, min: 4, yt: 'IIXzOJLKRrg', cover: 'IIXzOJLKRrg.webp', src: 'AP ARCHIVE',
      title: 'Sanski Most Captured By Bosnian Army' },
    { id: 'mlada-vojska', cat: 'sana', y: 1995, min: 7, yt: 'J0vEEX4ltHQ', cover: 'J0vEEX4ltHQ.webp', src: 'ARHIV 5. KORPUSA ARBIH',
      title: 'Ulazak mlade vojske 5. korpusa u Sanski Most' },
    { id: 'ap-borbe', cat: 'sana', y: 1995, min: 5, yt: '9Rlh6HKWp6I', cover: '9Rlh6HKWp6I.webp', src: 'AP ARCHIVE',
      title: 'Battle Rages Near Sanski Most' },
    { id: 'brdanin', cat: 'tribunal', y: 2004, min: 45, yt: 'dFiiYn865eA', cover: 'dFiiYn865eA.webp', src: 'HAŠKI TRIBUNAL (MKSJ)',
      title: 'Presuda Pretresnog vijeća: Radoslav Brđanin' },
    { id: 'stanisic-simatovic', cat: 'tribunal', y: 2023, min: 30, yt: 'jk93wI3lDLo', cover: 'jk93wI3lDLo.webp', src: 'SENSE CENTAR / MRMKS',
      title: 'Stanišić i Simatović – Žalbena presuda' }, // TODO(verify) "Sanski Most 1992. i 1995." in the description
    { id: 'rajif-begic', cat: 'logori', y: 1992, min: 12, yt: 'difjNxFJv-8', src: 'MREŽA REKOM',
      title: 'Svjedočenje: Rajif Begić (Vrhpoljski most)' },
    { id: 'sense-arhiva', cat: 'tribunal', y: 1992, min: 25, yt: 'ORKzfG1GbUM', src: 'SENSE TRANSITIONAL JUSTICE',
      title: 'Arhiva slučajeva: Sanski Most 1992' }, // TODO(verify) "sistematskim zatvaranjima" and the list of places
    { id: 'dudakovic', cat: 'sana', y: 1995, min: 38, yt: 'SHHBmrlSYsw', src: 'TV VIHOR',
      title: 'General Atif Dudaković o operaciji Sana 95' }, // TODO(verify) y: an interview about 1995, probably recorded later
    { id: 'komandanti', cat: 'sana', y: 1995, min: 42, yt: '8v2qlPPQ9bo', src: 'TV VIHOR',
      title: 'Komandanti o operaciji SANA 95' }, // TODO(verify) y, as above
    { id: '505-brigada', cat: 'sana', y: 1995, min: 28, yt: 'uU8Uw11bupQ', src: 'INFORMATIVNA SLUŽBA 505.',
      title: '505. viteška brigada u operaciji Sana 95' },
    { id: 'domazeti', cat: 'sana', y: 1995, min: 15, yt: 'rbPwVppGwsY', src: 'BIR TV REPORTAŽA',
      title: 'Sanski Most: Zločin u Domazetima 1995.' }, // TODO(verify) the number 15 in the description
    { id: 'krings', cat: 'logori', y: 1992, min: 10, yt: 'K7gkwjHumn4', src: 'RTV USK',
      title: 'Sjećanje na žrtve logora Krings' },
    { id: 'hrastova-glavica', cat: 'logori', y: 1992, min: 14, yt: 'RzRyGKg92S0', src: 'RTV USK',
      title: 'Masovna grobnica Hrastova glavica' }, // TODO(verify) "prebačenim iz logora Omarska i Keraterm"
    { id: 'operacija-sana-95', cat: 'doc', y: 2015, min: 98, yt: 'RohHZQC62u4', src: 'AUTOR: AVDO HUSEINOVIĆ',
      title: 'Operacija Sana 95 – Nedovršena pobjeda' },
    { id: 'zagonetka-alagic', cat: 'doc', y: 2018, min: 110, yt: 'PAaI4FhWUws', src: '7. KORPUS / MEHMED ALAGIĆ',
      title: 'Zagonetka Alagić – General koji je uspijevao nemoguće' }, // "jedini komandant 7. korpusa ARBiH": wording from Meho
    { id: 'juris-nepobjedivih', cat: 'doc', y: 2020, min: 85, yt: '7aUMROJANnI', src: '5. KORPUS / 510. BRIGADA',
      title: 'Juriš nepobjedivih – 510. oslobodilačka brigada' }
  ]
};
