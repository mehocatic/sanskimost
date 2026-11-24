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
  function heightAt(lon, lat) {
    if (!H) return 200;
    const px = Math.min(Math.max(gx(lon) - OX - .5, 0), HW - 2), py = Math.min(Math.max(gy(lat) - OY - .5, 0), HH - 2);
    const ix = px | 0, iy = py | 0, fx = px - ix, fy = py - iy, i = iy * HW + ix;
    return (H[i] * (1 - fx) + H[i + 1] * fx) * (1 - fy) + (H[i + HW] * (1 - fx) + H[i + HW + 1] * fx) * fy;
  }
  const fadeAt = (x, z) => 1 - THREE.MathUtils.smoothstep(Math.hypot(x, z) / R, .86, 1);
  const worldY = (x, z) => Math.max(heightAt(LON0 + x / KX, LAT0 - z / KY) - BASE, 0) / 1000 * EXAG * fadeAt(x, z);

  // ---------- scene
  const canvas = $('zlj-gl');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch (e) { loading.hidden = true; noGL(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const PAPER = new THREE.Color('#eeebe3');
  renderer.setClearColor(PAPER);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .05, 400);
  let terrainMat = null, raf = 0;
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(raf); noGL(); });

  // rivers as a distance field read by the terrain shader: each texel holds how far it is from the bank, so the shader draws
  // a sharp, smooth edge at any zoom (a painted texture turns into pixels close up), and a river never sinks under the mesh
  function riverTexture() {
    const S = 2048, k = S / (2 * R), RANGE = 3;        // RANGE: texels over which the field goes from the bank to 0 or 1
    const f = new Uint8Array(S * S);
    (window.ZLJ_RIVERS || []).forEach(w => {
      const half = (w.n === 'Sana' ? .045 : .022) * k, pad = half + RANGE + 1;
      const P = w.p.map(([la, lo]) => [(X(lo) + R) * k, (Zc(la) + R) * k]);
      for (let i = 1; i < P.length; i++) {
        const [ax, ay] = P[i - 1], [bx, by] = P[i], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
        const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - pad)), x1 = Math.min(S - 1, Math.ceil(Math.max(ax, bx) + pad));
        const y0 = Math.max(0, Math.floor(Math.min(ay, by) - pad)), y1 = Math.min(S - 1, Math.ceil(Math.max(ay, by) + pad));
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const px = x + .5, py = y + .5, u = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L2));
          const d = Math.hypot(px - ax - u * dx, py - ay - u * dy);
          const v = Math.max(0, Math.min(255, Math.round((.5 + (half - d) / (2 * RANGE)) * 255)));
          const j = y * S + x; if (v > f[j]) f[j] = v;
        }
      }
    });
    const tex = new THREE.DataTexture(f, S, S, THREE.RedFormat, THREE.UnsignedByteType);
    tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = true;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); tex.needsUpdate = true;
    return tex;
  }

  // the terrain: paper shaded from the north-west, contour lines every 20 m (every 100 m stronger), the rivers,
  // the marks at the foot of the pins (a dot and a ring, and for the person in focus a ring that spreads out),
  // and a soft round edge into the paper. uT runs 0 to 1 at the start: the contours are drawn from the valleys up.
  function buildTerrain() {
    const S = small ? 260 : 420;
    const g = new THREE.PlaneGeometry(2 * R, 2 * R, S, S);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, hA = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      hA[i] = heightAt(LON0 + x / KX, LAT0 - z / KY);
      p.setY(i, worldY(x, z));
    }
    g.setAttribute('aH', new THREE.BufferAttribute(hA, 1));
    g.computeVertexNormals();
    const n = pins.length;
    terrainMat = new THREE.ShaderMaterial({
      uniforms: {
        uPaper: { value: PAPER }, uInk: { value: new THREE.Color('#151a18') }, uRiver: { value: new THREE.Color('#1795a0') },
        uLeaf: { value: new THREE.Color('#a8823a') }, uRiv: { value: riverTexture() }, uR: { value: R }, uT: { value: reduce ? 1 : 0 },
        uTime: { value: 0 }, uPin: { value: pins.map(() => new THREE.Vector4()) },
      },
      vertexShader: `attribute float aH; varying float vH; varying vec3 vN; varying vec3 vW;
        void main(){ vH = aH; vN = normal; vW = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: `uniform vec3 uPaper, uInk, uRiver, uLeaf; uniform sampler2D uRiv; uniform float uR, uT, uTime; uniform vec4 uPin[${n}];
        varying float vH; varying vec3 vN; varying vec3 vW;
        float line(float v, float w){ float fw = fwidth(v); float f = abs(fract(v - .5) - .5) / max(fw, 1e-4); return (1. - smoothstep(w - .5, w + .5, f)) * (1. - smoothstep(.25, .6, fw)); }
        void main(){
          vec3 L = normalize(vec3(-.55, .75, -.45));
          float sh = clamp(dot(normalize(vN), L), 0., 1.);
          vec3 c = uPaper * mix(1., mix(.5, 1.06, pow(sh, .85)), smoothstep(.35, 1., uT));
          float minor = line(vH / 20., .8) * .22, major = line(vH / 100., 1.2) * .55;
          float drawn = 1. - smoothstep(-30., 0., vH - mix(80., 1700., smoothstep(0., .75, uT)));
          c = mix(c, uInk, max(minor, major) * drawn);
          float f = texture2D(uRiv, (vW.xz + uR) / (2. * uR)).r;
          float aa = max(fwidth(f), 1e-3);
          float edge = smoothstep(.5 - aa, .5 + aa, f);
          float far = smoothstep(.12, .5, f) * smoothstep(.04, .2, aa);
          c = mix(c, uRiver, max(edge, far) * .9 * smoothstep(.55, 1., uT));
          float mk = 0.;
          for (int i = 0; i < ${n}; i++) {
            vec4 P = uPin[i];
            float dd = length(vW.xz - P.xy), a2 = max(fwidth(dd), 1e-4), w = max(.011, a2 * .9);
            float ring = 1. - smoothstep(w, w + a2, abs(dd - .13));
            float dotm = 1. - smoothstep(.03, .03 + a2, dd);
            float ph = fract(uTime * .4), wave = P.w * (1. - smoothstep(w, w + a2, abs(dd - (.13 + ph * .5)))) * (1. - ph);
            mk = max(mk, max(max(ring, dotm), wave) * P.z);
          }
          c = mix(c, uLeaf, mk * .85);
          c = mix(c, uPaper, smoothstep(.8, .98, length(vW.xz) / uR));
          gl_FragColor = vec4(c, 1.);
          #include <colorspace_fragment>
        }`,
    });
    scene.add(new THREE.Mesh(g, terrainMat));
  }

  // the lily on top of each pin: drawn large (mipmapped, so it stays sharp when small), gold with a dark outline,
  // on a thin paper halo so it reads over the contour lines
  function lilyTexture() {
    const W = 512, Hh = 600, k = W / 220;
    const c = document.createElement('canvas'); c.width = W; c.height = Hh;
    const x = c.getContext('2d');
    x.translate(10 * k, 4 * k); x.scale(k, k);
    const all = [...LILY_C.map(d => [new Path2D(d), false]), ...LILY_R.flatMap(d => [[new Path2D(d), false], [new Path2D(d), true]])];
    const each = fn => all.forEach(([path, mir]) => { x.save(); if (mir) { x.translate(200, 0); x.scale(-1, 1); } fn(path); x.restore(); });
    x.lineJoin = 'round'; x.lineCap = 'round';
    x.strokeStyle = 'rgba(238,235,227,.95)'; x.lineWidth = 15; each(pa => x.stroke(pa));
    const g = x.createLinearGradient(40, 0, 160, 240);
    g.addColorStop(0, '#f0d58c'); g.addColorStop(.45, '#c49a45'); g.addColorStop(1, '#7d5c20');
    x.fillStyle = g; each(pa => x.fill(pa));
    x.strokeStyle = '#4d3a14'; x.lineWidth = 3.4; each(pa => x.stroke(pa));
    x.strokeStyle = '#5a4316'; x.lineWidth = 3.5; x.stroke(new Path2D(LILY_RIB));
    x.strokeStyle = 'rgba(255,244,210,.7)'; x.lineWidth = 2.5; x.stroke(new Path2D('M92 44C87 60 86 80 90 100'));
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  // pins: a hairline stem (its radius is set every frame, so it stays about 1.6 px wide) with the lily standing on top
  function buildPins() {
    const tex = lilyTexture();
    const stemG = new THREE.CylinderGeometry(1, 1, 1, 8); stemG.translate(0, .5, 0);
    const stemM = new THREE.MeshBasicMaterial({ color: '#2a2f2c' });
    pins.forEach(p => {
      p.y = worldY(p.x, p.zz);
      const grp = new THREE.Group(); grp.position.set(p.x, p.y - .02, p.zz);
      const stem = new THREE.Mesh(stemG, stemM); stem.scale.set(.01, .0001, .01);
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, sizeAttenuation: false, depthTest: false }));
      spr.center.set(.5, .02); spr.renderOrder = 5;
      grp.add(stem, spr); scene.add(grp);
      Object.assign(p, { stem, spr, rise: 0 });
    });
  }

  // ---------- labels: names at the lilies and the village names, placed where they cover nothing
  const labels = $('zlj-labels');
  const vils = Object.entries(PLACES).map(([n, [la, lo]]) => {
    const e = document.createElement('div'); e.className = 'zlj-vil'; e.textContent = n; labels.appendChild(e);
    return { e, n, v: new THREE.Vector3(X(lo), 0, Zc(la)), o: { el: e, optional: true, pri: 99 } };
  });
  pins.forEach(p => {
    p.lab = document.createElement('div'); p.lab.className = 'zlj-lab'; p.lab.textContent = p.z.name; labels.appendChild(p.lab);
    p.o = { el: p.lab };
  });
  const tmp = new THREE.Vector3();
  function toScreen(v) {
    tmp.copy(v).project(camera);
    if (tmp.z > 1 || Math.abs(tmp.x) > 1.3 || Math.abs(tmp.y) > 1.3) return null;
    return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight];
  }
})();
