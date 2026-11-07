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
      'Fazem dois anos que ele trabalha na Câmara.',
      'Houveram problemas na viagem oficial.',
      'Deve haverem novas contratações.'
    ],
    correct: 0,
    explanations: [
      'Correto: "faz" no singular é a forma adequada para expressar tempo decorrido.',
      'Errado: o verbo "fazer" indicando tempo decorrido é impessoal, ficando sempre na 3ª pessoa do singular.',
      'Errado: "haver" no sentido de existir é impessoal; o correto é "houve".',
      'Errado: por ser impessoal, o verbo auxiliar também fica no singular: "deve haver".'
    ]
  },
  {
    id: 'pt-2', subjectId: 'portugues',
    text: 'Em "O motorista, que dirigia com atenção, evitou o acidente", a oração destacada classifica-se como:',
    options: [
      'Coordenada assindética',
      'Subordinada substantiva',
      'Subordinada adjetiva',
      'Coordenada sindética explicativa'
    ],
    correct: 2,
    explanations: [
      'Errado: não há duas orações de mesmo valor sintático ligadas sem conjunção.',
      'Errado: a oração não exerce função de substantivo (sujeito, objeto etc.).',
      'Correto: "que dirigia com atenção" caracteriza o substantivo "motorista", funcionando como um adjetivo.',
      'Errado: não há conjunção explicativa (pois, que, porque) nesse sentido.'
    ]
  },
  {
    id: 'pt-3', subjectId: 'portugues',
    text: 'Assinale a alternativa em que o uso da crase está correto:',
    options: [
      'Cheguei à Ipameri no domingo.',
      'Vou à sede da Câmara buscar o veículo.',
      'Entreguei o relatório à ele.',
      'Fui à pé até o trabalho.'
    ],
    correct: 1,
    explanations: [
      'Errado: nomes de cidade, em regra, não recebem artigo, então não há crase antes deles.',
      'Correto: "sede" é substantivo feminino que aceita o artigo "a", formando a crase com a preposição "a".',
      'Errado: antes de pronome pessoal ("ele") não se usa crase.',
      'Errado: a locução "a pé" não admite crase.'
    ]
  },
  {
    id: 'pt-4', subjectId: 'portugues',
    text: 'Qual das alternativas apresenta um exemplo de coesão referencial (retomada de um termo já citado)?',
    options: [
      '"Chegou cedo e revisou o veículo antes da viagem."',
      '"Primeiro chegou cedo, depois revisou o veículo."',
      '"Como chegou cedo, revisou o veículo com calma."',
      '"O motorista chegou cedo. Ele revisou o veículo antes da viagem."'
    ],
    correct: 3,
    explanations: [
      'Errado: aqui há apenas elipse do sujeito, sem uso de elemento retomador explícito.',
      'Errado: "depois" é um conector de sequência temporal, não de retomada referencial.',
      'Errado: "como" indica causa, não retomada de um termo anterior.',
      'Correto: o pronome "ele" retoma "o motorista", caracterizando coesão referencial.'
    ]
  },
  {
    id: 'pt-5', subjectId: 'portugues',
    text: 'Assinale a alternativa em que todas as palavras estão corretamente acentuadas segundo o Acordo Ortográfico vigente:',
    options: [
      'Itinerário, veículo, órgão',
      'Ítinerário, veiculo, orgão',
      'Itinerário, veiculo, orgao',
      'Itinerario, veículo, orgão'
    ],
    correct: 0,
    explanations: [
      'Correto: todas as três palavras seguem as regras de acentuação vigentes.',
      'Errado: "ítinerário" não existe com acento no "í"; "veiculo" e "orgão" estão incorretos.',
      'Errado: "veiculo" (sem acento) e "orgao" (sem acento e sem "ã") estão incorretos.',
      'Errado: "itinerario" perdeu o acento obrigatório e "orgão" está grafado errado (o certo é "órgão").'
    ]
  },
  {
    id: 'pt-6', subjectId: 'portugues',
    text: 'Sobre os tipos de argumento em um texto dissertativo, um "argumento de autoridade" é aquele que:',
    options: [
      'Usa dados estatísticos para comprovar uma tese',
      'Apresenta um exemplo concreto do cotidiano',
      'Recorre à opinião de um especialista ou de uma fonte reconhecida no assunto',
      'Compara duas situações semelhantes para reforçar uma ideia'
    ],
    correct: 2,
    explanations: [
      'Errado: esse é o argumento de dados estatísticos, uma categoria diferente.',
      'Errado: esse é o argumento por exemplificação.',
      'Correto: o argumento de autoridade se apoia na credibilidade de uma pessoa ou fonte especializada no tema.',
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
      '"A postura ética é fundamental no serviço público porque garante a confiança da população."',
      '"Verifique o nível de óleo antes de ligar o veículo."'
    ],
    correct: 3,
    explanations: [
      'Errado: essa frase narra um fato, é uma sequência narrativa.',
      'Errado: essa frase descreve características, é uma sequência descritiva.',
      'Errado: essa frase defende um ponto de vista com justificativa, é uma sequência argumentativa.',
      'Correto: instruções e comandos (verbos no imperativo) caracterizam a sequência injuntiva.'
    ]
  },

  // ================= RACIOCÍNIO LÓGICO-MATEMÁTICO =================
  {
    id: 'rlm-1', subjectId: 'rlm',
    text: 'Um veículo percorre 180 km em 3 horas, mantendo velocidade constante. Qual é a velocidade média?',
    options: [
      '60 km/h',
      '50 km/h',
      '70 km/h',
      '90 km/h'
    ],
    correct: 0,
    explanations: [
      'Correto: velocidade média = distância ÷ tempo = 180 ÷ 3 = 60 km/h.',
      'Errado: 180 ÷ 3 não resulta em 50.',
      'Errado: 70 km/h corresponderia a uma distância maior no mesmo tempo.',
      'Errado: 90 km/h corresponderia à mesma distância em apenas 2 horas.'
    ]
  },
  {
    id: 'rlm-2', subjectId: 'rlm',
    text: 'Se 8 litros de combustível custam R$ 44,00, quanto custarão 15 litros ao mesmo preço por litro?',
    options: [
      'R$ 78,00',
      'R$ 80,00',
      'R$ 82,50',
      'R$ 85,00'
    ],
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
    options: [
      '160 km',
      '200 km',
      '220 km',
      '180 km'
    ],
    correct: 3,
    explanations: [
      'Errado: 25% de 240 km é 60 km, e 240 - 60 = 180, não 160.',
      'Errado: esse valor corresponderia a uma redução menor que 25%.',
      'Errado: esse valor corresponderia a uma redução ainda menor.',
      'Correto: 25% de 240 km = 60 km; 240 - 60 = 180 km.'
    ]
  },
  {
    id: 'rlm-5', subjectId: 'rlm',
    text: 'Na sequência numérica 3, 7, 11, 15, ..., qual é o próximo número?',
    options: [
      '19',
      '17',
      '18',
      '21'
    ],
    correct: 0,
    explanations: [
      'Correto: cada termo aumenta 4 em relação ao anterior (progressão aritmética de razão 4); 15 + 4 = 19.',
      'Errado: a razão da sequência é 4, então 17 não é o próximo termo.',
      'Errado: 18 não segue o padrão de soma constante de 4.',
      'Errado: 21 excede o padrão da sequência em 2 unidades.'
    ]
  },
  {
    id: 'rlm-6', subjectId: 'rlm',
    text: 'Um capital de R$ 2.000,00 é aplicado a juros simples de 2% ao mês. Qual será o valor total após 5 meses?',
    options: [
      'R$ 2.100,00',
      'R$ 2.150,00',
      'R$ 2.200,00',
      'R$ 2.400,00'
    ],
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
    options: [
      'Mato Grosso do Sul',
      'Tocantins',
      'Distrito Federal',
      'Rondônia'
    ],
    correct: 1,
    explanations: [
      'Errado: o Mato Grosso do Sul se originou da divisão do antigo Mato Grosso, em 1977.',
      'Correto: o Tocantins foi criado em 1988, a partir do desmembramento do norte de Goiás, pela Constituição Federal.',
      'Errado: o Distrito Federal foi criado antes, na década de 1960, com a construção de Brasília.',
      'Errado: Rondônia não tem relação com o território de Goiás.'
    ]
  },
  {
    id: 'real-2', subjectId: 'realidade',
    text: 'A economia do estado de Goiás é historicamente marcada, sobretudo a partir da segunda metade do século XX, pela expansão de qual setor?',
    options: [
      'Extração mineral de metais preciosos',
      'Indústria naval',
      'Turismo litorâneo',
      'Agronegócio (grãos e pecuária)'
    ],
    correct: 3,
    explanations: [
      'Errado: a mineração teve papel histórico relevante no período colonial, mas não é o que marca a economia goiana moderna.',
      'Errado: Goiás não tem tradição relevante em indústria naval.',
      'Errado: Goiás não possui litoral.',
      'Correto: a modernização da agricultura e a expansão da pecuária e da produção de grãos (como soja e milho) são centrais na economia de Goiás desde a segunda metade do século XX.'
    ]
  },
  {
    id: 'real-3', subjectId: 'realidade',
    text: 'Em relação ao relevo e à hidrografia de Goiás, é correto afirmar que o estado:',
    options: [
      'Situa-se majoritariamente no bioma Cerrado, com relevo de chapadas e planaltos',
      'É predominantemente montanhoso, com pouca disponibilidade de água',
      'Está localizado na Bacia Amazônica, com predomínio de floresta equatorial',
      'É formado majoritariamente por áreas litorâneas e de mangue'
    ],
    correct: 0,
    explanations: [
      'Correto: Goiás está localizado predominantemente no bioma Cerrado, caracterizado por planaltos, chapadas e vegetação típica de savana tropical.',
      'Errado: o relevo de Goiás é majoritariamente de planaltos e chapadas, não montanhoso, e o estado tem rios importantes.',
      'Errado: Goiás não está na Bacia Amazônica nem tem floresta equatorial como vegetação predominante.',
      'Errado: Goiás é um estado interior, sem litoral.'
    ]
  },
  {
    id: 'real-4', subjectId: 'realidade',
    text: 'A Câmara Municipal de Ipameri-GO, enquanto órgão do Poder Legislativo municipal, tem como principal atribuição:',
    options: [
      'Administrar diretamente os serviços de saúde do município',
      'Julgar processos criminais ocorridos no município',
      'Elaborar, discutir e votar as leis municipais, fiscalizando o Poder Executivo',
      'Nomear diretamente o prefeito do município'
    ],
    correct: 2,
    explanations: [
      'Errado: a administração direta dos serviços públicos é atribuição do Poder Executivo (Prefeitura).',
      'Errado: julgar processos é função do Poder Judiciário.',
      'Correto: cabe à Câmara Municipal, como Poder Legislativo local, elaborar e votar leis, além de fiscalizar os atos do Executivo.',
      'Errado: o prefeito é eleito pelo voto popular, não nomeado pela Câmara.'
    ]
  },
  {
    id: 'real-5', subjectId: 'realidade',
    text: 'Sobre desastres ambientais e mudanças climáticas, uma das principais preocupações atuais em regiões de Cerrado, como Goiás, é:',
    options: [
      'O derretimento de geleiras próximas ao estado',
      'Queimadas e desmatamento, que afetam a vegetação nativa e os recursos hídricos',
      'Furacões frequentes de grande intensidade',
      'A elevação do nível do mar sobre áreas costeiras do estado'
    ],
    correct: 1,
    explanations: [
      'Errado: Goiás não possui geleiras nem está próximo a regiões com esse fenômeno.',
      'Correto: queimadas (naturais e criminosas) e o desmatamento são preocupações centrais no Cerrado, impactando a vegetação e os mananciais de água.',
      'Errado: furacões não são um fenômeno característico do interior do Brasil.',
      'Errado: Goiás não possui litoral, portanto não é afetado pela elevação do nível do mar.'
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
      'Média',
      'Grave'
    ],
    correct: 0,
    explanations: [
      'Correto: dirigir sob influência de álcool é infração gravíssima, sujeita a multa (multiplicada) e suspensão do direito de dirigir.',
      'Errado: infrações leves têm penalidades bem menores que a prevista para essa conduta.',
      'Errado: a gravidade dessa infração é maior do que a classificação média.',
      'Errado: a classificação grave não corresponde ao tratamento dado a essa conduta pelo CTB.'
    ]
  },
  {
    id: 'esp-2', subjectId: 'especificos',
    text: 'A sinalização semafórica na cor amarela piscando indica que o condutor deve:',
    options: [
      'Parar obrigatoriamente',
      'Acelerar para não perder a preferência',
      'Seguir com atenção e velocidade reduzida',
      'Aguardar autorização de agente de trânsito'
    ],
    correct: 2,
    explanations: [
      'Errado: parada obrigatória é indicada pelo sinal vermelho ou pela placa "PARE".',
      'Errado: essa sinalização não indica prioridade para acelerar.',
      'Correto: o amarelo piscando indica que o condutor deve reduzir a velocidade e seguir com atenção redobrada.',
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
      'Ir embora do local para não se envolver',
      'Discutir com os envolvidos sobre a responsabilidade pelo ocorrido',
      'Sinalizar o local para evitar novos acidentes e acionar o socorro especializado'
    ],
    correct: 3,
    explanations: [
      'Errado: mover vítimas sem necessidade e sem treinamento pode agravar lesões, principalmente na coluna.',
      'Errado: afastar-se sem prestar auxílio pode configurar omissão de socorro.',
      'Errado: essa atitude não contribui para a segurança nem para o atendimento das vítimas.',
      'Correto: sinalizar o local e acionar o socorro (SAMU 192) protege a todos e agiliza o atendimento adequado.'
    ]
  },
  {
    id: 'esp-5', subjectId: 'especificos',
    text: 'Se a luz de advertência de óleo do painel acender durante a condução, o motorista deve:',
    options: [
      'Parar o veículo com segurança assim que possível e verificar o problema',
      'Ignorar, pois é uma luz apenas informativa',
      'Acelerar até chegar ao destino final',
      'Aguardar a próxima troca de óleo programada'
    ],
    correct: 0,
    explanations: [
      'Correto: a recomendação de segurança é parar assim que possível e verificar a causa do alerta.',
      'Errado: essa luz indica um problema real que pode causar dano grave ao motor.',
      'Errado: continuar rodando com a pressão de óleo baixa pode danificar seriamente o motor.',
      'Errado: o problema pode ser urgente e não deve esperar a manutenção programada.'
    ]
  },
  {
    id: 'esp-6', subjectId: 'especificos',
    text: 'Durante o transporte de um vereador, o motorista ouve um assunto sigiloso tratado no veículo. A conduta correta é:',
    options: [
      'Comentar o assunto com colegas de trabalho depois',
      'Publicar um resumo em redes sociais, por transparência',
      'Manter sigilo absoluto sobre o que foi ouvido',
      'Anotar os detalhes para uso pessoal futuro'
    ],
    correct: 2,
    explanations: [
      'Errado: comentar o assunto viola a confidencialidade esperada da função.',
      'Errado: divulgar informações sigilosas fere o dever de confidencialidade e pode causar dano institucional.',
      'Correto: discrição e sigilo são deveres do motorista legislativo ao transportar autoridades.',
      'Errado: registrar informações sigilosas para uso pessoal é conduta antiética.'
    ]
  },
  {
    id: 'esp-7', subjectId: 'especificos',
    text: 'A calibragem incorreta dos pneus (abaixo do recomendado pelo fabricante) tende a causar, entre outros efeitos:',
    options: [
      'Redução do consumo de combustível',
      'Aumento do consumo de combustível e desgaste irregular do pneu',
      'Maior aderência em qualquer situação de piso',
      'Melhora significativa na frenagem'
    ],
    correct: 1,
    explanations: [
      'Errado: pneus com calibragem baixa aumentam o atrito com o solo, elevando o consumo de combustível.',
      'Correto: a calibragem baixa aumenta o atrito e desgasta as bordas do pneu de forma irregular, além de elevar o consumo.',
      'Errado: a calibragem incorreta pode, na verdade, reduzir a estabilidade em curvas e frenagens.',
      'Errado: a calibragem incorreta tende a prejudicar, não melhorar, a frenagem do veículo.'
    ]
  },
  {
    id: 'esp-8', subjectId: 'especificos',
    text: 'Segundo o CTB, o uso do cinto de segurança é obrigatório para:',
    options: [
      'Somente o condutor',
      'Somente os ocupantes do banco da frente',
      'Apenas em rodovias, sendo facultativo em vias urbanas',
      'Condutor e todos os passageiros, em qualquer banco'
    ],
    correct: 3,
    explanations: [
      'Errado: a obrigatoriedade não se limita ao condutor.',
      'Errado: a obrigatoriedade se estende a todos os bancos, não somente ao dianteiro.',
      'Errado: a obrigatoriedade vale tanto em vias urbanas quanto em rodovias.',
      'Correto: o CTB exige o uso do cinto de segurança por todos os ocupantes do veículo, em qualquer banco.'
    ]
  },
  {
    id: 'esp-9', subjectId: 'especificos',
    text: 'No preenchimento do relatório de viagem de um veículo oficial, é uma informação essencial a ser registrada:',
    options: [
      'Itinerário, quilometragem percorrida e horários de saída e chegada',
      'Apenas o nome do motorista responsável',
      'Somente a cor do veículo utilizado',
      'A opinião pessoal do motorista sobre o trajeto'
    ],
    correct: 0,
    explanations: [
      'Correto: itinerário, quilometragem e horários são informações centrais no controle de uso de veículos oficiais.',
      'Errado: apenas o nome do motorista não é suficiente para um controle adequado da viagem.',
      'Errado: a cor do veículo não é uma informação relevante para o controle de viagens.',
      'Errado: opiniões pessoais não fazem parte do registro técnico de uma viagem oficial.'
    ]
  },
  {
    id: 'esp-10', subjectId: 'especificos',
    text: 'Em relação à ética no serviço público, o princípio da impessoalidade determina que o servidor deve:',
    options: [
      'Tratar com prioridade os cidadãos que conhece pessoalmente',
      'Priorizar o atendimento de acordo com sua conveniência pessoal',
      'Tratar todos os cidadãos de forma igualitária, sem favorecimentos pessoais',
      'Seguir apenas as normas que considerar convenientes'
    ],
    correct: 2,
    explanations: [
      'Errado: favorecer conhecidos contraria diretamente o princípio da impessoalidade.',
      'Errado: o atendimento não deve se guiar pela conveniência pessoal do servidor.',
      'Correto: a impessoalidade exige tratamento igualitário a todos os cidadãos, sem favorecimentos pessoais.',
      'Errado: o servidor público deve seguir todas as normas aplicáveis, não apenas as que considerar convenientes.'
    ]
  },
  {
    id: 'esp-11', subjectId: 'especificos',
    text: 'De acordo com as normas do CONTRAN sobre sinalização, uma placa de fundo vermelho com uma faixa branca na horizontal e o dizer "PARE" é classificada como uma sinalização:',
    options: [
      'De advertência',
      'De regulamentação',
      'De indicação',
      'Educativa'
    ],
    correct: 1,
    explanations: [
      'Errado: placas de advertência alertam sobre uma condição perigosa à frente, geralmente com fundo amarelo.',
      'Correto: a placa "PARE" é uma sinalização de regulamentação, pois impõe uma obrigação (parar) ao condutor.',
      'Errado: placas de indicação fornecem informações úteis, como localização de serviços, e não impõem obrigações.',
      'Errado: sinalização educativa tem caráter informativo/orientador, não impositivo, como o "PARE".'
    ]
  },
  {
    id: 'esp-12', subjectId: 'especificos',
    text: 'Antes de iniciar uma viagem, é uma boa prática de manutenção preventiva do veículo:',
    options: [
      'Verificar apenas o nível de combustível',
      'Aguardar algum problema aparecer durante o trajeto para depois verificar',
      'Realizar a verificação apenas uma vez por mês, independentemente do uso',
      'Verificar pneus, níveis de fluidos (óleo, água) e funcionamento de freios e luzes'
    ],
    correct: 3,
    explanations: [
      'Errado: verificar apenas o combustível não é suficiente para garantir a segurança do trajeto.',
      'Errado: esperar o problema aparecer no trajeto é uma prática de risco, e não de prevenção.',
      'Errado: a verificação preventiva deve ser feita antes de cada uso relevante, não apenas mensalmente.',
      'Correto: uma checagem preventiva (pneus, fluidos, freios e luzes) antes de cada saída reduz o risco de panes e acidentes.'
    ]
  },
  {
    id: 'pt-9', subjectId: 'portugues',
    text: "Leia: “Embora o veículo estivesse revisado, o motorista conferiu novamente os pneus antes da saída.” A palavra “Embora” estabelece relação de:",
    options: [
      "Concessão, pois introduz circunstância que não impede a ação principal",
      "Causa, pois apresenta o motivo da conferência",
      "Conclusão, pois encerra o raciocínio",
      "Finalidade, pois indica o objetivo da revisão"
    ],
    correct: 0,
    explanations: [
      "Correto: “embora” introduz oração concessiva; a revisão prévia não impediu nova conferência.",
      "Errado: “embora” não apresenta a causa da conferência.",
      "Errado: não há conclusão introduzida por essa conjunção.",
      "Errado: finalidade seria expressa por “para que”, por exemplo."
    ]
  },
  {
    id: 'pt-10', subjectId: 'portugues',
    text: "Assinale a alternativa em que a pontuação está adequada à norma-padrão:",
    options: [
      "Antes da viagem o motorista, verificou os freios e os pneus.",
      "Antes, da viagem o motorista verificou, os freios e os pneus.",
      "Antes da viagem, o motorista verificou os freios e os pneus.",
      "Antes da viagem o motorista verificou, os freios, e os pneus."
    ],
    correct: 2,
    explanations: [
      "Errado: a vírgula separa indevidamente sujeito e predicado.",
      "Errado: as vírgulas interrompem indevidamente a expressão e a relação sintática.",
      "Correto: a expressão adverbial deslocada está separada por vírgula, sem separar sujeito e verbo.",
      "Errado: não se separa o verbo de seu complemento direto nesse contexto."
    ]
  },
  {
    id: 'esp-13', subjectId: 'especificos',
    text: "De acordo com o Código de Trânsito Brasileiro, o condutor deve, a todo momento:",
    options: [
      "Priorizar a rapidez do deslocamento, desde que conheça o trajeto",
      "Manter domínio do veículo, dirigindo com atenção e cuidados indispensáveis à segurança",
      "Confiar exclusivamente nos sistemas eletrônicos de assistência do veículo",
      "Manter distância do veículo da frente apenas em rodovias"
    ],
    correct: 1,
    explanations: [
      "Errado: conhecer o trajeto não autoriza priorizar rapidez em detrimento da segurança.",
      "Correto: o art. 28 do CTB exige domínio do veículo e atenção e cuidados indispensáveis à segurança.",
      "Errado: sistemas de assistência não substituem o dever de condução atenta.",
      "Errado: distância de segurança também é necessária em vias urbanas."
    ]
  },
  {
    id: 'esp-14', subjectId: 'especificos',
    text: "Ao seguir outro veículo em circulação, a conduta compatível com a direção segura e com o CTB é:",
    options: [
      "Manter distância fixa de um metro, independentemente da velocidade",
      "Aproximar-se para impedir que outro veículo entre na faixa",
      "Reduzir a distância em pista molhada para evitar frenagens bruscas",
      "Manter distância de segurança frontal e lateral, considerando velocidade, via e condições do tráfego"
    ],
    correct: 3,
    explanations: [
      "Errado: distância fixa não atende às diferentes velocidades e condições.",
      "Errado: aproximar-se deliberadamente reduz a margem de reação.",
      "Errado: em pista molhada a distância deve ser ampliada.",
      "Correto: o art. 29, II, do CTB determina distância lateral e frontal considerando velocidade e condições locais, de circulação, veículo e clima."
    ]
  },
  {
    id: 'esp-15', subjectId: 'especificos',
    text: "Em situação de chuva intensa, neblina ou cerração, qual medida contribui para a segurança?",
    options: [
      "Utilizar luz baixa, reduzir a velocidade e ampliar a distância de segurança",
      "Utilizar farol alto continuamente, mesmo quando refletir na neblina",
      "Apagar todas as luzes para evitar reflexos",
      "Aumentar a velocidade para atravessar rapidamente o trecho"
    ],
    correct: 0,
    explanations: [
      "Correto: luz baixa, velocidade compatível e maior distância são medidas prudentes em condições adversas.",
      "Errado: farol alto pode refletir nas partículas e prejudicar a visão.",
      "Errado: circular sem iluminação adequada reduz a visibilidade do veículo.",
      "Errado: maior velocidade reduz o tempo de reação e frenagem."
    ]
  },
  {
    id: 'esp-16', subjectId: 'especificos',
    text: "Ao perceber falha nos freios durante o deslocamento, o motorista de veículo oficial deve:",
    options: [
      "Continuar até a garagem, utilizando o freio de estacionamento em movimento",
      "Desligar imediatamente o motor e retirar a chave ainda em movimento",
      "Reduzir a velocidade com segurança, imobilizar em local seguro e comunicar a ocorrência",
      "Pedir ao passageiro que salte do veículo"
    ],
    correct: 2,
    explanations: [
      "Errado: continuar a viagem com falha de freios é perigoso.",
      "Errado: desligar o motor em movimento pode comprometer sistemas de assistência.",
      "Correto: a prioridade é controlar a situação, reduzir a velocidade progressivamente, imobilizar em local seguro e comunicar a avaria.",
      "Errado: nunca se deve orientar passageiro a saltar de veículo em movimento."
    ]
  },
  {
    id: 'esp-17', subjectId: 'especificos',
    text: "Em um acidente, uma vítima está caída e consciente, sem risco imediato de incêndio ou atropelamento. Qual é a conduta inicial mais adequada?",
    options: [
      "Retirar a vítima rapidamente, mesmo sem necessidade",
      "Sinalizar o local, acionar emergência e evitar movimentar a vítima, salvo risco iminente",
      "Oferecer água e alimento para tranquilizá-la",
      "Retirar o capacete em qualquer circunstância"
    ],
    correct: 1,
    explanations: [
      "Errado: movimentação desnecessária pode agravar lesões, especialmente na coluna.",
      "Correto: deve-se proteger o local, chamar socorro especializado e evitar movimentar a vítima sem necessidade.",
      "Errado: não se deve oferecer líquidos ou alimentos à vítima.",
      "Errado: a retirada do capacete por pessoa sem treinamento pode agravar lesões."
    ]
  },
  {
    id: 'esp-18', subjectId: 'especificos',
    text: "Qual conjunto deve integrar uma inspeção preventiva básica antes de uma viagem institucional?",
    options: [
      "Apenas combustível e aparência externa",
      "Somente ar-condicionado e sistema de áudio",
      "Apenas documentos pessoais do motorista",
      "Pneus, freios, iluminação, níveis de fluidos e equipamentos obrigatórios"
    ],
    correct: 3,
    explanations: [
      "Errado: combustível e aparência não substituem a verificação dos sistemas de segurança.",
      "Errado: conforto e áudio não são os itens prioritários de segurança.",
      "Errado: documentos são importantes, mas não substituem a inspeção do veículo.",
      "Correto: a inspeção deve abranger itens que afetam segurança e funcionamento, além dos equipamentos obrigatórios."
    ]
  },
  {
    id: 'esp-19', subjectId: 'especificos',
    text: "Durante a inspeção, o motorista identifica desgaste acentuado e irregular nos pneus. Qual providência é mais adequada?",
    options: [
      "Não liberar o veículo para uso sem avaliação e correção da condição, comunicando a área responsável",
      "Aumentar a pressão acima da recomendação para compensar o desgaste",
      "Continuar normalmente, pois o desgaste só importa em rodovias",
      "Trocar os pneus apenas quando houver perda total de pressão"
    ],
    correct: 0,
    explanations: [
      "Correto: a condição irregular exige avaliação e providência antes de colocar o veículo em circulação.",
      "Errado: pressão excessiva não corrige desgaste e pode criar novos riscos.",
      "Errado: pneus em más condições comprometem a segurança também em vias urbanas.",
      "Errado: esperar a perda de pressão expõe os ocupantes a risco."
    ]
  },
  {
    id: 'esp-20', subjectId: 'especificos',
    text: "A luz de advertência da temperatura do motor indica superaquecimento. Qual atitude é mais segura?",
    options: [
      "Abrir imediatamente a tampa do reservatório ainda quente",
      "Jogar água fria diretamente no motor quente",
      "Parar em local seguro e aguardar o resfriamento antes de qualquer verificação",
      "Prosseguir em alta rotação para aumentar a circulação do líquido"
    ],
    correct: 2,
    explanations: [
      "Errado: abrir o sistema pressurizado quente pode provocar queimaduras graves.",
      "Errado: choque térmico pode causar danos e não resolve a causa.",
      "Correto: imobilize o veículo em segurança e aguarde o resfriamento; siga as orientações do fabricante.",
      "Errado: elevar a carga do motor pode agravar o superaquecimento."
    ]
  },
  {
    id: 'esp-21', subjectId: 'especificos',
    text: "No transporte institucional, um passageiro conversa sobre assunto reservado relacionado ao trabalho. O motorista deve:",
    options: [
      "Compartilhar o conteúdo com conhecidos, sem citar nomes",
      "Preservar a discrição e não divulgar informações obtidas em razão do serviço",
      "Gravar a conversa para publicar posteriormente",
      "Utilizar a informação em benefício próprio"
    ],
    correct: 1,
    explanations: [
      "Errado: divulgação indireta também pode violar a confidencialidade.",
      "Correto: a função exige postura profissional, discrição, sigilo e responsabilidade.",
      "Errado: gravar e publicar conversa reservada sem autorização viola a discrição esperada.",
      "Errado: utilizar informação funcional para benefício próprio é incompatível com a ética pública."
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
      "Itinerário, quilometragem inicial e final, horários de saída e chegada e identificação do serviço",
      "Somente o primeiro nome do motorista",
      "Apenas o valor gasto com combustível, sem data ou trajeto",
      "Uma avaliação pessoal sobre o trânsito"
    ],
    correct: 0,
    explanations: [
      "Correto: esses dados permitem controle, rastreabilidade e conferência do uso do veículo oficial.",
      "Errado: o nome isolado não permite verificar o deslocamento.",
      "Errado: despesa sem data, quilometragem ou trajeto não permite controle suficiente.",
      "Errado: opinião pessoal não substitui dados objetivos do relatório."
    ]
  },
  {
    id: 'esp-24', subjectId: 'especificos',
    text: "Durante o expediente, um servidor solicita que o motorista utilize o veículo oficial para resolver assunto particular, sem autorização institucional. O motorista deve:",
    options: [
      "Atender porque o pedido foi feito por um servidor",
      "Recusar o uso particular e seguir as regras de autorização e finalidade do veículo público",
      "Aceitar desde que o trajeto seja curto",
      "Utilizar o veículo se repuser o combustível depois"
    ],
    correct: 1,
    explanations: [
      "Errado: solicitação de outro servidor não transforma finalidade particular em serviço público.",
      "Correto: o veículo oficial deve ser utilizado conforme a finalidade pública e as autorizações do órgão.",
      "Errado: curta distância não legitima uso particular de bem público.",
      "Errado: repor combustível não regulariza o uso particular do patrimônio público."
    ]
  },
  {
    id: 'esp-25', subjectId: 'especificos',
    text: "Ao identificar uma avaria no veículo oficial durante o serviço, qual procedimento é mais adequado?",
    options: [
      "Ocultar a ocorrência se o veículo ainda conseguir se deslocar",
      "Fazer reparo improvisado e não comunicar para evitar atraso",
      "Comunicar a área responsável, registrar os fatos e seguir o procedimento institucional para avaliação e reparo",
      "Aguardar a próxima revisão periódica, independentemente do risco"
    ],
    correct: 2,
    explanations: [
      "Errado: ocultar avaria impede avaliação e pode colocar pessoas em risco.",
      "Errado: reparo improvisado e ausência de comunicação comprometem segurança e rastreabilidade.",
      "Correto: a ocorrência deve ser comunicada e registrada para avaliação e reparo pelo setor competente.",
      "Errado: avaria que afeta segurança ou funcionamento exige avaliação, não espera automática pela revisão."
    ]
  }
]
