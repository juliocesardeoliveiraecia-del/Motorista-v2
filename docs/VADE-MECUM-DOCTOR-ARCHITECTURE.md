# Vade-Mécum Doctor — arquitetura inicial

**Status:** estruturação inicial; ainda não é uma biblioteca publicada.
**Propriedade arquitetural:** módulo transversal do Doctor Core, reutilizável por todos os aplicativos Doctor compatíveis. **Primeiro consumidor/homologação:** Motorista Legislativo. O Motorista não é proprietário de uma implementação exclusiva.

## Princípio editorial

Lei seca oficial e integral é a fonte primária de estudo. Resumos, comentários, questões e explicações são camadas auxiliares: nunca substituem nem se misturam ao texto normativo.

## Regras inegociáveis

1. Somente documentos gratuitos obtidos diretamente de fontes oficiais.
2. Cada obra exibe fonte, URL, tipo, data de publicação quando disponível, vigência conhecida, versão e última verificação.
3. Texto normativo separado de comentários pedagógicos.
4. Nenhuma versão nova é promovida sem validação de origem, integridade e consistência.
5. Falha de rede/atualização nunca apaga a última versão válida baixada.
6. Conteúdo offline pesquisável sem IA e sem conexão.
7. Nenhum consumo de GROQ para baixar, catalogar, atualizar ou pesquisar textos oficiais.
8. Nenhum serviço pago ou contratação nova sem aprovação expressa.
9. A interface não declara atualização confirmada sem verificação; mostra data e estado reais.
10. Acesso gratuito à fonte não autoriza copiar capas/editoriais de terceiros. Capas Doctor serão originais.

## Primeiro pacote — catálogo inicial

| ID | Documento | Categoria | Prioridade |
|---|---|---|---|
| BR-CF-1988 | Constituição da República Federativa do Brasil de 1988 | Constituição | P0 |
| BR-ADCT-1988 | Ato das Disposições Constitucionais Transitórias | Constituição | P0 |
| INT-UDHR-1948-PT | Declaração Universal dos Direitos Humanos | Direitos humanos e documentos internacionais | P0 |
| BR-CTB-1997 | Código de Trânsito Brasileiro — Lei nº 9.503/1997 | Códigos e trânsito | P0 |

A DUDH é uma declaração internacional, não uma lei brasileira. Deve aparecer em uma prateleira própria de Direitos Humanos e Documentos Internacionais.

A expansão para Código Penal, Código Civil, CPP, CPC, ECA, LGPD, improbidade, licitações e demais normas será feita em lotes. A priorização combina pertinência ao edital, hierarquia normativa e necessidade do produto; não será uma lista fechada presumida.

## Fontes oficiais iniciais

- Constituição e ADCT — Câmara dos Deputados: https://www2.camara.leg.br/atividade-legislativa/legislacao/constituicao1988
- Legislação federal — Portal da Legislação/Planalto: https://www4.planalto.gov.br/legislacao
- CTB — Planalto: https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm
- DUDH em português — Nações Unidas no Brasil: https://brasil.un.org/pt-br/66717-declaracao-universal-dos-direitos-humanos

A fonte primária específica fica registrada no manifesto. Divergências entre portais oficiais bloqueiam a promoção até reconciliação.

## Modelo de documento e versão

Cada obra possui ID estável e versões imutáveis. Cada versão registra título oficial, categoria, jurisdição, identificação normativa, autoridade emissora, fonte/URL/formato, publicação e vigência quando conhecidas, estado editorial, captura/verificação, hashes SHA-256 do bruto e do texto normalizado, método de extração, relatório de validação e versão anterior.

Estados editoriais: planned, source_verified, ingested, validated, published ou blocked.

Nunca sobrescrever versão publicada. Nova captura cria versão candidata. A versão ativa só muda após todos os gates.

## Atualização e pipeline seguro

