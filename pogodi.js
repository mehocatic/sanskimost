// "Guess the year": six dated photographs from arhiv-data.js and four questions from pogodi-data.js, one at a time.
// The daily challenge is one photograph and two questions, the same for everyone that day, played once (result and streak stay in the browser).
// A second mode plays ten questions only. Questions already answered are put off until the bank has been used up.
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
  const ROUNDS = 10, PHOTOS = 6, SEEN = 'sm-pogodi-seen', LIVES = 3;
  // mix: photos and questions; quiz: 10 or 20 questions; surv: questions until the third mistake
  let mode = 'mix', len = 10, lives = LIVES;
  const ranked = window.QuizRanked;
  let pending = false, competitive = false;
  const gameSize = () => mode === 'surv' ? 80 : mode === 'mix' ? 10 : len;
  const KEY = () => competitive ? 'sm-pogodi-ranked-' + (mode === 'quiz' ? len : mode) : mode === 'surv' ? 'sm-pogodi-best-s' : mode === 'quiz' ? (len === 20 ? 'sm-pogodi-best-q20' : 'sm-pogodi-best-q') : 'sm-pogodi-best';
  // the most a game can give; a game until three mistakes has no top
  const MAX = () => mode === 'surv' ? 0 : set.length * 100;
  const PHOTO_SCALE = { from: 1900, to: A.endYear };
  let Y0 = PHOTO_SCALE.from, Y1 = PHOTO_SCALE.to;
  const pct = y => (y - Y0) / (Y1 - Y0) * 100;
  // a ruler holds years or, when the question has a unit, plain numbers (km, m, inhabitants)
  let UNIT = '';
  const nf = n => n.toLocaleString(I18n.lang === 'bs' ? 'de' : 'en').replace('-', '−');
  const fmt = y => UNIT ? `${nf(y)} ${UNIT}` : (y < 0 ? t('kv.bce', { n: -y }) : String(y));

  // Left out: documents, photographs with only a rough date, and those where the year can be read in the picture itself.
  const SHOWS_YEAR = ['avion-1944', 'hamzibegova-1946', 'trnova-1957', 'prijedorska-1961', 'lovac-1968', 'poplava-1996', 'lovac-2005'];
  const POOL = A.photos.filter(p => p.quiz !== false && p.y && !p.yl && p.cat !== 'dokumenti' && !SHOWS_YEAR.includes(p.f));
  const DECOR = ['stari-grad-sana', 'plivanje2', 'zaledjena-sana'];

  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // Most of the archive is from 1996 to 1998, so a plain random pick would be nearly all one decade:
  // three from before 1990, two from the nineties, one after 2000, then whatever is left. No place and no year twice.
  function pickPhotos() {
    const out = [];
    const take = (list, n) => {
      for (const p of shuffle([...list])) {
        if (n <= 0) break;
        if (out.includes(p) || out.some(q => (p.place && q.place === p.place) || (q.y === p.y && p.y < 1990))) continue;
        out.push(p); n--;
      }
    };
    take(POOL.filter(p => p.y > 2014), 1);
    take(POOL.filter(p => p.y < 1990), 2);
    take(POOL.filter(p => p.y >= 1990 && p.y <= 2000), 2);
    take(POOL.filter(p => p.y > 2000 && p.y <= 2014), 1);
    take(POOL, PHOTOS - out.length);
    if (out.length < PHOTOS) shuffle([...POOL]).forEach(p => { if (out.length < PHOTOS && !out.includes(p)) out.push(p); });
    return out.map(p => ({ kind: 'photo', p }));
  }
  // questions answered in earlier games (kept in the browser), so a new game starts with new ones
  const seen = () => { try { return new Set(JSON.parse(localStorage.getItem(SEEN)) || []); } catch (e) { return new Set(); } };
  const markSeen = id => { try { const s = seen(); s.add(id); localStorage.setItem(SEEN, JSON.stringify([...s])); } catch (e) { /* not kept */ } };
  // unanswered first, and no more than two of one subject while there is a choice
  function chooseQ(pool, k, count) {
    const s = seen(), out = [];
    for (const list of [shuffle(pool.filter(q => !s.has(q.id))), shuffle(pool.filter(q => s.has(q.id)))]) {
      for (const cap of [2, 99]) {
        for (const q of list) {
          if (out.length >= k) return out;
          if (out.includes(q) || (count[q.c] || 0) >= cap) continue;
          out.push(q); count[q.c] = (count[q.c] || 0) + 1;
        }
      }
    }
    return out;
  }
  // a few rulers (a year or a number) and the rest multiple choice, mixed
  function pickQuestions(n) {
    const s = seen();
    if (Q.filter(q => !s.has(q.id)).length < n) { try { localStorage.removeItem(SEEN); } catch (e) { /* nothing to clear */ } }
    const count = {}, rulers = Math.round(n * .4);
    const r = chooseQ(Q.filter(q => q.t !== 'choice'), rulers, count);
    const c = chooseQ(Q.filter(q => q.recent), Math.max(1, Math.floor(n / 5)), count);
    c.push(...chooseQ(Q.filter(q => q.t === 'choice' && !c.includes(q)), n - r.length - c.length, count));
    return shuffle([...r, ...c]).map(q => ({ kind: q.t, q }));
  }
  /* ---------- daily challenge ---------- */
  const DKEY = 'sm-pogodi-daily', DMAX = 300;
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Sarajevo' }).format(new Date());
  const dayIdx = d => Math.floor(Date.parse(d + 'T00:00:00Z') / 864e5);
  const dayNo = () => Math.max(1, dayIdx(today()) - dayIdx('2026-11-21') + 1);
  const dailyRec = () => { try { return JSON.parse(localStorage.getItem(DKEY)); } catch (e) { return null; } };
  const playedToday = () => { const r = dailyRec(); return !!r && r.day === today(); };
  const streakNow = () => { const r = dailyRec(); return r && dayIdx(today()) - dayIdx(r.day) <= 1 ? r.streak : 0; };
  // a photograph and two questions of different subjects, drawn from the date, so everyone gets the same three
  function pickDaily() {
    let seed = (dayIdx(today()) * 2654435761) >>> 0;
    const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
    const one = list => list[Math.floor(rnd() * list.length)];
    const byKey = k => (a, b) => a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0;
    const photo = one([...POOL].sort(byKey('f')));
    const pool = Q.filter(q => q.t === 'choice').sort(byKey('id'));
    const a = one(pool), b = one(pool.filter(q => q.c !== a.c));
    return [{ kind: 'photo', p: photo }, { kind: 'choice', q: a }, { kind: 'choice', q: b }];
  }
  function pick() {
    if (mode === 'daily') return pickDaily();
    if (mode === 'quiz') return pickQuestions(len);
    // three mistakes: answers to pick only; a ruler guess is rarely spot on, so it would cost lives unfairly
    if (mode === 'surv') {
      const choice = Q.filter(q => q.t === 'choice');
      const s = seen();
      if (choice.filter(q => !s.has(q.id)).length < 20) { try { localStorage.removeItem(SEEN); } catch (e) { /* nothing to clear */ } }
      return chooseQ(choice, Math.min(choice.length, 80), {}).map(q => ({ kind: q.t, q }));
    }
    const ph = shuffle(pickPhotos()), qs = pickQuestions(ROUNDS - PHOTOS), out = ph.slice();
    // questions are dealt in between the photographs, never in a block
    [1, 3, 6, 8].slice(0, qs.length).forEach((slot, i) => out.splice(Math.min(slot + Math.floor(Math.random() * 2), out.length), 0, qs[i]));
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
  // the same names for every length: the share of the most a game can give (three mistakes: the number of right answers)
  const rankKey = (s, game, max) => { const k = game === 'surv' ? Math.min(1, s / 1500) * 1000 : s / (max || 1000) * 1000; return k >= 900 ? 'kv.r.5' : k >= 750 ? 'kv.r.4' : k >= 550 ? 'kv.r.3' : k >= 350 ? 'kv.r.2' : 'kv.r.1'; };
  const rank = score => t(rankKey(score,mode,MAX()));
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
    try { b = +localStorage.getItem(KEY()) || 0; } catch (e) { /* no storage: no best score */ }
    $('kv-best').hidden = !b;
    $('kv-best').textContent = t('kv.best', { n: b });
    return b;
  }
  best();

  function show(id) {
    ['kv-intro', 'kv-round', 'kv-end'].forEach(s => { $(s).hidden = s !== id; });
    scrollTo(0, 0);
  }
  async function start(forBoard) {
    if (pending) return;
    ranked.status();
    let remote;
    if (forBoard) {
      pending = true;
      const controls = [...document.querySelectorAll('#kv-intro button, #kv-end button')];
      controls.forEach(b => { b.disabled = true; });
      try { remote = await ranked.start(mode,gameSize()); }
      catch (e) {
        ranked.status(e.message === 'daily_limit' ? 'limit' : e.message === 'storage' ? 'storage' : 'netError');
        return;
      } finally { pending = false; controls.forEach(b => { b.disabled = false; }); }
    }
    competitive = forBoard;
    best();
    set = remote || pick(); at = 0; total = 0; log = []; lives = LIVES;
    $('kv-total').textContent = '0';
    // three mistakes: three lives instead of a dot per question
    $('kv-dots').innerHTML = mode === 'surv' ? '<li class="life"></li>'.repeat(LIVES) : set.map(() => '<li></li>').join('');
    $('kv-dots').classList.toggle('lives', mode === 'surv');
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
    const photoScale = from === PHOTO_SCALE.from && to === PHOTO_SCALE.to && !UNIT;
    for (let y = Math.ceil(from / major) * major; y <= to; y += major) {
      if (photoScale && to - y < major / 2) break;
      h += `<span style="left:${pct(y)}%"><b>${UNIT ? nf(y) : (y < 0 ? '−' + -y : y)}</b></span>`;
    }
    if (photoScale) h += '<span class="scale-end" style="left:100%"><b>' + to + '</b></span>';
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
      scale(photo ? PHOTO_SCALE.from : r.q.f, photo ? (r.to || PHOTO_SCALE.to) : r.q.to);
      range.disabled = false;
      yearEl.classList.remove('done');
      setYear(+range.value);
    }
    texts();
    if (mode !== 'surv') [...$('kv-dots').children].forEach((li, i) => li.classList.toggle('now', i === at));
    // the next photograph is fetched ahead, so it is there when asked for
    const nx = set[at + 1];
    if (nx && nx.kind === 'photo') new Image().src = `photos/arhiv/${nx.p.f}.webp`;
  }
  // everything the language changes in the current round
  function texts() {
    const r = cur();
    $('kv-n').textContent = mode === 'surv' ? t('kv.nsurv', { n: at + 1, lives }) : t(r.kind === 'photo' ? 'kv.n' : 'kv.nq', { n: at + 1, total: set.length });
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

  async function reveal(choice) {
    if (revealed || pending) return;
    const r = cur(), pickQ = r.kind === 'choice';
    let serverPoints;
    if (competitive) {
      if (pickQ && !choice) return;
      pending = true;
      const controls = pickQ ? opts : [range, $('kv-minus'), $('kv-plus'), $('kv-ok')];
      controls.forEach(b => { b.disabled = true; });
      try {
        const result = await ranked.answer(at + 1, pickQ ? choice : +range.value);
        if (r.kind === 'photo') r.p.y = result.target;
        else Object.assign(r.q, {ok:result.ok, y:result.target, a:result.a, source:result.source});
        serverPoints = result.points;
        choice = result.choice;
        if (!pickQ) setYear(result.choice);
        ranked.status();
      } catch {
        ranked.status('netError');
        return;
      } finally { controls.forEach(b => { b.disabled = false; }); pending = false; }
    }
    revealed = true;
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
    if (serverPoints !== undefined) entry.pts = serverPoints;
    if (r.kind !== 'photo') markSeen(r.q.id);
    total += entry.pts;
    log.push(entry);
    count($('kv-total'), total - entry.pts, total);
    const miss = pickQ ? !entry.pts : grade(entry.e) === 'b';
    if (mode === 'surv') {
      // a wrong answer, or a guess far off, costs a life
      if (miss) { lives--; $('kv-dots').children[lives].className = 'life lost'; }
    } else $('kv-dots').children[at].className = pickQ ? (entry.pts ? 'g' : 'b') : grade(entry.e);
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
    source(photo ? null : r.q.source || S[r.q.s]);
    $('kv-open').hidden = !photo;
    if (photo) $('kv-open').href = `arhiv#foto=${r.p.f}`;
    $('kv-next').textContent = t(last() ? 'kv.finish' : 'kv.next');
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
  const last = () => at === set.length - 1 || (mode === 'surv' && lives <= 0);
  $('kv-next').addEventListener('click', () => { if (!last()) { at++; round(); } else end(); });
  range.addEventListener('keydown', e => { if (e.key === 'Enter') reveal(); });

  /* ---------- result ---------- */
  function end() {
    if (mode === 'daily') return endDaily();
    $('kv-shot').parentElement.hidden = false; $('kv-dl').hidden = false; $('kv-again').hidden = false;
    const yrs = log.filter(x => x.r.kind !== 'choice');
    const avg = yrs.length ? Math.round(yrs.reduce((s, x) => s + x.e, 0) / yrs.length) : 0;
    let b = best();
    if (total > b) { try { localStorage.setItem(KEY(), total); } catch (e) { /* not kept */ } b = total; }
    show('kv-end');
    if (competitive) ranked.finish();
    const right = log.filter(x => x.r.kind === 'choice' ? x.pts : grade(x.e) !== 'b').length;
    count($('kv-final'), 0, total);
    $('kv-max').textContent = mode === 'surv' ? t('kv.ptsword') : `/ ${MAX()}`;
    $('kv-rank').textContent = rank(total);
    $('kv-avg').textContent = [mode === 'surv' ? t('kv.right', { n: right }) + '.' : '', yrs.length ? t('kv.avg', { years: years(avg) }) : '', b > total ? t('kv.best', { n: b }) + '.' : ''].filter(Boolean).join(' ');
    const photo = log.find(x => x.r.kind === 'photo');
    renderCard({game:mode, score:total, max:MAX(), photo:photo ? photo.r.p.f : DECOR[0], lang:I18n.lang});
    renderList();
  }
  function renderList() {
    $('kv-list').innerHTML = log.map(x => {
      const r = x.r;
      if (r.kind === 'photo') return `<li class="${grade(x.e)}"><a href="arhiv#foto=${r.p.f}"><img src="photos/arhiv/t/${r.p.f}.webp" alt="${esc(t(r.p.cap))}" loading="lazy">` +
        `<p><b>${r.p.y}</b>${t('kv.you', { guess: x.guess })} · <i>${x.d ? (x.guess > r.p.y ? '+' : '−') + x.d : '✓'}</i></p></a></li>`;
      const ans = r.kind === 'choice' ? T(r.q.o[r.q.ok - 1]) : fmtq(r.q.y, r.q);
      const you = r.kind !== 'choice' ? t('kv.you', { guess: fmtq(x.guess, r.q) }) + ' · <i>' + (x.d ? (x.guess > r.q.y ? '+' : '−') + nf(x.d) : '✓') + '</i>' : '<i>' + (x.pts ? '✓' : '×') + '</i>';
      return `<li class="${r.kind === 'choice' ? (x.pts ? 'g' : 'b') : grade(x.e)} qi"><div class="kv-qcard"><span aria-hidden="true">?</span><small>${T(r.q.q)}</small></div><p><b>${ans}</b>${you}</p></li>`;
    }).join('');
  }
  function endDaily() {
    const day = today();
    let rec = dailyRec();
    if ((!rec || rec.day !== day) && log.length) {
      const streak = rec && dayIdx(day) - dayIdx(rec.day) === 1 ? rec.streak + 1 : 1;
      rec = { day, n: dayNo(), score: total, streak, marks: log.map(x => x.r.kind === 'choice' ? (x.pts ? 'g' : 'b') : grade(x.e)).join('') };
      try { localStorage.setItem(DKEY, JSON.stringify(rec)); } catch (e) { /* not kept */ }
    }
    if (!rec || rec.day !== day) return;
    show('kv-end');
    $('kv-shot').parentElement.hidden = true; $('kv-dl').hidden = true; $('kv-again').hidden = true;
    $('kv-share-link').hidden = true; $('kv-share-status').textContent = '';
    count($('kv-final'), 0, rec.score);
    $('kv-max').textContent = '/ ' + DMAX;
    $('kv-rank').textContent = t(rankKey(rec.score, 'daily', DMAX));
    $('kv-avg').textContent = dailyMarks(rec) + ' · ' + t('kv.streak', { n: rec.streak }) + '. ' + t('kv.dailyDone');
    renderList();
  }
  const MARK = { g: '🟩', m: '🟨', b: '🟥' };
  const dailyMarks = r => [...r.marks].map(c => MARK[c]).join('');
  /* ---------- the result as a picture (1080 x 1350, the size of a post; a story crops it well) ---------- */
  let sharedResult = null, shareUrl = '', imageUrl = '', renderId = 0;
  const publicQuiz = document.querySelector('meta[property="og:url"]').content;
  function resultUrl({game, score, max, photo, lang}) {
    const url = new URL(publicQuiz);
    url.search = new URLSearchParams({result:'1', game, score, max, photo, lang});
    return url.href;
  }
  function readResult() {
    const args = new URLSearchParams(location.search);
    if (args.get('result') !== '1') return null;
    const game = args.get('game'), photo = args.get('photo'), lang = args.get('lang');
    const number = key => /^\d{1,4}$/.test(args.get(key) || '') ? Number(args.get(key)) : NaN;
    const score = number('score'), max = number('max');
    const validMax = {mix:[1000], quiz:[1000,2000], surv:[0]};
    if (!Object.hasOwn(validMax,game) || !validMax[game].includes(max) ||
        !Number.isInteger(score) || score > (game === 'surv' ? 8000 : max) ||
        (game === 'surv' && score % 100 !== 0) || !['bs','en'].includes(lang) ||
        !A.photos.some(p => p.f === photo)) return null;
    return {game, score, max, photo, lang};
  }
  async function renderCard(result) {
    const id = ++renderId;
    const {game, score, max, photo, lang} = result;
    // The shared image keeps the sender's language even when the viewer switches menus.
    const label = (key, vars = {}) => window.I18N[lang][key].replace(/\{(\w+)\}/g, (_, k) => vars[k]);
    const rankName = label(rankKey(score,game,max));
    shareUrl = resultUrl(result);
    $('kv-share-link').hidden = true;
    $('kv-share-status').textContent = '';
    $('kv-dl').removeAttribute('href');
    $('kv-dl').setAttribute('aria-disabled','true');
    const W = 1080, H = 1350, c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    try { await Promise.all(['500 120px "Cormorant Garamond"', 'italic 500 60px "Cormorant Garamond"', '400 30px Inter'].map(f => document.fonts.load(f))); } catch (e) { /* the fallback fonts are fine */ }
    g.fillStyle = '#111614'; g.fillRect(0, 0, W, H);
    // an old photograph of the game in the upper half, as a print with a paper border
    const src = 'photos/arhiv/' + photo + '.webp';
    await new Promise(res => {
      const im = new Image();
      im.onload = () => {
        g.save(); g.translate(W / 2, 390); g.rotate(-0.03);
        const w = 760, h = Math.min(520, w * im.height / im.width), r = Math.max(w / im.width, h / im.height);
        g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 50; g.shadowOffsetY = 24;
        g.fillStyle = '#efe9db'; g.fillRect(-w / 2 - 16, -h / 2 - 16, w + 32, h + 32);
        g.shadowColor = 'transparent';
        g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip();
        g.drawImage(im, -im.width * r / 2, -im.height * r / 2, im.width * r, im.height * r);
        g.restore(); res();
      };
      im.onerror = res;
      im.src = src;
    });
    g.textAlign = 'center';
    g.fillStyle = '#7fd6dc'; g.font = '400 26px Inter';
    g.fillText(label(game === 'surv' ? 'kv.surv' : game === 'quiz' ? 'kv.quiz' : 'kv.title.plain').toUpperCase().split('').join(String.fromCharCode(8202)), W / 2, 760);
    // Inter for the figure: the serif has old-style figures, and a canvas cannot switch them to lining ones
    g.fillStyle = '#f6f4ee'; g.font = '400 210px Inter, system-ui, sans-serif';
    g.fillText(String(score), W / 2, 980);
    g.fillStyle = 'rgba(246,244,238,.6)'; g.font = '400 34px Inter';
    g.fillText(game === 'surv' ? label('kv.right', { n: score / 100 }) : label('kv.of', { n: max }), W / 2, 1040);
    g.fillStyle = '#f6f4ee'; g.font = 'italic 500 64px "Cormorant Garamond", Georgia, serif';
    g.fillText(rankName, W / 2, 1150);
    g.fillStyle = 'rgba(246,244,238,.5)'; g.font = '400 28px Inter';
    g.fillText('visitsanskimost.netlify.app/pogodi', W / 2, 1270);
    const png = await new Promise(resolve => c.toBlob(resolve, 'image/png'));
    if (id !== renderId) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = png ? URL.createObjectURL(png) : '';
    const url = imageUrl || c.toDataURL('image/png');
    $('kv-shot').src = url;
    $('kv-shot').alt = t('kv.shot.alt', { n: score });
    $('kv-dl').href = url;
    $('kv-dl').download = 'sanski-most-' + game + '-' + score + '.png';
    $('kv-dl').removeAttribute('aria-disabled');
  }
  $('kv-share').addEventListener('click', async () => {
    const url = shareUrl;
    if (!url) return;
    if (navigator.share) {
      try { await navigator.share({title:t('kv.doctitle'), url}); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      $('kv-share-status').textContent = t('kv.linkCopied');
    } catch {
      const input = $('kv-share-link');
      input.hidden = false;
      input.value = url;
      input.focus();
      input.select();
    }
  });
  function showShared() {
    show('kv-end');
    $('kv-again').hidden = true;
    $('kv-final').textContent = sharedResult.score;
    $('kv-max').textContent = sharedResult.max ? '/ ' + sharedResult.max : t('kv.ptsword');
    $('kv-rank').textContent = t(rankKey(sharedResult.score,sharedResult.game,sharedResult.max));
    renderCard(sharedResult);
  }
  const lengthPicker = document.querySelector('.kv-len');
  function updateMenu() {
    lengthPicker.hidden = mode !== 'quiz';
    document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    $('kv-description').textContent = t('kv.help.' + mode);
    ranked.select(mode,gameSize());
    best();
  }
  document.querySelector('.kv-modes').addEventListener('click', e => {
    const button = e.target.closest('[data-mode]');
    if (!button || pending) return;
    mode = button.dataset.mode;
    ranked.status();
    updateMenu();
  });
  $('kv-practice').addEventListener('click', () => start(false));
  $('kv-ranked').addEventListener('click', () => start(true));
  $('kv-menu').addEventListener('click', () => {
    if (sharedResult) {
      sharedResult = null;
      history.replaceState(null,'',location.pathname);
      $('kv-again').hidden = false;
    }
    competitive = false;
    ranked.menu();
    show('kv-intro');
    updateMenu();
  });
  updateMenu();
  document.querySelector('.kv-len').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    len = +b.dataset.len;
    ranked.status();
    updateMenu();
    document.querySelectorAll('.kv-len button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  });
  $('kv-again').addEventListener('click', () => start(competitive));
  $('kv-bank').textContent = t('kv.bank', { n: Q.length });
  // every source the questions rest on, one link each
  $('kv-srcl').innerHTML = Object.values(S).sort((a, b) => a.n.localeCompare(b.n, 'bs')).map(s =>
    `<li><a href="${esc(s.u)}"${/^https?:/.test(s.u) ? ' target="_blank" rel="noopener"' : ''}>${s.n}</a></li>`).join('');

  addEventListener('langchange', () => {
    best();
    $('kv-bank').textContent = t('kv.bank', { n: Q.length });
    if (!$('kv-intro').hidden) updateMenu();
    if (!$('kv-round').hidden) texts();
    if (!$('kv-end').hidden) { if (sharedResult) showShared(); else end(); }
  });
  sharedResult = readResult();
  if (sharedResult) showShared();
})();
