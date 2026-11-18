// People page (licnosti.html): cards built from licnosti-data.js, filtered by field.
// Texts come from the data file (bs/en pairs); only the page chrome uses i18n keys. Re-rendered on "langchange".
(() => {
  const L = () => (window.I18n && I18n.lang) || 'bs';
  const t = (k, v) => (window.I18n ? I18n.t(k, v) : k);
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
    tag.textContent = t(p.kind === 'born' ? 'lic.born' : 'lic.origin');

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

  render();
  addEventListener('langchange', render);
})();
