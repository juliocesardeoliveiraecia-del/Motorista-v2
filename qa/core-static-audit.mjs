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

must('Production build version is declared', !!version);
must('Index version marker matches production config', index.includes('doctor-core-version" content="'+version+'"'));
must('Manifest version matches production config', manifest.version === version);
must('Service worker cache matches production config', sw.includes('motorista-ipameri-v'+version));
must('Service worker cache-buster matches production config', index.includes('service-worker.js?v='+version));
must('Product Context is loaded before Core engine', index.indexOf('product-context.js?v=1.11.0') < index.indexOf('/* ===== icons.js'));
must('Product Content is loaded before Core engine', index.indexOf('product-content.js?v=1.11.0') < index.indexOf('/* ===== icons.js'));
must('Core engine does not redeclare EXAM_CONFIG', !/const\\s+EXAM_CONFIG\\s*=/.test(index));
must('Product Context declares EXAM_CONFIG', /const\\s+EXAM_CONFIG\\s*=/.test(context));
must('Product Content declares SUBJECTS and QUESTIONS', /const\\s+SUBJECTS\\s*=/.test(content) && /const\\s+QUESTIONS\\s*=/.test(content));
must('Structural question integrity exists', index.includes('const DoctorQuestionIntegrity'));
must('Quarantine is enforced in question pool', /poolFor\\(subjectId\\)[\\s\\S]{0,900}quarantinedIds/.test(index));
must('AI questions require independent review', /q\\.aiGenerated && q\\.reviewedByDoctor!==true/.test(index));
must('Stale-answer fingerprint protection exists', index.includes('questionFingerprint!==DoctorQuestionIntegrity.fingerprint(q)'));
must('Official simulado partial start is absent', !index.includes('start-simulado-partial'));
must('Official simulado has engine-level readiness gate', index.includes("reason:'incomplete-bank'"));
must('AI generation re-audits the bank', /DoctorQuestionIntegrity\\.auditBank\\(\\);[\\s\\S]{0,120}Store\\.save\\(\\);[\\s\\S]{0,80}return \\{ok:true,added/.test(index));
must('Central Radar RPC is wired', index.includes('rpc/get_radar_feed'));
must('Radar consumes content_url from central feed', index.includes('x.content_url'));
must('No Groq Compound legacy identifier', !index.includes('groq/compound'));
must('Storage namespace derives from productId', index.includes("'doctor-core:' + String(EXAM_CONFIG.productId"));
must('Core build derives from production config', index.includes('window.DOCTOR_PRODUCTION_CONFIG?.version'));
must('Product asset paths are context-driven', !index.includes('assets/concurso/camara-ipameri.webp') && !index.includes('camaraipameri.go.gov.br'));
must('Radar allowlist is context-driven', !index.includes("host==='institutoverbena.ufg.br'"));
must('No obvious private secret patterns in source', !/(service[-_ ]role|sk_live_|gsk_[A-Za-z0-9_-]{20,})/i.test(index+prod+context+content));
console.log('CORE STATIC QA: OK');
