// Desktop-only effects on the place cards:
//  - a "View" cursor circle over the cards
//  - a water-ripple distortion of the hovered photo (WebGL, OGL, loaded only on the first hover)
// Touch devices, small screens, reduced motion and browsers without WebGL keep the plain CSS zoom.
(() => {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 769px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || reduce.matches) return;

  const track = document.getElementById('track');
  if (!track) return;

  const mouse = { x: -1, y: -1 };
  window.addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  /* ---------- "View" cursor ---------- */
  const cursor = document.createElement('div');
  cursor.className = 'view-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span></span>';
  const cursorText = () => { cursor.firstChild.textContent = I18n.t('cursor.view'); };
  cursorText();
  window.addEventListener('langchange', cursorText);
  document.body.appendChild(cursor);
  const move = window.gsap
    ? { x: gsap.quickTo(cursor, 'x', { duration: .35, ease: 'power3' }), y: gsap.quickTo(cursor, 'y', { duration: .35, ease: 'power3' }) }
    : { x: v => { cursor.style.setProperty('--x', v + 'px'); }, y: v => { cursor.style.setProperty('--y', v + 'px'); } };
  window.addEventListener('pointermove', e => { move.x(e.clientX); move.y(e.clientY); }, { passive: true });

  /* ---------- WebGL ripple ---------- */
  let gl3 = null;          // { renderer, program, mesh, canvas, textures }
  let gl3Failed = false;
  let loading = null;
  let active = null;       // { card, media, img, texture }
  let strength = 0, target = 0, raf = 0, t0 = performance.now();
  const mpos = { x: .5, y: .5 };

  async function initGL() {
    if (gl3 || gl3Failed) return gl3;
    if (loading) return loading;
    loading = (async () => {
      try {
        // check support first so a missing WebGL never reaches the console
        if (!document.createElement('canvas').getContext('webgl')) throw new Error('no webgl');
        const { Renderer, Program, Mesh, Triangle, Texture } = await import('https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm');
        const canvas = document.createElement('canvas');
        canvas.className = 'gl';
        const renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio || 1, 1.5), alpha: false, antialias: false });
        const gl = renderer.gl;
        if (!gl) throw new Error('no webgl');
        const program = new Program(gl, {
          vertex: `attribute vec2 uv; attribute vec2 position; varying vec2 vUv;
            void main() { vUv = uv; gl_Position = vec4(position, 0., 1.); }`,
          fragment: `precision highp float;
            uniform sampler2D tMap; uniform vec2 uRes; uniform vec2 uImg; uniform vec2 uMouse;
            uniform float uTime; uniform float uStrength; varying vec2 vUv;
            void main() {
              // "cover" fit of the photo inside the card
              vec2 r = vec2(min((uRes.x / uRes.y) / (uImg.x / uImg.y), 1.), min((uRes.y / uRes.x) / (uImg.y / uImg.x), 1.));
              vec2 p = (vUv - uMouse) * vec2(uRes.x / uRes.y, 1.);
              float d = length(p);
              float wave = sin(d * 30. - uTime * 3.4);
              float fall = exp(-d * 3.0) * uStrength;
              vec2 off = normalize(p + 1e-4) * wave * fall * 0.02;
              vec2 uv = (vUv + off - .5) * r + .5;
              gl_FragColor = texture2D(tMap, uv);
            }`,
          uniforms: {
            tMap: { value: null }, uRes: { value: [1, 1] }, uImg: { value: [1, 1] },
            uMouse: { value: [.5, .5] }, uTime: { value: 0 }, uStrength: { value: 0 }
          }
        });
        const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
        gl3 = { renderer, program, mesh, canvas, textures: new Map(), Texture, gl };
        return gl3;
      } catch (e) {
        gl3Failed = true;
        return null;
      }
    })();
    return loading;
  }

  function textureFor(img) {
    let tx = gl3.textures.get(img);
    if (!tx) {
      tx = new gl3.Texture(gl3.gl, { generateMipmaps: false, minFilter: gl3.gl.LINEAR, magFilter: gl3.gl.LINEAR });
      tx.image = img;
      gl3.textures.set(img, tx);
    }
    return tx;
  }

  function fit() {
    if (!active) return;
    const r = active.media.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (gl3.canvas.__w !== w || gl3.canvas.__h !== h) {
      gl3.renderer.setSize(w, h);
      gl3.canvas.__w = w; gl3.canvas.__h = h;
    }
    gl3.program.uniforms.uRes.value = [w, h];
    // pointer position inside the card, flipped to GL coordinates
    const tx = (mouse.x - r.left) / r.width, ty = 1 - (mouse.y - r.top) / r.height;
    mpos.x += (Math.min(1, Math.max(0, tx)) - mpos.x) * .18;
    mpos.y += (Math.min(1, Math.max(0, ty)) - mpos.y) * .18;
    gl3.program.uniforms.uMouse.value = [mpos.x, mpos.y];
  }

  function frame() {
    raf = 0;
    if (!active || !gl3) return;
    strength += (target - strength) * .12;
    if (target === 0 && strength < .01) { detach(); return; }
    fit();
    gl3.program.uniforms.uStrength.value = strength;
    gl3.program.uniforms.uTime.value = (performance.now() - t0) / 1000;
    gl3.renderer.render({ scene: gl3.mesh });
    raf = requestAnimationFrame(frame);
  }

  function detach() {
    if (gl3 && gl3.canvas.parentNode) gl3.canvas.remove();
    active = null; strength = 0;
  }

  async function attach(card) {
    const img = card.querySelector('.media img');
    if (!img || !img.complete || !img.naturalWidth) return; // placeholder or not loaded: keep the CSS zoom
    const g = await initGL();
    if (!g) return;
    // the pointer may have left while the library was loading
    if (!card.matches(':hover') && !card.matches(':focus-visible')) return;
    if (active && active.card !== card) detach();
    const media = card.querySelector('.media');
    active = { card, media, img };
    const tx = textureFor(img);
    g.program.uniforms.tMap.value = tx;
    g.program.uniforms.uImg.value = [img.naturalWidth, img.naturalHeight];
    media.appendChild(g.canvas);
    g.canvas.__w = 0;
    target = 1;
    if (!raf) raf = requestAnimationFrame(frame);
  }

  track.addEventListener('pointerover', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    cursor.classList.add('on');
    card.classList.add('no-cursor');
    attach(card);
  });
  track.addEventListener('pointerout', e => {
    const card = e.target.closest('.card');
    if (!card || card.contains(e.relatedTarget)) return;
    cursor.classList.remove('on');
    card.classList.remove('no-cursor');
    if (active && active.card === card) { target = 0; if (!raf) raf = requestAnimationFrame(frame); }
  });
  // start loading the library when the pointer first nears the carousel
  track.addEventListener('pointerenter', () => { initGL(); }, { once: true });
})();
