begin;
alter table quiz_private.questions
  add column kind text not null default 'choice',
  add column scale_min integer,
  add column scale_max integer,
  add column target integer,
  add column unit text,
  alter column options_bs drop not null,
  alter column options_en drop not null,
  alter column correct_option drop not null,
  add constraint quiz_question_format check (
    (kind = 'choice' and options_bs is not null and options_en is not null and correct_option is not null
      and scale_min is null and scale_max is null and target is null and unit is null)
    or (kind in ('year','num') and options_bs is null and options_en is null and correct_option is null
      and scale_min is not null and scale_max is not null and target is not null
      and scale_max > scale_min and target between scale_min and scale_max
      and ((kind='year' and unit is null) or (kind='num' and unit is not null)))
  );
create or replace function public.quiz_start(p_player uuid, p_size integer, p_scales boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  token uuid;
  ids text[];
  questions jsonb;
begin
  if p_player is null or p_size is null or p_size not in (10,20) then raise exception 'invalid_game'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_player::text,0));
  if (select count(*) from quiz_private.attempts where player=p_player and cardinality(question_ids)=p_size
      and started_at >= (date_trunc('day',now() at time zone 'Europe/Sarajevo') at time zone 'Europe/Sarajevo')) >= 3
  then raise exception 'daily_limit'; end if;
  with pool as (
    (select q.*, random() as draw from quiz_private.questions q where active and kind='choice'
     order by draw limit (p_size - case when p_scales then p_size/5 else 0 end))
    union all
    (select q.*, random() as draw from quiz_private.questions q where active and kind<>'choice'
     order by draw limit (case when p_scales then p_size/5 else 0 end))
  ), shuffled as (select pool.*, random() as position from pool)
  select array_agg(id order by position), jsonb_agg(jsonb_build_object('id', id, 'q', jsonb_build_array(question_bs,question_en),
    'bs', options_bs, 'en', options_en, 'kind', kind, 'f',scale_min,'to',scale_max,'u',unit) order by position) into ids, questions
  from shuffled;
  if cardinality(ids) is distinct from p_size then raise exception 'insufficient_questions'; end if;
  insert into quiz_private.attempts(player, question_ids, score) values(p_player, ids, 0) returning id into token;
  return jsonb_build_object('token',token,'questions',questions);
end $$;

-- Cached clients still request a choice-only game.
create or replace function public.quiz_start(p_player uuid, p_size integer)
returns jsonb language sql security invoker set search_path = '' as $$
  select public.quiz_start(p_player,p_size,false)
$$;

