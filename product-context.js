/* Doctor Core — Product Context
 * Este arquivo contém somente configuração do produto/concurso.
 * Não colocar lógica do motor, autenticação, sincronização ou conteúdo aqui.
 */
const EXAM_CONFIG = {
  // Identidade do concurso
  orgName: 'Câmara Municipal de Ipameri',
  orgState: 'GO',
  cargo: 'Agente Legislativo — Motorista Legislativo',
  banca: 'Instituto Verbena / UFG',
  editalNumber: 'Edital nº 02/2026',
  editalPublishDate: '01/06/2026',

  // Prova
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

  // Informações do cargo (rodapé / ficha do edital)
  requirement: 'Ensino Médio completo + CNH categoria AD',
  workload: '30h semanais',
  salary: 'R$ 3.061,34',

  // Nome comercial do produto vendido — o que aparece em destaque no topo do
  // app. Pode ser mais curto/direto que o "cargo" oficial do edital acima.
  productName: 'Motorista Legislativo — Câmara Municipal de Ipameri',
  appTitle: 'Motorista Legislativo',
  heroImage: 'assets/concurso/camara-ipameri.webp',
  organizationImageUrl: 'https://camaraipameri.go.gov.br/camara/storage/app/resources/resize/960_540_0_0_crop/img_4c40354850a52fa37fa0d4931da319c2.jpg',
  radarAllowedHosts: ['institutoverbena.ufg.br', 'camaraipameri.go.gov.br'],

  // Ícone temático do cargo (chave de icons.js) — troque para outro cargo
  themeIcon: 'car',

  // Identidade visual PWA — padrão compartilhado por todos os aplicativos Doctor.
  // Para um novo concurso, o Core permanece igual; altere somente appIconBadge.
  appIconSystemVersion: '1.0',
  appIconBadge: 'MOTORISTA LEGISLATIVO',
  appIconBase: 'assets/icons/doctor-core-master-base.png',
  appIconSizes: [48, 72, 96, 128, 144, 192, 256, 512],

  // Doctor Core V1 — identidade estável do produto e versão de conteúdo
  appId: 'doctor-motorista-legislativo',
  productId: 'motorista-legislativo',
  coreVersion: '1.12.1-core',
  contentVersion: '2026.1',
  editorialMode: 'edital-plus-banca',
  // Perfil operacional da IA: muda com o concurso/banca, não com o Core.
  aiProfile: {
    questionMode: 'multiple-choice',
    answerPolicy: 'single-correct',
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
    'https://institutoverbena.ufg.br/'
  ],
  sync: { enabled: true, provider: 'supabase-adapter-pending' },
  sessionPolicy: 'single-active-device',
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
    { productId: 'motorista-legislativo', appId: 'doctor-motorista-legislativo', name: 'Motorista Legislativo — Câmara Municipal de Ipameri', shortName: 'Motorista Legislativo', status: 'active', url: '', current: true },
  ]
};

window.EXAM_CONFIG = EXAM_CONFIG;

