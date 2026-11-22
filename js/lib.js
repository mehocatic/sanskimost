// Image helpers shared by the home page and the place pages.
window.PlacesLib = (() => {
  // Neutral dark frame with the place name, used whenever a photo file does not exist
  function placeholder(name) {
    const d = document.createElement('div');
    d.className = 'ph';
    d.textContent = name;
    return d;
  }

  // Element showing the photo, lazy-loaded; swaps to a placeholder if the file is missing.
  // onFail runs once when the file could not be loaded. eager = load immediately (hero image).
  // opts: srcset / sizes (a smaller file for phones), natural (the holder takes the size of the photo, not the whole box).
  function photo(src, name, onFail, eager, opts) {
    if (!src) return placeholder(name);
    const o = opts || {};
    const img = new Image();
    img.alt = name;
    img.decoding = 'async';
    if (!eager) img.loading = 'lazy';
    const holder = document.createElement('div');
    if (!o.natural) holder.style.cssText = 'width:100%;height:100%';
    img.onerror = () => { holder.replaceChildren(placeholder(name)); if (onFail) onFail(); };
    if (o.srcset) { img.sizes = o.sizes || '100vw'; img.srcset = o.srcset; }
    img.src = src;
    holder.appendChild(img);
    return holder;
  }

  // A `photos` entry in places.js is a path or { src, srcset, author, license, sourceUrl, ... }; this always gives the object form
  function photoEntry(e) {
    return typeof e === 'string' ? { src: e } : (e || {});
  }

  return { placeholder, photo, photoEntry };
})();

// Page transitions are cosmetic: if the browser skips or aborts one, that must never surface as an error
['pageswap', 'pagereveal'].forEach(type => {
  window.addEventListener(type, e => {
    const vt = e.viewTransition;
    if (!vt) return;
    ['ready', 'finished', 'updateCallbackDone'].forEach(k => vt[k] && vt[k].catch(() => {}));
  });
});
