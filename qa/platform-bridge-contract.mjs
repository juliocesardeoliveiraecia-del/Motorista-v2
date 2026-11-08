import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const index = read('index.html');
const bridge = read('doctor-platform-bridge.js');
const sw = read('service-worker.js');
const config = read('production-config.js');
const context = read('product-context.js');

function must(label, condition) {
  if (!condition) throw new Error('FAIL: ' + label);
  console.log('PASS:', label);
}

must('Platform bridge is loaded before the Core runtime', index.indexOf('doctor-platform-bridge.js') > 0 && index.indexOf('doctor-platform-bridge.js') < index.indexOf('window.DOCTOR_CORE_RUNTIME'));
must('Platform bridge is cached by the PWA service worker', sw.includes("'./doctor-platform-bridge.js?v=1.12.13-platform-1'"));
const environment = config.match(/environment:\s*'([^']+)'/)?.[1] || '';
const supabaseMatch = config.match(/supabase:\s*\{\s*enabled:\s*(true|false),\s*url:\s*("(?:\\.|[^"])*"),\s*publishableKey:\s*("(?:\\.|[^"])*")\s*\}/);
let runtimeUrl = '', runtimeKey = '';
if (supabaseMatch) {
  try { runtimeUrl = JSON.parse(supabaseMatch[2]); runtimeKey = JSON.parse(supabaseMatch[3]); } catch {}
}
const previewConfigSafe = environment === 'preview' && supabaseMatch?.[1] === 'false' && !runtimeUrl && !runtimeKey;
const productionConfigSafe = environment === 'production' && supabaseMatch?.[1] === 'true' &&
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(runtimeUrl) && runtimeKey.startsWith('sb_publishable_') &&
  (!process.env.SUPABASE_URL || runtimeUrl === process.env.SUPABASE_URL) &&
  (!process.env.SUPABASE_ANON_KEY || runtimeKey === process.env.SUPABASE_ANON_KEY);
const noPrivateCredentials = !/(service_role|sb_secret_|sk_live_|access_token\s*[:=])/i.test(config);
must('Runtime configuration is safe in preview and production and keeps the platform bridge enabled',
  (previewConfigSafe || productionConfigSafe) && noPrivateCredentials &&
  !config.includes('rouuppeosmizzqnubhgs') && config.includes('bridgeEnabled: true') &&
  config.includes('payments: { enabled: false'));
must('Product context declares the implemented versioned snapshot adapter', context.includes("provider: 'supabase-versioned-snapshot-v1'") && context.includes('sync: { enabled: true'));
must('Core boot waits for access validation', index.includes('window.DOCTOR_PLATFORM_BRIDGE.bootstrap()') && index.includes('renderGate(result, startDoctorCore)'));
must('Authentication uses the shared Supabase Auth session', bridge.includes('auth.signInWithPassword') && bridge.includes('auth.getUser'));
must('Device session is claimed by authenticated RPC', bridge.includes("rpc('claim_device_session_v1'") && bridge.includes('p_app_id: target.appId'));
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
must('Local device identity remains shared with Doctor Core', bridge.includes('const store = window.DOCTOR_CORE_RUNTIME?.Store') && bridge.includes('store?.state?.deviceSession?.id'));
must('Core preserves local sync queue until server confirmation', /if\(r\?\.ok\)\{const keep=new Set\(r\.unsupportedEntities\|\|\[\]\);Store\.state\.syncQueue=Store\.state\.syncQueue\.filter\(item=>keep\.has\(item\?\.entity\)\);/.test(index));
must('Product policy remains single active device per app', context.includes("sessionPolicy: 'single-active-device'"));
must('App support submits centrally with validated UUID identity', bridge.includes("functions.invoke('doctor-support-submit'") && index.includes('window.DOCTOR_PLATFORM_BRIDGE.submitSupport') && index.includes('ENVIAR CHAMADO'));
must('App support no longer depends on the user mail client', !index.includes('mailto:doctorconcursoschat@gmail.com'));
must('Radar Doctor ticker is not removed at runtime', !index.includes('doctor-radar-removal-runtime') && !index.includes("getElementById('radar-ticker-mount')?.remove()") && index.includes('get_radar_feed'));
must('No service-role key or private payment token is present in bridge', !/(service_role|sb_secret_|sk_live_|access_token\s*[:=])/i.test(bridge));
console.log('DOCTOR PLATFORM BRIDGE QA: OK');
