#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync('vade-mecum.js','utf8');
const windowStub={};
vm.runInNewContext(source,{window:windowStub});
const library=windowStub.DoctorVadeMecum;
assert.ok(library,'Vade-Mécum module must expose its public interface');
for (const method of ['render','bind','search','showDocument','getCatalog']) assert.equal(typeof library[method],'function');

const catalog=library.getCatalog();
assert.equal(catalog.length,13,'expanded legal catalog must contain thirteen official works');
for (const id of ['BR-CF-1988','BR-ADCT-1988','BR-CTB-1997','INT-UDHR-1948-PT','BR-CP-1940','BR-CPP-1941','BR-LEP-1984','BR-ECA-1990','BR-CC-2002','BR-CDC-1990','BR-LMP-2006','BR-ESTATUTO-IDOSO-2003','INT-MANDELA-2015-PT']) assert.ok(catalog.some(d=>d.id===id), 'missing '+id);
assert.ok(catalog.some(d=>d.id==='INT-UDHR-1948-PT'&&d.category==='Direitos Humanos'));
assert.ok(catalog.every(d=>!d.hasLocalText),'no work may be represented as a complete official text before ingestion');
assert.ok(catalog.some(d=>d.id==='BR-CP-1940'&&d.category==='Direito Penal'));
assert.ok(catalog.some(d=>d.id==='BR-CPP-1941'&&d.category==='Processo Penal'));
assert.ok(catalog.some(d=>d.id==='INT-MANDELA-2015-PT'&&d.category==='Direitos Humanos'));
assert.ok(library.search('trânsito').some(d=>d.id==='BR-CTB-1997'));
assert.ok(library.search('processo penal').some(d=>d.id==='BR-CPP-1941'));
assert.ok(library.search('regras de mandela').some(d=>d.id==='INT-MANDELA-2015-PT'));
assert.ok(library.search('direitos humanos').some(d=>d.id==='INT-UDHR-1948-PT'));
assert.equal(library.search('xyz-nao-existe').length,0);
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|window\.open|location\.href/i.test(source),'search module must not fetch remote content or redirect');
const view=library.render();
for (const phrase of ['Vade-Mécum Doctor','Pesquisar dentro da biblioteca','Não envia você para outros sites']) assert.ok(view.includes(phrase));
assert.ok(!view.includes('Doctor Search'));

const worker=fs.readFileSync('service-worker.js','utf8');
assert.ok(worker.includes("'./vade-mecum.js?v=1.0.0'"),'service worker must cache Vade-Mécum module');
assert.ok(worker.includes("const CACHE_NAME = 'motorista-ipameri-v1.13.23-vade-mecum'"),'cache version must be bumped for the new module');
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes('./vade-mecum.js?v=1.0.0'),'app shell must load the Vade-Mécum module');

console.log('[vade-mecum-contract] PASS — local catalog, honest text status, no remote search, app integration and offline shell cache.');
