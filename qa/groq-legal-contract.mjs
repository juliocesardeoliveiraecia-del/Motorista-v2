import fs from 'node:fs';
import vm from 'node:vm';

const index = fs.readFileSync('index.html', 'utf8');
const bridge = fs.readFileSync('doctor-platform-bridge.js', 'utf8');
const policy = fs.readFileSync('docs/DOCTOR-CORE-GROQ-LEGAL-STANDARD.md', 'utf8');

function must(label, condition) {
  if (!condition) throw new Error('FAIL: ' + label);
  console.log('PASS:', label);
}

must('Core has a versioned Groq legal notice', index.includes("GROQ_LEGAL_NOTICE_VERSION = '2026-11-05'"));
must('Groq API key is unavailable until both legal confirmations are current', /getKey\(\)\s*\{\s*return this\.isLegalReady\(\)\s*\?/.test(index) && index.includes('groqAdultConfirmed === true') && index.includes('groqDataDisclosureAccepted === true'));
must('AI activation requires an affirmative 18+ confirmation', index.includes('groq-age-confirm') && index.includes('Groq exige idade mínima de 18 anos'));
must('AI activation requires acknowledgement of the data disclosure', index.includes('groq-data-confirm') && index.includes('Li e compreendi este aviso'));
must('User can disable AI and clear the local key', index.includes('groq-disable-ai') && index.includes("Store.state.groqApiKey=''"));
must('App discloses local browser storage and warns it is not a cryptographic vault', index.includes('não é um cofre criptográfico'));
must('App includes the non-affiliation disclaimer and trademark attribution', index.includes('não é afiliado, patrocinado, certificado ou endossado pela Groq LLC') && index.includes('Groq é marca da Groq LLC'));
must('App does not promise a daily free quota reset', !/limite diário.{0,160}renovado no dia seguinte/i.test(index) && index.includes('limites e a disponibilidade podem mudar'));
const coreScript = [...index.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]).find(script => script.includes('const DOCTOR_CORE_BUILD'));
must('Main Doctor Core inline script parses successfully', !!coreScript && (() => { try { new vm.Script(coreScript); return true; } catch (error) { console.error(error); return false; } })());
must('AI disclosure links to current Groq data and service terms', index.includes('console.groq.com/docs/your-data') && index.includes('console.groq.com/docs/legal/services-agreement'));
must('Snapshot allowlist does not include the Groq API key', !/groqApiKey/i.test(bridge.slice(bridge.indexOf('function snapshotPayload'), bridge.indexOf('function mergeSnapshots'))));
must('Policy records the BYOK contract ambiguity as pending written confirmation', policy.includes('não esclarecem de forma inequívoca') && policy.includes('confirmação escrita da Groq'));
must('Policy defines the same mandatory Core safeguards for future apps', policy.includes('todos os aplicativos derivados') && policy.includes('18 anos'));
console.log('DOCTOR CORE GROQ LEGAL QA: OK');
