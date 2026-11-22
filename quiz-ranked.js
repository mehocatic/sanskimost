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
      const anchor = !$('kv-round').hidden ? $('kv-opts') : !$('kv-end').hidden ? $('kv-submit') : $('kv-ranked');
      anchor.after($('kv-network'));
    }
    $('kv-network').textContent = key ? t(key) : '';
    $('kv-network').hidden = !key;
  }
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
