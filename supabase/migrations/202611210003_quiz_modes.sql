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
('prijatelji-6',2009),
('trke-1',2010),
('poplava-2014-a',2014),
('poplava-2014-b',2014),
('poplava-2014-kamion',2014),
('poplava-2014-konj',2014),
('sana-2014',2014),
('musalla-ljeto',2018),
('bliha-ljeto',2019),
('petica-start',2026);

create or replace function public.quiz_start(p_player uuid, p_size integer, p_scales boolean, p_mode text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  token uuid;
  ids text[];
  questions jsonb;
  photo_max integer := extract(year from now() at time zone 'Europe/Sarajevo');
  photo_count integer;
  scale_count integer;
begin
  if p_player is null or p_size is null or p_mode is null or not ((p_mode='quiz' and p_size in (10,20)) or (p_mode='mix' and p_size=10) or (p_mode='surv' and p_size=80)) then raise exception 'invalid_game'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_player::text,0));
  if (select count(*) from quiz_private.attempts where player=p_player and mode=p_mode and cardinality(question_ids)=p_size
      and started_at >= (date_trunc('day',now() at time zone 'Europe/Sarajevo') at time zone 'Europe/Sarajevo')) >= 3
  then raise exception 'daily_limit'; end if;
  photo_count := case when p_mode='mix' then 6 else 0 end;
  scale_count := case when p_mode='surv' or (p_mode='quiz' and p_scales is false) then 0 when p_mode='mix' then 2 else p_size/5 end;
  with picked as (
    (select q.* from quiz_private.questions q where active and kind='choice'
     order by random() limit (p_size-photo_count-scale_count))
    union all
    (select q.* from quiz_private.questions q where active and kind in ('year','num')
     order by random() limit scale_count)
  ), rounds as (
    select id,jsonb_build_object('id',id,'q',jsonb_build_array(question_bs,question_en),
      'bs',options_bs,'en',options_en,'kind',kind,'f',scale_min,'to',scale_max,'u',unit) as payload,
      random() as draw from picked
    union all
    (select 'photo:'||id,jsonb_build_object('kind','photo','photo',id,'to',photo_max),random()
     from (select id from quiz_private.photos order by random() limit photo_count) photos)
  )
  select array_agg(id order by draw),jsonb_agg(payload order by draw) into ids,questions from rounds;
  if cardinality(ids) is distinct from p_size then raise exception 'insufficient_questions'; end if;
  insert into quiz_private.attempts(player, question_ids, score, mode, photo_max) values(p_player, ids, 0, p_mode, photo_max) returning id into token;
  return jsonb_build_object('token',token,'questions',questions);
end $$;

create or replace function public.quiz_start(p_player uuid, p_size integer, p_scales boolean)
returns jsonb language sql security invoker set search_path = '' as $$
  select public.quiz_start(p_player,p_size,p_scales,'quiz')
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
  if game.completed_at is not null and p_round>n then raise exception 'game_finished'; end if;
  if left(game.question_ids[p_round],6)='photo:' then
    select taken_year into strict q.target from quiz_private.photos where id=substr(game.question_ids[p_round],7);
    q.kind := 'photo';
    q.scale_min := 1900;
    q.scale_max := game.photo_max;
  else
    select * into strict q from quiz_private.questions where id=game.question_ids[p_round];
  end if;
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
    if game.mode='surv' and points=0 then game.mistakes := game.mistakes+1; end if;
    update quiz_private.attempts set mistakes=game.mistakes, answers=answers || to_jsonb(p_choice),
      score=score+points,
      completed_at=case when p_round=cardinality(question_ids) or game.mistakes=3 then now() end where id=p_token;
  end if;
  return jsonb_build_object('choice', guess,'ok',q.correct_option,'target',q.target,'points',points,
    'a',jsonb_build_array(q.explanation_bs,q.explanation_en),'source',jsonb_build_object('n',q.source_name,'u',q.source_url));
end $$;

create or replace function public.quiz_board(p_size integer, p_mode text)
returns table(display_name text, score integer) language sql stable security definer set search_path = '' as $$
  select r.display_name,r.score from quiz_private.results r join quiz_private.attempts a on a.id=r.attempt_id
  where a.mode=p_mode and cardinality(a.question_ids)=p_size order by r.score desc,r.created_at,r.id limit 10
$$;
create or replace function public.quiz_board(p_size integer)
returns table(display_name text, score integer) language sql stable security invoker set search_path = '' as $$
  select * from public.quiz_board(p_size,'quiz')
$$;
revoke all on function public.quiz_start(uuid,integer,boolean,text),public.quiz_board(integer,text) from public,authenticated;
grant execute on function public.quiz_start(uuid,integer,boolean,text),public.quiz_board(integer,text) to anon;
notify pgrst,'reload schema';
commit;
