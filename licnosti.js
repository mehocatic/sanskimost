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
  const grid = document.getElementById('lic-grid');
  const count = document.getElementById('lic-count');

  const initials = n => n.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('');

  function card(p) {
    const li = document.createElement('li');
    li.className = 'lic-card';
    li.dataset.cat = p.cat;

    const mono = document.createElement('span');
    mono.className = 'lic-mono';
    mono.setAttribute('aria-hidden', 'true');
    mono.textContent = initials(p.name);

    const h = document.createElement('h3');
    h.textContent = p.name;

    const role = document.createElement('p');
    role.className = 'lic-role';
    role.textContent = p.role[L()] || p.role.en;

    const tag = document.createElement('p');
    tag.className = 'lic-tag ' + p.kind;
    tag.textContent = t('lic.' + p.kind);

    const txt = document.createElement('p');
    txt.className = 'lic-text';
    txt.textContent = p.text[L()] || p.text.en;

    const a = document.createElement('a');
    a.className = 'lic-src';
    a.href = p.src.url;
    if (!p.src.internal) { a.target = '_blank'; a.rel = 'noopener'; }
    a.textContent = (p.src.internal ? '' : t('lic.source') + ': ') + p.src.label;

    li.append(mono, h, role, tag, txt, a);
    return li;
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
