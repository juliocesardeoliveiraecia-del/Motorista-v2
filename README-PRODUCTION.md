# Doctor Core — Motorista Legislativo

## Marco M0 — transição para produção em massa

- **Versão-alvo:** 1.12.7
- **Produto-piloto:** Câmara Municipal de Ipameri/GO — Motorista Legislativo
- **Radar no aplicativo:** removido da interface, navegação, lógica executável e configuração do produto nesta versão. A infraestrutura central da Plataforma não foi apagada nem alterada.
- **Estado de release:** bloqueado até os gates de QA e testes E2E serem aprovados.

## Bloqueios antes de escalar

1. O banco de questões auditado/documentado contém 32 questões; o simulado oficial exige 40, distribuídas em 10/3/2/25. Não declarar homologação sem conteúdo suficiente e revisão factual.
2. Catálogo central e dados de Radar estavam vazios na auditoria. O Radar fica fora do aplicativo até decisão futura do Main.
3. Autenticação, autorização de acesso, sessão de dispositivo, sincronização e pagamentos precisam de homologação ponta a ponta.
4. Cada pacote de conteúdo precisa de fonte rastreável, revisão independente e aprovação explícita.
5. Testes em desktop e Android: instalação limpa, PWA instalada, atualização sobre cache antigo e uso offline.

## Arquitetura de produção em massa

- **Core:** motor, navegação, armazenamento local, offline, QA e ferramentas comuns.
- **Product Context:** concurso, cargo, banca, edital, datas, regras da prova e identidade visual versionados.
- **Conteúdo:** matérias, tópicos, questões, flashcards e rastreabilidade com aprovação editorial.
- **Plataforma:** identidade, autorização, dispositivo único, sincronização e pagamentos conforme contratos do Main.

## Contrato de versão

Manter alinhados index.html, production-config.js, product-context.js, manifest.json, service-worker.js e version.json. A CI deve impedir divergências e verificar que o cache anterior é invalidado.

## Segurança e publicação

Nunca versionar chaves GROQ, service-role, tokens de pagamento ou credenciais. Não criar schema, RPC, RLS, políticas públicas ou dados comerciais sem decisão formal do Main. O fluxo-alvo é GitHub main → Vercel; build verde não substitui E2E. Manter o deployment Drop como rollback até a nova linha ser homologada.
