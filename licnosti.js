// People page (licnosti.html). Everything is built from licnosti-data.js:
//  - a header with a slowly moving wall of all names and three counts,
//  - the Golden Lily recipients as a memorial roll (each row opens with <details>, no JS needed for that),
//  - a few highlights with one figure each,
//  - everyone else as an index grouped by field, each name opens a detail panel (<dialog>).
// Texts are bs/en pairs in the data; only the page chrome uses i18n keys. Everything re-renders on "langchange".
(() => {
  const L = () => (window.I18n && I18n.lang) || 'bs';
  const t = (k, v) => (window.I18n ? I18n.t(k, v) : k);
  const tx = o => (o && (o[L()] || o.en)) || '';
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const data = window.LICNOSTI || [];
  const cats = window.LICNOSTI_CATS || [];
  const feat = window.LICNOSTI_FEAT || [];
  const zlj = window.ZLJILJANI || [];
  const byId = Object.fromEntries(data.map(p => [p.id, p]));
  const catOf = id => cats.find(c => c.id === id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const initials = n => n.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('');

  // ---- header: wall of names (decorative, aria-hidden) and counts
  function wall() {
    const box = $('lic-wall');
    box.textContent = '';
    const names = data.map(p => p.name).concat(zlj.map(z => z.name));
    for (let r = 0; r < 4; r++) {
      // each row starts at a different point of the list, so rows do not repeat each other
      const rot = names.slice((r * 13) % names.length).concat(names.slice(0, (r * 13) % names.length));
      const row = el('div', 'lh-row');
      row.style.setProperty('--dur', (90 + r * 18) + 's');
      if (r % 2) row.classList.add('rev');
      const track = el('div', 'lh-track');
      // two copies so the loop is seamless at -50%
      for (let k = 0; k < 2; k++) rot.forEach((n, i) => track.appendChild(el('span', i % 7 === r ? 'hi' : '', n)));
      row.appendChild(track);
      box.appendChild(row);
    }
  }
  function stats() {
    $('st-p').textContent = data.length;
    $('st-z').textContent = zlj.length;
    $('st-f').textContent = new Set(data.map(p => p.cat)).size;
  }

  // ---- Golden Lily roll
  function renderZlj() {
    const ol = $('zlj-list');
    ol.textContent = '';
    zlj.forEach((z, i) => {
      const li = el('li', 'zr rv');
      li.style.setProperty('--i', i);
      const d = el('details');
      const s = el('summary');
      const mid = el('span', 'zr-mid');
      mid.appendChild(el('span', 'zr-name', z.name));
      const meta = el('span', 'zr-meta', tx(z.born).split(',')[0]);
      if (z.post) meta.appendChild(el('span', 'zr-post', t('lic.zlj.post')));
      mid.appendChild(meta);
      s.append(el('span', 'zr-year', String(z.year)), mid, el('span', 'zr-icon'));
      const more = el('div', 'zr-more');
      const dl = el('dl');
      [['lic.zlj.born', tx(z.born)], ['lic.zlj.unit', tx(z.unit)]].forEach(([k, v]) => {
        const row = el('div');
        row.append(el('dt', null, t(k)), el('dd', null, v));
        dl.appendChild(row);
      });
      more.appendChild(dl);
      if (z.note) more.appendChild(el('p', 'zr-note', tx(z.note)));
      d.append(s, more);
      li.appendChild(d);
      ol.appendChild(li);
    });
    $('zlj-count').textContent = t('lic.zlj.count', { n: zlj.length });
  }

  // ---- highlights
  function renderFeat() {
    const ul = $('lic-feat');
    ul.textContent = '';
    feat.forEach((f, i) => {
      const p = byId[f.id];
      if (!p) return;
      const li = el('li', 'rv');
      li.style.setProperty('--i', i);
      const b = el('button', 'lf');
      b.type = 'button';
      b.setAttribute('aria-haspopup', 'dialog');
      b.append(el('span', 'lf-n', f.n), el('span', 'lf-l', tx(f)), el('span', 'lf-name', p.name), el('span', 'lf-role', tx(p.role)));
      b.addEventListener('click', () => open(p.id));
      li.appendChild(b);
      ul.appendChild(li);
    });
  }

  // ---- index by field
  let order = [];
  function renderIdx() {
    const box = $('lic-idx');
    box.textContent = '';
    order = [];
    let n = 0;
    cats.forEach(c => {
      const list = data.filter(p => p.cat === c.id);
      if (!list.length) return;
      n++;
      const sec = el('section', 'ch');
      sec.setAttribute('aria-labelledby', 'ch-' + c.id);
      const head = el('header', 'ch-head');
      const h = el('h3', 'ch-title', tx(c));
      h.id = 'ch-' + c.id;
      head.append(el('span', 'ch-n', String(n).padStart(2, '0')), h, el('span', 'ch-count', t('lic.count', { n: list.length })));
      const ul = el('ul', 'ch-list');
      list.forEach(p => {
        order.push(p.id);
        const li = el('li');
        const b = el('button', 'pr');
        b.type = 'button';
        b.setAttribute('aria-haspopup', 'dialog');
        const meta = el('span', 'pr-meta');
        meta.append(el('span', 'pr-role', tx(p.role)), el('span', 'pr-tag ' + p.kind, t('lic.' + p.kind)));
        b.append(el('span', 'pr-name', p.name), meta, el('span', 'pr-arrow'));
        b.addEventListener('click', () => open(p.id));
        li.appendChild(b);
        ul.appendChild(li);
      });
      sec.append(head, ul);
      box.appendChild(sec);
    });
    $('lic-count').textContent = t('lic.count', { n: data.length });
  }

  // ---- detail panel
  const dlg = $('lic-dlg');
  let cur = null;
  function fill(id) {
    const p = byId[id];
    if (!p) return;
    cur = id;
    const fig = $('dlg-fig');
    if (p.photo && p.photo.src) {
      $('dlg-img').src = p.photo.src;
      $('dlg-img').alt = p.name;
      $('dlg-cap').textContent = p.photo.credit || '';
      fig.hidden = false;
    } else {
      fig.hidden = true;
      $('dlg-img').removeAttribute('src');
    }
    $('dlg-mono').textContent = initials(p.name);
    $('dlg-cat').textContent = tx(catOf(p.cat));
    $('dlg-name').textContent = p.name;
    $('dlg-role').textContent = tx(p.role);
    const tag = $('dlg-tag');
    tag.className = 'dlg-tag ' + p.kind;
    tag.textContent = t('lic.' + p.kind);
    $('dlg-text').textContent = tx(p.text);
    const a = $('dlg-src');
    a.href = p.src.url;
    if (p.src.internal) { a.removeAttribute('target'); a.removeAttribute('rel'); }
    else { a.target = '_blank'; a.rel = 'noopener'; }
    a.textContent = (p.src.internal ? '' : t('lic.source') + ': ') + p.src.label;
    dlg.querySelector('.dlg-in').scrollTop = 0;
  }
  function open(id) {
    fill(id);
    if (!dlg.open) {
      dlg.showModal();
      document.documentElement.classList.add('dlg-open');
    }
    history.replaceState(null, '', '#' + id);
  }
  function step(d) {
    const i = order.indexOf(cur);
    if (i < 0) return;
    fill(order[(i + d + order.length) % order.length]);
    history.replaceState(null, '', '#' + cur);
  }
  $('dlg-x').addEventListener('click', () => dlg.close());
  $('dlg-prev').addEventListener('click', () => step(-1));
  $('dlg-next').addEventListener('click', () => step(1));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // click on the backdrop
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  dlg.addEventListener('close', () => {
    document.documentElement.classList.remove('dlg-open');
    cur = null;
    history.replaceState(null, '', location.pathname + location.search);
  });

  // ---- reveal on scroll, lily drawn when its section comes in
  function reveal() {
    const items = document.querySelectorAll('.rv:not(.in)');
    const lily = $('zlj-lily');
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(e => e.classList.add('in'));
      lily.classList.add('is-drawn');
      return;
    }
    document.documentElement.classList.add('js-rv');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add(e.target === lily ? 'is-drawn' : 'in');
      io.unobserve(e.target);
    }), { threshold: .2, rootMargin: '0px 0px -8% 0px' });
    items.forEach(e => io.observe(e));
    if (!lily.classList.contains('is-drawn')) io.observe(lily);
  }

  function renderAll() {
    wall();
    stats();
    renderZlj();
    renderFeat();
    renderIdx();
    if (cur) fill(cur);
    reveal();
  }
  renderAll();
  addEventListener('langchange', () => {
    renderAll();
    document.querySelectorAll('.rv').forEach(e => e.classList.add('in')); // no second fade after a language switch
  });

  // a link to #<id> opens that person
  const h = decodeURIComponent(location.hash.slice(1));
  if (byId[h]) open(h);
})();
