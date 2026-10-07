#!/usr/bin/env node
/**
 * Doctor Core — auditoria estrutural do motor.
 * Falha se houver regressão nos contratos críticos de produção em massa.
 */
import fs from 'node:fs';

const read=(p)=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const index=read('index.html');
const config=read('production-config.js');
const sw=read('service-worker.js');
const manifest=read('manifest.json');
const context=read('product-context.js');

const errors=[];
const version=config.match(/version:\s*'([^']+)'/)?.[1];
if(!version) errors.push('production-config: versão ausente.');
if(version && !index.includes(`version: '${version}'`)) errors.push('index.html: versão divergente.');
if(version && !sw.includes(`motorista-ipameri-v${version}`)) errors.push('service-worker: cache versionado divergente.');
if(version && !manifest.includes(`"version": "${version}"`)) errors.push('manifest: versão divergente.');
if(version && !context.includes(`coreVersion: '${version}-core'`)) errors.push('product-context: coreVersion divergente.');

for(const forbidden of ['gsk_','service_role','sk_live_','sk_test_']){
  if(config.includes(forbidden)) errors.push(`production-config: possível segredo detectado (${forbidden}).`);
}

// O motor não pode carregar identidade do concurso diretamente.
for(const forbidden of ['Ipameri','Motorista Legislativo','Instituto Verbena','Câmara Municipal']){
  if(index.includes(forbidden)) errors.push(`index.html: conteúdo específico encontrado no Core (${forbidden}).`);
}

// Travas críticas contra regressões já identificadas.
if(!index.includes("if(phase!=='review')")) errors.push('Integridade: revisão pode sobrescrever evidência original.');
if(!index.includes("subjectId === 'todas' ? QUESTIONS.filter")) errors.push('Elegibilidade: modo Todas não está filtrando quarentena/IA não revisada.');
if(!index.includes("get_radar_feed")) errors.push('Radar: consumo central não encontrado.');
if(!index.includes("reviewedByDoctor===true")) errors.push('IA: gate de revisão independente ausente.');
if(!index.includes("questionFingerprint")) errors.push('Integridade: fingerprint de questão ausente.');

const result={ok:errors.length===0,version,errors};
console.log(JSON.stringify(result,null,2));
if(errors.length) process.exit(1);
