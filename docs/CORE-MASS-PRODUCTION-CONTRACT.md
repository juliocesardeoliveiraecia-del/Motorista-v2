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

## 7. Padrão obrigatório da integração de IA

Todo aplicativo derivado deve herdar o padrão de transparência, idade mínima, ciência de tratamento de dados, marca, segurança de API key e opção de desativação definido em `docs/DOCTOR-CORE-GROQ-LEGAL-STANDARD.md`. A chave nunca pode entrar em snapshots, logs, URLs ou repositórios. O modelo BYOK não deve ser declarado formalmente aprovado até confirmação escrita da Groq.

## 8. Fábrica de configuração

A configuração de cada produto deve ser gerada a partir de `templates/product-manifest.example.json` com `tools/scaffold-product.mjs`. O gerador valida a distribuição do edital, duração, modo de resposta, hosts oficiais do Radar e identidade PWA. Ele não gera conteúdo acadêmico nem assets e não publica o produto. QA: `node qa/scaffold-product-contract.mjs`.

## 8. Homologação antes de replicar
Antes dos 50 aplicativos, cada release-base deve passar por:
- QA estático automático;
- auditoria do banco de questões;
- teste de resposta correta/incorreta;
- teste de alteração/fingerprint;
- teste de simulado completo;
- teste offline/online;
- teste de sync autenticado com bridge, conflito de revisão e fila preservada até confirmação;
- teste de revogação de sessão ao reconectar após uso offline (lease máximo de 72 horas);
- teste de Radar central;
- teste mobile/desktop;
- teste de atualização do PWA;
- verificação de ausência de segredos no repositório.


## 9. Atualização segura do PWA offline

A instalação de uma nova versão do Service Worker deve:
- tentar obter a versão mais recente de cada asset;
- recuperar do cache anterior os assets que não puderem ser obtidos pela rede;
- validar a presença de todo o shell crítico (HTML, manifesto, versão, configuração, bridge, contexto e conteúdo);
- abortar a instalação se o shell crítico estiver incompleto, mantendo o Service Worker e o cache anteriores;
- excluir somente caches antigos com o namespace deste aplicativo, sem apagar caches de outros produtos na mesma origem.

QA automatizado: `node qa/service-worker-offline-contract.mjs`. O teste não substitui homologação real em dispositivo com perda de conexão durante uma atualização.
