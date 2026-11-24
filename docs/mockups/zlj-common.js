// Shared bits for the Golden Lilies mockups: the lily SVG and the switcher bar.
window.ZLJ_LILY = (id) => `
<svg class="lily" viewBox="0 0 200 240" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6e3a8"/><stop offset=".5" stop-color="#d4af5a"/><stop offset="1" stop-color="#8f6a22"/>
    </linearGradient>
  </defs>
  <g fill="url(#g-${id})">
    <path d="M100 8C112 34 124 62 120 92C117 114 108 130 100 146C92 130 83 114 80 92C76 62 88 34 100 8Z"/>
    <path d="M106 138C112 108 134 84 160 82C184 80 198 98 192 120C188 136 172 144 160 138C170 134 176 124 172 114C166 102 150 102 140 112C130 122 126 134 124 144Z"/>
    <path d="M94 138C88 108 66 84 40 82C16 80 2 98 8 120C12 136 28 144 40 138C30 134 24 124 28 114C34 102 50 102 60 112C70 122 74 134 76 144Z"/>
    <path d="M62 146H138Q142 146 142 150V158Q142 162 138 162H62Q58 162 58 158V150Q58 146 62 146Z"/>
    <path d="M100 166C106 184 110 204 100 232C90 204 94 184 100 166Z"/>
    <path d="M110 166C122 182 140 190 160 186C150 200 126 202 110 178Z"/>
    <path d="M90 166C78 182 60 190 40 186C50 200 74 202 90 178Z"/>
  </g>
  <path d="M100 34V132" stroke="rgba(143,106,34,.9)" stroke-width="1.4" stroke-linecap="round" fill="none"/>
</svg>`;

(() => {
  const here = location.pathname.split('/').pop();
  const bar = document.createElement('div');
  bar.className = 'mk-bar';
  bar.innerHTML = [
    ['zlj-a.html', 'A · Sedam poglavlja'],
    ['zlj-b.html', 'B · Spomen-ploča'],
    ['zlj-c.html', 'C · Sedam ljiljana'],
  ].map(([h, t]) => `<a href="${h}"${here === h ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  document.body.prepend(bar);
  const st = document.createElement('style');
  st.textContent = `.mk-bar{position:fixed;z-index:99;left:50%;bottom:12px;transform:translateX(-50%);display:flex;gap:4px;padding:4px;border-radius:999px;background:rgba(10,12,11,.82);backdrop-filter:blur(8px);border:1px solid rgba(212,175,90,.35);font:500 11px/1 Inter,system-ui,sans-serif;letter-spacing:.06em;white-space:nowrap;max-width:calc(100vw - 24px);overflow-x:auto}
  .mk-bar a{color:#e9dcb8;text-decoration:none;padding:9px 12px;border-radius:999px}.mk-bar a[aria-current]{background:#d4af5a;color:#14120c}`;
  document.head.appendChild(st);
})();

// born place only (before the comma), as on the current page
window.zljPlace = z => z.born.bs.split(',')[0];
window.zljDate = z => z.born.bs.split(',').slice(1).join(',').trim();
