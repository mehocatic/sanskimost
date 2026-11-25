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
})();
