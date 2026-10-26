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

  const entries = (p.photos || []).map(photoEntry).filter(e => e.src);

  // every photo of the place, in the order of places.js; the viewer steps through all of them, the lead one included
  let items = entries.map((entry, i) => ({ src: entry.src, entry, btn: null, n: i + 1 })); // photos that are really shown, used by the viewer
  const dropItem = item => { items = items.filter(g => g !== item); };

  // The top of the page. A place has a hero only when places.js marks one (a landscape photo at least about 1600 px wide):
  // it fills the whole width and is cropped (object-fit: cover). Every other place gets a banner: the lead photo (the one
  // marked main, otherwise the first) blurred and darkened across the whole width, with the same photo sharp and whole on it,
  // never larger than it is. The lead photo is not repeated in the gallery.
  const hero = entries.find(e => e.hero);
  const lead = hero || entries.find(e => e.main) || entries[0] || {};
  const leadItem = items.find(it => it.entry === lead);
  const placeImg = $('place-img');
  $('place-hero').classList.toggle('is-banner', !hero);
  if (hero && hero.pos) placeImg.style.setProperty('--pos', hero.pos);
  if (hero && hero.posM) placeImg.style.setProperty('--pos-m', hero.posM);
  const onLeadFail = () => { if (leadItem) dropItem(leadItem); };
  if (hero || !lead.src) {
    placeImg.appendChild(photo(lead.src, name(), onLeadFail, true, { srcset: lead.srcset, sizes: '100vw' }));
  } else {
    const bg = document.createElement('div');
    bg.className = 'banner-bg';
    bg.style.backgroundImage = `url("${encodeURI(lead.src)}")`;
    const scrim = document.createElement('div');
    scrim.className = 'banner-scrim';
    const fg = document.createElement('div');
    fg.className = 'banner-fg';
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'banner-open';
    if (lead.caption) open.dataset.caption = lead.caption;
    leadItem.btn = open;
    open.addEventListener('click', () => openLightbox(leadItem));
    open.appendChild(photo(lead.src, name(), () => { onLeadFail(); open.replaceWith(placeholder(name())); }, true, { natural: true }));
    fg.appendChild(open);
    placeImg.append(bg, scrim, fg);
  }

  /* ---------- previous / next place ---------- */
  const n = PLACES.length;
  const prev = PLACES[(index - 1 + n) % n], next = PLACES[(index + 1) % n];
  $('pager-prev').href = `place.html?slug=${encodeURIComponent(prev.slug)}`;
  $('pager-next').href = `place.html?slug=${encodeURIComponent(next.slug)}`;

  /* ---------- gallery ---------- */
  // Masonry in CSS columns: every photo whole, in its own proportions. The photo at the top of the page is left out.
  const gallery = $('gallery');
  const shown = items.filter(it => it !== leadItem);
  gallery.hidden = !shown.length;
  gallery.classList.toggle('single', shown.length === 1);
  shown.forEach(item => {
    const entry = item.entry;
    const fig = document.createElement('figure');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gal-item';
    item.btn = btn;
    if (entry.caption) btn.dataset.caption = entry.caption;
    btn.appendChild(photo(entry.src, entry.caption || name(), () => {
      // missing file: show the placeholder and stop offering it in the viewer
      dropItem(item);
      btn.replaceWith(placeholder(name()));
    }, true, { srcset: entry.srcset, sizes: '(max-width: 768px) 100vw, 50vw', natural: true }));
    btn.addEventListener('click', () => openLightbox(item));
    fig.appendChild(btn);
    // a visible description under the photo, when places.js gives one (the same text in both languages)
    if (entry.caption) {
      const cap = document.createElement('figcaption');
      cap.textContent = entry.caption;
      fig.appendChild(cap);
    }
    gallery.appendChild(fig);
  });

  /* ---------- texts, again whenever the language changes ---------- */
  function render() {
    const nm = name();
    document.title = `${nm} · Sanski Most`;
    if (meta) meta.content = I18n.place(p, 'short');
    $('place-title').textContent = nm;
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

    items.forEach(it => { if (it.btn) it.btn.setAttribute('aria-label', I18n.t('place.photo', { name: it.entry.caption || nm, i: it.n, n: entries.length })); });
    document.querySelectorAll('.place-page img:not(#lb-img)').forEach(img => {
      const b = img.closest('.gal-item, .banner-open');
      img.alt = (b && b.dataset.caption) || nm;
    });
    if (!lb.hidden) { lbImg.alt = items[lbIndex].entry.caption || nm; showMeta(items[lbIndex].entry); }
    document.querySelectorAll('.place-page .ph').forEach(el => { el.textContent = nm; });
  }

  /* ---------- full-screen photo viewer ---------- */
  const lb = $('lightbox'), lbImg = $('lb-img'), lbCount = $('lb-count');
  const lbPrev = $('lb-prev'), lbNext = $('lb-next'), lbClose = $('lb-close'), lbCredit = $('lb-credit'), lbCaption = $('lb-caption');
  let lbIndex = 0, lbOpener = null;

  function showLb(i) {
    const m = items.length;
    if (!m) { closeLightbox(); return; }
    lbIndex = (i + m) % m;
    const e = items[lbIndex].entry;
    // a smaller file on phones when places.js gives a srcset; the photo is always shown whole (object-fit: contain)
    if (e.srcset) { lbImg.sizes = '100vw'; lbImg.srcset = e.srcset; } else lbImg.removeAttribute('srcset');
    lbImg.src = items[lbIndex].src;
    lbImg.alt = e.caption || name();
    lbCount.textContent = `${lbIndex + 1} / ${m}`;
    lbPrev.hidden = lbNext.hidden = m < 2;
    showMeta(e);
  }
  // under the photo: the description (caption) when there is one, and the credit line "Photo: author · license"
  // (the author, or "Source", links to sourceUrl); the credit line is left out when the photo has none
  function showMeta(e) {
    lbCaption.textContent = e.caption || '';
    lbCaption.hidden = !e.caption;
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
    lb.classList.toggle('has-meta', !!parts.length || !!e.caption);
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
