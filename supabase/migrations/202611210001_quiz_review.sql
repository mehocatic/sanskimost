begin;

update quiz_private.questions set active = false where id in ('peticabliha', 'vodeneigre');

commit;
