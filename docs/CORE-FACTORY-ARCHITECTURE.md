# Doctor Core — Arquitetura Industrial e Auditoria de Fábrica

## Objetivo
Transformar o Motorista Legislativo no produto de referência do Doctor Core, capaz de originar dezenas de aplicativos sem copiar e editar a lógica do motor.

Regra oficial: Core executa. Product Context descreve o concurso. Conteúdo alimenta o produto. Infraestrutura central fornece serviços compartilhados.

## Camadas
### Core reutilizável
UI base, navegação, prática/revisão, simulado, pontuação, progresso, flashcards, Caderno Doctor, Gravador Doctor, Redação Doctor, offline, sincronização, sessão de dispositivo, adapters, IA, QA/publicação e consumidor do Radar.

O Core não contém nome de concurso, banca, distribuição fixa, número fixo de alternativas ou regra acadêmica específica.

### Product Context versionado
Produto, concurso, cargo, órgão, banca, edital/versão, matérias, tópicos, etapas, provas, regras, distribuição, pesos, alternativas, tempo, redação, metadados de cobrança e fontes.

### Conteúdo versionado
Questões, alternativas, gabaritos, explicações, flashcards, simulados, redações, fontes e metadados de revisão.

## Contrato de questão
Uma questão publicada precisa possuir product_id, context_version_id, subject_id, topic_id, stem, options, correct_option, explanation, source_type, source_reference, review_status, review_cycle e identidade de versão/hash.

Gate: draft/imported -> structural_validated -> semantic_validated -> editorial_reviewed -> approved -> published.

Nenhuma questão não aprovada deve chegar ao aluno.

Tentativas devem identificar a versão da questão e do contexto utilizados. Não basta guardar apenas question_id.

## Auditoria de avaliação
O relato “marquei a alternativa correta e apareceu errada” deve ser tratado como contrato de avaliação a ser provado:

alternativa clicada -> índice recebido -> gabarito da versão usada -> resultado imediato -> persistência -> revisão -> resultado final.

Testar prática, revisão, simulado, IA, reload, retomada e mudança de versão.

## Regra de fábrica
Novo aplicativo é uma nova configuração/conteúdo sobre o mesmo Core, não uma cópia alterada do motor.

Fluxo: produto -> Product Context -> edital/versionamento -> regras da prova -> matérias/tópicos -> conteúdo -> QA/rastreabilidade -> publicação -> Product/App/Access -> carregamento pelo Core -> homologação -> próximo produto.

## Estado atual
Auditoria de 2026-09-29:
- Core, configuração e 32 questões ainda concentrados no index.html.
- Simulado local insuficiente para a distribuição 10/3/2/25.
- question_traceability existe no Supabase, mas o app não está integrado a ela.
- Radar central existe, mas depende de catálogo/conteúdo central publicado.
- bridge de plataforma desativada no runtime.
- pagamentos desativados no app.
- inconsistências históricas de versão/cache precisam ser eliminadas.
- testes automatizados de avaliação ainda precisam ser fechados.

Esses são gargalos de industrialização. Não devem gerar uma segunda infraestrutura paralela.

## Segurança
Não criar tabelas, RPCs, RLS ou contratos paralelos quando a infraestrutura central já existir. Mudanças de contrato do Main devem ser registradas antes da implementação.
