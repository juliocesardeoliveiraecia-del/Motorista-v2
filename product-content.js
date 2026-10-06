/* Doctor Core — Product Content
 * Conteúdo específico do concurso. Não contém motor de execução.
 * Questões e matérias são versionadas como pacote de conteúdo.
 */
const SUBJECTS = [
  {
    id: 'portugues',
    name: 'Língua Portuguesa',
    icon: '📘',
    iconKey: 'book',
    officialQuestions: 10,
    points: 2,
    topics: [
      'Gêneros textuais e suas funcionalidades',
      'Compreensão e interpretação de textos',
      'Variação linguística',
      'Gramática normativa',
      'Produção de sentidos: polissemia, ironia, ambiguidade, inferência',
      'Coesão e coerência textual',
      'Sequências textuais (narrativa, descritiva, argumentativa, injuntiva, expositiva)',
      'Tipos de argumento',
      'Classificação gramatical e formação de palavras',
      'Coordenação e subordinação (orações e termos)',
      'Concordância e regência verbal e nominal',
      'Pontuação e acentuação',
      'Acordo Ortográfico da Língua Portuguesa (1990)'
    ]
  },
  {
    id: 'rlm',
    name: 'Raciocínio Lógico-Matemático',
    icon: '🧮',
    iconKey: 'calculator',
    officialQuestions: 3,
    points: 1,
    topics: [
      'Resolução de problemas com raciocínio lógico',
      'Sequências lógicas e numéricas',
      'Proporcionalidade direta e inversa',
      'Regra de três simples e composta',
      'Porcentagem: aumentos, descontos, variações',
      'Matemática financeira básica (juros simples)',
      'Leitura e interpretação de tabelas e gráficos',
      'Lógica proposicional: conectivos, tabelas-verdade, negação',
      'Progressões aritméticas simples',
      'Dedução lógica e diagramas'
    ]
  },
  {
    id: 'realidade',
    name: 'Realidade de Goiás e Ipameri',
    icon: '🌾',
    iconKey: 'mapPin',
    officialQuestions: 2,
    points: 1,
    topics: [
      'Conflitos sociais, pobreza e direitos humanos',
      'Emergências de saúde e epidemias',
      'Meio ambiente e mudanças climáticas',
      'Arte, cultura e patrimônio do Centro-Oeste',
      'Formação histórico-territorial de Goiás e Ipameri',
      'Política, economia e sociedade em Goiás (da Colônia à República)',
      'Agricultura e urbanização em Goiás',
      'Aspectos físicos do território goiano (vegetação, hidrografia, clima, relevo)',
      'Natureza, cultura e turismo em Goiás',
      'Aspectos histórico-geográficos de Ipameri'
    ]
  },
  {
    id: 'especificos',
    name: 'Conhecimentos Específicos — Motorista Legislativo',
    icon: '🚐',
    iconKey: 'car',
    officialQuestions: 25,
    points: 3,
    topics: [
      'Legislação de trânsito: CTB (Lei 9.503/1997) e normas do CONTRAN',
      'Direção defensiva e procedimentos em ocorrências/acidentes',
      'Noções de mecânica básica e conservação do veículo',
      'Transporte institucional: segurança, postura, sigilo, responsabilidade',
      'Ética, disciplina e relações interpessoais no serviço público',
      'Preenchimento de relatórios de viagem e controle de quilometragem'
    ]
  }
];

