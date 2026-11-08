import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const prod=fs.readFileSync('production-config.js','utf8');
const sw=fs.readFileSync('service-worker.js','utf8');
const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));
const context=fs.readFileSync('product-context.js','utf8');
const content=fs.readFileSync('product-content.js','utf8');

function must(label, condition){
  if(!condition) throw new Error('FAIL: '+label);
  console.log('PASS:',label);
}

const version=(prod.match(/version:\s*['\"]([^'\"]+)['\"]/ )||[])[1];
const cacheName=(sw.match(/CACHE_NAME\s*=\s*['\"]([^'\"]+)['\"]/ )||[])[1];

must('Production build version is declared', !!version);
must('Index version marker matches production config', index.includes('doctor-core-version" content="'+version+'"'));
// PWA manifest and Service Worker have independent asset/cache revisions.
// They must be valid and versioned, but must not be forced to equal Core Version.
must('Manifest carries an independent versioned asset revision', /^\d+\.\d+\.\d+(?:-[a-z0-9]+(?:[-.][a-z0-9]+)*)*$/i.test(manifest.version||''));
must('Service worker cache has an independent versioned namespace', /^motorista-ipameri-v\d+\.\d+\.\d+(?:-[a-z0-9]+(?:[-.][a-z0-9]+)*)*$/i.test(cacheName||''));
must('Service worker cache-buster matches production config', index.includes('service-worker.js?v='+version));
must('Product Context is loaded before Core engine', index.indexOf('product-context.js?v='+version) < index.indexOf('/* ===== icons.js'));
must('Product Content is loaded before Core engine', index.indexOf('product-content.js?v='+version) < index.indexOf('/* ===== icons.js'));
must('Core engine does not redeclare EXAM_CONFIG', !/const\s+EXAM_CONFIG\s*=/.test(index));
must('Product Context declares EXAM_CONFIG', /const\s+EXAM_CONFIG\s*=/.test(context));
must('Motorista app is explicitly pre-edital with official last exam reference', context.includes("contestStage: 'pre-edital'") && context.includes("examDateISO: null") && context.includes("lastExamDateISO: '2026-09-13'") && context.includes("officialLastExamUrl: 'https://sistemas.institutoverbena.ufg.br/2026/concurso-camara-ipameri/sistema/provas_gabaritos/Provas_gabaritos_finais_Ipameri_2026.html'"));
must('Draft Motorista product is not locally advertised as active', context.includes("status: 'draft'"));
must('Product Content declares SUBJECTS and QUESTIONS', /const\s+SUBJECTS\s*=/.test(content) && /const\s+QUESTIONS\s*=/.test(content));
must('Structural question integrity exists', index.includes('const DoctorQuestionIntegrity'));
must('Quarantine is enforced in question pool', /poolFor\(subjectId\)[\s\S]{0,900}quarantinedIds/.test(index));
must('AI questions require independent review', /q\.aiGenerated && q\.reviewedByDoctor!==true/.test(index));
must('Stale-answer fingerprint protection exists', index.includes('questionFingerprint!==DoctorQuestionIntegrity.fingerprint(q)'));
must('Official simulado partial start is absent', !index.includes('start-simulado-partial'));
must('Official simulado has engine-level readiness gate', index.includes("reason:'incomplete-bank'"));
must('AI generation re-audits the bank', /DoctorQuestionIntegrity\.auditBank\(\);[\s\S]{0,120}Store\.save\(\);[\s\S]{0,80}return \{ok:true,added/.test(index));
must('Central Radar RPC is wired', index.includes('rpc/get_radar_feed'));
must('Radar consumes content_url from central feed', index.includes('x.content_url'));
must('Central product lookup uses the explicit catalog slug', context.includes("platformProductSlug: 'motorista-legislativo-ipameri'") && index.includes('EXAM_CONFIG.platformProductSlug||EXAM_CONFIG.productId'));
must('Remote sync and device sessions use the platform catalog slug', /platformProductId\(\)\{ return EXAM_CONFIG\.platformProductSlug\|\|EXAM_CONFIG\.productId; \}/.test(index) && /bridge\.sync\([\s\S]{0,220}productId:this\.platformProductId\(\)/.test(index) && /claimDeviceSession\([\s\S]{0,180}productId:this\.platformProductId\(\)/.test(index));
must('Offline storage identity remains on the local productId', index.includes("'doctor-core:' + String(EXAM_CONFIG.productId"));
must('Device status does not claim central session while bridge is disabled', index.includes('Somente neste dispositivo') && !index.includes('<span>Dispositivo atual</span><strong>Ativo</strong>'));
must('No Groq Compound legacy identifier', !index.includes('groq/compound'));
must('Storage namespace derives from productId', index.includes("'doctor-core:' + String(EXAM_CONFIG.productId"));
must('Core build derives from production config', index.includes('window.DOCTOR_PRODUCTION_CONFIG?.version'));
must('Product asset paths are context-driven', !index.includes('assets/concurso/camara-ipameri.webp') && !index.includes('camaraipameri.go.gov.br'));
must('Radar allowlist is context-driven', !index.includes("host==='institutoverbena.ufg.br'"));
must('No obvious private secret patterns in source', !/(service[-_ ]role|sk_live_|gsk_[A-Za-z0-9_-]{20,})/i.test(index+prod+context+content));
must('AI simulado uses official-source browser research with citations', index.includes('researchExamPattern') && index.includes('hasSearchCitations') && context.includes('officialEditalUrl'));
must('AI simulado generation is independently reviewed and integrity-gated', index.includes('DoctorGenerateFullSimulado') && index.includes('reviewedByDoctor===true') && index.includes('DoctorQuestionIntegrity.assertDeliverable'));
must('Prepared exam and seven-day quota are persisted', index.includes('pendingQuestionIds') && index.includes('prepareSimulado(questions)') && index.includes('nextAllowedAt:completedAt+7*86400000'));
must('Correctness is hidden during the exam and mismatch questions remain navigable', index.includes('O gabarito e os comentários serão exibidos após finalizar a prova.') && index.includes('integrityMismatch') && index.includes('id="sim-next"'));
must('Print/PDF provides a blank answer sheet without the key', index.includes('Views.simuladoPrint') && index.includes('window.print()') && index.includes('Folha de respostas'));
must('Post-exam review explains each alternative', index.includes('Views.simuladoAnswerReview') && index.includes('answer-explanations') && index.includes('Conferir gabarito comentado'));
must('Exam option labels follow the product-specific banca rules', index.includes('ExamRules.optionLabels?.[i]'));
console.log('CORE STATIC QA: OK');
