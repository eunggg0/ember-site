(() => {
  const nav = document.querySelector('header.nav');
  if (!nav) return;
  const syncHeight = () => {
    document.documentElement.style.setProperty('--site-nav-height', Math.ceil(nav.getBoundingClientRect().height) + 'px');
  };
  syncHeight();
  new ResizeObserver(syncHeight).observe(nav);
  // Hash links arriving from another page must use the final loaded font/header size.
  const initialHash = location.hash;
  let interacted = false;
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => {
    addEventListener(type, () => { interacted = true; }, {once:true,passive:true});
  });
  const alignInitialTarget = () => {
    syncHeight();
    if (!initialHash || interacted || location.hash !== initialHash) return;
    let id;
    try { id = decodeURIComponent(initialHash.slice(1)); } catch { return; }
    document.getElementById(id)?.scrollIntoView({block:'start',behavior:'instant'});
  };
  if (document.readyState === 'complete') alignInitialTarget();
  else addEventListener('load', alignInitialTarget, {once:true});
  document.fonts.ready.then(alignInitialTarget);
})();
