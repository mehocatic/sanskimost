// Main menu on every page.
//  - The bar takes its colours from what is under it: clear over a photo header, dark over dark sections, light over light ones.
//  - On phones the pages are behind a Menu button that opens them as a full-screen list.
(() => {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  const toggle = nav.querySelector('.nav-toggle');
  const CLEAR = '#scene, .plan-water, .place-head.has-hero'; // photo headers (and the water of the Visit page): the bar has no background over them
  const TONED = '.on-deep, .on-paper, .on-mist';

  // what lies under the middle of the bar: 'clear', 'dark' or 'light'
  function tone() {
    const els = document.elementsFromPoint(innerWidth / 2, nav.offsetHeight / 2);
    for (const el of els) {
      if (el === nav || nav.contains(el)) continue;
      if (el.closest(CLEAR)) return 'clear';
      const sec = el.closest(TONED);
      if (sec) return sec.classList.contains('on-deep') ? 'dark' : 'light';
    }
    return 'dark';
  }
  function update() {
    const t = tone();
    nav.classList.toggle('nav-light', t === 'light');
    nav.classList.toggle('nav-dark', t === 'dark');
  }

  let raf = 0;
  const queue = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  addEventListener('load', update);
  update();

  // phone menu
  if (!toggle) return;
  function setOpen(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (window.lenis) { if (open) window.lenis.stop(); else window.lenis.start(); }
  }
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); } });
  // back on a wide screen the list is the row of links again
  matchMedia('(min-width: 769px)').addEventListener('change', e => { if (e.matches) setOpen(false); });
})();
