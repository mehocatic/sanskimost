// "Then and now": an old and a new photo of the same place on top of each other, split by a handle.
// Dragging (mouse or finger) or the arrow keys move the split. Markup, in the HTML or built by a page script:
//   <figure class="tn">
//     <div class="tn-box" style="--ar: 4/5">
//       <img class="tn-new" src="..." alt="..."> <img class="tn-old" src="..." alt="...">
//       <span class="tn-lb tn-l">Then</span> <span class="tn-lb tn-r">Now</span>
//     </div>
//     <figcaption>...</figcaption>
//   </figure>
// ThenNow.enhance(figure) adds the handle; every .tn on the page is enhanced on load.
window.ThenNow = (() => {
  const t = k => (window.I18n ? I18n.t(k) : '');

  function enhance(fig) {
    const box = fig.querySelector('.tn-box');
    if (!box || box.dataset.ready) return;
    box.dataset.ready = '1';

    const line = document.createElement('span');
    line.className = 'tn-line';
    const knob = document.createElement('span');
    knob.className = 'tn-knob';
    knob.setAttribute('aria-hidden', 'true');
    knob.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 6 3 12l6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
    // the range is only for the keyboard and screen readers; the pointer is handled on the whole box
    const range = document.createElement('input');
    range.type = 'range';
    range.className = 'tn-range';
    range.min = 0; range.max = 100; range.value = 50;
    box.append(line, knob, range);

    const set = p => {
      p = Math.max(0, Math.min(100, p));
      box.style.setProperty('--p', `${p}%`);
      range.value = Math.round(p);
    };
    const fromEvent = e => {
      const r = box.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };
    range.addEventListener('input', () => set(+range.value));

    // touch-action: pan-y (CSS) keeps a vertical swipe for scrolling the page; a sideways drag moves the split
    let dragging = false;
    box.addEventListener('pointerdown', e => {
      if (e.button) return;
      dragging = true;
      box.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    box.addEventListener('pointermove', e => { if (dragging) fromEvent(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => box.addEventListener(type, () => { dragging = false; }));

    const label = () => range.setAttribute('aria-label', fig.dataset.label || t('tn.label'));
    label();
    window.addEventListener('langchange', label);
    set(50);
  }

  const enhanceAll = root => (root || document).querySelectorAll('.tn').forEach(enhance);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => enhanceAll());
  else enhanceAll();
  return { enhance, enhanceAll };
})();
