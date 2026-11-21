begin;

update quiz_private.questions set active = false where id in ('peticabliha', 'vodeneigre');

update quiz_private.questions set question_bs = 'Koje je godine u Sanskom Mostu održana humanitarna utakmica „Ibričić i prijatelji“ na kojoj je gostovao Edin Džeko?', question_en = 'In which year was Edin Džeko a guest at the “Ibričić i prijatelji” charity match in Sanski Most?',
  explanation_bs = 'Utakmica je održana 25. decembra 2009. u Gradskoj sportskoj dvorani.', explanation_en = 'The match took place on 25 December 2009 at the town sports hall.' where id = 'dzekoposjeta';

update quiz_private.questions set options_bs = '["Amela Trožić", "Šejla Zonić", "Hadžija Hadžibajramović", "Anna Ibrisagic"]'::jsonb,
  options_en = '["Amela Trožić", "Šejla Zonić", "Hadžija Hadžibajramović", "Anna Ibrisagic"]'::jsonb where id = 'ibris';

update quiz_private.questions set options_bs = '["Džafer Cerić", "Milan Vukić", "Vukašin Brajić", "Enver Redžić"]'::jsonb,
  options_en = '["Džafer Cerić", "Milan Vukić", "Vukašin Brajić", "Enver Redžić"]'::jsonb where id = 'brajic';

commit;
