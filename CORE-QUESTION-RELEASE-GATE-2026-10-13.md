# Doctor Core — bloqueio de publicação de questões

**Status: BLOQUEADO para produção em massa até fechar a revisão editorial.**

## Achados confirmados na auditoria do branch V1.12.0

1. `product-content.js` contém 32 questões estáticas sem metadados de aprovação independente, fonte ou versão do Product Context.
2. A distribuição estática é 8 Português / 6 RLM / 6 Realidade / 12 Específicos; o edital exige 10 / 3 / 2 / 25 (40 questões). O simulado oficial deve continuar bloqueado até completar a distribuição com conteúdo aprovado.
3. `DoctorQuestionIntegrity.assertDeliverable` só exige `reviewedByDoctor` quando `aiGenerated` é verdadeiro. Questões estáticas podem passar sem revisão independente.
4. `tools/audit-content.mjs` tem uma verificação tautológica: `expected` e `observed` usam a mesma expressão `selected === q.correct`; ela não detecta divergências reais entre telas, persistência e revisão.
5. As verificações de rótulos das explicações podem detectar desalinhamentos de texto, mas não comprovam a verdade factual do gabarito. A revisão editorial precisa ser independente e rastreável.

## Gate obrigatório antes de publicar qualquer pacote

- Cada questão precisa de `reviewStatus: approved`, `reviewedByDoctor: true`, referência de fonte, `contextVersionId`, `questionVersionId` ou hash imutável e ciclo de revisão.
- Prática, modo Todas, simulado, revisão e Caderno de Erros devem usar o mesmo contrato de correção e a mesma versão imutável da questão.
- Questões pendentes, rejeitadas, estruturalmente inválidas, duplicadas ou com fingerprint divergente não podem entrar em nenhum pool.
- Testes automatizados devem cobrir cada índice de alternativa, resultado imediato, persistência, reload, retomada, revisão e resultado final.
- A revisão factual/editorial deve confirmar o gabarito e cada explicação; a validação estrutural não basta.
- O pacote precisa atingir a distribuição oficial completa e passar pelo modo release do auditor.

## Separação de responsabilidades

- Core: motor de correção, sessão, histórico, elegibilidade, cache, offline e testes.
- Product Context: concurso, cargo, banca, edital, regras e versão.
- Product Content: questões, alternativas, gabaritos, explicações, fontes e estados de revisão.
- Main/Supabase: catálogo comercial, Product Context central, permissões, Radar, acesso, pagamentos e sincronização.

Não declarar o Core pronto para 50+ produtos até que o gate de questões, o catálogo/contexto central e a homologação de integrações estejam fechados.