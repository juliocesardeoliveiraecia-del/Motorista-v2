# Doctor Core — Auditoria de preparação para produção em massa

## Objetivo
Transformar o Motorista Legislativo na referência do Doctor Core para replicação em dezenas de concursos sem copiar bugs de conteúdo, resposta, estado, cache ou integração.

## Regra de segurança de questões
Uma questão só pode ser entregue quando:
1. possui matéria válida;
2. possui exatamente o número de alternativas definido pelo produto;
3. possui gabarito dentro do intervalo;
4. possui uma explicação por alternativa;
5. não possui alternativas duplicadas;
6. não muda de identidade depois que o aluno respondeu;
7. questões geradas por IA passam por geração -> validação local -> revisão independente -> validação local final.

## Evidência imutável da resposta
A partir da Core 1.10.14, a resposta registrada guarda fingerprint da questão, alternativa escolhida, gabarito vigente no momento da resposta e resultado calculado. Se a questão mudar depois, o Core não recalcula silenciosamente o resultado: sinaliza divergência e bloqueia a questão para nova entrega.

## Auditoria estrutural no boot
O Core executa auditoria estrutural do banco carregado e registra total, válidas, IDs inválidos/quarentenados e data da auditoria.

Essa auditoria é estrutural. Correção semântica/factual exige revisão editorial/IA independente e fonte quando o conteúdo for atual.

## Separação Core x Conteúdo
O caminho de replicação deve manter:
- Core: navegação, estado, prática, simulado, revisão, IA, sincronização, offline, sessão, cache, segurança de resposta e serviços.
- Conteúdo: concurso, cargo, banca, edital, matérias, tópicos, questões, fontes oficiais, identidade comercial e configuração visual específica.

O EXAM_CONFIG e o data.js já expressam essa intenção, mas o arquivo de produção ainda é monolítico. A próxima etapa arquitetural deve transformar essa separação lógica em separação física de arquivos sem alterar comportamento aprovado.

## Pontas que ainda exigem homologação externa
- contrato definitivo do Radar central no Supabase;
- contrato definitivo Main <-> Apps e acesso/RLS;
- bridge de identidade/sessão com a Plataforma;
- entitlement/pagamento;
- sincronização multi-dispositivo;
- auditoria semântica integral do banco legado;
- pipeline automatizado de conteúdo antes de cada publicação.

## Princípio para os próximos 50+ apps
Nenhum novo app deve ser criado por cópia manual do código de produção. O objetivo é gerar um pacote de configuração/conteúdo sobre uma única Core versionada, com testes e gates antes da publicação.
