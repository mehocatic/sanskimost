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
commit;
