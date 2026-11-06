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

console.log('DOCTOR CORE PRODUCT SCAFFOLD QA: OK');
