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
    load(queue.shift()).then(() => { running--; next(); });
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
  // the stage is 100lvh, so its height does not change when the phone toolbar shows or hides
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
  return Math.min(1, Math.max(0, -rect.top / scrollable));
}

const clamp01 = v => Math.min(1, Math.max(0, v));

let target = 0;   // where the scroll wants us to be
let current = 0;  // where we actually are (eased)
let lastDrawn = -1;

// Easing toward the target makes mouse-wheel "steps" feel like continuous camera motion
function tick() {
  target = scrollProgress();
  current += (target - current) * (REDUCED ? 1 : 0.12);
  if (Math.abs(target - current) < 0.0001) current = target;

  const index = nearest(Math.min(FRAME_COUNT - 1, Math.round(current * (FRAME_COUNT - 1))));
  if (index !== lastDrawn && index >= 0) { draw(index); lastDrawn = index; }

  // Title fades and drifts out over the first ~25% of the scroll
  const t = clamp01(current / 0.25);
  title.style.opacity = 1 - t;
  title.style.transform = `translateY(${-t * 40}px) scale(${1 + t * 0.04})`;
  hint.style.opacity = 0.8 * (1 - clamp01(current / 0.06));

  // Last part of the scroll: the lower half of the frame darkens and the closing lines rise in over it.
  // They stay until the page scrolls on; the caption in the corner leaves so the two do not overlap.
  const e = clamp01((current - 0.76) / 0.12);
  fade.style.opacity = e;
  // once the hero starts to leave the screen the lines go, so they never slide under the menu
  const rect = scene.getBoundingClientRect();
  const leave = clamp01((window.innerHeight - rect.bottom) / (window.innerHeight * 0.4));
  heroEnd.style.opacity = e * (1 - leave);
  heroEnd.style.transform = `translateY(${(1 - e) * 28}px)`;
  caption.style.opacity = 1 - clamp01((current - 0.68) / 0.08);

  requestAnimationFrame(tick);
}

window.addEventListener('resize', resize);

firstPass().then(() => {
  resize();
  draw(nearest(0));
  loader.classList.add('done');
  canvas.dataset.loaded = 'first';
  requestAnimationFrame(tick);
  backgroundPass();
});
