# Auditoria Core — 2026-09-29

## Resultado executivo

O Core ainda **não deve entrar em produção em massa**. A base funciona, mas existem gargalos que precisam ser fechados antes de usar o mesmo motor em dezenas de concursos.

## P0 — segurança acadêmica

### Questões estáticas
O banco embutido possui 32 questões:
- Português: 8
- Raciocínio Lógico-Matemático: 6
- Realidade de Goiás e Ipameri: 6
- Específicos: 12

A estrutura foi auditada automaticamente: IDs, subjectId, quantidade de alternativas, índice do gabarito, quantidade de explicações e alternativas duplicadas não apresentaram erro estrutural.

Entretanto, **32/32 questões não possuem metadados explícitos de revisão/publicação** no objeto atual.

Isso significa que a estrutura técnica está válida, mas não existe ainda um gate formal que prove que o gabarito foi semanticamente revisado antes da entrega.

### Bug relatado de alternativa
O runtime compara diretamente o índice clicado com q.correct. Não foi encontrada uma segunda fonte de gabarito conflitante no fluxo auditado.

Portanto, o problema relatado precisa ser tratado como um contrato de integridade:
1. alternativa clicada;
2. índice recebido pelo handler;
3. question_version_id/content_hash da questão apresentada;
4. gabarito daquela mesma versão;
5. resultado imediato;
6. persistência;
7. revisão;
8. resultado final.

O Core precisa de testes automatizados para provar esse fluxo, inclusive após reload e retomada.

## P0 — separação Core x conteúdo

Hoje o motor, a configuração do concurso e o banco estático de questões continuam concentrados no index.html.

Isso é incompatível com uma fábrica de 50+ aplicativos como estratégia de manutenção.

O alvo definido pelo Main é:
- Core reutilizável;
- Product Context versionado;
- conteúdo separado e versionado.

Foi criado neste branch o documento de arquitetura industrial e um auditor estrutural de conteúdo para iniciar essa separação com segurança.

## P0 — identidade e versionamento

O Core já declara 1.10.13, mas havia referências internas de service worker e version.json apontando para 1.10.8.

Isso pode provocar cache/artefato misturado entre versões.

No branch de auditoria:
- referências de atualização do service worker foram alinhadas para 1.10.13;
- foi criado version.json como marcador canônico do build.

## P0 — Radar central

A infraestrutura central existe:
- public.get_radar_feed(uuid, integer);
- radar_sources;
- radar_items;
- radar_item_products;
- radar_source_products.

O app atual já consome o RPC central.

Mas o catálogo e o conteúdo estão vazios no projeto auditado:
products=0, apps=0, contests=0, product_contexts=0, product_context_versions=0, subjects=0, topics=0, product_subjects=0, product_topics=0, exams=0, exam_rules=0, question_traceability=0, radar_sources=0, radar_items=0, radar_item_products=0, radar_source_products=0.

Logo, a integração do app está tecnicamente preparada, mas ainda não existe dado central real para homologação ponta a ponta.

Também foi encontrada uma divergência que precisa de decisão do Main: a função get_radar_feed atualmente aceita official, trusted_media e forecast em determinadas condições, enquanto a regra de produto definida para o Radar público exige fontes oficiais. O Apps não deve alterar a RPC central sem decisão registrada.

## P1 — rastreabilidade de questões

public.question_traceability existe no Supabase, mas o código atual não grava nem consulta essa tabela.

Antes da fábrica, cada questão precisa ter:
- contexto do produto;
- versão;
- fonte;
- ciclo de revisão;
- status de publicação;
- identidade imutável/content hash.

## P1 — simulado

A distribuição configurada é 10/3/2/25 = 40 questões.

O banco estático atual não consegue montar sozinho essa prova completa. Hoje existe caminho de geração por IA para preencher lacunas.

Para produção industrial, a dependência de geração em tempo de uso deve deixar de ser necessária para cumprir a prova oficial. O conteúdo aprovado precisa estar publicado antes do aluno iniciar o simulado.

## P1 — plataforma

O app ainda declara bridgeEnabled=false e sync provider pendente.

Também existem estruturas centrais no Supabase para produto, acesso, dispositivo e fila de sincronização, mas o Core ainda não está homologado contra o contrato final.

## P1 — pagamentos

O app está com pagamentos desativados.

Isso é dependência de lançamento comercial, não deve ser resolvido copiando lógica de pagamento para cada aplicativo.

## Regra de liberação da fábrica

Não criar o aplicativo 2, 3, 4... enquanto o primeiro não passar pelos gates:

1. Core separado de conteúdo;
2. Product Context carregado por contrato;
3. pipeline de questões com revisão;
4. identidade/versionamento/hash;
5. testes de avaliação;
6. simulado completo sem geração em tempo real;
7. Radar central homologado;
8. auth/access/device/sync homologados;
9. cache/versionamento único;
10. homologação final do Motorista Legislativo.

Só depois disso o Core vira template industrial.
