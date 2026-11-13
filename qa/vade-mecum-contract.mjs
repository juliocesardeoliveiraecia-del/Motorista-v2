#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync('vade-mecum.js','utf8');
const windowStub={};
vm.runInNewContext(source,{window:windowStub});
const library=windowStub.DoctorVadeMecum;
assert.ok(library,'Vade-Mécum module must expose its public interface');
assert.equal(typeof library.render,'function');
assert.equal(typeof library.bind,'function');
assert.equal(typeof library.search,'function');

const catalog=library.getCatalog();
assert.equal(catalog.length,4,'initial shelf catalog must contain four planned works');
assert.ok(catalog.some(d=>d.id==='BR-CF-1988'));
assert.ok(catalog.some(d=>d.id==='BR-ADCT-1988'));
assert.ok(catalog.some(d=>d.id==='BR-CTB-1997'));
assert.ok(catalog.some(d=>d.id==='INT-UDHR-1948-PT'&&d.category==='Direitos Humanos'));

const ctb=library.search('trânsito');
assert.ok(ctb.some(d=>d.id==='BR-CTB-1997'),'search should find CTB from the local catalog');
const rights=library.search('direitos humanos');
assert.ok(rights.some(d=>d.id==='INT-UDHR-1948-PT'),'search should find the DUDH shelf');
assert.equal(library.search('xyz-nao-existe').length,0,'unknown terms should not return invented records');
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|window\.open|location\.href/i.test(source),'Vade-Mécum must not make remote searches or redirect the student');
const view=library.render();
assert.ok(view.includes('Vade-Mécum Doctor'));
assert.ok(view.includes('Pesquisar dentro da biblioteca'));
assert.ok(view.includes('Não envia você para outros sites'));
assert.ok(!view.includes('Doctor Search'));

console.log('[vade-mecum-contract] PASS — local-only search, initial catalog and in-app library shell.');
