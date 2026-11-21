begin;

update quiz_private.questions set active = false where id in ('peticabliha', 'vodeneigre');

update quiz_private.questions set question_bs = 'Koje je godine u Sanskom Mostu održana humanitarna utakmica „Ibričić i prijatelji“ na kojoj je gostovao Edin Džeko?', question_en = 'In which year was Edin Džeko a guest at the “Ibričić i prijatelji” charity match in Sanski Most?',
  explanation_bs = 'Utakmica je održana 25. decembra 2009. u Gradskoj sportskoj dvorani.', explanation_en = 'The match took place on 25 December 2009 at the town sports hall.' where id = 'dzekoposjeta';

commit;
