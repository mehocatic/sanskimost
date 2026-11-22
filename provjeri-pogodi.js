// Provjera baze pitanja: node provjeri-pogodi.js
// Baza (pogodi-data.js) je provjerena prema stranicama iz popisa KVS (općina, Wikipedia, Zemaljski muzej, Parlament BiH i dr.).
// Dio izvora je sekundaran. Namjerno izostavljeno: ratni zločini i brojevi žrtava, datum osmanskog osvajanja (izvori se razilaze),
// Sokolski dom kao zgrada zasjedanja ZAVNOBiH-a (nije potvrđeno), sve s neusaglašenim podacima.
// Svako pitanje mora imati oba jezika, izvor iz KVS, ispravan tačan odgovor i raspon u kojem je rješenje.
const fs = require('fs'), vm = require('vm');
const ctx = {};
ctx.window = ctx;
for (const lang of ['bs', 'en']) vm.runInNewContext(fs.readFileSync(__dirname + '/i18n/' + lang + '.js', 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(__dirname + '/pogodi-data.js', 'utf8'), ctx);
const Q = ctx.window.KVQ, S = ctx.window.KVS, bad = [], ids = new Set(), cats = {};
const two = v => Array.isArray(v) && v.length === 2 && v.every(x => typeof x === 'string' && x.trim());
for (const q of Q) {
  const e = m => bad.push(`${q.id}: ${m}`);
  if (ids.has(q.id)) e('id se ponavlja'); ids.add(q.id);
  cats[q.c] = (cats[q.c] || 0) + 1;
  if (!q.nosrc && !S[q.s]) e('nema izvora ' + q.s);
  if (!two(q.q) || !two(q.a)) e('nedostaje tekst na jednom jeziku');
  if (q.t === 'choice') {
    if (!Array.isArray(q.o) || q.o.length !== 4) e('treba tačno 4 odgovora');
    else if (!(q.ok >= 1 && q.ok <= 4)) e('ok izvan 1 do 4');
    else if (new Set(q.o.map(o => JSON.stringify(o))).size !== 4) e('odgovori se ponavljaju');
  } else if (q.t === 'year' || q.t === 'num') {
    if (!(q.f < q.to && q.y >= q.f && q.y <= q.to)) e('rješenje je izvan ljestvice');
    if (q.t === 'num' && !q.u) e('nema mjerne jedinice');
  } else e('nepoznata vrsta ' + q.t);
  if (/[–—]/.test(JSON.stringify(q))) e('crtica en ili em');
}
for (const k of Object.keys(S)) if (!Q.some(q => q.s === k)) bad.push(`izvor ${k} se ne koristi`);
console.log(`${Q.length} pitanja, ${Object.keys(S).length} izvora`, cats);
if (bad.length) { console.log(bad.join('\n')); process.exit(1); }
console.log('u redu');
