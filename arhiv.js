// Archive page: the photographs of arhiv-data.js, shown through time and on the map.
//  - through time: on wide screens the page scrolls down while the strip moves sideways along the river; on phones it is a plain column
//  - on the map: one pin per place, a year dial that brings the photographs in as the years pass
//  - one photograph opens in a dialog; its address is kept in the hash (#foto=<file>), so it can be shared
(() => {
  const A = window.ARCHIVE;
  const $ = id => document.getElementById(id);
  const t = (k, v) => I18n.t(k, v);
  const wide = window.matchMedia('(min-width: 900px) and (min-height: 560px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Y0 = 1900, Y1 = 2014, TICKS = [1900, 1920, 1940, 1960, 1980, 2000, 2014];
  const CATS = ['ulice', 'sana', 'ljudi', 'poplave', 'dokumenti'];
  const pct = y => (Math.min(Y1, Math.max(Y0, y)) - Y0) / (Y1 - Y0) * 100;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const full = p => `photos/arhiv/${p.f}.webp`;
  const thumb = p => `photos/arhiv/t/${p.f}.webp`;
  const yearOf = p => p.yl ? t(p.yl) : (p.y ? String(p.y) : t('arh.undated'));
  const capOf = p => t(p.cap);
  const srcOf = p => !p.src ? '' : (p.src.startsWith('hist.') ? t(p.src) : p.src);
  const placeOf = id => A.places.find(x => x.id === id);
  const placeName = pl => pl.name[I18n.lang] || pl.name.bs;

  let cat = 'all';
  let list = A.photos; // the photographs of the chosen theme, in time order
  let view = 'time';

  document.querySelectorAll('.ticks').forEach(el => { el.innerHTML = TICKS.map(y => `<span style="left:${pct(y)}%">${y}</span>`).join(''); });

  /* ---------- themes ---------- */
  const chips = $('chips');
  function buildChips() {
    chips.innerHTML = ['all', ...CATS].map(c => `<button type="button" data-cat="${c}" aria-pressed="${c === cat}">${esc(t('arh.cat.' + c))}</button>`).join('');
  }
  chips.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || b.dataset.cat === cat) return;
    setCat(b.dataset.cat);
    scrollTo(0, 0);
  });
  function setCat(c) {
    cat = c;
    list = c === 'all' ? A.photos : A.photos.filter(p => p.cat === c);
    buildChips();
    buildStrip();
  }

  /* ---------- 1. through time ---------- */
  const rail = $('rail'), stage = $('stage'), strip = $('strip'), needle = $('needle');
  let items = [], centres = [], stripW = 0, target = 0, cur = 0, raf = 0;
  const UP = [23, 21, 24, 22], DN = [20, 18.5, 20.5], ROT = [-2.2, 1.6, -1, 2.4, -1.8, .8];

  function buildStrip() {
    let h = '<svg class="river" aria-hidden="true"></svg><div class="lead"><span class="arh-hint">' + esc(t('arh.hint')) + ' →</span></div>', dec = null, undated = false;
    // room for a print above and below the river, in px: the title and the themes stay clear above, the year bar below
    const H = innerHeight, line = .58 * H, capH = H >= 720 ? 62 : 0;
    const upMax = line - 54 - capH - (innerWidth >= 1200 ? 150 : 205), dnMax = H - line - 54 - capH - 108;
    list.forEach((p, i) => {
      if (p.y) {
        const d = Math.floor(p.y / 10) * 10;
        if (d !== dec) { dec = d; h += `<div class="dec" aria-hidden="true"><b>${d}</b></div>`; }
      } else if (!undated) {
        undated = true;
        h += `<div class="dec und"><b>${esc(t('arh.undated'))}</b></div>`;
      }
      const up = i % 2 === 0, ar = p.w / p.h;
      // very wide photographs get less height, so no print is wider than about half a screen
      const k = Math.max(90, Math.min((up ? UP[i % 4] : DN[i % 3]) * H / 100, up ? upMax : dnMax)) * Math.min(1, 1.75 / ar);
      const r = ROT[i % 6];
      h += `<div class="it ${up ? 'up' : 'dn'}" data-i="${i}" style="--h:${k.toFixed(0)}px;--ar:${ar.toFixed(3)};--r:${r}deg;--rm:${(r / 2.4).toFixed(2)}deg">` +
        `<button type="button" class="print" aria-label="${esc(capOf(p))}. ${esc(t('arh.open'))}"><img src="${full(p)}" width="${p.w}" height="${p.h}" alt="" ${i < 4 ? '' : 'loading="lazy"'} decoding="async"></button>` +
        `<span class="cap">${esc(capOf(p))}</span>${p.y ? `<span class="yr">${esc(yearOf(p))}</span>` : ''}</div>`;
    });
    h += `<div class="arh-end"><p>${esc(t('arh.end'))}</p><button type="button" id="end-map">${esc(t('arh.end.map'))}</button><a class="end-game" href="pogodi">${esc(t('kv.cta'))}</a></div>`;
    strip.innerHTML = h;
    items = [...strip.querySelectorAll('.it')];
    $('count').textContent = t('arh.count', { n: list.length });
    buildBars();
    watch();
    layout();
  }

  // prints rise in as they come on screen
  let io = null;
  function watch() {
    if (io) io.disconnect();
    if (reduce || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js-reveal');
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px -4% 0px -4%' });
    items.forEach(el => io.observe(el));
  }

  let barEls = [], barAt = null;
  // bars up to the year in the middle are lit, the ones around it brightest
  function markBars(y) {
    if (y === barAt) return;
    barAt = y;
    barEls.forEach(el => {
      const by = +el.dataset.y;
      el.classList.toggle('past', y != null && by <= y);
      el.classList.toggle('near', y != null && Math.abs(by - y) <= 3);
    });
  }
  function buildBars() {
    let b = '';
    for (let y = Y0; y < Y1; y += 2) {
      const n = list.filter(p => p.y && (p.y === y || p.y === y + 1 || (y === Y1 - 2 && p.y === Y1))).length;
      b += `<i data-y="${y}" style="height:${n ? Math.min(100, 18 + n * 7) : 0}%"></i>`;
    }
    $('bars').innerHTML = b;
    barEls = [...$('bars').children];
    barAt = null;
  }

  function layout() {
    const river = strip.querySelector('.river');
    if (wide.matches) {
      stripW = strip.scrollWidth;
      rail.style.height = `${Math.max(0, stripW - innerWidth) + innerHeight}px`;
      centres = items.map(el => el.offsetLeft + el.offsetWidth / 2);
      let d = 'M0 40';
      for (let x = 0; x < stripW; x += 260) d += ` Q${x + 65} ${(x / 260) % 2 ? 28 : 52} ${x + 130} 40 T${x + 260} 40`;
      river.setAttribute('width', stripW);
      river.setAttribute('height', 80);
      river.innerHTML = `<path d="${d}" fill="none" stroke="#0f6f78" stroke-width="16" stroke-linecap="round" opacity=".5"/><path d="${d}" fill="none" stroke="#7fd6dc" stroke-width="1.4"/>`;
    } else {
      rail.style.height = '';
      strip.style.transform = '';
      centres = items.map(el => el.offsetTop + el.offsetHeight / 2);
    }
    onScroll(true);
  }

  const maxX = () => Math.max(0, stripW - innerWidth);
  function onScroll(jump) {
    if (view !== 'time') return;
    let mid;
    if (wide.matches) {
      target = Math.min(maxX(), Math.max(0, scrollY - rail.offsetTop));
      if (jump === true || reduce) { cur = target; paint(); } else if (!raf) raf = requestAnimationFrame(step);
      mid = target + innerWidth / 2;
      document.body.classList.toggle('sc', target > 60);
    } else {
      mid = scrollY + innerHeight / 2 - (strip.getBoundingClientRect().top + scrollY);
    }
    // the print nearest the middle of the screen sets the needle
    let best = 0, bd = Infinity;
    centres.forEach((c, i) => { const d = Math.abs(c - mid); if (d < bd) { bd = d; best = i; } });
    const p = list[best];
    if (p) {
      needle.style.left = `${p.y ? pct(p.y) : 100}%`;
      $('needle-y').textContent = yearOf(p);
      markBars(p.y || Y1);
      if (wide.matches) setDecade(p.y ? Math.floor(p.y / 10) * 10 : null);
    }
  }

  // the large numeral behind the strip: only the digits that change roll, up when going forward in time, down when going back
  const decNow = $('dec-now');
  let decShown = null;
  function setDecade(d) {
    decNow.classList.toggle('off', d == null);
    if (d == null || d === decShown) return;
    const next = String(d).split(''), prev = decShown == null ? null : String(decShown).split('');
    decNow.classList.toggle('back', prev != null && d < decShown);
    if (!prev || decNow.children.length !== next.length) {
      decNow.innerHTML = next.map(c => `<span class="dg"><i>${c}</i></span>`).join('');
    } else {
      [...decNow.children].forEach((dg, k) => {
        if (next[k] === prev[k]) return;
        [...dg.querySelectorAll('.out')].forEach(el => el.remove());
        const old = dg.lastElementChild;
        old.className = 'out';
        const el = document.createElement('i');
        el.className = 'in';
        el.textContent = next[k];
        dg.prepend(el); // the new digit stays in the flow, the old one lies over it and leaves
        old.addEventListener('animationend', () => old.remove(), { once: true });
        if (reduce) old.remove();
      });
    }
    decShown = d;
  }
  function step() {
    raf = 0;
    cur += (target - cur) * .14;
    if (Math.abs(target - cur) < .4) cur = target; else raf = requestAnimationFrame(step);
    paint();
  }
  function paint() {
    strip.style.transform = `translate3d(${-cur}px,0,0)`;
    strip.style.setProperty('--x', cur.toFixed(0));
  }

  function goTo(i, smooth) {
    const el = items[i];
    if (!el) return;
    const behavior = smooth && !reduce ? 'smooth' : 'auto';
    if (wide.matches) scrollTo({ top: rail.offsetTop + centres[i] - innerWidth / 2, behavior });
    else scrollTo({ top: el.getBoundingClientRect().top + scrollY - 110, behavior });
  }

  addEventListener('scroll', onScroll, { passive: true });
  let rz = 0;
  let lastH = innerHeight, lastW = innerWidth;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      // print sizes depend on the window on wide screens, so the strip is built again; a phone toolbar hiding changes nothing
      if (wide.matches && (innerHeight !== lastH || innerWidth !== lastW)) { lastH = innerHeight; lastW = innerWidth; buildStrip(); } else layout();
    }, 120);
  });
  wide.addEventListener('change', buildStrip);
  addEventListener('load', layout);
  // a sideways swipe on a trackpad moves through time too
  stage.addEventListener('wheel', e => {
    if (!wide.matches || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    scrollBy(0, e.deltaX);
  }, { passive: false });
  addEventListener('keydown', e => {
    if (view !== 'time' || !wide.matches || $('lb').open || e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); scrollBy({ top: (e.key === 'ArrowRight' ? .6 : -.6) * innerWidth, behavior: reduce ? 'auto' : 'smooth' }); }
  });
  strip.addEventListener('click', e => {
    if (e.target.closest('#end-map')) { setView('map'); return; }
    const it = e.target.closest('.print');
    if (it) openPhoto(+it.parentNode.dataset.i);
  });

  // the bar at the bottom: press or drag to jump to a year
  const scrub = $('scrub');
  function scrubTo(e) {
    const r = $('bars').getBoundingClientRect();
    const y = Y0 + Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * (Y1 - Y0);
    let i = list.findIndex(p => p.y && p.y >= y - 1);
    if (i < 0) i = list.findIndex(p => !p.y);
    if (i < 0) i = list.length - 1;
    goTo(i, e.type === 'pointerdown');
  }
  scrub.addEventListener('pointerdown', e => { scrub.setPointerCapture(e.pointerId); scrubTo(e); });
  scrub.addEventListener('pointermove', e => {
    if (scrub.hasPointerCapture(e.pointerId)) scrubTo(e);
    if (e.pointerType !== 'mouse') return;
    const r = $('bars').getBoundingClientRect(), k = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    ghost.style.left = `${k * 100}%`;
    ghost.firstElementChild.textContent = Math.round(Y0 + k * (Y1 - Y0));
    scrub.classList.add('hov');
  });
  scrub.addEventListener('pointerleave', () => scrub.classList.remove('hov'));
  const ghost = $('ghost');
  // the bar steps aside when the footer comes up, so the two never lie over each other
  const foot = document.querySelector('.site-foot');
  if (foot && 'IntersectionObserver' in window) new IntersectionObserver(es => scrub.classList.toggle('away', es[0].isIntersecting)).observe(foot);

  /* ---------- one photograph, opened ---------- */
  const lb = $('lb');
  let at = 0;
  function setHash(h) { history.replaceState(null, '', h || (location.pathname + location.search)); }
  function openPhoto(i) {
    at = (i + list.length) % list.length;
    const p = list[at], pl = p.place && placeOf(p.place);
    const img = $('lb-img');
    img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
    img.src = full(p); img.width = p.w; img.height = p.h; img.alt = capOf(p);
    const y = $('lb-y');
    y.textContent = yearOf(p);
    y.classList.toggle('s', !p.y || !!p.yl);
    $('lb-cap').textContent = capOf(p);
    let meta = '';
    if (pl) meta += `<div><dt>${esc(t('arh.place'))}</dt><dd>${esc(placeName(pl))}${pl.slug ? ` · <a href="place?slug=${pl.slug}">${esc(t('hist.see.place'))}</a>` : ''}</dd></div>`;
    if (p.src) meta += `<div><dt>${esc(t('arh.source'))}</dt><dd>${esc(srcOf(p))}</dd></div>`;
    $('lb-meta').innerHTML = meta;
    $('lb-meta').hidden = !meta;
    $('lb-map').hidden = !pl;
    const same = pl ? A.photos.filter(q => q.place === p.place && q !== p) : [];
    $('lb-same').hidden = !same.length;
    $('lb-same-list').innerHTML = same.map(q => `<button type="button" data-f="${q.f}" aria-label="${esc(capOf(q))}"><img src="${thumb(q)}" alt="" loading="lazy">${q.y ? `<span>${q.y}</span>` : ''}</button>`).join('');
    $('lb-n').textContent = `${at + 1} / ${list.length}`;
    if (!lb.open) lb.showModal();
    lb.scrollTop = 0;
    setHash('#foto=' + p.f);
  }
  function openFile(f) {
    let i = list.findIndex(p => p.f === f);
    if (i < 0) { setCat('all'); i = list.findIndex(p => p.f === f); }
    if (i >= 0) openPhoto(i);
  }
  lb.addEventListener('close', () => setHash(view === 'map' ? '#karta' : ''));
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  $('lb-x').addEventListener('click', () => lb.close());
  $('lb-prev').addEventListener('click', () => openPhoto(at - 1));
  $('lb-next').addEventListener('click', () => openPhoto(at + 1));
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') openPhoto(at + 1);
    if (e.key === 'ArrowLeft') openPhoto(at - 1);
  });
  $('lb-same-list').addEventListener('click', e => { const b = e.target.closest('button'); if (b) openFile(b.dataset.f); });
  $('lb-map').addEventListener('click', () => { const id = list[at].place; lb.close(); setView('map', id); });
  $('lb-share').addEventListener('click', async () => {
    const p = list[at], url = location.href, btn = $('lb-share');
    try {
      if (navigator.share) { await navigator.share({ title: `${capOf(p)} · Sanski Most`, url }); return; }
      await navigator.clipboard.writeText(url);
      btn.textContent = t('arh.copied');
      setTimeout(() => { btn.textContent = t('arh.share'); }, 2200);
    } catch (e) { /* the share sheet was closed, or copying is not allowed: nothing to do */ }
  });
  // swipe left / right on the photograph
  let sx = null;
  lb.addEventListener('touchstart', e => { sx = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx;
    sx = null;
    if (Math.abs(dx) > 60) openPhoto(at + (dx < 0 ? 1 : -1));
  });

  /* ---------- 2. on the map ---------- */
  const TOWN = [44.7658, 16.6663];
  const placed = A.photos.filter(p => p.place);
  const dial = $('dial'), pcard = $('pcard');
  let map = null, year = Y1, sel = null, shown = null, timer = 0;
  const markers = new Map();
  const visible = id => placed.filter(p => p.place === id && (!p.y || p.y <= year));
  const cover = ps => [...ps].reverse().find(p => p.y) || ps[0];

  function icon(pl) {
    const ps = visible(pl.id), all = placed.filter(p => p.place === pl.id), c = cover(ps.length ? ps : all);
    return L.divIcon({
      className: `apin-w${ps.length ? '' : ' off'}${sel === pl.id ? ' sel' : ''}`, iconSize: [60, 60], iconAnchor: [30, 30],
      html: `<span class="apin"><img src="${thumb(c)}" alt=""></span><b>${ps.length}</b><em>${esc(placeName(pl))}</em>`
    });
  }
  function initMap() {
    const edit = new URLSearchParams(location.search).has('edit');
    map = L.map('amap', { zoomControl: true, scrollWheelZoom: true, zoomSnap: .25 });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    A.places.forEach(pl => {
      if (!placed.some(p => p.place === pl.id)) return;
      const m = L.marker(pl.coords, { icon: icon(pl), title: placeName(pl), alt: placeName(pl), keyboard: true, draggable: edit, riseOnHover: true }).addTo(map);
      m.on('click', () => select(pl.id));
      m.on('keypress', e => { if (e.originalEvent.key === 'Enter') select(pl.id); });
      markers.set(pl.id, m);
      if (edit) m.on('dragend', () => { const ll = m.getLatLng(); pl.coords = [+ll.lat.toFixed(6), +ll.lng.toFixed(6)]; editOut(); });
    });
    if (edit) editOut();
    map.on('zoomend', () => $('amap').classList.toggle('near', map.getZoom() >= 16.5));
    fitTown();
    setYear(Y1);
  }
  // helper for setting the pins by hand: arhiv?edit=1#karta
  function editOut() {
    let ta = document.querySelector('.edit-out');
    if (!ta) { ta = document.createElement('textarea'); ta.className = 'edit-out'; ta.readOnly = true; document.body.appendChild(ta); }
    ta.value = A.places.map(p => `${p.id}: [${p.coords.join(', ')}]`).join('\n');
  }
  function fitTown() {
    // the middle of town, where most of the pins are; the rest is a pan or a zoom away
    const near = A.places.filter(p => markers.has(p.id) && Math.abs(p.coords[0] - TOWN[0]) < .004 && Math.abs(p.coords[1] - TOWN[1]) < .005).map(p => p.coords);
    const w = wide.matches;
    map.fitBounds(near, { paddingTopLeft: w ? [80, 190] : [40, 190], paddingBottomRight: w ? [Math.min(400, innerWidth * .3) + 110, 170] : [40, 330], maxZoom: 17, animate: false });
  }
  function refresh() {
    markers.forEach((m, id) => m.setIcon(icon(placeOf(id))));
  }
  function setYear(y) {
    year = y;
    dial.value = y;
    dial.style.setProperty('--p', `${pct(y)}%`);
    $('dial-y').textContent = y;
    $('dial-info').textContent = t('arh.dial.info', { n: placed.filter(p => !p.y || p.y <= y).length, total: placed.length });
    refresh();
    if (sel) card();
  }
  dial.addEventListener('input', () => { stop(); setYear(+dial.value); });
  function stop() { clearInterval(timer); timer = 0; $('play').classList.remove('on'); $('play').setAttribute('aria-label', t('arh.play')); }
  $('play').addEventListener('click', () => {
    if (timer) { stop(); return; }
    if (year >= Y1) setYear(Y0);
    $('play').classList.add('on');
    $('play').setAttribute('aria-label', t('arh.pause'));
    timer = setInterval(() => { if (year >= Y1) stop(); else setYear(year + 1); }, 95);
  });

  function select(id, fly) {
    sel = id; shown = null; railX = 0;
    refresh();
    card();
    if (fly !== false && id) {
      const pl = placeOf(id);
      map.flyTo(pl.coords, Math.max(map.getZoom(), 16), { animate: !reduce, duration: .9 });
    }
  }
  function card() {
    const pl = sel && placeOf(sel);
    pcard.hidden = !pl;
    document.querySelector('.dial').classList.toggle('low', !pl);
    if (!pl) return;
    const all = placed.filter(p => p.place === pl.id), ps = visible(pl.id);
    const pool = ps.length ? ps : all;
    const p = pool.find(q => q.f === shown) || cover(pool);
    pcard.innerHTML =
      `<button type="button" class="pc-im" data-f="${p.f}" aria-label="${esc(capOf(p))}. ${esc(t('arh.open'))}"><img src="${full(p)}" alt=""><b${p.y && !p.yl ? '' : ' class="s"'}>${esc(yearOf(p))}</b></button>` +
      `<h2>${esc(placeName(pl))}</h2><button type="button" class="pc-x" aria-label="${esc(t('arh.close'))}">✕</button>` +
      `<p class="pc-cap">${esc(capOf(p))}</p>${pl.approx ? `<p class="pc-note">${esc(t('arh.approx'))}</p>` : ''}` +
      (all.length > 1 ? `<div class="pc-rail"><div class="pc-strip">${all.map(q => `<button type="button" data-f="${q.f}" aria-pressed="${q === p}" aria-label="${esc(capOf(q))}"${ps.includes(q) ? '' : ' disabled'}><img src="${thumb(q)}" alt="" loading="lazy">${q.y ? `<span>${q.y}</span>` : ''}</button>`).join('')}</div>` +
        `<button type="button" class="pc-arr prev" aria-label="${esc(t('arh.prev'))}" tabindex="-1"></button><button type="button" class="pc-arr next" aria-label="${esc(t('arh.next'))}" tabindex="-1"></button><i class="pc-bar" aria-hidden="true"><b></b></i></div>` : '') +
      (pl.slug ? `<a class="pc-more" href="place?slug=${pl.slug}">${esc(t('hist.see.place'))}</a>` : '');
    thumbRail(pcard.querySelector('.pc-rail'));
  }
  // the row of small photographs: no browser scrollbar; arrows at the ends, a thin bar that shows where you are,
  // a mouse wheel moves it sideways and the chosen photograph is brought into view
  let railX = 0;
  function thumbRail(r) {
    if (!r) return;
    const s = r.querySelector('.pc-strip'), bar = r.querySelector('.pc-bar b');
    const paint = () => {
      const max = s.scrollWidth - s.clientWidth;
      r.classList.toggle('fits', max <= 1);
      r.classList.toggle('at-start', s.scrollLeft <= 1);
      r.classList.toggle('at-end', s.scrollLeft >= max - 1);
      const w = s.clientWidth / s.scrollWidth;
      bar.style.width = `${w * 100}%`;
      bar.style.transform = `translateX(${max > 0 ? (s.scrollLeft / max) * (1 / w - 1) * 100 : 0}%)`;
    };
    s.scrollLeft = railX; // the row stays where it was when another photograph of the same place is chosen
    const on = s.querySelector('[aria-pressed="true"]');
    if (on && (on.offsetLeft < s.scrollLeft || on.offsetLeft + on.offsetWidth > s.scrollLeft + s.clientWidth)) s.scrollLeft = on.offsetLeft - (s.clientWidth - on.offsetWidth) / 2;
    s.addEventListener('scroll', () => { railX = s.scrollLeft; paint(); }, { passive: true });
    s.addEventListener('wheel', e => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || s.scrollWidth <= s.clientWidth) return;
      e.preventDefault();
      s.scrollLeft += e.deltaY;
    }, { passive: false });
    r.querySelectorAll('.pc-arr').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      s.scrollBy({ left: (b.classList.contains('next') ? 1 : -1) * s.clientWidth * .8, behavior: reduce ? 'auto' : 'smooth' });
    }));
    paint();
    requestAnimationFrame(paint); // once the card has its final size
  }
  pcard.addEventListener('click', e => {
    if (e.target.closest('.pc-x')) { select(null, false); return; }
    const im = e.target.closest('.pc-im');
    if (im) { setCat('all'); openFile(im.dataset.f); return; }
    const b = e.target.closest('.pc-strip button');
    if (b) { shown = b.dataset.f; card(); }
  });

  /* ---------- the two views ---------- */
  function setView(v, placeId) {
    view = v;
    stop();
    document.body.classList.toggle('v-map', v === 'map');
    document.body.classList.remove('sc');
    document.querySelectorAll('.arh-toggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    $('v-time').hidden = v !== 'time';
    $('v-map').hidden = v !== 'map';
    scrollTo(0, 0);
    if (v === 'map') {
      if (!map) initMap(); else map.invalidateSize();
      select(placeId || sel || 'prijedorska', !!placeId);
      setHash('#karta');
    } else {
      setHash('');
      layout();
    }
  }
  document.querySelector('.arh-toggle').addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.dataset.view !== view) setView(b.dataset.view); });

  addEventListener('langchange', () => {
    if (lb.open) lb.close();
    buildChips();
    buildStrip();
    if (map) { markers.forEach((m, id) => { m.options.title = placeName(placeOf(id)); }); setYear(year); }
  });

  /* ---------- start ---------- */
  buildChips();
  buildStrip();
  const h = decodeURIComponent(location.hash);
  if (h.startsWith('#karta')) setView('map', h.split('=')[1]);
  else if (h.startsWith('#foto=')) openFile(h.slice(6));
})();
