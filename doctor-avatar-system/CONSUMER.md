# Consumo do Evolução Doctor — Motorista Legislativo

O Motorista Legislativo consome a biblioteca oficial do Doctor Concursos. Não mantém arquivos mestres próprios, não redesenha níveis e não altera a progressão de XP.

## Fonte da progressão
`Doctor.getProgress()` continua sendo a única fonte do nível, XP, percentual e próximo marco. O consumidor não cria thresholds paralelos nem altera os dados do aluno.

## Resolução do avatar
Após a publicação da versão completa e aprovada do catálogo central:
1. Carregar o manifesto da versão oficial.
2. Validá-lo com `DoctorEvolutionAssets.validateManifest(manifest)`.
3. Obter `const progress = Doctor.getProgress()`.
4. Resolver `DoctorEvolutionAssets.resolve(progress.level.level, manifest)`.
5. Usar somente `resolved.src` como imagem do card.
6. Se o manifesto ou o arquivo falhar, manter a última versão aprovada em cache PWA; não recorrer a SVG genérico, miniatura ou URL alternativa.

## Cache e atualização
- Cache por `resolved.cacheKey` (versão + SHA-256).
- Pré-baixar e validar o conjunto completo antes de ativar uma versão nova.
- Manter a versão anterior até a nova estar íntegra; operação offline continua usando o cache anterior.
- Não invalidar os dados de XP, sessões, progresso ou snapshots do aluno.

## Bloqueio de integração visual
A integração só pode ser ativada quando os dez arquivos individuais aprovados estiverem disponíveis no catálogo central. Enquanto isso, a arte atual do app não deve ser substituída parcialmente. O PR de Nível 10 isolado permanece fora da liberação.
