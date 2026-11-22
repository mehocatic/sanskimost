// Hodnik ličnosti: the round corridor of the "Hodnik historije" project (Three.js, vendor/three.module.min.js, the same version r160),
// ported to plain JavaScript. The scene, the walk and the focus glide are the original ones; what hangs in it are the people of Sanski Most:
//   - licnosti-data.js and i18n give the names, roles, biographies and sources, photos/licnosti/ the portraits,
//   - the people go in the order of the fields, taking turns between the outer and the inner wall,
//   - a click on the focused portrait opens the biography in a dialog (previous / next go through the list order),
//   - the Gallery / List switch shows everyone as a grid, grouped by field.
(() => {
  const $ = id => document.getElementById(id);
  const t = (k, v) => I18n.t(k, v);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // everyone in the order of the fields, then the order of the data file; the walls take turns, so both walls go through the fields together
  const CATS = window.LICNOSTI_CATS || [], SIZES = window.LICNOSTI_PHOTOS || {};
  const ALL = CATS.flatMap(c => (window.LICNOSTI || []).filter(p => p.cat === c.id));
  const outerP = ALL.filter((p, i) => i % 2 === 0), innerP = ALL.filter((p, i) => i % 2 === 1);
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

  const mqSmall = matchMedia('(max-width: 819px), (orientation: portrait) and (max-width: 1100px), (orientation: landscape) and (max-height: 500px)');
  const mqMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const gui = $('gui'), host = $('host'), list = $('list'), lb = $('lb');
  let stage = null, view = 'gallery', focused = false, opened = -1, noGL = false;

  /* ---------- text that changes with the state ---------- */
  function setHints() {
    const k = focused ? 'focus' : 'walk';
    $('hint1').textContent = t(`hod.hint.${k}1`);
    $('hint2').textContent = t(`hod.hint.${k}2`);
  }

  /* ---------- the list: everyone by field ---------- */
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

  /* ---------- gallery or list ---------- */
  function setView(v) {
    view = v;
    const isList = v === 'list';
    list.classList.toggle('open', isList);
    list.setAttribute('aria-hidden', String(!isList));
    gui.classList.toggle('hidden', isList);
    $('t-gallery').classList.toggle('active', !isList);
    $('t-gallery').setAttribute('aria-selected', String(!isList));
    $('t-list').classList.toggle('active', isList);
    $('t-list').setAttribute('aria-selected', String(isList));
    if (stage) stage.overlay = isList || lb.open;
    if (!isList && stage && focused) stage.stepBack();
    if (isList) list.scrollTop = 0;
  }
  $('t-gallery').addEventListener('click', () => setView('gallery'));
  $('l-gallery').addEventListener('click', () => { if (!noGL) setView('gallery'); });
  $('t-list').addEventListener('click', () => setView('list'));
  $('enter').addEventListener('click', () => setView('list'));
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
  function openPhoto(i) {
    opened = i;
    fillDialog();
    if (!lb.open) lb.showModal();
    lb.scrollTop = 0; $('lb-txt').scrollTop = 0;
    if (stage) stage.overlay = true;
    setHash('#' + PRINTS[i].p.id);
  }
  // previous / next in the order of the list (by field)
  const ORDER = CATS.flatMap(c => PRINTS.filter(it => it.p.cat === c.id).map(it => it.index));
  const stepPerson = d => { const k = ORDER.indexOf(opened); if (k >= 0) openPhoto(ORDER[(k + d + ORDER.length) % ORDER.length]); };
  $('lb-prev').addEventListener('click', () => stepPerson(-1));
  $('lb-next').addEventListener('click', () => stepPerson(1));
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') stepPerson(-1);
    if (e.key === 'ArrowRight') stepPerson(1);
  });
  lb.addEventListener('close', () => {
    opened = -1; setHash('');
    if (stage) stage.overlay = view === 'list';
  });
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  $('lb-x').addEventListener('click', () => lb.close());

  addEventListener('langchange', () => {
    setHints(); fillDialog(); buildList();
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
      walkOffset() { return this.portraitSmall() ? .14 + .9 * STEP : .14; }
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
        scene.background = new THREE.Color('#FFF9EC');
        scene.fog = new THREE.Fog('#FFF9EC', 10, 46);
        this.scene = scene;
        this.camera = new THREE.PerspectiveCamera(w >= h ? 56 : 70, w / h, .05, 100);
        scene.add(new THREE.HemisphereLight(0xfffdf6, 0xe9cfa6, 1.55));
        scene.add(new THREE.AmbientLight(0xfff6e6, .55));
        this.buildCorridor(scene);

        const maxAniso = Math.min(renderer.capabilities.getMaxAnisotropy(), this.small ? 4 : 8);
        this.maxAniso = maxAniso;
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
          document.fonts.load('500 56px "Cormorant Garamond"', 'čćšžđ'), document.fonts.load('italic 400 38px "Cormorant Garamond"', 'čćšžđ'), document.fonts.load('500 24px Inter', 'čćšžđ'),
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
        x.font = '500 190px "Cormorant Garamond", Georgia, serif';
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
          ctx.font = '500 56px "Cormorant Garamond", Georgia, serif';
          ctx.fillText(p.name, 30, 66, 580);
          // the role on two lines at most (the whole text is in the dialog)
          ctx.font = 'italic 400 38px "Cormorant Garamond", Georgia, serif';
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
    noGL = true;
    $('l-gallery').hidden = true;
    stage = null;
    setView('list');
  }

  /* ---------- go ---------- */
  buildList();
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
