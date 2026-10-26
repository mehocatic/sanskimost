// Place page: reads ?slug=<slug> and fills place.html from places.js.
(() => {
  const { photo, photoEntry } = window.PlacesLib;
  const $ = id => document.getElementById(id);

  const slug = new URLSearchParams(location.search).get('slug');
  const index = PLACES.findIndex(p => p.slug === slug);
  const back = $('back');

  // Back goes to where the visitor came from (keeps the carousel position); a direct visit goes to the list
  back.addEventListener('click', e => {
    try {
      if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) {
        e.preventDefault();
        history.back();
      }
    } catch (err) { /* fall through to the link */ }
  });

  const meta = document.querySelector('meta[name="description"]');

  if (index < 0) {
    const notFound = () => {
      document.title = `${I18n.t('place.notfound')} · Sanski Most`;
      if (meta) meta.content = I18n.t('place.meta');
      $('place-title').textContent = I18n.t('place.notfound');
      $('place-long').textContent = I18n.t('place.notfound.text');
    };
    notFound();
    window.addEventListener('langchange', notFound);
    document.querySelector('.place-pager').hidden = true;
    return;
  }

  const p = PLACES[index];
  const name = () => I18n.place(p, 'name');

  const entries = (p.photos || []).map(photoEntry).filter(e => e.src);

  // The same layout for every place: a low header, a horizontal slider of all the photos, then the text.
  // The photo shown at the top of the page comes first: the one marked hero or main in places.js, otherwise the first one.
  const lead = entries.find(e => e.hero) || entries.find(e => e.main) || entries[0];
  const ordered = lead ? [lead, ...entries.filter(e => e !== lead)] : [];
  let items = ordered.map((entry, i) => ({ src: entry.src, entry, btn: null, n: i + 1 })); // photos that are really shown, used by the viewer
  const dropItem = item => { items = items.filter(g => g !== item); };

  /* ---------- photo slider ---------- */
  // Every photo keeps its own proportions at a fixed row height (CSS); a photo is never enlarged beyond its own size, because
  // the img has width and height auto and only a maximum height. A place with one photo has no arrows and no counter; a place
  // without photos has no slider.
  const slider = $('slider'), track = $('slider-track'), bar = $('slider-bar');
  const sPrev = $('slider-prev'), sNext = $('slider-next'), sCount = $('slider-count');
  const phone = window.matchMedia('(max-width: 768px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // a file listed with a srcset: the smaller one on phones, the larger one elsewhere (the file itself is never scaled up)
  function pickSrc(entry) {
    if (!entry.srcset) return entry.src;
    const c = entry.srcset.split(',').map(x => x.trim().split(/\s+/)).filter(x => x[0]).map(x => ({ url: x[0], w: parseInt(x[1], 10) || 0 }));
    if (!c.length) return entry.src;
    c.sort((x, y) => x.w - y.w);
    return (phone.matches ? c[0] : c[c.length - 1]).url;
  }

  items.forEach(item => {
    const entry = item.entry;
    const fig = document.createElement('figure');
    fig.className = 'slide';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slide-open';
    item.btn = btn;
    if (entry.alt) btn.dataset.alt = entry.alt;
    btn.appendChild(photo(pickSrc(entry), entry.alt || name(), () => {
      // missing file: take the slide out and stop offering it in the viewer
      dropItem(item);
      fig.remove();
      sync();
    }, true, { natural: true }));
    btn.addEventListener('click', () => openLightbox(item));
    fig.appendChild(btn);
    track.appendChild(fig);
  });

  const slides = () => [...track.children];
  const pad = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
  const target = s => s.offsetLeft - pad(); // scrollLeft that puts the slide at the start edge
  const maxScroll = () => track.scrollWidth - track.clientWidth;

  function goTo(left) {
    track.scrollTo({ left, behavior: reduced.matches ? 'auto' : 'smooth' });
  }
  function step(dir) {
    const x = track.scrollLeft, list = slides();
    if (dir > 0) {
      const s = list.find(el => target(el) > x + 2);
      goTo(s ? target(s) : maxScroll());
    } else {
      const s = list.filter(el => target(el) < x - 2).pop();
      goTo(s ? target(s) : 0);
    }
  }

  // counter and arrows
  function sync() {
    const list = slides();
    const many = list.length > 1 && maxScroll() > 2; // nothing to scroll to when every photo fits in the row
    slider.hidden = !list.length;
    sCount.hidden = sPrev.hidden = sNext.hidden = !many;
    if (!list.length) return;
    const x = track.scrollLeft, atEnd = x >= maxScroll() - 2;
    let cur = 0;
    if (atEnd && many) cur = list.length - 1;
    else list.forEach((el, i) => { if (Math.abs(target(el) - x) < Math.abs(target(list[cur]) - x)) cur = i; });
    sCount.textContent = `${cur + 1} / ${list.length}`;
    sPrev.disabled = x <= 2;
    sNext.disabled = atEnd;
    bar.hidden = !many;
  }
  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; sync(); });
  }, { passive: true });
  track.addEventListener('load', sync, true); // widths change as the photos arrive
  window.addEventListener('resize', sync);
  sPrev.addEventListener('click', () => step(-1));
  sNext.addEventListener('click', () => step(1));
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  sync();

  /* ---------- previous / next place ---------- */
  const n = PLACES.length;
  const prev = PLACES[(index - 1 + n) % n], next = PLACES[(index + 1) % n];
  $('pager-prev').href = `place.html?slug=${encodeURIComponent(prev.slug)}`;
  $('pager-next').href = `place.html?slug=${encodeURIComponent(next.slug)}`;

  /* ---------- texts, again whenever the language changes ---------- */
  function render() {
    const nm = name();
    document.title = `${nm} · Sanski Most`;
    if (meta) meta.content = I18n.place(p, 'short');
    $('place-title').textContent = nm;
    track.setAttribute('aria-label', nm);
    // paragraphs are separated by a blank line in the language files
    $('place-long').replaceChildren(...I18n.place(p, 'long').split('\n\n').map(text => {
      const para = document.createElement('p');
      para.textContent = text;
      return para;
    }));
    $('place-note').textContent = I18n.place(p, 'note') || '';

    const seeList = $('place-see-list');
    const see = I18n.see(p);
    seeList.replaceChildren(...see.map(s => {
      const li = document.createElement('li');
      if (!s.slug) li.textContent = s.text;
      else {
        // { slug, text }: the text links to that place
        const a = document.createElement('a');
        a.href = `place.html?slug=${encodeURIComponent(s.slug)}`;
        a.textContent = s.text;
        li.appendChild(a);
      }
      return li;
    }));
    $('place-see').hidden = !see.length;

    $('pager-prev').querySelector('.pn').textContent = I18n.place(prev, 'name');
    $('pager-next').querySelector('.pn').textContent = I18n.place(next, 'name');

    items.forEach(it => { if (it.btn) it.btn.setAttribute('aria-label', I18n.t('place.photo', { name: it.entry.alt || nm, i: it.n, n: entries.length })); });
    document.querySelectorAll('.place-page img:not(#lb-img)').forEach(img => {
      const b = img.closest('.slide-open');
      img.alt = (b && b.dataset.alt) || nm;
    });
    if (!lb.hidden) { lbImg.alt = items[lbIndex].entry.alt || nm; showMeta(items[lbIndex].entry); }
  }

  /* ---------- full-screen photo viewer ---------- */
  const lb = $('lightbox'), lbImg = $('lb-img'), lbCount = $('lb-count');
  const lbPrev = $('lb-prev'), lbNext = $('lb-next'), lbClose = $('lb-close'), lbCredit = $('lb-credit');
  let lbIndex = 0, lbOpener = null;

  function showLb(i) {
    const m = items.length;
    if (!m) { closeLightbox(); return; }
    lbIndex = (i + m) % m;
    const e = items[lbIndex].entry;
    // a smaller file on phones when places.js gives a srcset; the photo is always shown whole (object-fit: contain)
    if (e.srcset) { lbImg.sizes = '100vw'; lbImg.srcset = e.srcset; } else lbImg.removeAttribute('srcset');
    lbImg.src = items[lbIndex].src;
    lbImg.alt = e.alt || name();
    lbCount.textContent = `${lbIndex + 1} / ${m}`;
    lbPrev.hidden = lbNext.hidden = m < 2;
    showMeta(e);
  }
  // under the photo: the credit line "Photo: author · license" (the author, or "Source", links to sourceUrl);
  // it is left out when the photo has none
  function showMeta(e) {
    const url = /^https?:\/\//i.test(e.sourceUrl || '') ? e.sourceUrl : '';
    const parts = [];
    const link = text => {
      const a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = text;
      return a;
    };
    if (e.author) parts.push(url ? link(e.author) : e.author);
    else if (url) parts.push(link(I18n.t('lb.source')));
    if (e.license) parts.push(e.license);
    lbCredit.replaceChildren();
    if (parts.length) {
      lbCredit.append(`${I18n.t('lb.photo')}: `);
      parts.forEach((x, k) => lbCredit.append(...(k ? [' · ', x] : [x])));
    }
    lbCredit.hidden = !parts.length;
    lb.classList.toggle('has-meta', !!parts.length);
  }
  function openLightbox(item) {
    lbOpener = item.btn;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    showLb(items.indexOf(item));
    lbClose.focus();
  }
  function closeLightbox() {
    if (lb.hidden) return;
    lb.hidden = true;
    document.body.style.overflow = '';
    lbImg.removeAttribute('srcset');
    lbImg.removeAttribute('src');
    if (lbOpener && lbOpener.isConnected) lbOpener.focus({ preventScroll: true });
  }
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => showLb(lbIndex - 1));
  lbNext.addEventListener('click', () => showLb(lbIndex + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  let touchX = null;
  lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
  });

  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
    else if (e.key === 'ArrowRight') showLb(lbIndex + 1);
    else if (e.key === 'Tab') { // keep focus inside the viewer
      const f = [...lb.querySelectorAll('button:not([hidden]), .lb-credit:not([hidden]) a')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  render();
  window.addEventListener('langchange', render);
})();
