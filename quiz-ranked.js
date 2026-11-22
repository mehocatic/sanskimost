// Ranked games and the town chronicle (the leaderboard): a register page with one name per line,
// written by hand, and a stamp with the title of the score for the first three.
// The attempt token stays in memory. Only the random daily-limit identifier is persisted.
window.QuizRanked = (() => {
  const config = window.quizConfig;
  const $ = id => document.getElementById(id);
  const chron = $('kv-chron'), sheet = $('kv-sheet'), lines = $('kv-lines'), note = $('kv-chr-note'), form = $('kv-form');
  const t = (key, vars) => I18n.t('kv.' + key, vars);
  const SVG = 'http://www.w3.org/2000/svg';
  // mine: a finished ranked game waiting for its name ({score}), shown as an empty line in the chronicle
  let token, mode = 'mix', size = 10, message = '', boardRequest = 0, mine = null;
  const api = {title: () => ''};

  async function rpc(method, data) {
    const response = await fetch(config.url + '/rest/v1/rpc/quiz_' + method, {
      method: 'POST', headers: {apikey: config.key, 'Content-Type': 'application/json'},
      body: JSON.stringify(data), signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error((await response.json()).message);
    const body = await response.text();
    return body ? JSON.parse(body) : null;
  }
  function status(key = '') {
    message = key;
    if (key) {
      const anchor = !$('kv-round').hidden ? $('kv-opts') : !$('kv-end').hidden ? $('kv-submit') : $('kv-actions');
      anchor.after($('kv-network'));
    }
    $('kv-network').textContent = key ? t(key) : '';
    $('kv-network').hidden = !key;
  }

  /* ---------- the chronicle ---------- */
  const points = n => {
    if (I18n.lang !== 'bs') return t(n === 1 ? 'bod1' : 'bodN', {n});
    const d = n % 10, h = n % 100;
    return t(d === 1 && h !== 11 ? 'bod1' : d >= 2 && d <= 4 && (h < 12 || h > 14) ? 'bod2' : 'bodN', {n});
  };
  const modeName = () => mode === 'quiz' ? t('row.q' + size) : t(mode);
  const personalBest = () => { try { return +localStorage.getItem('sm-pogodi-ranked-' + (mode === 'quiz' ? size : mode)) || 0; } catch { return 0; } };
  const el = (name, attrs = {}) => {
    const node = document.createElementNS(SVG, name);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  };
  // a round rubber stamp: the title of the score runs along the ring, the place sits in the middle
  function stamp(place, score) {
    const title = api.title(score, mode, size);
    const svg = el('svg', {viewBox: '0 0 120 120', class: 'kv-stamp', role: 'img', 'aria-label': t('chr.stamp', {n: place, title})});
    const g = el('g', {filter: 'url(#kv-ink)'});
    g.append(el('circle', {cx: 60, cy: 60, r: 57, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.6}),
      el('circle', {cx: 60, cy: 60, r: 33, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.2}));
    const ring = el('text', {'font-family': 'Inter, sans-serif', 'font-size': 9, 'font-weight': 500, 'letter-spacing': 1, fill: 'currentColor'});
    const path = el('textPath', {href: '#kv-ring', textLength: 278});
    path.textContent = (title.length > 24 ? title + ' · ' : title + ' · Sanski Most · ').toUpperCase();
    ring.append(path);
    const num = el('text', {x: 60, y: 72, 'text-anchor': 'middle', 'font-family': 'Cormorant Garamond, serif', 'font-style': 'italic', 'font-size': 36, fill: 'currentColor'});
    num.textContent = place + '.';
    g.append(ring, num);
    svg.append(g);
    return svg;
  }
  function line(i, cls = '') {
    const li = document.createElement('li');
    li.className = 'kv-line' + (cls ? ' ' + cls : '');
    li.style.setProperty('--i', i);
    return li;
  }
  const span = (cls, text) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; return s; };
  function render(rows) {
    const typed = $('kv-name') ? $('kv-name').value : '';
    lines.replaceChildren();
    const list = rows.map(r => ({name: r.display_name, score: r.score}));
    // a new score goes after the equal ones, as the server orders them by time
    const at = mine ? list.filter(r => r.score >= mine.score).length : -1;
    if (mine) list.splice(at, 0, {me: true, score: mine.score});
    // a score inside the ten pushes the tenth out; one below them gets a line of its own under the ten, without a place
    if (mine && at < 10) list.length = Math.min(list.length, 10);
    list.forEach((r, i) => {
      const li = line(i, r.me ? 'edit' : i < 3 ? 'top' : '');
      li.append(span('n', r.me && at >= 10 ? '–' : (i + 1) + '.'));
      if (r.me) {
        const input = document.createElement('input');
        Object.assign(input, {id: 'kv-name', required: true, maxLength: 40, autocomplete: 'off', value: typed, placeholder: t('chr.name')});
        input.setAttribute('form', 'kv-form');
        input.setAttribute('aria-label', t('nickname'));
        li.append(input);
        if (at < 10) li.append(stamp(i + 1, r.score));
      } else {
        const name = span('w', r.name);
        if (r.name.length > 16) name.classList.add('long');
        li.append(name);
        if (i < 3) li.append(stamp(i + 1, r.score));
      }
      li.append(span('s', r.score));
      lines.append(li);
  async function refresh() {
    const request = ++boardRequest;
    const list = board.querySelector('ol'), note = board.querySelector('p');
    list.replaceChildren();
    note.textContent = '';
    board.querySelector('summary').textContent = t('board') + ' · ' + (mode === 'quiz' ? t('quiz') + ' · ' + t('size', {n:size}) : t(mode));
    if (!board.open) return;
    try {
      const rows = await rpc('board', {p_size:size,p_mode:mode});
      if (request !== boardRequest) return;
      rows.forEach(({display_name, score}) => {
        const item = document.createElement('li');
        const points = document.createElement('b');
        points.textContent = score;
        item.append(document.createTextNode(display_name + ' '), points);
        list.append(item);
      });
      if (!rows.length) note.textContent = t('boardEmpty');
    } catch { if (request === boardRequest) note.textContent = t('netError'); }
  }
  async function start(selected,count) {
    let player;
    try {
      player = localStorage.getItem('kv-player');
      if (!player) {
        player = crypto.randomUUID();
        localStorage.setItem('kv-player',player);
      }
    } catch { throw new Error('storage'); }
    const game = await rpc('start', {p_player:player,p_size:count,p_scales:true,p_mode:selected});
    token = game.token;
    mode = selected;
    size = count;
    form.reset();
    form.hidden = false;
    return game.questions.map(row => {
      if (row.kind === 'photo') {
        const photo = window.ARCHIVE.photos.find(p => p.f === row.photo);
        if (!photo) throw new Error('unknown_photo');
        return {kind:'photo', p:{...photo}, to:row.to};
      }
      const q = {id:row.id, t:row.kind, q:row.q};
      if (row.kind === 'choice') q.o = row.bs.map((v,i) => [v,row.en[i]]);
      else Object.assign(q, {f:row.f, to:row.to, u:row.u});
      return {kind:row.kind, q};
    });
  }
  function finish() {
    $('kv-submit').hidden = false;
    $('kv-submit').append(board);
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const input = $('kv-name'), button = form.querySelector('button');
    if (!input.value.trim()) { input.value = ''; input.reportValidity(); return; }
    button.disabled = true;
    const game = token;
    try {
      await rpc('publish',{p_token:game,p_name:input.value.trim()});
      if (game !== token) return;
      form.hidden = true;
      status('published');
      board.open = true;
      refresh();
    } catch { if (game === token) status('netError'); }
    finally { button.disabled = false; }
  });
  board.addEventListener('toggle', refresh);
  if (config) {
    $('kv-ranked').hidden = false;
    $('kv-competition').hidden = false;
    refresh();
    addEventListener('langchange', () => { status(message); refresh(); });
  }
  return {start, finish, status, answer:(round,choice) => rpc('answer',{p_token:token,p_round:round,p_choice:choice}),
    menu() { token = null; $('kv-submit').hidden = true; $('kv-competition').append(board); status(); },
    select(selected,count) { mode = selected; size = count; if (config) refresh(); }};
})();