create or replace function public.quiz_answer(p_token uuid, p_round integer, p_choice integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  game quiz_private.attempts;
  q quiz_private.questions;
  n integer;
  guess integer;
  points integer;
  cutoff integer;
begin
  select * into strict game from quiz_private.attempts where id=p_token for update;
  n := jsonb_array_length(game.answers);
  if p_round is null or p_choice is null or p_round not between 1 and cardinality(game.question_ids)
    or p_round > n+1 then raise exception 'invalid_answer'; end if;
  select * into strict q from quiz_private.questions where id=game.question_ids[p_round];
  guess := coalesce((game.answers->>(p_round-1))::int,p_choice);
  if q.kind='choice' then
    if guess not between 1 and 4 then raise exception 'invalid_answer'; end if;
    points := case when guess=q.correct_option then 100 else 0 end;
  else
    if guess not between q.scale_min and q.scale_max
       or (q.scale_max-q.scale_min>1000 and mod(guess-q.scale_min,10)<>0)
    then raise exception 'invalid_answer'; end if;
    cutoff := greatest(1, round((q.scale_max-q.scale_min)*0.22));
    points := greatest(0, floor(100*(1-abs(guess-q.target)::double precision/cutoff)+0.5));
  end if;
  if p_round=n+1 then
    update quiz_private.attempts set answers=answers || to_jsonb(p_choice),
      score=score+points,
      completed_at=case when p_round=cardinality(question_ids) then now() end where id=p_token;
  end if;
  return jsonb_build_object('choice', guess,'ok',q.correct_option,'target',q.target,'points',points,
    'a',jsonb_build_array(q.explanation_bs,q.explanation_en),'source',jsonb_build_object('n',q.source_name,'u',q.source_url));
end $$;

revoke all on function public.quiz_start(uuid,integer,boolean) from public, authenticated;
grant execute on function public.quiz_start(uuid,integer,boolean) to anon;

insert into quiz_private.questions (id,category,kind,question_bs,question_en,scale_min,scale_max,target,unit,explanation_bs,explanation_en,source_name,source_url) values
('blihamon', 'priroda', 'year', 'Koje je godine vodopad Blihe proglašen prirodnim spomenikom?', 'In what year was the Bliha waterfall declared a natural monument?', 1930, 2000, 1965, null, '1965.', '1965.', 'Wikipedia: Bliha Falls', 'https://en.wikipedia.org/wiki/Bliha_Falls'),
('povrsina', 'priroda', 'num', 'Kolika je površina općine Sanski Most?', 'What is the area of the Sanski Most municipality?', 300, 1300, 781, 'km²', '781,17 km² prema podacima općine. Samo gradsko naselje zauzima 12,90 km².', '781.17 km² according to the municipality. The town itself covers 12.90 km².', 'Općina Sanski Most: Otkrijte Sanski Most', 'https://sanskimost.gov.ba/otkrijte-sanski-most-biser-krajine-koji-spaja-prirodu-i-tradiciju/'),
('mrenpom', 'historija', 'year', 'Oko koje se godine prvi put spominje naselje Mren, iz kojeg se razvio Sanski Most?', 'Around what year is the settlement Mren, from which Sanski Most grew, first mentioned?', 600, 1000, 820, null, 'Oko 820. godine. Razvoj grada iz tog naselja tekao je sporo.', 'Around the year 820. The town developed slowly from that settlement.', 'Općina Sanski Most: Historija općine', 'https://sanskimost.gov.ba/historija-opcine-sanski-most/'),
('kamengrad', 'historija', 'year', 'Kad se prvi put spominje tvrđava Kamengrad, tada posjed knezova Babonića Blagajskih?', 'When is Kamengrad fortress first mentioned, then the property of the Babonić Blagajski princes?', 1200, 1500, 1374, null, 'Kamengrad se prvi put spominje 1374. Tada je bio posjed knezova Babonića Blagajskih.', 'Kamengrad is first mentioned in 1374. It was then the property of the Babonić Blagajski princes.', 'Wikipedia: Kamengrad Fort', 'https://en.wikipedia.org/wiki/Kamengrad_Fort'),
('bela', 'historija', 'year', 'Koje je godine kralj Bela IV izdao povelju, najstariji poznati dokument koji imenuje Sanu?', 'In what year did King Béla IV issue the charter, the oldest known document to name the Sana?', 1100, 1400, 1244, null, 'Povelja kralja Bele IV od 20. jula 1244. imenuje Sanu uz župe Donjih krajeva: Dubicu, Mren i Vrbašku.', 'King Béla IV’s charter of 20 July 1244 names the Sana among the counties of the Lower Lands: Dubica, Mren and Vrbaška.', 'Općina Sanski Most: Historija općine', 'https://sanskimost.gov.ba/historija-opcine-sanski-most/'),
('krupa', 'historija', 'year', 'Koje su godine Turci zauzeli Krupu, nakon čega Kamengrad gubi raniji značaj?', 'In what year did the Turks take Krupa, after which Kamengrad lost its former importance?', 1500, 1650, 1565, null, '1565.', '1565.', 'Općina Sanski Most: Historija općine', 'https://sanskimost.gov.ba/historija-opcine-sanski-most/'),
('majdan1711', 'historija', 'year', 'Koje je godine, nakon ukidanja bihaćkog sandžaka, sjedište kadiluka premješteno u Stari Majdan?', 'In what year, after the abolition of the Bihać sanjak, was the seat of the kadiluk moved to Stari Majdan?', 1650, 1800, 1711, null, '1711.', '1711.', 'Općina Sanski Most: Historija općine', 'https://sanskimost.gov.ba/historija-opcine-sanski-most/'),
('dubicki', 'historija', 'year', 'Koje je godine počeo Dubički rat?', 'In what year did the Dubica War begin?', 1700, 1850, 1788, null, '1788. Trajao je do 1791.', '1788. It lasted until 1791.', 'Općina Sanski Most: Historija općine', 'https://sanskimost.gov.ba/historija-opcine-sanski-most/'),
('hrvojsko', 'historija', 'year', 'Koje su godine hrvatske čete popalile Majdan?', 'In what year did Croatian troops burn Majdan?', 1550, 1700, 1629, null, '1629.', '1629.', 'Općina Sanski Most: Historija općine', 'https://sanskimost.gov.ba/historija-opcine-sanski-most/'),
('kapukin', 'historija', 'year', 'Koje su godine ukinute kapetanije u Bosni?', 'In what year were the captaincies abolished?', 1750, 1900, 1835, null, '1835.', '1835.', 'Općina Sanski Most: Historija općine', 'https://sanskimost.gov.ba/historija-opcine-sanski-most/'),
('okupacija', 'historija', 'year', 'Koje je godine Austro-Ugarska počela okupaciju Bosne i Hercegovine?', 'In what year did Austria-Hungary begin the occupation of Bosnia and Herzegovina?', 1850, 1920, 1878, null, '1878. Okupacija je počela 29. jula.', '1878. The occupation began on 29 July.', 'Općina Sanski Most: Historija općine', 'https://sanskimost.gov.ba/historija-opcine-sanski-most/'),
('lopta', 'historija', 'year', 'Kad je u Sanski Most stigla prva nogometna lopta, koju je donio student iz Praga?', 'When did the first football arrive in Sanski Most, brought by a student from Prague?', 1880, 1960, 1913, null, 'Krajem jula 1913. donio ju je Branko Juzbašić, student u Pragu i sin gradskog ljekara. Prvi svjetski rat prekinuo je igru, a NK Sana osnovan je 1922.', 'At the end of July 1913, brought by Branko Juzbašić, a student in Prague and the son of the town doctor. The First World War stopped the game, and NK Sana was founded in 1922.', 'Stranica Historija (ova stranica)', 'historija'),
('kraljevina29', 'historija', 'year', 'Koje je godine, 6. januara, Kraljevina SHS postala Kraljevina Jugoslavija?', 'In what year, on 6 January, did the Kingdom of Serbs, Croats and Slovenes become the Kingdom of Yugoslavia?', 1900, 1950, 1929, null, '1929. Od tada do 1941. Sanski Most je bio središte sreza u Vrbaskoj banovini.', '1929. From then until 1941 Sanski Most was the centre of a district in the Vrbas Banovina.', 'Općina Sanski Most: Historija općine', 'https://sanskimost.gov.ba/historija-opcine-sanski-most/'),
('zavnobih', 'historija', 'year', 'Koje je godine u Sanskom Mostu održano Drugo zasjedanje ZAVNOBiH-a?', 'In what year was the Second Session of ZAVNOBiH held in Sanski Most?', 1900, 2000, 1944, null, '1944. (30. juna do 2. jula). Na tom zasjedanju donesena je Deklaracija o pravima građana Bosne i Hercegovine.', '1944 (30 June to 2 July). The Declaration on the Rights of Citizens of Bosnia and Herzegovina was adopted at that session.', 'Parlamentarna skupština BiH: ZAVNOBiH', 'https://parlament.ba/Content/Read/181?lang=en'),
('pruga1914', 'historija', 'year', 'Koje je godine, krajem godine, počela raditi uskotračna pruga Prijedor, Drvar, Lička Kaldrma?', 'In what year, at the end of the year, did the narrow gauge railway Prijedor, Drvar, Lička Kaldrma start operating?', 1880, 1960, 1914, null, '1914. Pruga je duga 195 km.', '1914. The line is 195 km long.', 'Vremeplov.ba: uskotračna pruga Prijedor Lička Kaldrma', 'https://vremeplov.ba/2025/en/2025/07/17/technical-data-for-narrow-gauge-line-prijedor-licka-kaldrma-1963/'),
('prugakm', 'historija', 'num', 'Koliko je duga uskotračna pruga Prijedor, Lička Kaldrma, koja je prolazila kroz Sanski Most?', 'How long was the narrow gauge line Prijedor, Lička Kaldrma, which ran through Sanski Most?', 50, 400, 195, 'km', '195 km, s kolosijekom širine 760 mm.', '195 km, with a track gauge of 760 mm.', 'Vremeplov.ba: uskotračna pruga Prijedor Lička Kaldrma', 'https://vremeplov.ba/2025/en/2025/07/17/technical-data-for-narrow-gauge-line-prijedor-licka-kaldrma-1963/'),
('prugakraj', 'historija', 'year', 'Koje je godine ukinut saobraćaj na dionici Prijedor, Drvar?', 'In what year did traffic end on the Prijedor, Drvar section?', 1950, 2000, 1975, null, '1. juna 1975.', 'On 1 June 1975.', 'Vremeplov.ba: uskotračna pruga Prijedor Lička Kaldrma', 'https://vremeplov.ba/2025/en/2025/07/17/technical-data-for-narrow-gauge-line-prijedor-licka-kaldrma-1963/'),
('ostra1996', 'historija', 'year', 'Koje je godine Oštra Luka izdvojena iz Sanskog Mosta i pripala Republici Srpskoj?', 'In what year was Oštra Luka split from Sanski Most and ceded to Republika Srpska?', 1990, 2000, 1996, null, '1996.', '1996.', 'Wikipedia: Sanski Most', 'https://en.wikipedia.org/wiki/Sanski_Most');
commit;
