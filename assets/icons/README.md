# Doctor Core — sistema central de ícones

## Matriz e regra obrigatória
- `doctor-core-master.svg` é a matriz visual central. Não redesenhar o símbolo D + livro + seta para cada produto.
- `icon-palette.json` é o registro oficial de cores, identificadores e contrato de geração.
- Cada app derivado usa a mesma matriz e recebe **somente uma tarjeta diagonal colorida**, sem letras, siglas ou legendas, no canto superior direito e sem esconder o símbolo.
- A identificação do app fica no nome exibido pelo Android, fora da imagem do ícone.
- A identidade do app vem do perfil de produto (`appId`, `productId`, `appTitle`); não criar lógica ou formulário de ícone exclusivo por app.
- A matriz SVG é vetorial em 1024×1024 para manter alta definição.

## Variante atual
- Motorista Legislativo: tarjeta diagonal amarela `#F5C400`, sem texto.

## Paleta reservada
Amarelo `#F5C400`, verde `#20B86B`, vermelho `#E53935`, roxo `#8B5CF6`, azul `#1687FF`, laranja `#F97316`, ciano `#06B6D4` e rosa `#EC4899`.

## Regra de preservação
Toda melhoria futura deve alterar somente a tarjeta/variante e referências de manifesto/cache, preservando os componentes funcionais do app. Não substituir a matriz sem aprovação explícita.
