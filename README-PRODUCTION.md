# Doctor Core — Motorista Legislativo

## Estado auditado — 2026-11-08

- **Core:** V1.12.13.
- **Concurso:** Câmara Municipal de Ipameri/GO; Agente Legislativo — Motorista Legislativo; Instituto Verbena/UFG; Edital nº 02/2026.
- **PWA/offline:** ativo.
- **Plataforma:** bridge preparada para produção, com Supabase Auth compartilhado, sessão por usuário/app e snapshot versionado. A configuração pública do Supabase é gerada no build pelo Vercel; não há URL ou chave de staging fixa no HTML.
- **Sincronização:** RPCs `claim_device_session_v1`, `heartbeat_device_session_v1`, `get_app_snapshot_v1` e `save_app_snapshot_v1`; fila só é limpa após confirmação do servidor.
- **Gravador:** bucket privado `recordings`; arquivos de áudio não entram no snapshot, somente metadados.
- **Limite offline:** lease validado por até 72 horas; um dispositivo desconectado não recebe revogação em tempo real e é revalidado ao reconectar.
- **Radar:** consome a infraestrutura central Supabase + RPC `get_radar_feed`; o catálogo e o feed ainda precisam de conteúdo oficial publicado.
- **IA:** Groq BYOK com avisos, confirmação de idade e ciência de dados; aprovação contratual do uso de chaves pessoais em app comercial continua pendente de resposta escrita da Groq.
- **Pagamentos:** Doctor Pay central; checkout do app permanece desativado.
- **Catálogo staging:** produto `draft`, app `maintenance`, sem `app_url`.
- **Produção:** o backend Supabase de produção já possui o schema consolidado e o catálogo inicial. Esta branch prepara o app para usar somente as credenciais públicas do projeto de produção no build de produção; o checkout permanece desligado até Doctor Pay estar implantado e verificado.

## Regra de publicação

O código de produção deve entrar em `main`. O Vercel conectado ao GitHub publica automaticamente o que estiver em `main`. O build gera `production-config.js` a partir de `SUPABASE_URL` e `SUPABASE_ANON_KEY` definidos no ambiente Production. Preview não recebe credenciais de produção e mantém a integração Supabase desabilitada. O build de produção falha se as variáveis obrigatórias estiverem ausentes.

## Radar central

O app não deve fazer scraping independente para montar o feed público. O Radar central fornece os itens por produto, fonte e classificação primária/secundária. A RPC central aplica a regra aproximada 70/30 e o fallback para conteúdo primário quando não houver conteúdo secundário suficiente.

Somente itens publicados e oficiais entram no feed público do app. A deduplicação central usa `content_url`.

## Qualidade de questões

A seleção da alternativa é determinística: o índice selecionado é comparado ao gabarito da própria questão. Portanto, uma divergência do tipo “marcou a correta e apareceu errada” é tratada como problema de conteúdo/gabarito, não como algo que deve ser mascarado pela interface.

Antes da produção em massa, o Core precisa ter uma esteira formal de QA de conteúdo:
1. validação estrutural;
2. validação de uma única alternativa correta;
3. coerência entre gabarito e explicações;
4. checagem de duplicidade;
5. rastreabilidade de fonte/contexto;
6. revisão independente;
7. bloqueio de publicação para conteúdo não aprovado.

O banco estático atual contém 32 questões embutidas no app (8 Português, 6 RLM, 6 Realidade, 12 Específicos), enquanto o simulado oficial exige 40 (10/3/2/25). O Core agora bloqueia o simulado oficial quando a distribuição estiver incompleta; questões inválidas/quarentenadas também não entram no pool. Para produção em massa, cada pacote de conteúdo ainda precisa passar pela esteira de QA factual e de fontes.

## Produção em massa

A arquitetura-alvo é separar claramente:
- **Core:** motor, navegação, armazenamento local, offline, sincronização, sessão de dispositivo, IA, QA, UI e ferramentas;
- **Configuração do produto:** concurso, cargo, banca, edital, datas, distribuição da prova, identidade;
- **Conteúdo:** matérias, tópicos, questões, flashcards, fontes e rastreabilidade.

A meta é que um novo aplicativo seja produzido por troca de configuração/conteúdo, sem copiar e alterar a lógica do Core.

## Segurança

Nunca versionar GROQ API key, Supabase service-role key, tokens de pagamento ou outros segredos. O repositório pode conter somente configuração pública necessária ao cliente.

## Rollback

O deployment Drop histórico permanece como referência de recuperação enquanto a linha GitHub → Vercel é homologada.

## Auditoria Core V1.11.0

- Resposta do aluno é registrada por fingerprint da questão; alteração posterior do conteúdo não transforma uma resposta originalmente correta em erro.
- Questões estruturalmente inválidas ou duplicadas entram em quarentena e não são entregues.
- Questões geradas por IA só entram no pool depois da revisão independente do Doctor.
- Simulado oficial não pode mais ser iniciado parcialmente.
- O banco é reauditado depois da inclusão de conteúdo gerado por IA.
- O próximo estágio para produção em massa é a homologação da camada central do Radar e a revisão factual/fontes do conteúdo de cada produto; o Core não inventa aprovação factual.
