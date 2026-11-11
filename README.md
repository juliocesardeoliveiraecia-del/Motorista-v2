# Doctor Core — Motorista Legislativo

Aplicativo Doctor Core configurado para o concurso de **Agente Legislativo — Motorista Legislativo**, da Câmara Municipal de Ipameri/GO, com referência ao Edital nº 02/2026 e ao Instituto Verbena/UFG.

## Estado de produção conferido em 11/11/2026

- Core: **1.12.17**.
- Conteúdo: **2026.3**.
- Ambiente: Supabase de produção.
- Produto no catálogo: `draft`.
- Aplicativo no catálogo: `maintenance`.
- URL técnica do app: `https://motorista.doctorconcursos.com.br`.
- Checkout: não liberado para venda.
- Gate editorial central: ativo; publicação e ativação permanecem bloqueadas até aprovação humana de todo o conteúdo elegível.

O deploy técnico READY não significa que o produto esteja comercialmente liberado.

## Configuração oficial da prova

| Matéria | Questões | Peso/questão | Pontos |
|---|---:|---:|---:|
| Língua Portuguesa | 10 | 2 | 20 |
| Raciocínio Lógico-Matemático | 3 | 1 | 3 |
| Realidade de Goiás e Ipameri | 2 | 1 | 2 |
| Conhecimentos Específicos | 25 | 3 | 75 |
| **Total** | **40** | — | **100** |

Duração: 4 horas. A prova de referência usa quatro alternativas (A–D). A distribuição oficial do simulado é de 40 questões.

## Banco estático e rastreabilidade

O pacote de conteúdo 2026.3 contém **47 questões únicas**:
- 10 de Língua Portuguesa;
- 6 de Raciocínio Lógico-Matemático;
- 6 de Realidade de Goiás e Ipameri;
- 25 de Conhecimentos Específicos.

As 47 questões estão registradas na rastreabilidade de produção, vinculadas a tópicos e protegidas por fingerprint SHA-256. **Todas permanecem com revisão editorial pendente.** Um tópico suplementar ainda precisa de alinhamento explícito ao edital. O hash comprova integridade do bloco de conteúdo; não comprova correção factual nem aprovação editorial.

Por isso, o simulado oficial e a publicação comercial continuam sujeitos aos gates de completude e revisão. Não confundir 47 questões disponíveis no banco com a distribuição oficial de 40 questões do simulado.

## Funcionalidades do Core

- PWA instalável e experiência offline, com atualização controlada do Service Worker.
- Prática de questões, histórico, revisão e Caderno de Erros.
- Simulados com cronômetro e distribuição configurada pelo edital.
- Flashcards e ferramentas de estudo.
- Caderno Doctor, Gravador Doctor, Redação Doctor e Radar Doctor, conforme homologação e disponibilidade do produto.
- Doctor IA via Groq (G-R-O-Q), com chave do próprio usuário e salvaguardas de transparência e dados.
- Sessão central por usuário/aplicativo e sincronização versionada.
- Central de Suporte integrada à Plataforma.
- Rastreabilidade, fingerprints e bloqueios de publicação.

## Configuração de novos produtos

Use o manifesto de exemplo e a fábrica de configuração para validar edital, banca e regras:

```bash
cp templates/product-manifest.example.json product-manifest.json
# Edite o manifesto com dados conferidos no edital e fontes oficiais.
node tools/scaffold-product.mjs --manifest product-manifest.json
node tools/scaffold-product.mjs --manifest product-manifest.json --out-dir . --apply --force
```

A fábrica gera `product-context.js`, `manifest.json` e `version.json`. Ela valida slugs, datas, cores, distribuição, modalidade da prova, hosts oficiais e proporções do Radar. Não cria questões, gabaritos, assets, repositório GitHub ou projeto Vercel.

## Produção em massa — 50+ aplicativos

Um novo app deve mudar apenas:
- Product Context: concurso, órgão, cargo, banca, edital e regras;
- Product Content: matérias, tópicos, questões, gabaritos, explicações e fontes;
- Assets: ícones, imagens e identidade visual.

A lógica do Core não deve ser copiada nem reescrita por concurso. Consulte `CORE-MASS-PRODUCTION.md` e `docs/CORE-MASS-PRODUCTION-CONTRACT.md`.

## Offline e sincronização

A fila local só deve ser limpa após confirmação do servidor. Snapshots têm revisão monotônica e limite de 256 KB. Chaves de API, tokens e dados binários de áudio não entram no snapshot. O Gravador usa o bucket privado `recordings` e sincroniza metadados; o arquivo é transferido sob demanda.

A sessão única é aplicada pelo servidor quando online. Um dispositivo totalmente offline não recebe revogação em tempo real: o lease previamente validado tem validade máxima de 72 horas e é revalidado ao reconectar.

## IA / Groq

O app não fornece chave compartilhada. O fluxo BYOK usa chave administrada pelo usuário e armazenada localmente; a chave não deve ser sincronizada, enviada em logs, URLs ou repositórios. O app exige confirmação de 18 anos e ciência do envio de conteúdo ao provedor. Não prometer cota gratuita fixa nem retenção zero.

**Pendência jurídica:** o uso de contas pessoais BYOK por alunos em aplicativo comercial de terceiro ainda requer confirmação escrita da Groq. Não declarar formalmente aprovado até essa confirmação. Consulte `docs/DOCTOR-CORE-GROQ-LEGAL-STANDARD.md`.

## Segurança e publicação

Nunca versionar chaves Groq, Supabase service-role, tokens de pagamento ou outros segredos. O cliente usa somente configuração pública do Supabase. Não habilitar checkout, publicar produto ou ativar aplicativo sem homologação funcional, revisão editorial e autorização de lançamento.
