// Hodnik ličnosti: the round corridor of the "Hodnik historije" project (Three.js, vendor/three.module.min.js, the same version r160),
// ported to plain JavaScript. The scene, the walk and the focus glide are the original ones; what hangs in it are the people of Sanski Most:
//   - licnosti-data.js and i18n give the names, roles, biographies and sources, photos/licnosti/ the portraits,
//   - the people go in the order of the fields, taking turns between the inner and the outer wall, so walking forward goes through them in order,
//   - a click on a portrait brings it close and shows its plate (field, place, name, role); in focus the arrows go from person to person,
//   - a click on the focused portrait (or the plate's button) opens the biography in a dialog (previous / next go through the same order),
//   - without WebGL (or when the context is lost) everyone is shown as a grid, grouped by field; there is no switch to it.
(() => {
  const $ = id => document.getElementById(id);
  const t = (k, v) => I18n.t(k, v);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // everyone in the order of the fields, then the order of the data file; the walls take turns, so both walls go through the fields together
  const CATS = window.LICNOSTI_CATS || [], SIZES = window.LICNOSTI_PHOTOS || {};
  const ALL = CATS.flatMap(c => (window.LICNOSTI || []).filter(p => p.cat === c.id));
  // the first person goes on the inner wall, which the camera faces at the start
  const innerP = ALL.filter((p, i) => i % 2 === 0), outerP = ALL.filter((p, i) => i % 2 === 1);
  const OUTER_COUNT = outerP.length, INNER_COUNT = innerP.length;
  // without a portrait (Hasan-beg Cekic, Arif Hukanovic): a card with the initials, 3:4
  const PRINTS = [...outerP, ...innerP].map((p, i) => {
    const sz = SIZES[p.id];
    return { index: i, p, photo: !!sz, width: sz ? sz[0] : 600, height: sz ? sz[1] : 800 };
  });

  const full = p => `photos/licnosti/${p.id}.webp`;
  const thumb = p => `photos/licnosti/t/${p.id}.webp`;
  const L = () => I18n.lang;
  const tx = o => o && o.key ? t(o.key) : (o && (o[L()] || o.en)) || '';
  const bio = (p, field) => p.copyKey ? t(p.copyKey + '.' + field) : tx(p[field]);
  const roleOf = p => bio(p, 'role');
  const catOf = p => tx(CATS.find(c => c.id === p.cat));
  const initials = n => n.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('');

  // the pieces of the photographed frame (tools/okvir-isjeci.py writes them), in the photograph's pixels: D reaches from the opening out past the carving, C is a corner
  const FRAME_D = 140, FRAME_C = 250;
  const FRAME_PIECES = { 'c-tl': [250, 250], 'c-tr': [250, 250], 't-l': [158, 140], 't-c': [260, 140], 't-r': [154, 140], 'b-c': [260, 140], 'b-p': [154, 140],
    'l-c': [140, 135], 'l-p': [140, 116], 'r-c': [140, 135], 'r-p': [140, 116] };

  const mqSmall = matchMedia('(max-width: 819px), (orientation: portrait) and (max-width: 1100px), (orientation: landscape) and (max-height: 500px)');
  const mqMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const gui = $('gui'), host = $('host'), list = $('list'), lb = $('lb');
  let stage = null, focused = false, opened = -1;

  /* ---------- text that changes with the state ---------- */
  const mqTouch = matchMedia('(hover: none), (pointer: coarse)');
  function setHints() {
    const k = (mqTouch.matches ? 't' : '') + (focused ? 'focus' : 'walk');
    $('hint1').textContent = t(`hod.hint.${k}1`);
    $('hint2').textContent = t(`hod.hint.${k}2`);
  }

  /* ---------- the list (only without WebGL): everyone by field ---------- */
  const portrait = (it, cls) => it.photo
    ? `<img class="${cls}" src="${full(it.p)}" width="${it.width}" height="${it.height}" alt="" loading="lazy" decoding="async">`
    : `<span class="${cls} mono" aria-hidden="true">${esc(initials(it.p.name))}</span>`;
  function buildList() {
    $('list-grid').innerHTML = CATS.map(c => {
      const items = PRINTS.filter(it => it.p.cat === c.id);
      if (!items.length) return '';
      return `<section class="list-cat" aria-labelledby="lc-${c.id}"><h3 class="list-cat-h" id="lc-${c.id}">${esc(tx(c))} <span>${esc(t('lic.count', { n: items.length }))}</span></h3><div class="list-cards">` +
        items.map(it => `<button type="button" class="list-card" data-i="${it.index}"><span class="list-img-wrap">${portrait(it, 'list-img')}</span>` +
          `<span class="list-title">${esc(it.p.name)}</span><span class="list-artist">${esc(roleOf(it.p))}</span></button>`).join('') +
        '</div></section>';
    }).join('');
  }
  $('list-grid').addEventListener('click', e => { const b = e.target.closest('.list-card'); if (b) openPhoto(+b.dataset.i); });

  $('prev').addEventListener('click', () => stage && stage.step(-1));
  $('next').addEventListener('click', () => stage && stage.step(1));

  /* ---------- one person, opened ---------- */
  const setHash = h => history.replaceState(null, '', h || (location.pathname + location.search));
  function fillDialog() {
    if (opened < 0) return;
    const it = PRINTS[opened], p = it.p;
    const img = $('lb-img'), mono = $('lb-mono');
    img.hidden = !it.photo; mono.hidden = it.photo;
    if (it.photo) { img.src = full(p); img.width = it.width; img.height = it.height; img.alt = p.name; }
    else { img.removeAttribute('src'); mono.textContent = initials(p.name); }
    $('lb-cat').textContent = catOf(p);
    $('lb-name').textContent = p.name;
    $('lb-role').textContent = roleOf(p);
    const tag = $('lb-tag');
    tag.className = 'lb-tag ' + p.kind;
    tag.textContent = t('lic.' + p.kind);
    $('lb-text').textContent = bio(p, 'text');
    const a = $('lb-src');
    a.href = p.src.url;
    if (p.src.internal) { a.removeAttribute('target'); a.removeAttribute('rel'); }
    else { a.target = '_blank'; a.rel = 'noopener'; }
    a.textContent = (p.src.internal ? '' : t('lic.source') + ': ') + p.src.label;
  }
  /* ---------- the carved frame round the photograph in the dialog ---------- */
  // the same pieces of the photographed frame as on the walls (photos/okvir/, tools/okvir-isjeci.py), laid out the same way on a canvas:
  // corners (the bottom ones mirrored), the carved middle of each side unstretched, plain stretches repeated mirrored; a white mount inside.
  const framePieces = {};
  const framesReady = Promise.all(Object.keys(FRAME_PIECES).map(k => new Promise(res => {
    const im = new Image(); im.onload = im.onerror = () => res(); im.src = `photos/okvir/${k}.webp`; framePieces[k] = im;
  })));
  function drawFrame(cv, w, h, band, mount) {
    const dpr = Math.min(2, devicePixelRatio || 1), W = w + 2 * (band + mount), H = h + 2 * (band + mount);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    const k = band / FRAME_D, C = FRAME_C * k, P = FRAME_PIECES;
    // the mount, with a hole where the photograph shows through
    x.fillStyle = '#FBF8F1'; x.fillRect(band - 1, band - 1, W - 2 * band + 2, H - 2 * band + 2);
    x.clearRect(band + mount, band + mount, w, h);
    x.strokeStyle = 'rgba(120, 100, 70, .28)'; x.lineWidth = 1; x.strokeRect(band + mount - .5, band + mount - .5, w + 1, h + 1);
    // one piece: source part sx..sx+sw x sy..sy+sh into dx, dy, dw, dh, mirrored if asked
    const put = (key, sx, sy, sw, sh, dx, dy, dw, dh, fx, fy) => {
      const im = framePieces[key]; if (!im || !im.naturalWidth || dw <= 0 || dh <= 0) return;
      x.save(); x.translate(dx + (fx ? dw : 0), dy + (fy ? dh : 0)); x.scale(fx ? -1 : 1, fy ? -1 : 1);
      x.drawImage(im, sx, sy, sw, sh, 0, 0, dw, dh); x.restore();
    };
    // a plain stretch along x: mirrored repeats, an odd number, so both ends meet what the photograph had next to them;
    // `startAtMiddle`: the piece's left end was against the carved middle; `flip`: the whole stretch drawn mirrored
    const plainH = (key, x0, y0, len, hh, startAtMiddle, flip) => {
      const [pw, ph] = P[key], seg = pw * k, r = len / seg;
      if (r < 1) { const sw = pw * r; put(key, startAtMiddle ? 0 : pw - sw, 0, sw, ph, x0, y0, len, hh, flip, false); return; }
      const n = Math.max(1, 2 * Math.round((r - 1) / 2) + 1), d = len / n;
      for (let i = 0; i < n; i++) put(key, 0, 0, pw, ph, x0 + i * d, y0, d + .5, hh, (i % 2 === 1) !== !!flip, false);
    };
    // the same down a side: the piece's top was against the corner; `fy` draws it upside down (the lower stretch)
    const plainV = (key, x0, y0, len, ww, fy) => {
      const [pw, ph] = P[key], seg = ph * k, r = len / seg;
      if (r < 1) { const sh = ph * r; put(key, 0, ph - sh, pw, sh, x0, y0, ww, len, false, fy); return; }
      const n = Math.max(1, 2 * Math.round((r - 1) / 2) + 1), d = len / n;
      for (let i = 0; i < n; i++) put(key, 0, 0, pw, ph, x0, y0 + i * d, ww, d + .5, false, (i % 2 === 1) !== !!fy);
    };
    const D = band, runH = W - 2 * C, midW = Math.min(P['t-c'][0] * k, runH), cut = midW / (P['t-c'][0] * k);
    const msx = P['t-c'][0] * (1 - cut) / 2, msw = P['t-c'][0] * cut, plH = (runH - midW) / 2;
    const runV = H - 2 * C, midH = Math.min(P['l-c'][1] * k, runV), vcut = midH / (P['l-c'][1] * k);
    const msy = P['l-c'][1] * (1 - vcut) / 2, msh = P['l-c'][1] * vcut, plV = (runV - midH) / 2;
    // top: plain (ends against the middle), middle, plain (starts against it); bottom: the same from the bottom pieces
    if (plH > 0) {
      plainH('t-l', C, 0, plH, D, false, false);
      plainH('t-r', C + plH + midW, 0, plH, D, true, false);
      plainH('b-p', C + plH + midW, H - D, plH, D, true, false);
      plainH('b-p', C, H - D, plH, D, true, true);
    }
    put('t-c', msx, 0, msw, P['t-c'][1], C + plH, 0, midW, D);
    put('b-c', msx, 0, msw, P['b-c'][1], C + plH, H - D, midW, D);
    // left and right: plain from the corner, middle, the plain again upside down
    if (plV > 0) {
      plainV('l-p', 0, C, plV, D, false); plainV('l-p', 0, C + plV + midH, plV, D, true);
      plainV('r-p', W - D, C, plV, D, false); plainV('r-p', W - D, C + plV + midH, plV, D, true);
    }
    put('l-c', 0, msy, P['l-c'][0], msh, 0, C + plV, D, midH);
    put('r-c', 0, msy, P['r-c'][0], msh, W - D, C + plV, D, midH);
    // corners last, over the ends of the sides
    put('c-tl', 0, 0, FRAME_C, FRAME_C, 0, 0, C, C);
    put('c-tr', 0, 0, FRAME_C, FRAME_C, W - C, 0, C, C);
    put('c-tl', 0, 0, FRAME_C, FRAME_C, 0, H - C, C, C, false, true);
    put('c-tr', 0, 0, FRAME_C, FRAME_C, W - C, H - C, C, C, false, true);
  }
  // fit the photograph (never above its natural size), the mount and the frame into the space the dialog gives the picture
  function layoutDialogFrame() {
    if (opened < 0 || !lb.open) return;
    const it = PRINTS[opened], ph = $('lb-ph'), art = $('lb-art'), img = $('lb-img'), mono = $('lb-mono');
    const narrow = mqSmall.matches;
    const availW = ph.clientWidth, availH = narrow ? innerHeight * .62 : ph.clientHeight;
    if (!availW || !availH) return;
    const band = Math.round(Math.max(26, Math.min(64, Math.min(availW, availH) * .085))), mount = Math.round(band * .4), pad = band + mount;
    const nw = it.photo ? it.width : 600, nh = it.photo ? it.height : 800;
    const s = Math.min(it.photo ? 1 : 2, (availW - 2 * pad) / nw, (availH - 2 * pad) / nh);
    const w = Math.max(40, Math.round(nw * s)), h = Math.max(40, Math.round(nh * s));
    const el = it.photo ? img : mono;
    el.style.width = w + 'px'; el.style.height = h + 'px';
    art.style.padding = pad + 'px';
    drawFrame($('lb-frame'), w, h, band, mount);
  }
  framesReady.then(layoutDialogFrame);
  addEventListener('resize', layoutDialogFrame);

  function openPhoto(i) {
    opened = i;
    fillDialog();
    if (!lb.open) lb.showModal();
    layoutDialogFrame();
    lb.scrollTop = 0; $('lb-txt').scrollTop = 0;
    if (stage) stage.overlay = true;
    setHash('#' + PRINTS[i].p.id);
  }
  // previous / next in the order of the fields (ALL), which is also the order along the corridor: even places on the inner wall, odd on the outer
  const ORDER = ALL.map((p, i) => i % 2 === 0 ? OUTER_COUNT + i / 2 : (i - 1) / 2);
  const stepPerson = d => { const k = ORDER.indexOf(opened); if (k >= 0) openPhoto(ORDER[(k + d + ORDER.length) % ORDER.length]); };
  $('lb-prev').addEventListener('click', () => stepPerson(-1));
  $('lb-next').addEventListener('click', () => stepPerson(1));
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') stepPerson(-1);
    if (e.key === 'ArrowRight') stepPerson(1);
  });
  lb.addEventListener('close', () => {
    opened = -1; setHash('');
    if (stage) stage.overlay = false;
  });
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  $('lb-x').addEventListener('click', () => lb.close());

  /* ---------- the plate of the person in focus ---------- */
  let plateAt = -1;
  function fillPlate() {
    if (plateAt < 0) return;
    const p = PRINTS[plateAt].p;
    $('plate-cat').textContent = catOf(p);
    $('plate-n').textContent = `${ORDER.indexOf(plateAt) + 1} / ${ORDER.length}`;
    $('plate-name').textContent = p.name;
    $('plate-role').textContent = roleOf(p);
  }
  $('plate-open').addEventListener('click', () => { if (plateAt >= 0) openPhoto(plateAt); });
  mqTouch.addEventListener('change', setHints);

  addEventListener('langchange', () => {
    setHints(); fillDialog(); fillPlate(); if (list.classList.contains('open')) buildList();
    if (stage) stage.redrawAllLabels();
  });

  /* ---------- the corridor ---------- */
  async function startScene() {
    let THREE;
    try {
      const probe = document.createElement('canvas');
      if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('no webgl');
      THREE = await import('../vendor/three.module.min.js');
    } catch (e) { return false; }

    const OUTER_RADIUS = 18, INNER_RADIUS = 12.2, WALL_HEIGHT = 6.2, PY = 1.95;
    const LABEL_W = 1.45, LABEL_CH = 196; // the name label under a portrait: width in world units, height of its canvas (at 640 wide)
    const STEP = (2 * Math.PI) / OUTER_COUNT;

    // frame size on the wall (world units, not pixels): a photograph is never shown above its natural size on a normal screen
    // a small portrait gets a smaller frame: about 190 px to a unit when a frame is in focus on a desktop screen
    function frameDims(print) {
      const aspect = print.width / print.height;
      let pw, ph;
      if (aspect >= 1) { pw = Math.min(2.32, 1.38 * aspect); ph = pw / aspect; }
      else { ph = 1.95; pw = ph * aspect; }
      const k = print.photo ? Math.min(1, print.height / 190 / ph) : 1;
      return { pw: pw * k, ph: ph * k };
    }

    class Stage {
      constructor() {
        this.overlay = false;
        this.reduced = mqMotion.matches;
        this.small = mqSmall.matches;
        this.renderer = null; this.scene = null; this.camera = null;
        this.raycaster = new THREE.Raycaster(); this.pointerNdc = new THREE.Vector2();
        this.entries = []; this.meshes = []; this.labels = []; this.disposables = [];
        this.raf = 0; this.last = 0; this.destroyed = false; this.failsafe = null;
        this.pose = { th: .14, r: 15.6, yaw: -.3, y: 1.92, pitch: -.12 };
        this.targetTh = .14; this.focusedEntry = null; this.glide = null;
        this.pointerDown = false; this.pointerMoved = false; this.pointerId = -1; this.downX = 0; this.downY = 0; this.dragStartTh = 0;
        this.cursorX = 0; this.cursorY = 0; this.hoveringFocused = false; this.detailAt = 0;
        this._pos = new THREE.Vector3(); this._look = new THREE.Vector3(); this._corner = new THREE.Vector3();
        this.loader = new THREE.TextureLoader();
      }

      portraitSmall() { return this.small && innerHeight > innerWidth; }
      walkOffset() { return this.portraitSmall() ? .14 + .35 * STEP : .14; }
      walkPose(th) {
        return this.portraitSmall()
          ? { th, r: 15.4, yaw: -.42, y: 1.9, pitch: -.1 }
          : { th, r: 15.6, yaw: -.3, y: 1.92, pitch: -.12 };
      }
      focusPose(entry, th) {
        const portrait = this.portraitSmall();
        if (entry.wall === 'outer') return { th, r: portrait ? OUTER_RADIUS - 5.4 : OUTER_RADIUS - 4.45, yaw: Math.PI / 2, y: portrait ? PY - .95 : PY - .42, pitch: 0 };
        return { th, r: portrait ? INNER_RADIUS + 5.4 : INNER_RADIUS + 4.45, yaw: -Math.PI / 2, y: portrait ? PY - .95 : PY - .42, pitch: 0 };
      }

      init() {
        const mount = $('mount');
        const w = innerWidth, h = innerHeight;
        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, this.small ? 1.5 : 2));
        renderer.setSize(w, h);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NoToneMapping;
        mount.appendChild(renderer.domElement);
        this.renderer = renderer;
        renderer.domElement.addEventListener('webglcontextlost', ev => { ev.preventDefault(); cancelAnimationFrame(this.raf); showNoGL(); });

        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#EEE4D3');
        scene.fog = new THREE.Fog('#EEE4D3', 18, 60);
        this.scene = scene;
        this.camera = new THREE.PerspectiveCamera(w >= h ? 56 : 70, w / h, .25, 80); // a near plane well away from 0 keeps depth precise, so far frames do not flicker
        const maxAniso = Math.min(renderer.capabilities.getMaxAnisotropy(), this.small ? 4 : 8);
        this.maxAniso = maxAniso;
        this.buildCorridor(scene, maxAniso);
        const { haloTex, shadowTex } = this.backdropTextures();

        let texLoaded = false, fontsLoaded = false, launched = false;
        const tryLaunch = () => {
          if (launched || this.destroyed || !texLoaded || !fontsLoaded) return;
          launched = true;
          clearTimeout(this.failsafe);
          this.beginOpening();
        };
        // the small pictures of all photographs come first; the full ones are loaded for the frames near the camera (see updateDetail)
        const manager = new THREE.LoadingManager();
        manager.onLoad = () => { texLoaded = true; tryLaunch(); };
        manager.onError = () => { texLoaded = true; tryLaunch(); };
        const thumbLoader = new THREE.TextureLoader(manager);
        const thumbs = PRINTS.map(pr => {
          const tex = pr.photo ? thumbLoader.load(thumb(pr.p)) : this.monogram(pr);
          tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = maxAniso;
          this.disposables.push(tex);
          return tex;
        });
        this.createLabels(maxAniso);
        this.buildPrintGroups(scene, thumbs, haloTex, shadowTex);

        const d = this.walkOffset(), base = this.walkPose(d);
        this.targetTh = d;
        this.pose = this.reduced ? { ...base } : { ...base, th: base.th + .16, r: base.r - .35 };
        this.applyPose();

        this.failsafe = setTimeout(() => { if (!launched && !this.destroyed) { launched = true; this.redrawAllLabels(); this.beginOpening(); } }, 4000);
        const fontsReady = () => { if (this.destroyed) return; this.redrawAllLabels(); fontsLoaded = true; tryLaunch(); };
        Promise.all([
          document.fonts.load('500 56px "EB Garamond"', 'čćšžđ'), document.fonts.load('italic 400 38px "EB Garamond"', 'čćšžđ'), document.fonts.load('500 24px Inter', 'čćšžđ'),
        ]).then(() => document.fonts.ready).then(fontsReady, fontsReady);

        this.onResize = () => this.handleResize();
        this.onWheel = e => this.handleWheel(e);
        this.onDown = e => this.handleDown(e);
        this.onMove = e => this.handleMove(e);
        this.onUp = e => this.handleUp(e);
        this.onKey = e => this.handleKey(e);
        addEventListener('resize', this.onResize);
        host.addEventListener('wheel', this.onWheel, { passive: false });
        host.addEventListener('pointerdown', this.onDown);
        addEventListener('pointermove', this.onMove);
        addEventListener('pointerup', this.onUp);
        addEventListener('pointercancel', this.onUp);
        addEventListener('keydown', this.onKey);
        mqSmall.addEventListener('change', e => { this.small = e.matches; });
        mqMotion.addEventListener('change', e => { this.reduced = e.matches; });

        this.last = performance.now();
        this.loop();
      }

      beginOpening() {
        $('mount').classList.add('ready');
        $('veil').classList.add('faded');
        gui.classList.add('intro-done');
        const target = this.walkPose(this.walkOffset());
        if (this.reduced) { this.pose = { ...target }; this.targetTh = target.th; this.glide = null; return; }
        this.glide = { startMs: performance.now(), durationMs: 1400, from: { ...this.pose }, to: { ...target }, mode: 'intro' };
      }

      buildCorridor(scene) {
        const gradTex = (stops) => {
          const c = document.createElement('canvas'); c.width = 4; c.height = 256;
          const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
          stops.forEach(([o, col]) => g.addColorStop(o, col));
          x.fillStyle = g; x.fillRect(0, 0, 4, 256);
          const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
          return tex;
        };
        const add = (geo, mat, y) => { const m = new THREE.Mesh(geo, mat); if (y != null) m.position.y = y; scene.add(m); this.disposables.push(geo, mat); return m; };
        const outerTex = gradTex([[0, '#F5EBD8'], [.2, '#FBF3E3'], [.6, '#FBF3E3'], [.86, '#F8EDD9'], [1, '#EFDFC4']]);
        add(new THREE.CylinderGeometry(OUTER_RADIUS, OUTER_RADIUS, WALL_HEIGHT, 160, 1, true), new THREE.MeshBasicMaterial({ map: outerTex, side: THREE.BackSide }), 3.1);
        const innerTex = gradTex([[0, '#F7EEDD'], [.3, '#FFFAF0'], [.8, '#FDF5E6'], [1, '#F1E1C6']]);
        add(new THREE.CylinderGeometry(INNER_RADIUS, INNER_RADIUS, WALL_HEIGHT, 120, 1, true), new THREE.MeshBasicMaterial({ map: innerTex, side: THREE.FrontSide }), 3.1);
        this.disposables.push(outerTex, innerTex);

        const fc = document.createElement('canvas'); fc.width = fc.height = 1024;
        const fx = fc.getContext('2d'), fg = fx.createRadialGradient(512, 512, 512 * INNER_RADIUS / OUTER_RADIUS, 512, 512, 512);
        fg.addColorStop(0, '#EDD6B0'); fg.addColorStop(.55, '#F3E1C3'); fg.addColorStop(1, '#EFDAB8');
        fx.fillStyle = fg; fx.fillRect(0, 0, 1024, 1024);
        const floorTex = new THREE.CanvasTexture(fc); floorTex.colorSpace = THREE.SRGBColorSpace; this.disposables.push(floorTex);
        add(new THREE.CircleGeometry(OUTER_RADIUS, 160), new THREE.MeshBasicMaterial({ map: floorTex })).rotation.x = -Math.PI / 2;
        const ceil = add(new THREE.CircleGeometry(OUTER_RADIUS, 160), new THREE.MeshBasicMaterial({ color: '#FAF1E0', side: THREE.BackSide }), WALL_HEIGHT);
        ceil.rotation.x = -Math.PI / 2;
      }

      backdropTextures() {
        const radial = (inner, outer) => {
          const c = document.createElement('canvas'); c.width = c.height = 256;
          const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
          g.addColorStop(0, inner); g.addColorStop(.35, inner); g.addColorStop(1, outer);
          x.fillStyle = g; x.fillRect(0, 0, 256, 256);
          const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
          this.disposables.push(tex);
          return tex;
        };
        const haloTex = radial('rgba(255,255,255,0.95)', 'rgba(255,255,255,0)');
        const c = document.createElement('canvas'); c.width = c.height = 256;
        const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
        g.addColorStop(0, 'rgba(120,90,50,0.28)'); g.addColorStop(.25, 'rgba(120,90,50,0.28)'); g.addColorStop(1, 'rgba(120,90,50,0)');
        x.fillStyle = g; x.fillRect(0, 0, 256, 256);
        const shadowTex = new THREE.CanvasTexture(c); shadowTex.colorSpace = THREE.SRGBColorSpace; this.disposables.push(shadowTex);
        return { haloTex, shadowTex };
      }

      // a card with the initials, for a person without a portrait (drawn again once the fonts are in)
      monogram(pr) {
        const c = document.createElement('canvas'); c.width = 480; c.height = 640;
        const tex = new THREE.CanvasTexture(c);
        (this.monos = this.monos || []).push({ c, tex, name: pr.p.name });
        this.drawMonogram(c, pr.p.name);
        return tex;
      }
      drawMonogram(c, name) {
        const x = c.getContext('2d');
        x.fillStyle = '#F6EAD8'; x.fillRect(0, 0, c.width, c.height);
        x.strokeStyle = 'rgba(58, 53, 80, 0.18)'; x.lineWidth = 3; x.strokeRect(28, 28, c.width - 56, c.height - 56);
        x.fillStyle = 'rgba(58, 53, 80, 0.72)'; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.font = '500 190px "EB Garamond", Georgia, serif';
        x.fillText(initials(name), c.width / 2, c.height / 2 + 6);
      }

      createLabels(maxAniso) {
        this.labels = PRINTS.map(pr => {
          const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 260;
          const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = maxAniso;
          this.disposables.push(tex);
          return { canvas, tex, index: pr.index };
        });
      }

      redrawAllLabels() {
        for (const item of this.labels) {
          const p = PRINTS[item.index].p, ctx = item.canvas.getContext('2d');
          ctx.clearRect(0, 0, 640, 260);
          ctx.fillStyle = '#3A3550';
          ctx.font = '500 56px "EB Garamond", Georgia, serif';
          ctx.fillText(p.name, 30, 66, 580);
          // the role on two lines at most (the whole text is in the dialog)
          ctx.font = 'italic 400 38px "EB Garamond", Georgia, serif';
          const words = roleOf(p).split(' '), lines = [''];
          for (const wd of words) {
            const tryLine = lines[lines.length - 1] ? lines[lines.length - 1] + ' ' + wd : wd;
            if (ctx.measureText(tryLine).width <= 580) lines[lines.length - 1] = tryLine;
            else if (lines.length < 2) lines.push(wd);
            else { lines[1] = lines[1].replace(/[ ,.:;]*$/, '') + '…'; break; }
          }
          while (ctx.measureText(lines[lines.length - 1]).width > 580) lines[lines.length - 1] = lines[lines.length - 1].slice(0, -2) + '…';
          lines.forEach((ln, k) => ctx.fillText(ln, 30, 114 + k * 38));
          ctx.fillStyle = 'rgba(58, 53, 80, 0.7)';
          ctx.font = '500 24px Inter, system-ui, sans-serif';
          ctx.fillText(catOf(p).toUpperCase(), 30, 232, 580);
          item.tex.needsUpdate = true;
        }
        for (const m of this.monos || []) { this.drawMonogram(m.c, m.name); m.tex.needsUpdate = true; }
      }

      buildPrintGroups(scene, thumbs, haloTex, shadowTex) {
        const haloMat = new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, fog: true });
        const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, fog: true });
        const frameMat = new THREE.MeshBasicMaterial({ color: '#D3AA72' });
        const labelGeo = new THREE.PlaneGeometry(.92, .92 * 260 / 640);
        this.disposables.push(haloMat, shadowMat, frameMat, labelGeo);

        const assets = PRINTS.map((pr, idx) => {
          const { pw, ph } = frameDims(pr);
          const a = {
            pw, ph,
            haloGeo: new THREE.PlaneGeometry(2.1 * pw, 1.75 * ph), shadowGeo: new THREE.PlaneGeometry(1.25 * pw, 1.18 * ph),
            frameGeo: new THREE.BoxGeometry(pw + .07, ph + .07, .06), printGeo: new THREE.PlaneGeometry(pw, ph),
            printMat: new THREE.MeshBasicMaterial({ map: thumbs[idx] }),
            labelMat: new THREE.MeshBasicMaterial({ map: this.labels[idx].tex, transparent: true, depthWrite: false }),
            thumb: thumbs[idx]
          };
          this.disposables.push(a.haloGeo, a.shadowGeo, a.frameGeo, a.printGeo, a.printMat, a.labelMat);
          return a;
        });

        const make = (printIndex, angle, wall) => {
          const a = assets[printIndex], group = new THREE.Group();
          const radius = wall === 'outer' ? 17.98 : 12.22, cx = radius * Math.cos(angle), cz = radius * Math.sin(angle);
          group.position.set(cx, 0, cz);
          if (wall === 'outer') group.lookAt(0, 0, 0); else group.lookAt(cx * 2, 0, cz * 2);
          const put = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); group.add(m); return m; };
          put(a.haloGeo, haloMat, 0, PY + .05, .005);
          put(a.shadowGeo, shadowMat, .05, PY - .06, .01);
          put(a.frameGeo, frameMat, 0, PY, .045);
          const printMesh = put(a.printGeo, a.printMat, 0, PY, .077);
          put(labelGeo, a.labelMat, -a.pw / 2 + .46, PY - a.ph / 2 - .42, .02);
          const entry = { printIndex, angle, wall, pw: a.pw, ph: a.ph, mesh: printMesh, mat: a.printMat, thumb: a.thumb, full: null, loading: false };
          printMesh.userData.entry = entry;
          this.entries.push(entry); this.meshes.push(printMesh);
          scene.add(group);
        };
        for (let s = 0; s < OUTER_COUNT; s++) make(s, s * 2 * Math.PI / OUTER_COUNT, 'outer');
        for (let k = 0; k < INNER_COUNT; k++) make(OUTER_COUNT + k, (k + .5) * 2 * Math.PI / INNER_COUNT, 'inner');
      }

      // full-size pictures only for the frames the camera can see (and the focused one): the rest keep the small picture, so memory stays small on a phone
      updateDetail() {
        const th = this.pose.th;
        for (const e of this.entries) {
          let d = Math.abs(this.shortestNear(e.angle, th) - th);
          if (!PRINTS[e.printIndex].photo) continue;
          const need = e === this.focusedEntry || d < 1.2;
          if (need && !e.full && !e.loading) {
            e.loading = true;
            this.loader.load(full(PRINTS[e.printIndex].p), tex => {
              e.loading = false;
              if (this.destroyed) { tex.dispose(); return; }
              tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = this.maxAniso;
              e.full = tex; e.mat.map = tex; e.mat.needsUpdate = true;
            }, undefined, () => { e.loading = false; });
          } else if (!need && e.full && d > 1.8) {
            e.mat.map = e.thumb; e.mat.needsUpdate = true;
            e.full.dispose(); e.full = null;
          }
        }
      }

      applyPose() {
        const cam = this.camera;
        if (!cam) return;
        const { th, r, yaw, y, pitch } = this.pose, c = Math.cos(th), s = Math.sin(th);
        this._pos.set(r * c, y, r * s);
        cam.position.copy(this._pos);
        const dx = Math.cos(yaw) * s + Math.sin(yaw) * c, dz = Math.cos(yaw) * -c + Math.sin(yaw) * s;
        this._look.set(this._pos.x + dx, this._pos.y + pitch, this._pos.z + dz);
        cam.lookAt(this._look);
      }

      shortestNear(angle, ref) {
        let a = angle;
        while (a - ref > Math.PI) a -= 2 * Math.PI;
        while (a - ref < -Math.PI) a += 2 * Math.PI;
        return a;
      }

      focusEntry(entry) {
        const to = this.focusPose(entry, this.shortestNear(entry.angle, this.pose.th));
        this.focusedEntry = entry;
        setFocused(true);
        if (this.reduced) { this.pose = { ...to }; this.targetTh = to.th; this.glide = null; this.applyPose(); this.updatePill(); return; }
        this.glide = { startMs: performance.now(), durationMs: 950, from: { ...this.pose }, to, mode: 'focus' };
      }

      stepBack() {
        if (!this.focusedEntry) return;
        const wt = this.pose.th + this.walkOffset(), to = this.walkPose(wt);
        this.focusedEntry = null; this.hoveringFocused = false;
        $('pill').classList.remove('visible');
        setFocused(false);
        this.targetTh = wt;
        if (this.reduced) { this.pose = { ...to }; this.glide = null; this.applyPose(); return; }
        this.glide = { startMs: performance.now(), durationMs: 950, from: { ...this.pose }, to, mode: 'walk' };
      }

      step(dir) {
        if (this.overlay) return;
        if (this.focusedEntry) { this.stepBack(); return; }
        if (this.glide && this.glide.mode === 'intro') this.glide = null;
        const d = this.walkOffset();
        this.targetTh = (Math.round((this.targetTh - d) / STEP) - dir) * STEP + d;
      }

      projectRect(entry) {
        const cam = this.camera, mesh = entry.mesh;
        mesh.updateMatrixWorld(true); cam.updateMatrixWorld(true);
        const w = innerWidth, h = innerHeight;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const hw = entry.pw / 2, hh = entry.ph / 2;
        for (const [cx, cy] of [[-hw, -hh], [hw, -hh], [-hw, hh], [hw, hh]]) {
          this._corner.set(cx, cy, 0).applyMatrix4(mesh.matrixWorld).project(cam);
          const sx = (this._corner.x + 1) / 2 * w, sy = (1 - this._corner.y) / 2 * h;
          minX = Math.min(minX, sx); maxX = Math.max(maxX, sx); minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
        }
        return { left: minX, top: minY, width: Math.max(0, maxX - minX), height: Math.max(0, maxY - minY) };
      }

      updatePill() {
        const pill = $('pill');
        if (this.overlay || !this.focusedEntry) { pill.classList.remove('visible'); return; }
        if (this.small) {
          const r = this.projectRect(this.focusedEntry);
          pill.style.left = `${r.left + r.width / 2}px`; pill.style.top = `${r.top + r.height * .55}px`;
          pill.classList.add('visible');
        } else if (this.hoveringFocused) {
          pill.style.left = `${this.cursorX}px`; pill.style.top = `${this.cursorY}px`;
          pill.classList.add('visible');
        } else pill.classList.remove('visible');
      }

      handleResize() {
        if (!this.renderer) return;
        const w = innerWidth, h = innerHeight;
        this.camera.fov = w >= h ? 56 : 70; this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, this.small ? 1.5 : 2));
        this.renderer.setSize(w, h);
        this.updatePill();
      }

      handleWheel(e) {
        if (this.overlay) return;
        e.preventDefault();
        if (this.focusedEntry) { this.stepBack(); return; }
        if (this.glide && this.glide.mode === 'intro') this.glide = null;
        this.targetTh += -(e.deltaY * (e.deltaMode === 1 ? 33 : 1)) * .0016;
      }

      handleDown(e) {
        if (this.overlay) return;
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        this.pointerDown = true; this.pointerMoved = false; this.pointerId = e.pointerId;
        this.downX = e.clientX; this.downY = e.clientY; this.dragStartTh = this.targetTh;
        try { host.setPointerCapture(e.pointerId); } catch (err) { /* not an active pointer: nothing to capture */ }
      }

      hitAt(x, y) {
        this.pointerNdc.x = x / innerWidth * 2 - 1; this.pointerNdc.y = -(y / innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.pointerNdc, this.camera);
        const hits = this.raycaster.intersectObjects(this.meshes, false);
        return hits.length ? hits[0].object : null;
      }

      handleMove(e) {
        if (this.overlay) { host.classList.remove('pointer'); $('pill').classList.remove('visible'); return; }
        this.cursorX = e.clientX; this.cursorY = e.clientY;
        if (this.pointerDown && e.pointerId === this.pointerId) {
          const dx = e.clientX - this.downX, dy = e.clientY - this.downY;
          if (!this.pointerMoved && Math.hypot(dx, dy) > 6) {
            this.pointerMoved = true;
            host.classList.add('grabbing');
            if (this.focusedEntry) { this.stepBack(); this.dragStartTh = this.targetTh; }
            if (this.glide && this.glide.mode === 'intro') this.glide = null;
          }
          if (this.pointerMoved) {
            this.targetTh = this.dragStartTh + (Math.abs(dx) > Math.abs(dy) ? dx : dy) * (this.small ? .0042 : .0022);
            return;
          }
        }
        if (this.camera && e.pointerType === 'mouse') {
          const m = this.hitAt(e.clientX, e.clientY);
          host.classList.toggle('pointer', !!m);
          this.hoveringFocused = !!m && !!this.focusedEntry && m === this.focusedEntry.mesh;
          this.updatePill();
        }
      }

      handleUp(e) {
        if (!this.pointerDown || e.pointerId !== this.pointerId) return;
        this.pointerDown = false; host.classList.remove('grabbing');
        try { host.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
        if (this.pointerMoved || this.overlay) { this.pointerMoved = false; return; }
        if (!this.camera) return;
        const m = this.hitAt(e.clientX, e.clientY);
        if (m) {
          const entry = m.userData.entry;
          if (!entry) return;
          if (this.focusedEntry && entry === this.focusedEntry) openPhoto(entry.printIndex);
          else this.focusEntry(entry);
        } else if (this.focusedEntry) this.stepBack();
      }

      handleKey(e) {
        if (this.overlay) return;
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (e.key === 'Escape' && this.focusedEntry) this.stepBack();
        else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); this.step(1); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); this.step(-1); }
        else if ((e.key === 'Enter') && this.focusedEntry && !(tag === 'BUTTON' || tag === 'A')) { e.preventDefault(); openPhoto(this.focusedEntry.printIndex); }
      }

      loop() {
        const lerp = (a, b, k) => a + (b - a) * k;
        const lerpAngle = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };
        const tick = now => {
          if (this.destroyed) return;
          this.raf = requestAnimationFrame(tick);
          const dt = Math.min(.1, Math.max(.0001, (now - this.last) / 1000));
          this.last = now;
          const g = this.glide;
          if (g) {
            const k = Math.min(1, (now - g.startMs) / g.durationMs), p = this.pose;
            if (g.mode === 'intro') {
              const e = k >= 1 ? 1 : 1 - Math.pow(2, -10 * k);
              p.th = lerp(g.from.th, g.to.th, e); p.r = lerp(g.from.r, g.to.r, e); p.yaw = lerp(g.from.yaw, g.to.yaw, e); p.y = lerp(g.from.y, g.to.y, e); p.pitch = lerp(g.from.pitch, g.to.pitch, e);
            } else {
              const eTh = 1 - Math.pow(1 - k, 4), eYaw = 1 - Math.pow(1 - k, 2), eRest = 1 - Math.pow(1 - k, 3);
              p.th = lerp(g.from.th, g.to.th, eTh); p.yaw = lerpAngle(g.from.yaw, g.to.yaw, eYaw);
              p.r = lerp(g.from.r, g.to.r, eRest); p.y = lerp(g.from.y, g.to.y, eRest); p.pitch = lerp(g.from.pitch, g.to.pitch, eRest);
            }
            if (k >= 1) {
              this.pose = { ...g.to };
              if (g.mode === 'walk' || g.mode === 'intro') this.targetTh = this.pose.th;
              this.glide = null;
            }
          } else if (!this.focusedEntry) {
            if (this.reduced) this.pose.th = this.targetTh;
            else this.pose.th += (this.targetTh - this.pose.th) * (1 - Math.exp(-dt / .36));
            const wp = this.walkPose(this.pose.th);
            this.pose.r = wp.r; this.pose.yaw = wp.yaw; this.pose.y = wp.y; this.pose.pitch = wp.pitch;
          }
          this.applyPose();
          if (this.focusedEntry) this.updatePill();
          if (now - this.detailAt > 250) { this.detailAt = now; this.updateDetail(); }
          this.renderer.render(this.scene, this.camera);
        };
        this.raf = requestAnimationFrame(tick);
      }

      // a photograph from the list or from a link: go to its frame
      focusPrint(printIndex) {
        const e = this.entries.find(x => x.printIndex === printIndex);
        if (e) this.focusEntry(e);
      }
    }

    stage = new Stage();
    stage.init();
    return true;
  }

  function setFocused(f) { focused = f; setHints(); }

  // without WebGL (or when the context is lost) only the list is left
  function showNoGL() {
    stage = null;
    buildList();
    list.classList.add('open');
    list.setAttribute('aria-hidden', 'false');
    gui.classList.add('hidden');
  }

  /* ---------- go ---------- */
  setHints();
  if (!PRINTS.length) { showNoGL(); return; }
  startScene().then(ok => {
    if (!ok) { gui.classList.add('intro-done'); showNoGL(); return; }
    // a link to hodnik#<id> opens that person
    const h = decodeURIComponent(location.hash.slice(1));
    const i = PRINTS.findIndex(it => it.p.id === h);
    if (i >= 0) openPhoto(i);
  });
})();
