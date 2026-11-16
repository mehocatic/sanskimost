// Questions without a photograph for pogodi.js. Every one rests on a fact already written on the History page.
//  year:   the guess is a year on a ruler from `from` to `to` (negative = before our era); y is the answer
//  choice: four answers, `n` of them with texts kv.q.<id>.o1 ... o4, `ok` is the number of the right one
// Texts (kv.q.<id>.q the question, .a the explanation) are in i18n/bs.js and i18n/en.js.
window.KVQ = [
  { id: 'kamengrad', type: 'year', y: 1374, from: 1200, to: 1500 },
  { id: 'bela', type: 'year', y: 1244, from: 1100, to: 1400 },
  { id: 'lopta', type: 'year', y: 1913, from: 1880, to: 1960 },
  { id: 'zavnobih', type: 'year', y: 1944, from: 1900, to: 2000 },
  { id: 'vrucina', type: 'year', y: 1902, from: 1880, to: 2010 },
  { id: 'hrustovacka', type: 'year', y: -2550, from: -4000, to: -1000 },
  { id: 'ime', type: 'choice', ok: 2 },
  { id: 'grobovi', type: 'choice', ok: 3 },
  { id: 'popis', type: 'choice', ok: 3 },
  { id: 'banovina', type: 'choice', ok: 2 },
  { id: 'majdan', type: 'choice', ok: 2 },
  { id: 'put', type: 'choice', ok: 3 },
  { id: 'mren', type: 'choice', ok: 2 },
  { id: 'varos', type: 'choice', ok: 2 }
];
