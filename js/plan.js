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
