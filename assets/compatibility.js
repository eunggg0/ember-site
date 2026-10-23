(() => {
  const locale = document.documentElement.lang;
  const labels = {
    ko: {
      nav: '게임 호환성 쪽 이동', previous: '이전', next: '다음', order: '이름순',
      total: n => `총 ${n}개 게임`, matches: (n, all) => `${all}개 중 ${n}개 게임`,
      page: (n, all) => `${all}쪽 중 ${n}쪽`, current: n => `${n}쪽, 현재 쪽`, goto: n => `${n}쪽으로 이동`
    },
    en: {
      nav: 'Game compatibility pages', previous: 'Previous', next: 'Next', order: 'Sorted by name',
      total: n => `${n} games`, matches: (n, all) => `${n} of ${all} games`,
      page: (n, all) => `Page ${n} of ${all}`, current: n => `Page ${n}, current page`, goto: n => `Go to page ${n}`
    },
    ja: {
      nav: 'ゲーム互換性のページ移動', previous: '前へ', next: '次へ', order: '名前順',
      total: n => `全${n}ゲーム`, matches: (n, all) => `${all}ゲーム中${n}ゲーム`,
      page: (n, all) => `${all}ページ中${n}ページ`, current: n => `${n}ページ、現在のページ`, goto: n => `${n}ページへ移動`
    },
    'zh-Hans': {
      nav: '游戏兼容性翻页', previous: '上一页', next: '下一页', order: '按名称排序',
      total: n => `共 ${n} 款游戏`, matches: (n, all) => `${all} 款中的 ${n} 款游戏`,
      page: (n, all) => `第 ${n} 页，共 ${all} 页`, current: n => `第 ${n} 页，当前页`, goto: n => `前往第 ${n} 页`
    },
    'zh-Hant': {
      nav: '遊戲相容性換頁', previous: '上一頁', next: '下一頁', order: '按名稱排序',
      total: n => `共 ${n} 款遊戲`, matches: (n, all) => `${all} 款中的 ${n} 款遊戲`,
      page: (n, all) => `第 ${n} 頁，共 ${all} 頁`, current: n => `第 ${n} 頁，目前頁面`, goto: n => `前往第 ${n} 頁`
    }
  };
  const text = labels[locale] || labels.en;
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
  const collator = new Intl.Collator(locale || 'en', {numeric: true, sensitivity: 'base'});
  const displayName = game => (game.querySelector('.compat-name strong') || game.querySelector('.compat-name')).textContent.trim();
  games.sort((a, b) => collator.compare(displayName(a), displayName(b)));
  list.append(...games);
  const pager = document.createElement('nav');
  pager.className = 'compat-pager'; pager.setAttribute('aria-label', text.nav); pager.hidden = true;
  list.after(pager);
  let matches = games, page = 1;
  const pageCount = () => Math.max(1, Math.ceil(matches.length / PER));
  function render() {
    const pages = pageCount();
    page = Math.min(Math.max(page, 1), pages);
    const shown = new Set(matches.slice((page - 1) * PER, page * PER));
    for (const game of games) game.hidden = !shown.has(game);
    const total = matches.length === games.length ? text.total(games.length) : text.matches(matches.length, games.length);
    count.textContent = `${total} · ${text.order}` + (matches.length ? ` · ${text.page(page, pages)}` : '');
    empty.hidden = matches.length !== 0;
    pager.hidden = pages <= 1;
    pager.textContent = '';
    if (pages <= 1) return;
    const add = (label, target, extra) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = label; b.dataset.page = target;
      if (extra === 'cur') { b.setAttribute('aria-current', 'page'); b.setAttribute('aria-label', text.current(target)); }
      else if (/^\d+$/.test(label)) b.setAttribute('aria-label', text.goto(target));
      if (extra === 'off') b.disabled = true;
      pager.append(b); return b;
    };
    add(text.previous, page - 1, page === 1 ? 'off' : '');
    let last = 0;
    for (let n = 1; n <= pages; n++) {
      if (n !== 1 && n !== pages && Math.abs(n - page) > 1) continue;
      if (n - last > 1) { const gap = document.createElement('span'); gap.textContent = '…'; gap.setAttribute('aria-hidden', 'true'); pager.append(gap); }
      add(String(n), n, n === page ? 'cur' : ''); last = n;
    }
    add(text.next, page + 1, page === pages ? 'off' : '');
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
