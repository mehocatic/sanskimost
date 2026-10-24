// Optional ambient river sound, off by default (browsers block autoplay anyway).
// To turn it on: put the file at sounds/river.mp3 and set ENABLED to true. Until then no button is shown
// and nothing is requested, so there is no 404 in the console.
(() => {
  const SRC = 'sounds/river.mp3';
  const ENABLED = false;

  if (ENABLED) init();

  function init() {
    const audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sound-btn';
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = '<b></b> <span></span>';
    const label = () => {
      btn.querySelector('b').textContent = I18n.t('sound.label');
      btn.querySelector('span').textContent = I18n.t(btn.getAttribute('aria-pressed') === 'true' ? 'sound.on' : 'sound.off');
    };
    label();
    window.addEventListener('langchange', label);
    document.body.appendChild(btn);

    let fade = 0;
    const ramp = to => {
      cancelAnimationFrame(fade);
      const step = () => {
        const d = to - audio.volume;
        if (Math.abs(d) < .02) { audio.volume = to; if (to === 0) audio.pause(); return; }
        audio.volume = Math.min(1, Math.max(0, audio.volume + Math.sign(d) * .02));
        fade = requestAnimationFrame(step);
      };
      step();
    };

    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      label();
      if (on) audio.play().then(() => ramp(.5)).catch(() => {
        btn.setAttribute('aria-pressed', 'false');
        label();
      });
      else ramp(0);
    });
  }
})();
