# Doctor Core — fábrica em lote de produtos

## Objetivo
Gerar pacotes de configuração de vários produtos numa única execução, sem copiar a lógica do Core e sem sobrescrever produtos existentes.

## Formato do lote
Use um arquivo JSON com uma lista `products`. Cada item é um manifesto individual no formato de `templates/product-manifest.example.json`.

```json
{
  "products": [
    { "...": "manifesto completo do produto A" },
    { "...": "manifesto completo do produto B" }
  ]
}
```

## Execução segura
Primeiro valide todo o lote sem gravar nada:

```bash
node tools/scaffold-products-batch.mjs --batch-manifest products.batch.json
```

Depois, numa pasta de saída dedicada:

```bash
node tools/scaffold-products-batch.mjs --batch-manifest products.batch.json --out-root ./generated-products --apply
```

O lote inteiro é validado antes da gravação. A ferramenta:
- aceita até 50 manifestos por execução;
- exige appId e productId únicos;
- reaproveita todas as validações de edital, banca, distribuição, duração, modo de resposta, fontes oficiais do Radar e identidade;
- gera `product-context.js`, `manifest.json` e `version.json` para cada produto;
- recusa diretórios já existentes e não sobrescreve arquivos;
- tenta reverter diretórios criados nesta execução se houver falha de gravação.

## Limites deliberados
A fábrica não cria questões, gabaritos, imagens, contas, repositórios GitHub, projetos Vercel, produtos comerciais nem assinaturas. Também não publica produtos. Esses passos exigem conteúdo oficial revisado, registro comercial central e homologação própria de cada app.

**Um lote de configurações não equivale a 50 aplicativos publicados.** Cada aplicativo continua com repositório, projeto Vercel, URL, cadastro no Main, contrato de integração, testes e ciclo de release independentes.

## QA
Execute:

```bash
node --check tools/scaffold-products-batch.mjs
node qa/scaffold-products-batch-contract.mjs
```


## Modo pré-edital
A fábrica também aceita produtos em fase pré-edital. Nesse modo, o manifesto deve:
- definir `app.contestStage: "pre-edital"`;
- deixar `app.examDateISO` como `null` (não inventar data de prova);
- preencher `app.lastExamDateISO` com a data da última prova real;
- apontar `app.officialEditalUrl` para o último edital oficial e `app.officialLastExamUrl` para a prova/gabarito oficial;
- incluir os hosts oficiais correspondentes em `radarAllowedHosts`.

O Core exibe a preparação pré-edital, usa o último edital + última prova como base e mantém a banca como perfil de cobrança. Quando sair edital novo, o manifesto muda para `post-edital` com a nova data e os documentos oficiais. O modo pré-edital não inventa cronograma, prova ou edital futuro.

## Política global de sessão do Doctor Core

Todos os aplicativos derivados devem herdar a política global de uma sessão ativa por conta, não uma sessão por aplicativo:
- a restrição é aplicada no Supabase por usuário, com trava transacional e índice único;
- o último login autenticado assume a sessão imediatamente e revoga a sessão anterior, sem exigir confirmação;
- o banco transmite a revogação por canal privado Realtime; o dispositivo anterior fecha o acesso imediatamente ao receber o evento;
- heartbeat no servidor funciona como contingência se o WebSocket cair;
- uma sessão abandonada pode ser substituída após o prazo de inatividade configurado;
- o mesmo dispositivo mantém um identificador estável entre produtos no mesmo domínio/origem;
- a revogação remove a licença local da sessão e encerra apenas a autenticação local daquele dispositivo;
- dados de estudo offline permanecem preservados e sincronizações protegidas exigem sessão ativa no servidor.

O scaffold declara `single-active-device-global-account-last-login-wins`. O bridge e as RPCs de sessão são parte obrigatória do Core e devem ser mantidos em todas as derivações.
