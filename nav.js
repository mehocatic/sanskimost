// Main menu on every page: hides while scrolling down, comes back when scrolling up.
// On the home page (data-hero="#scene") it also stays hidden while the hero is on screen,
// and appears once the visitor leaves it.
(() => {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  const hero = nav.dataset.hero ? document.querySelector(nav.dataset.hero) : null;

  const DELTA = 8;      // px of scroll in one direction before the menu reacts
  let lastY = scrollY;
  let inHero = null;
  let graceUntil = 0;   // after leaving the hero the menu stays while scrolling down until this point
  let hidden = nav.classList.contains('nav-hidden');

  const set = h => { if (h !== hidden) { hidden = h; nav.classList.toggle('nav-hidden', h); } };

  function update() {
    const y = scrollY;
    if (hero) {
      const on = hero.getBoundingClientRect().bottom > innerHeight * .25;
      if (on) { inHero = true; set(true); lastY = y; return; }
      if (inHero !== false) {
        inHero = false;
        graceUntil = y + innerHeight * .5;
        set(false); lastY = y; return;
      }
    }
    const dy = y - lastY;
    if (Math.abs(dy) < DELTA) return;
    if (dy < 0 || y < 60) set(false);
    else if (y > graceUntil) set(true);
    lastY = y;
  }

  let raf = 0;
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); }, { passive: true });
  addEventListener('resize', update);
  update();
})();
