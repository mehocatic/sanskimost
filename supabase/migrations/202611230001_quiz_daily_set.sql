-- 23 Nov 2026: the ranked game gives everyone the same questions on the same day, one attempt per day for each game,
-- and the board shows that day's results. Also: 30 weak questions are switched off, 18 new ones are added, and the
-- archive photos with a year (38 new ones) can now be drawn. Paste the whole file into the Supabase SQL Editor and run it.
-- It can be run more than once.
begin;

-- weak questions: off the air (kept in the table)
update quiz_private.questions set active = false where id in ('biscevic62', 'brajicgr', 'galerijafaber', 'golfcert', 'golfdatum', 'golfdokaz', 'golfgrad', 'golfklub', 'golfmodel', 'hadzijadip', 'kadiluk', 'kotar1910', 'kotarst', 'kraljevina29', 'muharemotac', 'ocimaljubavi', 'ostrastan', 'petrez', 'postanski', 'povgrad', 'pozivni', 'shs', 'srez8', 'srez87', 'stan1931', 'stan1941', 'trkeulice', 'tzlezaji', 'tzulica', 'varos');

-- new questions (choice), the same as js/data/pogodi-data.js
insert into quiz_private.questions (id, category, question_bs, question_en, options_bs, options_en, correct_option, explanation_bs, explanation_en, source_name, source_url, active) values
('kamkap1624', 'historija', 'Od koje je godine Kamengrad bio sjedište kapetanije?', 'From what year was Kamengrad the seat of a captaincy?', '["1463", "1624", "1878", "1711"]', '["1463", "1624", "1878", "1711"]', 2, 'Od 1624. Kamengrad je sjedište kapetanije, kojoj su pripadale i varošice Stari Majdan i Vakuf (Sanski Most).', 'From 1624 Kamengrad was the seat of a captaincy that also included the small towns of Stari Majdan and Vakuf (Sanski Most).', 'Zavod za zaštitu kulturnog naslijeđa USK: Musalla u Kamengradu', 'https://www.kulturnonaslijedjeusk.ba/bs/clanak/graditeljska-cjelina-musalla-u-kamengradu-sa-grebljem/52', true),
('vakuf', 'historija', 'Kako se u osmanskom periodu zvala varošica iz koje se razvio današnji Sanski Most?', 'What was the small Ottoman-era town that grew into today’s Sanski Most called?', '["Vakuf", "Palanka", "Madeni Atik", "Hrustovo"]', '["Vakuf", "Palanka", "Madeni Atik", "Hrustovo"]', 1, 'Vakuf. Kapetaniji Kamengrad pripadale su varošice Stari Majdan i Vakuf, današnji Sanski Most.', 'Vakuf. The Kamengrad captaincy included the small towns of Stari Majdan and Vakuf, today’s Sanski Most.', 'Zavod za zaštitu kulturnog naslijeđa USK: Musalla u Kamengradu', 'https://www.kulturnonaslijedjeusk.ba/bs/clanak/graditeljska-cjelina-musalla-u-kamengradu-sa-grebljem/52', true),
('kamdizdar', 'historija', 'Ko je u osmanskom periodu zapovijedao posadom tvrđave Kamengrad?', 'Who commanded the garrison of Kamengrad fortress in the Ottoman period?', '["Dizdar", "Kadija", "Muftija", "Vezir"]', '["A dizdar", "A kadi", "A mufti", "A vizier"]', 1, 'Dizdar. Policijske poslove u podgrađu obavljao je subaša, a kasnije vojvoda.', 'A dizdar. Police work in the town below was done by a subaša, and later by a vojvoda.', 'Zavod za zaštitu kulturnog naslijeđa USK: Musalla u Kamengradu', 'https://www.kulturnonaslijedjeusk.ba/bs/clanak/graditeljska-cjelina-musalla-u-kamengradu-sa-grebljem/52', true),
('palanka', 'historija', 'Kako se u narodu zvao Donji grad, utvrđena varošica podno Kamengrada?', 'What did people call the lower town, the fortified settlement below Kamengrad?', '["Palanka", "Varoš", "Čaršija", "Mahala"]', '["Palanka", "Varoš", "Čaršija", "Mahala"]', 1, 'Palanka. Bila je zaštićena zidovima s palisadama, a u nju se stanovništvo sklanjalo tokom sukoba.', 'Palanka. It was protected by walls with palisades, and people took shelter there during fighting.', 'Bosna.hr: U sjeni Kamengrada', 'https://bosna.hr/u-sjeni-kamengrada-musalla-kao-svjedocanstvo-prvog-susreta-bosne-s-islamom/', true),
('palankazid', 'historija', 'Koliko su bili visoki zidovi s palisadama oko Palanke podno Kamengrada?', 'How high were the walls with palisades around Palanka, below Kamengrad?', '["1 do 2 m", "5 do 7 m", "12 do 15 m", "Oko 25 m"]', '["1 to 2 m", "5 to 7 m", "12 to 15 m", "About 25 m"]', 2, 'Od pet do sedam metara.', 'Five to seven metres.', 'Bosna.hr: U sjeni Kamengrada', 'https://bosna.hr/u-sjeni-kamengrada-musalla-kao-svjedocanstvo-prvog-susreta-bosne-s-islamom/', true),
('divic', 'priroda', 'Kako se zove najviši vrh planine Mulež?', 'What is the highest peak of Mulež mountain called?', '["Veliki Divić", "Crni vrh", "Lisina", "Klekovača"]', '["Veliki Divić", "Crni vrh", "Lisina", "Klekovača"]', 1, 'Veliki Divić, 1.013 m. Crni vrh je najviši vrh Grmeča.', 'Veliki Divić, 1,013 m. Crni vrh is the highest peak of Grmeč.', 'Planinarenje.ba: Mulež', 'https://planinarenje.ba/planinarski-imenik/planine/1013-mulez', true),
('divic1013', 'priroda', 'Koliko je visok Veliki Divić, najviši vrh Muleža?', 'How high is Veliki Divić, the highest peak of Mulež?', '["613 m", "1.013 m", "1.605 m", "836 m"]', '["613 m", "1,013 m", "1,605 m", "836 m"]', 2, '1.013 m nadmorske visine.', '1,013 m above sea level.', 'Planinarenje.ba: Mulež', 'https://planinarenje.ba/planinarski-imenik/planine/1013-mulez', true),
('mracaj', 'priroda', 'Koliko je pećine Mračaj, kod izvora Sane, istraženo do 2024?', 'How much of Mračaj cave, at the source of the Sana, had been explored by 2024?', '["Oko 400 m", "Oko 1.350 m", "Oko 5 km", "Oko 150 m"]', '["About 400 m", "About 1,350 m", "About 5 km", "About 150 m"]', 2, 'Do 2012. bilo je istraženo 400 m, a nakon ekspedicija 2023. i 2024. oko 1.350 m.', 'By 2012, 400 m had been explored; after the expeditions of 2023 and 2024, about 1,350 m.', 'Republički zavod: Speleoronilačka ekspedicija u SP Vrela Sane (2024)', 'https://nasljedje.org/speleoronilacka-ekspedicija-u-sp-vrela-sane/', true),
('zavnobnova', 'historija', 'Kada je zvanično počela obnova zgrade ZAVNOBiH-a u Sanskom Mostu?', 'When did the rebuilding of the ZAVNOBiH building in Sanski Most officially begin?', '["Oktobra 2026.", "Jula 1944.", "Maja 1996.", "Septembra 2012."]', '["October 2026", "July 1944", "May 1996", "September 2012"]', 1, 'Izvođač i nadzorni organ uvedeni su u radove 27. oktobra 2026. Zgrada je zapaljena 1995.', 'The contractor and the supervisor started work on 27 October 2026. The building was burnt in 1995.', 'RTV USK: Zvanično počela obnova zgrade ZAVNOBiH-a', 'https://www.rtvusk.ba/clanak/sanski-most-zvanicno-pocela-obnova-zgrade-zavnobih-a-nacionalnog-spomenika-unistenog-1995-godine/18843', true),
('zavdekl', 'historija', 'Koji je dokument donesen 1. jula 1944. na Drugom zasjedanju ZAVNOBiH-a u Sanskom Mostu?', 'Which document was issued on 1 July 1944 at the Second Session of ZAVNOBiH in Sanski Most?', '["Deklaracija o pravima građana Bosne i Hercegovine", "Ustav SFRJ", "Daytonski sporazum", "Povelja kralja Bele IV"]', '["The Declaration on the Rights of the Citizens of Bosnia and Herzegovina", "The Constitution of Yugoslavia", "The Dayton Agreement", "The charter of King Béla IV"]', 1, 'Deklaracija o pravima građana Bosne i Hercegovine.', 'The Declaration on the Rights of the Citizens of Bosnia and Herzegovina.', 'Parlamentarna skupština BiH: ZAVNOBiH', 'https://parlament.ba/Content/Read/181?lang=en', true),
('zavmisije', 'historija', 'Vojne misije kojih su zemalja prisustvovale Drugom zasjedanju ZAVNOBiH-a u Sanskom Mostu?', 'The military missions of which countries attended the Second Session of ZAVNOBiH in Sanski Most?', '["Sovjetskog Saveza, Velike Britanije i SAD-a", "Francuske i Italije", "Njemačke i Austrije", "Grčke i Turske"]', '["The Soviet Union, Great Britain and the USA", "France and Italy", "Germany and Austria", "Greece and Turkey"]', 1, 'Savezničke vojne misije Sovjetskog Saveza, Velike Britanije i SAD-a.', 'The Allied military missions of the Soviet Union, Great Britain and the USA.', 'Parlamentarna skupština BiH: ZAVNOBiH', 'https://parlament.ba/Content/Read/181?lang=en', true),
('majdanpotok', 'znamenitosti', 'Preko kojeg potoka vodi kameni Rimski most u Starom Majdanu?', 'Which stream does the stone Roman bridge in Stari Majdan cross?', '["Gračanica", "Bliha", "Dabar", "Zdena"]', '["Gračanica", "Bliha", "Dabar", "Zdena"]', 1, 'Preko potoka Gračanica, u centru Starog Majdana.', 'The Gračanica stream, in the centre of Stari Majdan.', 'Wikipedia: Most u Starom Majdanu', 'https://bs.wikipedia.org/wiki/Most_u_Starom_Majdanu', true),
('majdan2008', 'znamenitosti', 'Koje je godine most u Starom Majdanu proglašen nacionalnim spomenikom?', 'In what year was the bridge in Stari Majdan declared a national monument?', '["2003", "2008", "2014", "2020"]', '["2003", "2008", "2014", "2020"]', 2, 'Odlukom Komisije za očuvanje nacionalnih spomenika iz 2008.', 'By a decision of the Commission to Preserve National Monuments in 2008.', 'Dnevni avaz: Rimski most u Starom Majdanu', 'https://avaz.ba/vijesti/bih/300728/sanski-most-lukovi-rimskog-mosta-nekad-su-bili-toliko-visoki-da-je-ispod-njih-mogao-projahati-konjanik', true),
('majdanduz', 'znamenitosti', 'Koliko je dug Rimski most u Starom Majdanu?', 'How long is the Roman bridge in Stari Majdan?', '["Oko 8 m", "Oko 25 m", "Oko 60 m", "Oko 120 m"]', '["About 8 m", "About 25 m", "About 60 m", "About 120 m"]', 1, '8,40 m, a širok je 4,25 m.', '8.40 m, and it is 4.25 m wide.', 'Wikipedia: Most u Starom Majdanu', 'https://bs.wikipedia.org/wiki/Most_u_Starom_Majdanu', true),
('majdanlukovi', 'znamenitosti', 'Koliko lukova ima Rimski most u Starom Majdanu?', 'How many arches does the Roman bridge in Stari Majdan have?', '["Jedan", "Dva", "Tri", "Pet"]', '["One", "Two", "Three", "Five"]', 2, 'Dva polukružna luka, oslonjena na obale i središnji stub.', 'Two semicircular arches, resting on the banks and a central pier.', 'Wikipedia: Most u Starom Majdanu', 'https://bs.wikipedia.org/wiki/Most_u_Starom_Majdanu', true),
('majdandjulad', 'historija', 'Šta se u osmanskom periodu najviše izrađivalo od željeza iz Starog Majdana?', 'What was mostly made from the iron of Stari Majdan in the Ottoman period?', '["Topovska đulad i puščane cijevi", "Potkovice i čavli", "Kovanice", "Crkvena zvona"]', '["Cannonballs and rifle barrels", "Horseshoes and nails", "Coins", "Church bells"]', 1, 'Najviše topovska đulad, ali i puščane cijevi.', 'Mostly cannonballs, but also rifle barrels.', 'Zavod za zaštitu kulturnog naslijeđa USK: Most u Starom Majdanu', 'https://www.kulturnonaslijedjeusk.ba/bs/clanak/most-u-starom-majdanu-poznat-kao-rimski-most-historijski-spomenik-sanski-most/77', true),
('korc316', 'znamenitosti', 'Koliko je palih boraca, prema lokalnim izvorima, sahranjeno u dvije grobnice na Korčanici?', 'According to local sources, how many fallen fighters are buried in the two tombs at Korčanica?', '["116", "316", "1.316", "36"]', '["116", "316", "1,316", "36"]', 2, 'Posmrtni ostaci 316 palih boraca NOVJ.', 'The remains of 316 fallen Partisan fighters.', 'PD Klekovača: Ćopićevim stazama', 'https://www.pdklekovaca.org/?p=5560', true),
('radiosana96', 'historija', 'Kojeg se dana 1996. Radio Sana ponovo javio slušaocima u Sanskom Mostu?', 'On which day in 1996 did Radio Sana go back on air in Sanski Most?', '["13. januara", "10. oktobra", "1. maja", "25. novembra"]', '["13 January", "10 October", "1 May", "25 November"]', 1, '13. januara 1996. spiker se javio riječima „Ovdje Radio Sana, Sanski Most“.', 'On 13 January 1996 the announcer opened with the words “Ovdje Radio Sana, Sanski Most”.', 'Inmedia (Emir Tabaković)', 'https://inmedia.ba/1996-godina-ovdje-radio-sana-emir-tabakovic/', true)
on conflict (id) do update set
  category = excluded.category,
  question_bs = excluded.question_bs, question_en = excluded.question_en,
  options_bs = excluded.options_bs, options_en = excluded.options_en,
  correct_option = excluded.correct_option,
  explanation_bs = excluded.explanation_bs, explanation_en = excluded.explanation_en,
  source_name = excluded.source_name, source_url = excluded.source_url,
  active = true;

