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

  function render() {
    grid.textContent = '';
    const list = data;
    list.forEach(p => grid.appendChild(card(p)));
    count.textContent = t('lic.count', { n: list.length });
  }

  // Golden Lily recipients: a featured block above the filtered list.
  const zlist = document.getElementById('zlj-list');
  const zcount = document.getElementById('zlj-count');
  const zdata = window.ZLJILJANI || [];

  function zcard(z, i) {
    const li = document.createElement('li');
    li.className = 'zlj-card' + (z.post ? ' is-post' : '');
    li.style.setProperty('--i', i);
    const rows = [
      ['zlj-year', String(z.year)],
      ['zlj-name', z.name],
      ['zlj-born', z.born[L()] || z.born.en],
      ['zlj-unit', z.unit[L()] || z.unit.en]
    ];
    rows.forEach(([c, v]) => {
      const e = document.createElement(c === 'zlj-name' ? 'h3' : 'p');
      e.className = c;
      e.textContent = v;
      li.appendChild(e);
    });
    if (z.post) {
      const b = document.createElement('p');
      b.className = 'zlj-post';
      b.textContent = t('lic.zlj.post');
      li.insertBefore(b, li.children[1]);
    }
    if (z.note) {
      const n = document.createElement('p');
      n.className = 'zlj-note';
      n.textContent = z.note[L()] || z.note.en;
      li.appendChild(n);
    }
    return li;
  }

  function renderZlj() {
    zlist.textContent = '';
    zdata.forEach((z, i) => zlist.appendChild(zcard(z, i)));
    zcount.textContent = t('lic.zlj.count', { n: zdata.length });
  }

  // Cards fade in once, when they scroll into view (skipped with reduced motion or without IntersectionObserver).
  function reveal() {
    const cards = zlist.querySelectorAll('.zlj-card');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    zlist.classList.add('js-reveal');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .25 });
    cards.forEach(c => io.observe(c));
  }

  render();
  renderZlj();
  reveal();
  addEventListener('langchange', () => { render(); renderZlj(); zlist.classList.remove('js-reveal'); });
})();
