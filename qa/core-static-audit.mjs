import fs from 'node:fs';
import assert from 'node:assert/strict';

const index=fs.readFileSync('index.html','utf8');
const prod=fs.readFileSync('production-config.js','utf8');
const sw=fs.readFileSync('service-worker.js','utf8');
const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));

function must(label, condition){
  if(!condition) throw new Error('FAIL: '+label);
  console.log('PASS:',label);
}

must('Core version 1.10.15 in index', /<meta name="doctor-core-version" content="1\.10\.15">/.test(index));
must('Core version 1.10.15 in production-config', /version:\s*['"]1\.10\.15['"]/.test(prod));
must('Manifest version 1.10.15', manifest.version === '1.10.15');
must('Service worker cache is 1.10.15', /motorista-ipameri-v1\.10\.15/.test(sw));
must('Service worker cache-buster is 1.10.15', /service-worker\.js\?v=1\.10\.15/.test(index));
must('Structural question integrity exists', index.includes('const DoctorQuestionIntegrity'));
must('Quarantine is enforced in question pool', /poolFor\(subjectId\)[\s\S]{0,900}quarantinedIds/.test(index));
must('AI questions require independent review', /q\.aiGenerated && q\.reviewedByDoctor!==true/.test(index));
must('Stale-answer fingerprint protection exists', index.includes('questionFingerprint!==DoctorQuestionIntegrity.fingerprint(q)'));
must('Official simulado partial start is absent', !index.includes('start-simulado-partial'));
must('Official simulado has engine-level readiness gate', index.includes("reason:'incomplete-bank'"));
must('AI generation re-audits the bank', /DoctorQuestionIntegrity\.auditBank\(\);[\s\S]{0,120}Store\.save\(\);[\s\S]{0,80}return \{ok:true,added/.test(index));
must('Central Radar RPC is wired', index.includes("rpc/get_radar_feed"));
must('Radar consumes content_url from central feed', index.includes('x.content_url'));
must('No Groq Compound legacy identifier', !index.includes('groq/compound'));
console.log('CORE STATIC QA: OK');
