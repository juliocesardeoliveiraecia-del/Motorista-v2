# Doctor Core — normas de edital, banca e ciclo de atualização da fábrica

**Objetivo:** impedir que um aplicativo seja fabricado com edital, banca, cargo ou matriz de prova de outro concurso, e permitir a atualização controlada quando sair novo edital, retificação ou alteração oficial.

## 1. Identidade imutável do produto

A unidade de fabricação é sempre **um cargo específico dentro de um concurso identificável**. Todo manifesto deve informar:
- `institutionGroupId`: identificador estável do órgão/família;
- `targetPosition`: cargo exato, igual a `app.cargo`;
- `contentIsolation: single_position_only`;
- `sharedContentPolicy: verified-identical-topics-only`.

Não é permitido usar produto genérico como “PF completo”, “Câmara geral” ou “Tribunais”. Especialidades com provas/matrizes distintas exigem produtos separados. Compartilhamento de conteúdo só ocorre depois de comparar os dois editais e provas oficiais, tópico por tópico; a trilha e o banco continuam isolados.

## 2. Hierarquia de fontes e identidade da banca

Ordem obrigatória:
1. Edital vigente e retificações publicados pelo órgão ou pela banca organizadora, em endereço oficial.
2. Anexos oficiais, conteúdo programático, quadro de provas, cronograma e regras de pontuação.
3. Provas e gabaritos oficiais do mesmo concurso/cargo, quando publicados.
4. Para pré-edital: último edital oficial do mesmo cargo e última prova/gabarito oficial correspondente.
5. Leis e atos oficiais atualizados para legislação e fatos normativos.

Notícia, cursinho, fórum, rede social, agregador ou material comercial não substitui fonte primária para definir banca, conteúdo, peso, número de questões, datas ou requisitos.

A banca deve ser registrada com nome exato e URL oficial que comprove a relação com aquele concurso. Em pré-edital, `bancaStatus` deve ser `historical-reference`: a banca histórica orienta o estilo de treino, mas **não é promessa nem confirmação da banca do próximo concurso**. Só usar `confirmed-current` quando o edital vigente confirmar a organizadora.

## 3. Modo pré-edital

O aplicativo pode ser produzido sem edital novo, mas deve:
- exibir claramente “pré-edital — baseado no último edital e na última prova oficial localizados”;
- apontar o edital anterior exato, sua data/número e a prova/gabarito oficial usados;
- manter a banca como referência histórica, nunca como banca futura confirmada;
- não inventar data de prova, cronograma, número/peso de questões ou requisito que não esteja comprovado;
- separar conteúdo confirmado em lei/edital anterior de hipóteses de preparação;
- registrar a data da última prova e as URLs oficiais;
- deixar o conteúdo em estado de revisão, sem publicação automática.

Se não for possível localizar edital anterior e prova oficial adequados ao mesmo cargo, o pacote fica `pending` e a fábrica não gera configuração pronta para lançamento.

## 4. Modo pós-edital e retificações

Quando sair edital novo:
1. criar nova edição (`edition.id`) e incrementar `edition.sequence`;
2. manter a edição anterior imutável e referenciá-la em `supersedesEditionId`;
3. substituir a referência histórica pela URL exata do edital vigente, anexos e retificações oficiais;
4. confirmar a banca do edital e marcar `bancaStatus: confirmed-current`;
5. extrair novamente matérias, tópicos, pesos, questões, formatos, datas, requisitos, critérios eliminatórios e redação;
6. comparar com a edição anterior e preencher `changeSet` com inclusões, exclusões, alterações de peso, formato, banca, datas e demais mudanças, cada uma com fonte;
7. atualizar plano, simulados, questões, redação e explicações afetadas;
8. executar QA técnico e revisão editorial humana antes de qualquer publicação.

Retificação oficial também gera nova revisão de edição e change set. Não sobrescrever silenciosamente o manifesto anterior nem reescrever o histórico de desempenho do aluno.

## 5. Política de migração de conteúdo e progresso

- Tópico realmente idêntico pode manter identificador estável; tópico novo recebe novo ID.
- Tópico removido deixa de aparecer na trilha atual, mas seu histórico permanece arquivado para auditoria.
- Questões incompatíveis com o edital novo são retiradas do banco ativo; não são apagadas do histórico de tentativas.
- Questões afetadas por mudança de banca, formato, regra ou conteúdo devem ser reavaliadas e, quando necessário, reescritas.
- Não converter automaticamente múltipla escolha em certo/errado ou vice-versa.
- Progresso do aluno deve ser preservado e remapeado apenas quando houver equivalência curricular comprovada. Sem equivalência, manter histórico como “conteúdo da edição anterior”.
- Toda nova versão de conteúdo recebe `contentVersion` próprio, hashes novos e rastreabilidade por questão.

## 6. Gates de fabricação

A fábrica deve bloquear a geração/aplicação se houver:
- cargo/órgão divergente, cargo genérico ou manifesto sem isolamento;
- banca sem evidência oficial, ou banca futura apresentada como confirmada em pré-edital;
- edital, prova ou retificação sem fonte primária adequada;
- distribuição de matérias/questões que não fecha com o quadro oficial;
- modalidade de prova incompatível com as regras (por exemplo, Cebraspe certo/errado versus múltipla escolha);
- sequência de edição sem vínculo com a anterior;
- atualização sem change set;
- matéria, tópico ou questão sem rastreabilidade.

Passar na validação técnica não significa aprovação acadêmica. Revisão humana independente continua obrigatória. Produto fica `draft` e app `maintenance` até o gate editorial e de publicação ser satisfeito.

## 7. Fluxo operacional

`Descoberta do concurso → confirmação do cargo → coleta de fontes oficiais → classificação pré/pós-edital → extração da matriz → manifesto versionado → comparação/QA → conteúdo rastreável → revisão humana → homologação → publicação`

O gerador de configuração não deve inventar ou produzir questões automaticamente nesta etapa. Ele valida a identidade e a configuração; a produção de conteúdo, assets, repositório e hospedagem permanece em etapas separadas e com gates próprios.

## 8. Contrato técnico do manifesto

O gerador valida `app.institutionGroupId`, `targetPosition`, `contentIsolation`, `sharedContentPolicy`, `bancaStatus` e o objeto `edition`. A edição inclui identificador, sequência, modo, base documental, número/data/URL do edital, URL de prova quando pré-edital, banca e fonte de comprovação, relação com edição anterior e `changeSet`.

Valores de `edition.basis`:
- `last-official-edital-and-exam` para pré-edital;
- `current-official-edital` para pós-edital.

Valores de `edition.sourceType`:
- `previous-edital` para pré-edital;
- `current-edital` para pós-edital.

A fábrica valida HTTPS e host permitido para edital, prova, evidência da banca e fontes de cada alteração. A lista de hosts deve ser explicitamente revisada; não usar domínios genéricos como prova de autenticidade de documentos específicos.