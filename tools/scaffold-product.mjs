#!/usr/bin/env node
/**
 * Doctor Core — product configuration factory.
 *
 * Dry run:
 *   node tools/scaffold-product.mjs --manifest templates/product-manifest.example.json
 *
 * Write generated configuration into a cloned app repository:
 *   node tools/scaffold-product.mjs --manifest ./product-manifest.json --out-dir ./apps/meu-app --apply
 *
 * Existing files are never overwritten unless --force is explicit.
 * Content questions and visual assets are intentionally not generated here.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX = /^#[0-9a-f]{6}$/i;
const safeRelativeAsset = value => typeof value === 'string' && value.length > 0 &&
  !path.isAbsolute(value) && !value.split(/[\\/]/).includes('..');

export function validateManifest(m) {
  const errors = [];
  if (!m || typeof m !== 'object' || Array.isArray(m)) return ['manifest precisa ser um objeto JSON'];
  if (m.schemaVersion !== 1) errors.push('schemaVersion deve ser 1');
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(String(m.version || ''))) errors.push('version inválida');
  if (!String(m.coreVersion || '').trim()) errors.push('coreVersion obrigatória');
  if (!String(m.contentVersion || '').trim()) errors.push('contentVersion obrigatória');

  const a = m.app || {};
  for (const key of ['appId','productId','platformProductSlug']) {
    if (!SLUG.test(String(a[key] || ''))) errors.push('app.' + key + ' deve ser slug minúsculo');
  }
  for (const key of ['appTitle','productName','orgName','orgState','cargo','banca','editalNumber','editalPublishDate','applicationCity','themeIcon','appIconBadge']) {
    if (!String(a[key] || '').trim()) errors.push('app.' + key + ' obrigatória');
  }
  const contestStage = a.contestStage || 'post-edital';
  const isPreEdital = contestStage === 'pre-edital';
  if (!['pre-edital','post-edital'].includes(contestStage)) errors.push('app.contestStage deve ser pre-edital ou post-edital');
  const validDateOnly = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) && !Number.isNaN(Date.parse(String(value) + 'T00:00:00'));
  const validDateTime = value => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(String(value || '')) && !Number.isNaN(Date.parse(String(value)));
  if (isPreEdital) {
    if (a.examDateISO != null && String(a.examDateISO).trim()) errors.push('app.examDateISO deve ficar vazio no modo pre-edital');
    if (!validDateOnly(a.lastExamDateISO)) errors.push('app.lastExamDateISO deve informar a data da última prova no formato YYYY-MM-DD');
  } else {
    if (!validDateTime(a.examDateISO)) errors.push('app.examDateISO deve usar YYYY-MM-DDTHH:mm:ss');
    if (a.lastExamDateISO && !validDateOnly(a.lastExamDateISO)) errors.push('app.lastExamDateISO inválida');
  }
  if (!Number.isInteger(a.durationHours) || a.durationHours < 1 || a.durationHours > 8) errors.push('app.durationHours deve ser inteiro entre 1 e 8');
  for (const key of ['totalQuestions','totalPoints','passingScore','alternativesPerQuestion']) {
    if (!Number.isInteger(a[key]) || a[key] <= 0) errors.push('app.' + key + ' deve ser inteiro positivo');
  }
  if (a.passingScore > a.totalPoints) errors.push('passingScore não pode exceder totalPoints');
  for (const key of ['primaryColor','primaryColorMid','accentColor','accentColorDark','appIconBadgeColor','appIconBadgeTextColor']) {
    if (!HEX.test(String(a[key] || ''))) errors.push('app.' + key + ' deve ser cor hexadecimal #RRGGBB');
  }
  for (const key of ['appIconAsset','appIconBase']) {
    if (!safeRelativeAsset(a[key])) errors.push('app.' + key + ' deve ser caminho relativo seguro');
  }
  if (!Array.isArray(a.appIconSizes) || !a.appIconSizes.length || a.appIconSizes.some(x => !Number.isInteger(x) || x < 16 || x > 2048)) errors.push('app.appIconSizes inválido');

  const rules = m.examRules || {};
  if (rules.questionCount !== a.totalQuestions) errors.push('examRules.questionCount deve coincidir com app.totalQuestions');
  if (rules.durationSeconds !== a.durationHours * 3600) errors.push('examRules.durationSeconds deve coincidir com app.durationHours');
  if (rules.optionCount !== a.alternativesPerQuestion) errors.push('examRules.optionCount deve coincidir com app.alternativesPerQuestion');
  if (!['multiple-choice','true-false'].includes(rules.questionType)) errors.push('examRules.questionType deve ser multiple-choice ou true-false');
  if (!Array.isArray(rules.optionLabels) || rules.optionLabels.length !== rules.optionCount || rules.optionLabels.some(x => !String(x).trim())) errors.push('examRules.optionLabels deve ter uma etiqueta por alternativa');
  const expectedPolicy = rules.questionType === 'true-false' ? 'true-false' : 'single-correct';
  if (rules.answerPolicy !== expectedPolicy) errors.push('examRules.answerPolicy incompatível com questionType');
  if (rules.questionType === 'true-false' && rules.optionCount !== 2) errors.push('prova certo/errado deve ter exatamente 2 opções');
  if (!rules.scoring || !Number.isFinite(rules.scoring.incorrectPoints) || !Number.isFinite(rules.scoring.blankPoints) || !String(rules.scoring.correct || '').trim()) errors.push('examRules.scoring inválido');
  if (!rules.passingScore || rules.passingScore.value !== a.passingScore) errors.push('examRules.passingScore deve coincidir com app.passingScore');

  if (!Array.isArray(m.subjects) || !m.subjects.length) errors.push('subjects deve conter as matérias do edital');
  else {
    const ids = new Set();
    let total = 0;
    for (const subject of m.subjects) {
      if (!SLUG.test(String(subject.id || '')) || !String(subject.name || '').trim()) errors.push('cada matéria precisa de id slug e name');
      if (ids.has(subject.id)) errors.push('subject id duplicado: ' + subject.id);
      ids.add(subject.id);
      if (!Number.isInteger(subject.officialQuestions) || subject.officialQuestions < 0) errors.push('officialQuestions inválido em ' + subject.id);
      else total += subject.officialQuestions;
    }
    if (total !== a.totalQuestions) errors.push('a distribuição oficial das matérias soma ' + total + ', mas o total da prova é ' + a.totalQuestions);
  }

  const allowed = new Set(Array.isArray(m.radarAllowedHosts) ? m.radarAllowedHosts.map(x => String(x).toLowerCase()) : []);
  if (!allowed.size) errors.push('radarAllowedHosts deve conter hosts oficiais');
  const validateOfficialUrl = (value, field, required = false) => {
    if (!value) { if (required) errors.push(field + ' obrigatória'); return; }
    try {
      const u = new URL(value);
      const host = u.hostname.toLowerCase();
      if (u.protocol !== 'https:' || ![...allowed].some(base => host === base || host.endsWith('.' + base))) errors.push(field + ' deve ser HTTPS e pertencer a um host oficial permitido');
    } catch { errors.push(field + ' deve ser uma URL válida'); }
  };
  const identity = { institutionGroupId: a.institutionGroupId, targetPosition: a.targetPosition, contentIsolation: a.contentIsolation, sharedContentPolicy: a.sharedContentPolicy };
  if (!SLUG.test(String(identity.institutionGroupId || ''))) errors.push('app.institutionGroupId deve ser slug estável do órgão/família');
  if (String(identity.targetPosition || '').trim() !== String(a.cargo || '').trim()) errors.push('app.targetPosition deve identificar exatamente o mesmo cargo de app.cargo');
  if (identity.contentIsolation !== 'single_position_only') errors.push('app.contentIsolation deve ser single_position_only');
  if (identity.sharedContentPolicy !== 'verified-identical-topics-only') errors.push('app.sharedContentPolicy deve ser verified-identical-topics-only');
  if (!['historical-reference','confirmed-current'].includes(a.bancaStatus)) errors.push('app.bancaStatus deve ser historical-reference ou confirmed-current');
  if (isPreEdital && a.bancaStatus !== 'historical-reference') errors.push('pré-edital só pode apresentar banca como referência histórica, nunca como banca futura confirmada');
  if (!isPreEdital && a.bancaStatus !== 'confirmed-current') errors.push('pós-edital exige banca confirmada no edital vigente');
  const edition = m.edition || {};
  if (!SLUG.test(String(edition.id || ''))) errors.push('edition.id deve ser slug único da versão do concurso');
  if (!SLUG.test(String(edition.contestId || ''))) errors.push('edition.contestId deve ser slug estável do concurso');
  if (!Number.isInteger(edition.sequence) || edition.sequence < 1) errors.push('edition.sequence deve ser inteiro >= 1');
  if (edition.mode !== contestStage) errors.push('edition.mode deve coincidir com app.contestStage');
  if (edition.basis !== (isPreEdital ? 'last-official-edital-and-exam' : 'current-official-edital')) errors.push('edition.basis incompatível com a fase do concurso');
  if (edition.sourceType !== (isPreEdital ? 'previous-edital' : 'current-edital')) errors.push('edition.sourceType incompatível com a fase do concurso');
  if (!String(edition.editalNumber || '').trim() || edition.editalNumber !== a.editalNumber) errors.push('edition.editalNumber deve coincidir com o edital efetivamente usado');
  if (!String(edition.publicationDate || '').trim() || edition.publicationDate !== a.editalPublishDate) errors.push('edition.publicationDate deve coincidir com a data do edital usado');
  if (!String(edition.boardName || '').trim() || edition.boardName !== a.banca) errors.push('edition.boardName deve coincidir com a banca registrada');
  if (edition.boardStatus !== (isPreEdital ? 'historical-reference' : 'confirmed-current')) errors.push('edition.boardStatus não pode apresentar banca histórica como confirmada');
  if (edition.editalUrl !== a.officialEditalUrl) errors.push('edition.editalUrl deve apontar para o edital oficial exato usado');
  if (edition.examUrl !== (a.officialLastExamUrl || null)) errors.push('edition.examUrl deve coincidir com a prova oficial de referência');
  if (edition.sequence === 1 && edition.supersedesEditionId != null) errors.push('primeira versão não pode declarar supersedesEditionId');
  if (edition.sequence > 1 && !SLUG.test(String(edition.supersedesEditionId || ''))) errors.push('atualização deve informar edition.supersedesEditionId da versão anterior');
  if (!Array.isArray(edition.changeSet)) errors.push('edition.changeSet deve ser um array, inclusive quando vazio');
  else for (const change of edition.changeSet) {
    if (!change || !['subject-added','subject-removed','topic-added','topic-removed','topic-modified','exam-format','weight-change','board-change','date-change','other'].includes(change.type)) errors.push('edition.changeSet contém tipo de alteração inválido');
    if (!String(change.description || '').trim()) errors.push('cada alteração do edition.changeSet precisa de descrição');
    if (change.sourceUrl) validateOfficialUrl(change.sourceUrl, 'edition.changeSet.sourceUrl', false);
  }
  validateOfficialUrl(a.officialEditalUrl, 'app.officialEditalUrl', true);
  validateOfficialUrl(a.officialLastExamUrl, 'app.officialLastExamUrl', isPreEdital);
  validateOfficialUrl(edition.editalUrl, 'edition.editalUrl', true);
  validateOfficialUrl(edition.boardEvidenceUrl, 'edition.boardEvidenceUrl', true);
  validateOfficialUrl(edition.examUrl, 'edition.examUrl', isPreEdital);
  if (!Array.isArray(m.radarSources) || !m.radarSources.length) errors.push('radarSources deve conter ao menos uma fonte oficial');
  else for (const source of m.radarSources) {
    try {
      const u = new URL(source);
      const host=u.hostname.toLowerCase();if (u.protocol !== 'https:' || ![...allowed].some(base=>host===base||host.endsWith('.'+base))) errors.push('fonte Radar não permitida: ' + source);
    } catch { errors.push('URL de Radar inválida: ' + source); }
  }

  const radar = m.aiProfile?.radar;
  if (!radar || radar.officialFirst !== true) errors.push('aiProfile.radar.officialFirst deve ser true');
  else {
    const shares = [radar.contestShare,radar.promotionShare,radar.discoveryShare];
    const share = shares.reduce((sum,value)=>sum+Number(value),0);
    if (Math.abs(share - 1) > 0.000001 || shares.some(x => !Number.isFinite(x) || x < 0 || x > 1)) errors.push('percentuais do Radar devem somar 1 e ficar entre 0 e 1');
  }
  if (!m.aiProfile || m.aiProfile.questionMode !== rules.questionType || m.aiProfile.answerPolicy !== expectedPolicy || m.aiProfile.revisionRequired !== true || m.aiProfile.currentFactsNeedSource !== true) errors.push('aiProfile deve espelhar o modo da prova, exigir revisão e fonte para fatos atuais');

  return errors;
}

export function buildOutputs(m) {
  const errors = validateManifest(m);
  if (errors.length) throw new Error(errors.join('\n'));
  const a = m.app;
  const isPreEdital = (a.contestStage || 'post-edital') === 'pre-edital';
  const context = {
    orgName:a.orgName, orgState:a.orgState, cargo:a.cargo, targetPosition:a.targetPosition,
    institutionGroupId:a.institutionGroupId, contentIsolation:a.contentIsolation,
    sharedContentPolicy:a.sharedContentPolicy, banca:a.banca, bancaStatus:a.bancaStatus,
    edition:m.edition,
    editalNumber:a.editalNumber, editalPublishDate:a.editalPublishDate,
    contestStage:isPreEdital ? 'pre-edital' : 'post-edital',
    contentSourceMode:isPreEdital ? 'last-edital-last-exam' : 'current-edital',
    officialEditalUrl:a.officialEditalUrl,
    officialLastExamUrl:a.officialLastExamUrl || '',
    lastExamDateISO:a.lastExamDateISO || '',
    examDateISO:isPreEdital ? null : a.examDateISO,
    examDateLabel:a.examDateLabel || (isPreEdital ? 'Aguardando novo edital' : a.examDateISO),
    applicationCity:a.applicationCity, durationHours:a.durationHours,
    totalQuestions:a.totalQuestions, totalPoints:a.totalPoints, passingScore:a.passingScore,
    alternativesPerQuestion:a.alternativesPerQuestion, examRules:m.examRules,
    requirement:a.requirement || '', workload:a.workload || '', salary:a.salary || '',
    productName:a.productName, appTitle:a.appTitle, heroImage:a.heroImage || '',
    organizationImageUrl:a.organizationImageUrl || '', radarAllowedHosts:m.radarAllowedHosts,
    themeIcon:a.themeIcon, appIconSystemVersion:a.appIconSystemVersion || '1.1.0',
    appIconAsset:a.appIconAsset, appIconBadgeColor:a.appIconBadgeColor,
    appIconBadgeTextColor:a.appIconBadgeTextColor, appIconBadge:a.appIconBadge,
    appIconBase:a.appIconBase, appIconSizes:a.appIconSizes,
    appId:a.appId, productId:a.productId, platformProductSlug:a.platformProductSlug,
    coreVersion:m.coreVersion, contentVersion:m.contentVersion,
    editorialMode:isPreEdital ? 'last-edital-last-exam-plus-banca' : 'edital-plus-banca', aiProfile:m.aiProfile,
    radarShareRatio:{contest:m.aiProfile.radar.contestShare,promotion:m.aiProfile.radar.promotionShare,discovery:m.aiProfile.radar.discoveryShare},
    radarSources:[...new Set([...m.radarSources,a.officialEditalUrl,a.officialLastExamUrl].filter(Boolean))], sync:{enabled:true,provider:'supabase-versioned-snapshot-v1'},
    sessionPolicy:'single-active-device',
    primaryColor:a.primaryColor, primaryColorMid:a.primaryColorMid,
    accentColor:a.accentColor, accentColorDark:a.accentColorDark,
    platformCatalog:[{productId:a.productId,appId:a.appId,name:a.productName,shortName:a.appTitle,status:'draft',url:'',current:true}]
  };
  const pwa = {
    name:a.productName, short_name:a.appTitle, description:m.description || a.productName,
    start_url:'/', display:'standalone', background_color:'#071322',
    theme_color:a.primaryColor, lang:'pt-BR', orientation:'portrait-primary',
    version:m.version,
    icons:[{src:a.appIconAsset,sizes:'any',type:a.appIconAsset.toLowerCase().endsWith('.svg')?'image/svg+xml':'image/png',purpose:'any'}]
  };
  return {
    'product-context.js':'/* Gerado por tools/scaffold-product.mjs. Edite o manifesto, não a lógica do Core. */\nconst EXAM_CONFIG = '+JSON.stringify(context,null,2)+';\nwindow.EXAM_CONFIG = EXAM_CONFIG;\n',
    'manifest.json':JSON.stringify(pwa,null,2)+'\n',
    'version.json':JSON.stringify({version:m.version,core:'Doctor Core',product:a.appTitle},null,2)+'\n'
  };
}

