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

  function frame(now) {
    raf = 0;
    const dt = Math.min(.05, Math.max(.001, (now - last) / 1000));
    last = now;
    const r = shelf.getBoundingClientRect();
    const ccx = r.left + r.width / 2, ccy = r.top + r.height / 2;
    const rm = reduced();
    let busy = false;

    // the spring
    const diff = T - s;
    if (Math.abs(diff) < 1e-4 || rm) s = T;
    else { s += diff * (1 - Math.exp(-(dragging ? 18 : 5.2) * dt)); busy = true; }
    // far from the start after many turns: shift back by whole copies, the picture stays the same
    if (Math.abs(s - START) > N * 4) {
      const shift = Math.round((s - START) / TOTAL) * TOTAL;
      if (shift) { s -= shift; T -= shift; dragT -= shift; }
    }
    const na = mod(Math.round(s));
    if (na !== active) setActive(na, Math.sign(T - s) || lastDir || 1);

    // the cover in the middle follows the mouse a little
    const open = dlg.open;
    const onCover = hasPtr && !open && Math.abs(T - s) < .3 && Math.abs(mx - ccx) < .55 * d && Math.abs(my - ccy) < .55 * H;
    const tY = onCover ? (mx - ccx) / (.55 * d) * 9 : hasPtr ? (mx - ccx) / Math.max(1, r.width) * 5 : 0;
    const tX = onCover ? -(my - ccy) / (H / 2) * 6 : 0;
    const ta = rm ? 1 : 1 - Math.exp(-7 * dt);
    tiltY += (tY - tiltY) * ta; tiltX += (tX - tiltX) * ta;
    if (Math.abs(tY - tiltY) > .02 || Math.abs(tX - tiltX) > .02) busy = true;

    const la = rm ? 1 : 1 - Math.exp(-12 * dt);
    const cull = r.width / 2 + 1.5 * d;
    for (let v = 0; v < TOTAL; v++) {
      const el = tapes[v], q = rel(v, s);
      // the tape in the middle turns by 90 degrees; B spreads its neighbours apart so the cover has room
      const B = Math.abs(q) < 1 ? (q + Math.sin(Math.PI * q) / Math.PI) / 2 : q > 0 ? .5 : -.5;
      const x = q * (ws + gap) + (d - ws + 1.6 * gap) * B;
      if (Math.abs(x) > cull) { el.style.visibility = 'hidden'; continue; }
      el.style.visibility = 'visible';
      const o = smooth(1 - Math.abs(q));
      const tl = hover === v && Math.abs(q) > .5 && !open ? 1 : 0;
      lift[v] += (tl - lift[v]) * la;
      if (Math.abs(tl - lift[v]) > .004) busy = true;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${(-o * .025 * H - lift[v] * .045 * H).toFixed(2)}px, ${(o * .2 * H).toFixed(2)}px) ` +
        `rotateZ(${(-4.5 * o).toFixed(3)}deg) rotateX(${(tiltX * o).toFixed(3)}deg) rotateY(${(-90 * o + tiltY * o).toFixed(3)}deg)`;
      el.style.zIndex = String(Math.round(100 - Math.abs(q) * 4));
      el.firstElementChild.style.setProperty('--shade', (o * .55).toFixed(3));
      el.lastElementChild.style.setProperty('--shade', ((1 - o) * .5).toFixed(3));
    }

    // the circle follows the mouse (px, py) and shows over the cover in the middle
    px += (mx - px) * (rm ? 1 : 1 - Math.exp(-16 * dt)); py += (my - py) * (rm ? 1 : 1 - Math.exp(-16 * dt));
    if (Math.abs(mx - px) > .5 || Math.abs(my - py) > .5) busy = true;
    cursor.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
    cursor.classList.toggle('on', onCover);
    shelf.classList.toggle('is-cover', onCover);

    // the play button (touch and keyboard) sits on the cover in the middle and grows as the cover arrives
    const k = open ? 0 : smooth(1 - Math.abs(T - s) * 3);
    ring.style.left = (r.width / 2).toFixed(1) + 'px';
    ring.style.top = (r.height / 2 + .27 * H).toFixed(1) + 'px';
    ring.style.transform = `scale(${k.toFixed(3)})`;
    ring.style.pointerEvents = k > .5 ? 'auto' : 'none';
    ring.tabIndex = k > .5 ? 0 : -1;

    if (busy) raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  /* ---------- caption ---------- */
  const caps = [$('cap-title'), $('cap-sub'), $('cap-year')];
  function swap(box, text, dir) {
    if (reduced()) { box.innerHTML = ''; const sp = document.createElement('span'); sp.className = 'cap-span'; sp.textContent = text; box.appendChild(sp); return; }
    const sign = dir >= 0 ? 1 : -1;
    Array.from(box.children).forEach(old => {
      old.style.cssText += ';position:absolute;left:0;right:0;top:0';
      if (old.dataset.leaving) return;
      old.dataset.leaving = '1';
      old.setAttribute('aria-hidden', 'true'); // only the new text is read out
      const from = getComputedStyle(old).transform;
      old.animate([{ transform: from && from !== 'none' ? from : 'translateY(0%)' }, { transform: `translateY(${-sign * 105}%)` }], { duration: 600, easing: EASE, fill: 'both' }).onfinish = () => old.remove();
    });
    const sp = document.createElement('span');
    sp.className = 'cap-span'; sp.textContent = text;
    box.appendChild(sp);
    sp.animate([{ transform: `translateY(${sign * 105}%)` }, { transform: 'translateY(0%)' }], { duration: 600, easing: EASE, fill: 'both' });
  }
  function setCaption(i, dir, instant) {
    capTexts(F[i]).forEach((text, k) => { if (instant) { caps[k].innerHTML = ''; const sp = document.createElement('span'); sp.className = 'cap-span'; sp.textContent = text; caps[k].appendChild(sp); } else swap(caps[k], text, dir); });
  }
  function setActive(i, dir) {
    active = i;
    setCaption(i, dir);
    tabs.querySelectorAll('button').forEach(b => { if (b.dataset.cat === F[i].cat) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
  }

