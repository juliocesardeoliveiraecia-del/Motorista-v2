# Doctor Core — contrato de produção em massa

## Objetivo
Transformar o Doctor Core em um motor reutilizável para dezenas de aplicativos de concursos sem copiar lógica do aplicativo anterior.

## 1. O que pertence ao Core
- navegação e UI-base;
- PWA/offline e cache;
- armazenamento local e migrações;
- sessão de dispositivo e fila de sincronização;
- motor de questões/simulados/revisão;
- integridade de respostas e fingerprints;
- esteira de revisão de conteúdo gerado por IA;
- GROQ adapter;
- Radar adapter central;
- Caderno, Gravador e Redação;
- telemetria/estado local;
- regras de segurança para não expor segredos.

## 2. O que pertence ao produto/conteúdo
- concurso, órgão, cargo e banca;
- edital e datas;
- distribuição e pesos da prova;
- matérias e tópicos;
- banco de questões;
- gabaritos e explicações;
- fontes e evidências;
- perfil editorial da banca;
- fontes oficiais do Radar.

## 3. Portão obrigatório de questões
Nenhuma questão deve chegar ao aluno se:
1. estiver estruturalmente inválida;
2. estiver duplicada;
3. estiver em quarentena;
4. for gerada por IA e não tiver revisão independente;
5. tiver sido alterada depois da resposta sem manter fingerprint da versão respondida.

O Core compara a alternativa escolhida com o gabarito da própria versão da questão. Se o conteúdo mudar, a resposta histórica não é reinterpretada silenciosamente.

## 4. Simulado
O simulado oficial só pode iniciar quando a distribuição do edital estiver completa. Não existe mais modo parcial disfarçado de simulado oficial.

## 5. Radar
O aplicativo não deve pesquisar/scrapear o Radar por conta própria. Ele consome a infraestrutura central e a classificação 70/30 fornecida pelo contrato central.

## 6. Regra para produção em massa
Um novo aplicativo deve alterar somente configuração + conteúdo + assets do produto. Lógica do Core não deve ser duplicada para cada concurso.

## 7. Homologação antes de replicar
Antes dos 50 aplicativos, cada release-base deve passar por:
- QA estático automático;
- auditoria do banco de questões;
- teste de resposta correta/incorreta;
- teste de alteração/fingerprint;
- teste de simulado completo;
- teste offline/online;
- teste de sync sem bridge;
- teste de Radar central;
- teste mobile/desktop;
- teste de atualização do PWA;
- verificação de ausência de segredos no repositório.
