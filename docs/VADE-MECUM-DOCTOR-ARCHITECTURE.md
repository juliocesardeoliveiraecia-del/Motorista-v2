# Vade-Mécum Doctor — arquitetura e estado de homologação

**Status:** infraestrutura jurídica central aplicada em produção; 13 versões candidatas capturadas e armazenadas privadamente; nenhuma versão publicada aos alunos.
**Propriedade arquitetural:** módulo transversal do Doctor Core, reutilizável por todos os aplicativos Doctor compatíveis. Primeiro consumidor/homologação: Motorista Legislativo.

## Princípios editoriais

1. Somente fontes oficiais e gratuitas.
2. O texto normativo é separado de comentários, resumos, questões e material pedagógico.
3. Toda obra registra autoridade, URL, formato, data da captura, vigência quando conhecida, versão e hashes SHA-256.
4. Capturas novas geram candidatas; nunca substituem automaticamente a versão vigente.
5. Publicação exige revisão administrativa e revalidação do conteúdo original.
6. Falha de rede, hash divergente ou extração incompleta preserva a última versão válida.
7. Busca e leitura offline não dependem de GROQ ou de conexão.
8. Nenhum custo novo ou plano pago é introduzido sem aprovação.
9. A interface só informa atualização quando a verificação realmente ocorreu.
10. Capas e elementos visuais são originais Doctor; acesso gratuito ao texto não autoriza copiar capas editoriais de terceiros.

## Catálogo inicial — 13 documentos

| ID | Documento | Fonte oficial atual |
|---|---|---|
| BR-CF-1988 | Constituição Federal | Câmara dos Deputados — HTML atualizado até EC 141/2026 |
| BR-ADCT-1988 | Ato das Disposições Constitucionais Transitórias | Câmara dos Deputados — compilação aplicável até EC 136/2025 |
| BR-CTB-1997 | Código de Trânsito Brasileiro | Câmara dos Deputados — HTML atualizado |
| BR-CP-1940 | Código Penal | Câmara dos Deputados — HTML atualizado |
| BR-CPP-1941 | Código de Processo Penal | Câmara dos Deputados — HTML atualizado |
| BR-LEP-1984 | Lei de Execução Penal | Câmara dos Deputados — HTML atualizado |
| BR-ECA-1990 | Estatuto da Criança e do Adolescente | Câmara dos Deputados — HTML atualizado |
| BR-CC-2002 | Código Civil | Câmara dos Deputados — HTML atualizado |
| BR-CDC-1990 | Código de Defesa do Consumidor | Câmara dos Deputados — HTML atualizado |
| BR-LMP-2006 | Lei Maria da Penha | Câmara dos Deputados — HTML atualizado |
| BR-ESTATUTO-IDOSO-2003 | Estatuto da Pessoa Idosa | Câmara dos Deputados — HTML atualizado |
| INT-UDHR-1948-PT | Declaração Universal dos Direitos Humanos | OHCHR / Nações Unidas — PDF em português |
| INT-MANDELA-2015-PT | Regras de Mandela | UNODC / Nações Unidas — PDF em português |

A DUDH e as Regras de Mandela pertencem à prateleira internacional de Direitos Humanos; não são leis brasileiras.

## Fontes diretas

- Constituição Federal: https://www2.camara.leg.br/legin/fed/consti/1988/constituicao-1988-5-outubro-1988-322142-normaatualizada-pl.html
- ADCT: https://www2.camara.leg.br/legin/fed/conadc/1988/constituicao.adct-1988-5-outubro-1988-322234-normaatualizada-pl.html
- CTB: https://www2.camara.leg.br/legin/fed/lei/1997/lei-9503-23-setembro-1997-372348-normaatualizada-pl.html
- Código Penal: https://www2.camara.leg.br/legin/fed/declei/1940-1949/decreto-lei-2848-7-dezembro-1940-412868-normaatualizada-pe.html
- CPP: https://www2.camara.leg.br/legin/fed/declei/1940-1949/decreto-lei-3689-3-outubro-1941-322206-normaatualizada-pe.html
- LEP: https://www2.camara.leg.br/legin/fed/lei/1980-1987/lei-7210-11-julho-1984-356938-normaatualizada-pl.html
- ECA: https://www2.camara.leg.br/legin/fed/lei/1990/lei-8069-13-julho-1990-372211-normaatualizada-pl.html
- Código Civil: https://www2.camara.leg.br/legin/fed/lei/2002/lei-10406-10-janeiro-2002-432893-normaatualizada-pl.html
- CDC: https://www2.camara.leg.br/legin/fed/lei/1990/lei-8078-11-setembro-1990-365086-normaatualizada-pl.html
- Maria da Penha: https://www2.camara.leg.br/legin/fed/lei/2006/lei-11340-7-agosto-2006-545133-normaatualizada-pl.html
- Estatuto da Pessoa Idosa: https://www2.camara.leg.br/legin/fed/lei/2003/lei-10741-1-outubro-2003-497511-normaatualizada-pl.html
- DUDH: https://www.ohchr.org/en/UDHR/Documents/UDHR_Translations/por.pdf
- Regras de Mandela: https://www.unodc.org/documents/justice-and-prison-reform/Nelson_Mandela_Rules-P-ebook.pdf

