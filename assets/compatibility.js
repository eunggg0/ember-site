(() => {
  const form = document.querySelector('.compat-tools');
  if (!form) return;
  const query = document.getElementById('compat-query');
  const filter = document.getElementById('compat-filter');
  const count = document.getElementById('compat-count');
  const empty = document.querySelector('.compat-empty');
  const games = [...document.querySelectorAll('.compat-game')];
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, '');
  const names = new Map(games.map(game => [game, normalize(game.querySelector('.compat-name').textContent + ' ' + game.dataset.search)]));
  function update() {
    const term = normalize(query.value.trim());
    let visible = 0;
    for (const game of games) {
      game.hidden = !(names.get(game).includes(term) && (filter.value === 'all' || game.dataset.status === filter.value));
      if (!game.hidden) visible++;
    }
    count.textContent = `${games.length}개 중 ${visible}개 게임 · 이름순`;
    empty.hidden = visible !== 0;
  }
  function openLinkedGame() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const game = games.find(item => item.id === id);
    if (!game) return;
    query.value = ''; filter.value = 'all'; update(); game.open = true;
    requestAnimationFrame(() => game.scrollIntoView({block:'start', behavior:'instant'}));
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('reset', () => { query.value = ''; filter.value = 'all'; update(); });
  window.addEventListener('hashchange', openLinkedGame);
  form.hidden = false;
  update();
  openLinkedGame();
})();
