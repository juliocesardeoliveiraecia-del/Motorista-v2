-- Doctor Core Motorista Legislativo: catálogo acadêmico e rastreabilidade inicial.
-- Aditivo e idempotente: não altera o banco estático nem aprova questões automaticamente.
BEGIN;

INSERT INTO public.product_contexts(product_id,position,organization)
VALUES ('003a9301-9294-480c-9ebf-03055566d77f','Agente Legislativo — Motorista Legislativo','Câmara Municipal de Ipameri/GO')
ON CONFLICT(product_id) DO UPDATE SET position=EXCLUDED.position,organization=EXCLUDED.organization,updated_at=now();

INSERT INTO public.product_context_versions(product_context_id,version_number,edital,edital_url,version_status,source_snapshot)
SELECT pc.id,1,'Base pré-edital: último edital disponível nº 02/2026 (referência histórica; não representa novo edital publicado)',
'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/9-edital/167-edital-de-abertura-n%C2%BA-02-2026.html',
'draft','{"productSlug":"motorista-legislativo-ipameri","localProductId":"motorista-legislativo","contestStage":"pre-edital","contentSourceMode":"last-edital-last-exam","banca":"Instituto Verbena / UFG","editalNumber":"Edital nº 02/2026","lastExamDateISO":"2026-09-13","contentVersion":"2026.1","totalQuestions":47,"officialExamDistribution":{"portugues":10,"rlm":3,"realidade":2,"especificos":25},"sources":{"edital":"https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/9-edital/167-edital-de-abertura-n%C2%BA-02-2026.html","lastExam":"https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/sistema/provas_gabaritos/Provas_gabaritos_finais_Ipameri_2026.html"},"editorialState":"draft_pending_independent_review"}'::jsonb
FROM public.product_contexts pc
WHERE pc.product_id='003a9301-9294-480c-9ebf-03055566d77f'
ON CONFLICT(product_context_id,version_number) DO UPDATE
SET edital=EXCLUDED.edital,edital_url=EXCLUDED.edital_url,version_status='draft',source_snapshot=EXCLUDED.source_snapshot;

UPDATE public.product_contexts pc SET current_version_id=pv.id,updated_at=now()
FROM public.product_context_versions pv
WHERE pv.product_context_id=pc.id AND pv.version_number=1
AND pc.product_id='003a9301-9294-480c-9ebf-03055566d77f';

INSERT INTO public.subjects(name,slug,description) VALUES
('Língua Portuguesa','doctor-portugues','Matéria do pacote Motorista Legislativo; distribuição oficial: 10 questões; peso 2.'),
('Raciocínio Lógico-Matemático','doctor-rlm','Matéria do pacote Motorista Legislativo; distribuição oficial: 3 questões; peso 1.'),
('Realidade de Goiás e Ipameri','doctor-realidade','Matéria do pacote Motorista Legislativo; distribuição oficial: 2 questões; peso 1.'),
('Conhecimentos Específicos — Motorista Legislativo','doctor-especificos','Matéria do pacote Motorista Legislativo; distribuição oficial: 25 questões; peso 3.')
ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description;

