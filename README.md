# 🚐 Motorista Legislativo Ipameri (versão de estudo pessoal)

App leve, simples e focado 100% no **Edital nº 02/2026** do Instituto Verbena/UFG, cargo **Agente Legislativo - Motorista Legislativo**, Câmara Municipal de Ipameri-GO. Prova em 13/09/2026.

Sem gamificação, sem chat de IA, sem flashcards, sem sincronização remota — só o essencial: praticar questões fiéis ao formato real da prova (4 alternativas, mesma distribuição de matérias e pesos), gerar mais questões com IA quando o banco acabar, e guardar seu desempenho.

## Estrutura da prova (conforme edital oficial)
| Matéria | Questões | Peso/questão | Pontos |
|---|---|---|---|
| Língua Portuguesa | 10 | 2 | 20 |
| Raciocínio Lógico-Matemático | 3 | 1 | 3 |
| Realidade de Goiás e Ipameri | 2 | 1 | 2 |
| Conhecimentos Específicos | 25 | 3 | 75 |
| **Total** | **40** | — | **100** (mínimo 60 para passar) |

4 horas de duração, 4 alternativas por questão (A-D), aplicação em Ipameri/GO no período vespertino.

## Como usar
1. Suba `index.html` e `service-worker.js` para um repositório do GitHub (ou Vercel).
2. Abra o app, vá em **Configurações** e cole sua chave gratuita da Groq ([console.groq.com/keys](https://console.groq.com/keys)) — ela fica salva só no seu aparelho, nunca no código.
3. Toque em **Praticar Questões**, escolha uma matéria, e vá respondendo. Quando o banco daquela matéria acabar (ou quiser mais), toque em **"Gerar mais questões com IA"**.
4. Quando quiser testar valendo, use o **Simulado Oficial** — ele reproduz exatamente a estrutura da prova real (40 questões, 100 pontos, 4h). Se faltar questão em alguma matéria pra montar o simulado completo, o próprio app oferece gerar as que faltam automaticamente.

## Arquivos
- `index.html` — o app inteiro (CSS, JS e ícones embutidos)
- `service-worker.js` — só ele fica separado (regra do navegador), garante funcionamento offline e sempre busca a versão mais nova quando há internet

## Sobre as questões geradas por IA
Aparecem marcadas com o selo **🤖 IA** durante a prática. A IA recebe o conteúdo programático exato do edital e o estilo da banca como instrução, mas — como toda IA — pode eventualmente errar um detalhe técnico. Vale uma conferida extra nelas, principalmente em número de artigo de lei.