// Cada questão: 4 alternativas (A-D), 1 correta, explicação de cada uma.
const QUESTIONS = [

  // ================= LÍNGUA PORTUGUESA =================
  {
    id: 'pt-1', subjectId: 'portugues',
    text: 'Assinale a alternativa em que a concordância verbal está de acordo com a norma padrão:',
    options: [
      'Fazem dois anos que ele trabalha na Câmara.',
      'Faz dois anos que ele trabalha na Câmara.',
      'Houveram problemas na viagem oficial.',
      'Deve haverem novas contratações.'
    ],
    correct: 1,
    explanations: [
      'Errado: o verbo "fazer" indicando tempo decorrido é impessoal, ficando sempre na 3ª pessoa do singular.',
      'Correto: "faz" no singular é a forma adequada para expressar tempo decorrido.',
      'Errado: "haver" no sentido de existir é impessoal; o correto é "houve".',
      'Errado: por ser impessoal, o verbo auxiliar também fica no singular: "deve haver".'
    ]
  },
  {
    id: 'pt-2', subjectId: 'portugues',
    text: 'Em "O motorista, que dirigia com atenção, evitou o acidente", a oração destacada classifica-se como:',
    options: [
      'Coordenada assindética',
      'Subordinada adjetiva',
      'Subordinada substantiva',
      'Coordenada sindética explicativa'
    ],
    correct: 1,
    explanations: [
      'Errado: não há duas orações de mesmo valor sintático ligadas sem conjunção.',
      'Correto: "que dirigia com atenção" caracteriza o substantivo "motorista", funcionando como um adjetivo.',
      'Errado: a oração não exerce função de substantivo (sujeito, objeto etc.).',
      'Errado: não há conjunção explicativa (pois, que, porque) nesse sentido.'
    ]
  },
  {
    id: 'pt-3', subjectId: 'portugues',
    text: 'Assinale a alternativa em que o uso da crase está correto:',
    options: [
      'Cheguei à Ipameri no domingo.',
      'Entreguei o relatório à ele.',
      'Vou à sede da Câmara buscar o veículo.',
      'Fui à pé até o trabalho.'
    ],
    correct: 2,
    explanations: [
      'Errado: nomes de cidade, em regra, não recebem artigo, então não há crase antes deles.',
      'Errado: antes de pronome pessoal ("ele") não se usa crase.',
      'Correto: "sede" é substantivo feminino que aceita o artigo "a", formando a crase com a preposição "a".',
      'Errado: a locução "a pé" não admite crase.'
    ]
  },
  {
    id: 'pt-4', subjectId: 'portugues',
    text: 'Qual das alternativas apresenta um exemplo de coesão referencial (retomada de um termo já citado)?',
    options: [
      '"O motorista chegou cedo. Ele revisou o veículo antes da viagem."',
      '"Chegou cedo e revisou o veículo antes da viagem."',
      '"Primeiro chegou cedo, depois revisou o veículo."',
      '"Como chegou cedo, revisou o veículo com calma."'
    ],
    correct: 0,
    explanations: [
      'Correto: o pronome "ele" retoma "o motorista", caracterizando coesão referencial.',
      'Errado: aqui há apenas elipse do sujeito, sem uso de elemento retomador explícito.',
      'Errado: "depois" é um conector de sequência temporal, não de retomada referencial.',
      'Errado: "como" indica causa, não retomada de um termo anterior.'
    ]
  },
  {
    id: 'pt-5', subjectId: 'portugues',
    text: 'Assinale a alternativa em que todas as palavras estão corretamente acentuadas segundo o Acordo Ortográfico vigente:',
    options: [
      'Ítinerário, veiculo, orgão',
      'Itinerário, veículo, órgão',
      'Itinerário, veiculo, orgao',
      'Itinerario, veículo, orgão'
    ],
    correct: 1,
    explanations: [
      'Errado: "ítinerário" não existe com acento no "í"; "veiculo" e "orgão" estão incorretos.',
      'Correto: todas as três palavras seguem as regras de acentuação vigentes.',
      'Errado: "veiculo" (sem acento) e "orgao" (sem acento e sem "ã") estão incorretos.',
      'Errado: "itinerario" perdeu o acento obrigatório e "orgão" está grafado errado (o certo é "órgão").'
    ]
  },
  {
    id: 'pt-6', subjectId: 'portugues',
    text: 'Sobre os tipos de argumento em um texto dissertativo, um "argumento de autoridade" é aquele que:',
    options: [
      'Usa dados estatísticos para comprovar uma tese',
      'Recorre à opinião de um especialista ou de uma fonte reconhecida no assunto',
      'Apresenta um exemplo concreto do cotidiano',
      'Compara duas situações semelhantes para reforçar uma ideia'
    ],
    correct: 1,
    explanations: [
      'Errado: esse é o argumento de dados estatísticos, uma categoria diferente.',
      'Correto: o argumento de autoridade se apoia na credibilidade de uma pessoa ou fonte especializada no tema.',
      'Errado: esse é o argumento por exemplificação.',
      'Errado: esse é o argumento por comparação/analogia.'
    ]
  },
  {
    id: 'pt-7', subjectId: 'portugues',
    text: 'Na frase "O motorista obedece ao regulamento interno", a regência do verbo "obedecer" está:',
    options: [
      'Incorreta, pois o verbo não exige preposição',
      'Correta, pois "obedecer" é transitivo indireto e exige a preposição "a"',
      'Incorreta, pois deveria ser "obedece o regulamento"',
      'Correta, mas apenas na linguagem informal'
    ],
    correct: 1,
    explanations: [
      'Errado: o verbo "obedecer" exige, sim, a preposição "a" na norma padrão.',
      'Correto: "obedecer a alguém/algo" é a regência exigida pela norma padrão.',
      'Errado: sem a preposição, a frase estaria em desacordo com a norma padrão.',
      'Errado: essa regência é exigida também na linguagem formal, não é uma questão de informalidade.'
    ]
  },
  {
    id: 'pt-8', subjectId: 'portugues',
    text: 'Assinale a alternativa que exemplifica uma sequência textual predominantemente injuntiva:',
    options: [
      '"Ontem fomos à sede da Câmara buscar os documentos."',
      '"O prédio da Câmara é amplo, com fachada de vidro."',
      '"Verifique o nível de óleo antes de ligar o veículo."',
      '"A postura ética é fundamental no serviço público porque garante a confiança da população."'
    ],
    correct: 2,
    explanations: [
      'Errado: essa frase narra um fato, é uma sequência narrativa.',
      'Errado: essa frase descreve características, é uma sequência descritiva.',
      'Correto: instruções e comandos (verbos no imperativo) caracterizam a sequência injuntiva.',
      'Errado: essa frase defende um ponto de vista com justificativa, é uma sequência argumentativa.'
    ]
  },

  // ================= RACIOCÍNIO LÓGICO-MATEMÁTICO =================
  {
    id: 'rlm-1', subjectId: 'rlm',
    text: 'Um veículo percorre 180 km em 3 horas, mantendo velocidade constante. Qual é a velocidade média?',
    options: ['50 km/h', '60 km/h', '70 km/h', '90 km/h'],
    correct: 1,
    explanations: [
      'Errado: 180 ÷ 3 não resulta em 50.',
      'Correto: velocidade média = distância ÷ tempo = 180 ÷ 3 = 60 km/h.',
      'Errado: 70 km/h corresponderia a uma distância maior no mesmo tempo.',
      'Errado: 90 km/h corresponderia à mesma distância em apenas 2 horas.'
    ]
  },
  {
    id: 'rlm-2', subjectId: 'rlm',
    text: 'Se 8 litros de combustível custam R$ 44,00, quanto custarão 15 litros ao mesmo preço por litro?',
    options: ['R$ 78,00', 'R$ 80,00', 'R$ 82,50', 'R$ 85,00'],
    correct: 2,
    explanations: [
      'Errado: valor abaixo do correto.',
      'Errado: valor abaixo do correto.',
      'Correto: preço por litro = 44 ÷ 8 = R$ 5,50; para 15 litros = 5,50 × 15 = R$ 82,50.',
      'Errado: valor acima do correto.'
    ]
  },
  {
    id: 'rlm-3', subjectId: 'rlm',
    text: 'Considere a proposição "Se chove, então a rua fica molhada". A negação lógica dessa proposição condicional é:',
    options: [
      'Se não chove, a rua não fica molhada.',
      'Chove e a rua não fica molhada.',
      'Não chove ou a rua fica molhada.',
      'A rua fica molhada e não chove.'
    ],
    correct: 1,
    explanations: [
      'Errado: essa é a proposição inversa, não a negação lógica.',
      'Correto: a negação de "se P então Q" é "P e não Q" — ou seja, chove e a rua não fica molhada.',
      'Errado: essa frase é logicamente equivalente à proposição original (contrapositiva disfarçada), não sua negação.',
      'Errado: essa reformulação não corresponde à negação da condicional.'
    ]
  },
  {
    id: 'rlm-4', subjectId: 'rlm',
    text: 'Uma viagem de 240 km terá redução de 25% no percurso após a abertura de uma nova rodovia. Qual será a nova distância?',
    options: ['160 km', '180 km', '200 km', '220 km'],
    correct: 1,
    explanations: [
      'Errado: 25% de 240 km é 60 km, e 240 - 60 = 180, não 160.',
      'Correto: 25% de 240 km = 60 km; 240 - 60 = 180 km.',
      'Errado: esse valor corresponderia a uma redução menor que 25%.',
      'Errado: esse valor corresponderia a uma redução ainda menor.'
    ]
  },
  {
    id: 'rlm-5', subjectId: 'rlm',
    text: 'Na sequência numérica 3, 7, 11, 15, ..., qual é o próximo número?',
    options: ['17', '18', '19', '21'],
    correct: 2,
    explanations: [
      'Errado: a razão da sequência é 4, então 17 não é o próximo termo.',
      'Errado: 18 não segue o padrão de soma constante de 4.',
      'Correto: cada termo aumenta 4 em relação ao anterior (progressão aritmética de razão 4); 15 + 4 = 19.',
      'Errado: 21 excede o padrão da sequência em 2 unidades.'
    ]
  },
  {
    id: 'rlm-6', subjectId: 'rlm',
    text: 'Um capital de R$ 2.000,00 é aplicado a juros simples de 2% ao mês. Qual será o valor total após 5 meses?',
    options: ['R$ 2.100,00', 'R$ 2.150,00', 'R$ 2.200,00', 'R$ 2.400,00'],
    correct: 2,
    explanations: [
      'Errado: esse valor corresponde a um rendimento menor do que o calculado.',
      'Errado: valor não corresponde ao cálculo de juros simples com esses dados.',
      'Correto: juros = 2000 × 0,02 × 5 = 200; total = 2000 + 200 = R$ 2.200,00.',
      'Errado: esse valor seria obtido com uma taxa ou tempo maiores que os informados.'
    ]
  },

  // ================= REALIDADE DE GOIÁS E IPAMERI =================
  {
    id: 'real-1', subjectId: 'realidade',
    text: 'O estado que se originou da divisão territorial de Goiás em 1988 é:',
    options: ['Mato Grosso do Sul', 'Distrito Federal', 'Tocantins', 'Rondônia'],
    correct: 2,
    explanations: [
      'Errado: o Mato Grosso do Sul se originou da divisão do antigo Mato Grosso, em 1977.',
      'Errado: o Distrito Federal foi criado antes, na década de 1960, com a construção de Brasília.',
      'Correto: o Tocantins foi criado em 1988, a partir do desmembramento do norte de Goiás, pela Constituição Federal.',
      'Errado: Rondônia não tem relação com o território de Goiás.'
    ]
  },
  {
    id: 'real-2', subjectId: 'realidade',
    text: 'A economia do estado de Goiás é historicamente marcada, sobretudo a partir da segunda metade do século XX, pela expansão de qual setor?',
    options: [
      'Extração mineral de metais preciosos',
      'Agronegócio (grãos e pecuária)',
      'Indústria naval',
      'Turismo litorâneo'
    ],
    correct: 1,
    explanations: [
      'Errado: a mineração teve papel histórico relevante no período colonial, mas não é o que marca a economia goiana moderna.',
      'Correto: a modernização da agricultura e a expansão da pecuária e da produção de grãos (como soja e milho) são centrais na economia de Goiás desde a segunda metade do século XX.',
      'Errado: Goiás não tem tradição relevante em indústria naval.',
      'Errado: Goiás não possui litoral.'
    ]
  },
  {
    id: 'real-3', subjectId: 'realidade',
    text: 'Em relação ao relevo e à hidrografia de Goiás, é correto afirmar que o estado:',
    options: [
      'É predominantemente montanhoso, com pouca disponibilidade de água',
      'Situa-se majoritariamente no bioma Cerrado, com relevo de chapadas e planaltos',
      'Está localizado na Bacia Amazônica, com predomínio de floresta equatorial',
      'É formado majoritariamente por áreas litorâneas e de mangue'
    ],
    correct: 1,
    explanations: [
      'Errado: o relevo de Goiás é majoritariamente de planaltos e chapadas, não montanhoso, e o estado tem rios importantes.',
      'Correto: Goiás está localizado predominantemente no bioma Cerrado, caracterizado por planaltos, chapadas e vegetação típica de savana tropical.',
      'Errado: Goiás não está na Bacia Amazônica nem tem floresta equatorial como vegetação predominante.',
      'Errado: Goiás é um estado interior, sem litoral.'
    ]
  },
  {
    id: 'real-4', subjectId: 'realidade',
    text: 'A Câmara Municipal de Ipameri-GO, enquanto órgão do Poder Legislativo municipal, tem como principal atribuição:',
    options: [
      'Administrar diretamente os serviços de saúde do município',
      'Elaborar, discutir e votar as leis municipais, fiscalizando o Poder Executivo',
      'Julgar processos criminais ocorridos no município',
      'Nomear diretamente o prefeito do município'
    ],
    correct: 1,
    explanations: [
      'Errado: a administração direta dos serviços públicos é atribuição do Poder Executivo (Prefeitura).',
      'Correto: cabe à Câmara Municipal, como Poder Legislativo local, elaborar e votar leis, além de fiscalizar os atos do Executivo.',
      'Errado: julgar processos é função do Poder Judiciário.',
      'Errado: o prefeito é eleito pelo voto popular, não nomeado pela Câmara.'
    ]
  },
  {
    id: 'real-5', subjectId: 'realidade',
    text: 'Sobre desastres ambientais e mudanças climáticas, uma das principais preocupações atuais em regiões de Cerrado, como Goiás, é:',
    options: [
      'O derretimento de geleiras próximas ao estado',
      'Furacões frequentes de grande intensidade',
      'Queimadas e desmatamento, que afetam a vegetação nativa e os recursos hídricos',
      'A elevação do nível do mar sobre áreas costeiras do estado'
    ],
    correct: 2,
    explanations: [
      'Errado: Goiás não possui geleiras nem está próximo a regiões com esse fenômeno.',
      'Errado: furacões não são um fenômeno característico do interior do Brasil.',
      'Correto: queimadas (naturais e criminosas) e o desmatamento são preocupações centrais no Cerrado, impactando a vegetação e os mananciais de água.',
      'Errado: Goiás não possui litoral, portanto não é afetado pela elevação do nível do mar.'
    ]
  },
  {
    id: 'real-6', subjectId: 'realidade',
    text: 'O município de Ipameri está localizado em qual região do estado de Goiás?',
    options: ['Norte de Goiás', 'Região metropolitana de Goiânia', 'Sudeste goiano', 'Extremo oeste de Goiás'],
    correct: 2,
    explanations: [
      'Errado: Ipameri não se localiza na região norte do estado.',
      'Errado: Ipameri não integra a região metropolitana da capital.',
      'Correto: Ipameri está localizada na região sudeste do estado de Goiás.',
      'Errado: Ipameri não se localiza no extremo oeste goiano.'
    ]
  },

  // ================= CONHECIMENTOS ESPECÍFICOS (Motorista Legislativo) =================
  {
    id: 'esp-1', subjectId: 'especificos',
    text: 'Segundo o Código de Trânsito Brasileiro, dirigir sob a influência de álcool é infração classificada como:',
    options: ['Leve', 'Média', 'Grave', 'Gravíssima'],
    correct: 3,
    explanations: [
      'Errado: infrações leves têm penalidades bem menores que a prevista para essa conduta.',
      'Errado: a gravidade dessa infração é maior do que a classificação média.',
      'Errado: a classificação grave não corresponde ao tratamento dado a essa conduta pelo CTB.',
      'Correto: dirigir sob influência de álcool é infração gravíssima, sujeita a multa (multiplicada) e suspensão do direito de dirigir.'
    ]
  },
  {
    id: 'esp-2', subjectId: 'especificos',
    text: 'A sinalização semafórica na cor amarela piscando indica que o condutor deve:',
    options: [
      'Parar obrigatoriamente',
      'Seguir com atenção e velocidade reduzida',
      'Acelerar para não perder a preferência',
      'Aguardar autorização de agente de trânsito'
    ],
    correct: 1,
    explanations: [
      'Errado: parada obrigatória é indicada pelo sinal vermelho ou pela placa "PARE".',
      'Correto: o amarelo piscando indica que o condutor deve reduzir a velocidade e seguir com atenção redobrada.',
      'Errado: essa sinalização não indica prioridade para acelerar.',
      'Errado: essa indicação não exige a presença de agente de trânsito.'
    ]
  },
  {
    id: 'esp-3', subjectId: 'especificos',
    text: 'A "regra dos 2 segundos", usada na direção defensiva, tem como finalidade:',
    options: [
      'Calcular o tempo ideal de troca de marchas',
      'Definir a distância de segurança em relação ao veículo da frente',
      'Determinar o tempo de uso da seta antes de uma conversão',
      'Medir o tempo de aquecimento do motor'
    ],
    correct: 1,
    explanations: [
      'Errado: a regra não trata de troca de marchas.',
      'Correto: a regra ajuda a manter uma distância segura do veículo à frente, considerando o tempo de reação e frenagem.',
      'Errado: não se relaciona ao uso da seta.',
      'Errado: não é uma métrica de funcionamento mecânico do motor.'
    ]
  },
  {
    id: 'esp-4', subjectId: 'especificos',
    text: 'Ao se deparar com um acidente de trânsito, a atitude inicial mais adequada do motorista é:',
    options: [
      'Remover imediatamente as vítimas do local',
      'Sinalizar o local para evitar novos acidentes e acionar o socorro especializado',
      'Ir embora do local para não se envolver',
      'Discutir com os envolvidos sobre a responsabilidade pelo ocorrido'
    ],
    correct: 1,
    explanations: [
      'Errado: mover vítimas sem necessidade e sem treinamento pode agravar lesões, principalmente na coluna.',
      'Correto: sinalizar o local e acionar o socorro (SAMU 192) protege a todos e agiliza o atendimento adequado.',
      'Errado: afastar-se sem prestar auxílio pode configurar omissão de socorro.',
      'Errado: essa atitude não contribui para a segurança nem para o atendimento das vítimas.'
    ]
  },
  {
    id: 'esp-5', subjectId: 'especificos',
    text: 'Se a luz de advertência de óleo do painel acender durante a condução, o motorista deve:',
    options: [
      'Ignorar, pois é uma luz apenas informativa',
      'Acelerar até chegar ao destino final',
      'Parar o veículo com segurança assim que possível e verificar o problema',
      'Aguardar a próxima troca de óleo programada'
    ],
    correct: 2,
    explanations: [
      'Errado: essa luz indica um problema real que pode causar dano grave ao motor.',
      'Errado: continuar rodando com a pressão de óleo baixa pode danificar seriamente o motor.',
      'Correto: a recomendação de segurança é parar assim que possível e verificar a causa do alerta.',
      'Errado: o problema pode ser urgente e não deve esperar a manutenção programada.'
    ]
  },
  {
    id: 'esp-6', subjectId: 'especificos',
    text: 'Durante o transporte de um vereador, o motorista ouve um assunto sigiloso tratado no veículo. A conduta correta é:',
    options: [
      'Comentar o assunto com colegas de trabalho depois',
      'Manter sigilo absoluto sobre o que foi ouvido',
      'Publicar um resumo em redes sociais, por transparência',
      'Anotar os detalhes para uso pessoal futuro'
    ],
    correct: 1,
    explanations: [
      'Errado: comentar o assunto viola a confidencialidade esperada da função.',
      'Correto: discrição e sigilo são deveres do motorista legislativo ao transportar autoridades.',
      'Errado: divulgar informações sigilosas fere o dever de confidencialidade e pode causar dano institucional.',
      'Errado: registrar informações sigilosas para uso pessoal é conduta antiética.'
    ]
  },
  {
    id: 'esp-7', subjectId: 'especificos',
    text: 'A calibragem incorreta dos pneus (abaixo do recomendado pelo fabricante) tende a causar, entre outros efeitos:',
    options: [
      'Redução do consumo de combustível',
      'Maior aderência em qualquer situação de piso',
      'Aumento do consumo de combustível e desgaste irregular do pneu',
      'Melhora significativa na frenagem'
    ],
    correct: 2,
    explanations: [
      'Errado: pneus com calibragem baixa aumentam o atrito com o solo, elevando o consumo de combustível.',
      'Errado: a calibragem incorreta pode, na verdade, reduzir a estabilidade em curvas e frenagens.',
      'Correto: a calibragem baixa aumenta o atrito e desgasta as bordas do pneu de forma irregular, além de elevar o consumo.',
      'Errado: a calibragem incorreta tende a prejudicar, não melhorar, a frenagem do veículo.'
    ]
  },
  {
    id: 'esp-8', subjectId: 'especificos',
    text: 'Segundo o CTB, o uso do cinto de segurança é obrigatório para:',
    options: [
      'Somente o condutor',
      'Somente os ocupantes do banco da frente',
      'Condutor e todos os passageiros, em qualquer banco',
      'Apenas em rodovias, sendo facultativo em vias urbanas'
    ],
    correct: 2,
    explanations: [
      'Errado: a obrigatoriedade não se limita ao condutor.',
      'Errado: a obrigatoriedade se estende a todos os bancos, não somente ao dianteiro.',
      'Correto: o CTB exige o uso do cinto de segurança por todos os ocupantes do veículo, em qualquer banco.',
      'Errado: a obrigatoriedade vale tanto em vias urbanas quanto em rodovias.'
    ]
  },
  {
    id: 'esp-9', subjectId: 'especificos',
    text: 'No preenchimento do relatório de viagem de um veículo oficial, é uma informação essencial a ser registrada:',
    options: [
      'Apenas o nome do motorista responsável',
      'Itinerário, quilometragem percorrida e horários de saída e chegada',
      'Somente a cor do veículo utilizado',
      'A opinião pessoal do motorista sobre o trajeto'
    ],
    correct: 1,
    explanations: [
      'Errado: apenas o nome do motorista não é suficiente para um controle adequado da viagem.',
      'Correto: itinerário, quilometragem e horários são informações centrais no controle de uso de veículos oficiais.',
      'Errado: a cor do veículo não é uma informação relevante para o controle de viagens.',
      'Errado: opiniões pessoais não fazem parte do registro técnico de uma viagem oficial.'
    ]
  },
  {
    id: 'esp-10', subjectId: 'especificos',
    text: 'Em relação à ética no serviço público, o princípio da impessoalidade determina que o servidor deve:',
    options: [
      'Tratar com prioridade os cidadãos que conhece pessoalmente',
      'Tratar todos os cidadãos de forma igualitária, sem favorecimentos pessoais',
      'Priorizar o atendimento de acordo com sua conveniência pessoal',
      'Seguir apenas as normas que considerar convenientes'
    ],
    correct: 1,
    explanations: [
      'Errado: favorecer conhecidos contraria diretamente o princípio da impessoalidade.',
      'Correto: a impessoalidade exige tratamento igualitário a todos os cidadãos, sem favorecimentos pessoais.',
      'Errado: o atendimento não deve se guiar pela conveniência pessoal do servidor.',
      'Errado: o servidor público deve seguir todas as normas aplicáveis, não apenas as que considerar convenientes.'
    ]
  },
  {
    id: 'esp-11', subjectId: 'especificos',
    text: 'De acordo com as normas do CONTRAN sobre sinalização, uma placa de fundo vermelho com uma faixa branca na horizontal e o dizer "PARE" é classificada como uma sinalização:',
    options: [
      'De regulamentação',
      'De advertência',
      'De indicação',
      'Educativa'
    ],
    correct: 0,
    explanations: [
      'Correto: a placa "PARE" é uma sinalização de regulamentação, pois impõe uma obrigação (parar) ao condutor.',
      'Errado: placas de advertência alertam sobre uma condição perigosa à frente, geralmente com fundo amarelo.',
      'Errado: placas de indicação fornecem informações úteis, como localização de serviços, e não impõem obrigações.',
      'Errado: sinalização educativa tem caráter informativo/orientador, não impositivo, como o "PARE".'
    ]
  },
  {
    id: 'esp-12', subjectId: 'especificos',
    text: 'Antes de iniciar uma viagem, é uma boa prática de manutenção preventiva do veículo:',
    options: [
      'Verificar apenas o nível de combustível',
      'Verificar pneus, níveis de fluidos (óleo, água) e funcionamento de freios e luzes',
      'Aguardar algum problema aparecer durante o trajeto para depois verificar',
      'Realizar a verificação apenas uma vez por mês, independentemente do uso'
    ],
    correct: 1,
    explanations: [
      'Errado: verificar apenas o combustível não é suficiente para garantir a segurança do trajeto.',
      'Correto: uma checagem preventiva (pneus, fluidos, freios e luzes) antes de cada saída reduz o risco de panes e acidentes.',
      'Errado: esperar o problema aparecer no trajeto é uma prática de risco, e não de prevenção.',
      'Errado: a verificação preventiva deve ser feita antes de cada uso relevante, não apenas mensalmente.'
    ]
  }
]