INSERT INTO public.topics(subject_id,name,slug,description)
SELECT s.id,v.name,v.slug,v.description
FROM (VALUES
('doctor-portugues','Gêneros textuais e suas funcionalidades','generos-textuais-e-suas-funcionalidades','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-portugues','Compreensão e interpretação de textos','compreensao-e-interpretacao-de-textos','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-portugues','Variação linguística','variacao-linguistica','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-portugues','Gramática normativa','gramatica-normativa','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-portugues','Produção de sentidos: polissemia, ironia, ambiguidade, inferência','producao-de-sentidos-polissemia-ironia-ambiguidade-inferencia','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-portugues','Coesão e coerência textual','coesao-e-coerencia-textual','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-portugues','Sequências textuais (narrativa, descritiva, argumentativa, injuntiva, expositiva)','sequencias-textuais-narrativa-descritiva-argumentativa-injuntiva-expositiva','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-portugues','Tipos de argumento','tipos-de-argumento','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-portugues','Classificação gramatical e formação de palavras','classificacao-gramatical-e-formacao-de-palavras','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-portugues','Coordenação e subordinação (orações e termos)','coordenacao-e-subordinacao-oracoes-e-termos','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-portugues','Concordância e regência verbal e nominal','concordancia-e-regencia-verbal-e-nominal','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-portugues','Pontuação e acentuação','pontuacao-e-acentuacao','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-portugues','Acordo Ortográfico da Língua Portuguesa (1990)','acordo-ortografico-da-lingua-portuguesa-1990','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-rlm','Resolução de problemas com raciocínio lógico','resolucao-de-problemas-com-raciocinio-logico','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-rlm','Sequências lógicas e numéricas','sequencias-logicas-e-numericas','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-rlm','Proporcionalidade direta e inversa','proporcionalidade-direta-e-inversa','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-rlm','Regra de três simples e composta','regra-de-tres-simples-e-composta','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-rlm','Porcentagem: aumentos, descontos, variações','porcentagem-aumentos-descontos-variacoes','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-rlm','Matemática financeira básica (juros simples)','matematica-financeira-basica-juros-simples','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-rlm','Leitura e interpretação de tabelas e gráficos','leitura-e-interpretacao-de-tabelas-e-graficos','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-rlm','Lógica proposicional: conectivos, tabelas-verdade, negação','logica-proposicional-conectivos-tabelas-verdade-negacao','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-rlm','Progressões aritméticas simples','progressoes-aritmeticas-simples','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-rlm','Dedução lógica e diagramas','deducao-logica-e-diagramas','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-realidade','Conflitos sociais, pobreza e direitos humanos','conflitos-sociais-pobreza-e-direitos-humanos','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-realidade','Emergências de saúde e epidemias','emergencias-de-saude-e-epidemias','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-realidade','Meio ambiente e mudanças climáticas','meio-ambiente-e-mudancas-climaticas','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-realidade','Arte, cultura e patrimônio do Centro-Oeste','arte-cultura-e-patrimonio-do-centro-oeste','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-realidade','Formação histórico-territorial de Goiás e Ipameri','formacao-historico-territorial-de-goias-e-ipameri','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-realidade','Política, economia e sociedade em Goiás (da Colônia à República)','politica-economia-e-sociedade-em-goias-da-colonia-a-republica','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-realidade','Agricultura e urbanização em Goiás','agricultura-e-urbanizacao-em-goias','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-realidade','Aspectos físicos do território goiano (vegetação, hidrografia, clima, relevo)','aspectos-fisicos-do-territorio-goiano-vegetacao-hidrografia-clima-relevo','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-realidade','Natureza, cultura e turismo em Goiás','natureza-cultura-e-turismo-em-goias','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-realidade','Aspectos histórico-geográficos de Ipameri','aspectos-historico-geograficos-de-ipameri','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-especificos','Legislação de trânsito: CTB (Lei 9.503/1997) e normas do CONTRAN','legislacao-de-transito-ctb-lei-9-503-1997-e-normas-do-contran','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-especificos','Direção defensiva e procedimentos em ocorrências/acidentes','direcao-defensiva-e-procedimentos-em-ocorrencias-acidentes','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-especificos','Noções de mecânica básica e conservação do veículo','nocoes-de-mecanica-basica-e-conservacao-do-veiculo','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-especificos','Transporte institucional: segurança, postura, sigilo, responsabilidade','transporte-institucional-seguranca-postura-sigilo-responsabilidade','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-especificos','Ética, disciplina e relações interpessoais no serviço público','etica-disciplina-e-relacoes-interpessoais-no-servico-publico','Tópico do edital de referência do Motorista Legislativo.'),
('doctor-especificos','Preenchimento de relatórios de viagem e controle de quilometragem','preenchimento-de-relatorios-de-viagem-e-controle-de-quilometragem','Tópico do edital de referência do Motorista Legislativo.')
) AS v(subject_slug,name,slug,description)
JOIN public.subjects s ON s.slug=v.subject_slug
ON CONFLICT(subject_id,slug) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description;

