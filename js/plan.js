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
