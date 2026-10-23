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
  const PER = 5;
  const list = document.getElementById('compat-list');
  const pager = document.createElement('nav');
  pager.className = 'compat-pager'; pager.setAttribute('aria-label', '게임 호환성 쪽 이동'); pager.hidden = true;
  list.after(pager);
  let matches = games, page = 1;
  const pageCount = () => Math.max(1, Math.ceil(matches.length / PER));
  function render() {
    const pages = pageCount();
    page = Math.min(Math.max(page, 1), pages);
    const shown = new Set(matches.slice((page - 1) * PER, page * PER));
    for (const game of games) game.hidden = !shown.has(game);
    const total = matches.length === games.length ? `총 ${games.length}개 게임` : `${games.length}개 중 ${matches.length}개 게임`;
    count.textContent = `${total} · 이름순` + (matches.length ? ` · ${pages}쪽 중 ${page}쪽` : '');
    empty.hidden = matches.length !== 0;
    pager.hidden = pages <= 1;
    pager.textContent = '';
    if (pages <= 1) return;
    const add = (label, target, extra) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = label; b.dataset.page = target;
      if (extra === 'cur') { b.setAttribute('aria-current', 'page'); b.setAttribute('aria-label', `${target}쪽, 현재 쪽`); }
      else if (/^\d+$/.test(label)) b.setAttribute('aria-label', `${target}쪽으로 이동`);
      if (extra === 'off') b.disabled = true;
      pager.append(b); return b;
    };
    add('이전', page - 1, page === 1 ? 'off' : '');
    let last = 0;
    for (let n = 1; n <= pages; n++) {
      if (n !== 1 && n !== pages && Math.abs(n - page) > 1) continue;
      if (n - last > 1) { const gap = document.createElement('span'); gap.textContent = '…'; gap.setAttribute('aria-hidden', 'true'); pager.append(gap); }
      add(String(n), n, n === page ? 'cur' : ''); last = n;
    }
    add('다음', page + 1, page === pages ? 'off' : '');
  }
  function update() {
    const term = normalize(query.value.trim());
    matches = games.filter(game => names.get(game).includes(term) && (filter.value === 'all' || game.dataset.status === filter.value));
    page = 1; render();
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  pager.addEventListener('click', event => {
    const b = event.target.closest('button[data-page]');
    if (!b || b.disabled) return;
    page = Number(b.dataset.page); render();
    pager.querySelector('[aria-current]')?.focus({preventScroll: true});
    document.querySelector('.compat-meta').scrollIntoView({block: 'start', behavior: reduce.matches ? 'auto' : 'smooth'});
  });
  function openLinkedGame() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const game = games.find(item => item.id === id);
    if (!game) return;
    query.value = ''; filter.value = 'all'; update();
    page = Math.floor(matches.indexOf(game) / PER) + 1; render(); game.open = true;
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