INSERT INTO public.product_subjects(product_context_version_id,subject_id,sort_order,weight,active)
SELECT pv.id,s.id,v.sort_order,v.weight,true
FROM (VALUES
('doctor-portugues',1,2),
('doctor-rlm',2,1),
('doctor-realidade',3,1),
('doctor-especificos',4,3)
) AS v(subject_slug,sort_order,weight)
JOIN public.subjects s ON s.slug=v.subject_slug
JOIN public.product_contexts pc ON pc.product_id='003a9301-9294-480c-9ebf-03055566d77f'
JOIN public.product_context_versions pv ON pv.product_context_id=pc.id AND pv.version_number=1
ON CONFLICT(product_context_version_id,subject_id) DO UPDATE
SET sort_order=EXCLUDED.sort_order,weight=EXCLUDED.weight,active=true;

INSERT INTO public.product_topics(product_context_version_id,topic_id,sort_order,active)
SELECT pv.id,t.id,v.sort_order,true
FROM (VALUES
('doctor-portugues','generos-textuais-e-suas-funcionalidades',1),
('doctor-portugues','compreensao-e-interpretacao-de-textos',2),
('doctor-portugues','variacao-linguistica',3),
('doctor-portugues','gramatica-normativa',4),
('doctor-portugues','producao-de-sentidos-polissemia-ironia-ambiguidade-inferencia',5),
('doctor-portugues','coesao-e-coerencia-textual',6),
('doctor-portugues','sequencias-textuais-narrativa-descritiva-argumentativa-injuntiva-expositiva',7),
('doctor-portugues','tipos-de-argumento',8),
('doctor-portugues','classificacao-gramatical-e-formacao-de-palavras',9),
('doctor-portugues','coordenacao-e-subordinacao-oracoes-e-termos',10),
('doctor-portugues','concordancia-e-regencia-verbal-e-nominal',11),
('doctor-portugues','pontuacao-e-acentuacao',12),
('doctor-portugues','acordo-ortografico-da-lingua-portuguesa-1990',13),
('doctor-rlm','resolucao-de-problemas-com-raciocinio-logico',1),
('doctor-rlm','sequencias-logicas-e-numericas',2),
('doctor-rlm','proporcionalidade-direta-e-inversa',3),
('doctor-rlm','regra-de-tres-simples-e-composta',4),
('doctor-rlm','porcentagem-aumentos-descontos-variacoes',5),
('doctor-rlm','matematica-financeira-basica-juros-simples',6),
('doctor-rlm','leitura-e-interpretacao-de-tabelas-e-graficos',7),
('doctor-rlm','logica-proposicional-conectivos-tabelas-verdade-negacao',8),
('doctor-rlm','progressoes-aritmeticas-simples',9),
('doctor-rlm','deducao-logica-e-diagramas',10),
('doctor-realidade','conflitos-sociais-pobreza-e-direitos-humanos',1),
('doctor-realidade','emergencias-de-saude-e-epidemias',2),
('doctor-realidade','meio-ambiente-e-mudancas-climaticas',3),
('doctor-realidade','arte-cultura-e-patrimonio-do-centro-oeste',4),
('doctor-realidade','formacao-historico-territorial-de-goias-e-ipameri',5),
('doctor-realidade','politica-economia-e-sociedade-em-goias-da-colonia-a-republica',6),
('doctor-realidade','agricultura-e-urbanizacao-em-goias',7),
('doctor-realidade','aspectos-fisicos-do-territorio-goiano-vegetacao-hidrografia-clima-relevo',8),
('doctor-realidade','natureza-cultura-e-turismo-em-goias',9),
('doctor-realidade','aspectos-historico-geograficos-de-ipameri',10),
('doctor-especificos','legislacao-de-transito-ctb-lei-9-503-1997-e-normas-do-contran',1),
('doctor-especificos','direcao-defensiva-e-procedimentos-em-ocorrencias-acidentes',2),
('doctor-especificos','nocoes-de-mecanica-basica-e-conservacao-do-veiculo',3),
('doctor-especificos','transporte-institucional-seguranca-postura-sigilo-responsabilidade',4),
('doctor-especificos','etica-disciplina-e-relacoes-interpessoais-no-servico-publico',5),
('doctor-especificos','preenchimento-de-relatorios-de-viagem-e-controle-de-quilometragem',6)
) AS v(subject_slug,topic_slug,sort_order)
JOIN public.subjects s ON s.slug=v.subject_slug
JOIN public.topics t ON t.subject_id=s.id AND t.slug=v.topic_slug
JOIN public.product_contexts pc ON pc.product_id='003a9301-9294-480c-9ebf-03055566d77f'
JOIN public.product_context_versions pv ON pv.product_context_id=pc.id AND pv.version_number=1
ON CONFLICT(product_context_version_id,topic_id) DO UPDATE
SET sort_order=EXCLUDED.sort_order,active=true;

