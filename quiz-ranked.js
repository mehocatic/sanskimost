// The attempt token stays in memory. Only the random daily-limit identifier is persisted.
window.QuizRanked = (() => {
  const config = window.quizConfig;
  const $ = id => document.getElementById(id);
  const board = $('kv-board'), form = $('kv-submit').querySelector('form');
  const t = (key, vars) => I18n.t('kv.' + key, vars);
  let token, size = 10, message = '', boardRequest = 0;

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
    board.querySelector('summary').textContent = t('board') + ' · ' + t('size', {n:size});
    if (!board.open) return;
    try {
      const rows = await rpc('board', {p_size:size});
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
  async function start(count) {
    let player;
    try {
      player = localStorage.getItem('kv-player');
      if (!player) {
        player = crypto.randomUUID();
        localStorage.setItem('kv-player',player);
      }
    } catch { throw new Error('storage'); }
    const game = await rpc('start', {p_player:player,p_size:count});
    token = game.token;
    size = count;
    form.reset();
    form.hidden = false;
    return game.questions.map(row => ({kind:'choice', q:{
      id:row.id, t:'choice', q:row.q, o:row.bs.map((v,i) => [v,row.en[i]])
    }}));
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
    $('kv-competition').hidden = false;
    refresh();
    addEventListener('langchange', () => { status(message); refresh(); });
  }
  return {start, finish, status, answer:(round,choice) => rpc('answer',{p_token:token,p_round:round,p_choice:choice}),
    select(count) { size = count; if (config) refresh(); }};
})();
