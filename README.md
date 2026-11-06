# Doctor Core — Motorista Legislativo

Aplicativo derivado do Doctor Core, configurado para o concurso de **Agente Legislativo — Motorista Legislativo**, da Câmara Municipal de Ipameri/GO, Edital nº 02/2026, banca Instituto Verbena/UFG.

## Estado atual

- Core: **1.12.13**.
- Ambiente configurado: **Supabase staging**.
- Bridge central: habilitada na branch de homologação.
- Produto no catálogo: `draft`.
- Aplicativo no catálogo: `maintenance`.
- URL comercial do app: ainda não publicada.
- Checkout do aplicativo: desativado; pagamentos e concessão de acesso pertencem ao Doctor Pay central.
- Esta branch/PR não representa publicação em produção.

## Funcionalidades do Core

- PWA instalável e experiência offline.
- Prática de questões, histórico, revisão e Caderno de Erros.
- Simulados com cronômetro e distribuição fiel ao edital.
- Flashcards e ferramentas de estudo.
- Caderno Doctor, Gravador Doctor, Redação Doctor e Radar Doctor, conforme disponibilidade do produto.
- Doctor IA via Groq, sujeita a confirmação de idade, aviso de dados e chave própria do usuário.
- Sessão central por usuário/aplicativo e sincronização versionada.
- Central de Suporte integrada à Plataforma Doctor.
- Gate de integridade de questões, revisão de conteúdo gerado por IA e rastreabilidade.

## Estrutura da prova

| Matéria | Questões | Peso/questão | Pontos |
|---|---:|---:|---:|
| Língua Portuguesa | 10 | 2 | 20 |
| Raciocínio Lógico-Matemático | 3 | 1 | 3 |
| Realidade de Goiás e Ipameri | 2 | 1 | 2 |
| Conhecimentos Específicos | 25 | 3 | 75 |
| **Total** | **40** | — | **100** |

Duração: 4 horas. Quatro alternativas (A–D). Nota mínima: 60 pontos.

## Integridade do conteúdo

O banco estático atual contém 32 questões (8 Português, 6 RLM, 6 Realidade, 12 Específicos), abaixo das 40 exigidas pelo edital. Por isso, o simulado oficial permanece bloqueado até completar a distribuição e revisar todas as questões elegíveis.

Uma questão só pode chegar ao aluno se tiver ID único, matéria válida, alternativas sem duplicidade, gabarito válido, explicações alinhadas, ausência de quarentena e revisão independente quando gerada por IA. A auditoria estrutural não substitui a revisão factual e editorial.

Comandos de auditoria:
```bash
node tools/audit-content.mjs
node tools/audit-content.mjs --release
```

## Sincronização e uso offline

A bridge usa o mesmo Supabase Auth da Plataforma e as RPCs autenticadas `claim_device_session_v1`, `heartbeat_device_session_v1`, `get_app_snapshot_v1` e `save_app_snapshot_v1`.

A fila local só é limpa após confirmação do servidor. Snapshots têm revisão monotônica e limite de 256 KB. Chaves de API, tokens e dados binários de áudio não entram no snapshot. O Gravador usa o bucket privado `recordings` e sincroniza metadados; o arquivo é transferido sob demanda.

A sessão única é aplicada pelo servidor quando online. Um dispositivo totalmente offline não recebe revogação em tempo real: o lease previamente validado tem validade máxima de 72 horas e é revalidado ao reconectar.

## IA / Groq

O app não fornece chave compartilhada. O fluxo implementado é BYOK, com chave administrada pelo usuário e armazenada localmente. O app exige confirmação de 18 anos e ciência do envio de conteúdo ao provedor; não promete cota gratuita fixa nem retenção zero.

**Pendência jurídica:** os documentos públicos da Groq não esclarecem de forma inequívoca o uso de contas pessoais BYOK por alunos em aplicativo comercial de terceiro. Não declarar o modelo formalmente aprovado até receber confirmação escrita da Groq. Consulte `docs/DOCTOR-CORE-GROQ-LEGAL-STANDARD.md`.

## Gerar um novo produto

Use o manifesto de exemplo e a fábrica de configuração para validar o edital e gerar `product-context.js`, `manifest.json` e `version.json`:

```bash
cp templates/product-manifest.example.json product-manifest.json
# Edite o manifesto com dados conferidos no edital e fontes oficiais.
node tools/scaffold-product.mjs --manifest product-manifest.json
node tools/scaffold-product.mjs --manifest product-manifest.json --out-dir . --apply --force
```

O gerador não cria questões, assets, repositório GitHub ou projeto Vercel; conteúdo e identidade visual continuam sendo preparados e revisados separadamente.

## Produção em massa

Um novo aplicativo deve alterar apenas:
- Product Context: concurso, órgão, cargo, banca, edital, regras e identidade;
- Product Content: matérias, tópicos, questões, gabaritos, explicações e fontes;
- Assets: ícones, imagens e identidade visual.

A lógica do Core não deve ser copiada nem reescrita por concurso. Consulte `CORE-MASS-PRODUCTION.md` e `docs/CORE-MASS-PRODUCTION-CONTRACT.md`.

## Segurança

Nunca versionar Groq API keys, Supabase service-role keys, tokens de pagamento ou outros segredos. O cliente usa somente configuração pública do Supabase. Não habilitar checkout, publicar produto ou promover staging para produção sem homologação funcional e autorização.
