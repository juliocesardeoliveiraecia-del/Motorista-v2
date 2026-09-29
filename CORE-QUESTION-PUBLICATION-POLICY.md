# Doctor Core — Gate de publicação de questões

Objetivo: impedir que conteúdo não revisado chegue ao aluno.

## Estados
draft/imported -> structural_validated -> semantic_validated -> editorial_reviewed -> approved -> published

O runtime só pode selecionar questões com reviewStatus="approved". Questões geradas por IA entram como não publicadas até passar pela revisão independente e validação estrutural novamente.

## Identidade
Cada resposta guarda questionId, questionVersionId, contentHash e contextVersionId. Alterar enunciado, alternativas, gabarito ou explicações produz uma nova versão lógica.

## Defesa contra o bug de avaliação
A UI não deve comparar a alternativa por conta própria. Toda avaliação passa por DoctorQuestionContract.evaluate/audit, e a mesma decisão é usada para feedback imediato, revisão e resultado final.

## Conteúdo atual
As 32 questões históricas foram submetidas a QA interno estrutural/semântico/editorial e marcadas approved para esta baseline. Isso não substitui uma futura revisão especializada quando houver mudança de lei/edital.

## Produção em massa
Um novo aplicativo troca Product Context + conteúdo + assets/configuração. O motor de avaliação, persistência, versionamento e gate permanece único.
