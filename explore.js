// Map page: the points from poi.js, coloured by category. Map data: OpenStreetMap contributors.
// - one category at a time (or all), kept in the URL hash (#water), so it works without localStorage
// - a list of the visible points; a click centres the map on the point and opens its popup
// - ?route=<id> (routes.js) shows only that route's stops, with a line through them in order
// - points close together are clustered until zoom 16
(() => {
  const TOWN = [44.7658, 16.6663];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stacked = window.matchMedia('(max-width: 899px)');
  const $ = id => document.getElementById(id);
  const make = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  const points = POI.filter(p => p.coords);
  // categories with points on the map; an empty one (camps) gets no button
  const CATS = POI_CATS.filter(c => points.some(p => p.cat === c.id));
  const colorOf = id => (POI_CATS.find(c => c.id === id) || {}).color;
  const places = Object.fromEntries(PLACES.map(p => [p.slug, p]));
  const route = ROUTES.find(r => r.id === new URLSearchParams(location.search).get('route')) || null;

  // texts in the current language; a point with a page uses the live texts of places.js / i18n/bs.js
  const nameOf = p => (p.slug && places[p.slug]) ? I18n.place(places[p.slug], 'name') : (p.name[I18n.lang] || p.name.en);
  const shortOf = p => (p.slug && places[p.slug]) ? I18n.place(places[p.slug], 'short') : (p.short[I18n.lang] || p.short.en);
  const catName = id => I18n.t(`cat.${id}`);

  /* ---------- map and markers ---------- */
  const map = L.map('map', { zoomControl: true, scrollWheelZoom: true });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const cluster = L.markerClusterGroup({
    showCoverageOnHover: false, maxClusterRadius: 40, disableClusteringAtZoom: 16, spiderfyOnMaxZoom: true,
    animate: !reduce,
    iconCreateFunction: c => L.divIcon({ className: 'cluster', html: `<span>${c.getChildCount()}</span>`, iconSize: [38, 38] })
  });
  map.addLayer(cluster);

  function popup(p) {
    const box = make('div', 'pop');
    box.appendChild(make('strong', null, nameOf(p)));
    const cat = make('span', 'pop-cat', catName(p.cat));
    cat.style.setProperty('--c', colorOf(p.cat));
    box.appendChild(cat);
    const s = shortOf(p);
    if (s) box.appendChild(make('p', 'pop-short', s));
    if (p.slug && places[p.slug]) {
      const link = make('a', null, I18n.t('explore.view'));
      link.href = `place.html?slug=${encodeURIComponent(p.slug)}`;
      box.appendChild(link);
    }
    return box;
  }

  const markers = new Map();
  points.forEach(p => {
    const icon = L.divIcon({ className: 'pin', html: `<span style="--c:${colorOf(p.cat)}"></span>`, iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12] });
    const m = L.marker(p.coords, { icon, title: nameOf(p), alt: nameOf(p), keyboard: true });
    // content as a function: built again on every open, so it is always in the current language
    m.bindPopup(() => popup(p), { closeButton: true, autoPanPadding: [30, 80] });
    markers.set(p.id, m);
  });

  // legend: top right on wide screens (the bottom of the map starts below the fold there), bottom left on phones
  const legend = L.control({ position: stacked.matches ? 'bottomleft' : 'topright' });
  legend.onAdd = () => {
    const d = L.DomUtil.create('div', 'legend');
    L.DomEvent.disableClickPropagation(d);
    return d;
  };
  legend.addTo(map);
  function renderLegend() {
    const d = legend.getContainer();
    const list = make('ul');
    CATS.forEach(c => {
      const li = make('li', null, catName(c.id));
      li.style.setProperty('--c', c.color);
      list.appendChild(li);
    });
    d.replaceChildren(make('p', 'legend-title', I18n.t('explore.legend')), list);
  }

  /* ---------- filters (or the route bar) ---------- */
  const filtersEl = $('filters');
  const routeBar = $('route-bar');
  let active = 'all';

  if (route) {
    filtersEl.hidden = true;
    routeBar.hidden = false;
  } else {
    [{ id: 'all' }, ...CATS].forEach(c => {
      const b = make('button', 'filter');
      b.type = 'button';
      b.dataset.cat = c.id;
      if (c.color) b.style.setProperty('--c', c.color);
      else b.classList.add('filter-all');
      b.append(make('span', 'filter-dot'), make('span', 'filter-name'), make('span', 'filter-count',
        String(c.id === 'all' ? points.length : points.filter(p => p.cat === c.id).length)));
      b.querySelector('.filter-dot').setAttribute('aria-hidden', 'true');
      b.addEventListener('click', () => setFilter(c.id, true));
      filtersEl.appendChild(b);
    });
  }

  function renderBar() {
    if (route) {
      const back = make('a', 'route-all', I18n.t('explore.showAll'));
      back.href = 'explore.html';
      routeBar.replaceChildren(make('p', 'route-name', I18n.t('explore.route', { name: I18n.t(`route.${route.id}.name`) })), back);
      return;
    }
    filtersEl.querySelectorAll('.filter').forEach(b => {
      b.querySelector('.filter-name').textContent = b.dataset.cat === 'all' ? I18n.t('explore.all') : catName(b.dataset.cat);
      b.setAttribute('aria-pressed', String(b.dataset.cat === active));
    });
  }

  const fromHash = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    return CATS.some(c => c.id === h) ? h : 'all';
  };

  function setFilter(id, fromClick) {
    active = id;
    if (fromClick) history.replaceState(null, '', id === 'all' ? location.pathname + location.search : `#${id}`);
    show(true);
  }

  /* ---------- the visible points: markers, list, map view ---------- */
  const stops = route ? route.stops.map(s => ({ s, p: points.find(p => p.slug === s.slug) })) : [];
  let routeLine = null;
  if (route) {
    const path = stops.filter(x => x.p).map(x => x.p.coords);
    if (path.length > 1) routeLine = L.polyline(path, { color: '#b89b72', weight: 3, opacity: .9, dashArray: '2 8', lineCap: 'round', interactive: false }).addTo(map);
  }

  const visible = () => route ? stops.filter(x => x.p).map(x => x.p)
    : active === 'all' ? points : points.filter(p => p.cat === active);

  function fitTo(list) {
    if (!list.length) map.setView(TOWN, 11);
    else if (list.length === 1) map.setView(list[0].coords, 14);
    else map.fitBounds(list.map(p => p.coords), { padding: [40, 40], maxZoom: 14 });
  }

  function focusPoint(p) {
    const m = markers.get(p.id);
    if (stacked.matches) $('map').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    cluster.zoomToShowLayer(m, () => {
      map.setView(m.getLatLng(), Math.max(map.getZoom(), 15), { animate: !reduce });
      m.openPopup();
    });
  }

  function renderList(list) {
    $('poi-count').textContent = `(${list.length})`;
    const items = $('poi-items');
    items.classList.toggle('numbered', !!route);
    items.replaceChildren(...list.map(p => {
      const li = make('li');
      const b = make('button', 'poi-item');
      b.type = 'button';
      b.style.setProperty('--c', colorOf(p.cat));
      const dot = make('span', 'poi-dot');
      dot.setAttribute('aria-hidden', 'true');
      b.append(dot, make('span', 'poi-name', nameOf(p)), make('span', 'poi-cat', catName(p.cat)));
      b.addEventListener('click', () => focusPoint(p));
      li.appendChild(b);
      return li;
    }));
    // route stops that have no position on the map yet
    const missing = stops.filter(x => !x.p).map(x => places[x.s.slug] ? I18n.place(places[x.s.slug], 'name') : x.s.slug);
    $('route-missing').hidden = !missing.length;
    $('route-missing').textContent = missing.length ? I18n.t('explore.missing', { names: missing.join(', ') }) : '';
  }

  function show(fit) {
    const list = visible();
    cluster.clearLayers();
    cluster.addLayers(list.map(p => markers.get(p.id)));
    renderBar();
    renderList(list);
    if (fit) fitTo(list);
  }

  /* ---------- language switch ---------- */
  window.addEventListener('langchange', () => {
    markers.forEach((m, id) => {
      const p = points.find(q => q.id === id);
      m.options.title = m.options.alt = nameOf(p);
      const el = m.getElement();
      if (el) el.title = nameOf(p);
      if (m.isPopupOpen()) m.getPopup().update();
    });
    renderLegend();
    renderBar();
    renderList(visible());
  });

  window.addEventListener('hashchange', () => { if (!route) setFilter(fromHash(), false); });

  renderLegend();
  if (!route) active = fromHash();
  show(true);
})();
