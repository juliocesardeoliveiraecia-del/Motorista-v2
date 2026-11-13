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

- Constituição e ADCT — Câmara dos Deputados: https://www2.camara.leg.br/a-camara/atividade-legislativa/legislacao/constituicao1988
  - A página oficial informa a Constituição atualizada até a EC nº 141/2026 e o ADCT até a EC nº 139/2026. O coletor deve resolver o link HTML específico de cada obra a partir dessa página e registrar a revisão encontrada; não presumir que os dois textos tenham a mesma data de atualização.
- Legislação federal — Portal da Legislação/Planalto: https://www4.planalto.gov.br/legislacao
- CTB — Câmara dos Deputados (página oficial da norma; o coletor resolve o link Texto Atualizado HTML): https://www2.camara.leg.br/legin/fed/lei/1997/lei-9503-23-setembro-1997-372348-norma-pl.html
- Código Penal — Câmara dos Deputados: https://www2.camara.leg.br/legin/fed/declei/1940-1949/decreto-lei-2848-7-dezembro-1940-412868-norma-pe.html
- Código de Processo Penal — Câmara dos Deputados: https://www2.camara.leg.br/legin/fed/declei/1940-1949/decreto-lei-3689-3-outubro-1941-322206-norma-pe.html
- Lei de Execução Penal — Câmara dos Deputados: https://www2.camara.leg.br/legin/fed/lei/1980-1987/lei-7210-11-julho-1984-356938-norma-pl.html
- ECA — Câmara dos Deputados: https://www2.camara.leg.br/legin/fed/lei/1990/lei-8069-13-julho-1990-372211-norma-pl.html
- Código Civil — Câmara dos Deputados: https://www2.camara.leg.br/legin/fed/lei/2002/lei-10406-10-janeiro-2002-432893-norma-pl.html
- Código de Defesa do Consumidor — Câmara dos Deputados: https://www2.camara.leg.br/legin/fed/lei/1990/lei-8078-11-setembro-1990-365086-norma-pl.html
- Lei Maria da Penha — Câmara dos Deputados: https://www2.camara.leg.br/legin/fed/lei/2006/lei-11340-7-agosto-2006-545133-norma-pl.html
- Estatuto da Pessoa Idosa — Câmara dos Deputados: https://www2.camara.leg.br/legin/fed/lei/2003/lei-10741-1-outubro-2003-497511-norma-pl.html
- DUDH — Nações Unidas Brasil: https://brasil.un.org/pt-br/66717-declaracao-universal-dos-direitos-humanos
- Regras de Mandela — UNODC (PDF; captura textual automática permanece bloqueada até homologação de extração).
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

## Implementação técnica na branch de homologação

- \`legal-library-sync\`: Edge Function protegida por JWT e permissão de administrador Doctor. Captura apenas domínios oficiais permitidos, preserva bytes originais, HTML e texto normalizado, calcula hashes e cria versões candidatas. Nunca publica automaticamente.
- \`legal-library-publish\`: exige revisão administrativa, verifica novamente hash dos bytes originais, reproduz a extração do HTML e confere o hash do texto normalizado. A publicação usa RPC transacional com RLS: a versão anterior vira \`superseded\` e a nova passa a ser a versão corrente na mesma transação.
- \`vade-mecum.js\`: consulta somente versões publicadas, baixa o pacote privado pelo cliente Supabase autenticado, valida SHA-256 e grava cada obra no IndexedDB. Em falha, mantém a última cópia local íntegra.
- \`doctor-platform-bridge.js\`: expõe apenas o cliente Supabase da sessão já autenticada; não entrega chave de serviço nem token administrativo ao módulo jurídico.
- O pacote offline contém o HTML oficial de origem e o texto normalizado para permitir conferência e leitura sem rede. A pesquisa continua local e não usa GROQ.

**Limite operacional atual:** as funções e a migração estão no repositório/PR, ainda não implantadas no Supabase. O banco de produção permanece sem as tabelas/bucket da biblioteca; portanto, a sincronização real e a publicação de textos ainda não foram executadas. O agendamento diário/semanal também permanece pendente de configuração segura no Vault/Cron.

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
