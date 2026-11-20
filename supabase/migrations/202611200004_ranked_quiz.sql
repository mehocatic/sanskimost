begin;
alter table quiz_private.attempts add column if not exists player uuid;
alter table quiz_private.attempts drop constraint if exists attempts_score_check;
alter table quiz_private.attempts add constraint attempts_score_check check (score between 0 and 2000);
alter table quiz_private.results drop constraint if exists results_score_check;
alter table quiz_private.results add constraint results_score_check check (score between 0 and 2000);
create index if not exists attempts_player_time on quiz_private.attempts(player, started_at);

create or replace function public.quiz_start(p_player uuid, p_size integer)
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
  select array_agg(id order by draw), jsonb_agg(jsonb_build_object('id', id, 'q', jsonb_build_array(question_bs,question_en),
    'bs', options_bs, 'en', options_en) order by draw) into ids, questions
  from (select q.*, random() as draw from quiz_private.questions q where active order by draw limit p_size) pool;
  if cardinality(ids) is distinct from p_size then raise exception 'insufficient_questions'; end if;
  insert into quiz_private.attempts(player, question_ids, score) values(p_player, ids, 0) returning id into token;
  return jsonb_build_object('token',token,'questions',questions);
end $$;

create or replace function public.quiz_answer(p_token uuid, p_round integer, p_choice integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  game quiz_private.attempts;
  q quiz_private.questions;
  n integer;
begin
  select * into strict game from quiz_private.attempts where id=p_token for update;
  n := jsonb_array_length(game.answers);
  if p_round is null or p_choice is null or p_choice not between 1 and 4 or p_round not between 1 and cardinality(game.question_ids)
    or p_round > n+1 then raise exception 'invalid_answer'; end if;
  select * into strict q from quiz_private.questions where id=game.question_ids[p_round];
  if p_round=n+1 then
    update quiz_private.attempts set answers=answers || to_jsonb(p_choice),
      score=score+case when q.correct_option=p_choice then 100 else 0 end,
      completed_at=case when p_round=cardinality(question_ids) then now() end where id=p_token;
  end if;
  return jsonb_build_object('choice', coalesce((game.answers->>(p_round-1))::int,p_choice),'ok',q.correct_option,
    'a',jsonb_build_array(q.explanation_bs,q.explanation_en),'source',jsonb_build_object('n',q.source_name,'u',q.source_url));
end $$;

create or replace function public.quiz_publish(p_token uuid, p_name text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_name is null or length(trim(p_name)) not between 1 and 40 or p_name ~ '[[:cntrl:]]' then raise exception 'invalid_name'; end if;
  insert into quiz_private.results(attempt_id,display_name,score)
  select id,trim(p_name),score from quiz_private.attempts where id=p_token and completed_at is not null
  on conflict(attempt_id) do nothing;
  if not exists(select from quiz_private.results where attempt_id=p_token) then raise exception 'unfinished'; end if;
end $$;

create or replace function public.quiz_board(p_size integer)
returns table(display_name text, score integer) language sql stable security definer set search_path = '' as $$
  select r.display_name,r.score from quiz_private.results r join quiz_private.attempts a on a.id=r.attempt_id
  where cardinality(a.question_ids)=p_size order by r.score desc,r.created_at,r.id limit 10
$$;
revoke all on function public.quiz_start(uuid,integer),public.quiz_answer(uuid,integer,integer),public.quiz_publish(uuid,text),public.quiz_board(integer) from public,authenticated;
grant execute on function public.quiz_start(uuid,integer),public.quiz_answer(uuid,integer,integer),public.quiz_publish(uuid,text),public.quiz_board(integer) to anon;
notify pgrst, 'reload schema';
commit;
