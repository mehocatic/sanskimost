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
    const SECTIONS = [
      { cls: 'short intro', a: `
          <p class="k">${esc(t('plan.eyebrow'))}</p>
          <h1 class="kin"><span class="ln">${esc(t('pv.title1'))}</span><span class="ln">${esc(t('pv.title2'))}</span></h1>
          <p class="now" id="now" hidden></p>
          <p class="rain" id="rain" hidden>${esc(t('pv.rain'))}</p>
          ${hint('pv.hint')}
          <button class="motion" id="motion" type="button" hidden>${esc(t('pv.motion'))}</button>`, extra: '<span class="cue" aria-hidden="true"></span>' },

      { cap: P('blihe', 'name'), a: `
          <span class="num" data-count="56">56<small>m</small></span>
          <h2 class="kin">${esc(P('blihe', 'name'))}</h2>
          <p>${esc(P('blihe', 'short'))}</p>
          ${hint('pv.print')}`, b: `
          <p class="k">${esc(t('pv.k.blihe'))}</p>
          <p>${esc(sentence('blihe', 'long', 'Blihin skok'))}</p>
          <p class="note">${esc(t('note.cvjetna'))}</p>
          <p class="meta"><span>${esc(t('routes.km', { km: 14 }))}</span>${links('blihe')}</p>
          ${strip('blihe')}` },

      { cap: P('kamengrad', 'name'), a: `
          <p class="k">${esc(t('pv.k.fort'))}</p>
          <span class="num mid">1374</span>
          <h2 class="kin">${esc(P('kamengrad', 'name'))}</h2>
          <p>${esc(P('kamengrad', 'short'))}</p>`, b: `
          <p class="k">${esc(t('pv.k.palanka'))}</p>
          <p>${esc(sentence('kamengrad', 'long', 'Palanka'))}</p>
          <p class="note">${esc(P('kamengrad', 'note'))}</p>
          <p class="meta"><span>${esc(I18n.see(bySlug.kamengrad)[0].text)}</span>${links('kamengrad')}</p>
          ${strip('kamengrad')}` },

      { cap: P('bobijasko-oko', 'name'), a: `
          <p class="k">${esc(t('pv.k.sink'))}</p>
          <h2 class="kin">${esc(P('bobijasko-oko', 'name'))}</h2>
          <p>${esc(P('bobijasko-oko', 'short'))}</p>
          <p>${esc(sentence('bobijasko-oko', 'long', [1, 0]))}</p>`, b: `
          <p class="k">${esc(t('pv.k.where'))}</p>
          <p>${esc(sentence('bobijasko-oko', 'long', 'Jezernic'))}</p>
          <p class="note">${esc(sentence('bobijasko-oko', 'note', [0, 0]))} ${esc(sentence('bobijasko-oko', 'note', [0, 1]))}</p>
          <p class="meta"><span>${esc(t('routes.km', { km: 20 }))}</span>${links('bobijasko-oko')}</p>
          ${strip('bobijasko-oko')}
          <p class="hint"><i></i><span>${esc(t('pv.follow'))}</span></p>` },

      { cap: P('dabarska', 'name'), a: `
          <p class="k">${esc(t('pv.k.under'))}</p>
          <span class="num" data-count="200">200<small>m</small></span>
          <h2 class="kin">${esc(P('dabarska', 'name'))}</h2>
          <p>${esc(sentence('dabarska', 'long', '200 m'))}</p>
          ${hint('pv.lamp')}`, b: `
          <p class="k">${esc(t('pv.k.dabar'))}</p>
          <p>${esc(sentence('dabarska', 'long', [2, 1]))}</p>
          <p class="note">${esc(P('dabarska', 'note'))}</p>
          <p class="meta">${links('dabarska')}</p>
          ${strip('dabarska')}` },

      { cap: P('hrustovacka', 'name'), a: `
          <p class="k">${esc(t('pv.k.hall'))}</p>
          <span class="num" data-scrub="500">0<small>m</small></span>
          <h2 class="kin">${esc(P('hrustovacka', 'name'))}</h2>
          <p>${esc(sentence('hrustovacka', 'long', '500 m'))}</p>`, b: `
          <p class="k">${esc(t('pv.k.prehistory'))}</p>
          <p>${esc(P('hrustovacka', 'short'))}</p>
          <p class="note">${esc(P('hrustovacka', 'note'))}</p>
          <p class="meta"><span>${esc(t('routes.km', { km: 13 }))}</span><span>${esc(t('pv.free'))}</span>${links('hrustovacka')}</p>
          ${strip('hrustovacka')}` },

      { cap: P('mulez', 'name'), a: `
          <p class="k">${esc(t('pv.k.ferrata'))}</p>
          <span class="num" data-scrub="90">0<small>m</small></span>
          <h2 class="kin">${esc(P('mulez', 'name'))}</h2>
          <p>${esc(sentence('mulez', 'long', '90 m'))}</p>`, b: `
          <div class="big"><b>60<small style="font-size:.4em"> m</small></b><span>${esc(sentence('mulez', 'long', '60 m'))}</span></div>
          <p class="note">${esc(P('mulez', 'note'))}</p>
          <p class="meta">${links('mulez')}</p>
          ${strip('mulez')}` },

      { cap: t('grad.skokovi-masinski'), a: `
          <p class="k">${esc(t('plan.sum.eyebrow'))}</p>
          <span class="num mid">1997</span>
          <h2 class="kin">${esc(t('plan.sum.title'))}</h2>
          <p>${esc(t('plan.sum.fest'))}</p>`, b: `
          <div class="big"><b data-count="${toSana}">${toSana}</b><span>${esc(toSana === 0 ? t('pv.sana.today') : t(one(toSana) ? 'pv.sana.day' : 'pv.sana.days'))}</span></div>
          <p class="note">${esc(t('plan.sum.swim'))}</p>
          ${strip('sana')}` }
    ];

    const YEAR = [['plan.y.spring'], ['plan.y.summer'], ['plan.y.musalla', firstFridayJuly()], ['plan.y.sana', toSana], ['plan.y.oct', days(10, 10)]];
    const RIVER = ['plan.sum.fish', 'plan.sum.kayak'];
    const PLAN = `
      <section class="plan on-deep" id="plan" aria-labelledby="plan-t">
        <header class="plan-head rv"><h2 id="plan-t">${esc(t('plan.before.title'))}</h2><p>${esc(t('plan.lead'))}</p></header>
        <div class="blocks">
          <div class="blk rv">
            <span class="k">${esc(t('plan.get.title'))}</span>
            <ul class="roads">
              <li><span class="t">1 h 45</span><span class="c">Bihać</span><span class="d">${esc(t('plan.get.bihac'))}</span></li>
              <li><span class="t">2 h 45</span><span class="c">Zagreb</span><span class="d">${esc(t('plan.get.zagreb'))}</span></li>
              <li><span class="t">4 h</span><span class="c">Sarajevo</span><span class="d">${esc(t('plan.get.sarajevo'))}</span></li>
            </ul>
            <dl>
              <div><dt>${esc(t('plan.get.air.k'))}</dt><dd>${esc(t('plan.get.air'))}</dd></div>
              <div><dt>${esc(t('plan.get.bus.k'))}</dt><dd>${esc(t('plan.get.bus'))}</dd></div>
              <div><dt>${esc(t('plan.get.town.k'))}</dt><dd>${esc(t('plan.get.town'))}</dd></div>
            </dl>
            <p class="fine">${esc(t('plan.get.note'))}</p>
          </div>
          <div class="blk rv">
            <span class="k">${esc(t('plan.stay.title'))}</span>
            <div class="stay">
              <p><b data-count="279">279</b><span>${esc(t('plan.stay.beds'))}</span></p>
              <p><b data-count="4">4</b><span>${esc(t('plan.stay.hotels'))}</span></p>
              <p><b data-count="25">25</b><span>${esc(t('plan.stay.private'))}</span></p>
            </div>
            <p>${esc(t('plan.stay.lead'))}</p>
            <p>${esc(t('plan.stay.tip'))}</p>
            <div class="spa"><span class="k">${esc(t('plan.stay.spa.k'))}</span><h3>${esc(t('plan.stay.spa.t'))}</h3><p>${esc(t('plan.stay.spa'))}</p></div>
            <p><a href="https://exploresanskimost.ba/planiraj-posjetu/" rel="noopener" target="_blank">${esc(t('plan.stay.list'))} ↗</a></p>
            <p class="fine">${esc(t('plan.stay.tz'))} · Prijedorska 5 · <a href="tel:+38761355120">061 355 120</a></p>
          </div>
          <div class="blk wide rv">
            <span class="k">${esc(t('plan.when.eyebrow'))}</span>
            <ul class="year">${YEAR.map(([k, n]) => `<li><b>${esc(t(k + '.when'))}</b><span>${esc(t(k))}</span>${n == null ? '' : `<em>${esc(inDays(n))}</em>`}</li>`).join('')}</ul>
          </div>
          <div class="blk wide rv">
            <span class="k">${esc(t('pv.river.t'))}</span>
            <p>${esc(t('plan.sum.lead'))}</p>
            <ul class="river">${RIVER.map(k => `<li><h3>${esc(t(k + '.t'))}</h3><p>${esc(t(k))}</p></li>`).join('')}</ul>
          </div>
          <div class="blk wide">
            <span class="k rv">${esc(t('plan.routes.title'))}</span>
            <ol class="rcards" id="plan-routes"></ol>
          </div>
        </div>
        <div class="end rv">
          <h3>${esc(t('plan.cta.title'))}</h3>
          <a class="cta" href="explore">${esc(t('plan.cta.btn'))} <span aria-hidden="true">→</span></a>
        </div>
        <p class="fine" style="margin-top:2.4rem">${esc(t('routes.conditions'))} ${esc(t('pv.weather'))}</p>
      </section>`;

    main.innerHTML = SECTIONS.map((s, i) => `<section class="sc ${s.cls || ''} ${SCENES[i].print ? 'has-print' : ''}" data-i="${i}" style="--bg:url('${SCENES[i].src}')"><div class="sc-in">` +
      (s.cap ? `<p class="cap">${esc(s.cap)}</p>` : '') +
      `<div class="stack"><div class="tx ph-a">${s.a}</div>${s.b ? `<div class="tx ph-b">${s.b}</div>` : ''}</div>${s.extra || ''}</div></section>`).join('') + PLAN;
    secs = [...main.querySelectorAll('.sc')];
    routes();
    showWeather();
    if (motionWanted) document.getElementById('motion').hidden = false;
    document.getElementById('lb-x').textContent = t('lb.close');
    lb.setAttribute('aria-label', t('pv.photo'));
    document.title = t('plan.doctitle');
    const og = document.querySelector('meta[property="og:title"]');
    if (og) og.content = document.title;
  }

  /* ---------- routes (routes.js): a fan of the stops' photos, then the stops ---------- */
  function routes() {
    const { photo, photoEntry } = window.PlacesLib;
    const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
    const cover = slug => { const p = bySlug[slug], e = photoEntry(p.photos && p.photos[0]); return photo(e.src, P(slug, 'name'), null, false); };
    document.getElementById('plan-routes').replaceChildren(...ROUTES.map((r, i) => {
      const li = el('li', 'rcard');
      const fan = el('a', 'rc-fan'); fan.href = `explore?route=${encodeURIComponent(r.id)}`;
      fan.setAttribute('tabindex', '-1'); fan.setAttribute('aria-hidden', 'true');
      r.stops.filter(s => bySlug[s.slug]).slice(0, 3).forEach(s => { const f = el('span', 'rc-photo'); f.appendChild(cover(s.slug)); fan.appendChild(f); });
      const body = el('div', 'rc-body');
      body.append(el('p', 'rc-num', String(i + 1).padStart(2, '0')), el('h3', 'rc-name', t(`route.${r.id}.name`)), el('p', 'rc-text', t(`route.${r.id}.text`)));
      const stops = el('ol', 'rc-stops');
      r.stops.forEach(s => {
        if (!bySlug[s.slug]) return;
        const st = el('li'), a = el('a', null, P(s.slug, 'name')); a.href = page(s.slug); st.appendChild(a);
        if (s.km) st.appendChild(el('span', 'rc-km', t(bySlug[s.slug].kmKey || 'routes.km', { km: s.km })));
        stops.appendChild(st);
      });
      body.appendChild(stops);
      if (r.extra) body.appendChild(el('p', 'rc-extra', t(r.extra)));
      const m = el('a', 'rc-map', t('routes.map')); m.href = `explore?route=${encodeURIComponent(r.id)}`; body.appendChild(m);
      li.append(fan, body);
      return li;
    }));
  }

  /* ---------- live: the weather in town now (Open-Meteo, CC BY 4.0) ---------- */
  let raining = false, wx = null;
  const SKY = c => c === 0 ? 'clear' : c <= 2 ? 'partly' : c === 3 ? 'cloudy' : c <= 48 ? 'fog' : c <= 57 ? 'drizzle' : c <= 67 ? 'rain'
    : c <= 77 ? 'snow' : c <= 82 ? 'showers' : c <= 86 ? 'snow' : 'storm'; // WMO weather codes
  function showWeather() {
    const now = document.getElementById('now'), rain = document.getElementById('rain');
    if (!now || !wx) return;
    rain.hidden = !raining;
    now.textContent = t('pv.now', { t: Math.round(wx.temp), sky: t('pv.sky.' + SKY(wx.code)) }) + (wx.hm ? ' ' + t(wx.past ? 'pv.sunset.past' : 'pv.sunset', { hm: wx.hm }) : '');
    now.hidden = false;
  }
  (async () => {
    try {
      const ac = new AbortController(); setTimeout(() => ac.abort(), 7000);
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,precipitation,weather_code&daily=sunset&forecast_days=1&timezone=Europe%2FSarajevo`, { signal: ac.signal });
      if (!r.ok) return;
      const j = await r.json(), c = j.current || {};
      if (typeof c.temperature_2m !== 'number') return;
      raining = c.precipitation > 0 || (c.weather_code >= 51 && c.weather_code <= 67) || (c.weather_code >= 80 && c.weather_code <= 82) || c.weather_code >= 95;
      const set = j.daily && j.daily.sunset && j.daily.sunset[0], hm = set ? set.slice(11, 16) : '';
      const past = !!set && new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/Sarajevo', hour: '2-digit', minute: '2-digit' }) > hm;
      wx = { temp: c.temperature_2m, code: c.weather_code, hm, past };
      showWeather();
      const now = document.getElementById('now');
      if (window.gsap && !reduce && now) gsap.fromTo(now, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
    } catch (e) { /* no weather: nothing is shown */ }
  })();

  /* ---------- tilting the phone ---------- */
  // Android sends the events without asking; iPhone asks once, after a tap on the button. Without it everything still runs on scroll.
  const tilt = { x: 0, y: 0, b0: null, g0: 0, jolt: 0 };
  function onTilt(e) {
    if (e.beta == null || e.gamma == null) return;
    if (tilt.b0 === null) { tilt.b0 = e.beta; tilt.g0 = e.gamma; }
    // the way the phone is held slowly becomes "level", so holding it still calms everything down
    tilt.b0 += (e.beta - tilt.b0) * .004; tilt.g0 += (e.gamma - tilt.g0) * .004;
    const tx = Math.max(-1, Math.min(1, (e.gamma - tilt.g0) / 28)), ty = Math.max(-1, Math.min(1, (e.beta - tilt.b0) / 28));
    tilt.jolt += Math.abs(tx - tilt.x) + Math.abs(ty - tilt.y);
    tilt.x += (tx - tilt.x) * .25; tilt.y += (ty - tilt.y) * .25;
  }
  const DOE = window.DeviceOrientationEvent;
  let motionWanted = false;
  if (!fine && DOE && !reduce) {
    if (typeof DOE.requestPermission === 'function') motionWanted = true;
    else addEventListener('deviceorientation', onTilt);
  }

  /* ---------- the page ---------- */
  const main = document.getElementById('main');
  const lb = document.getElementById('lb'), lbImg = document.getElementById('lb-img'), lbCap = document.getElementById('lb-cap');
  let secs = [];
  build();

  main.addEventListener('click', e => {
    if (e.target.closest('#motion')) {
      DOE.requestPermission().then(r => { if (r === 'granted') { addEventListener('deviceorientation', onTilt); motionWanted = false; document.getElementById('motion').hidden = true; } }).catch(() => {});
      return;
    }
    // a photo of the row: the lightbox, never larger than the photo itself
    const b = e.target.closest('.strip button'); if (!b) return;
    lbImg.src = b.dataset.f; lbImg.alt = b.dataset.c; lbImg.style.setProperty('--nw', b.dataset.w + 'px'); lbCap.textContent = b.dataset.c;
    lb.showModal ? lb.showModal() : lb.setAttribute('open', '');
  });
  lb.addEventListener('click', () => lb.close ? lb.close() : lb.removeAttribute('open'));

  /* ================= WebGL: water over the photos ================= */
  const canvas = document.getElementById('gl');
  const gl = !reduce && canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  const halfOk = gl && (gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
  if (!gl) document.documentElement.classList.add('nogl');

  const VS = `#version 300 es
  in vec2 p; out vec2 vUv;
  void main() { vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;

  // where a photo lands on the screen: like object-fit: cover around its focus, never larger than its natural size
  const COVER = `
  vec2 coverQ(vec2 nat, vec2 foc, vec2 uv, out float inside) {
    vec2 px = uv * uRes;
    float s = min(max(uRes.x / nat.x, uRes.y / nat.y), 1.);
    vec2 size = nat * s;
    vec2 over = size - uRes;
    vec2 off = vec2(over.x > 0. ? -over.x * foc.x : -over.x * .5, over.y > 0. ? -over.y * foc.y : -over.y * .5);
    vec2 q = (px - off) / size;
    vec2 e = smoothstep(vec2(0.), vec2(.045), q) * smoothstep(vec2(1.), vec2(.955), q);
    inside = (over.x >= 0. ? 1. : e.x) * (over.y >= 0. ? 1. : e.y);
    return q;
  }`;

  // wave equation on a grid: R = height now, G = height a step ago; drops push the surface down.
  // On land (the mask of the photo is black) the surface is held flat, so the waves stop and bounce at the shore.
  const SIM = `#version 300 es
  precision highp float;
  uniform sampler2D uS, uM; uniform vec2 uTx, uRes; uniform vec4 uD[16], uMIm; uniform int uN; uniform float uAsp;
  in vec2 vUv; out vec4 o;
  ${COVER}
  void main() {
    vec4 s = texture(uS, vUv);
    float h = (texture(uS, vUv - vec2(uTx.x, 0.)).r + texture(uS, vUv + vec2(uTx.x, 0.)).r +
               texture(uS, vUv - vec2(0., uTx.y)).r + texture(uS, vUv + vec2(0., uTx.y)).r) * .5 - s.g;
    h *= .976;
    for (int i = 0; i < 16; i++) {
      if (i >= uN) break;
      vec2 d = vUv - uD[i].xy; d.x *= uAsp;
      h -= uD[i].w * exp(-dot(d, d) / (uD[i].z * uD[i].z));
    }
    float ins; vec2 q = coverQ(uMIm.xy, uMIm.zw, vUv, ins);
    h *= smoothstep(.12, .6, texture(uM, clamp(q, 0., 1.)).r * ins);
    o = vec4(clamp(h, -2.5, 2.5), s.r, 0., 1.);
  }`;

  const FS = `#version 300 es
  precision highp float;
  uniform sampler2D uA, uB, uS, uW, uP, uMA, uMB;
  uniform vec2 uRes, uTx, uLight, uLightV, uC, uTilt, uWBand;
  uniform vec4 uImA, uImB, uPR, uClear;
  uniform float uMix, uTime, uDarkA, uDarkB, uSim, uLightR, uLampI, uKind, uRmax, uWA, uWB, uPRot, uPA, uPOwn;
  uniform float uFogA, uFogB, uFogP, uSunA, uSunB, uSunP;
  in vec2 vUv; out vec4 o;

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
  float fbm(vec2 p) { float v = 0., a = .5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= .5; } return v; }
  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
  ${COVER}
  // a photo on the screen; where a smaller photo does not reach the edge of a large screen, it fades into the dark (alpha)
  vec4 sampleImg(sampler2D t, vec2 nat, vec2 foc, vec2 uv) { float ins; vec2 q = coverQ(nat, foc, uv, ins); return vec4(texture(t, clamp(q, 0., 1.)).rgb, ins); }
  // how much water the photo has at this point (its mask: white = water)
  float maskAt(sampler2D m, vec2 nat, vec2 foc, vec2 uv) { float ins; vec2 q = coverQ(nat, foc, uv, ins); return texture(m, clamp(q, 0., 1.)).r * ins; }

  void main() {
    vec2 uv = vUv;
    float asp = uRes.x / uRes.y;
    bool moving = uMix > .001 && uMix < .999;

    // k: where the next scene already is; band: the moving edge of the water
    float k, band = 0., dist = 0.;
    vec2 d = vec2(0.);
    if (uKind < .5) {
      // the water rises from below
      float front = uMix * 1.3 - .15;
      float edge = uv.y + (fbm(vec2(uv.x * 3.2, uTime * .25)) - .5) * .16 + sin(uv.x * 9. + uTime * 1.7) * .012;
      k = smoothstep(front + .035, front - .035, edge);
      band = moving ? exp(-pow((edge - front) / .07, 2.)) : 0.;
    } else {
      // the water drains into the sinkhole of Bobijaško oko, turning, and the cave opens where it went
      d = (uv - uC) * vec2(asp, 1.);
      dist = length(d);
      float wob = (fbm(vec2(atan(d.y, d.x) * 1.6 + uTime * .5, uTime * .3)) - .5) * .07;
      float R = uMix * uRmax;
      k = smoothstep(R + .03, R - .03, dist + wob);
      band = moving ? exp(-pow((dist + wob - R) / .06, 2.)) : 0.;
    }

    // the water surface: slope of the height field, only where the photo has water
    float wm = mix(maskAt(uMA, uImA.xy, uImA.zw, uv), maskAt(uMB, uImB.xy, uImB.zw, uv), k);
    vec2 n = vec2(0.);
    if (uSim > .5) {
      float l = texture(uS, uv - vec2(uTx.x, 0.)).r, r = texture(uS, uv + vec2(uTx.x, 0.)).r;
      float dn = texture(uS, uv - vec2(0., uTx.y)).r, u = texture(uS, uv + vec2(0., uTx.y)).r;
      n = clamp(vec2(l - r, dn - u), -.5, .5);
    }
    n = (n + uTilt * .06) * wm;
    vec2 refr = n * .026;

    vec2 uvA, uvB; float shadeA = 1.;
    if (uKind < .5) {
      uvA = uv + vec2(0., band * .018) + refr;
      uvB = uv + refr - vec2(0., band * .018) + vec2(0., (1. - uMix) * .05 * k);
    } else {
      float ang = uMix * 4.2 * exp(-dist * 1.4);
      vec2 dA = rot(ang) * d * (1. - uMix * .3 * exp(-dist * 2.));
      uvA = uC + dA / vec2(asp, 1.) + refr;
      uvB = uC + (uv - uC) * (1. + (1. - uMix) * .22) + refr * 1.3;
      shadeA = 1. - .6 * uMix * smoothstep(uMix * uRmax + .45, uMix * uRmax, dist);
    }

    vec4 a = sampleImg(uA, uImA.xy, uImA.zw, uvA);
    vec4 b = sampleImg(uB, uImB.xy, uImB.zw, uvB);
    vec3 deep = vec3(.051, .071, .063);
    vec3 ca = mix(deep, a.rgb, a.a) * shadeA, cb = mix(deep, b.rgb, b.a);
    vec3 col = mix(ca, cb, k);

    // Kamengrad: warm evening light moving slowly over the walls
    float sunAmt = mix(uSunA, uSunB, k);
    if (sunAmt > .001) {
      float sx = uv.x * asp * .9 - uv.y * .45;
      float glow = exp(-pow((sx - mix(-.7, asp * .9 + .2, uSunP)) / .4, 2.));
      col = mix(col, col * (.8 + glow * vec3(.62, .42, .2)) + glow * vec3(.05, .03, .0), sunAmt);
    }

    // Mulež: fog over the valley, thinner the higher you climb; the finger or mouse parts it
    float fogAmt = mix(uFogA, uFogB, k) * uFogP;
    if (fogAmt > .001) {
      vec2 fp = uv * vec2(asp, 1.);
      float f1 = fbm(fp * 2.2 + vec2(uTime * .025, uTime * .006));
      float f2 = fbm(fp * 4.5 - vec2(uTime * .04, 0.) + f1);
      float fog = smoothstep(.32, .82, f1 * .65 + f2 * .45) * (smoothstep(1.05, .2, uv.y) * .6 + .4);
      vec2 cd = (uv - uClear.xy) * vec2(asp, 1.);
      fog *= 1. - uClear.z * exp(-dot(cd, cd) / .025);
      col = mix(col, vec3(.86, .88, .89), clamp(fog * fogAmt, 0., .9));
    }

    // the names of the nine rivers on the river itself (intro only): laid out to fit the screen, so all nine are seen
    float wa = mix(uWA, uWB, k);
    if (wa > .001) {
      float wy = (uv.y * uRes.y - uWBand.x) / uWBand.y;
      if (wy > 0. && wy < 1.) {
        float row = floor(wy * 4.);
        vec2 wuv = vec2(uv.x + sin(uTime * .35 + row * 1.7) * .006, wy) + (refr + uTilt * .004) * 1.6;
        float w = texture(uW, clamp(wuv, 0., 1.)).a;
        col = mix(col, vec3(.97, .95, .9), w * .62 * wa * mix(.7, 1., smoothstep(.2, .7, wm)));
      }
    }

    // the cave: dark, lit only by the lamp; a quick move stretches the beam
    float dark = mix(uDarkA, uDarkB, k);
    if (dark > .001) {
      vec2 lp = (uv * uRes - uLight) / uLightR;
      float sp = length(uLightV);
      if (sp > .5) { vec2 vd = uLightV / sp; lp -= vd * dot(lp, vd) * (1. - 1. / (1. + min(sp * .03, .8))); }
      float flick = .94 + .06 * noise(vec2(uTime * 7., 1.3));
      float lit = exp(-dot(lp, lp) * 1.6) * flick * uLampI;
      float halo = exp(-dot(lp, lp) * .22) * .14 * uLampI;
      vec3 lamp = col * (lit * 1.45 + halo) * vec3(1.06, .96, .82);
      col = mix(col, lamp + col * .02, dark);
    }

    // light on the slopes of the waves, and the moving edge catching the light
    vec3 N = normalize(vec3(n * 9., 1.));
    float spec = pow(max(dot(N, normalize(vec3(-.35, .55, 1.))), 0.), 140.) * smoothstep(.05, .4, wm);
    col += spec * .32 * (1. - dark * .7);
    col += band * .07;

    // an old photograph floating on the water: moved by the waves, covered by the next water
    if (uPOwn > -.5) {
      float pa = uPA * (uPOwn < .5 ? 1. - k : k);
      if (pa > .001) {
        vec2 lp = rot(-uPRot) * (uv * uRes + n * 16. - uPR.xy);
        vec2 sd = max(abs(lp + vec2(-9., 16.)) - uPR.zw, 0.);
        col *= 1. - .5 * exp(-dot(sd, sd) / 500.) * pa;
        float e = min(uPR.z - abs(lp.x), uPR.w - abs(lp.y));
        float al = clamp(e + .5, 0., 1.) * pa;
        if (al > 0.) {
          vec3 pc = texture(uP, lp / (2. * uPR.zw) + .5).rgb;
          pc *= .9 + dot(n, vec2(.6, .9)) * 1.2;
          pc += spec * .3;
          col = mix(col, pc, al);
        }
      }
    }

    // shade at the bottom (for the text) and a little at the top (for the menu)
    col *= mix(1., .36, smoothstep(.58, 0., uv.y));
    col *= mix(1., .7, smoothstep(.84, 1., uv.y));
    float vig = smoothstep(1.25, .35, length((uv - .5) * vec2(asp, 1.) * .9));
    col *= mix(.72, 1., vig);
    col += (hash(uv * uRes + fract(uTime) * 91.) - .5) * .035;
    o = vec4(col, 1.);
  }`;
})();