CREATE UNIQUE INDEX IF NOT EXISTS question_traceability_product_question_id_uidx
ON public.question_traceability(product_id,(metadata->>'questionId'))
WHERE metadata ? 'questionId';

INSERT INTO public.question_traceability(product_id,context_version_id,subject_id,source_type,review_status,review_cycle,metadata)
SELECT '003a9301-9294-480c-9ebf-03055566d77f',pv.id,s.id,'authored_static','pending',0,
jsonb_build_object(
 'questionId',v.question_id,
 'contentVersion','2026.1',
 'provenance','Doctor Concursos original static content package',
 'editorialState','pending_independent_review',
 'topicAssignment','subject_only_topic_mapping_pending',
 'sourceReferences',jsonb_build_array(
  'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/9-edital/167-edital-de-abertura-n%C2%BA-02-2026.html',
  'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/sistema/provas_gabaritos/Provas_gabaritos_finais_Ipameri_2026.html'
 )
)
FROM (VALUES
('pt-1','doctor-portugues'),
('pt-2','doctor-portugues'),
('pt-3','doctor-portugues'),
('pt-4','doctor-portugues'),
('pt-5','doctor-portugues'),
('pt-6','doctor-portugues'),
('pt-7','doctor-portugues'),
('pt-8','doctor-portugues'),
('rlm-1','doctor-rlm'),
('rlm-2','doctor-rlm'),
('rlm-3','doctor-rlm'),
('rlm-4','doctor-rlm'),
('rlm-5','doctor-rlm'),
('rlm-6','doctor-rlm'),
('real-1','doctor-realidade'),
('real-2','doctor-realidade'),
('real-3','doctor-realidade'),
('real-4','doctor-realidade'),
('real-5','doctor-realidade'),
('real-6','doctor-realidade'),
('esp-1','doctor-especificos'),
('esp-2','doctor-especificos'),
('esp-3','doctor-especificos'),
('esp-4','doctor-especificos'),
('esp-5','doctor-especificos'),
('esp-6','doctor-especificos'),
('esp-7','doctor-especificos'),
('esp-8','doctor-especificos'),
('esp-9','doctor-especificos'),
('esp-10','doctor-especificos'),
('esp-11','doctor-especificos'),
('esp-12','doctor-especificos'),
('pt-9','doctor-portugues'),
('pt-10','doctor-portugues'),
('esp-13','doctor-especificos'),
('esp-14','doctor-especificos'),
('esp-15','doctor-especificos'),
('esp-16','doctor-especificos'),
('esp-17','doctor-especificos'),
('esp-18','doctor-especificos'),
('esp-19','doctor-especificos'),
('esp-20','doctor-especificos'),
('esp-21','doctor-especificos'),
('esp-22','doctor-especificos'),
('esp-23','doctor-especificos'),
('esp-24','doctor-especificos'),
('esp-25','doctor-especificos')
) AS v(question_id,subject_slug)
JOIN public.subjects s ON s.slug=v.subject_slug
JOIN public.product_contexts pc ON pc.product_id='003a9301-9294-480c-9ebf-03055566d77f'
JOIN public.product_context_versions pv ON pv.product_context_id=pc.id AND pv.version_number=1
WHERE NOT EXISTS(
 SELECT 1 FROM public.question_traceability qt
 WHERE qt.product_id='003a9301-9294-480c-9ebf-03055566d77f'
 AND qt.metadata->>'questionId'=v.question_id
);

COMMIT;