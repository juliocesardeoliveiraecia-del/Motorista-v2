# Doctor Core — Auditoria de Produção e Preparação para Escala

## Objetivo
Esta é a matriz oficial de fechamento do Core antes da produção em massa de aplicativos por concurso.

## Separação obrigatória

### Core — NÃO muda por concurso
- motor de prática;
- motor de simulado;
- cronômetro e persistência da sessão;
- cálculo de pontuação;
- evidência imutável da resposta;
- Caderno de Erros;
- revisão de erros;
- Flashcards;
- Caderno Doctor;
- Gravador Doctor;
- Redação Doctor;
- Radar Doctor como cliente da infraestrutura central;
- armazenamento local/offline;
- fila de sincronização;
- sessão de dispositivo;
- integração GROQ;
- quality gate;
- PWA/service worker;
- navegação e acessibilidade;
- telemetria/auditoria técnica.

### Conteúdo — MUDA por concurso
- identidade do concurso;
- órgão/cargo/banca/edital;
- data/local/duração;
- distribuição de questões;
- matérias/pesos;
- tópicos;
- banco de questões;
- fontes oficiais;
- perfil editorial da banca;
- configuração do Radar;
- imagem/ícone temático.

## Regras de entrega

1. Nenhuma questão pode chegar ao aluno se tiver estrutura inválida.
2. Alternativas duplicadas são proibidas.
3. Gabarito fora do intervalo é proibido.
4. Explicações devem estar alinhadas com A-D.
5. Questão alterada depois de respondida não pode recalcular a resposta antiga.
6. A evidência da resposta guarda fingerprint da questão, alternativa escolhida, gabarito e resultado.
7. Simulado usa o conjunto inteiro para calcular o denominador; questões em branco valem zero, mas permanecem no total.
8. O resultado por matéria deve incluir também questões não respondidas.
9. Questões geradas por IA passam por revisão antes de serem liberadas.
10. O banco do simulado só abre quando a distribuição oficial estiver completa.
11. O Core não inventa conteúdo de concurso.
12. O Radar não faz scraping próprio: consome a infraestrutura central.
13. Offline não simula sincronização concluída.
14. Nenhuma chave secreta pode entrar no GitHub.
15. O aplicativo deve ser clonável trocando apenas o pacote de conteúdo/configuração.

## Situação encontrada na auditoria 1.12.1

### Corrigido no Core
- cálculo do resultado do simulado quando existem questões em branco;
- denominador agora representa a prova inteira;
- total por matéria considera todas as questões do simulado;
- quality gate genérico adicionado;
- auditoria estrutural persistida no estado do Core;
- versão Core alinhada em 1.12.1;
- service worker e manifesto alinhados.

### Assets — bloqueio encontrado na auditoria\nO `product-context.js` referencia assets relativos que não estão presentes no repositório atual, incluindo `assets/concurso/camara-ipameri.webp`, `assets/icons/doctor-core-master-base.png` e `assets/doctor/evolution/doctor-level-01.png`. Eles precisam ser internalizados no repositório ou substituídos por assets oficiais disponíveis antes de declarar o Core/primeiro produto 100% pronto para produção.\n\n### Conteúdo Motorista Legislativo ainda requer fechamento
O pacote atual possui 32 questões:
- Português: 8 / 10 necessárias;
- Raciocínio Lógico: 6 / 3 necessárias;
- Realidade Goiás/Ipameri: 6 / 2 necessárias;
- Específicos: 12 / 25 necessárias.

Portanto, o Simulado Oficial permanece corretamente bloqueado até existir banco suficiente para a distribuição 10/3/2/25.

### Validação externa
O edital e as publicações oficiais do Instituto Verbena/UFG são a fonte de verdade para edital, cronograma, prova e gabarito. O banco interno deve ser original/parafraseado e validado contra essas fontes, sem copiar cadernos protegidos.

## Critério de “Core fechado”
O Core só é considerado pronto para clonagem em massa quando:
- auditoria estrutural = OK;
- simulado com blanks = OK;
- evidência de resposta = OK;
- revisão de conteúdo IA = OK;
- offline/PWA = OK;
- sync bridge = OK;
- sessão de dispositivo = OK;
- Radar central = OK;
- pacote de conteúdo substituível = OK;
- nenhum segredo no repositório;
- teste desktop + mobile aprovado.

## Regra de escala
Para criar o aplicativo 2, 3, 10 ou 50:
1. copiar Core;
2. trocar Product Context;
3. trocar Product Content;
4. trocar assets temáticos;
5. validar edital;
6. validar distribuição;
7. validar banco;
8. executar quality gate;
9. homologar;
10. publicar.

Nenhuma alteração específica de concurso deve entrar no motor Core.
