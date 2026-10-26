// Language switch (EN | BS) for every page. Texts: i18n/en.js and i18n/bs.js; a text missing in bs shows the English one.
// Elements are marked in the HTML:
//   data-i18n="key"             textContent
//   data-i18n-html="key"        innerHTML (keys ending in .html)
//   data-i18n-attr="attr:key"   attributes, several separated by ";"
//   data-i18n-place="slug"      that place's name
// Page scripts re-render their own texts on the "langchange" event ("beforelangchange" fires first).
// The choice is kept in localStorage when it is available; without it the page still works, in Bosnian (the default language).
window.I18n = (() => {
  const LANGS = ['en', 'bs'];
  const KEY = 'lang';
  let lang = 'bs';
  try { const saved = localStorage.getItem(KEY); if (LANGS.includes(saved)) lang = saved; } catch (e) { /* no storage */ }

  const dict = l => (window.I18N && window.I18N[l]) || {};

  function t(key, vars) {
    let s = dict(lang)[key];
    if (s == null || s === '') s = dict('en')[key];
    if (s == null) return '';
    return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s;
  }

  // the texts of one place (name, short, long, note, see) in a language: `places` in i18n/en.js and i18n/bs.js
  const texts = (l, p) => (dict(l).places && dict(l).places[p.slug]) || {};

  // text of a place field (name, short, long, note) in the current language, English otherwise
  function place(p, field) {
    const v = texts(lang, p)[field];
    if (v != null && v !== '') return v;
    const e = texts('en', p)[field];
    return e != null ? e : '';
  }

  // "Also worth seeing" entries as { text, slug? }; the texts are in the language files,
  // places.js only says which of them link to another place (p.see[i] = slug, or null)
  function see(p) {
    const own = texts(lang, p).see || [];
    return (texts('en', p).see || []).map((en, i) => ({ slug: (p.see && p.see[i]) || undefined, text: own[i] || en }));
  }

  function apply(root) {
    root = root || document;
    document.documentElement.lang = lang;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
    if (typeof PLACES !== 'undefined') {
      root.querySelectorAll('[data-i18n-place]').forEach(el => {
        const p = PLACES.find(q => q.slug === el.dataset.i18nPlace);
        if (p) el.textContent = place(p, 'name');
      });
    }
    document.querySelectorAll('.lang-switch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }

  function set(l) {
    if (!LANGS.includes(l) || l === lang) return;
    dispatchEvent(new Event('beforelangchange'));
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) { /* the choice just is not remembered */ }
    apply();
    dispatchEvent(new Event('langchange'));
  }

  // EN | BS in the main menu
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const box = document.createElement('div');
    box.className = 'lang-switch';
    box.setAttribute('role', 'group');
    box.dataset.i18nAttr = 'aria-label:nav.lang';
    [['en', 'EN', 'English'], ['bs', 'BS', 'Bosanski']].forEach(([code, label, full], i) => {
      if (i) {
        const sep = document.createElement('span');
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '|';
        box.appendChild(sep);
      }
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.lang = code;
      b.lang = code;
      b.textContent = label;
      b.setAttribute('aria-label', full);
      b.addEventListener('click', () => set(code));
      box.appendChild(b);
    });
    nav.appendChild(box);
  }

  apply();
  return { t, place, see, set, apply, get lang() { return lang; } };
})();