function arg(name, fallback=null) {
  const i=process.argv.indexOf(name);
  return i>=0 ? process.argv[i+1] || fallback : fallback;
}

async function main() {
  const manifestPath=arg('--manifest');
  if(!manifestPath){console.error('Uso: node tools/scaffold-product.mjs --manifest product-manifest.json [--out-dir ./novo-app] [--apply] [--force]');process.exit(2);}
  let manifest;
  try{manifest=JSON.parse(fs.readFileSync(path.resolve(manifestPath),'utf8'));}catch(e){console.error('Não foi possível ler o manifesto JSON:',e.message);process.exit(2);}
  const errors=validateManifest(manifest);
  if(errors.length){console.error('MANIFESTO INVÁLIDO');for(const e of errors)console.error('- '+e);process.exit(1);}
  const outputs=buildOutputs(manifest);
  const apply=process.argv.includes('--apply'),force=process.argv.includes('--force'),outArg=arg('--out-dir');
  if(!apply){console.log('MANIFESTO VÁLIDO — prévia dos arquivos gerados:');for(const [name,content] of Object.entries(outputs))console.log('\n--- '+name+' ---\n'+content);return;}
  if(!outArg){console.error('--out-dir é obrigatório com --apply; isso evita sobrescrever o app atual por engano.');process.exit(2);}
  const outDir=path.resolve(outArg);
  const existing=Object.keys(outputs).filter(name=>fs.existsSync(path.join(outDir,name)));
  if(existing.length&&!force){console.error('Arquivos já existem: '+existing.join(', ')+'. Use --force somente em uma cópia de app que você pretende reconfigurar.');process.exit(2);}
  fs.mkdirSync(outDir,{recursive:true});
  for(const [name,content] of Object.entries(outputs))fs.writeFileSync(path.join(outDir,name),content,'utf8');
  console.log('CONFIGURAÇÃO GERADA:',outDir,'('+Object.keys(outputs).join(', ')+')');
}

const invoked=process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href;
if(invoked)main();
