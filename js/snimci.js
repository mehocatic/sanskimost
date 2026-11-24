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

  /* ---------- moving ---------- */
  function go(to, dir) { T = to; if (dir) lastDir = dir; wake(); }
  const step = n => { if (!dlg.open) go(Math.round(T) + n, n >= 0 ? 1 : -1); };
  function jumpTo(i) {
    if (dlg.open) return;
    let df = (i - mod(Math.round(T))) % N;
    if (df > N / 2) df -= N;
    if (df < -N / 2) df += N;
    go(Math.round(T) + df, df ? (df > 0 ? 1 : -1) : 0);
  }
  tabs.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.cat === 'all') return jumpTo(0);
    const same = F.map((f, i) => f.cat === b.dataset.cat ? i : -1).filter(i => i >= 0);
    const at = same.indexOf(mod(Math.round(T)));
    jumpTo(at >= 0 ? same[(at + 1) % same.length] : same[0]);
  });
  $('prev').addEventListener('click', () => step(-1));
  $('next').addEventListener('click', () => step(1));
  ring.addEventListener('click', () => openDetail());

  // drag
  shelf.addEventListener('pointerdown', e => {
    if (dlg.open || (e.pointerType === 'mouse' && e.button !== 0) || e.target.closest('.play-ring')) return;
    down = true; dragging = false; dragX = e.clientX; dragT = T; dragId = e.pointerId;
  });
  addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; if (!hasPtr) { px = mx; py = my; } hasPtr = true; }
    if (down && e.pointerId === dragId) {
      const dx = e.clientX - dragX;
      if (!dragging && Math.abs(dx) > 5) { dragging = true; try { shelf.setPointerCapture(dragId); } catch (err) { /* the drag still works */ } }
      if (dragging) { T = dragT - dx / (ws + gap); lastDir = dx < 0 ? 1 : -1; }
    }
    wake();
  }, { passive: true });
  const release = e => {
    if (!down || e.pointerId !== dragId) return;
    down = false;
    if (dragging) {
      dragging = false; T = Math.round(T); noClickUntil = performance.now() + 80;
      try { shelf.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
    }
    wake();
  };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);

  // hover lifts a tape a little (mouse only)
  stage.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest('.tape');
    const v = el ? +el.dataset.v : -1;
    if (v !== hover) { hover = v; wake(); }
  });
  shelf.addEventListener('pointerleave', () => { hover = -1; wake(); });

  // click: the cover in the middle opens, another tape comes to the middle.
  // The cover is found by its place, not by the element under the mouse: in 3D the spine of a neighbour can lie in front of it.
  shelf.addEventListener('click', e => {
    if (dlg.open || e.target.closest('.play-ring') || performance.now() < noClickUntil) return;
    const r = shelf.getBoundingClientRect();
    if (Math.abs(T - s) < .3 && Math.abs(e.clientX - (r.left + r.width / 2)) < .55 * d && Math.abs(e.clientY - (r.top + r.height / 2)) < .55 * H) return openDetail();
    const el = e.target.closest('.tape');
    if (!el) return;
    const q = rel(+el.dataset.v, s);
    go(Math.round(s + q), q >= 0 ? 1 : -1);
  });

  // the wheel turns the shelf, in either direction. On a phone or a very short window the page itself can scroll
  // (there is a line of text below the shelf), so there only sideways scrolling is taken.
  addEventListener('wheel', e => {
    if (dlg.open) return;
    const fits = document.documentElement.scrollHeight <= innerHeight + 2;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : fits ? e.deltaY : 0;
    if (!delta) return;
    e.preventDefault();
    lastDir = delta > 0 ? 1 : -1;
    T += delta / (ws + gap) * .5;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => { T = Math.round(T); wake(); }, 160);
    wake();
  }, { passive: false });

  addEventListener('keydown', e => {
    if (dlg.open || e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'Enter' && e.target === shelf) { e.preventDefault(); openDetail(); }
  });

  /* ---------- one recording opened ---------- */
  const lines = Array.from(dlg.querySelectorAll('.d-line'));
  let shown = 0;
  function fill(i) {
    shown = i;
    const f = F[i];
    $('dt-sub').textContent = catLabel(f) + ' / ' + f.src;
    $('dt-title').textContent = f.title;
    $('dt-meta').textContent = `${f.y} / ${kind(f)} / ${f.min} ${t('sn.min')}`;
    $('dt-note').hidden = f.cat !== 'logori';
    $('dt-syn').textContent = desc(f);
    $('dt-src').textContent = t('sn.source') + ': ' + f.src;
    $('dt-watch').href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(f.yt);
    $('dt-poster').innerHTML = `<div class="face cv tone-${f.cat}">${cover(f, i)}</div>`;
  }
  // the cover in the middle, as a clip on the whole dialog: the dialog grows out of it and shrinks back into it
  function coverClip() {
    const c = tapes[((Math.round(s) % TOTAL) + TOTAL) % TOTAL].lastElementChild.getBoundingClientRect();
    return `inset(${Math.max(0, c.top).toFixed(1)}px ${Math.max(0, innerWidth - c.right).toFixed(1)}px ${Math.max(0, innerHeight - c.bottom).toFixed(1)}px ${Math.max(0, c.left).toFixed(1)}px round 3px)`;
  }
  const FULL = 'inset(0px 0px 0px 0px round 0px)';

  function openDetail(instant) {
    if (dlg.open || closing) return;
    T = Math.round(T); s = T;
    const i = mod(T);
    if (i !== active) setActive(i, lastDir);
    fill(i);
    const from = coverClip();
    dlg.getAnimations().forEach(a => a.cancel());
    dlg.showModal();
    dlg.scrollTop = 0;
    try { history.replaceState(null, '', '#snimak=' + F[i].id); } catch (e) { /* the address just is not updated */ }
    wake();
    if (instant || reduced()) return;
    dlg.animate([{ clipPath: from, transform: 'rotate(-4.5deg)' }, { clipPath: FULL, transform: 'rotate(0deg)' }], { duration: 800, easing: 'cubic-bezier(.76,0,.18,1)' });
    lines.forEach((el, k) => el.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0%)' }], { duration: 800, delay: 450 + k * 60, easing: EASE, fill: 'backwards' }));
  }
  function closeDetail() {
    if (!dlg.open || closing) return;
    closing = true;
    const done = () => {
      dlg.close();
      dlg.getAnimations().forEach(a => a.cancel());
      closing = false;
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* as above */ }
      wake();
      if (ring.tabIndex === 0) ring.focus({ preventScroll: true }); else shelf.focus({ preventScroll: true });
    };
    if (reduced()) return done();
    dlg.animate([{ clipPath: FULL, transform: 'rotate(0deg)' }, { clipPath: coverClip(), transform: 'rotate(-4.5deg)' }], { duration: 650, easing: 'cubic-bezier(.76,0,.18,1)', fill: 'forwards' }).onfinish = done;
  }
  $('dt-x').addEventListener('click', closeDetail);
  dlg.addEventListener('cancel', e => { e.preventDefault(); closeDetail(); });

  /* ---------- language, size, first picture ---------- */
  function texts() {
    $('count').textContent = t('sn.count', { n: N });
    setCaption(active, 0, true);
    stage.querySelectorAll('.cv-lbl').forEach(el => { el.textContent = t('sn.cover'); });
    stage.querySelectorAll('.cv-min').forEach((el, v) => { el.textContent = F[v % N].min + ' ' + t('sn.min'); });
    if (dlg.open) fill(shown);
  }
  addEventListener('langchange', () => { texts(); wake(); });
  addEventListener('resize', measure);
  mqReduce.addEventListener('change', wake);

  active = 0;
  tabs.querySelector('[data-cat="' + F[0].cat + '"]').setAttribute('aria-current', 'true');
  texts();
  measure();
  document.fonts && document.fonts.ready.then(() => { measure(); });

  // a shared address: #snimak=<id>
  const m = /^#snimak=([\w-]+)/.exec(location.hash);
  const at = m ? F.findIndex(f => f.id === m[1]) : -1;
  if (at >= 0) {
    s = T = START + at; active = at;
    setActive(at, 0); setCaption(at, 0, true);
    requestAnimationFrame(() => { frame(performance.now()); openDetail(true); });
  }
})();
