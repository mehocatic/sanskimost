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
    h += `<div class="arh-end"><p>${esc(t('arh.end'))}</p><button type="button" id="end-map">${esc(t('arh.end.map'))}</button></div>`;
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

  function buildBars() {
    let b = '';
    for (let y = Y0; y < Y1; y += 2) {
      const n = list.filter(p => p.y && (p.y === y || p.y === y + 1 || (y === Y1 - 2 && p.y === Y1))).length;
      b += `<i style="height:${n ? Math.min(100, 16 + n * 6) : 0}%"${n > 4 ? ' class="h"' : ''}></i>`;
    }
    $('bars').innerHTML = b;
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
    }
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
  scrub.addEventListener('pointermove', e => { if (scrub.hasPointerCapture(e.pointerId)) scrubTo(e); });

  /* ---------- start ---------- */
  buildChips();
  buildStrip();
})();
