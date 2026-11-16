// "Guess the year": ten dated photographs from arhiv-data.js, one at a time.
// Each guess scores 100 points minus 4 for every year it is off. The best total is kept in localStorage.
(() => {
  const A = window.ARCHIVE;
  const $ = id => document.getElementById(id);
  const t = (k, v) => I18n.t(k, v);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Y0 = 1900, Y1 = 2014, ROUNDS = 10, KEY = 'sm-pogodi-best';
  const pct = y => (y - Y0) / (Y1 - Y0) * 100;

  // Left out: documents, photographs with only a rough date, and those where the year can be read in the picture itself.
  const SHOWS_YEAR = ['avion-1944', 'hamzibegova-1946', 'trnova-1957', 'prijedorska-1961', 'lovac-1968', 'poplava-1996', 'lovac-2005'];
  const POOL = A.photos.filter(p => p.y && !p.yl && p.cat !== 'dokumenti' && !SHOWS_YEAR.includes(p.f));
  const DECOR = ['stari-grad-sana', 'plivanje2', 'zaledjena-sana'];

  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // Most of the archive is from 1996 to 1998, so a plain random pick would be nearly all one decade:
  // five from before 1990, three from the nineties, one after 2000, one from anywhere. No place and no year twice.
  function pick() {
    const out = [];
    const take = (list, n) => {
      for (const p of shuffle([...list])) {
        if (n <= 0) break;
        if (out.includes(p) || out.some(q => (p.place && q.place === p.place) || (q.y === p.y && p.y < 1990))) continue;
        out.push(p); n--;
      }
    };
    take(POOL.filter(p => p.y < 1990), 5);
    take(POOL.filter(p => p.y >= 1990 && p.y <= 2000), 3);
    take(POOL.filter(p => p.y > 2000), 1);
    take(POOL, ROUNDS - out.length);
    if (out.length < ROUNDS) shuffle([...POOL]).forEach(p => { if (out.length < ROUNDS && !out.includes(p)) out.push(p); });
    return shuffle(out);
  }

  const years = n => {
    if (I18n.lang !== 'bs') return t(n === 1 ? 'kv.year1' : 'kv.yearN', { n });
    const d = n % 10, h = n % 100;
    return t(d === 1 && h !== 11 ? 'kv.year1' : (d >= 2 && d <= 4 && (h < 12 || h > 14) ? 'kv.year2' : 'kv.yearN'), { n });
  };
  const grade = d => d <= 3 ? 'g' : (d <= 10 ? 'm' : 'b');
  const verdict = d => t(d === 0 ? 'kv.v.exact' : d <= 2 ? 'kv.v.close' : d <= 5 ? 'kv.v.near' : d <= 10 ? 'kv.v.ok' : d <= 20 ? 'kv.v.far' : 'kv.v.miss');
  const rank = s => t(s >= 900 ? 'kv.r.5' : s >= 750 ? 'kv.r.4' : s >= 550 ? 'kv.r.3' : s >= 350 ? 'kv.r.2' : 'kv.r.1');

  let set = [], at = 0, total = 0, log = [], revealed = false;
  const range = $('kv-range'), yearEl = $('kv-year'), ruler = $('kv-ruler');

  /* ---------- start ---------- */
  $('kv-fan').innerHTML = DECOR.map((f, i) => `<figure style="--r:${[-9, 5, -2][i]}deg;--dx:${[-26, 22, 0][i]}%;--dy:${[4, -8, 6][i]}%;--d:${i * .14}s"><img src="photos/arhiv/${f}.webp" alt=""></figure>`).join('');
  let h = '';
  for (let y = Y0; y <= Y1; y += 10) h += `<span style="left:${pct(y)}%"><b>${y}</b></span>`;
  $('kv-ticks').innerHTML = h;
  function best() {
    let b = 0;
    try { b = +localStorage.getItem(KEY) || 0; } catch (e) { /* no storage: no best score */ }
    $('kv-best').hidden = !b;
    $('kv-best').textContent = t('kv.best', { n: b });
    return b;
  }
  best();

  function show(id) {
    ['kv-intro', 'kv-round', 'kv-end'].forEach(s => { $(s).hidden = s !== id; });
    scrollTo(0, 0);
  }
  function start() {
    set = pick(); at = 0; total = 0; log = [];
    $('kv-total').textContent = '0';
    $('kv-dots').innerHTML = set.map(() => '<li></li>').join('');
    show('kv-round');
    round();
  }

  /* ---------- one photograph ---------- */
  function round() {
    const p = set[at];
    revealed = false;
    ruler.classList.remove('shown');
    const img = $('kv-img'), print = $('kv-print');
    print.style.animation = 'none'; void print.offsetWidth; print.style.animation = '';
    print.style.setProperty('--r', `${[-1.4, 1.2, -.8, 1.6][at % 4]}deg`);
    img.src = `photos/arhiv/${p.f}.webp`; img.width = p.w; img.height = p.h;
    img.alt = t('kv.alt');
    $('kv-n').textContent = t('kv.n', { n: at + 1, total: set.length });
    $('kv-q').hidden = false;
    $('kv-step').hidden = false;
    $('kv-ans').hidden = true;
    range.disabled = false;
    yearEl.classList.remove('done');
    setYear(+range.value);
    [...$('kv-dots').children].forEach((li, i) => li.classList.toggle('now', i === at));
    // the next photograph is fetched ahead, so it is there when asked for
    if (set[at + 1]) new Image().src = `photos/arhiv/${set[at + 1].f}.webp`;
  }
  function setYear(y) {
    y = Math.min(Y1, Math.max(Y0, y));
    range.value = y;
    yearEl.textContent = y;
  }
  range.addEventListener('input', () => { yearEl.textContent = range.value; });
  $('kv-minus').addEventListener('click', () => setYear(+range.value - 1));
  $('kv-plus').addEventListener('click', () => setYear(+range.value + 1));

  function reveal() {
    if (revealed) return;
    revealed = true;
    const p = set[at], guess = +range.value, d = Math.abs(guess - p.y), pts = Math.max(0, 100 - 4 * d);
    total += pts;
    log.push({ p, guess, d, pts });
    range.disabled = true;
    // the true year drops onto the ruler; a line joins it to the guess
    $('kv-true').style.left = `${pct(p.y)}%`;
    const gap = $('kv-gap');
    gap.style.left = `${pct(Math.min(guess, p.y))}%`;
    gap.style.width = `${Math.abs(pct(guess) - pct(p.y))}%`;
    gap.classList.toggle('rev', guess < p.y);
    ruler.classList.add('shown');
    count(yearEl, guess, p.y, () => yearEl.classList.add('done'));
    count($('kv-total'), total - pts, total);
    $('kv-dots').children[at].className = grade(d);
    $('kv-q').hidden = true;
    $('kv-step').hidden = true;
    $('kv-verdict').textContent = verdict(d);
    $('kv-pts').textContent = (d ? t('kv.off', { years: years(d), guess }) + ' · ' : '') + t('kv.pts', { n: pts });
    $('kv-cap').textContent = t(p.cap);
    $('kv-open').href = `arhiv#foto=${p.f}`;
    $('kv-next').textContent = t(at === set.length - 1 ? 'kv.finish' : 'kv.next');
    $('kv-ans').hidden = false;
    $('kv-next').focus({ preventScroll: true });
  }
  // numbers roll from one value to the other
  function count(el, from, to, done) {
    if (reduce || from === to) { el.textContent = to; if (done) done(); return; }
    const t0 = performance.now(), dur = Math.min(1100, 350 + Math.abs(to - from) * 22);
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    })(t0);
  }
  $('kv-ok').addEventListener('click', reveal);
  $('kv-next').addEventListener('click', () => { if (++at < set.length) round(); else end(); });
  range.addEventListener('keydown', e => { if (e.key === 'Enter') reveal(); });

  /* ---------- result ---------- */
  function end() {
    const avg = Math.round(log.reduce((s, r) => s + r.d, 0) / log.length);
    let b = best();
    if (total > b) { try { localStorage.setItem(KEY, total); } catch (e) { /* not kept */ } b = total; }
    show('kv-end');
    count($('kv-final'), 0, total);
    $('kv-rank').textContent = rank(total);
    $('kv-avg').textContent = t('kv.avg', { years: years(avg) }) + (b > total ? ' ' + t('kv.best', { n: b }) + '.' : '');
    $('kv-list').innerHTML = log.map(r => `<li class="${grade(r.d)}"><a href="arhiv#foto=${r.p.f}"><img src="photos/arhiv/t/${r.p.f}.webp" alt="${t(r.p.cap).replace(/"/g, '&quot;')}" loading="lazy">` +
      `<p><b>${r.p.y}</b>${t('kv.you', { guess: r.guess })} · <i>${r.d ? (r.guess > r.p.y ? '+' : '−') + r.d : '✓'}</i></p></a></li>`).join('');
  }
  $('kv-share').addEventListener('click', async () => {
    const btn = $('kv-share'), url = location.origin + location.pathname;
    const text = t('kv.sharetext', { n: total });
    try {
      if (navigator.share) { await navigator.share({ title: t('kv.doctitle'), text, url }); return; }
      await navigator.clipboard.writeText(`${text} ${url}`);
      btn.textContent = t('kv.copied');
      setTimeout(() => { btn.textContent = t('kv.share'); }, 2200);
    } catch (e) { /* share sheet closed, or copying not allowed */ }
  });
  $('kv-start').addEventListener('click', start);
  $('kv-again').addEventListener('click', start);

  addEventListener('langchange', () => {
    best();
    if (!$('kv-round').hidden) {
      $('kv-n').textContent = t('kv.n', { n: at + 1, total: set.length });
      if (revealed) { const r = log[log.length - 1]; $('kv-verdict').textContent = verdict(r.d); $('kv-cap').textContent = t(r.p.cap); $('kv-pts').textContent = (r.d ? t('kv.off', { years: years(r.d), guess: r.guess }) + ' · ' : '') + t('kv.pts', { n: r.pts }); $('kv-next').textContent = t(at === set.length - 1 ? 'kv.finish' : 'kv.next'); }
    }
    if (!$('kv-end').hidden) end();
  });
})();
