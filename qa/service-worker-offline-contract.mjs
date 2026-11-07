import fs from 'node:fs';
const sw=fs.readFileSync('service-worker.js','utf8');
function must(label,condition){if(!condition)throw new Error('FAIL: '+label);console.log('PASS:',label);}
must('Service worker cache namespace is versioned',/CACHE_NAME\s*=\s*['"]motorista-ipameri-v\d+\.\d+\.\d+[^'"]*['"]/.test(sw));
must('Critical app shell is explicitly declared',/const CORE_ASSETS\s*=\s*\[[\s\S]*?\.\/index\.html[\s\S]*?\.\/product-content\.js[\s\S]*?\]/.test(sw));
must('Offline update reuses assets from the previous app cache',/previousNames[\s\S]*?previousResponse\(asset\)[\s\S]*?cache\.put\(asset, response\.clone\(\)\)/.test(sw));
must('Incomplete core cache aborts service worker installation',/missingCore\.length\) throw new Error/.test(sw));
must('Old app caches are deleted only after the new worker activates',/addEventListener\('activate'[\s\S]*?name\.startsWith\(CACHE_PREFIX\)[\s\S]*?caches\.delete\(name\)/.test(sw));
must('Other apps cache namespaces are not deleted',/name\.startsWith\(CACHE_PREFIX\) && name !== CACHE_NAME/.test(sw));
must('Network-first requests fall back to cache',/Promise\.race\(\[fetch\(req\), timeoutPromise\(NETWORK_TIMEOUT_MS\)\]\)[\s\S]*?caches\.match\(req\)/.test(sw));
must('Cache writes complete before the fetch response resolves',/\.then\(async \(response\)[\s\S]*?await caches\.open\(CACHE_NAME\)/.test(sw));
console.log('SERVICE WORKER OFFLINE CONTRACT: OK');
