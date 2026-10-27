/* Doctor Core — Product Context
 * Este arquivo contém somente configuração do produto/concurso.
 * Não colocar lógica do motor, autenticação, sincronização ou conteúdo aqui.
 */
const EXAM_CONFIG = {
  orgName: 'Câmara Municipal de Ipameri',
  orgState: 'GO',
  cargo: 'Agente Legislativo — Motorista Legislativo',
  banca: 'Instituto Verbena / UFG',
  editalNumber: 'Edital nº 02/2026',
  editalPublishDate: '01/06/2026',
  examDateISO: '2026-09-13T13:00:00',
  examDateLabel: '13 de setembro de 2026, à tarde',
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
    scoring: { correct: 'subject-weight', incorrectPoints: 0, blankPoints: 0 },
    passingScore: { type: 'points', value: 60 }
  },
  requirement: 'Ensino Médio completo + CNH categoria AD',
  workload: '30h semanais',
  salary: 'R$ 3.061,34',
  productName: 'Motorista Legislativo — Câmara Municipal de Ipameri',
  appTitle: 'Motorista Legislativo',
  heroImage: 'https://camaraipameri.go.gov.br/camara/storage/app/resources/resize/960_540_0_0_crop/img_4c40354850a52fa37fa0d4931da319c2.jpg',
  organizationImageUrl: 'https://camaraipameri.go.gov.br/camara/storage/app/resources/resize/960_540_0_0_crop/img_4c40354850a52fa37fa0d4931da319c2.jpg',
  radarAllowedHosts: ['institutoverbena.ufg.br', 'camaraipameri.go.gov.br'],
  themeIcon: 'car',

  // Sistema padronizado de ícones PWA: master vetorial 512x512, com selo diagonal por produto.
  // Para novos apps, manter o símbolo Doctor e trocar somente badge + cor conforme assets/icons/icon-palette.json.
  appIconSystemVersion: '1.1',
  appIconBadge: 'ML',
  appIconBadgeColor: '#F5C542',
  appIconMasterPath: 'assets/icons/doctor-core-master.svg',
  appIconPath: 'doctor-core-icon.svg',
  appIconSizes: [48, 72, 96, 128, 144, 192, 256, 512],
  appId: 'doctor-motorista-legislativo',
  productId: 'motorista-legislativo',
  coreVersion: '1.12.13-core',
  contentVersion: '2026.1',
  editorialMode: 'edital-plus-banca',
  aiProfile: {
    questionMode: 'multiple-choice',
    answerPolicy: 'single-correct',
    revisionRequired: true,
    currentFactsNeedSource: true,
    radar: { contestShare: 0.70, promotionShare: 0.30, discoveryShare: 0.00, officialFirst: true },
    essay: { enabled: true, teachStructure: true, analyzeText: true }
  },
  radarShareRatio: { contest: 0.70, promotion: 0.30, discovery: 0.00 },
  radarSources: [
    'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/',
    'https://institutoverbena.ufg.br/'
  ],
  sync: { enabled: true, provider: 'supabase-adapter-pending' },
  sessionPolicy: 'single-active-device',
  primaryColor: '#0A192F',
  primaryColorMid: '#16345E',
  accentColor: '#2ECC71',
  accentColorDark: '#1E9E58',
  platformCatalog: [
    { productId: 'motorista-legislativo', appId: 'doctor-motorista-legislativo', name: 'Motorista Legislativo — Câmara Municipal de Ipameri', shortName: 'Motorista Legislativo', status: 'active', url: '', current: true }
  ]
};
window.EXAM_CONFIG = EXAM_CONFIG;
