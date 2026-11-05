/* Doctor Concursos — identidade e sessão central do Doctor Core.
 * Usa o mesmo Supabase Auth do site. Nenhum token é colocado na URL.
 * A fila offline permanece local; a sincronização de dados só será habilitada
 * quando o contrato de payload/versionamento estiver homologado.
 */
(function () {
  'use strict';

  const config = window.DOCTOR_PRODUCTION_CONFIG || {};
  const supaConfig = config.integrations?.supabase || {};
  const platformConfig = config.integrations?.platform || {};
  const OFFLINE_GRACE_MS = 72 * 60 * 60 * 1000;
  const HEARTBEAT_MS = 2 * 60 * 1000;
  const slug = () => String(window.EXAM_CONFIG?.platformProductSlug || window.EXAM_CONFIG?.productId || '').trim();
  const storageKey = () => 'doctor-platform-lease:' + (slug() || 'unknown');
  const deviceKey = () => 'doctor-platform-device:' + (slug() || 'unknown');

  let client = null;
  let clientPromise = null;
  let currentUserId = null;
  let currentAppId = null;
  let currentProductId = null;
  let currentSessionId = null;
  let currentLease = null;
  let heartbeatTimer = null;
  let gateElement = null;
  let lastSnapshotJSON = null;
  let autoSyncTimer = null;
  let isSavingLocalSyncMetadata = false;

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  function deviceId() {
    const store = window.DOCTOR_CORE_RUNTIME?.Store;
    const coreDeviceId = store?.state?.deviceSession?.id;
    if (coreDeviceId) return String(coreDeviceId);
    if (store?.state?.deviceSession) {
      store.state.deviceSession.id = 'device-' + crypto.randomUUID();
      try { store.save(); } catch (_) {}
      return store.state.deviceSession.id;
    }
    try {
      let value = localStorage.getItem(deviceKey());
      if (!value) {
        value = 'doctor-device-' + crypto.randomUUID();
        localStorage.setItem(deviceKey(), value);
      }
      return value;
    } catch (_) {
      return 'doctor-device-' + crypto.randomUUID();
    }
  }

  function validOfflineLease() {
    const lease = readJson(storageKey());
    if (!lease || lease.productSlug !== slug() || !lease.userId || !lease.appId || !lease.sessionId) return null;
    const verifiedAt = Date.parse(lease.verifiedAt || '');
    if (!Number.isFinite(verifiedAt) || Date.now() - verifiedAt > OFFLINE_GRACE_MS) return null;
    if (lease.endsAt && Date.now() >= Date.parse(lease.endsAt)) return null;
    return lease;
  }

  function loadSdk() {
    if (window.supabase?.createClient) return Promise.resolve(window.supabase);
    if (clientPromise) return clientPromise;
    clientPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => reject(new Error('supabase_sdk_timeout')), 9000);
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = () => {
        clearTimeout(timer);
        if (window.supabase?.createClient) resolve(window.supabase);
        else reject(new Error('supabase_sdk_unavailable'));
      };
      script.onerror = () => {
        clearTimeout(timer);
        reject(new Error('supabase_sdk_unavailable'));
      };
      document.head.appendChild(script);
    });
    return clientPromise;
  }

  async function getClient() {
    if (client) return client;
    if (!supaConfig.enabled || !supaConfig.url || !supaConfig.publishableKey) {
      throw new Error('central_auth_not_configured');
    }
    const sdk = await loadSdk();
    client = sdk.createClient(supaConfig.url, supaConfig.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'doctor-core-auth-' + (slug() || 'app')
      }
    });
    return client;
  }

  function normalizeRelation(value) {
    if (Array.isArray(value)) return value[0] || null;
    return value || null;
  }

  async function resolveTarget(db) {
    const productSlug = slug();
    if (!productSlug) throw new Error('product_slug_missing');
    const { data, error } = await db
      .from('products')
      .select('id,slug,status,product_apps(app_id,apps(id,slug,status,app_url))')
      .eq('slug', productSlug)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('app_not_published');
    const relation = Array.isArray(data.product_apps) ? data.product_apps[0] : data.product_apps;
    const app = normalizeRelation(relation?.apps);
    if (!relation?.app_id || !app?.id) throw new Error('app_catalog_link_missing');
    return { productId: data.id, productStatus: data.status, appId: relation.app_id, app };
  }

  async function claimCurrentSession() {
    if (!navigator.onLine) {
      const lease = validOfflineLease();
      if (!lease) return { ok: false, reason: 'offline-no-valid-access' };
      currentUserId = lease.userId;
      currentAppId = lease.appId;
      currentProductId = lease.productId;
      currentSessionId = lease.sessionId;
      currentLease = lease;
      return { ok: true, offline: true, sessionId: lease.sessionId, appId: lease.appId };
    }

    const db = await getClient();
    const { data: sessionData, error: sessionError } = await db.auth.getSession();
    if (sessionError) throw sessionError;
    const session = sessionData?.session;
    if (!session?.access_token) return { ok: false, reason: 'not-authenticated' };

    const { data: userData, error: userError } = await db.auth.getUser(session.access_token);
    if (userError || !userData?.user) return { ok: false, reason: 'session-invalid' };
    const user = userData.user;

    const { data: adminValue, error: adminError } = await db.rpc('is_admin');
    const isAdmin = !adminError && adminValue === true;
    const target = await resolveTarget(db);

    if (!isAdmin && (target.productStatus !== 'published' || target.app.status !== 'active')) {
      return { ok: false, reason: 'app-not-available' };
    }

    const { data: claimData, error: claimError } = await db.rpc('claim_device_session_v1', {
      p_app_id: target.appId,
      p_device_id: deviceId(),
      p_device_name: (navigator.platform || 'Dispositivo') + ' · ' + (navigator.userAgent || '').slice(0, 72),
      p_platform: 'web-pwa'
    });
    if (claimError) {
      const message = String(claimError.message || '').toLowerCase();
      if (message.includes('active app access required')) return { ok: false, reason: 'access-required' };
      throw claimError;
    }

    const claimed = Array.isArray(claimData) ? claimData[0] : claimData;
    if (!claimed?.session_id) return { ok: false, reason: 'session-not-confirmed' };

    let endsAt = null;
    if (!isAdmin) {
      const { data: grants, error: grantsError } = await db.rpc('get_my_app_access');
      if (!grantsError && Array.isArray(grants)) {
        const grant = grants.find(item => item.product_id === target.productId && item.app_id === target.appId);
        endsAt = grant?.ends_at || null;
      }
      if (!endsAt) return { ok: false, reason: 'access-not-confirmed' };
    }

    currentUserId = user.id;
    currentAppId = target.appId;
    currentProductId = target.productId;
    currentSessionId = claimed.session_id;
    currentLease = {
      userId: user.id,
      appId: target.appId,
      productId: target.productId,
      productSlug: slug(),
      sessionId: claimed.session_id,
      endsAt,
      admin: isAdmin,
      verifiedAt: new Date().toISOString()
    };
    writeJson(storageKey(), currentLease);
    startHeartbeat();
    return { ok: true, offline: false, sessionId: currentSessionId, appId: currentAppId, admin: isAdmin };
  }

  function startHeartbeat() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(async () => {
      if (!navigator.onLine || !client || !currentSessionId || !currentAppId) return;
      try {
        const { data, error } = await client.rpc('heartbeat_device_session_v1', {
          p_session_id: currentSessionId,
          p_app_id: currentAppId
        });
        if (error) {
          const message = String(error.message || '').toLowerCase();
          if (message.includes('active app access required')) loseSession();
          return;
        }
        if (data !== true) loseSession();
        else if (currentLease) {
          currentLease.verifiedAt = new Date().toISOString();
          writeJson(storageKey(), currentLease);
        }
      } catch (_) { /* transient network errors do not destroy local study data */ }
    }, HEARTBEAT_MS);
  }

  function loseSession() {
    currentSessionId = null;
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    renderGate({ reason: 'session-revoked' }, () => window.location.reload());
  }

  function stableStringify(value) {
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    if (value && typeof value === 'object') {
      return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stableStringify(value[key])).join(',') + '}';
    }
    return JSON.stringify(value);
  }

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function mergeMap(remoteValue, localValue) {
    return { ...(remoteValue && typeof remoteValue === 'object' ? remoteValue : {}),
      ...(localValue && typeof localValue === 'object' ? localValue : {}) };
  }

  function mergeArray(remoteValue, localValue) {
    const remote = Array.isArray(remoteValue) ? remoteValue : [];
    const local = Array.isArray(localValue) ? localValue : [];
    if (![...remote, ...local].some(item => item && typeof item === 'object' && item.id != null)) {
      return [...new Set([...remote, ...local])];
    }
    const map = new Map();
    for (const item of [...remote, ...local]) {
      if (!item || typeof item !== 'object' || item.id == null) continue;
      const key = String(item.id);
      const previous = map.get(key);
      const itemDate = Date.parse(item.updatedAt || item.createdAt || '') || 0;
      const previousDate = previous ? (Date.parse(previous.updatedAt || previous.createdAt || '') || 0) : -1;
      if (!previous || itemDate >= previousDate) map.set(key, item);
    }
    return [...map.values()].sort((a,b) =>
      (Date.parse(b.updatedAt || b.createdAt || '') || 0) -
      (Date.parse(a.updatedAt || a.createdAt || '') || 0));
  }

  function snapshotPayload(state) {
    const source = state || {};
    const radar = source.radar || {};
    return {
      progress: clone(source.progress || {}),
      answeredIds: clone(source.answeredIds || {}),
      simulados: clone(source.simulados || []),
      aiQuestions: clone(source.aiQuestions || []),
      feeds: clone(source.feeds || {}),
      answerLog: clone(source.answerLog || {}),
      answerMeta: clone(source.answerMeta || {}),
      flashcards: clone(source.flashcards || {}),
      dailyPlan: clone(source.dailyPlan || null),
      xp: Number(source.xp || 0),
      xpEvents: clone(source.xpEvents || {}),
      xpReviewRewards: clone(source.xpReviewRewards || {}),
      xpDailyBonuses: clone(source.xpDailyBonuses || {}),
      notes: clone(source.notes || []),
      noteFolders: clone(source.noteFolders || []),
      essays: clone(source.essays || []),
      essayDraft: clone(source.essayDraft || null),
      recordings: (source.recordings || []).filter(item => item?.remoteId && item?.storagePath).map(item => ({
        id: item.id, remoteId: item.remoteId, storagePath: item.storagePath, subjectId: item.subjectId,
        name: item.name, createdAt: item.createdAt, mimeType: item.mimeType, durationMs: item.durationMs,
        size: item.size, isEssayDraft: !!item.isEssayDraft, transcript: item.transcript || '',
        transcribedAt: item.transcribedAt || null, cloudStatus: 'synced'
      })),
      deletedRecordingIds: clone(source.deletedRecordingIds || []),
      simuladoQuota: clone(source.simuladoQuota || {}),
      radar: {
        seenIds: clone(radar.seenIds || []),
        interests: clone(radar.interests || {})
      },
      aiCore: clone(source.aiCore || {})
    };
  }

  function mergeSnapshots(remoteValue, localValue) {
    const remote = remoteValue && typeof remoteValue === 'object' ? remoteValue : {};
    const local = localValue && typeof localValue === 'object' ? localValue : {};
    const merged = { ...remote, ...local };
    merged.progress = {};
    merged.answeredIds = {};
    const subjects = new Set([
      ...Object.keys(remote.progress || {}), ...Object.keys(local.progress || {}),
      ...Object.keys(remote.answeredIds || {}), ...Object.keys(local.answeredIds || {})
    ]);
    for (const subject of subjects) {
      const ids = [...new Set([
        ...(remote.answeredIds?.[subject] || []), ...(local.answeredIds?.[subject] || [])
      ])];
      merged.answeredIds[subject] = ids;
      const rp = remote.progress?.[subject] || {};
      const lp = local.progress?.[subject] || {};
      merged.progress[subject] = {
        answered: Math.max(Number(rp.answered || 0), Number(lp.answered || 0), ids.length),
        correct: Math.max(Number(rp.correct || 0), Number(lp.correct || 0))
      };
    }
    for (const key of ['simulados','aiQuestions','notes','noteFolders','essays']) {
      merged[key] = mergeArray(remote[key], local[key]);
    }
    merged.flashcards = {};
    for (const subject of new Set([
      ...Object.keys(remote.flashcards || {}), ...Object.keys(local.flashcards || {})
    ])) {
      merged.flashcards[subject] = mergeArray(remote.flashcards?.[subject], local.flashcards?.[subject]);
    }
    const deletedRecordingIds = [...new Set([...(remote.deletedRecordingIds || []), ...(local.deletedRecordingIds || [])])];
    merged.deletedRecordingIds = deletedRecordingIds;
    merged.recordings = mergeArray(remote.recordings, local.recordings)
      .filter(item => !deletedRecordingIds.includes(item.remoteId))
      .map(item => ({ ...item, audioId: item.audioId || ('audio-' + item.id) }));
    merged.answerLog = mergeMap(remote.answerLog, local.answerLog);
    merged.answerMeta = mergeMap(remote.answerMeta, local.answerMeta);
    merged.xpEvents = mergeMap(remote.xpEvents, local.xpEvents);
    merged.xpReviewRewards = mergeMap(remote.xpReviewRewards, local.xpReviewRewards);
    merged.xpDailyBonuses = mergeMap(remote.xpDailyBonuses, local.xpDailyBonuses);
    merged.xp = Math.max(Number(remote.xp || 0), Number(local.xp || 0));
    merged.feeds = {};
    for (const subject of new Set([...Object.keys(remote.feeds || {}), ...Object.keys(local.feeds || {})])) {
      const rf = remote.feeds?.[subject] || {};
      const lf = local.feeds?.[subject] || {};
      merged.feeds[subject] = {
        ...rf, ...lf,
        order: [...new Set([...(rf.order || []), ...(lf.order || [])])],
        position: Math.max(Number(rf.position || 0), Number(lf.position || 0))
      };
    }
    const remoteDraftDate = Date.parse(remote.essayDraft?.updatedAt || '') || 0;
    const localDraftDate = Date.parse(local.essayDraft?.updatedAt || '') || 0;
    merged.essayDraft = localDraftDate >= remoteDraftDate ? clone(local.essayDraft || remote.essayDraft || null) : clone(remote.essayDraft);
    const remotePlanDate = String(remote.dailyPlan?.date || '');
    const localPlanDate = String(local.dailyPlan?.date || '');
    merged.dailyPlan = localPlanDate >= remotePlanDate ? clone(local.dailyPlan || remote.dailyPlan || null) : clone(remote.dailyPlan);
    const rq = remote.simuladoQuota || {}; const lq = local.simuladoQuota || {};
    const latestIso = (a,b) => (Date.parse(a || '') || 0) >= (Date.parse(b || '') || 0) ? (a || null) : (b || null);
    merged.simuladoQuota = {
      lastGeneratedAt: latestIso(rq.lastGeneratedAt,lq.lastGeneratedAt),
      nextAllowedAt: latestIso(rq.nextAllowedAt,lq.nextAllowedAt)
    };
    merged.radar = {
      seenIds: [...new Set([...(remote.radar?.seenIds || []), ...(local.radar?.seenIds || [])])],
      interests: mergeMap(remote.radar?.interests, local.radar?.interests)
    };
    merged.aiCore = mergeMap(remote.aiCore, local.aiCore);
    if (remote.aiCore?.reviewStats || local.aiCore?.reviewStats) {
      merged.aiCore.reviewStats = {};
      for (const key of new Set([
        ...Object.keys(remote.aiCore?.reviewStats || {}), ...Object.keys(local.aiCore?.reviewStats || {})
      ])) merged.aiCore.reviewStats[key] = Math.max(
        Number(remote.aiCore?.reviewStats?.[key] || 0), Number(local.aiCore?.reviewStats?.[key] || 0)
      );
    }
    return merged;
  }

  function setRemoteRevision(revision) {
    const store = window.DOCTOR_CORE_RUNTIME?.Store;
    if (!store?.state) return;
    if (!store.state.deviceSession) store.state.deviceSession = {};
    store.state.deviceSession.remoteRevision = Number(revision || 0);
    isSavingLocalSyncMetadata = true;
    try { store.save(); } finally { isSavingLocalSyncMetadata = false; }
  }

  async function processDeletedRecordings() {
    const store = window.DOCTOR_CORE_RUNTIME?.Store;
    const ids = [...new Set(store?.state?.deletedRecordingIds || [])];
    if (!ids.length) return { ok: true, pending: false };
    let pending = false;
    for (const id of ids) {
      try {
        const { data: row, error: readError } = await client.from('recordings')
          .select('storage_path').eq('id', id).maybeSingle();
        if (readError) { pending = true; continue; }
        if (row?.storage_path) {
          const { error: storageError } = await client.storage.from('recordings').remove([row.storage_path]);
          if (storageError) { pending = true; continue; }
          const { error: rowError } = await client.from('recordings').delete().eq('id', id);
          if (rowError) { pending = true; continue; }
        }
        store.state.deletedRecordingIds = (store.state.deletedRecordingIds || []).filter(value => value !== id);
      } catch (_) { pending = true; }
    }
    isSavingLocalSyncMetadata = true;
    try { store.save(); } finally { isSavingLocalSyncMetadata = false; }
    return { ok: !pending, pending };
  }

  async function uploadPendingRecordings() {
    const store = window.DOCTOR_CORE_RUNTIME?.Store;
    const audioDB = window.DOCTOR_CORE_RUNTIME?.AudioDB;
    const recordings = store?.state?.recordings || [];
    if (!recordings.length) return { ok: true, pending: false };
    if (!audioDB) return { ok: false, pending: true };
    let pending = false;
    for (const recording of recordings) {
      if (recording.remoteId && recording.storagePath && recording.cloudStatus === 'synced') continue;
      try {
        const blob = recording.audioId ? await audioDB.get(recording.audioId) : null;
        if (!blob || !blob.size) { pending = true; recording.cloudStatus = 'pending-local-audio'; continue; }
        if (blob.size > 209715200) { pending = true; recording.cloudStatus = 'over-storage-limit'; continue; }
        const remoteId = recording.remoteId || crypto.randomUUID();
        const rawMime = String(blob.type || recording.mimeType || 'audio/webm').toLowerCase();
        const mimeType = rawMime.includes('mpeg') ? 'audio/mpeg'
          : rawMime.includes('mp4') ? 'audio/mp4'
          : rawMime.includes('wav') ? 'audio/wav' : 'audio/webm';
        const extension = mimeType === 'audio/mpeg' ? 'mp3'
          : mimeType === 'audio/mp4' ? 'm4a'
          : mimeType === 'audio/wav' ? 'wav' : 'webm';
        const path = currentUserId + '/' + currentProductId + '/' + remoteId + '.' + extension;
        const { error: uploadError } = await client.storage.from('recordings').upload(path, blob, {
          upsert: true, contentType: mimeType
        });
        if (uploadError) { pending = true; recording.cloudStatus = 'pending-upload'; continue; }
        const { error: rowError } = await client.from('recordings').upsert({
          id: remoteId, user_id: currentUserId, product_id: currentProductId,
          title: String(recording.name || 'Gravação Doctor').slice(0,240),
          storage_path: path, duration_seconds: Math.max(0,Math.round(Number(recording.durationMs || 0)/1000)),
          status: 'active', created_at: recording.createdAt || new Date().toISOString()
        }, { onConflict: 'id' });
        if (rowError) {
          await client.storage.from('recordings').remove([path]);
          pending = true; recording.cloudStatus = 'pending-metadata'; continue;
        }
        recording.remoteId = remoteId;
        recording.storagePath = path;
        recording.cloudStatus = 'synced';
        if (!recording.audioId) recording.audioId = 'audio-' + recording.id;
      } catch (_) {
        pending = true;
        recording.cloudStatus = 'pending-upload';
      }
    }
    isSavingLocalSyncMetadata = true;
    try { store.save(); } finally { isSavingLocalSyncMetadata = false; }
    return { ok: !pending, pending };
  }

  async function syncSnapshot(mutations) {
    if (!navigator.onLine || !client || !currentSessionId || !currentAppId || !currentProductId) {
      return { ok: false, reason: 'session-not-ready' };
    }
    const heartbeat = await window.DOCTOR_PLATFORM_BRIDGE.heartbeat();
    if (!heartbeat.ok) return heartbeat;
    const store = window.DOCTOR_CORE_RUNTIME?.Store;
    if (!store?.state) return { ok: false, reason: 'local-store-not-ready' };
    const deletionResult = await processDeletedRecordings();
    const uploadResult = await uploadPendingRecordings();
    const payload = snapshotPayload(store.state);
    const queue = Array.isArray(mutations) ? mutations : store.state.syncQueue || [];
    const pendingRecordings = deletionResult.pending || uploadResult.pending ||
      queue.some(item => item?.entity === 'recording' && (store.state.recordings || []).some(rec => !rec.storagePath || rec.cloudStatus !== 'synced'));
    let expectedRevision = Number(store.state.deviceSession?.remoteRevision || 0);
    let payloadJson = stableStringify(payload);
    if (lastSnapshotJSON === payloadJson) {
      return { ok: true, unchanged: true, revision: expectedRevision,
        unsupportedEntities: pendingRecordings ? ['recording'] : [] };
    }

    for (let attempt = 0; attempt < 2; attempt++) {
      const { data, error } = await client.rpc('save_app_snapshot_v1', {
        p_app_id: currentAppId,
        p_product_id: currentProductId,
        p_session_id: currentSessionId,
        p_expected_revision: expectedRevision,
        p_payload: payload,
        p_client_version: String(config.version || '')
      });
      if (error) {
        const message = String(error.message || '').toLowerCase();
        if (message.includes('active device session required')) loseSession();
        return { ok: false, reason: 'snapshot-save-failed', error: error.message };
      }
      const response = Array.isArray(data) ? data[0] : data;
      if (response?.ok === true) {
        expectedRevision = Number(response.revision || expectedRevision + 1);
        lastSnapshotJSON = payloadJson;
        setRemoteRevision(expectedRevision);
        return { ok: true, revision: expectedRevision,
          unsupportedEntities: pendingRecordings ? ['recording'] : [] };
      }
      if (response?.reason !== 'revision-conflict' || attempt > 0) {
        return { ok: false, reason: response?.reason || 'snapshot-rejected' };
      }
      const merged = mergeSnapshots(response.payload || {}, payload);
      store.state = { ...store.state, ...merged };
      isSavingLocalSyncMetadata = true;
      try { store.save(); } finally { isSavingLocalSyncMetadata = false; }
      expectedRevision = Number(response.revision || 0);
      payloadJson = stableStringify(snapshotPayload(store.state));
    }
    return { ok: false, reason: 'revision-conflict' };
  }

  async function restoreSnapshot() {
    const store = window.DOCTOR_CORE_RUNTIME?.Store;
    if (!store) return { ok: false, reason: 'local-store-not-ready' };
    store.load();
    const { data, error } = await client.rpc('get_app_snapshot_v1', {
      p_app_id: currentAppId,
      p_product_id: currentProductId,
      p_session_id: currentSessionId
    });
    if (error) return { ok: false, reason: 'snapshot-load-failed', error: error.message };
    const row = Array.isArray(data) ? data[0] : data;
    const remote = row?.payload && typeof row.payload === 'object' ? row.payload : {};
    const revision = Number(row?.revision || 0);
    const local = snapshotPayload(store.state);
    const merged = mergeSnapshots(remote, local);
    store.state = { ...store.state, ...merged };
    if (!store.state.deviceSession) store.state.deviceSession = {};
    store.state.deviceSession.remoteRevision = revision;
    isSavingLocalSyncMetadata = true;
    try { store.save(); } finally { isSavingLocalSyncMetadata = false; }
    lastSnapshotJSON = stableStringify(remote);
    if (revision === 0 || stableStringify(merged) !== lastSnapshotJSON) {
      return syncSnapshot(store.state.syncQueue || []);
    }
    installAutoSync();
    return { ok: true, revision };
  }

  function scheduleAutoSync() {
    if (!navigator.onLine || !currentSessionId || !client) return;
    if (autoSyncTimer) clearTimeout(autoSyncTimer);
    autoSyncTimer = setTimeout(() => {
      autoSyncTimer = null;
      syncSnapshot(window.DOCTOR_CORE_RUNTIME?.Store?.state?.syncQueue || []).catch(() => {});
    }, 4500);
  }

  function installAutoSync() {
    const store = window.DOCTOR_CORE_RUNTIME?.Store;
    if (!store || store.__doctorAutoSyncInstalled) return;
    const originalSave = store.save.bind(store);
    store.save = function () {
      const result = originalSave();
      if (!isSavingLocalSyncMetadata) scheduleAutoSync();
      return result;
    };
    store.__doctorAutoSyncInstalled = true;
    if (audioDB && !audioDB.__doctorCloudFallbackInstalled) {
      const originalGet = audioDB.get.bind(audioDB);
      audioDB.get = async function (id) {
        const localBlob = await originalGet(id);
        if (localBlob) return localBlob;
        if (!client || !navigator.onLine) return null;
        const recording = (store.state.recordings || []).find(item => item.audioId === id || ('audio-' + item.id) === id);
        if (!recording?.storagePath) return null;
        const { data, error } = await client.storage.from('recordings').download(recording.storagePath);
        if (error || !data) return null;
        await audioDB.put(id, data);
        return data;
      };
      audioDB.__doctorCloudFallbackInstalled = true;
    }
  }

  function messageFor(reason) {
    const messages = {
      'not-authenticated': 'Entre com a mesma conta que você utiliza no Doctor Concursos.',
      'session-invalid': 'Sua sessão expirou. Entre novamente para validar o acesso.',
      'access-required': 'Esta conta ainda não possui acesso ativo a este aplicativo. Acesse o Doctor Concursos para contratar ou verificar sua assinatura.',
      'access-not-confirmed': 'Não foi possível confirmar seu acesso. Atualize a página ou entre novamente.',
      'app-not-available': 'Este aplicativo ainda está em preparação para publicação. A equipe está concluindo a homologação.',
      'app-not-published': 'Este aplicativo ainda não foi publicado no catálogo Doctor Concursos.',
      'offline-no-valid-access': 'Para abrir este aplicativo sem internet, primeiro é necessário validar seu acesso quando estiver conectado.',
      'session-revoked': 'Sua sessão foi transferida para outro dispositivo. Seus estudos locais foram preservados; entre novamente para continuar.',
      'app_catalog_link_missing': 'O vínculo deste aplicativo no catálogo central ainda não foi configurado.',
      'central_auth_not_configured': 'A autenticação central ainda não foi configurada neste aplicativo.'
    };
    return messages[reason] || 'Não foi possível validar o acesso agora. Verifique sua conexão e tente novamente.';
  }

  function renderGate(result, onAuthorized) {
    if (gateElement?.isConnected) {
      const status = gateElement.querySelector('[data-doctor-gate-message]');
      if (status) status.textContent = messageFor(result?.reason);
      return gateElement;
    }
    const overlay = document.createElement('div');
    overlay.id = 'doctor-platform-access-gate';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:20000;display:flex;align-items:center;justify-content:center;padding:20px;background:linear-gradient(155deg,#071322,#16345e);color:#fff;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;';
    overlay.innerHTML = `
      <section style="width:min(100%,440px);padding:26px;border:1px solid rgba(255,255,255,.16);border-radius:20px;background:rgba(7,19,34,.96);box-shadow:0 20px 70px rgba(0,0,0,.38)">
        <div style="font-size:11px;font-weight:800;letter-spacing:.16em;color:#f5c400">DOCTOR CONCURSOS · ACESSO SEGURO</div>
        <h1 style="margin:12px 0 8px;font-size:25px;line-height:1.2">Acesse seu aplicativo</h1>
        <p style="margin:0 0 18px;color:#c6d3e3;font-size:14px;line-height:1.5" data-doctor-gate-message></p>
        <form data-doctor-gate-form>
          <label style="display:block;margin:12px 0 6px;font-size:12px;font-weight:700" for="doctor-gate-email">E-mail da sua conta</label>
          <input id="doctor-gate-email" name="email" type="email" autocomplete="username" required style="width:100%;padding:13px;border:1px solid #526783;border-radius:10px;background:#fff;color:#071322;font:inherit">
          <label style="display:block;margin:12px 0 6px;font-size:12px;font-weight:700" for="doctor-gate-password">Senha</label>
          <input id="doctor-gate-password" name="password" type="password" autocomplete="current-password" required style="width:100%;padding:13px;border:1px solid #526783;border-radius:10px;background:#fff;color:#071322;font:inherit">
          <button type="submit" style="width:100%;margin-top:18px;padding:14px;border:0;border-radius:10px;background:#f5c400;color:#071322;font-weight:900;font-size:14px">ENTRAR E VALIDAR ACESSO</button>
        </form>
        <p data-doctor-gate-error role="status" style="min-height:20px;margin:12px 0;color:#ffd27a;font-size:12px"></p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:12px">
          <a href="https://www.doctorconcursos.com.br/" target="_blank" rel="noopener noreferrer" style="color:#9cc8ff">Criar conta / contratar acesso</a>
          <a href="https://www.doctorconcursos.com.br/" target="_blank" rel="noopener noreferrer" style="color:#9cc8ff">Recuperar senha</a>
        </div>
        <p style="margin:18px 0 0;color:#8296b0;font-size:11px;line-height:1.45">Seus dados de estudo permanecem neste dispositivo. A sincronização só será considerada concluída após confirmação do servidor.</p>
      </section>`;
    document.body.appendChild(overlay);
    gateElement = overlay;
    const status = overlay.querySelector('[data-doctor-gate-message]');
    if (status) status.textContent = messageFor(result?.reason);

    const form = overlay.querySelector('[data-doctor-gate-form]');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const errorBox = overlay.querySelector('[data-doctor-gate-error]');
      button.disabled = true;
      button.textContent = 'VALIDANDO...';
      errorBox.textContent = '';
      try {
        const db = await getClient();
        const email = String(form.elements.email.value || '').trim();
        const password = String(form.elements.password.value || '');
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const verified = await claimCurrentSession();
        if (!verified.ok) {
          status.textContent = messageFor(verified.reason);
          await db.auth.signOut();
          return;
        }
        overlay.remove();
        gateElement = null;
        if (typeof onAuthorized === 'function') onAuthorized();
      } catch (error) {
        errorBox.textContent = String(error?.message || 'Não foi possível autenticar. Confira os dados e tente novamente.');
      } finally {
        button.disabled = false;
        button.textContent = 'ENTRAR E VALIDAR ACESSO';
      }
    });

    if (!navigator.onLine) {
      form.querySelectorAll('input,button').forEach(el => { el.disabled = true; });
      overlay.querySelector('[data-doctor-gate-error]').textContent = 'Sem conexão. Conecte-se à internet para validar a conta pela primeira vez.';
    }
    return overlay;
  }

  async function bootstrap() {
    if (!platformConfig.bridgeEnabled) return { ok: true, disabled: true };
    if (!navigator.onLine) {
      const lease = validOfflineLease();
      if (!lease) return { ok: false, reason: 'offline-no-valid-access' };
      currentUserId = lease.userId;
      currentAppId = lease.appId;
      currentProductId = lease.productId;
      currentSessionId = lease.sessionId;
      currentLease = lease;
      return { ok: true, offline: true };
    }
    try {
      const store = window.DOCTOR_CORE_RUNTIME?.Store;
      if (store && !store.state) store.load();
      const result = await claimCurrentSession();
      if (result.ok && !result.offline) {
        const syncResult = await restoreSnapshot();
        installAutoSync();
        if (!syncResult.ok) {
          const detail = String(syncResult.error || '').toLowerCase();
          if (detail.includes('active device session required') || detail.includes('active app access required')) {
            return { ok: false, reason: 'session-revoked' };
          }
          return { ...result, syncWarning: syncResult.reason || 'snapshot-load-failed' };
        }
      }
      return result;
    } catch (error) {
      return { ok: false, reason: error?.message === 'app_catalog_link_missing' ? 'app_catalog_link_missing' : 'validation-error', error };
    }
  }

  window.DOCTOR_PLATFORM_BRIDGE = {
    get userId() { return currentUserId; },
    get sessionId() { return currentSessionId; },
    get sessionActive() { return !!currentSessionId; },
    syncEnabled: true,
    async claimDeviceSession() { return claimCurrentSession(); },
    async heartbeat() {
      if (!navigator.onLine || !client || !currentSessionId || !currentAppId) return { ok: false, reason: 'offline' };
      const { data, error } = await client.rpc('heartbeat_device_session_v1', {
        p_session_id: currentSessionId, p_app_id: currentAppId
      });
      if (error) throw error;
      if (data !== true) { loseSession(); return { ok: false, reason: 'session-revoked' }; }
      return { ok: true };
    },
    async revalidate() { return bootstrap(); },
    async sync(args) { return syncSnapshot(args?.mutations || []); },
    async signOut() {
      const db = await getClient();
      await db.auth.signOut();
      try { localStorage.removeItem(storageKey()); } catch (_) {}
      currentUserId = currentAppId = currentProductId = currentSessionId = null;
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = null;
      window.location.reload();
    },
    bootstrap,
    renderGate
  };

  window.addEventListener('online', () => {
    if (!platformConfig.bridgeEnabled) return;
    bootstrap().then(result => {
      if (!result.ok) renderGate(result, () => window.location.reload());
    }).catch(() => {});
  });
})();