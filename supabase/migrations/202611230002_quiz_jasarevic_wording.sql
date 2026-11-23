-- 23 Nov 2026: a clearer wording of the question about Senudin Jašarević (Meho: "born above a classroom" was not clear).
-- The same text as js/data/pogodi-data.js. It can be run more than once.
begin;
update quiz_private.questions set
  question_bs = 'U kojem je selu rođen novinar i književnik Senudin Jašarević, u školskoj zgradi u kojoj je radio njegov otac?'
where id = 'jasarrod';
notify pgrst, 'reload schema';
commit;
