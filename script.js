const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scene = document.getElementById('scene');
const title = document.getElementById('title');
const stage = document.getElementById('stage');
const fade = document.getElementById('fade');
const hint = document.getElementById('scroll-hint');
const heroEnd = document.getElementById('hero-end');
const caption = document.getElementById('hero-caption');
const loader = document.getElementById('loader');
const loaderText = document.getElementById('loader-text');

// Phones and touch devices get the smaller frames-m/ set (960x1080 portrait crop, fewer frames):
// hundreds of full HD frames in memory are enough to crash a phone browser.
const MOBILE = window.matchMedia('(pointer: coarse), (max-width: 768px)').matches;
const FRAME_COUNT = parseInt(MOBILE ? canvas.dataset.framesM : canvas.dataset.frames, 10);
const PATH = MOBILE ? canvas.dataset.pathM : canvas.dataset.path;
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EXT = canvas.dataset.ext;
canvas.dataset.set = MOBILE ? 'mobile' : 'desktop';

const frames = new Array(FRAME_COUNT);    // Image per frame, filled as they arrive
const ready = new Uint8Array(FRAME_COUNT); // 1 once the frame has loaded

function load(i) {
  return new Promise(resolve => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => { ready[i] = 1; resolve(); };
    img.onerror = resolve; // a missing frame should not block the page; its neighbours are drawn instead
    img.src = `${PATH}${String(i + 1).padStart(4, '0')}.${EXT}`;
    frames[i] = img;
  });
}

// Progressive loading. First pass: every 4th frame (and the last one); the page starts when it is in.
// Then the rest arrive in the background, the in-between frames first (2, 6, 10 ...), then the odd ones,
// so the motion gets smoother step by step. Until a frame is in, its nearest loaded neighbour is drawn.
function firstPass() {
  const idx = [];
  for (let i = 0; i < FRAME_COUNT; i += 4) idx.push(i);
  if (idx[idx.length - 1] !== FRAME_COUNT - 1) idx.push(FRAME_COUNT - 1);
  let done = 0;
  return Promise.all(idx.map(i => load(i).then(() => {
    loaderText.textContent = Math.round((++done / idx.length) * 100) + '%';
  })));
}

function backgroundPass() {
  const queue = [];
  for (let i = 2; i < FRAME_COUNT; i += 4) queue.push(i);
  for (let i = 1; i < FRAME_COUNT; i += 2) if (!frames[i]) queue.push(i);
  // a few requests at a time so the order above holds and the rest of the page is not starved
  let running = 0;
  const next = () => {
    if (!queue.length) { if (!running) canvas.dataset.loaded = 'all'; return; }
    running++;
    load(queue.shift()).then(() => { running--; scheduleFrame(); next(); });
  };
  for (let k = 0; k < 4; k++) next();
}

// nearest loaded frame to i (looks at i, then i-1, i+1, i-2 ...)
function nearest(i) {
  for (let d = 0; d < FRAME_COUNT; d++) {
    if (i - d >= 0 && ready[i - d]) return i - d;
    if (i + d < FRAME_COUNT && ready[i + d]) return i + d;
  }
  return -1;
}

let lastW = 0, lastH = 0;
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // The stage uses the small viewport height so browser toolbars do not resize the scene.
  const w = stage.clientWidth || window.innerWidth, h = stage.clientHeight || window.innerHeight;
  if (w === lastW && h === lastH) return;
  lastW = w; lastH = h;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  lastDrawn = -1;
}

// "cover" fit: fill the screen without stretching the video
function draw(i) {
  const img = frames[i];
  if (!img || !ready[i]) return;
  const r = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
  const w = img.naturalWidth * r, h = img.naturalHeight * r;
  ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
}

function scrollProgress() {
  const rect = scene.getBoundingClientRect();
  const scrollable = scene.offsetHeight - stage.offsetHeight;
  return scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
}

const clamp01 = v => Math.min(1, Math.max(0, v));

let target = 0;   // where the scroll wants us to be
let current = 0;  // where we actually are (eased)
let lastDrawn = -1;
let animationFrame = 0;

