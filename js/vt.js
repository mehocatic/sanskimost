// Page transitions are cosmetic: if the browser skips or aborts one, that must never surface as an error.
// Loaded in <head> without defer on every page: pagereveal fires before the first render of the new page,
// so a deferred script would add the listener too late and the aborted transition would reach the console.
['pageswap', 'pagereveal'].forEach(type => {
  window.addEventListener(type, e => {
    const vt = e.viewTransition;
    if (!vt) return;
    ['ready', 'finished', 'updateCallbackDone'].forEach(k => vt[k] && vt[k].catch(() => {}));
  });
});
// Chrome sometimes aborts the transition on the new page before pagereveal ("ViewTransition opt-in disabled"); the event
// then carries no viewTransition to catch, so only that rejection is silenced here. Every other error still reaches the console.
window.addEventListener('unhandledrejection', e => {
  const r = e.reason;
  if (r && (r.name === 'InvalidStateError' || r.name === 'AbortError') && /transition/i.test(r.message || '')) e.preventDefault();
});