**Revisão constitucional:** a Constituição está compilada até a EC 141/2026. O ADCT tem corte próprio, EC 136/2025; a EC 139/2026 altera dispositivos da Constituição, mas não altera o ADCT. O validador mantém esses limites separados e bloqueia texto que não comprove a revisão aplicável.

## Modelo de dados e segurança

O Supabase de produção contém:
- `legal_documents`: catálogo e ponteiro para a versão vigente.
- `legal_document_versions`: versões imutáveis, hashes, origem, vigência e estado editorial.
- `legal_update_runs`: histórico de capturas e auditorias.
- `legal_change_events`: trilha de alterações e decisões.
- Bucket privado `legal-library`: pacotes originais e texto normalizado.

RLS permite leitura autenticada apenas de documentos ativos, versões publicadas e respectivos arquivos. Administradores têm leitura editorial; escrita de catálogo e versões é reservada ao servidor. A versão corrente só pode apontar para versão do mesmo documento. Versões publicadas/substituídas não podem ser alteradas nem excluídas.

O pipeline usa:
- `legal-library-sync`: captura de fontes oficiais, validação de host, hash e estrutura, cria candidatas e nunca publica automaticamente. A função aceita sessão administrativa validada ou token interno restrito.
- `legal-library-publish`: exige JWT e administrador Doctor; confere novamente os bytes originais, reproduz a extração HTML/PDF e valida SHA-256 antes da publicação.
- RPC transacional: a versão anterior passa a `superseded`, a nova torna-se vigente e o evento é gravado na mesma transação.
- Token de agendamento aleatório armazenado no Vault; o segredo de serviço não é colocado em jobs ou código cliente.

## Extração e integridade

- HTML: extração por DOMParser, sem executar scripts nem reescrever o texto.
- PDF: extração textual por PDF.js, sem OCR improvisado. O pacote preserva os bytes originais e o texto normalizado; antes da publicação, o servidor repete a extração do PDF original e compara o resultado.
- A Constituição, o ADCT e cada código têm verificadores de título/número e revisão aplicável.
- DUDH exige os artigos 1 a 30; Mandela exige as Regras 1 a 122.
- SHA-256 comprova integridade da captura, não substitui a conferência da autoridade, vigência e conteúdo jurídico.

## Atualização automática

Extensões gratuitas `pg_cron` e `pg_net` estão habilitadas; o token interno fica no Vault.

- Diário: 08:30, horário de Brasília (11:30 UTC), usando ETag e Last-Modified quando disponíveis.
- Semanal: segunda-feira, 08:45, horário de Brasília (11:45 UTC), com captura integral.
- Cada execução é dividida em sete lotes curtos para evitar timeout. Os lotes incluem HTML e PDFs.
- Atualizações criam candidatas. Nenhum job aprova ou publica conteúdo.

A auditoria semanal não garante que uma lei não tenha mudado entre verificações; a interface mostra o horário real da última captura.

## Offline e integração com a Fábrica

- O catálogo é central; cada aplicativo Doctor declara sua coleção por edital/jurisdição.
- O cliente baixa apenas versões publicadas, valida SHA-256 e armazena cada obra no IndexedDB.
- Busca e leitura funcionam localmente, sem GROQ e sem rede.
- Falha de sincronização mantém a última cópia íntegra.
- O acervo jurídico não é embutido no bundle principal nem no cache geral do PWA.
- Notas, favoritos e progresso são segregados por usuário e produto.
- O módulo usa o cliente Supabase da sessão autenticada; não recebe chave de serviço.

## Estado de produção verificado em 13/11/2026

- Quatro tabelas e o bucket privado foram criados no Supabase.
- As duas Edge Functions estão ativas.
- Jobs diário e semanal estão ativos e divididos em lotes.
- 13 documentos têm versões candidatas capturadas; há uma versão antiga do ADCT rejeitada por um critério de revisão que foi corrigido. Nenhuma versão está publicada.
- 14 pacotes privados ocupam aproximadamente 26,6 MB (13 candidatas e 1 pacote rejeitado).
- O teste de migração/publicação em PostgreSQL isolado passou; QA do Core, auditoria, contrato de versão, Vade-Mécum e type-check Deno passaram no commit de homologação.
- A auditoria de segurança não apontou novos alertas específicos do Vade-Mécum. Permanecem alertas preexistentes em funções e tabelas de outros módulos, que não foram alterados para evitar impacto em autenticação, pagamentos ou sessões.

## Pendências antes de liberar aos alunos

- Revisão jurídica/editorial de cada candidata, conferindo texto, vigência e alterações recentes.
- Tela administrativa de revisão/preview/aprovação/rejeição integrada ao painel Doctor.
- Teste final de leitura e pesquisa offline em aparelho real.
- Regressão do Motorista Legislativo e do fluxo de acesso do aluno.
- Merge do PR e validação visual do app. O preview Vercel do commit atual está bloqueado por `build-rate-limit`; não foi feito upgrade nem criado custo adicional.

**Regra de publicação:** manter as 13 versões como candidatas até a revisão administrativa. Nenhum texto jurídico será exibido como vigente/publicado antes da aprovação.