// Easing toward the target makes mouse-wheel "steps" feel like continuous camera motion
function tick() {
  animationFrame = 0;
  target = scrollProgress();
  current += (target - current) * (REDUCED ? 1 : 0.12);
  if (Math.abs(target - current) < 0.0001) current = target;

  // Between two frames the lower one is drawn and the next one is laid over it with alpha = the fraction,
  // so the picture moves continuously instead of in steps (the alpha is rounded to 1/16 to avoid pointless redraws)
  const pos = Math.min(FRAME_COUNT - 1, current * (FRAME_COUNT - 1));
  const lo = Math.floor(pos);
  const a = REDUCED ? 0 : Math.round((pos - lo) * 16) / 16;
  const i0 = nearest(lo);
  const i1 = a ? nearest(Math.min(FRAME_COUNT - 1, lo + 1)) : i0;
  const key = i0 + '|' + i1 + '|' + a;
  if (key !== lastDrawn && i0 >= 0) {
    draw(i0);
    if (a && i1 !== i0) { ctx.globalAlpha = a; draw(i1); ctx.globalAlpha = 1; }
    lastDrawn = key;
  }

  // Title fades and drifts out over the first ~25% of the scroll
  const t = clamp01(current / 0.25);
  title.style.opacity = 1 - t;
  title.style.transform = `translateY(${-t * 40}px) scale(${1 + t * 0.04})`;
  hint.style.opacity = 0.8 * (1 - clamp01(current / 0.06));

  // Second half of the scroll: the lower part of the frame darkens and the closing lines are written in, letter by letter,
  // first the large line, then the small one. The letters follow the scroll (back up, they go again), and once written
  // the lines stay for the rest of the hero. The caption in the corner leaves first so the two do not overlap.
  const e = clamp01((current - 0.48) / 0.12);
  fade.style.opacity = e;
  // once the hero starts to leave the screen the lines go, so they never slide under the menu
  const rect = scene.getBoundingClientRect();
  const leave = clamp01((window.innerHeight - rect.bottom) / (window.innerHeight * 0.4));
  heroEnd.style.opacity = (current > 0.46 ? 1 : 0) * (1 - leave);
  eyebrow.style.opacity = clamp01((current - 0.5) / 0.06);
  write(bigChars, current, 0.52, 0.72, 0.06);
  write(subChars, current, 0.66, 0.86, 0.035);
  caption.style.opacity = 1 - clamp01((current - 0.4) / 0.08);

  if (current !== target) animationFrame = requestAnimationFrame(tick);
}

function scheduleFrame() {
  if (!animationFrame) animationFrame = requestAnimationFrame(tick);
}
window.addEventListener('scroll', scheduleFrame, { passive: true });
window.addEventListener('resize', () => { resize(); scheduleFrame(); });

// The closing lines, cut into letters (inside words, so a line never breaks in the middle of a word).
// Screen readers get the whole text from a hidden copy; the letters are only for the eye.
const eyebrow = heroEnd.querySelector('.hero-end-eyebrow');
let bigChars = [], subChars = [];
function splitLetters(el) {
  const src = el.cloneNode(true);
  const out = document.createElement('span');
  out.setAttribute('aria-hidden', 'true');
  const chars = [];
  const walk = (from, to) => from.childNodes.forEach(n => {
    if (n.nodeType === 3) {
      n.textContent.split(/([ \t\n]+)/).forEach(part => {
        if (!part) return;
        if (/^[ \t\n]+$/.test(part)) { to.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'hw';
        for (const ch of part) {
          const c = document.createElement('span');
          c.className = 'hc';
          c.textContent = ch;
          c._v = -1; // last value written, so unchanged letters are not touched every frame
          w.appendChild(c);
          chars.push(c);
        }
        to.appendChild(w);
      });
    } else if (n.nodeName === 'BR') {
      to.appendChild(document.createElement('br'));
    } else {
      const copy = n.cloneNode(false);
      to.appendChild(copy);
      walk(n, copy);
    }
  });
  walk(src, out);
  const hidden = document.createElement('span');
  hidden.className = 'vh';
  hidden.textContent = src.textContent;
  el.replaceChildren(hidden, out);
  return chars;
}
function splitHero() {
  bigChars = splitLetters(document.getElementById('intro-text'));
  subChars = splitLetters(document.getElementById('intro-sub'));
}
// letter i of n appears between `from` and `to`, each over `dur` of the scroll
function write(chars, p, from, to, dur) {
  const n = chars.length;
  for (let i = 0; i < n; i++) {
    const start = from + (to - from - dur) * (n > 1 ? i / (n - 1) : 0);
    let v = REDUCED ? (p >= from ? 1 : 0) : clamp01((p - start) / dur);
    v = Math.round(v * 100) / 100;
    const c = chars[i];
    if (v === c._v) continue;
    c._v = v;
    c.style.opacity = v;
    c.style.transform = v === 1 ? '' : `translateY(${(1 - v) * 0.45}em)`;
    c.style.filter = v === 1 || v === 0 ? '' : `blur(${(1 - v) * 6}px)`;
  }
}
splitHero();
// a new language puts the plain text back (i18n.js), so it is cut again
addEventListener('langchange', splitHero);

firstPass().then(() => {
  resize();
  draw(nearest(0));
  loader.classList.add('done');
  canvas.dataset.loaded = 'first';
  scheduleFrame();
  backgroundPass();
});
