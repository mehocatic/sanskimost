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
    { id: 'aziz-catic', cat: 'logori', y: 1992, min: 42, yt: 'nh4WTYZyMBg', src: 'USMENO SVJEDOČANSTVO / LOGORAŠI',
      title: 'Svjedočenje Aziza Čatića – Logori Betonirka i Manjača' },
    { id: 'ap-sana-zauzeta', cat: 'sana', y: 1995, min: 4, yt: 'IIXzOJLKRrg', src: 'AP ARCHIVE',
      title: 'Sanski Most Captured By Bosnian Army' },
  ]
};
