// Place page: reads ?slug=<slug> and fills place.html from places.js.
(() => {
  const { placeholder, photo, photoEntry } = window.PlacesLib;
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
    $('place-img').appendChild(placeholder('Sanski Most'));
    document.querySelector('.place-pager').hidden = true;
    $('gallery').hidden = true;
    return;
  }

  const p = PLACES[index];
  const name = () => I18n.place(p, 'name');

  $('place-img').appendChild(photo(photoEntry(p.photos && p.photos[0]).src, name(), null, true));

  /* ---------- previous / next place ---------- */
  const n = PLACES.length;
  const prev = PLACES[(index - 1 + n) % n], next = PLACES[(index + 1) % n];
  $('pager-prev').href = `place.html?slug=${encodeURIComponent(prev.slug)}`;
  $('pager-next').href = `place.html?slug=${encodeURIComponent(next.slug)}`;

  /* ---------- gallery ---------- */
  const gallery = $('gallery');
  let items = []; // photos that are really shown (not placeholders), used by the viewer
  const list = (p.photos || []).map(photoEntry).filter(e => e.src);
  gallery.classList.toggle('single', list.length <= 1);
  (list.length ? list : [null]).forEach((entry, i) => {
    const fig = document.createElement('figure');
    if (!entry) { fig.appendChild(placeholder(name())); gallery.appendChild(fig); return; }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gal-item';
    const item = { src: entry.src, entry, btn, n: i + 1 };
    btn.appendChild(photo(entry.src, name(), () => {
      // missing file: show the placeholder and stop offering it in the viewer
      items = items.filter(g => g !== item);
      btn.replaceWith(placeholder(name()));
    }));
    btn.addEventListener('click', () => openLightbox(item));
    items.push(item);
    fig.appendChild(btn);
    gallery.appendChild(fig);
  });

  /* ---------- texts, again whenever the language changes ---------- */
  function render() {
    const nm = name();
    document.title = `${nm} · Sanski Most`;
    if (meta) meta.content = I18n.place(p, 'short');
    $('place-title').textContent = nm;
    $('place-long').textContent = I18n.place(p, 'long');
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

    items.forEach(it => it.btn.setAttribute('aria-label', I18n.t('place.photo', { name: nm, i: it.n, n: list.length })));
    document.querySelectorAll('.place-page img:not(#lb-img)').forEach(img => { img.alt = nm; });
    if (!lb.hidden) { lbImg.alt = nm; showCredit(items[lbIndex].entry); }
    document.querySelectorAll('.place-page .ph').forEach(el => { el.textContent = nm; });
  }

  /* ---------- full-screen photo viewer ---------- */
  const lb = $('lightbox'), lbImg = $('lb-img'), lbCount = $('lb-count');
  const lbPrev = $('lb-prev'), lbNext = $('lb-next'), lbClose = $('lb-close'), lbCredit = $('lb-credit');
  let lbIndex = 0, lbOpener = null;

  function showLb(i) {
    const m = items.length;
    if (!m) { closeLightbox(); return; }
    lbIndex = (i + m) % m;
    lbImg.src = items[lbIndex].src;
    lbImg.alt = name();
    lbCount.textContent = `${lbIndex + 1} / ${m}`;
    lbPrev.hidden = lbNext.hidden = m < 2;
    showCredit(items[lbIndex].entry);
  }
  // small credit line under the photo: "Photo: author · license", the author (or "Source") links to sourceUrl
  function showCredit(e) {
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
    lb.classList.toggle('has-credit', !!parts.length);
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