-- every photograph of the quiz pool (js/pogodi.js POOL), with its year
insert into quiz_private.photos (id, taken_year) values
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
('plivaci-3',1983),
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
('ulica-1997-b',1997),
('zuta-zgrada-1997',1997),
('bajram-1998',1998),
('dzamija-gradnja-a',1998),
('dzamija-gradnja-b',1998),
('dzamija-gradnja-c',1998),
('dzamija-gradnja-d',1998),
('dzamija-ulica-1998',1998),
('muhici-1998-a',1998),
('muhici-1998-b',1998),
('muhici-1998-c',1998),
('prijatelji-1',2009),
('prijatelji-2',2009),
('prijatelji-3',2009),
('prijatelji-4',2009),
('prijatelji-5',2009),
('prijatelji-6',2009),
('prijatelji-7',2009),
('trke-1',2010),
('trke-2',2010),
('trke-3',2010),
('trke-4',2010),
('poplava-2014-a',2014),
('poplava-2014-b',2014),
('poplava-2014-kamion',2014),
('poplava-2014-konj',2014),
('sana-2014',2014),
('musalla-ljeto',2018),
('bliha-ljeto',2019),
('bliha-jesen',2021),
('petica-start',2026),
('rat-1944-b',1944),
('masinski-most-1956',1956),
('poplava-1976',1976),
('most-hotel-1970',1970),
('docek-1972',1972),
('autobus-sip-1966',1966),
('slet-1962',1962),
('docek-hadzije-1968',1968),
('poplava-2014-kolibica',2014),
('poplava-2014-most-a',2014),
('poplava-2014-most-b',2014),
('poplava-2014-ulica',2014),
('srusen-most-1943',1943),
('novi-most-2012-a',2012),
('novi-most-2012-b',2012),
('novi-most-2012-c',2012),
('novi-most-2012-d',2012),
('novi-most-2012-e',2012),
('novi-most-2013-a',2013),
('novi-most-2013-b',2013),
('novi-most-2013-c',2013),
('novi-most-2013-d',2013),
('novi-most-2013-e',2013),
('delegati-zavnobih',1944),
('rodic-1944',1944),
('rekord-golf-a',2026),
('rekord-golf-b',2026)
on conflict (id) do update set taken_year = excluded.taken_year;

