begin;
alter table quiz_private.attempts
  add column mode text not null default 'quiz' check (mode in ('quiz','mix','surv')),
  add column mistakes integer not null default 0 check (mistakes between 0 and 3),
  add column photo_max integer;
alter table quiz_private.attempts drop constraint attempts_score_check,
  add check(score between 0 and 8000);
alter table quiz_private.results drop constraint results_score_check,
  add check(score between 0 and 8000);

create table quiz_private.photos (id text primary key, taken_year integer not null);
alter table quiz_private.photos enable row level security;
revoke all on quiz_private.photos from public,anon,authenticated;
insert into quiz_private.photos(id,taken_year) values
('spomenik-1915',1915),
('crkva-sasina-1938',1938),
('kuca-progomolje-1938',1938),
('sanski-most-1938',1938),
('most-1939',1939),
('sokolski-dom',1939),
('blihe-1942',1942),
('munara-sehovci-1962',1962),
('setnja-1972',1972),
('slet-1975',1975),
('stanica-1975',1975),
('prijedorska-1976',1976),
('plivaci-2',1983),
('korida-1986',1986),
('izbori-1996',1996),
('kino-sana-1996',1996),
('posta-1996',1996),
('sana-hotel-1996',1996),
('zdena-1996',1996),
('zdena-most-1996',1996),
('centar-1997',1997),
('crkva-1997',1997),
('hotel-asi-1997',1997),
('most-1997',1997),
('prijedorska-1997-a',1997),
('prijedorska-1997-b',1997),
('prijedorska-1997-c',1997),
('prijedorska-1997-d',1997),
('sana-1997',1997),
('ulica-1997-a',1997),
('ulica-1997-b',1997);
commit;
