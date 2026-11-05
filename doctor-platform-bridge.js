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

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  function deviceId() {
    const coreDeviceId = window.DOCTOR_CORE_RUNTIME?.Store?.state?.deviceSession?.id;
    if (coreDeviceId) return String(coreDeviceId);
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
      const result = await claimCurrentSession();
      return result;
    } catch (error) {
      return { ok: false, reason: error?.message === 'app_catalog_link_missing' ? 'app_catalog_link_missing' : 'validation-error', error };
    }
  }

  window.DOCTOR_PLATFORM_BRIDGE = {
    get userId() { return currentUserId; },
    get sessionId() { return currentSessionId; },
    get sessionActive() { return !!currentSessionId; },
    syncEnabled: false,
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
    async sync() { return { ok: false, reason: 'sync-not-enabled' }; },
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