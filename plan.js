// "Plan your visit" page: distances, practical notes, when to go and routes, all taken from what the site already states.
// Nothing new is claimed here: distances are the ones in the place texts and routes.js, notes are the places' own notes,
// photos are the places' own photos (places.js).
// The page is built once; on a language change only the texts are swapped (fill()), so the scroll animations stay bound.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = !reduce && !!(window.gsap && window.ScrollTrigger);
  if (animate) {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('js-anim');
    if (window.Lenis) {
      const lenis = new Lenis({ lerp: 0.1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  const { photo, photoEntry } = window.PlacesLib;
  const $ = id => document.getElementById(id);
  const bySlug = Object.fromEntries(PLACES.map(p => [p.slug, p]));
  const href = slug => `place?slug=${encodeURIComponent(slug)}`;

  // An element whose text is a place field (data-pf="slug:field") or an i18n key (data-t="key", data-tv = JSON of variables)
  function make(tag, cls, opts) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (opts && opts.pf) e.dataset.pf = opts.pf;
    if (opts && opts.t) e.dataset.t = opts.t;
    if (opts && opts.tv) e.dataset.tv = JSON.stringify(opts.tv);
    if (opts && opts.text != null) e.textContent = opts.text;
    if (opts && opts.href) e.href = opts.href;
    return e;
  }
  // the cover photo of a place (its first photo); the alt text follows the language through data-pf
  function cover(slug, eager) {
    const p = bySlug[slug];
    const e = photoEntry(p.photos && p.photos[0]);
    const holder = photo(e.src, I18n.place(p, 'name'), null, eager);
    const img = holder.querySelector('img');
    if (img) img.dataset.pf = `${slug}:name`;
    return holder;
  }

  function fill(root) {
    (root || document).querySelectorAll('[data-pf]').forEach(el => {
      const [slug, field] = el.dataset.pf.split(':');
      const v = bySlug[slug] ? I18n.place(bySlug[slug], field) : '';
      if (el.tagName === 'IMG') el.alt = v; else el.textContent = v;
    });
    (root || document).querySelectorAll('[data-t]').forEach(el => {
      el.textContent = I18n.t(el.dataset.t, el.dataset.tv ? JSON.parse(el.dataset.tv) : undefined);
    });
    document.title = I18n.t('plan.doctitle');
    const og = document.querySelector('meta[property="og:title"]');
    if (og) og.content = document.title;
  }

  /* ---------- hero: the hero photo of the Blihe page ---------- */
  const blihe = bySlug.blihe;
  const heroEntry = blihe && (blihe.photos.map(photoEntry).find(e => e.hero) || photoEntry(blihe.photos[0]));
  if (heroEntry) {
    const h = photo(heroEntry.src, '', null, true, { srcset: heroEntry.srcset, sizes: '100vw' });
    const img = h.querySelector('img');
    if (img) { img.alt = ''; img.style.setProperty('--pos', heroEntry.pos || '50% 50%'); img.style.setProperty('--pos-m', heroEntry.posM || heroEntry.pos || '50% 50%'); }
    $('plan-hero-media').appendChild(h);
  }

  /* ---------- distances: a road from town, one stop per place ---------- */
  // km from town. Sources: FACTS.md (Hrustovacka ~13, Blihe ~14, Bobijasko oko ~20, Grmec forest ~17) and the Korcanica text (about 32 km).
  const DIST = [
    { slug: 'hrustovacka', km: 13 },
    { slug: 'blihe', km: 14 },
    { slug: 'grmec-forest', km: 17 },
    { slug: 'bobijasko-oko', km: 20 },
    { slug: 'korcanica', km: 32 }
  ].filter(d => bySlug[d.slug]);

  const journey = $('journey');
  const jLine = make('span', 'j-line');
  const start = make('div', 'j-start');
  start.append(make('span', 'j-dot'), make('span', 'j-km', { text: '0 km' }), make('span', 'j-town', { text: 'Sanski Most' }));
  const stopsEl = make('ol', 'j-stops');
  DIST.forEach(d => {
    const li = make('li', 'j-stop');
    const a = make('a', 'j-card', { href: href(d.slug) });
    const km = make('span', 'j-km');
    km.append(make('span', 'j-n', { text: String(d.km) }), document.createTextNode(' km'));
    const ph = make('span', 'j-photo');
    ph.appendChild(cover(d.slug));
    const txt = make('span', 'j-txt');
    txt.append(make('span', 'j-name', { pf: `${d.slug}:name` }), make('span', 'j-short', { pf: `${d.slug}:short` }));
    a.append(make('span', 'j-dot'), km, ph, txt);
    li.appendChild(a);
    stopsEl.appendChild(li);
  });
  journey.append(jLine, start, stopsEl);

  // the line runs from the town dot to the last dot; every stop knows where along it (0..1) its dot sits
  const ROW = window.matchMedia('(min-width: 900px)');
  let dotPos = [];
  function layoutJourney() {
    const box = journey.getBoundingClientRect();
    const dots = [...journey.querySelectorAll('.j-dot')].map(d => {
      const r = d.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    });
    if (dots.length < 2) return;
    const a = dots[0], b = dots[dots.length - 1];
    if (ROW.matches) Object.assign(jLine.style, { left: a.x + 'px', top: a.y + 'px', width: (b.x - a.x) + 'px', height: '1px' });
    else Object.assign(jLine.style, { left: a.x + 'px', top: a.y + 'px', width: '1px', height: (b.y - a.y) + 'px' });
    dotPos = dots.map(p => ROW.matches ? (p.x - a.x) / (b.x - a.x || 1) : (p.y - a.y) / (b.y - a.y || 1));
  }

  /* ---------- before you go: the practical notes of the places, with their photos ---------- */
  // places whose note is a practical one (the notes of Kamengrad and the musalla are about history, so they are not here)
  const NOTES = ['hrustovacka', 'dabarska', 'bobijasko-oko', 'mulez'].filter(s => bySlug[s] && I18n.place(bySlug[s], 'note'));
  $('plan-tips').replaceChildren(...NOTES.map((s, i) => {
    const li = make('li', 'tip');
    const ph = make('a', 'tip-photo', { href: href(s) });
    ph.setAttribute('tabindex', '-1');
    ph.setAttribute('aria-hidden', 'true');
    ph.appendChild(cover(s));
    const body = make('div', 'tip-body');
    body.append(make('span', 'tip-num', { text: String(i + 1).padStart(2, '0') }), make('a', 'tip-name', { pf: `${s}:name`, href: href(s) }), make('p', 'tip-text', { pf: `${s}:note` }));
    li.append(ph, body);
    return li;
  }));

  /* ---------- when: two moments, each with the photo of its place ---------- */
  const WHEN = [
    { slug: 'bobijasko-oko', t: 'plan.when.bobijasko' },
    { slug: 'musalla', t: 'plan.when.musalla' }
  ].filter(w => bySlug[w.slug]);
  $('plan-when').replaceChildren(...WHEN.map(w => {
    const el = make('article', 'season');
    const ph = make('a', 'season-photo', { href: href(w.slug) });
    ph.setAttribute('tabindex', '-1');
    ph.setAttribute('aria-hidden', 'true');
    ph.appendChild(cover(w.slug));
    const body = make('div', 'season-body');
    body.append(make('a', 'season-place', { pf: `${w.slug}:name`, href: href(w.slug) }), make('p', 'season-text', { t: w.t }));
    el.append(ph, body);
    return el;
  }));

  /* ---------- routes: a fan of the stops' photos, then the stops ---------- */
  $('plan-routes').replaceChildren(...ROUTES.map((r, i) => {
    const li = make('li', 'rcard');
    const fan = make('a', 'rc-fan', { href: `explore?route=${encodeURIComponent(r.id)}` });
    fan.setAttribute('tabindex', '-1');
    fan.setAttribute('aria-hidden', 'true');
    r.stops.filter(s => bySlug[s.slug]).slice(0, 3).forEach(s => { const f = make('span', 'rc-photo'); f.appendChild(cover(s.slug)); fan.appendChild(f); });
    const body = make('div', 'rc-body');
    body.append(make('p', 'rc-num', { text: String(i + 1).padStart(2, '0') }), make('h3', 'rc-name', { t: `route.${r.id}.name` }), make('p', 'rc-text', { t: `route.${r.id}.text` }));
    const stops = make('ol', 'rc-stops');
    r.stops.forEach(s => {
      if (!bySlug[s.slug]) return;
      const st = make('li');
      st.appendChild(make('a', null, { pf: `${s.slug}:name`, href: href(s.slug) }));
      if (s.km) st.appendChild(make('span', 'rc-km', { t: 'routes.km', tv: { km: s.km } }));
      stops.appendChild(st);
    });
    body.appendChild(stops);
    if (r.extra) body.appendChild(make('p', 'rc-extra', { t: r.extra }));
    body.appendChild(make('a', 'rc-map', { t: 'routes.map', href: `explore?route=${encodeURIComponent(r.id)}` }));
    li.append(fan, body);
    return li;
  }));

  fill();
  layoutJourney();

  /* ---------- animations ---------- */
  if (!animate) {
    window.addEventListener('resize', layoutJourney);
  } else {
    // hero: the title rises, the photo settles from a slight zoom and drifts as the page scrolls
    gsap.from('.pt-line', { yPercent: 110, duration: 1.3, ease: 'power3.out', delay: .15 });
    gsap.from('.plan-hero .eyebrow, .plan-lead, .plan-scroll', { opacity: 0, y: 18, duration: 1, ease: 'power2.out', delay: .45, stagger: .12 });
    gsap.fromTo('.plan-hero-media', { scale: 1.12 }, { scale: 1, duration: 2.4, ease: 'power2.out' });
    gsap.to('.plan-hero-media img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '#plan-hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.plan-hero-text', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#plan-hero', start: 'top top', end: 'bottom 20%', scrub: true } });

    // rising water between sections, as on the home page
    document.querySelectorAll('.rise').forEach(r => {
      gsap.fromTo(r.querySelector('svg'), { yPercent: 100 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: r, start: 'top bottom', end: 'top 55%', scrub: true } });
    });

    // section titles and the closing line rise into place
    document.querySelectorAll('.reveal').forEach(el => {
      gsap.from(el, { yPercent: 40, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    // distances: the road draws with the scroll, each stop lights up when the line reaches its dot
    const stops = [start, ...journey.querySelectorAll('.j-stop')];
    const applyRoad = p => {
      jLine.style.transform = ROW.matches ? `scaleX(${p})` : `scaleY(${p})`;
      stops.forEach((s, i) => s.classList.toggle('on', p >= (dotPos[i] || 0) - .001));
    };
    ScrollTrigger.create({
      trigger: journey,
      start: () => ROW.matches ? 'top 75%' : `top+=${parseFloat(jLine.style.top) || 0} 70%`,
      end: () => ROW.matches ? 'top 35%' : `top+=${(parseFloat(jLine.style.top) || 0) + (parseFloat(jLine.style.height) || 0)} 70%`,
      invalidateOnRefresh: true,
      onUpdate: self => applyRoad(self.progress),
      onRefresh: self => applyRoad(self.progress)
    });
    ScrollTrigger.addEventListener('refreshInit', layoutJourney);

    // tips: each photo opens from the bottom, the text follows
    ScrollTrigger.batch('.tip', {
      start: 'top 85%', once: true,
      onEnter: els => els.forEach((el, i) => {
        gsap.fromTo(el.querySelector('.tip-photo'), { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power3.inOut', delay: i * .12 });
        gsap.fromTo(el.querySelector('.tip-photo img'), { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'power3.out', delay: i * .12 });
        gsap.fromTo(el.querySelector('.tip-body'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .9, ease: 'power2.out', delay: .35 + i * .12 });
      })
    });

    // when: the photos move a little slower than the page, the text slides in beside them
    document.querySelectorAll('.season').forEach(el => {
      gsap.fromTo(el.querySelector('.season-photo img'), { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from(el.querySelector('.season-body'), { opacity: 0, y: 40, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 75%' } });
      gsap.fromTo(el.querySelector('.season-photo'), { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1.3, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 80%' } });
    });

    // routes: the cards come up one after another and their photos fan out
    ScrollTrigger.batch('.rcard', {
      start: 'top 85%', once: true,
      onEnter: els => els.forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: i * .12 });
        el.classList.add('open');
      })
    });

    gsap.from('.cta-btn', { opacity: 0, y: 20, duration: .9, ease: 'power2.out', scrollTrigger: { trigger: '.plan-cta', start: 'top 70%' } });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  addEventListener('langchange', () => {
    fill();
    if (animate) ScrollTrigger.refresh(); else layoutJourney();
  });
})();
