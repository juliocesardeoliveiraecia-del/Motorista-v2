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
