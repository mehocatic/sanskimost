// "Guess the year": seven dated photographs from arhiv-data.js and three questions from pogodi-data.js, one at a time.
// A year guess scores 100 points minus 100/zero for every year it is off (zero is 22% of the ruler: 25 years on the photo ruler).
// A multiple-choice question is worth 100 or nothing. The best total is kept in localStorage.
(() => {
  const A = window.ARCHIVE, Q = window.KVQ;
  const $ = id => document.getElementById(id);
  const t = (k, v) => I18n.t(k, v);
  // texts of the question bank carry both languages: [bosnian, english]
  const T = v => Array.isArray(v) ? v[I18n.lang === 'bs' ? 0 : 1] : v;
  const S = window.KVS;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ROUNDS = 10, PHOTOS = 7, KEY = 'sm-pogodi-best';
  const PHOTO_SCALE = { from: 1900, to: 2014 };
  let Y0 = PHOTO_SCALE.from, Y1 = PHOTO_SCALE.to;
  const pct = y => (y - Y0) / (Y1 - Y0) * 100;
  // a ruler holds years or, when the question has a unit, plain numbers (km, m, inhabitants)
  let UNIT = '';
  const nf = n => n.toLocaleString(I18n.lang === 'bs' ? 'de' : 'en').replace('-', '−');
  const fmt = y => UNIT ? `${nf(y)} ${UNIT}` : (y < 0 ? t('kv.bce', { n: -y }) : String(y));

  // Left out: documents, photographs with only a rough date, and those where the year can be read in the picture itself.
  const SHOWS_YEAR = ['avion-1944', 'hamzibegova-1946', 'trnova-1957', 'prijedorska-1961', 'lovac-1968', 'poplava-1996', 'lovac-2005'];
  const POOL = A.photos.filter(p => p.y && !p.yl && p.cat !== 'dokumenti' && !SHOWS_YEAR.includes(p.f));
  const DECOR = ['stari-grad-sana', 'plivanje2', 'zaledjena-sana'];

  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // Most of the archive is from 1996 to 1998, so a plain random pick would be nearly all one decade:
  // four from before 1990, two from the nineties, one after 2000, then whatever is left. No place and no year twice.
  function pickPhotos() {
    const out = [];
    const take = (list, n) => {
      for (const p of shuffle([...list])) {
        if (n <= 0) break;
        if (out.includes(p) || out.some(q => (p.place && q.place === p.place) || (q.y === p.y && p.y < 1990))) continue;
        out.push(p); n--;
      }
    };
    take(POOL.filter(p => p.y < 1990), 4);
    take(POOL.filter(p => p.y >= 1990 && p.y <= 2000), 2);
    take(POOL.filter(p => p.y > 2000), 1);
    take(POOL, PHOTOS - out.length);
    if (out.length < PHOTOS) shuffle([...POOL]).forEach(p => { if (out.length < PHOTOS && !out.includes(p)) out.push(p); });
    return out.map(p => ({ kind: 'photo', p }));
  }
  // two year questions and one multiple choice, dealt in between the photographs and never next to each other
  function pickQuestions() {
    const y = shuffle(Q.filter(q => q.t !== 'choice')).slice(0, 2), c = shuffle(Q.filter(q => q.t === 'choice')).slice(0, ROUNDS - PHOTOS - 2);
    return shuffle([...y, ...c]).map(q => ({ kind: q.t, q }));
  }
  function pick() {
    const ph = shuffle(pickPhotos()), qs = pickQuestions(), out = ph.slice();
    [2, 5, 8].slice(0, qs.length).forEach((slot, i) => out.splice(Math.min(slot + Math.floor(Math.random() * 2), out.length), 0, qs[i]));
    return out;
  }

  const years = n => {
    if (I18n.lang !== 'bs') return t(n === 1 ? 'kv.year1' : 'kv.yearN', { n });
    const d = n % 10, h = n % 100;
    return t(d === 1 && h !== 11 ? 'kv.year1' : (d >= 2 && d <= 4 && (h < 12 || h > 14) ? 'kv.year2' : 'kv.yearN'), { n });
  };
  // a miss is judged in "photo years": the same share of the ruler counts the same on every scale
  const grade = e => e <= 3 ? 'g' : (e <= 10 ? 'm' : 'b');
  const verdict = (e, d) => t(d === 0 ? 'kv.v.exact' : e <= 2 ? 'kv.v.close' : e <= 5 ? 'kv.v.near' : e <= 10 ? 'kv.v.ok' : e <= 20 ? 'kv.v.far' : 'kv.v.miss');
  const rank = s => t(s >= 900 ? 'kv.r.5' : s >= 750 ? 'kv.r.4' : s >= 550 ? 'kv.r.3' : s >= 350 ? 'kv.r.2' : 'kv.r.1');
  // a value of one particular question, whichever question is on the screen
  const fmtq = (v, q) => { const u = UNIT; UNIT = q.t === 'num' ? q.u : ''; const s = fmt(v); UNIT = u; return s; };
  const esc = x => String(x).replace(/"/g, '&quot;');

  let set = [], at = 0, total = 0, log = [], revealed = false;
  const range = $('kv-range'), yearEl = $('kv-year'), ruler = $('kv-ruler'), opts = [...$('kv-opts').children];
  const cur = () => set[at];

  /* ---------- start ---------- */
  $('kv-fan').innerHTML = DECOR.map((f, i) => `<figure style="--r:${[-9, 5, -2][i]}deg;--dx:${[-26, 22, 0][i]}%;--dy:${[4, -8, 6][i]}%;--d:${i * .14}s"><img src="photos/arhiv/${f}.webp" alt=""></figure>`).join('');
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

  /* ---------- the ruler: its scale follows the question ---------- */
  function scale(from, to) {
    Y0 = from; Y1 = to;
    const span = to - from;
    const major = [10, 25, 50, 100, 250, 500].find(m => span / m <= 12) || 500;
    const minor = major === 10 ? 1 : major / 5;
    let h = '';
    for (let y = Math.ceil(from / major) * major; y <= to; y += major) h += `<span style="left:${pct(y)}%"><b>${UNIT ? nf(y) : (y < 0 ? '−' + -y : y)}</b></span>`;
    $('kv-ticks').innerHTML = h;
    $('kv-ticks').style.setProperty('--n', span / minor);
    range.min = from; range.max = to; range.step = span > 1000 ? 10 : 1;
    range.value = Math.round((from + span * .5) / range.step) * range.step;
  }

  /* ---------- one round: a photograph, a year question or a multiple choice ---------- */
  function round() {
    const r = cur();
    revealed = false;
    ruler.classList.remove('shown');
    const photo = r.kind === 'photo', pick = r.kind === 'choice';
    const print = $('kv-print');
    $('kv-print').hidden = !photo;
    $('kv-card').hidden = photo;
    $('kv-card').style.animation = 'none'; void $('kv-card').offsetWidth; $('kv-card').style.animation = '';
    print.style.animation = 'none'; void print.offsetWidth; print.style.animation = '';
    print.style.setProperty('--r', `${[-1.4, 1.2, -.8, 1.6][at % 4]}deg`);
    if (photo) {
      const img = $('kv-img');
      img.src = `photos/arhiv/${r.p.f}.webp`; img.width = r.p.w; img.height = r.p.h;
      img.alt = t('kv.alt');
    }
    // the ruler is for years only; a multiple choice shows its answers instead
    [yearEl, ruler, $('kv-step')].forEach(el => { el.hidden = pick; });
    $('kv-opts').hidden = !pick;
    opts.forEach(b => { b.disabled = false; b.className = ''; });
    $('kv-q').hidden = false;
    $('kv-ans').hidden = true;
    UNIT = r.kind === 'num' ? r.q.u : '';
    if (!pick) {
      scale(photo ? PHOTO_SCALE.from : r.q.f, photo ? PHOTO_SCALE.to : r.q.to);
      range.disabled = false;
      yearEl.classList.remove('done');
      setYear(+range.value);
    }
    texts();
    [...$('kv-dots').children].forEach((li, i) => li.classList.toggle('now', i === at));
    // the next photograph is fetched ahead, so it is there when asked for
    const nx = set[at + 1];
    if (nx && nx.kind === 'photo') new Image().src = `photos/arhiv/${nx.p.f}.webp`;
  }
  // everything the language changes in the current round
  function texts() {
    const r = cur();
    $('kv-n').textContent = t(r.kind === 'photo' ? 'kv.n' : 'kv.nq', { n: at + 1, total: set.length });
    $('kv-q').textContent = t(r.kind === 'photo' ? 'kv.q' : r.kind === 'year' ? 'kv.q.when' : r.kind === 'num' ? 'kv.q.num' : 'kv.q.pick');
    if (r.kind !== 'photo') {
      $('kv-card-q').textContent = T(r.q.q);
      $('kv-card-n').textContent = t('kv.qcard', { n: at + 1 });
    }
    if (r.kind === 'choice') opts.forEach((b, i) => { b.lastElementChild.textContent = T(r.q.o[i]); });
    if (r.kind === 'year' || r.kind === 'num') yearEl.textContent = fmt(+range.value);
    if (revealed) answer(log[log.length - 1]);
  }
  function setYear(y) {
    y = Math.min(Y1, Math.max(Y0, y));
    range.value = y;
    yearEl.textContent = fmt(y);
    yearEl.classList.toggle('long', y < 0 || !!UNIT);
  }
  range.addEventListener('input', () => setYear(+range.value));
  $('kv-minus').addEventListener('click', () => setYear(+range.value - +range.step));
  $('kv-plus').addEventListener('click', () => setYear(+range.value + +range.step));

  function reveal(choice) {
    if (revealed) return;
    revealed = true;
    const r = cur(), pickQ = r.kind === 'choice';
    let entry;
    if (pickQ) {
      const right = choice === r.q.ok;
      entry = { r, guess: choice, d: right ? 0 : 1, e: right ? 0 : 99, pts: right ? 100 : 0 };
      opts.forEach((b, i) => { b.disabled = true; b.classList.toggle('ok', i + 1 === r.q.ok); b.classList.toggle('no', i + 1 === choice && !right); });
    } else {
      const truth = r.kind === 'photo' ? r.p.y : r.q.y, guess = +range.value, d = Math.abs(guess - truth), zero = Math.round((Y1 - Y0) * .22);
      entry = { r, guess, d, e: d * 25 / zero, pts: Math.max(0, Math.round(100 * (1 - d / zero))), truth };
      range.disabled = true;
      // the true year drops onto the ruler; a line joins it to the guess
      $('kv-true').style.left = `${pct(truth)}%`;
      const gap = $('kv-gap');
      gap.style.left = `${pct(Math.min(guess, truth))}%`;
      gap.style.width = `${Math.abs(pct(guess) - pct(truth))}%`;
      gap.classList.toggle('rev', guess < truth);
      ruler.classList.add('shown');
      count(yearEl, guess, truth, () => yearEl.classList.add('done'), fmt);
      $('kv-step').hidden = true;
      $('kv-q').hidden = true;
    }
    total += entry.pts;
    log.push(entry);
    count($('kv-total'), total - entry.pts, total);
    $('kv-dots').children[at].className = pickQ ? (entry.pts ? 'g' : 'b') : grade(entry.e);
    answer(entry);
    $('kv-ans').hidden = false;
    $('kv-next').focus({ preventScroll: true });
  }
  // the answer block under the ruler (or under the options)
  function answer(x) {
    const r = x.r, photo = r.kind === 'photo';
    if (r.kind === 'choice') {
      $('kv-verdict').textContent = t(x.pts ? 'kv.v.right' : 'kv.v.wrong');
      $('kv-pts').textContent = (x.pts ? '' : t('kv.yourpick', { pick: T(r.q.o[x.guess - 1]) }) + ' · ') + t('kv.pts', { n: x.pts });
    } else {
      $('kv-verdict').textContent = verdict(x.e, x.d);
      $('kv-pts').textContent = (x.d ? t('kv.off', { years: r.kind === 'num' ? `${nf(x.d)} ${r.q.u}` : years(x.d), guess: fmt(x.guess) }) + ' · ' : '') + t('kv.pts', { n: x.pts });
    }
    $('kv-cap').textContent = photo ? t(r.p.cap) : T(r.q.a);
    source(photo ? null : S[r.q.s]);
    $('kv-open').hidden = !photo;
    if (photo) $('kv-open').href = `arhiv#foto=${r.p.f}`;
    $('kv-next').textContent = t(at === set.length - 1 ? 'kv.finish' : 'kv.next');
  }
  // where the answer comes from: a link under the explanation
  function source(s) {
    const el = $('kv-src');
    el.hidden = !s;
    if (!s) return;
    const ext = /^https?:/.test(s.u);
    el.innerHTML = `${t('kv.source')}: <a href="${esc(s.u)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${s.n}</a>`;
  }
  // numbers roll from one value to the other
  function count(el, from, to, done, f = String) {
    if (reduce || from === to) { el.textContent = f(to); if (done) done(); return; }
    const t0 = performance.now(), dur = Math.min(1100, 350 + Math.min(60, Math.abs(to - from)) * 22);
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = f(Math.round(from + (to - from) * e));
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    })(t0);
  }
  $('kv-ok').addEventListener('click', () => reveal());
  opts.forEach((b, i) => b.addEventListener('click', () => reveal(i + 1)));
  $('kv-next').addEventListener('click', () => { if (++at < set.length) round(); else end(); });
  range.addEventListener('keydown', e => { if (e.key === 'Enter') reveal(); });

  /* ---------- result ---------- */
  function end() {
    const yrs = log.filter(x => x.r.kind !== 'choice');
    const avg = yrs.length ? Math.round(yrs.reduce((s, x) => s + x.e, 0) / yrs.length) : 0;
    let b = best();
    if (total > b) { try { localStorage.setItem(KEY, total); } catch (e) { /* not kept */ } b = total; }
    show('kv-end');
    count($('kv-final'), 0, total);
    $('kv-rank').textContent = rank(total);
    $('kv-avg').textContent = t('kv.avg', { years: years(avg) }) + (b > total ? ' ' + t('kv.best', { n: b }) + '.' : '');
    $('kv-list').innerHTML = log.map(x => {
      const r = x.r;
      if (r.kind === 'photo') return `<li class="${grade(x.e)}"><a href="arhiv#foto=${r.p.f}"><img src="photos/arhiv/t/${r.p.f}.webp" alt="${esc(t(r.p.cap))}" loading="lazy">` +
        `<p><b>${r.p.y}</b>${t('kv.you', { guess: x.guess })} · <i>${x.d ? (x.guess > r.p.y ? '+' : '−') + x.d : '✓'}</i></p></a></li>`;
      const ans = r.kind === 'choice' ? T(r.q.o[r.q.ok - 1]) : fmtq(r.q.y, r.q);
      const you = r.kind !== 'choice' ? t('kv.you', { guess: fmtq(x.guess, r.q) }) + ' · <i>' + (x.d ? (x.guess > r.q.y ? '+' : '−') + nf(x.d) : '✓') + '</i>' : '<i>' + (x.pts ? '✓' : '×') + '</i>';
      return `<li class="${r.kind === 'choice' ? (x.pts ? 'g' : 'b') : grade(x.e)} qi"><div class="kv-qcard"><span aria-hidden="true">?</span><small>${T(r.q.q)}</small></div><p><b>${ans}</b>${you}</p></li>`;
    }).join('');
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
    if (!$('kv-round').hidden) texts();
    if (!$('kv-end').hidden) end();
  });
})();
