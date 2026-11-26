// Visit page (plan.html): every place is a postcard.
// - Front: a photo of the place (never shown larger than its natural size), the name, the distance and the direction from the centre.
//   Back (tap or click): the place written like a postcard (its short text), a P.S. with the practical note, a stamp with the distance,
//   and links to the place page and the map. The stamp is an older photo of the place where the site has one.
// - "Add to plan" puts a postcard into the envelope at the bottom of the screen. The plan is sorted from the nearest place to the
//   farthest, opens on the map (explore?places=...) and can be sent as a link (plan?p=...). It is kept in localStorage when there is one.
// - Ready plans are the routes of routes.js; taking one adds its places to the plan.
// - Under that: getting here, where to stay, the year (with a needle at today) and summer on the Sana.
// Distances: the km a place text or FACTS.md gives; otherwise the straight-line distance from the centre, computed from the coordinates
// in places.js / poi.js and labelled "as the crow flies". Directions are computed the same way. Nothing else is added to the texts.
// Live: the weather in town now (Open-Meteo, CC BY 4.0) on the postmark at the top.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const phone = matchMedia('(max-width: 760px)');
  const t = (k, v) => I18n.t(k, v);
  const bySlug = Object.fromEntries(PLACES.map(p => [p.slug, p]));
  const P = (slug, f) => bySlug[slug] ? I18n.place(bySlug[slug], f) : '';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = id => document.getElementById(id);
  const main = $('main');
  const CENTRE = [44.7638251, 16.6648616]; // Hamzibegova džamija, OSM way 346178044

  /* ---------- dates ---------- */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const next = (m, d) => { let x = new Date(today.getFullYear(), m - 1, d); if (x < today) x = new Date(today.getFullYear() + 1, m - 1, d); return x; };
  const firstFriJuly = () => { const f = y => { const d = new Date(y, 6, 1); d.setDate(1 + (5 - d.getDay() + 7) % 7); return d; };
    let x = f(today.getFullYear()); if (x < today) x = f(today.getFullYear() + 1); return x; };
  const daysTo = d => Math.round((d - today) / 864e5);
  const one = n => I18n.lang === 'bs' ? n % 10 === 1 && n % 100 !== 11 : n === 1;
  const inDays = n => n === 0 ? t('pv.in.today') : n === 1 ? t('pv.in.tomorrow') : t(one(n) ? 'pv.in.day' : 'pv.in.days', { n });
  const dmy = d => `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;

  /* ---------- the postcards ----------
     img: [file, srcset] of the front photo; stamp: the photo on the stamp; km: distance a text gives (air: it is a straight line);
     ps: the P.S. on the back; when / entry: extra lines on the back. The texts are the place texts or existing keys. */
  const CARDS = [
    { id: 'blihe', tags: ['water', 'nature'], img: ['photos/bliha3.webp', 'photos/bliha3-721.webp 721w, photos/bliha3.webp 1080w'], stamp: 'photos/arhiv/blihe-1942.webp', km: 14, ps: () => t('note.cvjetna') },
    { id: 'sana', tags: ['water', 'town'], img: ['photos/grad/masinski-most-sumrak.webp'], stamp: 'photos/arhiv/sana-1912.webp', coords: CENTRE, map: 'explore#water',
      name: () => t('vis.sana.name'), msg: () => t('plan.sum.swim'), ps: () => t('plan.sum.kayak'), when: () => `${t('plan.y.sana.when')} · ${inDays(daysTo(next(7, 20)))}` },
    { id: 'kamengrad', tags: ['past'], img: ['photos/kamengrad.webp'], stamp: 'photos/kamengrad2.webp', ps: () => P('kamengrad', 'note') },
    { id: 'hamzibegova', tags: ['past', 'town'], img: ['photos/hamzibegova5.webp', 'photos/hamzibegova5-626.webp 626w, photos/hamzibegova5.webp 1024w'], stamp: 'photos/arhiv/hamzibegova-1946.webp' },
    { id: 'dabarska', tags: ['cave', 'water'], img: ['photos/dabarska7.webp'], stamp: 'photos/dabarska6.jpg', ps: () => P('dabarska', 'note') },
    { id: 'hrustovacka', tags: ['cave', 'past'], img: ['photos/hrustovacka3.webp'], stamp: 'photos/hrustovacka4.webp', km: 13, ps: () => P('hrustovacka', 'note'), entry: () => t('pv.free') },
    { id: 'bobijasko-oko', tags: ['water', 'nature'], img: ['photos/bobijasko-oko2.webp'], stamp: 'photos/bobijasko-oko4.webp', km: 20, ps: () => t('note.bobijasko'), when: () => t('plan.y.spring.when') },
    { id: 'mulez', tags: ['nature'], img: ['photos/mulez4.webp', 'photos/mulez4-675.webp 675w, photos/mulez4.webp 1200w'], stamp: 'photos/mulez3.jpg', ps: () => P('mulez', 'note') },
    { id: 'musalla', tags: ['past'], img: ['photos/musalla.webp'], stamp: 'photos/arhiv/musala-razglednica.webp', ps: () => t('plan.y.musalla'),
      when: () => `${t('plan.y.musalla.when')} · ${inDays(daysTo(firstFriJuly()))}` },
    { id: 'grmec-forest', tags: ['nature'], img: ['photos/grmec3.webp'], stamp: 'photos/grmec.jpg', km: 17, air: true },
    { id: 'korcanica', tags: ['past', 'nature'], img: ['photos/korcanica-snijeg.webp'], stamp: 'photos/arhiv/korcanica-razglednica-1001.webp', km: 32 },
    { id: 'stari-majdan-most', tags: ['past'], img: ['photos/stari-majdan-most-1080.webp'], stamp: 'photos/stari-majdan-most-1080.webp' },
    { id: 'zavnobih', tags: ['past', 'town'], img: ['photos/zavnobih.webp'], stamp: 'photos/arhiv/delegati-zavnobih.webp' },
    { id: 'turbe-alagic', tags: ['past'], img: ['photos/turbe3.webp'], stamp: 'photos/turbe.webp' },
    { id: 'susnjar', tags: ['past'], img: ['photos/susnjar-1080.webp'], stamp: 'photos/susnjar-1080.webp' }
  ];
  const card = Object.fromEntries(CARDS.map(c => [c.id, c]));
  const TAGS = ['water', 'cave', 'past', 'nature', 'town'];
  const tagName = k => ({ water: t('cat.water'), nature: t('cat.nature'), past: t('cat.history'), cave: t('vis.f.cave'), town: t('vis.f.town') }[k]);
  const nameOf = c => c.name ? c.name() : P(c.id, 'name');
  const thumb = c => c.img[1] ? c.img[1].split(' ')[0] : c.img[0];

  /* ---------- where: distance and direction from the centre ---------- */
  const poi = id => (typeof POI !== 'undefined' ? POI : []).find(p => p.slug === id && p.coords); // poi.js declares POI with const, so it is not on window
  const coordsOf = c => c.coords || (bySlug[c.id] && bySlug[c.id].coords) || (poi(c.id) && poi(c.id).coords) || null;
  const rad = d => d * Math.PI / 180;
  function geo(c) {
    const co = coordsOf(c);
    if (!co) return null;
    const [a1, b1] = CENTRE.map(rad), [a2, b2] = co.map(rad);
    const h = Math.sin((a2 - a1) / 2) ** 2 + Math.cos(a1) * Math.cos(a2) * Math.sin((b2 - b1) / 2) ** 2;
    const km = 2 * 6371 * Math.asin(Math.sqrt(h));
    const y = Math.sin(b2 - b1) * Math.cos(a2), x = Math.cos(a1) * Math.sin(a2) - Math.sin(a1) * Math.cos(a2) * Math.cos(b2 - b1);
    const deg = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    return { km, dir: Math.round(deg / 45) % 8 };
  }
  const num = km => km >= 10 ? String(Math.round(km)) : (Math.round(km * 10) / 10).toString().replace('.', I18n.lang === 'bs' ? ',' : '.');
  const centre = c => { const g = geo(c); return g && g.km < .4; };
  const kmOf = c => c.km || (geo(c) ? geo(c).km : Infinity);
  const dirWord = c => { const g = geo(c); return g && g.km >= .4 ? t('vis.dirs').split(',')[g.dir] : ''; };
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
  function distLong(c) {
    if (c.km) return c.air ? t('vis.air', { km: c.km }) : t('routes.km', { km: c.km });
    const g = geo(c);
    if (!g) return t('vis.noloc');
    return g.km < .4 ? t('vis.centre') : t('vis.air', { km: num(g.km) });
  }
  function distShort(c) {
    if (centre(c)) return t('vis.centre');
    const g = geo(c);
    const km = c.km || (g ? num(g.km) : null);
    return [km ? `${km} km` : '', dirWord(c)].filter(Boolean).join(' · ');
  }

  /* ---------- the postmark: town on top, a date or a word below, a word in the middle ---------- */
  let pmN = 0;
  function postmark(top, bottom, mid, small) {
    const n = ++pmN;
    return `<svg viewBox="0 0 120 120" aria-hidden="true">
      <defs><path id="pmt${n}" d="M 19,60 A 41,41 0 0 1 101,60"/><path id="pmb${n}" d="M 11,60 A 49,49 0 0 0 109,60"/></defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width="2.6"/>
      <circle cx="60" cy="60" r="37" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <text font-size="10" font-weight="500" letter-spacing="1.6" text-anchor="middle"><textPath href="#pmt${n}" startOffset="50%">${esc(top.toUpperCase())}</textPath></text>
      <text font-size="9.5" font-weight="500" letter-spacing="1.4" text-anchor="middle"><textPath href="#pmb${n}" startOffset="50%">${esc(bottom.toUpperCase())}</textPath></text>
      <text x="60" y="${small ? 62 : 66}" font-size="${small ? 13 : 21}" font-weight="500" text-anchor="middle">${esc(mid)}</text>
      ${small ? `<text x="60" y="79" font-size="8.5" text-anchor="middle">${esc(small)}</text>` : ''}
    </svg>`;
  }

  /* ---------- the plan ---------- */
  const KEY = 'visit-plan';
  let plan = [], received = false;
  try { plan = JSON.parse(localStorage.getItem(KEY) || '[]').filter(id => card[id]); } catch (e) { plan = []; }
  const qp = new URLSearchParams(location.search).get('p');
  if (qp) {
    const ids = [...new Set(qp.split(',').filter(id => card[id]))];
    if (ids.length) { plan = ids; received = true; }
    history.replaceState(null, '', location.pathname + location.hash);
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch (e) { /* the plan is not remembered */ } };
  save();
  const sorted = () => plan.slice().sort((a, b) => kmOf(card[a]) - kmOf(card[b]));
  const countText = n => t(one(n) ? 'vis.plan.one' : 'vis.plan.many', { n });

  /* ---------- page ---------- */
  let filter = 'all';
  const PLUS = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function cardHTML(c, i) {
    const name = nameOf(c), inPlan = plan.includes(c.id), rot = [-1.6, 1.2, -.7, 1.8, -1.2, .6, -1.9, 1][i % 8];
    const msg = c.msg ? c.msg() : P(c.id, 'short');
    const ps = c.ps ? c.ps() : '';
    const dir = dirWord(c);
    const lines = [[t('vis.k.dist'), distLong(c)]];
    if (dir) lines.push([t('vis.k.dir'), cap(t('vis.dir.from', { dir }))]);
    if (c.when) lines.push([t('vis.k.when'), c.when()]);
    if (c.entry) lines.push([t('vis.k.entry'), c.entry()]);
    const page = bySlug[c.id] ? `<a href="place?slug=${encodeURIComponent(c.id)}">${esc(t('vis.more'))} →</a>` : '';
    const map = c.map ? `<a href="${c.map}">${esc(t('vis.map'))} →</a>` : coordsOf(c) ? `<a href="explore?place=${encodeURIComponent(c.id)}">${esc(t('vis.map'))} →</a>` : '';
    const stampVal = c.km ? `${c.km} km` : centre(c) ? '0 km' : geo(c) ? `${num(geo(c).km)} km` : '';
    return `<li data-id="${c.id}" data-tags="${c.tags.join(' ')}">
      <article class="pc${inPlan ? ' in-plan' : ''}" style="--rot:${rot}deg;--rot0:${rot}deg" aria-label="${esc(name)}">
        <div class="pc-in">
          <div class="pc-face pc-front">
            <button class="pc-flip" type="button" aria-label="${esc(t('vis.turn', { name }))}">
              <span class="pc-photo"><img src="${c.img[0]}"${c.img[1] ? ` srcset="${c.img[1]}" sizes="(max-width: 760px) 78vw, 300px"` : ''} alt="${esc(name)}" loading="lazy" decoding="async" draggable="false"></span>
              <span class="pc-cap"><span class="pc-name">${esc(name)}</span><span class="pc-dist">${esc(distShort(c))}</span></span>
            </button>
            <span class="pc-turn" aria-hidden="true">↻</span>
            <button class="pc-add" type="button" aria-pressed="${inPlan}" aria-label="${esc(t(inPlan ? 'vis.remove.aria' : 'vis.add.aria', { name }))}">${PLUS}</button>
            <span class="pc-mark" aria-hidden="true">${esc(t('vis.added'))}</span>
          </div>
          <div class="pc-face pc-back" inert>
            <div class="pc-top">
              <h3>${esc(name)}</h3>
              <span class="stamp"><img src="${c.stamp}" alt="" loading="lazy" decoding="async">${stampVal ? `<b>${esc(stampVal)}</b>` : ''}</span>
            </div>
            <span class="pm">${postmark('Sanski Most', tagName(c.tags[0]), dmy(today).slice(0, -5), '')}</span>
            <div class="pc-body">
              <p class="pc-msg">${esc(msg)}</p>
              ${ps ? `<p class="pc-ps"><i>P. S.</i> ${esc(ps)}</p>` : ''}
              <dl class="pc-lines">${lines.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
            </div>
            <div class="pc-act">
              <button class="add2" type="button" aria-pressed="${inPlan}">${esc(t(inPlan ? 'vis.remove' : 'vis.add'))}</button>
              ${page}${map}
              <button class="turnback" type="button" aria-label="${esc(t('vis.turn.back'))}">↺</button>
            </div>
          </div>
        </div>
      </article>
    </li>`;
  }

  const FAN = ['mulez', 'dabarska', 'kamengrad', 'blihe', 'hamzibegova', 'bobijasko-oko', 'sana'];
  // the year: two seasons (from month, day to month, day; months from 0) and three days, each with a photo of the place it is about
  const SEASONS = [
    { k: 'plan.y.spring', from: [2, 1], to: [4, 31], img: 'photos/bobijasko-oko.webp' },
    { k: 'plan.y.summer', from: [5, 1], to: [7, 31], img: 'photos/dabarska7.webp' }
  ];
  const DAYS = () => [
    { k: 'plan.y.musalla', at: firstFriJuly(), img: 'photos/musalla2.webp' },
    { k: 'plan.y.sana', at: next(7, 20), img: 'photos/grad/skokovi-masinski.webp' },
    { k: 'plan.y.oct', at: next(10, 10), img: 'photos/grad/grad-u-sumrak.webp' }
  ];
  const ROADS = [['1 h 45', 'Bihać', 'plan.get.bihac'], ['2 h 45', 'Zagreb', 'plan.get.zagreb'], ['4 h', 'Sarajevo', 'plan.get.sarajevo']];

  /* ---------- the year: the next twelve months from the first of this month ---------- */
  function yearItems() {
    const S = new Date(today.getFullYear(), today.getMonth(), 1), E = new Date(today.getFullYear() + 1, today.getMonth(), 1);
    const pos = d => Math.max(0, Math.min(100, (d - S) / (E - S) * 100));
    const seasons = SEASONS.map(x => {
      const y = today.getFullYear();
      let a = new Date(y, ...x.from), b = new Date(y, ...x.to);
      if (b < today) { a = new Date(y + 1, ...x.from); b = new Date(y + 1, ...x.to); }
      const now = a <= today;
      return { ...x, band: true, a: pos(a), b: pos(b), soon: now ? 0 : daysTo(a), when: now ? t('vis.year.now') : inDays(daysTo(a)) };
    });
    const days = DAYS().map(x => ({ ...x, p: pos(x.at), soon: daysTo(x.at), when: inDays(daysTo(x.at)) }));
    return { S, pos, seasons, days };
  }
  function yearHTML() {
    const { S, pos, seasons, days } = yearItems();
    const names = t('vis.months').split(',');
    const months = Array.from({ length: 12 }, (_, i) => new Date(S.getFullYear(), S.getMonth() + i, 1));
    const box = x => `<div class="yr-c"><img src="${x.img}" alt="" loading="lazy" decoding="async"><div><b>${esc(t(x.k + '.when'))}</b><span>${esc(t(x.k))}</span><em>${esc(x.when)}</em></div></div>`;
    const wide = `<div class="yr" id="yr">
        <div class="yr-months">${months.map((m, i) => `<span class="${i === 0 ? 'cur' : ''}">${esc(names[m.getMonth()])}${m.getMonth() === 0 ? ` <small>${m.getFullYear()}</small>` : ''}</span>`).join('')}</div>
        <div class="yr-seasons">${seasons.map(x => `<div class="yr-season" style="left:${x.a}%;width:${x.b - x.a}%">${box(x)}</div>`).join('')}</div>
        <div class="yr-track">${days.map(x => `<span class="yr-dot" style="left:${x.p}%"></span>`).join('')}</div>
        <div class="yr-days">${days.map(x => `<div class="yr-day" data-p="${x.p}" style="left:${x.p}%">${box(x)}</div>`).join('')}</div>
        <span class="yr-now" style="left:${pos(today)}%"><em>${esc(t('vis.today'))}</em></span>
      </div>`;
    // phones: the same, one under the other, in the order they come
    const all = [...seasons, ...days].sort((a, b) => a.soon - b.soon);
    const list = `<ol class="yr-list">
        <li class="yr-today"><i></i><b>${esc(cap(t('vis.today')))}, ${dmy(today)}</b></li>
        ${all.map(x => `<li class="${x.band ? 'band' : ''}"><i></i>${box(x)}</li>`).join('')}
      </ol>`;
    return wide + list;
  }
  // the cards of the three days: every way of putting each card in a row (hanging right or left of its dot) is tried,
  // and the first one where no card covers another wins, with as few rows and left-hanging cards as possible
  function layoutYear() {
    const box = $('yr');
    if (!box || !box.offsetWidth) return;
    const W = box.offsetWidth, els = [...box.querySelectorAll('.yr-day')].sort((a, b) => a.dataset.p - b.dataset.p);
    const items = els.map(el => ({ el, w: el.offsetWidth, x: W * el.dataset.p / 100 }));
    let best = null;
    const n = items.length, opts = 6; // 3 rows x 2 sides
    for (let code = 0; code < opts ** n; code++) {
      let c = code, ok = true, rows = 0, lefts = 0;
      const placed = items.map(it => { const o = c % opts; c = Math.floor(c / opts); const row = o >> 1, left = o & 1;
        const a = left ? it.x - it.w : it.x; return { ...it, row, left, a, b: a + it.w }; });
      for (const q of placed) {
        if (q.a < 0 || q.b > W) { ok = false; break; }
        rows = Math.max(rows, q.row + 1); lefts += q.left;
      }
      if (!ok) continue;
      if (placed.some((q, i) => placed.some((r, j) => j > i && q.row === r.row && q.a < r.b + 12 && r.a < q.b + 12))) continue;
      // the line down to a lower card may not run through a card above it
      if (placed.some(q => placed.some(r => r.row < q.row && q.x > r.a - 10 && q.x < r.b + 10))) continue;
      const score = rows * 10 + lefts;
      if (!best || score < best.score) best = { score, rows, placed };
    }
    if (!best) return;
    best.placed.forEach(q => { q.el.classList.toggle('to-left', !!q.left); q.el.style.setProperty('--r', q.row); });
    box.style.setProperty('--rows', best.rows);
  }

  function build() {
    pmN = 0;
    const counts = Object.fromEntries(TAGS.map(k => [k, CARDS.filter(c => c.tags.includes(k)).length]));
    const title = t('vis.title').split(' ');
    const cut = Math.ceil(title.length / 2);

    main.innerHTML = `
      <section class="v-hero" aria-labelledby="v-title">
        <div class="v-txt">
          <h1 id="v-title"><span class="ln">${esc(title.slice(0, cut).join(' '))}</span><span class="ln">${esc(title.slice(cut).join(' '))}</span></h1>
          <p class="v-lead">${esc(t('vis.lead'))}</p>
          <p class="v-now" id="v-now" hidden></p>
          <a class="v-go" href="#karte">${esc(t('vis.go'))} <span aria-hidden="true">↓</span></a>
        </div>
        <div class="fan" id="fan">
          ${FAN.map((id, i) => { const c = card[id]; return `<button class="fan-card" type="button" data-id="${id}" style="--a:${(i - 3) * (phone.matches ? 8 : 9)}deg">
            <img src="${thumb(c)}" alt="" loading="eager" decoding="async" draggable="false"><span>${esc(nameOf(c))}</span></button>`; }).join('')}
          <span class="pm" id="pm-hero">${postmark('Sanski Most', dmy(today), 'BiH', '')}</span>
        </div>
      </section>

      <section class="v-deck" id="karte" aria-labelledby="deck-t">
        <div class="v-head"><h2 id="deck-t">${esc(t('vis.deck.title'))}</h2><p class="v-hint">${esc(t(fine ? 'vis.deck.hint.mouse' : 'vis.deck.hint.touch'))}</p></div>
        <div class="chips" role="group" aria-label="${esc(t('vis.f.label'))}">
          <button class="chip" type="button" data-f="all" aria-pressed="${filter === 'all'}">${esc(t('vis.f.all'))} <b>${CARDS.length}</b></button>
          ${TAGS.map(k => `<button class="chip" type="button" data-f="${k}" aria-pressed="${filter === k}">${esc(tagName(k))} <b>${counts[k]}</b></button>`).join('')}
        </div>
        <ol class="deck" id="deck">${CARDS.map(cardHTML).join('')}</ol>
        <div class="deck-nav"><button type="button" id="dk-prev" aria-label="${esc(t('vis.prev'))}">←</button><span id="dk-n" aria-live="polite"></span><button type="button" id="dk-next" aria-label="${esc(t('vis.next'))}">→</button></div>
      </section>

      <section class="v-ready" aria-labelledby="ready-t">
        <h2 id="ready-t" class="rv">${esc(t('vis.ready.title'))}</h2>
        <p class="v-sub rv">${esc(t('vis.ready.lead'))}</p>
        <ol class="packs">${ROUTES.map(r => { const st = r.stops.filter(s => card[s.slug]); return `<li class="pack rv">
          <div class="pack-fan" aria-hidden="true">${st.slice(0, 3).map((s, i) => `<span style="--i:${i};--a:${[-5, 2, 6][i]}deg"><img src="${thumb(card[s.slug])}" alt="" loading="lazy" decoding="async"></span>`).join('')}</div>
          <h3>${esc(t(`route.${r.id}.name`))}</h3>
          <p class="pack-t">${esc(t(`route.${r.id}.text`))}</p>
          <div class="pack-body">
            <ol>${st.map(s => { const c = card[s.slug], km = s.km || c.km; return `<li><span>${esc(nameOf(c))}</span>${km ? `<span class="km">${km} km</span>` : ''}</li>`; }).join('')}</ol>
            ${r.extra ? `<p class="extra">${esc(t(r.extra))}</p>` : ''}
          </div>
          <button class="take" type="button" data-route="${r.id}">${esc(t('vis.ready.take'))}</button>
        </li>`; }).join('')}</ol>
      </section>

      <section class="v-info on-deep" aria-labelledby="info-t">
        <h2 id="info-t" class="rv">${esc(t('plan.before.title'))}</h2>
        <p class="v-sub rv">${esc(t('plan.lead'))}</p>
        <div class="blocks">
          <div class="blk rv">
            <span class="k">${esc(t('plan.get.title'))}</span>
            <ul class="roads">${ROADS.map(([tm, city, k]) => `<li><span class="t">${tm}</span><span class="c">${city}</span><span class="d">${esc(t(k))}</span></li>`).join('')}</ul>
            <dl>
              <div><dt>${esc(t('plan.get.air.k'))}</dt><dd>${esc(t('plan.get.air'))}</dd></div>
              <div><dt>${esc(t('plan.get.bus.k'))}</dt><dd>${esc(t('plan.get.bus'))}</dd></div>
              <div><dt>${esc(t('plan.get.town.k'))}</dt><dd>${esc(t('plan.get.town'))}</dd></div>
            </dl>
            <p class="fine" style="margin-top:.9rem">${esc(t('plan.get.note'))}</p>
          </div>
          <div class="blk rv">
            <span class="k">${esc(t('plan.stay.title'))}</span>
            <div class="stay">
              <p><b>279</b><span>${esc(t('plan.stay.beds'))}</span></p>
              <p><b>4</b><span>${esc(t('plan.stay.hotels'))}</span></p>
              <p><b>25</b><span>${esc(t('plan.stay.private'))}</span></p>
            </div>
            <p>${esc(t('plan.stay.lead'))}</p>
            <p>${esc(t('plan.stay.tip'))}</p>
            <div class="spa"><span class="lbl">${esc(t('plan.stay.spa.k'))}</span><h3>${esc(t('plan.stay.spa.t'))}</h3><p>${esc(t('plan.stay.spa'))}</p></div>
            <p style="margin-top:1.2rem"><a href="https://exploresanskimost.ba/planiraj-posjetu/" rel="noopener" target="_blank">${esc(t('plan.stay.list'))} ↗</a></p>
            <p class="fine">${esc(t('plan.stay.tz'))} · Prijedorska 5 · <a href="tel:+38761355120">061 355 120</a></p>
          </div>
          <div class="blk wide rv">
            <span class="k">${esc(t('plan.when.eyebrow'))}</span>
            <p class="yr-sub">${esc(t('vis.year.sub'))}</p>
            ${yearHTML()}
          </div>
          <div class="blk wide rv">
            <span class="k">${esc(t('plan.sum.title'))}</span>
            <p>${esc(t('plan.sum.lead'))}</p>
            <ul class="river-l">${['plan.sum.fest', 'plan.sum.swim', 'plan.sum.fish', 'plan.sum.kayak'].map(k => `<li><h3>${esc(t(k + '.t'))}</h3><p>${esc(t(k))}</p></li>`).join('')}</ul>
          </div>
        </div>
        <div class="v-end rv">
          <h3>${esc(t('plan.cta.title'))}</h3>
          <a class="cta" href="explore">${esc(t('plan.cta.btn'))} <span aria-hidden="true">→</span></a>
        </div>
        <p class="fine" style="margin-top:2rem">${esc(t('routes.conditions'))} ${esc(t('pv.weather'))}</p>
      </section>`;

    document.title = `${t('nav.plan')} · Sanski Most`;
    const og = document.querySelector('meta[property="og:title"]');
    if (og) og.content = document.title;
    wire();
    layoutYear();
    applyFilter(false);
    showWeather();
    envelope(false);
    reveal();
  }

  /* ---------- behaviour ---------- */
  const deck = () => $('deck');
  const items = () => [...deck().children].filter(li => !li.hidden);

  function flip(pc, on) {
    pc.classList.remove('tilting');
    pc.classList.toggle('flip', on);
    pc.querySelector('.pc-front').inert = on;
    pc.querySelector('.pc-back').inert = !on;
    if (on) pc.querySelector('.add2').focus({ preventScroll: true });
  }

  function wire() {
    deck().addEventListener('click', e => {
      const pc = e.target.closest('.pc');
      if (!pc) return;
      const id = pc.closest('li').dataset.id;
      if (e.target.closest('.pc-add, .add2')) { toggle(id, pc); return; }
      if (e.target.closest('.pc-flip')) { flip(pc, true); return; }
      if (e.target.closest('.turnback')) { flip(pc, false); pc.querySelector('.pc-flip').focus({ preventScroll: true }); return; }
      // a tap anywhere else on the back turns it back, except on a link or when text is being selected
      if (pc.classList.contains('flip') && !e.target.closest('a') && !String(getSelection())) flip(pc, false);
    });
    deck().addEventListener('keydown', e => {
      const pc = e.target.closest('.pc.flip');
      if (e.key === 'Escape' && pc) { flip(pc, false); pc.querySelector('.pc-flip').focus(); }
    });
    // a slight tilt under the mouse
    if (fine && !reduce) {
      deck().addEventListener('pointermove', e => {
        const pc = e.target.closest('.pc');
        if (!pc) return;
        const r = pc.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        pc.classList.add('tilting');
        pc.style.setProperty('--tx', `${x * 9}deg`);
        pc.style.setProperty('--ty', `${-y * 7}deg`);
      });
      deck().addEventListener('pointerout', e => {
        const pc = e.target.closest('.pc');
        if (!pc || pc.contains(e.relatedTarget)) return;
        pc.classList.remove('tilting');
        pc.style.setProperty('--tx', '0deg');
        pc.style.setProperty('--ty', '0deg');
      });
    }
    main.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => { filter = b.dataset.f; applyFilter(true); }));
    $('dk-prev').addEventListener('click', () => step(-1));
    $('dk-next').addEventListener('click', () => step(1));
    deck().addEventListener('scroll', onDeckScroll, { passive: true });
    $('fan').addEventListener('click', e => { const b = e.target.closest('.fan-card'); if (b) openCard(b.dataset.id); });
    main.querySelectorAll('.take').forEach(b => b.addEventListener('click', () => {
      const r = ROUTES.find(x => x.id === b.dataset.route);
      r.stops.forEach(s => { if (card[s.slug] && !plan.includes(s.slug)) plan.push(s.slug); });
      save(); syncCards(); envelope(true); openSheet();
    }));
    main.querySelector('.v-go').addEventListener('click', e => { e.preventDefault(); $('karte').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });
    if (!reduce) { deal(); riseLoop(); }
  }

  // one postcard after another rises out of the hand and settles back, so phones (which have no hover) see it too;
  // it waits while the mouse is over the hand and stops while the hand is off screen
  let riseT = 0, riseIO = null;
  function riseLoop() {
    clearTimeout(riseT);
    if (riseIO) riseIO.disconnect();
    const fan = $('fan'), cards = [...fan.querySelectorAll('.fan-card')];
    let i = 0, seen = true, held = false;
    const tick = () => {
      cards.forEach(c => c.classList.remove('up'));
      if (seen && !held) { cards[i % cards.length].classList.add('up'); i++; }
      riseT = setTimeout(tick, phone.matches ? 1300 : 2100); // quicker on phones
    };
    riseIO = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });
    riseIO.observe(fan);
    fan.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { held = true; cards.forEach(c => c.classList.remove('up')); } });
    fan.addEventListener('pointerleave', () => { held = false; });
    riseT = setTimeout(tick, 2000); // after the hand is dealt
  }

  // the hand of postcards is dealt when the page opens
  function deal() {
    main.querySelectorAll('.fan-card').forEach((b, i) => {
      const a = getComputedStyle(b).getPropertyValue('--a');
      b.animate([
        { transform: 'translateX(-50%) rotate(0deg) translateY(70px)', opacity: 0 },
        { transform: `translateX(-50%) rotate(${a}) translateY(0px)`, opacity: 1 }
      ], { duration: 900, delay: 120 + i * 85, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    });
    const pm = $('pm-hero');
    pm.animate([{ transform: 'rotate(-24deg) scale(1.35)', opacity: 0 }, { transform: 'rotate(-11deg) scale(1)', opacity: .9 }],
      { duration: 380, delay: 900, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'backwards' });
  }

  function applyFilter(user) {
    const show = li => filter === 'all' || li.dataset.tags.split(' ').includes(filter);
    const run = () => {
      [...deck().children].forEach(li => { li.hidden = !show(li); });
      main.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === filter)));
      deck().scrollLeft = 0;
      onDeckScroll();
    };
    if (user && document.startViewTransition && !reduce && !phone.matches) {
      [...deck().children].forEach((li, i) => { li.style.viewTransitionName = `pc-${i}`; });
      document.startViewTransition(run).finished.finally(() => [...deck().children].forEach(li => { li.style.viewTransitionName = ''; }));
    } else run();
  }

  // phones: the postcard in the middle is straight, the ones beside it lean away
  let deckRaf = 0;
  function onDeckScroll() {
    if (deckRaf) return;
    deckRaf = requestAnimationFrame(() => {
      deckRaf = 0;
      const list = items(), d = deck();
      if (!phone.matches) { list.forEach(li => { li.style.transform = ''; li.style.opacity = ''; }); return; }
      const mid = d.scrollLeft + d.clientWidth / 2;
      let best = 0, bestO = Infinity;
      list.forEach((li, i) => {
        const o = (li.offsetLeft + li.offsetWidth / 2 - mid) / li.offsetWidth, a = Math.min(Math.abs(o), 1.2);
        if (Math.abs(o) < bestO) { bestO = Math.abs(o); best = i; }
        if (reduce) return;
        li.style.transform = `translateY(${a * 16}px) rotate(${o * 5}deg) scale(${1 - a * .07})`;
        li.style.opacity = String(1 - a * .3);
      });
      $('dk-n').textContent = t('vis.count', { i: best + 1, n: list.length });
      $('dk-prev').disabled = best === 0;
      $('dk-next').disabled = best === list.length - 1;
      d.dataset.at = best;
    });
  }
  function center(li, smooth) {
    const d = deck();
    d.scrollTo({ left: li.offsetLeft - (d.clientWidth - li.offsetWidth) / 2, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }
  function step(dir) {
    const list = items(), i = Math.max(0, Math.min(list.length - 1, (+deck().dataset.at || 0) + dir));
    if (list[i]) center(list[i], true);
  }

  // from the hand at the top: show that postcard and turn it over
  function openCard(id) {
    if (filter !== 'all') { filter = 'all'; applyFilter(false); }
    const li = deck().querySelector(`li[data-id="${id}"]`);
    $('karte').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    if (phone.matches) center(li, false);
    else setTimeout(() => li.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }), reduce ? 0 : 450);
    setTimeout(() => flip(li.querySelector('.pc'), true), reduce ? 0 : 900);
  }

  /* ---------- adding and removing ---------- */
  function toggle(id, pc) {
    const adding = !plan.includes(id);
    plan = adding ? [...plan, id] : plan.filter(x => x !== id);
    save();
    syncCards();
    envelope(adding);
    if (adding && !reduce && pc) {
      const mark = pc.querySelector('.pc-mark');
      mark.animate([{ transform: 'rotate(-20deg) scale(1.9)', opacity: 0 }, { transform: 'rotate(-8deg) scale(1)', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.5,0,.75,0)' });
      fly(pc.querySelector('.pc-photo img'));
    }
  }
  function syncCards() {
    deck().querySelectorAll('li').forEach(li => {
      const id = li.dataset.id, on = plan.includes(id), name = nameOf(card[id]);
      li.querySelector('.pc').classList.toggle('in-plan', on);
      const a = li.querySelector('.pc-add'), b = li.querySelector('.add2');
      a.setAttribute('aria-pressed', String(on));
      a.setAttribute('aria-label', t(on ? 'vis.remove.aria' : 'vis.add.aria', { name }));
      b.setAttribute('aria-pressed', String(on));
      b.textContent = t(on ? 'vis.remove' : 'vis.add');
    });
  }
  // a copy of the photo flies into the envelope
  function fly(img) {
    if (!img || !img.complete) return;
    const r = img.getBoundingClientRect();
    if (r.width === 0) return;
    const f = document.createElement('img');
    f.className = 'fly'; f.src = img.currentSrc || img.src; f.alt = '';
    const w = Math.min(r.width, 150), h = w * 1.25;
    Object.assign(f.style, { left: `${r.left + r.width / 2 - w / 2}px`, top: `${r.top + r.height / 2 - h / 2}px`, width: `${w}px`, height: `${h}px` });
    document.body.appendChild(f);
    // to the envelope where it settles (it may still be sliding in from below)
    const e = $('env').getBoundingClientRect(), bottom = parseFloat(getComputedStyle($('env')).bottom) || 14;
    const dx = e.left + e.width / 2 - (r.left + r.width / 2), dy = innerHeight - bottom - e.height / 2 - (r.top + r.height / 2);
    f.animate([
      { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
      { transform: `translate(${dx * .55}px, ${dy * .35 - 60}px) rotate(-10deg) scale(.7)`, opacity: 1, offset: .45 },
      { transform: `translate(${dx}px, ${dy}px) rotate(6deg) scale(.28)`, opacity: .2 }
    ], { duration: 760, easing: 'cubic-bezier(.45,.05,.4,1)' }).finished.then(() => f.remove());
  }

  /* ---------- the envelope ---------- */
  let pastTop = false;
  function envelope(bump) {
    const env = $('env');
    env.hidden = !pastTop; // not over the top of the page, where the hand of postcards is
    $('env-t').textContent = t('vis.plan.title');
    $('env-n').textContent = plan.length;
    env.classList.toggle('empty', !plan.length);
    env.setAttribute('aria-label', `${t('vis.plan.open')}: ${countText(plan.length)}`);
    $('env-cards').innerHTML = plan.slice(-3).map((id, i, a) => `<img src="${thumb(card[id])}" alt="" style="--x:${(i - (a.length - 1) / 2) * 30}px;--a:${(i - (a.length - 1) / 2) * 7}deg">`).join('');
    if (bump && !reduce) { env.classList.remove('bump'); void env.offsetWidth; env.classList.add('bump'); }
  }
