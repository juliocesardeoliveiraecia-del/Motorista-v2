# Doctor Core — Fábrica de Aplicativos v1

## Regra central

O Core executa. O Product Context descreve. O conteúdo é versionado. O Main controla infraestrutura, catálogo, acesso e Radar central.

Um novo aplicativo não deve copiar e alterar o motor. Deve trocar apenas:
- Product Context;
- conteúdo aprovado;
- assets/configuração específicos;
- vínculo Produto → App → Acesso;
- fontes oficiais do Radar cadastradas no Main.

## Camadas

### Core reutilizável
- navegação e UI base;
- renderer de questões;
- avaliação;
- simulado;
- flashcards;
- progresso;
- Caderno Doctor;
- Gravador Doctor;
- Redação Doctor;
- offline/cache;
- sync/device bridge;
- integrações;
- mecanismos de auditoria.

### Product Context
- concurso;
- cargo;
- órgão;
- banca;
- edital e versão;
- matérias/tópicos;
- etapas;
- regras de prova;
- distribuição;
- alternativas;
- duração;
- pesos;
- redação;
- metadados de cobrança.

### Conteúdo
- questões e alternativas;
- gabaritos;
- explicações;
- flashcards;
- materiais específicos;
- modelos de redação;
- áudios/anotações específicos.

## Gate obrigatório de questão

draft/imported → structural_validated → semantic_validated → editorial_reviewed → approved → published

A questão só entra no pool do aluno quando reviewStatus=approved.

Cada tentativa deve guardar:
- questionVersionId;
- contentHash;
- contextVersionId.

Se o conteúdo de uma questão mudar, a versão muda. Uma resposta antiga não pode contaminar a versão nova.

## Regra de simulado

O botão de simulado oficial só aparece quando todas as quantidades exigidas pelo Product Context estão disponíveis e aprovadas.

Nunca iniciar uma prova oficial parcial silenciosamente.

O Core nunca assume:
- 40 questões;
- A–E;
- cinco alternativas;
- uma distribuição fixa;
- pontuação fixa;
- duração fixa.

Tudo deve vir de Exam Rules.

## Radar

O app não faz scraping nem busca web própria para o Radar público.

O consumo é pelo Radar central do Main/Supabase.

A homologação final depende de:
1. catálogo de produtos publicado;
2. fontes oficiais cadastradas;
3. itens do Radar publicados;
4. RPC/contrato central alinhado à regra pública somente oficial;
5. testes 70/30 por produto.

## Checklist antes de cada novo produto

1. Product e App cadastrados no Main.
2. Contest e Product Context cadastrados.
3. Context Version publicada.
4. Subjects/Topics/Exams/Exam Rules publicados.
5. Conteúdo auditado.
6. Todas as questões aprovadas e versionadas.
7. Simulado completo conforme edital.
8. Radar com fontes oficiais associadas.
9. Auth/access/device/sync homologados.
10. PWA/offline/cache homologados.
11. Testes de avaliação passando.
12. Vercel/GitHub com build aprovado.
13. Smoke test mobile + desktop.
14. Só então liberar para produção.

## Regra de fábrica

Falha em qualquer gate = produto bloqueado.

Não compensar falha de conteúdo com lógica do Core, não criar dados fictícios e não alterar contratos do Main para contornar bloqueios.
