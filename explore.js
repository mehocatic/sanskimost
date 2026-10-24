// Map page: one marker per place that has coords in places.js. Map data: OpenStreetMap contributors.
(() => {
  const map = L.map('map', { zoomControl: true, scrollWheelZoom: true });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const icon = L.divIcon({ className: 'pin', html: '<span></span>', iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14] });

  // popup content in the current language
  function popup(p) {
    const box = document.createElement('div');
    box.className = 'pop';
    const name = document.createElement('strong');
    name.textContent = I18n.place(p, 'name');
    const link = document.createElement('a');
    link.href = `place.html?slug=${encodeURIComponent(p.slug)}`;
    link.textContent = I18n.t('explore.view');
    box.append(name, link);
    return box;
  }

  const points = [];
  const markers = [];
  PLACES.forEach(p => {
    if (!p.coords) return; // no verified coordinates: no marker
    const marker = L.marker(p.coords, { icon, title: I18n.place(p, 'name'), alt: I18n.place(p, 'name'), keyboard: true }).addTo(map);
    marker.bindPopup(popup(p), { closeButton: true, autoPanPadding: [30, 80] });
    markers.push({ marker, p });
    points.push(p.coords);
  });

  window.addEventListener('langchange', () => {
    markers.forEach(({ marker, p }) => {
      marker.setPopupContent(popup(p));
      const el = marker.getElement();
      if (el) el.title = I18n.place(p, 'name');
    });
  });

  if (points.length) map.fitBounds(points, { padding: [60, 60], maxZoom: 13 });
  else map.setView([44.7658, 16.6663], 11);
})();
