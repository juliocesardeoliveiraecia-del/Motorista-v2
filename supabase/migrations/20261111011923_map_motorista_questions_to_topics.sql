-- Vincula as 47 questões estáticas a tópicos do contexto editorial.
-- O vínculo tem finalidade de organização pedagógica; não aprova gabaritos.
BEGIN;
INSERT INTO public.topics(subject_id,name,slug,description)
SELECT s.id,'Poder Legislativo municipal e competências da Câmara',
'poder-legislativo-municipal-e-competencias-da-camara',
'Tópico complementar do pacote de prática; não é apresentado como item autônomo do edital. Confirmar aderência ao edital vigente antes de publicação comercial.'
FROM public.subjects s WHERE s.slug='doctor-realidade'
ON CONFLICT(subject_id,slug) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description;

INSERT INTO public.product_topics(product_context_version_id,topic_id,sort_order,active)
SELECT pv.id,t.id,40,true
FROM public.product_contexts pc
JOIN public.product_context_versions pv ON pv.product_context_id=pc.id AND pv.version_number=1
JOIN public.subjects s ON s.slug='doctor-realidade'
JOIN public.topics t ON t.subject_id=s.id AND t.slug='poder-legislativo-municipal-e-competencias-da-camara'
WHERE pc.product_id='003a9301-9294-480c-9ebf-03055566d77f'
ON CONFLICT(product_context_version_id,topic_id) DO UPDATE SET sort_order=EXCLUDED.sort_order,active=true;

UPDATE public.question_traceability qt
SET topic_id=t.id,
 metadata=qt.metadata || jsonb_build_object('topicAssignment','manual_editorial_mapping_v1','topicScope',m.topic_scope)
