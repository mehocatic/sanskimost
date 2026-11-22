-- 109 new multiple choice questions (22 Nov 2026), approved by Meho, and one wording change.
-- It can be run more than once: a question that is already in the table is updated, not duplicated.
-- Questions without a source have empty source_name and source_url; the page then shows no source line.
begin;

insert into quiz_private.questions (id, category, question_bs, question_en, options_bs, options_en, correct_option, explanation_bs, explanation_en, source_name, source_url, active) values
('albaharipos', 'ljudi', 'Šta je Moris Albahari postao poslije rata?', 'What did Moris Albahari become after the war?', '["Gradonačelnik Sarajeva","Profesor historije","Ljekar","Pilot i direktor sarajevskog aerodroma"]', '["Mayor of Sarajevo","A history professor","A physician","A pilot and director of Sarajevo airport"]', 4, 'Poslije rata postao je pilot i direktor sarajevskog aerodroma.', 'After the war he became a pilot and director of Sarajevo airport.', 'Jerusalem Post (Moris Albahari)', 'https://www.jpost.com/diaspora/article-723030', true),
('hrustduz', 'priroda', 'Koliko je otprilike dug prolaz u Hrustovačkoj pećini do malog jezera?', 'About how long is the passage in Hrustovačka cave leading to the small lake?', '["500 m","50 m","200 m","2 km"]', '["500 m","50 m","200 m","2 km"]', 1, 'Prolaz je oko 500 m dug i vodi do malog jezera.', 'The passage is about 500 m long and leads to a small lake.', '', '', true),
('grmecha', 'priroda', 'Koliko hektara ima prašuma na Grmeču kod Sanskog Mosta (najmanje)?', 'How many hectares (at least) does the primeval forest on Grmeč near Sanski Most cover?', '["Oko 10","Oko 30","Više od 100","Više od 1.000"]', '["About 10","About 30","More than 100","More than 1,000"]', 3, 'Prašuma ima preko 100 ha.', 'The primeval forest covers over 100 ha.', '', '', true),
('grmecstar', 'priroda', 'Koliko godina imaju najstarija stabla u prašumi na Grmeču?', 'How old are the oldest trees in the primeval forest on Grmeč?', '["Oko 50","Oko 150","Preko 1.000","Preko 500"]', '["About 50","About 150","Over 1,000","Over 500"]', 4, 'Stabla su stara preko 500 godina.', 'The trees are over 500 years old.', '', '', true),
('bobijasko', 'priroda', 'Kod kojeg sela je Bobijasko oko, okomita kraška jama?', 'Near which village is Bobijasko oko, a vertical karst shaft?', '["Hrustovo","Jelašinovci","Fajtovci","Tomina"]', '["Hrustovo","Jelašinovci","Fajtovci","Tomina"]', 2, 'Jama je oko 20 km od grada; voda iz nje ponovo izlazi kod Dabarske pećine.', 'The shaft is about 20 km from town; its water reappears at Dabar cave.', '', '', true),
('korc1979', 'znamenitosti', 'Koje je godine otvoren spomen-kompleks Korčanica na Grmeču?', 'In what year was the Korčanica memorial on Grmeč opened?', '["1969","1985","1979","1992"]', '["1969","1985","1979","1992"]', 3, 'Otvoren je 27. jula 1979.', 'It was opened on 27 July 1979.', '', '', true),
('korcvajar', 'znamenitosti', 'Ko je vajar spomenika Korčanica?', 'Who was the sculptor of the Korčanica memorial?', '["Ljubomir Denković","Petar Krstić","Vojin Bakić","Dušan Džamonja"]', '["Ljubomir Denković","Petar Krstić","Vojin Bakić","Dušan Džamonja"]', 1, 'Spomenik je djelo vajara Ljubomira Denkovića.', 'The memorial is the work of the sculptor Ljubomir Denković.', '', '', true),
('korcobj', 'znamenitosti', 'Koliko je drvenih objekata imala partizanska bolnica na Korčanici 1942?', 'How many wooden buildings did the partisan hospital at Korčanica have in 1942?', '["5","12","30","19"]', '["5","12","30","19"]', 4, 'Bolnica je imala 19 drvenih objekata.', 'The hospital had 19 wooden buildings.', '', '', true),
('hrust2014', 'znamenitosti', 'Koje je godine Hrustovačka pećina proglašena nacionalnim spomenikom?', 'In what year was Hrustovačka cave declared a national monument?', '["2003","2008","2014","2020"]', '["2003","2008","2014","2020"]', 3, 'Nacionalni spomenik je od 2014.', 'It has been a national monument since 2014.', '', '', true),
('kamen2008', 'znamenitosti', 'Koje je godine tvrđava Kamengrad proglašena nacionalnim spomenikom?', 'In what year was Kamengrad fortress declared a national monument?', '["1998","2003","2014","2008"]', '["1998","2003","2014","2008"]', 4, 'Nacionalni spomenik je od 2008.', 'It has been a national monument since 2008.', '', '', true),
('kamenopsada', 'znamenitosti', 'Koliko je godina, prema legendi, trajala opsada Kamengrada?', 'According to legend, how many years did the siege of Kamengrad last?', '["3","11","7","25"]', '["3","11","7","25"]', 2, 'Prema legendi opsada je trajala 11 godina.', 'According to legend the siege lasted 11 years.', '', '', true),
('musala2003', 'znamenitosti', 'Koje je godine Fatihova musala proglašena nacionalnim spomenikom?', 'In what year was Fatih’s Musalla declared a national monument?', '["1992","2008","2014","2003"]', '["1992","2008","2014","2003"]', 4, 'Nacionalni spomenik je od 2003.', 'It has been a national monument since 2003.', '', '', true),
('mulezferata', 'priroda', 'Koliko je visok kameni zid uz koji vodi via ferrata na Muležu?', 'How high is the rock wall that the via ferrata on Mulež climbs?', '["30 m","90 m","50 m","150 m"]', '["30 m","90 m","50 m","150 m"]', 2, 'Ferata je otvorena u septembru 2024.', 'The via ferrata opened in September 2024.', '', '', true),
('mulezdr', 'priroda', 'Koje je društvo izgradilo feratu na Muležu?', 'Which society built the via ferrata on Mulež?', '["SPD „Mulež“","SPD „Grmeč“","SPD „Kozara“","SPD „Una“"]', '["SPD „Mulež“","SPD „Grmeč“","SPD „Kozara“","SPD „Una“"]', 1, 'Feratu je izgradilo planinarsko društvo SPD „Mulež“.', 'It was built by the mountaineering society SPD “Mulež”.', 'Furaj.ba', 'https://furaj.ba/wp-content/uploads/2024/10/Furajba-40-web-2.pdf', true),
('hasanbegopor', 'historija', 'Čijoj se okupaciji 1878. opirao Hasan-beg Čekić?', 'Whose occupation in 1878 did Hasan-beg Čekić resist?', '["Austrougarskoj","Osmanskoj","Njemačkoj","Mletačkoj"]', '["The Austro-Hungarian","The Ottoman","The German","The Venetian"]', 1, 'Bio je jedan od predvodnika otpora austrougarskoj okupaciji 1878.', 'He was one of the leaders of resistance to the Austro-Hungarian occupation in 1878.', 'Stav (arhiv) (Hasan-beg Čekić)', 'https://arhiv.stav.ba/ko-su-bile-vodje-otpora-u-krajini-i-kakva-je-njihova-sudbina/', true),
('hasanbegmost', 'ljudi', 'Uz čije se podizanje i održavanje veže Hasan-beg Čekić?', 'What is Hasan-beg Čekić linked to building and maintaining?', '["Hamzibegove džamije","Kamengrada","Pruge Prijedor, Lička Kaldrma","Drvenog mosta preko Sane"]', '["The Hamzibeg Mosque","Kamengrad fortress","The Prijedor to Lička Kaldrma railway","The wooden bridge over the Sana"]', 4, 'Zabilježena je njegova uloga u podizanju i održavanju drvenog mosta.', 'His part in building and maintaining the wooden bridge is on record.', 'Stav (arhiv) (Hasan-beg Čekić)', 'https://arhiv.stav.ba/ko-su-bile-vodje-otpora-u-krajini-i-kakva-je-njihova-sudbina/', true)
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
