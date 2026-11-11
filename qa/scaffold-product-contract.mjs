import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { validateManifest, buildOutputs } from '../tools/scaffold-product.mjs';

const manifest=JSON.parse(fs.readFileSync(new URL('../templates/product-manifest.example.json',import.meta.url),'utf8'));
assert.deepEqual(validateManifest(manifest),[]);
const outputs=buildOutputs(manifest);
assert.ok(outputs['product-context.js'].includes('"provider": "supabase-versioned-snapshot-v1"'));
assert.ok(outputs['product-context.js'].includes('"sessionPolicy": "single-active-device"'));
assert.ok(outputs['manifest.json'].includes('"short_name": "Concurso Exemplo"'));
assert.ok(outputs['version.json'].includes('"version": "1.0.0"'));
assert.doesNotThrow(()=>new vm.Script(outputs['product-context.js']));

const wrongDistribution=structuredClone(manifest);
wrongDistribution.subjects[0].officialQuestions-=1;
assert.ok(validateManifest(wrongDistribution).some(x=>x.includes('distribuição oficial')));

const untrustedRadar=structuredClone(manifest);
untrustedRadar.radarSources=['https://example.com/not-official'];
assert.ok(validateManifest(untrustedRadar).some(x=>x.includes('fonte Radar não permitida')));

const invalidDate=structuredClone(manifest);
invalidDate.app.examDateISO='sem-data';
assert.ok(validateManifest(invalidDate).some(x=>x.includes('examDateISO deve usar')));

const wrongDuration=structuredClone(manifest);
wrongDuration.examRules.durationSeconds=3600;
assert.ok(validateManifest(wrongDuration).some(x=>x.includes('durationSeconds')));

const cebraspe=structuredClone(manifest);
cebraspe.app.alternativesPerQuestion=2;
cebraspe.examRules.optionCount=2;
cebraspe.examRules.optionLabels=['Certo','Errado'];
cebraspe.examRules.questionType='true-false';
cebraspe.examRules.answerPolicy='true-false';
cebraspe.aiProfile.questionMode='true-false';
cebraspe.aiProfile.answerPolicy='true-false';
assert.deepEqual(validateManifest(cebraspe),[]);


const preEdital=structuredClone(manifest);
preEdital.app.contestStage='pre-edital';
preEdital.app.bancaStatus='historical-reference';
preEdital.app.examDateISO=null;
preEdital.app.examDateLabel='Aguardando novo edital';
preEdital.app.orgName='Polícia Federal';
preEdital.app.orgState='BR';
preEdital.app.cargo='Agente de Polícia Federal';
preEdital.app.banca='Cebraspe';
preEdital.app.editalNumber='Edital nº 01/2025 - PF - POLICIAL';
preEdital.app.editalPublishDate='20/05/2025';
preEdital.app.lastExamDateISO='2025-07-27';
preEdital.app.officialEditalUrl='https://www.gov.br/pf/pt-br/acesso-a-informacao/servidores/concursos/edital/carreira-policial-2025/editais';
preEdital.app.officialLastExamUrl='https://www.gov.br/pf/pt-br/acesso-a-informacao/servidores/concursos/provas-e-gabaritos-de-concursos-anteriores';
preEdital.radarAllowedHosts=['gov.br','cebraspe.org.br'];
preEdital.radarSources=[preEdital.app.officialEditalUrl,preEdital.app.officialLastExamUrl];
preEdital.edition={...preEdital.edition,id:'pf-agente-edital-2025-historico',contestId:'pf-carreira-policial-agente',mode:'pre-edital',basis:'last-official-edital-and-exam',sourceType:'previous-edital',editalNumber:preEdital.app.editalNumber,publicationDate:preEdital.app.editalPublishDate,editalUrl:preEdital.app.officialEditalUrl,examUrl:preEdital.app.officialLastExamUrl,boardName:'Cebraspe',boardStatus:'historical-reference',boardEvidenceUrl:'https://www.cebraspe.org.br/',supersedesEditionId:null,changeSet:[]};

assert.deepEqual(validateManifest(preEdital),[]);
const preOutputs=buildOutputs(preEdital);
assert.ok(preOutputs['product-context.js'].includes('"contestStage": "pre-edital"'));
assert.ok(preOutputs['product-context.js'].includes('"examDateISO": null'));
assert.ok(preOutputs['product-context.js'].includes('"contentSourceMode": "last-edital-last-exam"'));
assert.ok(preOutputs['product-context.js'].includes('"officialLastExamUrl"'));
assert.doesNotThrow(()=>new vm.Script(preOutputs['product-context.js']));

const missingLastExam=structuredClone(preEdital);
missingLastExam.app.officialLastExamUrl='';
assert.ok(validateManifest(missingLastExam).some(x=>x.includes('officialLastExamUrl obrigatória')));


const wrongCargoIdentity=structuredClone(manifest);
wrongCargoIdentity.app.targetPosition='Cargo diferente';
assert.ok(validateManifest(wrongCargoIdentity).some(x=>x.includes('targetPosition')));

const guessedFutureBoard=structuredClone(preEdital);
guessedFutureBoard.app.bancaStatus='confirmed-current';
guessedFutureBoard.edition.boardStatus='confirmed-current';
assert.ok(validateManifest(guessedFutureBoard).some(x=>x.includes('banca histórica')));

const missingBoardEvidence=structuredClone(manifest);
missingBoardEvidence.edition.boardEvidenceUrl='';
assert.ok(validateManifest(missingBoardEvidence).some(x=>x.includes('edition.boardEvidenceUrl')));

const editionUpdate=structuredClone(manifest);
editionUpdate.edition.id='concurso-exemplo-edital-02-2028';
editionUpdate.edition.sequence=2;
editionUpdate.edition.supersedesEditionId='concurso-exemplo-edital-01-2027';
editionUpdate.edition.changeSet=[{type:'topic-added',description:'Inclusão de novo tópico no conteúdo programático',sourceUrl:'https://www.gov.br/'}];
assert.deepEqual(validateManifest(editionUpdate),[]);
const updateOutputs=buildOutputs(editionUpdate);
assert.ok(updateOutputs['product-context.js'].includes('"supersedesEditionId": "concurso-exemplo-edital-01-2027"'));

const invalidUpdate=structuredClone(editionUpdate);
invalidUpdate.edition.supersedesEditionId=null;
assert.ok(validateManifest(invalidUpdate).some(x=>x.includes('supersedesEditionId')));

const badStage=structuredClone(manifest);
badStage.app.contestStage='future';
assert.ok(validateManifest(badStage).some(x=>x.includes('contestStage')));

console.log('DOCTOR CORE PRODUCT SCAFFOLD QA: OK');
