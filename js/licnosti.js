// Golden Lilies page (licnosti.html): a 3D topographic map of the Sanski Most area with one lily for each recipient.
//  - The terrain is photos/teren/visine.png: Terrain Tiles (Mapzen, AWS Open Data) at zoom 11, cropped to the map and stored
//    in the Terrarium encoding (height = R * 256 + G - 32768 metres). The rivers are js/data/rivers.js (OpenStreetMap).
//  - The people are ZLJILJANI in licnosti-data.js. Each one has a card; scrolling to a card flies the camera to that
//    person's place of birth, where a pin with a lily rises. The last card shows the whole valley with all the lilies.
//  - The cards are ordinary HTML in reading order; the map is decoration (aria-hidden). Without WebGL only the cards are shown.
//  - Three.js r160 from vendor/, loaded only when WebGL is there (as in hodnik.js).
// The people of Sanski Most are in the corridor (hodnik.html); an old link to licnosti#<id> goes there.
(async () => {
  const L = () => (window.I18n && I18n.lang) || 'bs';
  const t = (k, v) => (window.I18n ? I18n.t(k, v) : k);
  const tx = o => (o && (o[L()] || o.en)) || '';
  const $ = id => document.getElementById(id);
  const Z = window.ZLJILJANI || [];
  const people = window.LICNOSTI || [];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = $('zlatni-ljiljani');

  // a link to a person on the old People page: that person is now in the corridor
  const h = decodeURIComponent(location.hash.slice(1));
  if (h && people.some(p => p.id === h)) { location.replace('hodnik#' + encodeURIComponent(h)); return; }

})();
