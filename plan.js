// "Plan your visit" page: distances, practical notes and routes, all taken from what the site already states.
// Nothing new is claimed here: distances are the ones in the place texts and routes.js, notes are the places' own notes.
(() => {
  const $ = id => document.getElementById(id);
  const make = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const bySlug = Object.fromEntries(PLACES.map(p => [p.slug, p]));
  const href = slug => `place?slug=${encodeURIComponent(slug)}`;

  // km from town. Sources: FACTS.md (Hrustovacka ~13, Blihe ~14, Bobijasko oko ~20, Grmec forest ~17) and the Korcanica text (about 32 km).
  const DIST = [
    { slug: 'hrustovacka', km: 13 },
    { slug: 'blihe', km: 14 },
    { slug: 'grmec-forest', km: 17 },
    { slug: 'bobijasko-oko', km: 20 },
    { slug: 'korcanica', km: 32 }
  ];
  // places whose note is a practical one (the notes of Kamengrad and the musalla are about history, so they are not here)
  const NOTES = ['hrustovacka', 'dabarska', 'bobijasko-oko', 'mulez'];

  function render() {
    document.title = I18n.t('plan.doctitle');
    const og = document.querySelector('meta[property="og:title"]');
    if (og) og.content = document.title;

    $('plan-dist').replaceChildren(...DIST.filter(d => bySlug[d.slug]).map(d => {
      const li = make('li');
      const a = make('a', 'dist-row'); a.href = href(d.slug);
      const km = make('span', 'dist-km');
      km.append(make('span', 'dist-n', String(d.km)), make('span', 'dist-u', ' km'));
      a.append(km, make('span', 'dist-name', I18n.place(bySlug[d.slug], 'name')), make('span', 'dist-short', I18n.place(bySlug[d.slug], 'short')));
      li.appendChild(a);
      return li;
    }));

    $('plan-notes').replaceChildren(...NOTES.filter(s => bySlug[s] && I18n.place(bySlug[s], 'note')).map(s => {
      const li = make('li', 'note');
      const a = make('a', 'note-name', I18n.place(bySlug[s], 'name')); a.href = href(s);
      li.append(a, make('p', 'note-text', I18n.place(bySlug[s], 'note')));
      return li;
    }));

    $('plan-routes').replaceChildren(...ROUTES.map(r => {
      const li = make('li', 'plan-route');
      li.append(make('h3', 'pr-name', I18n.t(`route.${r.id}.name`)), make('p', 'pr-text', I18n.t(`route.${r.id}.text`)));
      const stops = make('ol', 'pr-stops');
      r.stops.forEach(s => {
        const p = bySlug[s.slug]; if (!p) return;
        const st = make('li');
        const a = make('a', null, I18n.place(p, 'name')); a.href = href(s.slug);
        st.appendChild(a);
        if (s.km) st.appendChild(make('span', 'pr-km', I18n.t('routes.km', { km: s.km })));
        stops.appendChild(st);
      });
      li.appendChild(stops);
      if (r.extra) li.appendChild(make('p', 'pr-extra', I18n.t(r.extra)));
      const map = make('a', 'pr-map', I18n.t('routes.map')); map.href = `explore?route=${encodeURIComponent(r.id)}`;
      li.appendChild(map);
      return li;
    }));
  }

  render();
  addEventListener('langchange', render);
})();
