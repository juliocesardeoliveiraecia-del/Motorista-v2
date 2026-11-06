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

## Fábrica de configuração de novos aplicativos

O repositório agora inclui um gerador sem dependências externas:
- manifesto de produto: `templates/product-manifest.example.json`;
- gerador: `tools/scaffold-product.mjs`;
- QA: `qa/scaffold-product-contract.mjs`.

Fluxo em uma cópia do Core:
```bash
cp templates/product-manifest.example.json product-manifest.json
# Preencha o manifesto com o edital, banca, distribuição, identidade e fontes oficiais.
node tools/scaffold-product.mjs --manifest product-manifest.json
node tools/scaffold-product.mjs --manifest product-manifest.json --out-dir . --apply --force
```

O gerador valida slugs, datas, cores, distribuição total de questões, duração, número de alternativas, modo múltipla escolha/Certo-Errado, fontes HTTPS dentro da allowlist oficial e proporções do Radar. Ele gera somente `product-context.js`, `manifest.json` e `version.json`; não inventa questões, gabaritos, assets, fontes nem cria repositório/Vercel. Esses itens continuam sujeitos a revisão editorial e ao gate de conteúdo. Sem `--apply`, executa apenas prévia; `--force` é exigido para sobrescrever arquivos existentes.

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

## Sincronização e sessão

A linha-base Motorista conecta o Core ao Supabase staging por sessão de dispositivo e snapshot versionado (`get_app_snapshot_v1` / `save_app_snapshot_v1`). A fila local só é limpa após confirmação do servidor; conflitos reconciliam revisão remota/local; metadados do Gravador sincronizam e os arquivos de áudio usam o bucket privado `recordings`.

A sessão única é garantida no servidor quando há conexão. Um dispositivo totalmente offline não consegue receber uma revogação em tempo real: o acesso offline usa lease previamente validado com janela máxima de 72 horas e é revalidado assim que a conexão retorna. Não anunciar exclusividade instantânea enquanto um dispositivo estiver desconectado.

## Padrão obrigatório da IA externa (todos os aplicativos)

Todo aplicativo derivado deve herdar o aviso, a confirmação de idade mínima de 18 anos, a ciência do envio de prompts/áudio/textos ao provedor, o disclaimer de não afiliação, a atribuição de marca, o aviso de retenção/localização de dados e a opção de desativar/apagar a chave local. Nunca prometer cota gratuita fixa ou retenção zero. Nunca sincronizar API keys. O contrato BYOK permanece sujeito à confirmação escrita da Groq; consulte `docs/DOCTOR-CORE-GROQ-LEGAL-STANDARD.md` antes de qualquer release.

## Regra para 50+ aplicativos

O primeiro aplicativo serve como homologação do motor. Os próximos devem ser gerados por pacote:

`core` + `product-context` + `product-content` + `assets`

Nunca por cópia manual de lógica. Antes de publicar cada produto, executar o gate de conteúdo, conferir o edital/distribuição e homologar as integrações centrais.
