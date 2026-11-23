# Tehničke sitnice (za kasnije)

Stanje na 23.11.2026. Sajt je objavljen na https://sanausrcu.netlify.app/ (Netlify, novi nalog).
Označi stavku kad je urađena.

## Prvo provjeriti
- [x] **Nova migracija pitanja (primijenjena 22.11.2026., baza ima 289 aktivnih pitanja):** `supabase/migrations/202611220001_quiz_new_questions.sql` (109 pitanja i izmjena teksta pitanja o Blihi). Zalijepiti cijeli fajl u Supabase SQL Editor i pokrenuti. Može se pokrenuti više puta bez duplikata.
- [x] **Supabase migracije.** Migracija `supabase/migrations/202611210003_quiz_modes.sql` (načini igre) je primijenjena (provjereno 23.11.2026.: funkcija `quiz_start` na bazi prima `p_mode`). Ostaje odigrati "Igraj za rang-listu" u sva tri načina na telefonu (stavka ispod).
- [ ] **Telefon.** Odigraj dnevni izazov i otvori /arhiv na pravom telefonu. Provjeri i dijeljenje rezultata (Viber, WhatsApp).
- [x] **Adresa.** Ostajemo na `sanausrcu.netlify.app` (22. 11. 2026). Stara adresa `visitsanskimost.netlify.app` je zamijenjena u `og:url` i slikama u HTML fajlovima, `sitemap.xml`, `robots.txt` i `pogodi.js` (tekst na kartici rezultata). Ako se projekat kasnije preimenuje, zamijeniti `sanausrcu.netlify.app` na istim mjestima.

## Netlify
- [ ] **Pravilo objave.** Build radi samo ako zadnji commit sadrži `[deploy]` (pravilo u `netlify.toml`). Zadnji commit s tom oznakom objavljuje sve prije sebe. Preporuka: objavljivati u grupama, ne svaki commit.
- [ ] **Dva sajta, jedan repozitorij.** Stari i novi Netlify sajt grade isti `main`. Ako ne trebaju oba, ugasiti jedan (Site configuration, Delete site).
- [ ] **Varijable okruženja na novom sajtu:** `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (obje označene kao tajne) i `SECRETS_SCAN_OMIT_KEYS=SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY`. Treća je potrebna jer se obje vrijednosti upisuju u javni `quiz-config.js`, pa bi Netlifyjevo skeniranje tajni inače prekinulo build. Ne brisati je.
- [ ] **Ključevi.** Ključ `service_role` ili bilo koji drugi tajni Supabase ključ nikad ne ide u sajt ni u Netlify varijable ovog sajta. Dovoljan je `sb_publishable_` ključ.

## Pretraga i vidljivost
- [ ] Dodati sajt u Google Search Console i poslati `sitemap.xml` (sada ima i stranice Šušnjara i mosta u Starom Majdanu).
- [x] `robots.txt` i `sitemap.xml` su na `sanausrcu.netlify.app` (22.11.2026.).
- [ ] Canonical tagovi još ne postoje ni na jednoj stranici.

## Podaci i sigurnosne kopije
- [ ] **Originali fotografija** su samo na ovom računaru (`originals/` nije u gitu, a novi su u `originals/arhiv/`). Kopirati folder na vanjski disk ili cloud.
- [ ] Sačuvati i izvorni folder `Downloads/nekeSlikeSanskiMost` i dokument `noviDokumentZaPregled.docx`.

## Fotografije: autorska prava
Oznake na fotografijama su ostavljene, a kredit je upisan u arhiv (polje izvora) i na stranicama mjesta:
- [x] **SanUM** (Meho, 23.11.2026.: fotografije nisu njihove): oznaka uklonjena sa poplava-valjak, poplava-odozgo, masinski-most-1956, centar-cvijece (popravkom tog dijela) i mulez-pogled (odsječen donji rub). Verzije s oznakom su u `originals/arhiv/*-sa-oznakom.webp`.
- [ ] **Foto: Grgić**: sana-led-a, sana-led-b, sana-led-c.
- [x] **ArchitectonicTravels**: photos/susnjar.webp je dokumentacijska fotografija Zavoda USK. Kredit "ArchitectonicTravels · arhiv Zavoda USK" s linkom na Zavod (23.11.2026.), oznaka ostaje.
- [x] **aukcije.hr**: photos/arhiv/blihe-1942.webp. Oznaka uklonjena 23.11.2026. (Meho), izvor obrisan; verzija s oznakom je u `originals/arhiv/blihe-1942-sa-oznakom.webp`.
Za svaku: pitati vlasnika za dozvolu, ili zamijeniti fotografijom koja je naša ili ima dozvoljenu licencu (npr. Wikimedia Commons CC0).

## Provjera unosa (`TODO(verify)` u kodu)
Nalaze se u komentarima `places.js`, `licnosti-data.js` i `index.html`. Pregled: `grep -rn "TODO(verify)" .`
- [ ] Opisi koji počivaju na komentarima čitalaca (Tito 1972, poplava 1976 i Alagića sokak, štafeta mladosti).
- [ ] Doček hadžije Muharema Zukića 1968 (protumačen iz naziva fajla).
- [ ] Godine iz naziva fajlova: gradnja novog mosta (2012. i 2013.), Mašinski most 1956.
- [ ] Stari Majdan: lokacija mosta, starost, godina proglašenja spomenikom, autor fotografije.
- [ ] Autori fotografija bez oznake (Blihe staza, Stari Majdan, pećina Mračaj).
- [ ] Mračaj: datum ekspedicije i dužina (1100 m iz dokumenta nije potvrđena).
- [ ] Nove fotografije imaju `quiz: false`. Kad se godine potvrde, ukloniti tu oznaku pa mogu u kviz.

## Kviz
- [ ] Baza pitanja: 289 aktivnih u bazi (22.11.2026.), cilj 400. Svako pitanje mora imati izvor u `KVS` (`node tools/provjeri-pogodi.js` provjerava).
- [ ] Fotografije godina u kvizu postoje na dva mjesta: `arhiv-data.js` i SQL (`quiz_private.photos`). Kad se dodaje fotografija za rang igru, dodati je u oba.
