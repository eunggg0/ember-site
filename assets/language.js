/* Static language routes also work without JavaScript. Root entry negotiates once. */
(() => {
  const languages = ['ko', 'en', 'ja', 'zh-Hans', 'zh-Hant'];
  const labels = ['한국어', 'English', '日本語', '简体中文', '繁體中文'];
  const ownScript = document.currentScript;
  const root = new URL('../', ownScript.src);
  function supported(value) {
    if (!value) return null;
    const tag = String(value).replace(/_/g, '-').toLowerCase();
    if (/^zh(?:-|$)/.test(tag)) {
      if (/(?:^|-)hant(?:-|$)/.test(tag)) return 'zh-Hant';
      if (/(?:^|-)hans(?:-|$)/.test(tag)) return 'zh-Hans';
      if (/(?:^|-)(tw|hk|mo)(?:-|$)/.test(tag)) return 'zh-Hant';
      return 'zh-Hans';
    }
    return languages.find(lang => tag === lang.toLowerCase() || tag.startsWith(lang.toLowerCase() + '-')) || null;
  }
  const relative = location.pathname.startsWith(root.pathname) ? location.pathname.slice(root.pathname.length) : '404.html';
  const parts = relative.split('/');
  const route = languages.includes(parts[0]) ? parts.shift() : null;
  const knownPages = ['index.html', 'why.html', 'license.html', 'source.html', 'terms.html', 'privacy.html', 'privacy-2026-10-01.html', '404.html'];
  const pathPage = parts.join('/') || 'index.html';
  const page = knownPages.includes(pathPage) ? pathPage : '404.html';
  const url = new URL(location.href);
  const requested = supported(url.searchParams.get('lang'));
  let stored = null;
  try { stored = supported(localStorage.getItem('ember.site.language')); } catch (_) { /* private browsing */ }
  const preferred = (navigator.languages || [navigator.language]).map(supported).find(Boolean) || 'en';
  const lang = requested || route || stored || preferred;
  function target(value) {
    const next = new URL(value + '/' + page, root);
    next.search = location.search;
    next.searchParams.delete('lang');
    next.hash = location.hash;
    return next;
  }
  if (requested) {
    try { localStorage.setItem('ember.site.language', requested); } catch (_) { /* storage may be disabled */ }
  }
  if (route !== lang || page !== pathPage) {
    location.replace(target(lang).href);
    return;
  }
  document.documentElement.lang = lang;
  const names = {
    ko: '언어 선택', en: 'Choose language', ja: '言語を選択',
    'zh-Hans': '选择语言', 'zh-Hant': '選擇語言'
  };
  const header = document.querySelector('header');
  if (!header) return;
  const box = document.createElement('label');
  box.className = 'site-language';
  const label = document.createElement('span'); label.className = 'sr-only'; label.textContent = names[lang];
  const select = document.createElement('select');
  select.setAttribute('aria-label', names[lang]);
  select.id = 'site-language';
  languages.forEach((value, i) => {
    const option = document.createElement('option');
    option.value = value; option.textContent = labels[i]; option.lang = value;
    option.selected = value === lang; select.append(option);
  });
  select.addEventListener('change', () => {
    try { localStorage.setItem('ember.site.language', select.value); } catch (_) { /* navigation still works */ }
    location.assign(target(select.value).href);
  });
  box.append(label, select); header.append(box);
})();
