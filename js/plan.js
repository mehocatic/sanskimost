// Visit page (plan.html): the places full screen, seen through water, then the practical information.
// - Under the photos runs a water simulation (WebGL2, wave equation on a grid, half-float textures). Waves only where the
//   photo really has water: the masks in photos/maske/ (white = water); on land the surface is held flat, so waves stop at the shore.
// - Between places the water rises (about a second, not tied to the scroll); from Bobijaško oko it drains into the eye
//   and the Dabar cave opens where it went (the Jezernica sinks and reappears there).
// - Caves: dark, lit by a lamp that walks a path through the photo as the page scrolls (SCENES.path);
//   the mouse or a tap points it for 2.5 s. Kamengrad: warm light over the walls. Mulež: fog over the valley, thinner higher up.
// - Phone: the scroll is the current that carries the old photograph, drops fall with the scroll, only on water;
//   tilting the phone tilts the water and moves the photograph and the lamp (Android at once, iPhone after a tap; https only).
// - Old photographs from the archive float on the water at their natural size or smaller. No photo is ever shown larger
//   than its natural size (in CSS pixels).
// - Live: the weather in town (Open-Meteo, CC BY 4.0); when it rains there, it rains on the photo.
// - Without WebGL2 or with reduced motion: plain photos and text.
// All texts come from i18n (places.<slug> and plan.*, pv.*); facts only from FACTS.md and the place texts.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches; // a mouse; otherwise a finger
  const t = (k, v) => I18n.t(k, v);
  const bySlug = Object.fromEntries(PLACES.map(p => [p.slug, p]));
  const P = (slug, f) => I18n.place(bySlug[slug], f);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const page = slug => `place?slug=${encodeURIComponent(slug)}`;
  const map = slug => `explore?place=${encodeURIComponent(slug)}`;
  const LAT = 44.7638251, LON = 16.6648616; // centre of town (Hamzibegova džamija, OSM way 346178044)

  // one sentence of a place text, so nothing is reworded: by a word it contains (the same in both languages),
  // or by [paragraph, sentence] where the wording differs
  const sentence = (slug, field, has) => {
    const text = P(slug, field), split = s => s.split(/(?<=\.)\s+/);
    if (Array.isArray(has)) return (split(text.split(/\n\n+/)[has[0]] || '')[has[1]] || '').trim();
    return (split(text).find(s => s.includes(has)) || '').trim();
  };
  const links = slug => `<a href="${map(slug)}">${esc(t('pv.map'))} →</a><a href="${page(slug)}">${esc(t('pv.page'))} →</a>`;

  /* ---------- the photos behind the scenes: src, natural size, focus (x from the left, y from the top) ----------
     mask: where the photo has water; hot: the water a new scene's first drop falls on; dark + path: a cave and the lamp's way
     through it; drain: the sinkhole the water runs into; pan: the focus moves from f to pan with the scroll; print: an old photo on the water */
  const SCENES = [
    { src: 'photos/grad/masinski-most-sumrak.webp', w: 1350, h: 900, f: [.5, .5], words: 1,
      mask: 'photos/maske/masinski-most-sumrak.png', hot: [.45, .86] },
    { src: 'photos/bliha2.webp', w: 2400, h: 1599, f: [.54, .45], mask: 'photos/maske/bliha2.png', hot: [.565, .69],
      print: { src: 'photos/arhiv/blihe-1942.webp', w: 370, h: 604, cap: () => t('arh.c.blihe'), home: [.73, .4], homeM: [.72, .27], r: .05, flow: 1 } },
    { src: 'photos/kamengrad.webp', w: 1200, h: 896, f: [.5, .45], sun: 1 },
    { src: 'photos/bobijasko-oko2.webp', w: 1024, h: 1024, f: [.72, .5], mask: 'photos/maske/bobijasko-oko2.png', hot: [.78, .66], drain: [.78, .62] },
    { src: 'photos/dabarska2.webp', w: 1640, h: 924, f: [.6, .55], dark: 1,
      path: [[.14, .2], [.42, .13], [.8, .42], [.62, .7], [.47, .55]] },  // vault, roof, right wall, the man on the path, the dark way in
    { src: 'photos/hrustovacka5.webp', w: 1024, h: 768, f: [.5, .45], dark: 1,
      path: [[.15, .28], [.45, .3], [.78, .42], [.83, .53], [.45, .55], [.4, .76], [.68, .76], [.6, .92]] }, // walls, ceiling, stalactites, flowstone, people, the path on
    { src: 'photos/mulez-pogled.webp', w: 1080, h: 1520, f: [.5, .95], pan: [.5, .05], fog: 1 },
    { src: 'photos/grad/skokovi-masinski.webp', w: 1600, h: 1070, f: [.64, .55], mask: 'photos/maske/skokovi-masinski.png', hot: [.6, .76],
      // TODO(verify) year: arhiv-data says 1980s, from Meho's document
      print: { src: 'photos/arhiv/skok-masinski-most.webp', w: 542, h: 800, cap: () => `${t('hist.6.g8')}, ${t('arh.y.80s')}`, home: [.74, .47], homeM: [.72, .29], r: -.06, flow: -1 } }
  ];

  // the prints in a row: t = small file for the row, f = file for the lightbox (with its natural size), c = caption
  const ph = (tt, f, w, h, c) => ({ t: tt, f, w, h, c });
  const strips = () => ({
    blihe: [
      ph('photos/bliha3-721.webp', 'photos/bliha3.webp', 1080, 1349, P('blihe', 'name')),
      ph('photos/arhiv/bliha-jesen-675.webp', 'photos/arhiv/bliha-jesen.webp', 960, 1280, t('arh.c.bliha-jesen')),
      ph('photos/bliha5.webp', 'photos/bliha5.webp', 800, 533, P('blihe', 'name')),
      ph('photos/arhiv/bliha-ljeto.webp', 'photos/arhiv/bliha-ljeto.webp', 1280, 853, t('arh.c.bliha-ljeto')),
      ph('photos/bliha4.webp', 'photos/bliha4.webp', 768, 768, P('blihe', 'name')),
      ph('photos/bliha-vodopad-staza.webp', 'photos/bliha-vodopad-staza.webp', 512, 768, P('blihe', 'name')),
      ph('photos/bliha6.webp', 'photos/bliha6.webp', 800, 492, P('blihe', 'name'))
    ],
    kamengrad: [
      ph('photos/kamengrad4.webp', 'photos/kamengrad4.webp', 1024, 432, P('kamengrad', 'name')),
      ph('photos/kamengrad2.webp', 'photos/kamengrad2.webp', 650, 409, P('kamengrad', 'name')),
      ph('photos/kamengrad3.jpg', 'photos/kamengrad3.jpg', 793, 386, P('kamengrad', 'name')),
      ph('photos/kamengrad5.webp', 'photos/kamengrad5.webp', 701, 392, P('kamengrad', 'name'))
    ],
    'bobijasko-oko': [
      ph('photos/bobijasko-oko.webp', 'photos/bobijasko-oko.webp', 696, 861, P('bobijasko-oko', 'name')),
      ph('photos/bobijasko-oko3.jpg', 'photos/bobijasko-oko3.jpg', 739, 415, P('bobijasko-oko', 'name')),
      ph('photos/bobijasko-oko4.webp', 'photos/bobijasko-oko4.webp', 399, 501, P('bobijasko-oko', 'name'))
    ],
    dabarska: [
      ph('photos/dabarska7.webp', 'photos/dabarska7.webp', 1200, 900, P('dabarska', 'name')),
      ph('photos/dabarska3.jpg', 'photos/dabarska3.jpg', 1280, 819, P('dabarska', 'name')),
      ph('photos/dabarska6.jpg', 'photos/dabarska6.jpg', 554, 554, P('dabarska', 'name')),
      ph('photos/dabarska4.jpg', 'photos/dabarska4.jpg', 447, 447, P('dabarska', 'name'))
    ],
    hrustovacka: [
      ph('photos/hrustovacka3.webp', 'photos/hrustovacka3.webp', 1180, 885, P('hrustovacka', 'name')),
      ph('photos/hrustovacka.jpg', 'photos/hrustovacka.jpg', 441, 695, P('hrustovacka', 'name')),
      ph('photos/hrustovacka2.jpg', 'photos/hrustovacka2.jpg', 640, 480, P('hrustovacka', 'name')),
      ph('photos/hrustovacka4.webp', 'photos/hrustovacka4.webp', 400, 500, P('hrustovacka', 'name'))
    ],
    mulez: [
      ph('photos/mulez4-675.webp', 'photos/mulez4.webp', 1200, 1600, P('mulez', 'name')),
      ph('photos/mulez5-1080.webp', 'photos/mulez5.webp', 1600, 1200, P('mulez', 'name')),
      ph('photos/mulez2-1080.webp', 'photos/mulez2.jpg', 2048, 1153, P('mulez', 'name')),
      ph('photos/mulez3.jpg', 'photos/mulez3.jpg', 960, 540, P('mulez', 'name'))
    ],
    sana: [
      ph('photos/arhiv/plivanje.webp', 'photos/arhiv/plivanje.webp', 800, 522, `${t('hist.6.g6')}, ${t('arh.y.80s')}`),
      ph('photos/arhiv/masinski-most-1956.webp', 'photos/arhiv/masinski-most-1956.webp', 1416, 1004, t('arh.c.masinski-most-1956')),
      ph('photos/grad/gradski-most-rijeka.webp', 'photos/grad/gradski-most-rijeka.webp', 1600, 1070, t('grad.gradski-most-rijeka')),
      ph('photos/arhiv/sana-1912.webp', 'photos/arhiv/sana-1912.webp', 800, 504, t('arh.c.sana-1912'))
    ]
  });

  /* ---------- dates: how many days until ---------- */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = (m, d) => { let x = new Date(today.getFullYear(), m - 1, d); if (x < today) x = new Date(today.getFullYear() + 1, m - 1, d); return Math.round((x - today) / 864e5); };
  const firstFridayJuly = () => { const f = y => { const d = new Date(y, 6, 1); d.setDate(1 + (5 - d.getDay() + 7) % 7); return d; };
    let x = f(today.getFullYear()); if (x < today) x = f(today.getFullYear() + 1); return Math.round((x - today) / 864e5); };
  const one = n => I18n.lang === 'bs' ? n % 10 === 1 && n % 100 !== 11 : n === 1; // "1 dan, 21 dan" / "1 day"
  const inDays = n => n === 0 ? t('pv.in.today') : n === 1 ? t('pv.in.tomorrow') : t(one(n) ? 'pv.in.day' : 'pv.in.days', { n });
  const toSana = days(7, 20);

  /* ---------- the page: the scenes (ph-a = number and title, ph-b = further down: photos, distance, note, map), then the information ---------- */
  function build() {
    const S = strips();
    const strip = key => `<div class="strip">${S[key].map((p, i) =>
      `<button type="button" style="--r:${[-1.6, 1.1, -.6, 1.5, -1.2, .7, -1.4][i % 7]}deg" data-f="${p.f}" data-w="${p.w}" data-c="${esc(p.c)}">` +
      `<img src="${p.t}" alt="${esc(p.c)}" loading="lazy" decoding="async"></button>`).join('')}</div>`;
    const hint = key => `<p class="hint"><i></i><span>${esc(t(key + (fine ? '.mouse' : '.touch')))}</span></p>`;
}
})();
