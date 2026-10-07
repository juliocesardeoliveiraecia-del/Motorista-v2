# Doctor Core — Auditoria e produção em massa

## Objetivo

Esta é a linha-base industrial do Core. Um novo aplicativo deve trocar **Product Context + Product Content + identidade visual**, sem copiar ou reescrever a lógica do motor.

### Core (não muda por concurso)
- navegação e histórico;
- PWA/offline/cache;
- armazenamento local e migrações;
- prática de questões;
- simulado e cronômetro;
- Caderno de Erros;
- Flashcards;
- Caderno/Gravador/Redação/Radar;
- Doctor IA;
- integridade das respostas;
- fila de sincronização e ponte com a Plataforma;
- sessão de dispositivo;
- controles de publicação e bloqueios de segurança.

### Product Context (muda por concurso)
- órgão, cargo, banca e edital;
- datas, duração, quantidade de questões e pesos;
- identidade visual e ícone temático;
- perfil editorial/IA;
- fontes oficiais prioritárias;
- identidade comercial do produto.

### Product Content (muda por concurso)
- matérias e tópicos;
- questões e gabaritos;
- flashcards/recursos de conteúdo;
- fontes e rastreabilidade editorial quando aplicável.

## Gate de qualidade das questões

Uma questão só pode ser entregue se:
1. tiver ID único;
2. pertencer a uma matéria válida;
3. tiver enunciado válido;
4. tiver exatamente o número de alternativas do edital;
5. não tiver alternativas duplicadas;
6. tiver um único índice de gabarito válido;
7. tiver explicações alinhadas às alternativas;
8. não estiver em quarentena;
9. se gerada por IA, estiver marcada como revisada pelo Doctor;
10. a evidência da resposta preservar o fingerprint da questão.

A seleção, conferência e resultado usam a mesma regra determinística `selected === correct`. A revisão do Caderno de Erros não sobrescreve a evidência da resposta original.

## Gate do simulado

O simulado oficial só inicia quando **todas as matérias** atingirem a distribuição exigida pelo edital e todas as questões forem elegíveis. Banco incompleto ou conteúdo em quarentena não é mascarado com questões de outra matéria.

## Auditoria automatizada

`node tools/audit-content.mjs` faz a auditoria estrutural e determinística do pacote atual.

`node tools/audit-content.mjs --release` transforma banco incompleto em erro de publicação.

A auditoria automatizada não substitui a revisão factual/editorial. Para legislação, datas, fatos locais e conteúdo que dependa de atualização, é obrigatório ter fonte/contexto e revisão editorial antes da publicação.

## Radar

O app consome a infraestrutura central do Radar. Não deve criar scraping paralelo. A publicação pública depende do contrato central do Supabase, com fonte oficial, identificação de produto/concurso e deduplicação por `content_url`.

## Sincronização

O Core não finge sincronização quando a ponte da Plataforma não existe. A fila local permanece preservada até o contrato oficial da ponte estar conectado.

## Regra para 50+ aplicativos

O primeiro aplicativo serve como homologação do motor. Os próximos devem ser gerados por pacote:

`core` + `product-context` + `product-content` + `assets`

Nunca por cópia manual de lógica. Antes de publicar cada produto, executar o gate de conteúdo, conferir o edital/distribuição e homologar as integrações centrais.
