# Doctor Core — Auditoria industrial e gate de publicação (V1.12.3)

Data da auditoria: 2026-10-14

## Escopo

Auditoria preparatória para produção de 50+ aplicativos a partir de um Core compartilhado. Nenhuma alteração foi feita no schema, RPC, RLS ou catálogo comercial do Main.

## Correções incluídas nesta iteração

- A avaliação de alternativa agora passa por `question-evaluation.js`, um contrato puro compartilhado pelo runtime e pela auditoria automatizada.
- O teste tautológico que comparava duas cópias da mesma expressão foi removido. A auditoria exercita opções corretas/incorretas e rejeita índices inválidos pelo mesmo contrato chamado pelo app.
- O runtime bloqueia a entrega de questão sem aprovação editorial independente, status de aprovação aceito, referência de fonte e versão de contexto.
- Os pools de prática e de simulado filtram questões não aprovadas/rastreáveis. O simulado oficial continua bloqueado se faltar a distribuição do edital.
- Cache PWA, manifesto, contexto e configuração foram alinhados para V1.12.3; o contrato de avaliação está no precache.
- O branch foi publicado em preview Vercel com status de check `success`. Isso comprova build/deploy do preview, não homologação funcional em navegador real.

## Estado do conteúdo auditado

- Banco estático: 32 questões (8 Português, 6 RLM, 6 Realidade de Goiás/Ipameri, 12 Específicos).
- Distribuição oficial esperada: 40 questões (10/3/2/25).
- Questões estáticas atuais não têm metadados suficientes para aprovação editorial independente nem rastreabilidade completa por fonte/contexto.
- Nenhuma questão foi marcada artificialmente como aprovada. Até revisão factual/editorial real, as questões não são elegíveis para entrega.
- O teste automatizado verifica estrutura, duplicidade, índice do gabarito e contrato de avaliação; ele não prova a verdade factual da resposta.

## Bloqueios de lançamento

1. Revisar factual e editorialmente cada questão e registrar fonte oficial/primária e versão do Product Context.
2. Completar e aprovar o banco de 40 questões na distribuição 10/3/2/25; não liberar simulado oficial antes disso.
3. Main precisa publicar o produto, concurso, Product Context versionado e associações de fontes oficiais no catálogo central. No snapshot consultado, `products`, `apps`, `contests`, `product_contexts`, `product_context_versions`, `question_traceability` e tabelas `radar_*` estavam vazias.
4. Fechar o contrato de bridge para autenticação, sessão de dispositivo único e sincronização; configuração pública continua com `bridgeEnabled=false`.
5. Fechar pagamento/entitlement antes de vender; pagamentos continuam desativados nesta configuração.

## Critérios para liberar produção em massa

- [ ] Todos os itens servidos estão aprovados, rastreáveis e versionados.
- [ ] Testes reais da função compartilhada de correção passam para A/B/C/D, respostas inválidas e alteração de versão do conteúdo.
- [ ] Testes E2E em prática, simulado, persistência, reload, retomada e revisão passam.
- [ ] Banco 40/40 atende à distribuição oficial e revisão factual independente.
- [ ] Product Context vem do contrato oficial, sem dados de outro concurso residual.
- [ ] Radar central tem produto, fontes oficiais e itens publicados; 70/30 validado por lote.
- [ ] Auth, sessão, sync offline e entitlement são homologados.
- [ ] Build/version/cache são consistentes e teste desktop/mobile/offline passa.

**Decisão atual: NÃO LIBERAR produção em massa.** A branch de auditoria está em preview; o gate fecha deliberadamente a entrega de conteúdo não aprovado. Não mesclar como release até resolver os bloqueios listados.
