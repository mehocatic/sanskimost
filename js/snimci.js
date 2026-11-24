// Video archive page: a shelf of tapes, one for every recording of snimci-data.js.
//  - the shelf loops (three copies of the list); drag it, use the arrow keys or the arrows under it. The tape in the middle turns its cover to the front.
//  - the themes jump to the next recording of that theme; they do not hide the others
//  - one recording opens in a dialog; its address is kept in the hash (#snimak=<id>), so it can be shared
//  - nothing is loaded from other sites: the watch button is a plain link to YouTube
(() => {
  const D = window.SNIMCI;
  if (!D) return;
  const F = D.films, N = F.length, COPIES = 3, TOTAL = N * COPIES, START = N; // START: the same list, middle copy
  const $ = id => document.getElementById(id);
  const t = (k, v) => I18n.t(k, v);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => mqReduce.matches;
  const mod = n => ((n % N) + N) % N;
  const num = i => String(i + 1).padStart(2, '0');
  // position of tape v relative to the scroll position s, in -TOTAL/2 .. TOTAL/2
  const rel = (v, s) => ((((v - s) % TOTAL) + TOTAL + TOTAL / 2) % TOTAL) - TOTAL / 2;
  const smooth = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const EASE = 'cubic-bezier(.2,.8,.2,1)';

  const cursor = $('cursor');
  const shelf = $('shelf'), stage = $('stage'), probe = $('probe'), ring = $('play'), tabs = $('tabs');
  const dlg = $('dt');

  /* ---------- text of one recording, in the current language ---------- */
  const catLabel = f => t('sn.cat.' + f.cat);
  const kind = f => t('sn.g.' + f.id);
  const desc = f => t('sn.s.' + f.id);
  const capTexts = f => [f.title, catLabel(f) + ' / ' + f.src, f.y + ' · ' + kind(f)];

  /* ---------- the tapes ---------- */
  function cover(f, i) {
    return `<div class="cv-top"><span class="cv-lbl">${esc(t('sn.cover'))}</span><span>#${num(i)}</span></div>` +
      `<div class="cv-title">${esc(f.title)}</div>` +
      `<div class="cv-frame"><b class="cv-year">${f.y}</b></div>` +
      `<div class="cv-foot"><span class="cv-src">${esc(f.src)}</span><span class="cv-min">${f.min} ${esc(t('sn.min'))}</span></div>`;
  }
  stage.innerHTML = Array.from({ length: TOTAL }, (_, v) => {
    const i = v % N, f = F[i];
    return `<div class="tape" data-v="${v}" aria-hidden="true">` +
      `<div class="face sp tone-${f.cat}"><i class="sp-band"></i><span class="sp-num">${num(i)}</span><span class="sp-title">${esc(f.title)}</span>` +
      `<div class="sp-foot"><span class="sp-year">${f.y}</span><span class="sp-min">${f.min}′</span></div></div>` +
      `<div class="face cv tone-${f.cat}">${cover(f, i)}</div></div>`;
  }).join('');
  const tapes = Array.from(stage.children);

  /* ---------- motion state ---------- */
  let s = START, T = START;          // s: where the shelf is, T: where it is going (a tape number, a tape per step)
  let active = 0, lastDir = 1;       // the recording in the middle
  let hover = -1;
  let mx = 0, my = 0, px = 0, py = 0, hasPtr = false, tiltX = 0, tiltY = 0;
  let H = 320, ws = 54, d = 168, gap = 9.6; // tape height, spine width, cover width, space between tapes
  let down = false, dragging = false, dragX = 0, dragT = START, dragId = -1, noClickUntil = 0;
  let snapTimer = 0, raf = 0, last = 0, closing = false;
  const lift = new Float64Array(TOTAL);

  function measure() {
    H = probe.getBoundingClientRect().height || Math.min(innerHeight * .46, innerWidth * .31);
    ws = H * 142 / 840; d = H * 474 / 900; gap = H * .05;
    stage.style.setProperty('--ws', ws.toFixed(2) + 'px');
    stage.style.setProperty('--d', d.toFixed(2) + 'px');
    wake();
  }

