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
      'Faz dois anos que ele trabalha na Câmara.',
      'Deve haverem novas contratações.',
      'Houveram problemas na viagem oficial.',
      'Fazem dois anos que ele trabalha na Câmara.'
    ],
    correct: 0,
    explanations: [
      'Correto: "faz" no singular é a forma adequada para expressar tempo decorrido.',
      'Errado: por ser impessoal, o verbo auxiliar também fica no singular: "deve haver".',
      'Errado: "haver" no sentido de existir é impessoal; o correto é "houve".',
      'Errado: o verbo "fazer" indicando tempo decorrido é impessoal, ficando sempre na 3ª pessoa do singular.'
    ]
  },
  {
    id: 'pt-2', subjectId: 'portugues',
    text: 'Em "O motorista, que dirigia com atenção, evitou o acidente", a oração destacada classifica-se como:',
    options: [
      'Coordenada assindética',
      'Subordinada substantiva',
      'Coordenada sindética explicativa',
      'Subordinada adjetiva'
    ],
    correct: 3,
    explanations: [
      'Errado: não há duas orações de mesmo valor sintático ligadas sem conjunção.',
      'Errado: a oração não exerce função de substantivo (sujeito, objeto etc.).',
      'Errado: não há conjunção explicativa (pois, que, porque) nesse sentido.',
      'Correto: "que dirigia com atenção" caracteriza o substantivo "motorista", funcionando como um adjetivo.'
    ]
  },
  {
    id: 'pt-3', subjectId: 'portugues',
    text: 'Assinale a alternativa em que o uso da crase está correto:',
    options: [
      'Cheguei à Ipameri no domingo.',
      'Fui à pé até o trabalho.',
      'Vou à sede da Câmara buscar o veículo.',
      'Entreguei o relatório à ele.'
    ],
    correct: 2,
    explanations: [
      'Errado: nomes de cidade, em regra, não recebem artigo, então não há crase antes deles.',
      'Errado: a locução "a pé" não admite crase.',
      'Correto: "sede" é substantivo feminino que aceita o artigo "a", formando a crase com a preposição "a".',
      'Errado: antes de pronome pessoal ("ele") não se usa crase.'
    ]
  },
  {
    id: 'pt-4', subjectId: 'portugues',
    text: 'Qual das alternativas apresenta um exemplo de coesão referencial (retomada de um termo já citado)?',
    options: [
      '"Como chegou cedo, revisou o veículo com calma."',
      '"O motorista chegou cedo. Ele revisou o veículo antes da viagem."',
      '"Chegou cedo e revisou o veículo antes da viagem."',
      '"Primeiro chegou cedo, depois revisou o veículo."'
    ],
    correct: 1,
    explanations: [
      'Errado: "como" indica causa, não retomada de um termo anterior.',
      'Correto: o pronome "ele" retoma "o motorista", caracterizando coesão referencial.',
      'Errado: aqui há apenas elipse do sujeito, sem uso de elemento retomador explícito.',
      'Errado: "depois" é um conector de sequência temporal, não de retomada referencial.'
    ]
  },
  {
    id: 'pt-5', subjectId: 'portugues',
    text: 'Assinale a alternativa em que todas as palavras estão corretamente acentuadas segundo o Acordo Ortográfico vigente:',
    options: [
      'Itinerário, veículo, órgão',
      'Itinerario, veículo, orgão',
      'Itinerário, veiculo, orgao',
      'Ítinerário, veiculo, orgão'
    ],
    correct: 0,
    explanations: [
      'Correto: todas as três palavras seguem as regras de acentuação vigentes.',
      'Errado: "itinerario" perdeu o acento obrigatório e "orgão" está grafado errado (o certo é "órgão").',
      'Errado: "veiculo" (sem acento) e "orgao" (sem acento e sem "ã") estão incorretos.',
      'Errado: "ítinerário" não existe com acento no "í"; "veiculo" e "orgão" estão incorretos.'
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
      'Correta, mas apenas na linguagem informal',
      'Correta, pois "obedecer" é transitivo indireto e exige a preposição "a"',
      'Incorreta, pois deveria ser "obedece o regulamento"'
    ],
    correct: 2,
    explanations: [
      'Errado: o verbo "obedecer" exige, sim, a preposição "a" na norma padrão.',
      'Errado: essa regência é exigida também na linguagem formal, não é uma questão de informalidade.',
      'Correto: "obedecer a alguém/algo" é a regência exigida pela norma padrão.',
      'Errado: sem a preposição, a frase estaria em desacordo com a norma padrão.'
    ]
  },
  {
    id: 'pt-8', subjectId: 'portugues',
    text: 'Assinale a alternativa que exemplifica uma sequência textual predominantemente injuntiva:',
    options: [
      '"A postura ética é fundamental no serviço público porque garante a confiança da população."',
      '"Ontem fomos à sede da Câmara buscar os documentos."',
      '"O prédio da Câmara é amplo, com fachada de vidro."',
      '"Verifique o nível de óleo antes de ligar o veículo."'
    ],
    correct: 3,
    explanations: [
      'Errado: essa frase defende um ponto de vista com justificativa, é uma sequência argumentativa.',
      'Errado: essa frase narra um fato, é uma sequência narrativa.',
      'Errado: essa frase descreve características, é uma sequência descritiva.',
      'Correto: instruções e comandos (verbos no imperativo) caracterizam a sequência injuntiva.'
    ]
  },

  // ================= RACIOCÍNIO LÓGICO-MATEMÁTICO =================
  {
    id: 'rlm-1', subjectId: 'rlm',
    text: 'Um veículo percorre 180 km em 3 horas, mantendo velocidade constante. Qual é a velocidade média?',
    options: [
      '60 km/h',
      '70 km/h',
      '90 km/h',
      '50 km/h'
    ],
    correct: 0,
    explanations: [
      'Correto: velocidade média = distância ÷ tempo = 180 ÷ 3 = 60 km/h.',
      'Errado: 70 km/h corresponderia a uma distância maior no mesmo tempo.',
      'Errado: 90 km/h corresponderia à mesma distância em apenas 2 horas.',
      'Errado: 180 ÷ 3 não resulta em 50.'
    ]
  },
  {
    id: 'rlm-2', subjectId: 'rlm',
    text: 'Se 8 litros de combustível custam R$ 44,00, quanto custarão 15 litros ao mesmo preço por litro?',
    options: [
      'R$ 80,00',
      'R$ 82,50',
      'R$ 78,00',
      'R$ 85,00'
    ],
    correct: 1,
    explanations: [
      'Errado: valor abaixo do correto.',
      'Correto: preço por litro = 44 ÷ 8 = R$ 5,50; para 15 litros = 5,50 × 15 = R$ 82,50.',
      'Errado: valor abaixo do correto.',
      'Errado: valor acima do correto.'
    ]
  },
  {
    id: 'rlm-3', subjectId: 'rlm',
    text: 'Considere a proposição "Se chove, então a rua fica molhada". A negação lógica dessa proposição condicional é:',
    options: [
      'Chove e a rua não fica molhada.',
      'Se não chove, a rua não fica molhada.',
      'Não chove ou a rua fica molhada.',
      'A rua fica molhada e não chove.'
    ],
    correct: 0,
    explanations: [
      'Correto: a negação de "se P então Q" é "P e não Q" — ou seja, chove e a rua não fica molhada.',
      'Errado: essa é a proposição inversa, não a negação lógica.',
      'Errado: essa frase é logicamente equivalente à proposição original (contrapositiva disfarçada), não sua negação.',
      'Errado: essa reformulação não corresponde à negação da condicional.'
    ]
  },
  {
    id: 'rlm-4', subjectId: 'rlm',
    text: 'Uma viagem de 240 km terá redução de 25% no percurso após a abertura de uma nova rodovia. Qual será a nova distância?',
    options: [
      '220 km',
      '200 km',
      '180 km',
      '160 km'
    ],
    correct: 2,
    explanations: [
      'Errado: esse valor corresponderia a uma redução ainda menor.',
      'Errado: esse valor corresponderia a uma redução menor que 25%.',
      'Correto: 25% de 240 km = 60 km; 240 - 60 = 180 km.',
      'Errado: 25% de 240 km é 60 km, e 240 - 60 = 180, não 160.'
    ]
  },
  {
    id: 'rlm-5', subjectId: 'rlm',
    text: 'Na sequência numérica 3, 7, 11, 15, ..., qual é o próximo número?',
    options: [
      '18',
      '21',
      '17',
      '19'
    ],
    correct: 3,
    explanations: [
      'Errado: 18 não segue o padrão de soma constante de 4.',
      'Errado: 21 excede o padrão da sequência em 2 unidades.',
      'Errado: a razão da sequência é 4, então 17 não é o próximo termo.',
      'Correto: cada termo aumenta 4 em relação ao anterior (progressão aritmética de razão 4); 15 + 4 = 19.'
    ]
  },
  {
    id: 'rlm-6', subjectId: 'rlm',
    text: 'Um capital de R$ 2.000,00 é aplicado a juros simples de 2% ao mês. Qual será o valor total após 5 meses?',
    options: [
      'R$ 2.150,00',
      'R$ 2.200,00',
      'R$ 2.100,00',
      'R$ 2.400,00'
    ],
    correct: 1,
    explanations: [
      'Errado: valor não corresponde ao cálculo de juros simples com esses dados.',
      'Correto: juros = 2000 × 0,02 × 5 = 200; total = 2000 + 200 = R$ 2.200,00.',
      'Errado: esse valor corresponde a um rendimento menor do que o calculado.',
      'Errado: esse valor seria obtido com uma taxa ou tempo maiores que os informados.'
    ]
  },

  // ================= REALIDADE DE GOIÁS E IPAMERI =================
  {
    id: 'real-1', subjectId: 'realidade',
    text: 'O estado que se originou da divisão territorial de Goiás em 1988 é:',
    options: [
      'Tocantins',
      'Rondônia',
      'Distrito Federal',
      'Mato Grosso do Sul'
    ],
    correct: 0,
    explanations: [
      'Correto: o Tocantins foi criado em 1988, a partir do desmembramento do norte de Goiás, pela Constituição Federal.',
      'Errado: Rondônia não tem relação com o território de Goiás.',
      'Errado: o Distrito Federal foi criado antes, na década de 1960, com a construção de Brasília.',
      'Errado: o Mato Grosso do Sul se originou da divisão do antigo Mato Grosso, em 1977.'
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
      'Situa-se majoritariamente no bioma Cerrado, com relevo de chapadas e planaltos',
      'É predominantemente montanhoso, com pouca disponibilidade de água',
      'É formado majoritariamente por áreas litorâneas e de mangue',
      'Está localizado na Bacia Amazônica, com predomínio de floresta equatorial'
    ],
    correct: 0,
    explanations: [
      'Correto: Goiás está localizado predominantemente no bioma Cerrado, caracterizado por planaltos, chapadas e vegetação típica de savana tropical.',
      'Errado: o relevo de Goiás é majoritariamente de planaltos e chapadas, não montanhoso, e o estado tem rios importantes.',
      'Errado: Goiás é um estado interior, sem litoral.',
      'Errado: Goiás não está na Bacia Amazônica nem tem floresta equatorial como vegetação predominante.'
    ]
  },
  {
    id: 'real-4', subjectId: 'realidade',
    text: 'A Câmara Municipal de Ipameri-GO, enquanto órgão do Poder Legislativo municipal, tem como principal atribuição:',
    options: [
      'Nomear diretamente o prefeito do município',
      'Administrar diretamente os serviços de saúde do município',
      'Elaborar, discutir e votar as leis municipais, fiscalizando o Poder Executivo',
      'Julgar processos criminais ocorridos no município'
    ],
    correct: 2,
    explanations: [
      'Errado: o prefeito é eleito pelo voto popular, não nomeado pela Câmara.',
      'Errado: a administração direta dos serviços públicos é atribuição do Poder Executivo (Prefeitura).',
      'Correto: cabe à Câmara Municipal, como Poder Legislativo local, elaborar e votar leis, além de fiscalizar os atos do Executivo.',
      'Errado: julgar processos é função do Poder Judiciário.'
    ]
  },
  {
    id: 'real-5', subjectId: 'realidade',
    text: 'Sobre desastres ambientais e mudanças climáticas, uma das principais preocupações atuais em regiões de Cerrado, como Goiás, é:',
    options: [
      'A elevação do nível do mar sobre áreas costeiras do estado',
      'Queimadas e desmatamento, que afetam a vegetação nativa e os recursos hídricos',
      'Furacões frequentes de grande intensidade',
      'O derretimento de geleiras próximas ao estado'
    ],
    correct: 1,
    explanations: [
      'Errado: Goiás não possui litoral, portanto não é afetado pela elevação do nível do mar.',
      'Correto: queimadas (naturais e criminosas) e o desmatamento são preocupações centrais no Cerrado, impactando a vegetação e os mananciais de água.',
      'Errado: furacões não são um fenômeno característico do interior do Brasil.',
      'Errado: Goiás não possui geleiras nem está próximo a regiões com esse fenômeno.'
    ]
  },
  {
    id: 'real-6', subjectId: 'realidade',
    text: 'O município de Ipameri está localizado em qual região do estado de Goiás?',
    options: [
      'Norte de Goiás',
      'Região metropolitana de Goiânia',
      'Extremo oeste de Goiás',
      'Sudeste goiano'
    ],
    correct: 3,
    explanations: [
      'Errado: Ipameri não se localiza na região norte do estado.',
      'Errado: Ipameri não integra a região metropolitana da capital.',
      'Errado: Ipameri não se localiza no extremo oeste goiano.',
      'Correto: Ipameri está localizada na região sudeste do estado de Goiás.'
    ]
  },

  // ================= CONHECIMENTOS ESPECÍFICOS (Motorista Legislativo) =================
  {
    id: 'esp-1', subjectId: 'especificos',
    text: 'Segundo o Código de Trânsito Brasileiro, dirigir sob a influência de álcool é infração classificada como:',
    options: [
      'Gravíssima',
      'Leve',
      'Grave',
      'Média'
    ],
    correct: 0,
    explanations: [
      'Correto: dirigir sob influência de álcool é infração gravíssima, sujeita a multa (multiplicada) e suspensão do direito de dirigir.',
      'Errado: infrações leves têm penalidades bem menores que a prevista para essa conduta.',
      'Errado: a classificação grave não corresponde ao tratamento dado a essa conduta pelo CTB.',
      'Errado: a gravidade dessa infração é maior do que a classificação média.'
    ]
  },
  {
    id: 'esp-2', subjectId: 'especificos',
    text: 'A sinalização semafórica na cor amarela piscando indica que o condutor deve:',
    options: [
      'Aguardar autorização de agente de trânsito',
      'Seguir com atenção e velocidade reduzida',
      'Parar obrigatoriamente',
      'Acelerar para não perder a preferência'
    ],
    correct: 1,
    explanations: [
      'Errado: essa indicação não exige a presença de agente de trânsito.',
      'Correto: o amarelo piscando indica que o condutor deve reduzir a velocidade e seguir com atenção redobrada.',
      'Errado: parada obrigatória é indicada pelo sinal vermelho ou pela placa "PARE".',
      'Errado: essa sinalização não indica prioridade para acelerar.'
    ]
  },
  {
    id: 'esp-3', subjectId: 'especificos',
    text: 'A "regra dos 2 segundos", usada na direção defensiva, tem como finalidade:',
    options: [
      'Medir o tempo de aquecimento do motor',
      'Determinar o tempo de uso da seta antes de uma conversão',
      'Definir a distância de segurança em relação ao veículo da frente',
      'Calcular o tempo ideal de troca de marchas'
    ],
    correct: 2,
    explanations: [
      'Errado: não é uma métrica de funcionamento mecânico do motor.',
      'Errado: não se relaciona ao uso da seta.',
      'Correto: a regra ajuda a manter uma distância segura do veículo à frente, considerando o tempo de reação e frenagem.',
      'Errado: a regra não trata de troca de marchas.'
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
      'Parar o veículo com segurança assim que possível e verificar o problema',
      'Ignorar, pois é uma luz apenas informativa',
      'Aguardar a próxima troca de óleo programada',
      'Acelerar até chegar ao destino final'
    ],
    correct: 0,
    explanations: [
      'Correto: a recomendação de segurança é parar assim que possível e verificar a causa do alerta.',
      'Errado: essa luz indica um problema real que pode causar dano grave ao motor.',
      'Errado: o problema pode ser urgente e não deve esperar a manutenção programada.',
      'Errado: continuar rodando com a pressão de óleo baixa pode danificar seriamente o motor.'
    ]
  },
  {
    id: 'esp-6', subjectId: 'especificos',
    text: 'Durante o transporte de um vereador, o motorista ouve um assunto sigiloso tratado no veículo. A conduta correta é:',
    options: [
      'Anotar os detalhes para uso pessoal futuro',
      'Comentar o assunto com colegas de trabalho depois',
      'Publicar um resumo em redes sociais, por transparência',
      'Manter sigilo absoluto sobre o que foi ouvido'
    ],
    correct: 3,
    explanations: [
      'Errado: registrar informações sigilosas para uso pessoal é conduta antiética.',
      'Errado: comentar o assunto viola a confidencialidade esperada da função.',
      'Errado: divulgar informações sigilosas fere o dever de confidencialidade e pode causar dano institucional.',
      'Correto: discrição e sigilo são deveres do motorista legislativo ao transportar autoridades.'
    ]
  },
  {
    id: 'esp-7', subjectId: 'especificos',
    text: 'A calibragem incorreta dos pneus (abaixo do recomendado pelo fabricante) tende a causar, entre outros efeitos:',
    options: [
      'Melhora significativa na frenagem',
      'Maior aderência em qualquer situação de piso',
      'Aumento do consumo de combustível e desgaste irregular do pneu',
      'Redução do consumo de combustível'
    ],
    correct: 2,
    explanations: [
      'Errado: a calibragem incorreta tende a prejudicar, não melhorar, a frenagem do veículo.',
      'Errado: a calibragem incorreta pode, na verdade, reduzir a estabilidade em curvas e frenagens.',
      'Correto: a calibragem baixa aumenta o atrito e desgasta as bordas do pneu de forma irregular, além de elevar o consumo.',
      'Errado: pneus com calibragem baixa aumentam o atrito com o solo, elevando o consumo de combustível.'
    ]
  },
  {
    id: 'esp-8', subjectId: 'especificos',
    text: 'Segundo o CTB, o uso do cinto de segurança é obrigatório para:',
    options: [
      'Condutor e todos os passageiros, em qualquer banco',
      'Somente o condutor',
      'Somente os ocupantes do banco da frente',
      'Apenas em rodovias, sendo facultativo em vias urbanas'
    ],
    correct: 0,
    explanations: [
      'Correto: o CTB exige o uso do cinto de segurança por todos os ocupantes do veículo, em qualquer banco.',
      'Errado: a obrigatoriedade não se limita ao condutor.',
      'Errado: a obrigatoriedade se estende a todos os bancos, não somente ao dianteiro.',
      'Errado: a obrigatoriedade vale tanto em vias urbanas quanto em rodovias.'
    ]
  },
  {
    id: 'esp-9', subjectId: 'especificos',
    text: 'No preenchimento do relatório de viagem de um veículo oficial, é uma informação essencial a ser registrada:',
    options: [
      'Apenas o nome do motorista responsável',
      'Itinerário, quilometragem percorrida e horários de saída e chegada',
      'A opinião pessoal do motorista sobre o trajeto',
      'Somente a cor do veículo utilizado'
    ],
    correct: 1,
    explanations: [
      'Errado: apenas o nome do motorista não é suficiente para um controle adequado da viagem.',
      'Correto: itinerário, quilometragem e horários são informações centrais no controle de uso de veículos oficiais.',
      'Errado: opiniões pessoais não fazem parte do registro técnico de uma viagem oficial.',
      'Errado: a cor do veículo não é uma informação relevante para o controle de viagens.'
    ]
  },
  {
    id: 'esp-10', subjectId: 'especificos',
    text: 'Em relação à ética no serviço público, o princípio da impessoalidade determina que o servidor deve:',
    options: [
      'Seguir apenas as normas que considerar convenientes',
      'Priorizar o atendimento de acordo com sua conveniência pessoal',
      'Tratar todos os cidadãos de forma igualitária, sem favorecimentos pessoais',
      'Tratar com prioridade os cidadãos que conhece pessoalmente'
    ],
    correct: 2,
    explanations: [
      'Errado: o servidor público deve seguir todas as normas aplicáveis, não apenas as que considerar convenientes.',
      'Errado: o atendimento não deve se guiar pela conveniência pessoal do servidor.',
      'Correto: a impessoalidade exige tratamento igualitário a todos os cidadãos, sem favorecimentos pessoais.',
      'Errado: favorecer conhecidos contraria diretamente o princípio da impessoalidade.'
    ]
  },
  {
    id: 'esp-11', subjectId: 'especificos',
    text: 'De acordo com as normas do CONTRAN sobre sinalização, uma placa de fundo vermelho com uma faixa branca na horizontal e o dizer "PARE" é classificada como uma sinalização:',
    options: [
      'De regulamentação',
      'De indicação',
      'Educativa',
      'De advertência'
    ],
    correct: 0,
    explanations: [
      'Correto: a placa "PARE" é uma sinalização de regulamentação, pois impõe uma obrigação (parar) ao condutor.',
      'Errado: placas de indicação fornecem informações úteis, como localização de serviços, e não impõem obrigações.',
      'Errado: sinalização educativa tem caráter informativo/orientador, não impositivo, como o "PARE".',
      'Errado: placas de advertência alertam sobre uma condição perigosa à frente, geralmente com fundo amarelo.'
    ]
  },
  {
    id: 'esp-12', subjectId: 'especificos',
    text: 'Antes de iniciar uma viagem, é uma boa prática de manutenção preventiva do veículo:',
    options: [
      'Aguardar algum problema aparecer durante o trajeto para depois verificar',
      'Verificar apenas o nível de combustível',
      'Realizar a verificação apenas uma vez por mês, independentemente do uso',
      'Verificar pneus, níveis de fluidos (óleo, água) e funcionamento de freios e luzes'
    ],
    correct: 3,
    explanations: [
      'Errado: esperar o problema aparecer no trajeto é uma prática de risco, e não de prevenção.',
      'Errado: verificar apenas o combustível não é suficiente para garantir a segurança do trajeto.',
      'Errado: a verificação preventiva deve ser feita antes de cada uso relevante, não apenas mensalmente.',
      'Correto: uma checagem preventiva (pneus, fluidos, freios e luzes) antes de cada saída reduz o risco de panes e acidentes.'
    ]
  },
  {
    id: 'pt-9', subjectId: 'portugues',
    text: "Leia: “Embora o veículo estivesse revisado, o motorista conferiu novamente os pneus antes da saída.” A palavra “Embora” estabelece relação de:",
    options: [
      "Concessão, pois introduz circunstância que não impede a ação principal",
      "Finalidade, pois indica o objetivo da revisão",
      "Conclusão, pois encerra o raciocínio",
      "Causa, pois apresenta o motivo da conferência"
    ],
    correct: 0,
    explanations: [
      "Correto: “embora” introduz oração concessiva; a revisão prévia não impediu nova conferência.",
      "Errado: finalidade seria expressa por “para que”, por exemplo.",
      "Errado: não há conclusão introduzida por essa conjunção.",
      "Errado: “embora” não apresenta a causa da conferência."
    ]
  },
  {
    id: 'pt-10', subjectId: 'portugues',
    text: "Assinale a alternativa em que a pontuação está adequada à norma-padrão:",
    options: [
      "Antes, da viagem o motorista verificou, os freios e os pneus.",
      "Antes da viagem o motorista, verificou os freios e os pneus.",
      "Antes da viagem o motorista verificou, os freios, e os pneus.",
      "Antes da viagem, o motorista verificou os freios e os pneus."
    ],
    correct: 3,
    explanations: [
      "Errado: as vírgulas interrompem indevidamente a expressão e a relação sintática.",
      "Errado: a vírgula separa indevidamente sujeito e predicado.",
      "Errado: não se separa o verbo de seu complemento direto nesse contexto.",
      "Correto: a expressão adverbial deslocada está separada por vírgula, sem separar sujeito e verbo."
    ]
  },
  {
    id: 'esp-13', subjectId: 'especificos',
    text: "De acordo com o Código de Trânsito Brasileiro, o condutor deve, a todo momento:",
    options: [
      "Priorizar a rapidez do deslocamento, desde que conheça o trajeto",
      "Confiar exclusivamente nos sistemas eletrônicos de assistência do veículo",
      "Manter domínio do veículo, dirigindo com atenção e cuidados indispensáveis à segurança",
      "Manter distância do veículo da frente apenas em rodovias"
    ],
    correct: 2,
    explanations: [
      "Errado: conhecer o trajeto não autoriza priorizar rapidez em detrimento da segurança.",
      "Errado: sistemas de assistência não substituem o dever de condução atenta.",
      "Correto: o art. 28 do CTB exige domínio do veículo e atenção e cuidados indispensáveis à segurança.",
      "Errado: distância de segurança também é necessária em vias urbanas."
    ]
  },
  {
    id: 'esp-14', subjectId: 'especificos',
    text: "Ao seguir outro veículo em circulação, a conduta compatível com a direção segura e com o CTB é:",
    options: [
      "Reduzir a distância em pista molhada para evitar frenagens bruscas",
      "Aproximar-se para impedir que outro veículo entre na faixa",
      "Manter distância fixa de um metro, independentemente da velocidade",
      "Manter distância de segurança frontal e lateral, considerando velocidade, via e condições do tráfego"
    ],
    correct: 3,
    explanations: [
      "Errado: em pista molhada a distância deve ser ampliada.",
      "Errado: aproximar-se deliberadamente reduz a margem de reação.",
      "Errado: distância fixa não atende às diferentes velocidades e condições.",
      "Correto: o art. 29, II, do CTB determina distância lateral e frontal considerando velocidade e condições locais, de circulação, veículo e clima."
    ]
  },
  {
    id: 'esp-15', subjectId: 'especificos',
    text: "Em situação de chuva intensa, neblina ou cerração, qual medida contribui para a segurança?",
    options: [
      "Apagar todas as luzes para evitar reflexos",
      "Utilizar luz baixa, reduzir a velocidade e ampliar a distância de segurança",
      "Aumentar a velocidade para atravessar rapidamente o trecho",
      "Utilizar farol alto continuamente, mesmo quando refletir na neblina"
    ],
    correct: 1,
    explanations: [
      "Errado: circular sem iluminação adequada reduz a visibilidade do veículo.",
      "Correto: luz baixa, velocidade compatível e maior distância são medidas prudentes em condições adversas.",
      "Errado: maior velocidade reduz o tempo de reação e frenagem.",
      "Errado: farol alto pode refletir nas partículas e prejudicar a visão."
    ]
  },
  {
    id: 'esp-16', subjectId: 'especificos',
    text: "Ao perceber falha nos freios durante o deslocamento, o motorista de veículo oficial deve:",
    options: [
      "Desligar imediatamente o motor e retirar a chave ainda em movimento",
      "Continuar até a garagem, utilizando o freio de estacionamento em movimento",
      "Reduzir a velocidade com segurança, imobilizar em local seguro e comunicar a ocorrência",
      "Pedir ao passageiro que salte do veículo"
    ],
    correct: 2,
    explanations: [
      "Errado: desligar o motor em movimento pode comprometer sistemas de assistência.",
      "Errado: continuar a viagem com falha de freios é perigoso.",
      "Correto: a prioridade é controlar a situação, reduzir a velocidade progressivamente, imobilizar em local seguro e comunicar a avaria.",
      "Errado: nunca se deve orientar passageiro a saltar de veículo em movimento."
    ]
  },
  {
    id: 'esp-17', subjectId: 'especificos',
    text: "Em um acidente, uma vítima está caída e consciente, sem risco imediato de incêndio ou atropelamento. Qual é a conduta inicial mais adequada?",
    options: [
      "Retirar a vítima rapidamente, mesmo sem necessidade",
      "Oferecer água e alimento para tranquilizá-la",
      "Retirar o capacete em qualquer circunstância",
      "Sinalizar o local, acionar emergência e evitar movimentar a vítima, salvo risco iminente"
    ],
    correct: 3,
    explanations: [
      "Errado: movimentação desnecessária pode agravar lesões, especialmente na coluna.",
      "Errado: não se deve oferecer líquidos ou alimentos à vítima.",
      "Errado: a retirada do capacete por pessoa sem treinamento pode agravar lesões.",
      "Correto: deve-se proteger o local, chamar socorro especializado e evitar movimentar a vítima sem necessidade."
    ]
  },
  {
    id: 'esp-18', subjectId: 'especificos',
    text: "Qual conjunto deve integrar uma inspeção preventiva básica antes de uma viagem institucional?",
    options: [
      "Pneus, freios, iluminação, níveis de fluidos e equipamentos obrigatórios",
      "Apenas documentos pessoais do motorista",
      "Somente ar-condicionado e sistema de áudio",
      "Apenas combustível e aparência externa"
    ],
    correct: 0,
    explanations: [
      "Correto: a inspeção deve abranger itens que afetam segurança e funcionamento, além dos equipamentos obrigatórios.",
      "Errado: documentos são importantes, mas não substituem a inspeção do veículo.",
      "Errado: conforto e áudio não são os itens prioritários de segurança.",
      "Errado: combustível e aparência não substituem a verificação dos sistemas de segurança."
    ]
  },
  {
    id: 'esp-19', subjectId: 'especificos',
    text: "Durante a inspeção, o motorista identifica desgaste acentuado e irregular nos pneus. Qual providência é mais adequada?",
    options: [
      "Continuar normalmente, pois o desgaste só importa em rodovias",
      "Não liberar o veículo para uso sem avaliação e correção da condição, comunicando a área responsável",
      "Trocar os pneus apenas quando houver perda total de pressão",
      "Aumentar a pressão acima da recomendação para compensar o desgaste"
    ],
    correct: 1,
    explanations: [
      "Errado: pneus em más condições comprometem a segurança também em vias urbanas.",
      "Correto: a condição irregular exige avaliação e providência antes de colocar o veículo em circulação.",
      "Errado: esperar a perda de pressão expõe os ocupantes a risco.",
      "Errado: pressão excessiva não corrige desgaste e pode criar novos riscos."
    ]
  },
  {
    id: 'esp-20', subjectId: 'especificos',
    text: "A luz de advertência da temperatura do motor indica superaquecimento. Qual atitude é mais segura?",
    options: [
      "Parar em local seguro e aguardar o resfriamento antes de qualquer verificação",
      "Prosseguir em alta rotação para aumentar a circulação do líquido",
      "Abrir imediatamente a tampa do reservatório ainda quente",
      "Jogar água fria diretamente no motor quente"
    ],
    correct: 0,
    explanations: [
      "Correto: imobilize o veículo em segurança e aguarde o resfriamento; siga as orientações do fabricante.",
      "Errado: elevar a carga do motor pode agravar o superaquecimento.",
      "Errado: abrir o sistema pressurizado quente pode provocar queimaduras graves.",
      "Errado: choque térmico pode causar danos e não resolve a causa."
    ]
  },
  {
    id: 'esp-21', subjectId: 'especificos',
    text: "No transporte institucional, um passageiro conversa sobre assunto reservado relacionado ao trabalho. O motorista deve:",
    options: [
      "Utilizar a informação em benefício próprio",
      "Preservar a discrição e não divulgar informações obtidas em razão do serviço",
      "Gravar a conversa para publicar posteriormente",
      "Compartilhar o conteúdo com conhecidos, sem citar nomes"
    ],
    correct: 1,
    explanations: [
      "Errado: utilizar informação funcional para benefício próprio é incompatível com a ética pública.",
      "Correto: a função exige postura profissional, discrição, sigilo e responsabilidade.",
      "Errado: gravar e publicar conversa reservada sem autorização viola a discrição esperada.",
      "Errado: divulgação indireta também pode violar a confidencialidade."
    ]
  },
  {
    id: 'esp-22', subjectId: 'especificos',
    text: "Ao transportar documentos oficiais entre unidades públicas, a conduta mais adequada é:",
    options: [
      "Deixá-los visíveis no interior do veículo",
      "Entregá-los a qualquer pessoa que se apresente como servidor",
      "Fotografá-los e encaminhá-los a contatos pessoais",
      "Preservar a guarda e a integridade dos documentos e entregá-los ao destinatário ou setor autorizado"
    ],
    correct: 3,
    explanations: [
      "Errado: documentos devem ser protegidos contra acesso indevido, perda ou exposição.",
      "Errado: a entrega deve observar o destinatário ou procedimento autorizado.",
      "Errado: compartilhar cópias em canais pessoais pode expor dados e informações institucionais.",
      "Correto: deve-se preservar integridade e confidencialidade e cumprir o fluxo institucional de entrega."
    ]
  },
  {
    id: 'esp-23', subjectId: 'especificos',
    text: "Um registro de viagem institucional confiável deve permitir reconstruir o deslocamento. Qual conjunto de dados atende melhor a essa finalidade?",
    options: [
      "Somente o primeiro nome do motorista",
      "Itinerário, quilometragem inicial e final, horários de saída e chegada e identificação do serviço",
      "Uma avaliação pessoal sobre o trânsito",
      "Apenas o valor gasto com combustível, sem data ou trajeto"
    ],
    correct: 1,
    explanations: [
      "Errado: o nome isolado não permite verificar o deslocamento.",
      "Correto: esses dados permitem controle, rastreabilidade e conferência do uso do veículo oficial.",
      "Errado: opinião pessoal não substitui dados objetivos do relatório.",
      "Errado: despesa sem data, quilometragem ou trajeto não permite controle suficiente."
    ]
  },
  {
    id: 'esp-24', subjectId: 'especificos',
    text: "Durante o expediente, um servidor solicita que o motorista utilize o veículo oficial para resolver assunto particular, sem autorização institucional. O motorista deve:",
    options: [
      "Aceitar desde que o trajeto seja curto",
      "Utilizar o veículo se repuser o combustível depois",
      "Recusar o uso particular e seguir as regras de autorização e finalidade do veículo público",
      "Atender porque o pedido foi feito por um servidor"
    ],
    correct: 2,
    explanations: [
      "Errado: curta distância não legitima uso particular de bem público.",
      "Errado: repor combustível não regulariza o uso particular do patrimônio público.",
      "Correto: o veículo oficial deve ser utilizado conforme a finalidade pública e as autorizações do órgão.",
      "Errado: solicitação de outro servidor não transforma finalidade particular em serviço público."
    ]
  },
  {
    id: 'esp-25', subjectId: 'especificos',
    text: "Ao identificar uma avaria no veículo oficial durante o serviço, qual procedimento é mais adequado?",
    options: [
      "Aguardar a próxima revisão periódica, independentemente do risco",
      "Fazer reparo improvisado e não comunicar para evitar atraso",
      "Ocultar a ocorrência se o veículo ainda conseguir se deslocar",
      "Comunicar a área responsável, registrar os fatos e seguir o procedimento institucional para avaliação e reparo"
    ],
    correct: 3,
    explanations: [
      "Errado: avaria que afeta segurança ou funcionamento exige avaliação, não espera automática pela revisão.",
      "Errado: reparo improvisado e ausência de comunicação comprometem segurança e rastreabilidade.",
      "Errado: ocultar avaria impede avaliação e pode colocar pessoas em risco.",
      "Correto: a ocorrência deve ser comunicada e registrada para avaliação e reparo pelo setor competente."
    ]
  }
]
