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

  // place of birth and date from the data ("Skucani Vakuf, 9. april 1951.")
  const placeOf = z => z.born.bs.split(',')[0].trim();
  const dateOf = z => tx(z.born).split(',').slice(1).join(',').trim();

  // ---------- the lily: a centre petal, a band, a centre foot, and the right-hand petal and foot (the left ones are mirrored)
  const LILY_C = ['M100 6C108 24 121 46 121 74C121 98 110 116 100 130C90 116 79 98 79 74C79 46 92 24 100 6Z',
    'M66 132H134Q140 132 140 138V146Q140 152 134 152H66Q60 152 60 146V138Q60 132 66 132Z',
    'M100 154C106 172 108 194 100 226C92 194 94 172 100 154Z'];
  const LILY_R = ['M104 132C106 108 120 86 144 80C168 74 190 86 192 108C194 126 180 138 166 134C156 131 152 120 158 112C163 106 172 108 174 115C176 106 168 98 156 99C138 101 124 116 118 134Z',
    'M108 154C118 170 134 180 154 178C150 192 128 198 112 176C110 168 108 160 108 154Z'];
  const LILY_RIB = 'M100 30V116';
  const LILY_SVG = `<svg viewBox="0 0 200 240" aria-hidden="true" focusable="false"><g fill="#b08a3e" stroke="#5a4316" stroke-width="5" stroke-linejoin="round">${
    LILY_C.map(d => `<path d="${d}"/>`).join('')}${LILY_R.map(d => `<path d="${d}"/><path d="${d}" transform="matrix(-1 0 0 1 200 0)"/>`).join('')
    }</g><path d="${LILY_RIB}" stroke="#5a4316" stroke-width="4" stroke-linecap="round"/></svg>`;

  // ---------- the cards
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function renderCards() {
    $('zlj-list').innerHTML = Z.map(z => `<li class="zlj-st" id="${esc(z.id)}"><article class="zlj-card">
      <p class="zlj-sc zlj-yr">${LILY_SVG}<span>${z.year} · ${esc(placeOf(z))}</span></p>
      <h2>${esc(z.name)}</h2>
      ${z.post ? `<span class="zlj-post">${esc(t('lic.zlj.post'))}</span>` : ''}
      <dl><div><dt>${esc(t('lic.zlj.born'))}</dt><dd>${esc(dateOf(z))}</dd></div><div><dt>${esc(t('lic.zlj.unit'))}</dt><dd>${esc(tx(z.unit))}</dd></div>
      ${z.note ? `<div><dt>${esc(t('lic.zlj.note'))}</dt><dd class="zlj-note">${esc(tx(z.note))}</dd></div>` : ''}</dl>
    </article></li>`).join('');
    $('zlj-count').textContent = t('lic.zlj.count', { n: Z.length });
    const a = $('zlj-src');
    if (window.ZLJILJANI_SRC) { a.href = window.ZLJILJANI_SRC; a.textContent = t('lic.source') + ': Wikipedia'; } else a.hidden = true;
  }
  renderCards();
  const noGL = () => main.classList.add('no-gl');

  // ---------- WebGL and three.js
  let THREE;
  try {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('no webgl');
    THREE = await import('../vendor/three.module.min.js');
  } catch (e) {
    noGL();
    addEventListener('langchange', renderCards);
    return;
  }
  const loading = $('zlj-loading');
  loading.hidden = false;

  // ---------- places of birth
  // TODO(verify): each point is the OpenStreetMap place node of the village (Nominatim, 2026-11-24), not the exact birthplace.
  const PLACES = {
    'Skucani Vakuf': [44.7846637, 16.4598220],
    'Stari Majdan': [44.8286950, 16.6052365],
    'Sanski Most': [44.7651882, 16.6656827],
    'Vrhpolje': [44.6702203, 16.7442405],
    'Hrustovo': [44.6653424, 16.7180207],
  };

  // ---------- the map and its local frame (1 unit = 1 km)
  const LAT0 = 44.75, LON0 = 16.61, R = 17.5;           // centre and radius of the round map
  const KX = 111.32 * Math.cos(LAT0 * Math.PI / 180), KY = 110.57;
  const X = lon => (lon - LON0) * KX, Zc = lat => -(lat - LAT0) * KY;
  const EXAG = 2.4, BASE = 120;                         // height exaggeration, metres left under the floor
  const COLH = 1.6;                                     // height of a pin
  const small = innerWidth < 700;

  // the pins; two people from one village stand about 900 m apart around the village point, on a line across the
  // direction of the nearest other village (Vrhpolje and Hrustovo are 2 km apart), and the one further north
  // (further from the camera) gets a taller stem, so the two lilies do not cover each other from above
  const many = {}, seen = {};
  Z.forEach(z => { const v = placeOf(z); many[v] = (many[v] || 0) + 1; });
  const pins = Z.filter(z => PLACES[placeOf(z)]).map(z => {
    const v = placeOf(z), p = PLACES[v], x = X(p[1]), zz = Zc(p[0]);
    const n = (seen[v] = (seen[v] || 0) + 1);
    if (many[v] < 2) return { z, x, zz, colh: COLH };
    let nx = 0, nz = 0, best = Infinity;
    Object.entries(PLACES).forEach(([o, q]) => {
      if (o === v) return;
      const dx = X(q[1]) - x, dz = Zc(q[0]) - zz, d = Math.hypot(dx, dz);
      if (d < best) { best = d; nx = dx / d; nz = dz / d; }
    });
    const s = n === 1 ? -.45 : .45;
    return { z, x: x - nz * s, zz: zz + nx * s, colh: COLH };
  });
  Object.keys(many).filter(v => many[v] > 1).forEach(v => {
    const two = pins.filter(p => placeOf(p.z) === v).sort((a, b) => a.zz - b.zz);
    if (two.length > 1) two[0].colh = COLH * 1.5;
  });

  // ---------- heights (Web Mercator pixels at zoom 11; the file starts at pixel OX, OY)
  const N = 2 ** 11 * 256, OX = 286009, OY = 188786;
  const gx = lon => (lon + 180) / 360 * N;
  const gy = lat => { const r = lat * Math.PI / 180; return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * N; };
  let H = null, HW = 0, HH = 0;
  async function loadHeights() {
    const im = new Image();
    im.src = 'photos/teren/visine.png';
    await im.decode();
    HW = im.naturalWidth; HH = im.naturalHeight;
    const c = document.createElement('canvas'); c.width = HW; c.height = HH;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, HW, HH).data;
    H = new Float32Array(HW * HH);
    for (let i = 0; i < H.length; i++) H[i] = d[i * 4] * 256 + d[i * 4 + 1] - 32768;
  }
})();
