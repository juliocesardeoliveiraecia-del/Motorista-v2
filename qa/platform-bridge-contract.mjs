import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(path, 'utf8');
const index = read('index.html');
const bridge = read('doctor-platform-bridge.js');
const sw = read('service-worker.js');
const config = read('production-config.js');
const context = read('product-context.js');

const inlineScripts = [...index.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(match => !/\bsrc\s*=/.test(match[1]) && !/\btype\s*=\s*['"]application\/(?:json|ld\+json)['"]/.test(match[1]));
for (const [i, match] of inlineScripts.entries()) new vm.Script(match[2], { filename: 'index.html:inline-script-' + i });
must('All inline scripts in the Core HTML parse successfully', inlineScripts.length > 0);
must('Legal search view uses valid template literal delimiters', !index.slice(index.indexOf('// ---------------- BUSCADOR DE LEI SECA DOCTOR ----------------'), index.indexOf('// ---------------- CONFIGURAÇÕES ----------------')).includes('\\`'));


function must(label, condition) {
  if (!condition) throw new Error('FAIL: ' + label);
  console.log('PASS:', label);
}

must('Platform bridge is loaded before the Core runtime', index.indexOf('doctor-platform-bridge.js') > 0 && index.indexOf('doctor-platform-bridge.js') < index.indexOf('window.DOCTOR_CORE_RUNTIME'));
must('Platform bridge is cached by the PWA service worker', sw.includes("'./doctor-platform-bridge.js?v="+JSON.parse(read('version.json')).version+"-platform-5'"));
const environment = config.match(/environment:\s*'([^']+)'/)?.[1] || '';
const supabaseMatch = config.match(/supabase:\s*\{\s*enabled:\s*(true|false),\s*url:\s*(['"])(.*?)\2,\s*publishableKey:\s*(['"])(.*?)\4\s*\}/);
const runtimeUrl = supabaseMatch?.[3] || '';
const runtimeKey = supabaseMatch?.[5] || '';
const previewConfigSafe = environment === 'preview' && supabaseMatch?.[1] === 'false' && !runtimeUrl && !runtimeKey;
const unconfiguredConfigSafe = environment === 'unconfigured' && supabaseMatch?.[1] === 'false' && !runtimeUrl && !runtimeKey;
const productionConfigSafe = environment === 'production' && supabaseMatch?.[1] === 'true' &&
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(runtimeUrl) && runtimeKey.startsWith('sb_publishable_') &&
  (!process.env.SUPABASE_URL || runtimeUrl === process.env.SUPABASE_URL) &&
  (!process.env.SUPABASE_ANON_KEY || runtimeKey === process.env.SUPABASE_ANON_KEY);
const noPrivateCredentials = !/(service_role|sb_secret_|sk_live_|access_token\s*[:=])/i.test(config);
must('Runtime configuration is safe in preview and production and keeps the platform bridge enabled',
  (previewConfigSafe || unconfiguredConfigSafe || productionConfigSafe) && noPrivateCredentials &&
  !config.includes('rouuppeosmizzqnubhgs') && config.includes('bridgeEnabled: true') &&
  config.includes('payments: { enabled: false'));
must('Product context declares the implemented versioned snapshot adapter', context.includes("provider: 'supabase-versioned-snapshot-v1'") && context.includes('sync: { enabled: true'));
must('Core boot waits for access validation', index.includes('window.DOCTOR_PLATFORM_BRIDGE.bootstrap()') && index.includes('renderGate(result, startDoctorCore)'));
must('Authentication uses the shared Supabase Auth session', bridge.includes('auth.signInWithPassword') && bridge.includes('auth.getUser'));
must('Device session uses the account-wide authenticated handoff RPC', bridge.includes("rpc('request_device_session_v1'") && bridge.includes("rpc('resolve_device_session_request_v1'") && bridge.includes("rpc('get_device_session_request_v1'") && bridge.includes('p_app_id: target.appId'));
must('Login recovers if PostgREST schema cache temporarily misses the new session RPC', bridge.includes("rpc('claim_device_session_v1'") && bridge.includes("message.includes('schema cache')"));
must('Active device receives private realtime revocation events', bridge.includes("doctor-session:' + currentUserId") && bridge.includes("event: 'session_revoked'"));
must('Revoked device clears its lease and signs out locally', bridge.includes("localStorage.removeItem(storageKey())") && bridge.includes("signOut({ scope: 'local' })"));
must('Device identity is shared across apps on the same browser origin', bridge.includes("const deviceKey = () => 'doctor-platform-device-global'") && !bridge.includes('store?.state?.deviceSession?.id'));
must('Heartbeat validates the active remote session', bridge.includes("rpc('heartbeat_device_session_v1'"));
must('Client cannot choose the authenticated user identity', !bridge.includes('p_user_id:') && !bridge.includes('userId: args.userId') && bridge.includes('auth.getUser(session.access_token)'));
must('No auth token is sent through a URL', !/access_token=|refresh_token=/.test(bridge));
must('Offline access requires a recent verified lease and a valid expiry', bridge.includes('OFFLINE_GRACE_MS') && bridge.includes('lease.endsAt'));
must('Versioned snapshot sync is enabled only through authenticated RPCs', bridge.includes('syncEnabled: true') && bridge.includes("rpc('get_app_snapshot_v1'") && bridge.includes("rpc('save_app_snapshot_v1'"));
const payloadSection = bridge.slice(bridge.indexOf('function snapshotPayload'), bridge.indexOf('function mergeSnapshots'));
must('Sync payload contains only recording metadata, never local audio IDs or blobs', !/groqApiKey|audioId|blob/i.test(payloadSection) && payloadSection.includes('storagePath'));
must('Snapshot conflicts merge remote and local state before retry', bridge.includes('mergeSnapshots(response.payload || {}, payload)') && bridge.includes('attempt < 2'));
must('Private audio is uploaded and downloaded through the existing recordings bucket', bridge.includes("storage.from('recordings').upload") && bridge.includes("storage.from('recordings').download") && bridge.includes("client.from('recordings').upsert"));
must('Remote recording deletion is retained as a tombstone until successful', index.includes('deletedRecordingIds') && bridge.includes('processDeletedRecordings') && bridge.includes("storage.from('recordings').remove"));
must('Unsupported audio mutations remain queued after partial sync', index.includes('syncQueue=Store.state.syncQueue.filter(item=>keep.has(item?.entity))') && bridge.includes("['recording']"));
must('Local device identity remains stable across product slugs', bridge.includes('doctor-platform-device-global'));
must('Core preserves local sync queue until server confirmation', /if\(r\?\.ok\)\{const keep=new Set\(r\.unsupportedEntities\|\|\[\]\);Store\.state\.syncQueue=Store\.state\.syncQueue\.filter\(item=>keep\.has\(item\?\.entity\)\);/.test(index));
must('Product policy enforces one active device globally with last-login-wins', context.includes("sessionPolicy: 'single-active-device-global-account-last-login-wins'"));
must('Support is a dedicated page launched from settings, not an embedded settings form',
  index.includes("id=\"open-doctor-support\"") &&
  index.includes("Views.support = function") &&
  index.includes("id=\"back-settings-from-support\"") &&
  index.includes("Views.bind.support = function") &&
  index.includes("id=\"doctor-support-form\"") &&
  !index.slice(index.indexOf("Views.settings = function"), index.indexOf("Views.support = function")).includes('id="doctor-support-form"'));
const settingsView = index.slice(index.indexOf("Views.settings = function"), index.indexOf("Views.support = function"));
must('Support entry uses a dedicated inline SVG headset icon, not a platform emoji', index.includes('headset: svgIcon(') && settingsView.includes('${ICONS.headset}') && !settingsView.includes('>🛟</span>'));
must('Sign-out is the final settings action before the return-to-home button', settingsView.indexOf('id="open-doctor-support"') < settingsView.indexOf('id="doctor-sign-out"') && settingsView.indexOf('id="doctor-sign-out"') < settingsView.indexOf('id="back-home"') && settingsView.indexOf('id="back-home"') > settingsView.indexOf('id="doctor-sign-out"'));
must('App support submits centrally with validated UUID identity', bridge.includes("functions.invoke('doctor-support-submit'") && index.includes('window.DOCTOR_PLATFORM_BRIDGE.submitSupport') && index.includes('ENVIAR CHAMADO'));
must('App support no longer depends on the user mail client', !index.includes('mailto:doctorconcursoschat@gmail.com'));
must('Radar Doctor ticker is not removed at runtime', !index.includes('doctor-radar-removal-runtime') && !index.includes("getElementById('radar-ticker-mount')?.remove()") && index.includes('get_radar_feed'));
must('No service-role key or private payment token is present in bridge', !/(service_role|sb_secret_|sk_live_|access_token\s*[:=])/i.test(bridge));
console.log('DOCTOR PLATFORM BRIDGE QA: OK');

must('Vade-Mécum Doctor replaces the former Doctor Search home entry', index.includes('home-legal-search') && index.includes('Vade-Mécum Doctor') && !index.includes('Doctor Search'));
must('Vade-Mécum has a dedicated in-app view and navigation binding', index.includes('Views.legalSearch') && index.includes('Views.bind.legalSearch') && index.includes('window.DoctorVadeMecum.render()') && index.includes('window.DoctorVadeMecum.bind(UI)'));
const vadeMecum = read('vade-mecum.js');
must('Vade-Mécum search stays local and does not invoke GROQ or remote endpoints', vadeMecum.includes('function search(query)') && !vadeMecum.includes('fetch(') && !vadeMecum.includes('XMLHttpRequest') && !vadeMecum.includes('window.open') && !vadeMecum.includes('location.href') && !vadeMecum.includes('GroqAI'));
must('Vade-Mécum module is loaded and precached as an essential offline asset', index.includes('vade-mecum.js?v=1.0.0') && sw.includes("'./vade-mecum.js?v=1.0.0'") && sw.slice(sw.indexOf('const CORE_ASSETS'),sw.indexOf('const CACHE_PREFIX')).includes("'./vade-mecum.js?v=1.0.0'"));
new vm.Script(vadeMecum, { filename: 'vade-mecum.js' });
must('Vade-Mécum module parses successfully', true);
