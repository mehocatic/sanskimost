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
          document.fonts.load('600 58px "EB Garamond"', 'čćšžđ'), document.fonts.load('italic 400 38px "EB Garamond"', 'čćšžđ'), document.fonts.load('600 24px Inter', 'čćšžđ'),
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

      // a gallery: warm white walls with a skirting board and a picture rail, a light oak floor, a ceiling with a ring of light
      // everything is drawn into small canvas textures (no lights, no shadows), so a phone keeps up
      buildCorridor(scene, maxAniso) {
        const texOf = (c, aniso) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (aniso) t.anisotropy = maxAniso; this.disposables.push(t); return t; };
        const add = (geo, mat, y) => { const m = new THREE.Mesh(geo, mat); if (y != null) m.position.y = y; scene.add(m); this.disposables.push(geo, mat); return m; };

        let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        // soft blobs drawn also one tile to the left and right, so the texture repeats round the circle without a seam
        const blobs = (x, w, h, n, rMin, rMax, cols) => {
          for (let i = 0; i < n; i++) {
            const bx = rnd() * w, by = rnd() * h, r = rMin + rnd() * (rMax - rMin), col = cols[Math.floor(rnd() * cols.length)];
            for (const ox of [-w, 0, w]) {
              const g = x.createRadialGradient(bx + ox, by, 0, bx + ox, by, r);
              g.addColorStop(0, col); g.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
              x.fillStyle = g; x.fillRect(bx + ox - r, by - r, 2 * r, 2 * r);
            }
          }
        };

        // the walls: warm plaster with a soft mottling, a carved cornice under the ceiling and an oak skirting board
        // canvas y 0 is the top of the wall: a height h on the wall is at y = (1 - h / WALL_HEIGHT) * H
        const wallTex = (light, mid, tiles) => {
          const W = 256, H = 1024, c = document.createElement('canvas'); c.width = W; c.height = H;
          const x = c.getContext('2d'), yAt = h => (1 - h / WALL_HEIGHT) * H;
          const g = x.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, mid); g.addColorStop(.25, light); g.addColorStop(.8, light); g.addColorStop(1, mid);
          x.fillStyle = g; x.fillRect(0, 0, W, H);
          blobs(x, W, H, 90, 20, 70, ['rgba(214, 196, 166, 0.10)', 'rgba(255, 252, 244, 0.16)']);
          const band = (h0, h1, col) => { x.fillStyle = col; x.fillRect(0, yAt(h1), W, yAt(h0) - yAt(h1)); };
          const fade = (h0, h1, from, to) => { const fg = x.createLinearGradient(0, yAt(h1), 0, yAt(h0)); fg.addColorStop(0, from); fg.addColorStop(1, to); x.fillStyle = fg; x.fillRect(0, yAt(h1), W, yAt(h0) - yAt(h1)); };
          // cornice: shadow on the wall, a lit cove, a row of small blocks (dentils), a lit lip
          fade(5.45, 5.6, 'rgba(110, 85, 50, 0)', 'rgba(110, 85, 50, 0.16)');
          band(5.6, 5.64, '#D9C6A3'); band(5.64, 5.68, '#F7EEDD');
          band(5.68, 5.8, '#E7D8BC');
          for (let k = 0; k < 8; k++) { x.fillStyle = '#F5EBD8'; x.fillRect(k * 32 + 4, yAt(5.79), 22, yAt(5.69) - yAt(5.79)); x.fillStyle = 'rgba(110, 85, 50, 0.25)'; x.fillRect(k * 32 + 26, yAt(5.79), 3, yAt(5.69) - yAt(5.79)); }
          band(5.8, 5.84, '#CDB690');
          const cove = x.createLinearGradient(0, yAt(6.2), 0, yAt(5.84)); cove.addColorStop(0, '#E2D2B4'); cove.addColorStop(1, '#FBF4E6');
          x.fillStyle = cove; x.fillRect(0, yAt(6.2), W, yAt(5.84) - yAt(6.2));
          // skirting board in oak, with a lit top edge and a shadow above it
          fade(.2, .34, 'rgba(110, 85, 50, 0)', 'rgba(110, 85, 50, 0.12)');
          band(0, .2, '#C9A97B'); band(.17, .2, '#DCC096'); band(.165, .17, '#A88A5E'); band(0, .025, '#9E8058');
          const t = texOf(c, true); t.wrapS = THREE.RepeatWrapping; t.repeat.x = tiles;
          return t;
        };
        // a whole number of tiles round each wall (about 3 units each), so the seam does not show
        add(new THREE.CylinderGeometry(OUTER_RADIUS, OUTER_RADIUS, WALL_HEIGHT, 160, 1, true), new THREE.MeshBasicMaterial({ map: wallTex('#EEE4D3', '#E2D4BE', 38), side: THREE.BackSide }), WALL_HEIGHT / 2);
        add(new THREE.CylinderGeometry(INNER_RADIUS, INNER_RADIUS, WALL_HEIGHT, 120, 1, true), new THREE.MeshBasicMaterial({ map: wallTex('#F1E8D8', '#E5D9C4', 26), side: THREE.FrontSide }), WALL_HEIGHT / 2);

        this.buildColumns(scene, texOf);

        // light oak boards laid round the circle: the texture runs along the boards, and its u goes round the ring
        const pc = document.createElement('canvas'); pc.width = pc.height = 512;
        const px = pc.getContext('2d'), tones = ['#E3CDA7', '#DEC69E', '#E8D3B0', '#DAC097', '#E1CAA3', '#D6BB90'];
        const ROW = 64;
        for (let row = 0; row < 512 / ROW; row++) {
          const y = row * ROW, joints = [];
          for (let k = 0, xj = rnd() * 220; k < 3; k++, xj += 150 + rnd() * 70) joints.push(xj % 512);
          joints.sort((p, q) => p - q);
          joints.forEach((j0, k) => {
            const j1 = k + 1 < joints.length ? joints[k + 1] : joints[0] + 512, len = j1 - j0;
            for (const ox of [0, -512]) {
              const bx = j0 + ox;
              px.fillStyle = tones[Math.floor(rnd() * tones.length)]; px.fillRect(bx, y, len, ROW);
              px.globalAlpha = .13; px.strokeStyle = '#B08F62'; px.lineWidth = 1;
              for (let n = 0; n < 4; n++) { const gy = y + 8 + rnd() * (ROW - 16); px.beginPath(); px.moveTo(bx + 6, gy); px.bezierCurveTo(bx + len * .3, gy + rnd() * 6 - 3, bx + len * .7, gy + rnd() * 6 - 3, bx + len - 6, gy); px.stroke(); }
              px.globalAlpha = .4; px.fillStyle = '#A6865B'; px.fillRect(bx, y, 1.5, ROW);
              px.globalAlpha = 1;
            }
          });
          px.globalAlpha = .38; px.fillStyle = '#A6865B'; px.fillRect(0, y, 512, 1.5); px.globalAlpha = 1;
        }
        const floorTex = texOf(pc, true);
        floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
        // boards about 0.45 wide and 2 to 3 long: 8 rows per tile across, a whole number of tiles round
        const SEGS = 320, RINGS = 12, MID_R = (INNER_RADIUS + OUTER_RADIUS) / 2, TILE_V = 8 * .45, TILES_U = Math.round(2 * Math.PI * MID_R / 7.6);
        const floorGeo = new THREE.RingGeometry(INNER_RADIUS - .05, OUTER_RADIUS + .05, SEGS, RINGS);
        const pos = floorGeo.attributes.position, uv = floorGeo.attributes.uv;
        for (let j = 0, n = 0; j <= RINGS; j++) for (let i = 0; i <= SEGS; i++, n++) {
          const r = Math.hypot(pos.getX(n), pos.getY(n));
          uv.setXY(n, i / SEGS * TILES_U, (r - INNER_RADIUS) / TILE_V);
        }
        uv.needsUpdate = true;
        add(floorGeo, new THREE.MeshBasicMaterial({ map: floorTex })).rotation.x = -Math.PI / 2;

        // a soft darkening where the floor meets the walls, and a little in the middle of the walk
        const ac = document.createElement('canvas'); ac.width = ac.height = 1024;
        const ax = ac.getContext('2d'), ri = (INNER_RADIUS - .05) / OUTER_RADIUS, ag = ax.createRadialGradient(512, 512, 0, 512, 512, 512);
        ag.addColorStop(0, 'rgba(110, 80, 45, 0.3)'); ag.addColorStop(ri, 'rgba(110, 80, 45, 0.3)'); ag.addColorStop(ri + .035, 'rgba(110, 80, 45, 0)');
        ag.addColorStop(.965, 'rgba(110, 80, 45, 0)'); ag.addColorStop(1, 'rgba(110, 80, 45, 0.28)');
        ax.fillStyle = ag; ax.fillRect(0, 0, 1024, 1024);
        add(new THREE.CircleGeometry(OUTER_RADIUS, 160), new THREE.MeshBasicMaterial({ map: texOf(ac), transparent: true, depthWrite: false }), .004).rotation.x = -Math.PI / 2;

        // the ceiling: coffers between beams that run across the corridor over each pilaster, with a ring of light along the middle
        const ceil = add(new THREE.CircleGeometry(OUTER_RADIUS, 160), new THREE.MeshBasicMaterial({ color: '#EDE2CF', side: THREE.BackSide }), WALL_HEIGHT);
        ceil.rotation.x = -Math.PI / 2;
        const strip = add(new THREE.RingGeometry(MID_R - .3, MID_R + .3, 240), new THREE.MeshBasicMaterial({ color: '#FFFCF5', side: THREE.DoubleSide }), WALL_HEIGHT - .02);
        strip.rotation.x = -Math.PI / 2;
        const edge = add(new THREE.RingGeometry(MID_R - .4, MID_R + .4, 240), new THREE.MeshBasicMaterial({ color: '#DCCDB2', side: THREE.DoubleSide }), WALL_HEIGHT - .015);
        edge.rotation.x = -Math.PI / 2;
        // a beam: lighter in the middle of its underside, darker at the edges
        const bc = document.createElement('canvas'); bc.width = bc.height = 64;
        const bx = bc.getContext('2d'), bg = bx.createLinearGradient(0, 0, 64, 0);
        bg.addColorStop(0, '#CDBA98'); bg.addColorStop(.2, '#EFE4D0'); bg.addColorStop(.8, '#EFE4D0'); bg.addColorStop(1, '#CDBA98');
        bx.fillStyle = bg; bx.fillRect(0, 0, 64, 64);
        const beamTex = texOf(bc), beamMat = new THREE.MeshBasicMaterial({ map: beamTex });
        const beamLen = OUTER_RADIUS - INNER_RADIUS, beamGeo = new THREE.BoxGeometry(.32, .22, beamLen);
        this.disposables.push(beamMat, beamGeo);
        for (let s = 0; s < OUTER_COUNT; s++) {
          const a = -(s + .5) * STEP, m = new THREE.Mesh(beamGeo, beamMat);
          m.position.set(MID_R * Math.cos(a), WALL_HEIGHT - .11, MID_R * Math.sin(a));
          m.lookAt(0, WALL_HEIGHT - .11, 0); scene.add(m);
        }
      }

      // engaged Ionic columns on the outer wall, halfway between the pictures: a plinth and two rings at the foot, a fluted shaft that narrows a little
      // towards the top, a capital with volutes, and a block that carries the cornice. Their axis stands in the wall, so half of each column shows.
      // They are the only lit things in the scene (the rest has its light painted in): the light makes the flutes and the rings read as round.
      // Each part is one instanced mesh for all the columns, so the whole colonnade costs a dozen draw calls.
      buildColumns(scene, texOf) {
        const N = OUTER_COUNT, R_AXIS = OUTER_RADIUS - .02;
        const stone = new THREE.MeshLambertMaterial({ color: '#F2E9DA' });
        const stoneDim = new THREE.MeshLambertMaterial({ color: '#E6D8BF' });
        this.disposables.push(stone, stoneDim);
        // light for the columns only: a soft sky from above and a lamp in the middle of the room, which faces every column the same way
        scene.add(new THREE.HemisphereLight(0xfffaf2, 0xb9a07c, 1.5));
        const lamp = new THREE.PointLight(0xfff5e8, 2.1, 0, 0); lamp.position.set(0, 4.2, 0); scene.add(lamp);

        // the fluted shaft: 24 concave flutes with narrow flat fillets between them, slightly wider at the foot (entasis)
        const SH0 = .42, SH1 = 4.92, shaft = new THREE.CylinderGeometry(.205, .232, SH1 - SH0, 192, 1, true);
        {
          const p = shaft.attributes.position, NF = 24;
          for (let i = 0; i < p.count; i++) {
            const x = p.getX(i), z = p.getZ(i), th = Math.atan2(x, z);
            const ph = (((th / (2 * Math.PI)) * NF) % 1 + 1) % 1, fil = .16;
            const g = ph < fil ? 0 : Math.sin(Math.PI * (ph - fil) / (1 - fil));
            const k = 1 - .1 * g;
            p.setX(i, x * k); p.setZ(i, z * k);
          }
          shaft.computeVertexNormals();
        }
        // the capital's echinus, a flared ring under the abacus
        const echinus = new THREE.LatheGeometry([[.2, 0], [.225, .03], [.26, .08], [.29, .13], [.3, .16]].map(([r, y]) => new THREE.Vector2(r, y)), 64);
        const parts = [
          [new THREE.BoxGeometry(.7, .2, .7), stoneDim, 0, .1, 0],                     // plinth, as tall as the skirting board
          [new THREE.TorusGeometry(.27, .055, 14, 64), stone, 0, .265, 0, true],         // lower torus
          [new THREE.CylinderGeometry(.235, .25, .06, 64), stoneDim, 0, .33, 0],         // scotia
          [new THREE.TorusGeometry(.245, .035, 12, 64), stone, 0, .39, 0, true],         // upper torus
          [shaft, stone, 0, (SH0 + SH1) / 2, 0],
          [new THREE.TorusGeometry(.212, .026, 10, 64), stone, 0, SH1 + .02, 0, true],   // necking ring
          [echinus, stone, 0, SH1 + .04, 0],
          [new THREE.BoxGeometry(.72, .09, .72), stoneDim, 0, SH1 + .245, 0],           // abacus
          [new THREE.TorusGeometry(.065, .024, 10, 32), stone, -.3, SH1 + .14, .25],    // volutes, left and right
          [new THREE.TorusGeometry(.065, .024, 10, 32), stone, .3, SH1 + .14, .25],
          [new THREE.SphereGeometry(.028, 12, 8), stoneDim, -.3, SH1 + .14, .27],       // their eyes
          [new THREE.SphereGeometry(.028, 12, 8), stoneDim, .3, SH1 + .14, .27],
          [new THREE.BoxGeometry(.82, 5.6 - (SH1 + .29), .56), stone, 0, (5.6 + SH1 + .29) / 2, 0], // the block under the cornice
        ];
        const col = new THREE.Object3D(), part = new THREE.Matrix4(), m = new THREE.Matrix4();
        for (const [geo, mat, px, py, pz, flat] of parts) {
          this.disposables.push(geo);
          const inst = new THREE.InstancedMesh(geo, mat, N);
          part.makeTranslation(px, py, pz);
          if (flat) part.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
          for (let s = 0; s < N; s++) {
            const a = -(s + .5) * STEP;
            col.position.set(R_AXIS * Math.cos(a), 0, R_AXIS * Math.sin(a)); col.lookAt(0, 0, 0); col.updateMatrix();
            inst.setMatrixAt(s, m.multiplyMatrices(col.matrix, part));
          }
          inst.instanceMatrix.needsUpdate = true;
          scene.add(inst);
        }

        // a soft shadow on the wall on both sides of each column, so it stands off the wall
        const sc = document.createElement('canvas'); sc.width = 128; sc.height = 4;
        const sx = sc.getContext('2d'), sg = sx.createLinearGradient(0, 0, 128, 0);
        sg.addColorStop(0, 'rgba(110, 85, 50, 0)'); sg.addColorStop(.3, 'rgba(110, 85, 50, 0.2)'); sg.addColorStop(.5, 'rgba(110, 85, 50, 0.24)');
        sg.addColorStop(.7, 'rgba(110, 85, 50, 0.2)'); sg.addColorStop(1, 'rgba(110, 85, 50, 0)');
        sx.fillStyle = sg; sx.fillRect(0, 0, 128, 4);
        const aoMat = new THREE.MeshBasicMaterial({ map: texOf(sc), transparent: true, depthWrite: false }), aoGeo = new THREE.PlaneGeometry(1.15, 5.4);
        this.disposables.push(aoMat, aoGeo);
        const ao = new THREE.InstancedMesh(aoGeo, aoMat, N);
        part.makeTranslation(0, 2.9, -.012);
        for (let s = 0; s < N; s++) {
          const a = -(s + .5) * STEP;
          col.position.set(R_AXIS * Math.cos(a), 0, R_AXIS * Math.sin(a)); col.lookAt(0, 0, 0); col.updateMatrix();
          ao.setMatrixAt(s, m.multiplyMatrices(col.matrix, part));
        }
        scene.add(ao);
      }

      backdropTextures() {
        // a warm wash of light on the wall, strongest under the rail and fading down and to the sides, as under a gallery lamp
        // drawn pixel by pixel, so it fades to nothing at every edge of its plane
        const S = 128, hc = document.createElement('canvas'); hc.width = hc.height = S;
        const hx = hc.getContext('2d'), img = hx.createImageData(S, S);
        for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
          const u = (px + .5) / S * 2 - 1, v = (py + .5) / S;
          const across = Math.max(0, 1 - u * u / Math.max(.05, .35 + .65 * v)); // narrow at the top, wider lower down
          const a = Math.pow(across, 2) * Math.pow(1 - v, 1.4) * Math.min(1, v * 4.5);
          const o = (py * S + px) * 4;
          img.data[o] = 255; img.data[o + 1] = 251; img.data[o + 2] = 242; img.data[o + 3] = Math.round(a * 215);
        }
        hx.putImageData(img, 0, 0);
        const haloTex = new THREE.CanvasTexture(hc); haloTex.colorSpace = THREE.SRGBColorSpace; this.disposables.push(haloTex);
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
          const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 2 * LABEL_CH; // drawn at twice the size, so the text stays sharp close up
          const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = maxAniso;
          this.disposables.push(tex);
          return { canvas, tex, index: pr.index };
        });
      }

      redrawAllLabels() {
        for (const item of this.labels) {
          const p = PRINTS[item.index].p, ctx = item.canvas.getContext('2d');
          ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, 640, LABEL_CH);
          // the field on top, like a museum label, then the name and the role
          ctx.fillStyle = '#6B4F22';
          ctx.font = '600 23px Inter, system-ui, sans-serif';
          if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
          ctx.fillText(catOf(p).toUpperCase(), 30, 30, 580);
          if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
          ctx.fillStyle = '#2B2740';
          ctx.font = '600 58px "EB Garamond", Georgia, serif';
          ctx.fillText(p.name, 30, 90, 580);
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
          lines.forEach((ln, k) => ctx.fillText(ln, 30, 136 + k * 38));
          item.tex.needsUpdate = true;
        }
        for (const m of this.monos || []) { this.drawMonogram(m.c, m.name); m.tex.needsUpdate = true; }
      }

      buildPrintGroups(scene, thumbs, haloTex, shadowTex) {
        const haloMat = new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, fog: true });
        const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, fog: true });
        // the frames are built from a photograph of a real carved frame, cut into pieces by tools/okvir-isjeci.py (photos/okvir/):
        // two top corners (mirrored for the bottom ones), the carved middle of each side, and a plain stretch on either side of it that is
        // repeated, mirrored, as far as the frame needs. The middles are never stretched, so the carving keeps its shape on every frame.
        // All the frames' pieces of one kind go into one mesh, so 48 frames cost a couple of dozen draw calls.
        // Sizes are the photograph's pixels; PX turns them into world units. D: from the opening out past the carving; C: a corner.
        const PX = .0019, MOUNT = .1, D_PX = FRAME_D, C_PX = FRAME_C, PIECES = FRAME_PIECES;
        const DW = D_PX * PX, CW = C_PX * PX, FRAME = DW * .92; // FRAME: about how far the carving reaches past the mount
        const pieceTex = {}, piecePos = {}, pieceUv = {};
        const texLoader = new THREE.TextureLoader();
        for (const k of Object.keys(PIECES)) {
          const t = texLoader.load(`photos/okvir/${k}.webp`);
          t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = this.maxAniso;
          if (k === 't-l' || k === 't-r' || k === 'b-p') t.wrapS = THREE.MirroredRepeatWrapping;
          if (k === 'l-p' || k === 'r-p') t.wrapT = THREE.MirroredRepeatWrapping;
          pieceTex[k] = t; piecePos[k] = []; pieceUv[k] = []; this.disposables.push(t);
        }
        const mountMat = new THREE.MeshBasicMaterial({ color: '#FBF8F1' });
        const bevelMat = new THREE.MeshBasicMaterial({ color: '#E4D8C4' });
        this.disposables.push(haloMat, shadowMat, mountMat, bevelMat);
        // one rectangle of one piece, x0..x1 and y0..y1 in the frame's own plane; the texture's u runs u0 -> u1 left to right, v v0 -> v1 bottom to top
        const _v = new THREE.Vector3();
        let bendZ = () => 0; // how far the wall behind a point of the frame comes forward (outer wall) or falls back (inner wall), see make()
        const rect = (k, m, x0, y0, x1, y1, u0, u1, v0, v1, z) => {
          for (const [x, y, u, v] of [[x0, y0, u0, v0], [x1, y0, u1, v0], [x1, y1, u1, v1], [x0, y0, u0, v0], [x1, y1, u1, v1], [x0, y1, u0, v1]]) {
            _v.set(x, y, z + bendZ(x)).applyMatrix4(m); piecePos[k].push(_v.x, _v.y, _v.z); pieceUv[k].push(u, v);
          }
        };
        // how a plain stretch of `len` is covered by a piece `pw` long: an odd number of mirrored repeats (so both ends meet what the photograph had
        // next to them), or a part of it when the stretch is shorter than the piece
        const reps = (len, pw) => { const r = len / pw; return r < 1 ? r : Math.max(1, 2 * Math.round((r - 1) / 2) + 1); };
        // the whole frame round a mount mw x mh centred at (cx, cy)
        const addFrame = (m, mw, mh, cx, cy, z, bend) => {
          bendZ = bend;
          const xl = cx - mw / 2, xr = cx + mw / 2, yt = cy + mh / 2, yb = cy - mh / 2;
          // corners: the top ones as photographed, the bottom ones the same turned upside down
          rect('c-tl', m, xl - DW, yt + DW - CW, xl - DW + CW, yt + DW, 0, 1, 0, 1, z);
          rect('c-tr', m, xr + DW - CW, yt + DW - CW, xr + DW, yt + DW, 0, 1, 0, 1, z);
          rect('c-tl', m, xl - DW, yb - DW, xl - DW + CW, yb - DW + CW, 0, 1, 1, 0, z);
          rect('c-tr', m, xr + DW - CW, yb - DW, xr + DW, yb - DW + CW, 0, 1, 1, 0, z);
          // top and bottom: plain, middle, plain
          const runH = mw + 2 * DW - 2 * CW, midW = Math.min(PIECES['t-c'][0] * PX, runH), midCut = midW / (PIECES['t-c'][0] * PX);
          const plainH = (runH - midW) / 2, xa = xl - DW + CW, xm0 = cx - midW / 2, xm1 = cx + midW / 2, xb = xr + DW - CW;
          const mu0 = (1 - midCut) / 2, mu1 = 1 - mu0;
          rect('t-c', m, xm0, yt, xm1, yt + DW, mu0, mu1, 0, 1, z);
          rect('b-c', m, xm0, yb - DW, xm1, yb, mu0, mu1, 0, 1, z);
          if (plainH > .005) {
            const nl = reps(plainH, PIECES['t-l'][0] * PX), nr = reps(plainH, PIECES['t-r'][0] * PX), nb = reps(plainH, PIECES['b-p'][0] * PX);
            rect('t-l', m, xa, yt, xm0, yt + DW, 1 - nl, 1, 0, 1, z);     // ends at u = 1, against the middle
            rect('t-r', m, xm1, yt, xb, yt + DW, 0, nr, 0, 1, z);         // starts at u = 0, against the middle
            rect('b-p', m, xm1, yb - DW, xb, yb, 0, nb, 0, 1, z);
            rect('b-p', m, xa, yb - DW, xm0, yb, nb, 0, 0, 1, z);         // the bottom right stretch, mirrored for the left
          }
          // left and right: plain, middle, plain (the lower plain is the upper one upside down)
          const runV = mh + 2 * DW - 2 * CW, midH = Math.min(PIECES['l-c'][1] * PX, runV), vCut = midH / (PIECES['l-c'][1] * PX);
          const plainV = (runV - midH) / 2, ya = yt + DW - CW, ym1 = cy + midH / 2, ym0 = cy - midH / 2, yz = yb - DW + CW;
          const mv0 = (1 - vCut) / 2, mv1 = 1 - mv0;
          rect('l-c', m, xl - DW, ym0, xl, ym1, 0, 1, mv0, mv1, z);
          rect('r-c', m, xr, ym0, xr + DW, ym1, 0, 1, mv0, mv1, z);
          if (plainV > .005) {
            const nv = reps(plainV, PIECES['l-p'][1] * PX);
            rect('l-p', m, xl - DW, ym1, xl, ya, 0, 1, 1 - nv, 1, z);     // its top (v = 1) against the corner
            rect('l-p', m, xl - DW, yz, xl, ym0, 0, 1, 1, 1 - nv, z);
            rect('r-p', m, xr, ym1, xr + DW, ya, 0, 1, 1 - nv, 1, z);
            rect('r-p', m, xr, yz, xr + DW, ym0, 0, 1, 1, 1 - nv, z);
          }
        };

        // the frame's thickness: four sides from the back of the carving down to the wall, set in a little from the outline (where the frame
        // is solid all round), so that seen at an angle the frame stands on the wall instead of hanging in front of it. Lit like the rest:
        // the top side lightest, the bottom darkest, each side darker towards the wall. All frames' sides are one mesh.
        const sidePos = [], sideCol = [], _c = new THREE.Color();
        const addSides = (m, mw, mh, cy, bend, zBack, zFront) => {
          const e = DW * .68, x0 = -mw / 2 - e, x1 = mw / 2 + e, y0 = cy - mh / 2 - e, y1 = cy + mh / 2 + e;
          const front = new THREE.Color('#EDE6D9'), back = new THREE.Color('#A89A82');
          const quad = (pts, lum) => { // pts: [x, y, zIsFront] for 4 corners, in order
            const v = pts.map(([x, y, f]) => { _v.set(x, y, (f ? zFront : zBack) + bend(x)).applyMatrix4(m); _c.copy(f ? front : back).multiplyScalar(lum); return [_v.x, _v.y, _v.z, _c.r, _c.g, _c.b]; });
            for (const i of [0, 1, 2, 0, 2, 3]) { sidePos.push(v[i][0], v[i][1], v[i][2]); sideCol.push(v[i][3], v[i][4], v[i][5]); }
          };
          const N = 12; // the long sides in short pieces, so they follow the curve of the wall
          for (let i = 0; i < N; i++) {
            const xa = x0 + (x1 - x0) * i / N, xb = x0 + (x1 - x0) * (i + 1) / N;
            quad([[xa, y1, 0], [xb, y1, 0], [xb, y1, 1], [xa, y1, 1]], 1.04);   // top
            quad([[xa, y0, 0], [xb, y0, 0], [xb, y0, 1], [xa, y0, 1]], .72);    // bottom
          }
          quad([[x0, y0, 0], [x0, y1, 0], [x0, y1, 1], [x0, y0, 1]], .95);       // left, towards the light
          quad([[x1, y0, 0], [x1, y1, 0], [x1, y1, 1], [x1, y0, 1]], .8);        // right
        };

        // the walls are curved and the glow, the shadow and the label are wide and flat: bend them to follow the wall,
        // or the wall cuts through their ends (a hard edge on the glow, the first letters of a name missing)
        const OUT_GAP = .02, IN_GAP = .02; // how far a frame's group stands off the outer / inner wall (everything on it follows the curve)
        const bent = (w, h, cx, outer) => {
          const g = new THREE.PlaneGeometry(w, h, 24, 1), p = g.attributes.position, R = outer ? OUTER_RADIUS : INNER_RADIUS;
          for (let i = 0; i < p.count; i++) {
            const X = Math.min(R * .99, Math.abs(cx + p.getX(i))), d = R - Math.sqrt(R * R - X * X);
            p.setZ(i, outer ? d : -d);
          }
          p.needsUpdate = true;
          return g;
        };

        const assets = PRINTS.map((pr, idx) => {
          const outer = idx < OUTER_COUNT;
          const { pw, ph } = frameDims(pr);
          const mw = pw + 2 * MOUNT, mh = ph + 2 * MOUNT, fw = mw + 2 * FRAME, fh = mh + 2 * FRAME;
          const glowH = Math.min(1.15, 5.4 - (PY + fh / 2)) + fh * .7, labelX = -fw / 2 + LABEL_W / 2;
          const a = {
            pw, ph, mw, mh, fw, fh, glowH, glowTop: Math.min(PY + fh / 2 + 1.15, 5.4), labelX, wallZ: outer ? -OUT_GAP : -IN_GAP,
            haloGeo: bent(1.8 * fw, glowH, 0, outer), shadowGeo: bent(1.14 * fw, 1.12 * fh, .07, outer),
            labelGeo: bent(LABEL_W, LABEL_W * LABEL_CH / 640, labelX, outer),
            mountGeo: bent(mw + .02, mh + .02, 0, outer),
            bevelGeo: bent(pw + .024, ph + .024, 0, outer), printGeo: bent(pw, ph, 0, outer),
            printMat: new THREE.MeshBasicMaterial({ map: thumbs[idx] }),
            labelMat: new THREE.MeshBasicMaterial({ map: this.labels[idx].tex, transparent: true, depthWrite: false }),
            thumb: thumbs[idx]
          };
          this.disposables.push(a.haloGeo, a.shadowGeo, a.labelGeo, a.mountGeo, a.bevelGeo, a.printGeo, a.printMat, a.labelMat);
          return a;
        });

        const shadowFrames = [];
        const make = (printIndex, angle, wall) => {
          const a = assets[printIndex], group = new THREE.Group();
          const radius = wall === 'outer' ? OUTER_RADIUS - OUT_GAP : INNER_RADIUS + IN_GAP, cx = radius * Math.cos(angle), cz = radius * Math.sin(angle);
          group.position.set(cx, 0, cz);
          if (wall === 'outer') group.lookAt(0, 0, 0); else group.lookAt(cx * 2, 0, cz * 2);
          const put = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); group.add(m); return m; };
          // layers stand a few millimetres apart (not fractions of one), so far away they do not fight over the same pixels and flicker
          put(a.haloGeo, haloMat, 0, a.glowTop - a.glowH / 2, a.wallZ + .006);
          put(a.shadowGeo, shadowMat, .07, PY - .1, a.wallZ + .012);
          const mountMesh = put(a.mountGeo, mountMat, 0, PY, .05);
          put(a.bevelGeo, bevelMat, 0, PY, .054);
          const printMesh = put(a.printGeo, a.printMat, 0, PY, .058);
          // the frame in front of the mount, and the same outline a little lower and to the right, darker, as its shadow on the wall
          group.updateMatrixWorld(true);
          // the frame, the mount and the photograph bend with the wall too, so no edge stands off a curved wall
          const R = wall === 'outer' ? OUTER_RADIUS : INNER_RADIUS, sign = wall === 'outer' ? 1 : -1;
          const bend = x => sign * (R - Math.sqrt(R * R - Math.min(x * x, R * R * .98)));
          addFrame(group.matrixWorld, a.mw, a.mh, 0, PY, .068, bend);
          addSides(group.matrixWorld, a.mw, a.mh, PY, bend, a.wallZ, .066);
          shadowFrames.push([group.matrixWorld.clone(), a.mw, a.mh, bend, a.wallZ]);
          put(a.labelGeo, a.labelMat, a.labelX, PY - a.fh / 2 - .1 - LABEL_W * LABEL_CH / 2 / 640, a.wallZ + .02);
          const entry = { printIndex, angle, wall, pw: a.pw, ph: a.ph, mesh: printMesh, mat: a.printMat, thumb: a.thumb, full: null, loading: false };
          // the frame and the mount answer a click as well as the photograph
          for (const m of [printMesh, mountMesh]) { m.userData.entry = entry; this.meshes.push(m); }
          this.entries.push(entry);
          scene.add(group);
        };
        // the camera looks towards smaller angles, so the people go that way: walking forward goes through the fields in order
        for (let s = 0; s < OUTER_COUNT; s++) make(s, -(s + 1) * 2 * Math.PI / OUTER_COUNT, 'outer');
        for (let k = 0; k < INNER_COUNT; k++) make(OUTER_COUNT + k, -(k + .5) * 2 * Math.PI / INNER_COUNT, 'inner');

        // the frames: one mesh per kind of piece; then their shadows, the same outlines a little lower and to the right, black and see-through
        const flush = makeMat => {
          for (const k of Object.keys(pieceTex)) {
            const g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.Float32BufferAttribute(piecePos[k], 3));
            g.setAttribute('uv', new THREE.Float32BufferAttribute(pieceUv[k], 2));
            piecePos[k] = []; pieceUv[k] = [];
            const mat = makeMat(pieceTex[k]);
            this.disposables.push(g, mat);
            scene.add(new THREE.Mesh(g, mat));
          }
        };
        // alpha to coverage gives the cut-out outline soft edges without sorting see-through pieces
        flush(map => new THREE.MeshBasicMaterial({ map, alphaTest: .5, alphaToCoverage: true }));
        // the shadow lies on the wall, only a little below and to the right of the frame, since the frame stands close to the wall
        for (const [m, w, h, bend, wallZ] of shadowFrames) addFrame(m, w, h, .012, PY - .022, wallZ + .009, bend);
        flush(map => new THREE.MeshBasicMaterial({ map, color: 0x000000, transparent: true, opacity: .16, depthWrite: false }));
        const sideGeo = new THREE.BufferGeometry();
        sideGeo.setAttribute('position', new THREE.Float32BufferAttribute(sidePos, 3));
        sideGeo.setAttribute('color', new THREE.Float32BufferAttribute(sideCol, 3));
        const sideMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
        this.disposables.push(sideGeo, sideMat);
        scene.add(new THREE.Mesh(sideGeo, sideMat));
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
        setFocused(true, entry.printIndex);
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
        // in focus the arrows go from portrait to portrait, in the order of the fields
        if (this.focusedEntry) { const k = ORDER.indexOf(this.focusedEntry.printIndex); this.focusPrint(ORDER[(k + dir + ORDER.length) % ORDER.length]); return; }
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
        // on a small screen the plate under the portrait has the button, so the pill is only for the mouse
        if (this.overlay || !this.focusedEntry || this.small) { pill.classList.remove('visible'); return; }
        if (this.hoveringFocused) {
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
          this.hoveringFocused = !!m && !!this.focusedEntry && m.userData.entry === this.focusedEntry;
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

  function setFocused(f, printIndex) {
    focused = f;
    if (f) { plateAt = printIndex; fillPlate(); }
    gui.classList.toggle('focused', f);
    setHints();
  }

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
