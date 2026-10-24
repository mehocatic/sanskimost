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
  const HEADINGS = '.places-head h2, .where-head h2, #history h2, .big-text, #numbers h2, .rivers-head .rt';
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

  /* ---------- 1. intro: reveal words on scroll ---------- */
  const introText = document.getElementById('intro-text');
  let introTl = null;
  function setupIntro() {
    introText.innerHTML = introText.textContent.trim().split(/\s+/)
      .map(w => `<span class="w">${w}</span>`).join(' ');
    if (!animate) return;
    introTl = gsap.timeline({ scrollTrigger: { trigger: '#intro', start: 'top 40%', end: 'top -60%', scrub: true } })
      .fromTo('#intro-text .w', { opacity: .1 }, { opacity: 1, ease: 'none', stagger: 0.5 })
      .fromTo('#intro-sub', { opacity: 0, y: 14 }, { opacity: 1, y: 0, ease: 'none' });
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
  });
  window.addEventListener('langchange', () => {
    setupIntro();
    [...track.children].forEach((slot, i) => cardText(slot, PLACES[i]));
    if (headingsSplit) document.querySelectorAll(HEADINGS).forEach(revealLines);
    if (animate) ScrollTrigger.refresh();
  });

  window.addEventListener('load', () => { if (animate) ScrollTrigger.refresh(); });
})();
