# Vade-Mécum Doctor — pacote de integração (pré-produção)

**Estado:** preparado para revisão visual e integração futura; NÃO aprovado para publicação em produção.
**Proprietário funcional:** Doctor Core (módulo compartilhado). **Primeiro consumidor/homologação:** Motorista Legislativo.
**Regra de custo:** sem novas assinaturas, serviços pagos ou aumento de plano.

## Conteúdo do pacote

- Interface e leitor inicial: `vade-mecum.js`.
- Integração da tela no app: `index.html`.
- Cache do módulo no shell offline: `service-worker.js`.
- Catálogo e política de atualização: `data/legal-library/manifest.json` (piloto/primeiro consumidor; catálogo canônico compartilhado será mantido no Core).
- Contrato de arquitetura: `docs/VADE-MECUM-DOCTOR-ARCHITECTURE.md`.
- Validadores e QA: `tools/validate-legal-library.mjs`, `qa/legal-library-contract.mjs`, `qa/vade-mecum-contract.mjs`.

## Escopo que está preparado

- O antigo item Doctor Search foi substituído pelo ponto de entrada Vade-Mécum Doctor.
- A biblioteca apresenta quatro obras piloto: Constituição, ADCT, CTB e DUDH (esta última classificada separadamente como documento internacional).
- Busca atual restrita ao catálogo/metadados locais. Não consulta mecanismos externos, não redireciona o estudante e não usa GROQ.
- O módulo é incluído na lista de recursos essenciais do Service Worker e protegido por nova versão de cache.
- O leitor identifica explicitamente obras cujo texto integral ainda não foi ingerido.
- Capas atuais são desenhos CSS provisórios; a aprovação visual do usuário ainda é necessária.

## Bloqueios para produção

1. Ingerir textos integrais a partir das fontes oficiais registradas.
2. Reconciliar divergências entre fontes oficiais, identificar redações vigentes e guardar metadados de captura.
3. Gerar hashes SHA-256, validar estrutura de artigos e registrar versões imutáveis.
4. Implementar índice local de conteúdo integral, navegação por artigo e busca real no texto da lei.
5. Implementar armazenamento offline do conteúdo e atualização atômica com preservação da última versão válida.
6. Implementar verificação diária de alterações e auditoria integral semanal, sem alegar atualização quando não confirmada.
7. Validar acessibilidade, tema claro/escuro, desempenho em celular e segurança de conteúdo.
8. Aguardar aprovação visual do usuário e passar pelos checks completos.

## Política de publicação

- Não disparar implantação Vercel para esta etapa de preparação.
- Não alterar configurações GROQ, pagamentos ou dados de estudantes.
- Não ativar obras com status `planned` como se estivessem publicadas.
- Não promover o aplicativo para produção até que os bloqueios acima sejam resolvidos.
- Integrar o pacote em uma publicação agrupada, junto de outras alterações aprovadas, respeitando o plano gratuito.

## Próximo lote de acervo

O piloto de quatro obras não é limite da biblioteca. Próximos lotes devem incluir, conforme pertinência a editais e validação de fontes: Código Penal, Código Civil, CPP, CPC, CTN, CDC, CLT, ECA, LGPD, licitações e contratos, improbidade administrativa, processo administrativo, legislação de servidores, legislação eleitoral, ambiental, previdenciária, educacional, segurança pública, normas estaduais e municipais. Cada obra será cadastrada como planejada até a ingestão e validação oficial.


## Regra de reutilização em todos os aplicativos

Este pacote não autoriza criar uma versão exclusiva do Vade-Mécum para o Motorista. O Motorista é o primeiro consumidor de homologação do módulo compartilhado Doctor Core. Antes de produzir novos apps em escala, o runtime deve ser publicado como módulo Core versionado, com contrato estável e testes de compatibilidade. Cada produto fornece somente sua configuração/coleção documental e contexto de edital; não copia a lógica da ferramenta. Conteúdo e dados privados do estudante permanecem segregados.

## Política de release sem custo

O pacote deve ser integrado ao release agrupado do Motorista, e depois disponibilizado aos demais apps por atualização coordenada do Core, respeitando as cotas gratuitas. Não criar deploys individuais de teste nem publicar o módulo parcialmente. A promoção exige aprovação visual do usuário, textos oficiais ingeridos e todos os gates do contrato.
