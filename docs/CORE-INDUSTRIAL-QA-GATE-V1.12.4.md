# Doctor Core — Auditoria industrial e gates de lançamento

**Escopo:** `Motorista-v2`, Core declarado 1.12.3; branch de correção `core-industrial-qa-hardening-v1.12.4`.
**Decisão:** produção em massa bloqueada até a evidência de homologação dos itens críticos.

## Correções propostas nesta branch

- O quality gate agora lê os bindings reais do Core (`SUBJECTS`, `QUESTIONS`, `ExamRules`, `DoctorQuestionIntegrity`, `Quiz`, `Store` e `DoctorAICore`) em vez de depender exclusivamente de propriedades em `window`.
- Questões só são entregues se tiverem aprovação explícita do Revisor Doctor (`reviewedByDoctor=true` e status `APROVAR`/`CORRIGIR`) vinculada à versão atual do Product Context.
- Questões estáticas sem metadados de revisão ficam indisponíveis; não são automaticamente marcadas como aprovadas.
- Pools de prática, simulado retomável e Caderno de Erros filtram conteúdo não aprovado.
- A saída da revisão independente de IA recebe o `contextVersion` atual e data de revisão antes de ser inserida no banco de questões.
- A auditoria de duplicidade compara matéria, enunciado e alternativas normalizadas, sem depender de ID ou gabarito. Isso detecta cópias com IDs diferentes e gabaritos divergentes.
- `auditSimulado` não retorna mais `ok: true` apenas por existir uma sessão: valida quantidade, distribuição, IDs, gabaritos, aprovação e duplicidade.
- Adicionado teste automatizado com Node.js e workflow GitHub Actions para verificar banco conforme, conteúdo duplicado, gabarito fora do intervalo, conteúdo pendente e simulado incompleto.

## Achados críticos confirmados na auditoria do Supabase

1. **Catálogo central vazio no snapshot consultado:** `products`, `apps`, `contests`, `product_contexts`, `product_context_versions`, `subjects`, `topics`, `exams`, `exam_rules` e `question_traceability` sem registros.
2. **Radar sem dados:** `radar_sources`, `radar_items`, `radar_item_products` e `radar_source_products` sem registros. A RPC `public.get_radar_feed(p_product_id,p_limit)` existe, mas sem catálogo/conteúdo não há feed real para homologar.
3. **Conflito de contrato na RPC central:** a definição auditada permite `trusted_media` e `forecast` em determinadas condições, embora a diretriz do Main exija somente fontes oficiais no feed público. Não alteramos RPC/RLS/schema do Main; precisa de decisão/correção do responsável central.
4. **Banco insuficiente para o simulado oficial:** o pacote estático auditado tem 32 questões (8 Português, 6 RLM, 6 Realidade, 12 Específicos), enquanto o edital exige 40 na distribuição 10/3/2/25. Não completar por fabricação automática sem revisão.
5. **Rastreabilidade editorial vazia:** `question_traceability` tem zero registros. O gate de runtime impede entrega sem revisão explícita/versionamento, mas a revisão factual e a associação formal de fontes ainda precisam ser homologadas.
6. **Integrações comerciais e operacionais:** a configuração pública informa pagamentos desabilitados e `bridgeEnabled=false`; sync/dispositivo/acesso não podem ser considerados homologados só porque há tabelas no banco.
7. **Teste E2E real pendente:** GitHub/Vercel `READY` comprova build/deploy, não comportamento real em desktop e celular com cache antigo, seleção de alternativa, persistência, reload, retomada e revisão final.

## Política de segurança acadêmica

A seleção e o resultado precisam usar a mesma evidência de resposta e a mesma versão imutável da questão. Testes estruturais não comprovam verdade factual. Cada questão precisa de revisão independente, versão de contexto e rastreabilidade suficiente para auditar a origem do gabarito. Questão pendente ou com versão divergente não deve aparecer em prática, simulado ou Caderno de Erros.

## Critérios de liberação da fábrica de 50+ apps

- [ ] Banco de questões suficiente para a distribuição oficial do produto, sem placeholders.
- [ ] Todas as questões liberadas aprovadas editorialmente e rastreáveis; nenhum conteúdo pendente no pool.
- [ ] Testes de contrato de resposta imediata/final/persistida aprovados.
- [ ] Catálogo e Product Context central publicados pelo Main.
- [ ] Radar central com fontes oficiais e conteúdo real; RPC alinhada à política oficial.
- [ ] Bridge de autenticação, sessão de dispositivo, sync e entitlement homologados.
- [ ] Fluxo de pagamento confirmado pelo webhook homologado pela Plataforma.
- [ ] E2E real em desktop e celular, incluindo cache/service worker e modo offline.
- [ ] Release SHA, URL de produção e rollback formalmente confirmados.

**Importante:** esta branch não altera schema, RLS, RPC, catálogo comercial nem dados do Main. A ausência de aprovação dos conteúdos estáticos é intencional: não atribuímos uma revisão que não foi executada.