-- the same questions for everyone on the same day: the draw is a hash of the question id, the day (Sarajevo time),
-- the game and its length, instead of random(); one attempt per day for each game and length
create or replace function public.quiz_start(p_player uuid, p_size integer, p_scales boolean, p_mode text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  token uuid;
  ids text[];
  questions jsonb;
  photo_max integer := extract(year from now() at time zone 'Europe/Sarajevo');
  photo_count integer;
  scale_count integer;
  day_key text := to_char(now() at time zone 'Europe/Sarajevo', 'YYYY-MM-DD') || '|' || p_mode || '|' || p_size;
begin
  if p_player is null or p_size is null or p_mode is null or not ((p_mode='quiz' and p_size in (10,20)) or (p_mode='mix' and p_size=10) or (p_mode='surv' and p_size=80)) then raise exception 'invalid_game'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_player::text,0));
  if (select count(*) from quiz_private.attempts where player=p_player and mode=p_mode and cardinality(question_ids)=p_size
      and started_at >= (date_trunc('day',now() at time zone 'Europe/Sarajevo') at time zone 'Europe/Sarajevo')) >= 1
  then raise exception 'daily_limit'; end if;
  photo_count := case when p_mode='mix' then 6 else 0 end;
  scale_count := case when p_mode='surv' or (p_mode='quiz' and p_scales is false) then 0 when p_mode='mix' then 2 else p_size/5 end;
  with picked as (
    (select q.* from quiz_private.questions q where active and kind='choice'
     order by md5(q.id || '|' || day_key) limit (p_size-photo_count-scale_count))
    union all
    (select q.* from quiz_private.questions q where active and kind in ('year','num')
     order by md5(q.id || '|' || day_key) limit scale_count)
  ), rounds as (
    select id,jsonb_build_object('id',id,'q',jsonb_build_array(question_bs,question_en),
      'bs',options_bs,'en',options_en,'kind',kind,'f',scale_min,'to',scale_max,'u',unit) as payload,
      md5('order|' || id || '|' || day_key) as draw from picked
    union all
    (select 'photo:'||id,jsonb_build_object('kind','photo','photo',id,'to',photo_max),md5('order|photo:' || id || '|' || day_key)
     from (select id from quiz_private.photos order by md5(id || '|' || day_key) limit photo_count) photos)
  )
  select array_agg(id order by draw),jsonb_agg(payload order by draw) into ids,questions from rounds;
  if cardinality(ids) is distinct from p_size then raise exception 'insufficient_questions'; end if;
  insert into quiz_private.attempts(player, question_ids, score, mode, photo_max) values(p_player, ids, 0, p_mode, photo_max) returning id into token;
  return jsonb_build_object('token',token,'questions',questions);
end $$;

-- the board: today's ten best for this game (everyone played the same questions today)
create or replace function public.quiz_board(p_size integer, p_mode text)
returns table(display_name text, score integer) language sql stable security definer set search_path = '' as $$
  select r.display_name,r.score from quiz_private.results r join quiz_private.attempts a on a.id=r.attempt_id
  where a.mode=p_mode and cardinality(a.question_ids)=p_size
    and a.started_at >= (date_trunc('day',now() at time zone 'Europe/Sarajevo') at time zone 'Europe/Sarajevo')
  order by r.score desc,r.created_at,r.id limit 10
$$;
revoke all on function public.quiz_start(uuid,integer,boolean,text),public.quiz_board(integer,text) from public,authenticated;
grant execute on function public.quiz_start(uuid,integer,boolean,text),public.quiz_board(integer,text) to anon;

notify pgrst, 'reload schema';
commit;
