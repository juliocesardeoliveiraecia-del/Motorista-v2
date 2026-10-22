# Auditoria industrial — Doctor Core (baseline GitHub)

Data da auditoria: 2026-10-22  
Repositório: `juliocesardeoliveiraecia-del/Motorista-v2`  
Escopo: Core, conteúdo, qualidade de questões, Radar central e prontidão para uma fábrica de 50+ aplicativos.

## Resultado executivo

**Status: NÃO LIBERAR A FÁBRICA DE 50 APLICATIVOS AINDA.** A arquitetura tem partes reutilizáveis e controles úteis, mas ainda não foi comprovado o ciclo completo de publicação, validação semântica, rastreabilidade e homologação real em dispositivo.

## Achados críticos

### CORE-TRACE-001 — Rastreabilidade de questões não integrada
A tabela `public.question_traceability` existe estruturalmente, mas a auditoria do Main registrou zero linhas e o runtime não grava/consulta o contrato completo. Questões geradas precisam estar associadas a produto, versão válida de contexto, matéria/tópico, origem, estado de revisão e fingerprint/hash imutável antes de publicação.

**Regra de segurança:** não declarar questões aprovadas nem liberar lote como conteúdo oficial apenas porque passou em validação estrutural ou por revisão de IA.

### CORE-CONTEXT-002 — Contexto central ainda vazio
A auditoria do Main identificou `apps`, `contests`, `products`, `product_contexts`, `product_context_versions`, `product_subjects`, `product_topics`, `exams` e `exam_rules` vazios. O app Motorista ainda usa `product-context.js` e `product-content.js` locais. Isso permite testar o Core, mas não comprova provisionamento industrial por catálogo central.

**Dependência Main:** publicar produto/concurso/contexto aprovado e fornecer os IDs oficiais e a versão de contexto.

### CORE-ANSWER-003 — Validação estrutural não é validação semântica
O runtime confere índice do gabarito, número de alternativas, explicações e duplicatas. Essas verificações não provam que a alternativa indexada responde corretamente ao enunciado. O relato de alternativa correta ser marcada como errada precisa ser reproduzido com a mesma versão da questão e acompanhado de fingerprint da questão, índice selecionado, índice correto e estado persistido.

**Gate obrigatório:** a explicação da alternativa correta deve estar alinhada ao índice `correct`; cada distrator deve ter explicação coerente; questão sem evidência suficiente deve ficar em quarentena até revisão humana/editorial. A IA pode auxiliar, mas não é autoridade final independente.

### CORE-TEST-004 — Falta comprovação de teste de interação ponta a ponta
É necessário testar em navegador real, e depois em Android/PWA: clique em alternativa, feedback imediato, avanço/retorno, persistência, reload/resume, resultado final, revisão comentada e recálculo após atualização do conteúdo. A tentativa deve referenciar fingerprint/hash imutável; alteração posterior de conteúdo não pode reinterpretar uma resposta antiga.

### CORE-MODULAR-005 — Core ainda monolítico
O motor principal está concentrado em `index.html`. Existem arquivos separados para contexto e conteúdo, mas navegação, renderização, estado, questões, IA e vários serviços permanecem no arquivo monolítico. Isso aumenta risco de regressão na produção em escala.

**Meta:** extrair módulos/adapters gradualmente em branch e PRs pequenos, sem reescrever a baseline aprovada.

### CORE-RADAR-006 — RPC central existe, mas sem conteúdo
A função `public.get_radar_feed(p_product_id, p_limit)` e as tabelas `radar_sources`, `radar_items`, `radar_item_products` e `radar_source_products` existem e têm RLS habilitado. Na auditoria, as quatro tabelas estavam vazias; `products` também estava vazio. Portanto, não foi possível homologar o feed real. O app já chama a RPC central; não deve fazer scraping próprio nem usar a chave GROQ do aluno para pesquisar notícias.

**Dependência Main:** cadastrar fontes oficiais, publicar produto/contexto e associar fontes e itens aos produtos por fluxo central; depois executar teste E2E de 70/30, fallback primário, deduplicação por `content_url`, exclusão de itens públicos não oficiais e ticker/página em desktop/mobile.

### CORE-PLATFORM-007 — Integrações comerciais e de plataforma não homologadas no app
A configuração pública do Core indica pagamento desabilitado e bridge da plataforma desabilitada. Não liberar venda/produção industrial até auth, entitlement, sessão de dispositivo, sync e pagamento estarem alinhados com o contrato Main. Não colocar segredos no repositório.

### CORE-RELEASE-008 — Metadados de versão/cache precisam de um contrato único
Na leitura da branch `main`, `service-worker.js` declara cache V1.13.2 enquanto `version.json`, `manifest.json` e `production-config.js` declaram V1.13.1. Isso pode causar inconsistência de diagnóstico/cache e deve ser corrigido em um PR pequeno depois de confirmar qual build foi aprovada. Não alterar produção sem alinhar a versão fonte.

## Separação oficial de responsabilidades

- **Core:** UI base, navegação, motor de questões, avaliação, simulado, flashcards, progresso, Caderno/Gravador/Redação, offline, sync, device session e adapters.
- **Product Context:** produto, concurso, cargo, órgão, banca, edital/versão, matérias, tópicos, etapas, regras, pesos, quantidade, alternativas e tempo.
- **Conteúdo:** enunciados, alternativas, gabaritos, explicações, flashcards, simulados, redações e fontes editoriais.
- **Infraestrutura Main:** catálogo/publicação, autenticação, acesso, pagamento, storage, sync/device e Radar central.

## Ordem de execução para tornar o Core fabricável

1. Congelar e identificar baseline aprovada; nenhum hotfix direto sem branch/PR.
2. Fazer QA automatizado do conteúdo estático: IDs, matéria, alternativas, gabarito, explicações, duplicatas e consistência de rótulos.
3. Implementar teste de contrato para resposta → evidência imutável → persistência → revisão → pontuação.
4. Fechar a publicação/rastreabilidade com Main; questões sem versão de contexto e origem aprovada não podem ser publicadas como oficiais.
5. Validar geração IA por matéria, revisão independente, lote completo, prova final, retomada e impressão Android.
6. Homologar Radar E2E após Main povoar catálogo e dados centrais.
7. Fechar auth, entitlement, device, sync e payment bridge.
8. Corrigir e automatizar contrato de versão/cache/manifest.
9. Extrair módulos do monólito gradualmente.
10. Criar template/fábrica somente depois de um segundo produto com banca/formato diferente passar sem alteração do motor.

## Limites desta auditoria

- Nenhuma tabela, RPC, RLS ou migration do Supabase foi alterada.
- Nenhum dado de produto, concurso, fonte ou notícia foi inventado/inserido.
- O QA automatizado verifica consistência estrutural e alinhamento textual explícito entre gabarito e explicações; **não substitui a revisão semântica humana de cada questão**.
- Testes reais em navegador/dispositivo, chave GROQ válida e seed oficial do Radar continuam necessários para homologação.
