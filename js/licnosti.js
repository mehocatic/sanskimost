// Golden Lilies page (licnosti.html). Built from ZLJILJANI in licnosti-data.js:
//  - the recipients as a memorial roll (each row opens with <details>, no JS needed for that),
//  - the count and the source under the title,
//  - the lily is drawn when it comes into view.
// The people of Sanski Most are in the corridor (hodnik.html); an old link to licnosti#<id> goes there.
(() => {
  const L = () => (window.I18n && I18n.lang) || 'bs';
  const t = (k, v) => (window.I18n ? I18n.t(k, v) : k);
  const tx = o => o && o.key ? t(o.key) : (o && (o[L()] || o.en)) || '';
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const zlj = window.ZLJILJANI || [];
  const people = window.LICNOSTI || [];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // a link to a person on the old People page: that person is now in the corridor
  const h = decodeURIComponent(location.hash.slice(1));
  if (h && people.some(p => p.id === h)) { location.replace('hodnik#' + encodeURIComponent(h)); return; }

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
    const a = $('zlj-src');
    if (window.ZLJILJANI_SRC) { a.href = window.ZLJILJANI_SRC; a.textContent = t('lic.source') + ': Wikipedia'; }
    else a.hidden = true;
  }

  // reveal on scroll, lily drawn when its section comes in
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

  renderZlj();
  reveal();
  addEventListener('langchange', () => {
    renderZlj();
    document.querySelectorAll('.rv').forEach(e => e.classList.add('in')); // no second fade after a language switch
  });
})();
