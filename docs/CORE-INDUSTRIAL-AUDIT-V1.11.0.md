# Doctor Core — Auditoria Industrial V1.11.0

## Escopo
Auditoria do Core visando replicação para dezenas de produtos, sem copiar lógica do motor.

## Evidências verificadas no código atual

### Já reforçado
- Product Context foi separado do engine em `product-context.js`.
- Conteúdo específico (matérias + banco de questões) foi separado em `product-content.js`.
- Build exibido no app passa a derivar da configuração de produção; removida a divergência que deixava o footer em V1.9.4 enquanto o build estava em V1.10.15.
- Namespace do armazenamento local passa a derivar de `EXAM_CONFIG.productId`, evitando colisão entre produtos. A migração da chave legada é restrita ao produto Motorista Legislativo.
- Identidade visual básica do concurso (título, descrição, imagem principal, imagem do órgão e allowlist do Radar) passou a vir do Product Context.
- Integridade estrutural das questões já possui validação, fingerprint, quarentena e bloqueio de questões geradas por IA sem revisão.
- Respostas usam evidência/fingerprint da versão respondida; mudança posterior do conteúdo não é reinterpretada silenciosamente.
- Simulado oficial tem trava de prontidão e não aceita mais início parcial.
- Radar do app usa o adaptador central e a RPC `get_radar_feed`; o app não deve fazer scraping próprio.
- QA estático e auditoria estrutural do pacote de questões foram adicionados à CI.

## Separação atual

### CORE
- navegação/UI-base;
- motor de prática, revisão e simulado;
- integridade/fingerprint de questões;
- PWA/cache;
- armazenamento local;
- adapter de sincronização;
- adapter GROQ;
- adapter Radar central;
- Caderno, Gravador e Redação;
- estado e telemetria local.

### PRODUCT CONTEXT
- concurso/órgão/cargo/banca;
- edital e datas;
- duração, quantidade, alternativas e distribuição;
- identidade do produto;
- regras editoriais/IA;
- fontes oficiais do Radar;
- assets do produto;
- catálogo/ponte do produto.

### PRODUCT CONTENT
- matérias;
- tópicos;
- questões;
- gabaritos;
- explicações;
- conteúdo editorial.

## Falhas/bloqueadores encontrados

### 1. Banco do Motorista ainda não satisfaz a prova oficial
O pacote atual contém 32 questões para uma distribuição oficial de 40. O motor agora bloqueia o simulado oficial quando faltar conteúdo. Isso é comportamento correto de segurança, mas o pacote de conteúdo continua incompleto.

### 2. QA factual não é substituível por validação estrutural
A esteira atual detecta inconsistências estruturais e duplicidade. Ela não consegue provar sozinha que uma questão factual está correta perante legislação, edital ou fonte oficial. A aprovação factual precisa permanecer em pipeline de conteúdo/revisão, conforme contrato do Main.

### 3. Sincronização ainda é adapter/bridge
`CoreSync` mantém fila local e só envia quando `DOCTOR_PLATFORM_BRIDGE.sync` existir. Sem bridge, não finge sincronização remota. Porém o contrato final de ACK, idempotência, conflito, versão e dead-letter ainda depende da definição/implementação oficial Main ↔ Apps.

### 4. Autenticação/entitlement ainda não estão conectados ao Core
O código possui pontos de integração/bridge, mas `platform.bridgeEnabled` continua desativado. Portanto não se deve considerar autenticação, entitlement, expiração, revogação e sessão de dispositivo prontos para produção comercial em massa.

### 5. Pagamento ainda não está ativo
O contrato de Asaas está preparado, mas `payments.enabled=false`. Nenhum acesso comercial deve ser liberado por retorno visual de checkout.

### 6. Radar central precisa de homologação real
O app já consome `get_radar_feed`, mas a existência, assinatura, RLS, grants, conteúdo e comportamento da infraestrutura central precisam ser homologados diretamente no Supabase antes de declarar o Radar industrial fechado.

### 7. Product Context ainda é JavaScript
A separação já existe, mas o próximo estágio industrial pode transformar o contrato de contexto em esquema formal versionado (JSON/schema/API), evitando que cada produto precise de lógica JavaScript própria.

### 8. Conteúdo continua sendo pacote do produto
Isso é intencional. O banco de questões não deve virar lógica do Core. Para os próximos produtos, a fábrica precisa validar e empacotar conteúdo separadamente.

## Resultado de segurança
O princípio adotado é: em caso de dúvida sobre integridade, o Core bloqueia a entrega em vez de tentar “corrigir” visualmente uma questão possivelmente errada.

## Próxima fase obrigatória antes dos 50+
1. Homologar o contrato Supabase do Product Context.
2. Homologar Radar central, RLS, RPC e fontes.
3. Fechar contrato Main/Auth/Entitlement/Device.
4. Fechar contrato Main ↔ Apps para sync.
5. Completar/validar o pacote de conteúdo de cada produto.
6. Criar teste de fábrica com dois contextos incompatíveis (múltipla escolha e Cebraspe certo/errado).
7. Só então congelar o Core como release-base.

## Regra de fábrica
Aplicativo novo deve trocar principalmente:
- Product Context;
- Product Content;
- assets;
- fontes;
- feature flags.

Não deve duplicar o motor.

## Observação de comunicação
A consulta ao Supabase do projeto `rouuppeosmizzqnubhgs` está retornando timeout de conexão no momento desta auditoria. Por isso não foi feita nenhuma alteração de schema, RLS, RPC ou migration por conta própria. O bloqueio deve ser resolvido no canal oficial Main ↔ Apps antes de qualquer mudança de banco.
