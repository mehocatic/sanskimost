// History page: builds the bar of chapters from the sections (section.ch) and marks the chapter being read.
(() => {
  const list = document.getElementById('chap-list');
  const chapters = [...document.querySelectorAll('section.ch[id]')];
  if (!list || !chapters.length) return;
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  const links = chapters.map((sec, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${sec.id}`;
    const num = document.createElement('b');
    num.textContent = ROMAN[i] || String(i + 1);
    const label = document.createElement('span');
    label.dataset.i18n = sec.dataset.chip; // the chapter's short name, the same key as in its own heading line
    a.append(num, label);
    li.appendChild(a);
    list.appendChild(li);
    return a;
  });
  I18n.apply(list);

  // the current chapter: the last one whose top has passed a line a little under the bars
  let current = -1;
  function mark() {
    const line = 160;
    let i = 0;
    chapters.forEach((sec, k) => { if (sec.getBoundingClientRect().top <= line) i = k; });
    if (chapters[0].getBoundingClientRect().top > line) i = -1;
    if (i === current) return;
    current = i;
    links.forEach((a, k) => a.setAttribute('aria-current', String(k === i)));
    // keep the current chip in view in the bar, without moving the page
    const a = links[i];
    if (a) {
      const ol = list, x = a.offsetLeft - ol.clientWidth / 2 + a.offsetWidth / 2;
      ol.scrollTo({ left: Math.max(0, x), behavior: 'smooth' });
    }
  }
  let raf = 0;
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; mark(); }); }, { passive: true });
  addEventListener('resize', mark);
  mark();
})();