FROM (VALUES
('pt-1','doctor-portugues','concordancia-e-regencia-verbal-e-nominal','official_syllabus_topic'),
('pt-2','doctor-portugues','coordenacao-e-subordinacao-oracoes-e-termos','official_syllabus_topic'),
('pt-3','doctor-portugues','gramatica-normativa','official_syllabus_topic'),
('pt-4','doctor-portugues','coesao-e-coerencia-textual','official_syllabus_topic'),
('pt-5','doctor-portugues','pontuacao-e-acentuacao','official_syllabus_topic'),
('pt-6','doctor-portugues','tipos-de-argumento','official_syllabus_topic'),
('pt-7','doctor-portugues','concordancia-e-regencia-verbal-e-nominal','official_syllabus_topic'),
('pt-8','doctor-portugues','sequencias-textuais-narrativa-descritiva-argumentativa-injuntiva-expositiva','official_syllabus_topic'),
('pt-9','doctor-portugues','coordenacao-e-subordinacao-oracoes-e-termos','official_syllabus_topic'),
('pt-10','doctor-portugues','pontuacao-e-acentuacao','official_syllabus_topic'),
('rlm-1','doctor-rlm','resolucao-de-problemas-com-raciocinio-logico','official_syllabus_topic'),
('rlm-2','doctor-rlm','regra-de-tres-simples-e-composta','official_syllabus_topic'),
('rlm-3','doctor-rlm','logica-proposicional-conectivos-tabelas-verdade-negacao','official_syllabus_topic'),
('rlm-4','doctor-rlm','porcentagem-aumentos-descontos-variacoes','official_syllabus_topic'),
('rlm-5','doctor-rlm','progressoes-aritmeticas-simples','official_syllabus_topic'),
('rlm-6','doctor-rlm','matematica-financeira-basica-juros-simples','official_syllabus_topic'),
('real-1','doctor-realidade','formacao-historico-territorial-de-goias-e-ipameri','official_syllabus_topic'),
('real-2','doctor-realidade','agricultura-e-urbanizacao-em-goias','official_syllabus_topic'),
('real-3','doctor-realidade','aspectos-fisicos-do-territorio-goiano-vegetacao-hidrografia-clima-relevo','official_syllabus_topic'),
('real-4','doctor-realidade','poder-legislativo-municipal-e-competencias-da-camara','supplemental_pending_edital_alignment'),
('real-5','doctor-realidade','meio-ambiente-e-mudancas-climaticas','official_syllabus_topic'),
('real-6','doctor-realidade','aspectos-historico-geograficos-de-ipameri','official_syllabus_topic'),
('esp-1','doctor-especificos','legislacao-de-transito-ctb-lei-9-503-1997-e-normas-do-contran','official_syllabus_topic'),
('esp-2','doctor-especificos','legislacao-de-transito-ctb-lei-9-503-1997-e-normas-do-contran','official_syllabus_topic'),
('esp-3','doctor-especificos','direcao-defensiva-e-procedimentos-em-ocorrencias-acidentes','official_syllabus_topic'),
('esp-4','doctor-especificos','direcao-defensiva-e-procedimentos-em-ocorrencias-acidentes','official_syllabus_topic'),
('esp-5','doctor-especificos','nocoes-de-mecanica-basica-e-conservacao-do-veiculo','official_syllabus_topic'),
('esp-6','doctor-especificos','transporte-institucional-seguranca-postura-sigilo-responsabilidade','official_syllabus_topic'),
('esp-7','doctor-especificos','nocoes-de-mecanica-basica-e-conservacao-do-veiculo','official_syllabus_topic'),
('esp-8','doctor-especificos','legislacao-de-transito-ctb-lei-9-503-1997-e-normas-do-contran','official_syllabus_topic'),
('esp-9','doctor-especificos','preenchimento-de-relatorios-de-viagem-e-controle-de-quilometragem','official_syllabus_topic'),
('esp-10','doctor-especificos','etica-disciplina-e-relacoes-interpessoais-no-servico-publico','official_syllabus_topic'),
('esp-11','doctor-especificos','legislacao-de-transito-ctb-lei-9-503-1997-e-normas-do-contran','official_syllabus_topic'),
('esp-12','doctor-especificos','nocoes-de-mecanica-basica-e-conservacao-do-veiculo','official_syllabus_topic'),
('esp-13','doctor-especificos','legislacao-de-transito-ctb-lei-9-503-1997-e-normas-do-contran','official_syllabus_topic'),
('esp-14','doctor-especificos','legislacao-de-transito-ctb-lei-9-503-1997-e-normas-do-contran','official_syllabus_topic'),
('esp-15','doctor-especificos','direcao-defensiva-e-procedimentos-em-ocorrencias-acidentes','official_syllabus_topic'),
('esp-16','doctor-especificos','direcao-defensiva-e-procedimentos-em-ocorrencias-acidentes','official_syllabus_topic'),
('esp-17','doctor-especificos','direcao-defensiva-e-procedimentos-em-ocorrencias-acidentes','official_syllabus_topic'),
('esp-18','doctor-especificos','nocoes-de-mecanica-basica-e-conservacao-do-veiculo','official_syllabus_topic'),
('esp-19','doctor-especificos','nocoes-de-mecanica-basica-e-conservacao-do-veiculo','official_syllabus_topic'),
('esp-20','doctor-especificos','nocoes-de-mecanica-basica-e-conservacao-do-veiculo','official_syllabus_topic'),
('esp-21','doctor-especificos','transporte-institucional-seguranca-postura-sigilo-responsabilidade','official_syllabus_topic'),
('esp-22','doctor-especificos','transporte-institucional-seguranca-postura-sigilo-responsabilidade','official_syllabus_topic'),
('esp-23','doctor-especificos','preenchimento-de-relatorios-de-viagem-e-controle-de-quilometragem','official_syllabus_topic'),
('esp-24','doctor-especificos','etica-disciplina-e-relacoes-interpessoais-no-servico-publico','official_syllabus_topic'),
('esp-25','doctor-especificos','nocoes-de-mecanica-basica-e-conservacao-do-veiculo','official_syllabus_topic')
) AS m(question_id,subject_slug,topic_slug,topic_scope)
JOIN public.subjects s ON s.slug=m.subject_slug
JOIN public.topics t ON t.subject_id=s.id AND t.slug=m.topic_slug
WHERE qt.product_id='003a9301-9294-480c-9ebf-03055566d77f'
AND qt.metadata->>'questionId'=m.question_id
AND qt.subject_id=s.id
AND qt.review_status='pending';
COMMIT;