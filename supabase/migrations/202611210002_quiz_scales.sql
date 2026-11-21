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
('povrsina', 'priroda', 'num', 'Kolika je površina općine Sanski Most?', 'What is the area of the Sanski Most municipality?', 300, 1300, 781, 'km²', '781,17 km² prema podacima općine. Samo gradsko naselje zauzima 12,90 km².', '781.17 km² according to the municipality. The town itself covers 12.90 km².', 'Općina Sanski Most: Otkrijte Sanski Most', 'https://sanskimost.gov.ba/otkrijte-sanski-most-biser-krajine-koji-spaja-prirodu-i-tradiciju/');
commit;