- **Detecção diária online:** verificar indicadores de alteração (ETag, Last-Modified ou hash, quando disponíveis).
- **Auditoria integral semanal:** a cada sete dias, reconciliar catálogo, integridade e fontes; registrar a auditoria mesmo sem alterações.
- **Atualização extraordinária:** mudança, retificação, revogação ou alerta oficial gera candidato prioritário.
- **Pipeline:** consultar fonte oficial; capturar original e metadados; validar resposta/formato/codificação; extrair sem reescrever; validar identificação, estrutura e integridade; comparar versões; realizar revisão necessária; publicar atomicamente; preservar versão anterior; sincronizar clientes.

O ciclo semanal é uma auditoria operacional, não uma garantia de que a lei não mudou entre verificações. Mostrar sempre o horário real da última conferência.

## Leitura e experiência visual

Biblioteca em prateleiras por categoria, capas originais Doctor, busca por título/número/artigo/assunto/expressão, leitor com navegação por títulos e artigos, tipografia confortável, tema claro/escuro, marcadores, favoritos, notas, progresso, metas voluntárias, questões relacionadas com referência precisa e comparação de versões.

Capas não substituem o nome oficial, identificação normativa ou fonte. Não usar brasões/logotipos como se fossem capas oficiais nem inventar selo de órgão público.

## Formato técnico e offline

Priorizar texto estruturado pesquisável (HTML/XML/JSON quando fornecido oficialmente). PDF oficial pode ser cópia complementar, nunca o único formato de busca. O cliente mantém índice local e versões baixadas. Atualização ocorre em staging, validação e troca atômica. Falha mantém versão anterior.

Não embutir todo o acervo no bundle JS ou cache principal do PWA. Entregar sob demanda por coleção. Usar primeiro infraestrutura gratuita já disponível; nenhum custo novo sem aprovação.

## Segurança

Sanitizar HTML antes de renderizar; não executar scripts de documentos; não incluir segredos/tokens; tratar arquivos externos como não confiáveis. Hash comprova integridade da captura, não autenticidade jurídica por si só nem correção editorial. Notas e marcações são dados privados do aluno.

## Integração com a Fábrica

- **Core:** leitor, busca local, favoritos, progresso, sincronização, cache e contrato de atualização.
- **Catálogo:** metadados e referências das obras.
- **Conteúdo:** versões oficiais imutáveis.
- **Product Context:** coleção pertinente ao edital e sua versão.
- **Apresentação:** capas, ícones, cores e organização por produto.

Biblioteca nacional central; cada app declara coleção própria. Normas estaduais/municipais entram em coleções específicas sem alterar o acervo nacional.

## Gates antes de produção

- [ ] Fontes oficiais validadas.
- [ ] Captura reproduzível e gratuita.
- [ ] Texto integral comparado à fonte.
- [ ] Estrutura de artigos conferida.
- [ ] Hashes e relatório arquivados.
- [ ] Leitura e busca offline testadas em celular.
- [ ] Falha de atualização não destrói versão ativa.
- [ ] Data da última verificação visível.
- [ ] Sanitização e segurança validadas.
- [ ] Capas originais aprovadas em temas claro/escuro.
- [ ] Revisão editorial aprovada.

**Estado atual:** contrato e catálogo inicial estruturados. Nenhum texto foi ainda baixado, validado ou publicado dentro do aplicativo por esta especificação.


## Regra de produto multi-app

Todos os apps Doctor compatíveis devem consumir o mesmo runtime do Vade-Mécum. A variação é declarativa:
- coleção documental e jurisdição;
- edital/versão e relevância dos documentos;
- branding e prateleiras permitidas;
- permissões e disponibilidade offline.

Não se varia por app o motor de busca, leitor, parser, integridade, cache, sincronização ou pipeline de atualização. Esses recursos pertencem ao Core e recebem testes de contrato compartilhados. Os documentos nacionais são armazenados uma vez no catálogo central e referenciados pelos produtos; conteúdo estadual, municipal ou institucional recebe identidade e jurisdição próprias. Notas, favoritos e progresso são segregados por usuário e produto.
