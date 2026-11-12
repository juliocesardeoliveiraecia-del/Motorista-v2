/* Doctor Core — Product Context
 * Este arquivo contém somente configuração do produto/concurso.
 * Não colocar lógica do motor, autenticação, sincronização ou conteúdo aqui.
 * CONTRATO OBRIGATÓRIO DO CORE: todo produto derivado deve preencher appTitle,
 * appId e productId. A Central de Suporte usa esses três campos automaticamente
 * e bloqueia o envio se algum estiver ausente, para nunca atribuir uma mensagem
 * ao aplicativo errado. Ao criar um novo app, altere os valores no perfil;
 * não crie um formulário de suporte específico por aplicativo.
 */
const EXAM_CONFIG = {
  // Identidade do concurso
  orgName: 'Câmara Municipal de Ipameri',
  orgState: 'GO',
  cargo: 'Agente Legislativo — Motorista Legislativo',
  banca: 'Instituto Verbena / UFG',
  editalNumber: 'Edital nº 02/2026',
  officialEditalUrl: 'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/9-edital/167-edital-de-abertura-n%C2%BA-02-2026.html',
  editalPublishDate: '2026-06-01',

  // Próximo ciclo: modo pré-edital baseado no último edital e na última prova oficial.
  contestStage: 'pre-edital',
  contentSourceMode: 'last-edital-last-exam',
  examDateISO: null,
  examDateLabel: 'Aguardando novo edital',
  lastExamDateISO: '2026-09-13',
  officialLastExamUrl: 'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/sistema/provas_gabaritos/Provas_gabaritos_finais_Ipameri_2026.html',
  applicationCity: 'Ipameri/GO',
  durationHours: 4,
  totalQuestions: 40,
  totalPoints: 100,
  passingScore: 60,
  alternativesPerQuestion: 4,
  examRules: {
    questionCount: 40,
    durationSeconds: 4 * 60 * 60,
    questionType: 'multiple-choice',
    optionCount: 4,
    optionLabels: ['A','B','C','D'],
    answerPolicy: 'single-correct',
    scoring: { correct: 'subject-weight', mode: 'weighted-by-subject', incorrectPoints: 0, blankPoints: 0, annulledPoints: 0, negativeMarking: false, penaltyDescription: 'Conforme quadro de pesos do edital; sem desconto por erro.' },
    formatEvidence: { editalUrl: 'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/9-edital/167-edital-de-abertura-n%C2%BA-02-2026.html', examUrl: 'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/sistema/provas_gabaritos/Provas_gabaritos_finais_Ipameri_2026.html', answerKeyUrl: 'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/sistema/provas_gabaritos/Provas_gabaritos_finais_Ipameri_2026.html', boardName: 'Instituto Verbena / UFG', verifiedAgainst: ['edital','official-exam','official-answer-key'] },
    passingScore: { type: 'points', value: 60 }
  },

  // Informações do cargo (rodapé / ficha do edital)
  requirement: 'Ensino Médio completo + CNH categoria AD',
  workload: '30h semanais',
  salary: 'R$ 3.061,34',

  // Nome comercial do produto vendido — o que aparece em destaque no topo do
  // app. Pode ser mais curto/direto que o "cargo" oficial do edital acima.
  productName: 'Motorista Legislativo — Câmara Municipal de Ipameri',
  appTitle: 'Motorista Legislativo',
  heroImage: './assets/images/ipameri-chamber-green.svg?v=20261028-2',
  organizationImageUrl: '/assets/images/motorista-legislativo-edital.svg',
  radarAllowedHosts: ['institutoverbena.ufg.br', 'sistemas.institutoverbena.ufg.br', 'camaraipameri.go.gov.br'],

  // Ícone temático do cargo (chave de icons.js) — troque para outro cargo
  themeIcon: 'car',

  // Identidade visual PWA — padrão compartilhado por todos os aplicativos Doctor.
  // Para um novo concurso, o Core permanece igual; altere somente appIconBadge.
  appIconSystemVersion: '1.1.0',
  appIconAsset: 'assets/icons/products/motorista-legislativo.svg',
  appIconBadgeColor: '#F5C400',
  appIconBadgeTextColor: '#071322',
  appIconBadge: 'ML',
  appIconBase: 'assets/icons/doctor-core-master.svg',
  appIconSizes: [48, 72, 96, 128, 144, 192, 256, 512, 1024],

  // Doctor Core V1 — identidade estável do produto e versão de conteúdo
  appCode: 'DC-APP-0001', // código permanente do cadastro mestre Doctor Concursos
  institutionGroupId: 'camara-municipal-ipameri-go',
  targetPosition: 'Agente Legislativo — Motorista Legislativo',
  contentIsolation: 'single_position_only',
  sharedContentPolicy: 'verified-identical-topics-only',
  bancaStatus: 'historical-reference',
  edition: {
    id: 'camara-ipameri-motorista-legislativo-edital-02-2026',
    contestId: 'concurso-camara-municipal-ipameri-go-2026',
    sequence: 1,
    mode: 'pre-edital',
    basis: 'last-official-edital-and-exam',
    sourceType: 'previous-edital',
    editalNumber: 'Edital nº 02/2026',
    publicationDate: '2026-06-01',
    editalUrl: 'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/9-edital/167-edital-de-abertura-n%C2%BA-02-2026.html',
    examUrl: 'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/sistema/provas_gabaritos/Provas_gabaritos_finais_Ipameri_2026.html',
    boardName: 'Instituto Verbena / UFG',
    boardStatus: 'historical-reference',
    boardEvidenceUrl: 'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/',
    supersedesEditionId: null,
    changeSet: []
  },
  contentPackage: {
    contentVersion: '2026.3',
    subjectCount: 4,
    topicCount: 40,
    questionCount: 47,
    traceabilityCount: 47,
    hashCount: 47,
    manifestSha256: '50e8a5dc7cf30290ab04564831d91d0de9ae5bc75af7a684b89a48cffdb53a44',
    reviewStatus: 'pending',
    questionSourceReferences: [
      {
        label: 'Edital oficial e conteúdo programático — Câmara Municipal de Ipameri',
        url: 'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/9-edital/167-edital-de-abertura-n%C2%BA-02-2026.html',
        sourceType: 'official-syllabus'
      },
      {
        label: 'Última prova e gabaritos oficiais — Câmara Municipal de Ipameri',
        url: 'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/sistema/provas_gabaritos/Provas_gabaritos_finais_Ipameri_2026.html',
        sourceType: 'official-exam'
      }
    ],
    supplementalTopicPending: true
  },
  appId: 'doctor-motorista-legislativo',
  productId: 'motorista-legislativo',
  // Slug comercial real no catálogo central. Mantém productId local estável para não perder dados offline.
  platformProductSlug: 'motorista-legislativo-ipameri',
  coreVersion: '1.12.19-core',
  contentVersion: '2026.3',
  editorialMode: 'last-edital-last-exam-plus-banca',
  // Perfil operacional da IA: muda com o concurso/banca, não com o Core.
  aiProfile: {
    questionMode: 'multiple-choice',
    answerPolicy: 'single-correct',
    formatEvidenceVerified: true,
    revisionRequired: true,
    currentFactsNeedSource: true,
    radar: { contestShare: 0.70, promotionShare: 0.30, discoveryShare: 0.00, officialFirst: true },
    essay: { enabled: true, teachStructure: true, analyzeText: true }
  },
  radarShareRatio: { contest: 0.70, promotion: 0.30, discovery: 0.00 },
  // Fontes oficiais prioritárias do Radar. São referências de pesquisa, não conteúdo congelado.
  // O agente continua fazendo busca em tempo real; estas URLs apenas garantem que ele comece no lugar certo.
  radarSources: [
    'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/',
    'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/sistema/provas_gabaritos/Provas_gabaritos_finais_Ipameri_2026.html',
    'https://institutoverbena.ufg.br/'
  ],
  sync: { enabled: true, provider: 'supabase-versioned-snapshot-v1' },
  sessionPolicy: 'single-active-device-global-account-last-login-wins',
  // Identidade visual — os mesmos valores que já estavam fixos no CSS.
  // Trocar aqui muda a cor do app inteiro sem mexer em nenhum outro arquivo.
  primaryColor: '#0A192F',
  primaryColorMid: '#16345E',
  accentColor: '#2ECC71',
  accentColorDark: '#1E9E58',

  // Catálogo local/ponteado da Plataforma Doctor. O Core nunca inventa
  // produtos: só usa itens marcados como active=true para a faixa comercial
  // de 30% do Radar. A Plataforma pode substituir este catálogo em runtime
  // por window.DOCTOR_PLATFORM_CATALOG ou bridge.getProductCatalog().
  platformCatalog: [
    { productId: 'motorista-legislativo', appId: 'doctor-motorista-legislativo', name: 'Motorista Legislativo — Câmara Municipal de Ipameri', shortName: 'Motorista Legislativo', status: 'draft', url: '', current: true },
  ]
};

window.EXAM_CONFIG = EXAM_CONFIG;

