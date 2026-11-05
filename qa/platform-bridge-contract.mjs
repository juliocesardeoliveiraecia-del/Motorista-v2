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
must('Platform bridge is cached by the PWA service worker', sw.includes("'./doctor-platform-bridge.js'"));
must('Staging bridge is explicitly enabled', config.includes("environment: 'staging'") && config.includes('bridgeEnabled: true'));
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
must('Radar Doctor ticker is not removed at runtime', !index.includes('doctor-radar-removal-runtime') && !index.includes("getElementById('radar-ticker-mount')?.remove()") && index.includes('get_radar_feed'));
must('No service-role key or private payment token is present in bridge', !/(service_role|sb_secret_|sk_live_|access_token\s*[:=])/i.test(bridge));
console.log('DOCTOR PLATFORM BRIDGE QA: OK');
