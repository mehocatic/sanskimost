// Home page below the hero: places carousel, history, numbers, rivers.
// The hero (frame drawing) lives in script.js.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = !reduce && !!(window.gsap && window.ScrollTrigger);
  const root = document.documentElement;

  if (animate) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    root.classList.add('js-anim');
  }

  /* ---------- smooth scroll (Lenis) driving ScrollTrigger ---------- */
  if (animate && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }

  const { photo, photoEntry } = window.PlacesLib;

  /* ---------- rising water between sections: the wave climbs while its edge crosses the screen ---------- */
  if (animate) {
    document.querySelectorAll('.rise').forEach(r => {
      gsap.fromTo(r.querySelector('svg'), { yPercent: 100 }, {
        yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: r, start: 'top bottom', end: 'top 55%', scrub: true }
      });
    });
  }

  /* ---------- headings reveal line by line (SplitText; plain word split if it is not available) ---------- */
  const HEADINGS = '.places-head h2, #history h2, .big-text, #numbers h2, .rivers-head h2';
  const reveals = []; // { split, tween } per heading, undone before the language changes
  function revealLines(el) {
    const trigger = { trigger: el, start: 'top 88%', toggleActions: 'play none none none' };
    if (window.SplitText) {
      const r = { tween: null };
      r.split = SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'ln', maskClass: 'ln-mask',
        onSplit: self => (r.tween = gsap.from(self.lines, { yPercent: 110, duration: 1.1, stagger: .12, ease: 'power3.out', scrollTrigger: trigger }))
      });
      reveals.push(r);
      return;
    }
    // fallback: every word in its own mask
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="ln-mask" style="display:inline-block;overflow:hidden;vertical-align:top"><span class="ln" style="display:inline-block">${w}</span></span>`).join(' ');
    reveals.push({ tween: gsap.from(el.querySelectorAll('.ln'), { yPercent: 110, duration: 1, stagger: .05, ease: 'power3.out', scrollTrigger: trigger }) });
  }
  let headingsSplit = false;
  if (animate) {
    const go = () => { headingsSplit = true; document.querySelectorAll(HEADINGS).forEach(revealLines); };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
  }

  /* ---------- 2. places carousel ---------- */
  const places = document.getElementById('places');
  const track = document.getElementById('track');
  const bar = document.getElementById('places-bar');

  PLACES.forEach(p => {
    const slot = document.createElement('article');
    slot.className = 'slot';
    slot.dataset.slug = p.slug;

    const card = document.createElement('a');
    card.className = 'card';
    card.href = `place?slug=${encodeURIComponent(p.slug)}`;

    const media = document.createElement('span');
    media.className = 'media';
    media.appendChild(photo(photoEntry(p.photos && p.photos[0]).src, I18n.place(p, 'name')));

    const label = document.createElement('span');
    label.className = 'label';
    label.innerHTML = '<span class="name"></span><span class="desc"></span><span class="more"></span>';

    card.append(media, label);
    slot.appendChild(card);
    track.appendChild(slot);
    cardText(slot, p);
  });

  // last card: the way to everything else, on the map
  const allSlot = document.createElement('article');
  allSlot.className = 'slot slot-all';
  const allCard = document.createElement('a');
  allCard.className = 'card card-all';
  allCard.href = 'explore';
  allCard.innerHTML = '<span class="label"><span class="name"></span><span class="more" aria-hidden="true">\u2192</span></span>';
  allSlot.appendChild(allCard);
  track.appendChild(allSlot);
  const allText = () => { allCard.querySelector('.name').textContent = I18n.t('places.all'); };
  allText();

  // texts of one card in the current language
  function cardText(slot, p) {
    const name = I18n.place(p, 'name');
    const card = slot.querySelector('.card');
    card.setAttribute('aria-label', I18n.t('card.aria', { name }));
    card.querySelector('.name').textContent = name;
    card.querySelector('.desc').textContent = I18n.place(p, 'short');
    card.querySelector('.more').textContent = I18n.t('card.more');
    const img = card.querySelector('.media img');
    if (img) img.alt = name;
    const ph = card.querySelector('.media .ph');
    if (ph) ph.textContent = name;
  }

  // thin line under the row on phones: fills as the row is swiped (no count, the row is a selection, not a full list)
  function updateBar() {
    const max = track.scrollWidth - track.clientWidth;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(.06, track.scrollLeft / max)) : 1})`;
  }
  let barRaf = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(barRaf);
    barRaf = requestAnimationFrame(updateBar);
  }, { passive: true });
  window.addEventListener('resize', updateBar);
  updateBar();

  // Pin the section and slide the track sideways on desktop with a mouse.
  // On phones, tablets and touch devices it stays a native swipe with CSS scroll-snap.
  if (animate) {
    gsap.matchMedia().add('(min-width: 769px) and (pointer: fine)', () => {
      places.classList.add('pinned');
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: places, start: 'top top', end: () => '+=' + dist(),
          pin: true, scrub: true, invalidateOnRefresh: true
        }
      });
      return () => places.classList.remove('pinned');
    });
  }

  /* ---------- page transition to a place: the clicked photo flies into the big picture on the next page ---------- */
  let clicked = null;
  track.addEventListener('click', e => { clicked = e.target.closest('.card'); });
  window.addEventListener('pageswap', e => {
    const media = clicked && clicked.querySelector('.media');
    if (!e.viewTransition || !media) return;
    media.style.viewTransitionName = 'place-hero';
  });
  // coming back from the browser cache: the name must not stay on the card (names have to be unique)
  window.addEventListener('pageshow', () => {
    track.querySelectorAll('.media').forEach(el => { el.style.viewTransitionName = ''; });
    clicked = null;
  });

  /* ---------- 3b. timeline: the line fills on scroll, an entry lights up when the line reaches it ---------- */
  const timeline = document.getElementById('timeline');
  const tlLine = document.createElement('span');
  tlLine.className = 'tl-line';
  timeline.prepend(tlLine);
  const tlItems = [...timeline.querySelectorAll('li')];
  const hNow = document.getElementById('h-now');
  // the last entry reached is "now": its dot gets a ring and its year is shown large beside the list (wide screens)
  function markNow() {
    const on = tlItems.filter(li => li.classList.contains('on'));
    const cur = on[on.length - 1] || tlItems[0];
    tlItems.forEach(li => li.classList.toggle('now', li === cur && on.length > 0));
    const yr = cur.querySelector('.yr');
    hNow.textContent = yr.textContent;
    // anything longer than a plain year (a range, a century) is set smaller so it stays on one line
    hNow.classList.toggle('s', yr.textContent.trim().length > 4);
  }
  if (animate) {
    gsap.fromTo(tlLine, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: timeline, start: 'top 62%', end: 'bottom 62%', scrub: true }
    });
    tlItems.forEach(li => ScrollTrigger.create({
      trigger: li, start: 'top 62%',
      onEnter: () => { li.classList.add('on'); markNow(); },
      onLeaveBack: () => { li.classList.remove('on'); markNow(); }
    }));
  } else {
    tlItems.forEach(li => li.classList.add('on'));
  }
  markNow();

  /* ---------- numbers: each tile plays once when it enters the screen ---------- */
  const SVG = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs, parent) => {
    const n = document.createElementNS(SVG, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  // 176 dots, one for each grave
  document.getElementById('dots').innerHTML = '<i></i>'.repeat(176);

  // nine thin lines that run into one, drawn to the size of the tile so the strokes are not stretched
  const nineSvg = document.querySelector('.nine-lines');
  function drawNine() {
    const w = nineSvg.clientWidth, h = nineSvg.clientHeight;
    if (!w || !h) return;
    nineSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    nineSvg.replaceChildren();
    const x1 = w * .84, y1 = h * .6;   // where they meet, on the right so the text on the left stays clear
    for (let i = 0; i < 9; i++) {
      const x0 = w * (.3 + i * .08);
      svgEl('path', { d: `M${x0} 0 C${x0} ${h * .32} ${x1} ${h * .3} ${x1} ${y1}`, pathLength: 1, 'stroke-dasharray': 1 }, nineSvg);
    }
    svgEl('path', { class: 'trunk', d: `M${x1} ${y1} L${x1} ${h}`, pathLength: 1, 'stroke-dasharray': 1 }, nineSvg);
  }
  drawNine();
  let nineW = nineSvg.clientWidth;
  window.addEventListener('resize', () => { if (nineSvg.clientWidth !== nineW) { nineW = nineSvg.clientWidth; drawNine(); } });

  if (animate) {
    const once = el => ({ trigger: el, start: 'top 85%', once: true });
    // figures count up (a year starts near itself, not at zero)
    document.querySelectorAll('.tile .n').forEach(el => {
      const o = { v: +(el.dataset.from || 0) };
      el.textContent = o.v;
      gsap.to(o, {
        v: +el.dataset.to, duration: 2, ease: 'power2.out', snap: { v: 1 },
        onUpdate: () => { el.textContent = o.v; },
        scrollTrigger: once(el.closest('.tile'))
      });
    });
    // the line fills and its dot travels with it, in step with the figure
    document.querySelectorAll('.trk').forEach(t => {
      const fill = t.querySelector('i'), dot = t.querySelector('b');
      const o = { p: 0 };
      const put = () => { fill.style.transform = `scaleX(${o.p})`; dot.style.left = (o.p * 100) + '%'; };
      put();
      gsap.to(o, { p: 1, duration: 2, ease: 'power2.out', onUpdate: put, scrollTrigger: once(t.closest('.tile')) });
    });
    gsap.from('.ruler', { scaleY: 0, duration: 1.6, ease: 'power2.out', scrollTrigger: once('.t-56') });
    gsap.fromTo('.nine-lines path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, stagger: .09, ease: 'power2.inOut', scrollTrigger: once('.t-9') });
    gsap.fromTo('#dots i', { opacity: .15 }, { opacity: 1, duration: .25, stagger: .008, scrollTrigger: once('.t-176') });
  }

  /* ---------- 4. nine rivers: the Sana runs down with the scroll, tributaries flow in one by one, each name follows its curve ---------- */
  // The order and sides of the tributaries are decorative (as in the old layout), not the real course of the river.
  const riverMap = document.getElementById('river-map');
  const TRIBS = ['Sanica', 'Dabar', 'Zdena', 'Bliha', 'Majdanska rijeka', 'Japra', 'Sasinka', 'Kozica'];
  const clamp01 = v => Math.min(1, Math.max(0, v));
  let river = null;   // { sana, len, tribs: [{ path, len, left, text, at }] }

  function buildRiver() {
    const W = riverMap.clientWidth, H = riverMap.clientHeight;
    if (!W || !H) return;
    const wide = W > 700;
    const c = W * .5, a = Math.min(W * .15, 95), sw = wide ? 14 : 10, dy = wide ? 104 : 76;
    riverMap.replaceChildren();
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}` }, riverMap);
    const grad = svgEl('linearGradient', { id: 'riv-g', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 0, y2: H }, svgEl('defs', {}, svg));
    svgEl('stop', { offset: 0, 'stop-color': '#7fd6dc' }, grad);
    svgEl('stop', { offset: 1, 'stop-color': '#0f7a85' }, grad);
    const tribLayer = svgEl('g', {}, svg);   // under the Sana, so the mouths are covered by it
    const sana = svgEl('path', {
      d: `M${c} 0 C${c - a * .9} ${H * .11} ${c + a * 1.2} ${H * .19} ${c} ${H * .31} S${c - a * 1.25} ${H * .47} ${c - a * .1} ${H * .6} S${c + a * 1.35} ${H * .78} ${c - a * .2} ${H}`,
      fill: 'none', stroke: 'url(#riv-g)', 'stroke-width': sw, 'stroke-linecap': 'round'
    }, svg);
    const len = sana.getTotalLength();
    svgEl('text', { class: 'riv-name riv-sana', x: c + sw + 12, y: wide ? 40 : 28 }, svg).textContent = 'Sana';

    const tribs = TRIBS.map((name, i) => {
      const at = .15 + i * .106;                     // how far down the Sana this tributary joins
      const p = sana.getPointAtLength(len * at);
      const left = i % 2 === 0;
      const edge = left ? -4 : W + 4, span = Math.abs(p.x - edge);
      // both are written left to right so the name reads the right way up; the right ones are then drawn from their far end
      const d = left
        ? `M${edge} ${p.y - dy} C${edge + span * .42} ${p.y - dy * 1.04} ${p.x - span * .36} ${p.y - dy * .6} ${p.x} ${p.y}`
        : `M${p.x} ${p.y} C${p.x + span * .36} ${p.y - dy * .6} ${edge - span * .42} ${p.y - dy * 1.04} ${edge} ${p.y - dy}`;
      const path = svgEl('path', { id: `riv-t${i}`, d, fill: 'none', stroke: '#35aab3', 'stroke-width': Math.max(2, sw * .42 - i * .15), 'stroke-linecap': 'round' }, tribLayer);
      const text = svgEl('text', { class: 'riv-name', dy: wide ? -12 : -9 }, tribLayer);
      svgEl('textPath', { href: `#riv-t${i}`, startOffset: left ? '5%' : '95%', 'text-anchor': left ? 'start' : 'end' }, text).textContent = name;
      return { path, len: path.getTotalLength(), left, text, at };
    });
    river = { sana, len, tribs };
  }

  // p = 0..1: how much of the Sana is drawn. A tributary flows in over the stretch just before its mouth,
  // so it arrives exactly when the tip of the Sana gets there; its name fades in on the way.
  function drawRiver(p) {
    if (!river) return;
    river.sana.style.strokeDasharray = `${river.len * p} ${river.len}`;
    river.sana.style.opacity = p > 0 ? 1 : 0;
    river.tribs.forEach(t => {
      const k = clamp01((p - (t.at - .1)) / .1);
      t.path.style.opacity = k > 0 ? 1 : 0;
      if (t.left) {
        t.path.style.strokeDasharray = `${t.len * k} ${t.len}`;
      } else {
        t.path.style.strokeDasharray = `${t.len} ${t.len}`;
        t.path.style.strokeDashoffset = -t.len * (1 - k);
      }
      t.text.style.opacity = clamp01((k - .3) / .5);
    });
  }

  buildRiver();
  let riverST = null;
  if (animate) {
    riverST = ScrollTrigger.create({
      trigger: riverMap, start: 'top 72%', end: 'bottom 80%',
      onUpdate: self => drawRiver(self.progress),
      onRefresh: self => drawRiver(self.progress)
    });
    drawRiver(riverST.progress);
  } else {
    drawRiver(1);
  }
  // the drawing is made to the pixel size of its box: build it again when the width changes
  let riverW = riverMap.clientWidth;
  window.addEventListener('resize', () => {
    if (riverMap.clientWidth === riverW) return;
    riverW = riverMap.clientWidth;
    buildRiver();
    drawRiver(riverST ? riverST.progress : 1);
  });

  /* ---------- language switch: undo the splits before i18n.js swaps the texts, then build them again ---------- */
  window.addEventListener('beforelangchange', () => {
    reveals.forEach(r => {
      if (r.tween) { if (r.tween.scrollTrigger) r.tween.scrollTrigger.kill(); r.tween.kill(); }
      if (r.split) r.split.revert();
    });
    reveals.length = 0;
  });
  window.addEventListener('langchange', () => {
    track.querySelectorAll('.slot[data-slug]').forEach(slot => cardText(slot, PLACES.find(p => p.slug === slot.dataset.slug)));
    allText();
    markNow();
    if (headingsSplit) document.querySelectorAll(HEADINGS).forEach(revealLines);
    if (animate) ScrollTrigger.refresh();
  });

  window.addEventListener('load', () => { if (animate) ScrollTrigger.refresh(); });
})();
