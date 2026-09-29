# Core QA Gates — 2026-09-29

## Objetivo

Impedir que um erro de avaliação, questão sem revisão ou simulado incompleto chegue ao aluno.

## Gates automatizados

- contrato determinístico de avaliação A/B/C/D;
- limites de índice de alternativa;
- questionVersionId/contentHash;
- mudança de conteúdo gera nova versão;
- questões publicadas exigem review aprovado;
- questões IA começam em pending_review;
- simulado oficial não aceita execução parcial;
- pontuação mínima vem do Product Context;
- Radar usa RPC central;
- Radar local não executa busca web própria;
- caderno de erros usa answerAudit versionado, não comparação cega com estado antigo.

## Bug histórico de alternativa

O sintoma observado foi: aluno clica na alternativa correta, a interface mostra incorreto, mas a conferência final considera correto.

O mecanismo de defesa agora é:
1. registrar a resposta pelo DoctorQuestionContract;
2. gerar questionVersionId/contentHash;
3. persistir selected, correct e identidade da versão em answerAudit;
4. renderizar o resultado a partir da auditoria da mesma versão;
5. ignorar respostas antigas quando a questão mudou de versão;
6. testar todos os índices de alternativa;
7. impedir regressão por comparação direta espalhada pela UI.

## O que ainda depende do Main

A infraestrutura central do Radar já existe, mas a implementação atual de get_radar_feed ainda admite classes trusted_media/forecast em condições específicas. Isso diverge da regra pública atual, que determina somente fontes oficiais.

Também faltam dados publicados no projeto auditado: produtos, apps, contests, Product Context, regras de exame, fontes e itens do Radar estão vazios.

Esses pontos não devem ser mascarados pelo app nem resolvidos com dados fictícios.
