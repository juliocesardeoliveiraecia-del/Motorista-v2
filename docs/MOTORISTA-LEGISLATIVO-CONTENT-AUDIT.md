# Auditoria do pacote de conteúdo — Motorista Legislativo

**Pacote:** `2026.2`  
**Edital-base:** Edital de Abertura nº 02/2026 — Câmara Municipal de Ipameri/GO  
**Banca:** Instituto Verbena/UFG  
**Fonte primária:** [PDF oficial do edital](https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/sistema/arquivos/editais/EDITAL_CAMARA_IPAMERI_GO.pdf)

## Distribuição oficial da prova

O Quadro 4 do edital (página 16) define 40 questões e pesos:

| Disciplina | Questões na prova | Peso por questão |
|---|---:|---:|
| Língua Portuguesa | 10 | 2 |
| Raciocínio Lógico-Matemático | 3 | 1 |
| Realidade de Goiás e Ipameri | 2 | 1 |
| Conhecimentos Específicos | 25 | 3 |
| **Total** | **40** | — |

A prova objetiva tem quatro alternativas (A-D), uma correta, duração de quatro horas e nota mínima de 60 pontos, conforme item 7.1.1.

## Conteúdo específico do cargo

O Anexo IV, páginas 38-39, lista seis eixos para Motorista Legislativo:

1. CTB (Lei nº 9.503/1997 e alterações) e normas do CONTRAN sobre circulação, conduta e sinalização.
2. Direção defensiva, prevenção de acidentes, condições adversas, comportamento seguro, primeiros socorros no trânsito e providências em acidentes/avarias.
3. Mecânica básica, sistemas do veículo, falhas simples, manutenção preventiva, itens de segurança e equipamentos obrigatórios.
4. Transporte institucional de passageiros e documentos; postura, discrição, sigilo e responsabilidade.
5. Ética, disciplina, relações interpessoais e atendimento ao público no serviço público.
6. Relatórios de viagem e controle de quilometragem.

## Banco do Doctor Core

O pacote `2026.2` contém 47 questões autorais de treino:

| Disciplina | Questões disponíveis | Seleção no simulado oficial |
|---|---:|---:|
| Português | 10 | 10 |
| Raciocínio lógico | 6 | 3 |
| Realidade de Goiás/Ipameri | 6 | 2 |
| Conhecimentos específicos | 25 | 25 |
| **Total** | **47** | **40** |

O excedente em Raciocínio Lógico e Realidade permanece no banco de prática. O motor seleciona, para o simulado oficial, exatamente o número previsto no edital por disciplina e embaralha a ordem final.

A posição das respostas corretas foi balanceada entre A-D (12/12/12/11) para evitar padrões previsíveis. O auditor de release também bloqueia concentração excessiva em uma única letra.\n\nAs questões deste pacote são material didático autoral, não transcrições da prova oficial nem questões oficialmente aprovadas pela banca. O gabarito e as justificativas foram submetidos a validação estrutural automatizada (quantidade de alternativas, índice de resposta, explicações e duplicidade). A aprovação automatizada não substitui revisão factual/editorial humana.

## Gates automatizados

O workflow `Doctor Core QA` executa:
- auditoria estrutural do Core;
- auditoria determinística do conteúdo;
- `node tools/audit-content.mjs --release`, que bloqueia a liberação se faltar a quantidade mínima de questões de qualquer disciplina;
- contratos da ponte da plataforma, scaffold de produto e aviso legal de IA.

No commit `014844c01bafb4c86ee820948fc3cf008994f6cd`, os três workflows — Doctor Core Audit, Doctor Core version contract e Doctor Core QA — concluíram com sucesso.

## Limite de liberação

A aprovação do gate demonstra que o pacote cumpre a distribuição estrutural e os contratos automatizados. Antes de publicação comercial, ainda deve ocorrer revisão editorial independente das questões, verificação de atualidade das normas citadas e teste funcional do simulado em dispositivo.


## Registro central do conteúdo — produção 2026-11-11

A migração `20261111010740_motorista_content_registry_traceability` foi aplicada ao Supabase de produção de forma aditiva e idempotente. O registro central agora contém:
- 4 matérias e 39 tópicos vinculados à versão de contexto do produto;
- 1 contexto de produto e 1 versão de contexto em estado `draft`, pois o produto permanece em pré-edital;
- 47 registros de rastreabilidade, associados ao ID estável da questão e à matéria;
- estado editorial `pending` para as 47 questões, sem aprovação automática;
- índice único por produto + ID de questão para impedir duplicação em reimportações.

O mapeamento individual de questão para tópico ainda está pendente. A migração registra isso explicitamente em `metadata.topicAssignment`; não atribui tópicos por inferência e não declara revisão factual independente concluída. As URLs do último edital e da última prova são registradas como fontes de referência do escopo, não como prova de que cada gabarito foi validado.

O contrato `qa/content-registry-migration-contract.mjs` compara o conjunto de IDs do pacote estático com os IDs da migração e bloqueia divergências ou aprovação editorial automática. O workflow Doctor Core QA executa esse contrato em cada PR.

**Limite:** o registro central melhora a governança e a rastreabilidade, mas não substitui revisão humana das 47 questões, nem altera o estado comercial do produto.
