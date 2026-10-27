// Home page below the hero: intro, places carousel, history, numbers, rivers.
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
  const HEADINGS = '.places-head h2, .routes-head h2, #history h2, .big-text, #numbers h2, .rivers-head .rt';
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

  /* ---------- 1. intro: reveal letter by letter on scroll ---------- */
  // Letters sit inside word spans (inline-block, nowrap) so a word never breaks; screen readers get
  // the whole sentence from a visually hidden copy, the letters are aria-hidden.
  const introText = document.getElementById('intro-text');
  const introSub = document.getElementById('intro-sub');
  let introTl = null;
  function splitLetters(el) {
    const text = el.textContent.trim();
    const label = document.createElement('span');
    label.className = 'vh';
    label.textContent = text;
    const letters = document.createElement('span');
    letters.setAttribute('aria-hidden', 'true');
    text.split(/[ \t\n]+/).forEach((word, i) => {
      if (i) letters.append(' ');
      const w = document.createElement('span');
      w.className = 'w';
      for (const ch of word) {
        const c = document.createElement('span');
        c.className = 'ch';
        c.textContent = ch;
        w.appendChild(c);
      }
      letters.appendChild(w);
    });
    el.replaceChildren(label, letters);
  }
  function setupIntro() {
    splitLetters(introText);
    splitLetters(introSub);
    if (!animate) return;
    // the title letters take 2 of 3 scroll units, the sub line letters start when the title is done and take the last one
    introTl = gsap.timeline({ scrollTrigger: { trigger: '#intro', start: 'top 40%', end: 'top -60%', scrub: true } })
      .fromTo('#intro-text .ch', { opacity: .1 }, { opacity: 1, ease: 'none', duration: .5, stagger: { amount: 1.5 } })
      .fromTo('#intro-sub .ch', { opacity: .1 }, { opacity: 1, ease: 'none', duration: .3, stagger: { amount: .7 } });
  }
  setupIntro();

  /* ---------- 2. places carousel ---------- */
  const places = document.getElementById('places');
  const track = document.getElementById('track');
  const counter = document.getElementById('places-count');

  PLACES.forEach(p => {
    const slot = document.createElement('article');
    slot.className = 'slot';
    slot.dataset.slug = p.slug;

    const card = document.createElement('a');
    card.className = 'card';
    card.href = `place.html?slug=${encodeURIComponent(p.slug)}`;

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

  // "3 / 9" indicator for the swipe layout: the card whose left edge is closest to the track's left edge
  function updateCounter() {
    const slots = [...track.children];
    const left = track.getBoundingClientRect().left;
    let best = 0, bestD = Infinity;
    slots.forEach((s, i) => {
      const d = Math.abs(s.getBoundingClientRect().left - left - parseFloat(getComputedStyle(track).paddingLeft));
      if (d < bestD) { bestD = d; best = i; }
    });
    counter.textContent = `${best + 1} / ${slots.length}`;
  }
  let counterRaf = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(counterRaf);
    counterRaf = requestAnimationFrame(updateCounter);
  }, { passive: true });
  window.addEventListener('resize', updateCounter);
  updateCounter();

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
    if (!e.viewTransition || !clicked) return;
    clicked.querySelector('.media').style.viewTransitionName = 'place-hero';
  });
  // coming back from the browser cache: the name must not stay on the card (names have to be unique)
  window.addEventListener('pageshow', () => {
    track.querySelectorAll('.media').forEach(el => { el.style.viewTransitionName = ''; });
    clicked = null;
  });

  /* ---------- routes (routes.js): a line through the stops draws on scroll, each stop lights up when the line reaches it ---------- */
  // Phones and narrow screens: stops stacked, vertical line. From 900px: stops side by side, horizontal line.
  const routesList = document.getElementById('routes-list');
  const ROUTES_ROW = window.matchMedia('(min-width: 900px)');
  let routeTriggers = [];

  const make = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  function renderRoutes() {
    routesList.replaceChildren(...ROUTES.map((r, ri) => {
      const li = make('li', 'route');
      li.id = `route-${r.id}`;

      const info = make('div', 'route-info');
      info.append(
        make('p', 'route-num', String(ri + 1).padStart(2, '0')),
        make('h3', 'route-name', I18n.t(`route.${r.id}.name`)),
        make('p', 'route-text', I18n.t(`route.${r.id}.text`))
      );
      if (r.extra) info.appendChild(make('p', 'route-extra', I18n.t(r.extra)));
      const map = make('a', 'route-map', I18n.t('routes.map'));
      map.href = `explore.html?route=${encodeURIComponent(r.id)}`;
      info.appendChild(map);

      const trackEl = make('div', 'route-track');
      const line = make('span', 'route-line');
      line.setAttribute('aria-hidden', 'true');
      const stops = make('ol', 'stops');
      r.stops.forEach(s => {
        const p = PLACES.find(q => q.slug === s.slug);
        if (!p) return;
        const name = I18n.place(p, 'name');
        // without the animation every stop is shown as reached
        const stop = make('li', animate ? 'stop' : 'stop on');
        const dot = make('span', 'stop-dot');
        dot.setAttribute('aria-hidden', 'true');
        const pic = make('div', 'stop-photo');
        pic.appendChild(photo(photoEntry(p.photos && p.photos[0]).src, name));
        const body = make('div', 'stop-body');
        const title = make('p', 'stop-name');
        const a = make('a', null, name);
        a.href = `place.html?slug=${encodeURIComponent(p.slug)}`;
        title.appendChild(a);
        body.appendChild(title);
        if (s.km) body.appendChild(make('p', 'stop-km', I18n.t('routes.km', { km: s.km })));
        if (s.note) body.appendChild(make('p', 'stop-note', I18n.t(s.note)));
        stop.append(dot, pic, body);
        stops.appendChild(stop);
      });
      trackEl.append(line, stops);
      li.append(info, trackEl);
      return li;
    }));
    layoutRoutes();
  }

  // place each line from the first dot to the last, and note where along it every stop sits (0..1)
  function layoutRoutes() {
    const row = ROUTES_ROW.matches;
    routesList.querySelectorAll('.route-track').forEach(t => {
      const line = t.querySelector('.route-line');
      const box = t.getBoundingClientRect();
      const c = [...t.querySelectorAll('.stop-dot')].map(d => {
        const r = d.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      });
      if (c.length < 2) { line.style.display = 'none'; t._pos = c.map(() => 0); return; }
      const a = c[0], b = c[c.length - 1];
      line.style.display = '';
      if (row) Object.assign(line.style, { left: a.x + 'px', top: a.y + 'px', width: (b.x - a.x) + 'px', height: '1px' });
      else Object.assign(line.style, { left: a.x + 'px', top: a.y + 'px', width: '1px', height: (b.y - a.y) + 'px' });
      t._row = row;
      t._pos = c.map(p => row ? (p.x - a.x) / (b.x - a.x) : (p.y - a.y) / (b.y - a.y));
    });
  }

  function setupRouteTriggers() {
    if (!animate) return;
    routesList.querySelectorAll('.route-track').forEach(t => {
      const line = t.querySelector('.route-line');
      const stops = [...t.querySelectorAll('.stop')];
      const apply = p => {
        line.style.transform = t._row ? `scaleX(${p})` : `scaleY(${p})`;
        stops.forEach((s, i) => s.classList.toggle('on', p > 0 && p >= t._pos[i] - .001));
      };
      // stacked: the tip of the line stays at 70% of the screen height (as the Sana line);
      // side by side: the line draws while the row crosses the lower half of the screen
      routeTriggers.push(ScrollTrigger.create({
        trigger: t,
        start: () => ROUTES_ROW.matches ? 'top 80%' : `top+=${parseFloat(line.style.top) || 0} 70%`,
        end: () => ROUTES_ROW.matches ? 'bottom 55%' : `top+=${(parseFloat(line.style.top) || 0) + (parseFloat(line.style.height) || 0)} 70%`,
        invalidateOnRefresh: true,
        onUpdate: self => apply(self.progress),
        onRefresh: self => apply(self.progress)
      }));
      apply(0);
    });
  }

  renderRoutes();
  setupRouteTriggers();
  if (animate) ScrollTrigger.addEventListener('refreshInit', layoutRoutes);
  else window.addEventListener('resize', layoutRoutes);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layoutRoutes(); if (animate) ScrollTrigger.refresh(); });

  /* ---------- 3b. timeline: the line draws, entries enter in order ---------- */
  const timeline = document.getElementById('timeline');
  const tlLine = document.createElement('span');
  tlLine.className = 'tl-line';
  timeline.prepend(tlLine);
  if (animate) {
    gsap.fromTo(tlLine, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: timeline, start: 'top 65%', end: 'bottom 65%', scrub: true }
    });
    timeline.querySelectorAll('li').forEach(li => {
      gsap.to(li, {
        opacity: 1, y: 0, duration: .9, ease: 'power2.out',
        scrollTrigger: { trigger: li, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
    });
  }

  /* ---------- numbers: count up from zero when the section enters the screen ---------- */
  if (animate) {
    document.querySelectorAll('.stat .n').forEach(el => {
      const to = +el.dataset.to;
      const o = { v: 0 };
      el.textContent = '0';
      gsap.to(o, {
        v: to, duration: 2, ease: 'power2.out', snap: { v: 1 },
        onUpdate: () => { el.textContent = o.v; },
        scrollTrigger: { trigger: el.closest('.stat'), start: 'top 85%', once: true }
      });
    });
  }

  /* ---------- 4. nine rivers: the Sana line draws, tributaries flow in and then get their names ---------- */
  if (animate) {
    const sana = document.getElementById('sana');
    // The tip of the line sits at a fixed 70% of the viewport height, so a tributary
    // reaches the line exactly when the tip passes the bottom of its row.
    gsap.to('.sana-line', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: sana, start: 'top 70%', end: 'bottom 70%', scrub: true }
    });
    sana.querySelectorAll('.trib').forEach(li => {
      // small ring where the tributary reaches the Sana
      const ring = document.createElement('span');
      ring.className = 'ripple';
      li.querySelector('.cell').appendChild(ring);
      ScrollTrigger.create({
        trigger: li, start: 'bottom 70%',
        onEnter: () => gsap.fromTo(ring, { scale: .4, opacity: .8 }, { scale: 3.4, opacity: 0, duration: 1.1, ease: 'power2.out', overwrite: true }),
        onLeaveBack: () => gsap.set(ring, { opacity: 0 })
      });
      gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 70%', end: 'bottom 70%', scrub: true } })
        .to(li.querySelector('.trib-svg'), { clipPath: 'inset(0 0% 0 0)', ease: 'none', duration: .85 })
        .to(li.querySelector('.trib-name'), { opacity: 1, ease: 'none', duration: .15 });
    });
  }

  /* ---------- language switch: undo the splits before i18n.js swaps the texts, then build them again ---------- */
  window.addEventListener('beforelangchange', () => {
    reveals.forEach(r => {
      if (r.tween) { if (r.tween.scrollTrigger) r.tween.scrollTrigger.kill(); r.tween.kill(); }
      if (r.split) r.split.revert();
    });
    reveals.length = 0;
    if (introTl) { introTl.scrollTrigger.kill(); introTl.kill(); introTl = null; }
    routeTriggers.forEach(st => st.kill());
    routeTriggers = [];
  });
  window.addEventListener('langchange', () => {
    setupIntro();
    [...track.children].forEach((slot, i) => cardText(slot, PLACES[i]));
    renderRoutes();
    setupRouteTriggers();
    if (headingsSplit) document.querySelectorAll(HEADINGS).forEach(revealLines);
    if (animate) ScrollTrigger.refresh();
  });

  window.addEventListener('load', () => { if (animate) ScrollTrigger.refresh(); });
})();
