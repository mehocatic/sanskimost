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
