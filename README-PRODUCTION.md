# Doctor Core — Motorista Legislativo

## Estado desta branch de auditoria

- **Release candidata:** V1.13.1 — branch de auditoria; não é produção até homologação e aprovação.
- **Produto piloto:** Motorista Legislativo — Câmara Municipal de Ipameri/GO.
- **Banca:** Instituto Verbena / UFG.
- **Core, Product Context e conteúdo:** separados em arquivos distintos.
- **Radar:** cliente da RPC central `public.get_radar_feed(p_product_id, p_limit)`; sem scraping local e sem usar a chave GROQ do aluno.
- **Pagamentos e acesso:** responsabilidade da Plataforma Doctor; a integração comercial do app permanece desativada até homologação.

## Separação industrial

- **Core:** navegação, renderização, avaliação, simulado, progresso, offline, ferramentas, IA, QA e adapters.
- **Product Context:** concurso, cargo, órgão, banca, edital/versão, datas, matérias, tópicos, etapas, distribuição, alternativas, pesos, duração e regras.
- **Conteúdo versionado:** enunciados, alternativas, gabaritos, explicações, fontes, hash imutável e estado de revisão.
- **Infraestrutura central:** auth, catálogo, entitlement, pagamentos, sessão de dispositivo, sync e Radar.

Para criar um app novo, a meta é trocar Product Context + pacote de conteúdo + assets, sem editar a lógica do Core.

## QA de questões

Validação estrutural não comprova correção factual do gabarito. Cada questão deve ter:
1. estrutura válida e alternativas únicas;
2. gabarito conferido contra fonte;
3. explicações coerentes com todas as alternativas;
4. referência e versão de contexto rastreáveis;
5. revisão independente registrada;
6. identidade/hash imutável por versão;
7. bloqueio de publicação até aprovação;
8. testes A/B/C/D → feedback imediato → histórico → revisão → resultado final, inclusive após reload.

A auditoria anterior encontrou 32 questões estáticas para uma prova de 40 (distribuição 10/3/2/25), sem metadados de aprovação editorial/fonte. Portanto, o Core ainda **não pode ser declarado pronto para produção em massa**. O relatório automatizado distingue estrutura válida de aprovação factual e editorial.

## Radar central

O app consome a RPC central e não recalcula a proporção 70/30. O Main precisa publicar o produto/app/concurso, associar fontes e itens oficiais e manter a ingestão central. Enquanto catálogo/fontes/itens estiverem vazios, o app apresenta estado vazio explícito; não inventa notícias.

## Publicação e rollback

Esta branch não altera o deployment de produção. Validar preview em desktop/Android, instalação/upgrade PWA, offline, prática, simulado, histórico, Caderno, Gravador, Redação e Radar antes de promover.

## Gates críticos restantes

- banco oficial completo e conteúdo factual/editorialmente aprovado com rastreabilidade;
- testes E2E de alternativa/gabarito/persistência/revisão;
- catálogo e Radar centrais com dados reais;
- auth, entitlement, sessão única e sincronização homologados;
- checkout/webhook/pagamentos homologados pela Plataforma;
- segundo Product Context demonstrando reutilização do Core sem mudanças no motor.
