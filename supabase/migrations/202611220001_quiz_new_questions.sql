-- 109 new multiple choice questions (22 Nov 2026), approved by Meho, and one wording change.
-- It can be run more than once: a question that is already in the table is updated, not duplicated.
-- Questions without a source have empty source_name and source_url; the page then shows no source line.
begin;

insert into quiz_private.questions (id, category, question_bs, question_en, options_bs, options_en, correct_option, explanation_bs, explanation_en, source_name, source_url, active) values
('albaharipos', 'ljudi', 'Šta je Moris Albahari postao poslije rata?', 'What did Moris Albahari become after the war?', '["Gradonačelnik Sarajeva","Profesor historije","Ljekar","Pilot i direktor sarajevskog aerodroma"]', '["Mayor of Sarajevo","A history professor","A physician","A pilot and director of Sarajevo airport"]', 4, 'Poslije rata postao je pilot i direktor sarajevskog aerodroma.', 'After the war he became a pilot and director of Sarajevo airport.', 'Jerusalem Post (Moris Albahari)', 'https://www.jpost.com/diaspora/article-723030', true)
on conflict (id) do update set
  category = excluded.category,
  question_bs = excluded.question_bs, question_en = excluded.question_en,
  options_bs = excluded.options_bs, options_en = excluded.options_en,
  correct_option = excluded.correct_option,
  explanation_bs = excluded.explanation_bs, explanation_en = excluded.explanation_en,
  source_name = excluded.source_name, source_url = excluded.source_url,
  active = true;

-- the Bliha question no longer says "according to Wikipedia"
update quiz_private.questions
  set question_bs = 'Koliko je visok vodopad Blihe?', question_en = 'How high is the Bliha waterfall?'
  where id = 'blihavis';

notify pgrst, 'reload schema';
commit;
