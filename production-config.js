/* Doctor Core — configuração pública e segura de produção.
 * Nunca coloque segredos neste arquivo. Valores sensíveis devem ficar no Vercel.
 * Este arquivo existe para manter o contrato de integração estável enquanto
 * Supabase, pagamentos e a Plataforma Principal são conectados.
 */
window.DOCTOR_PRODUCTION_CONFIG = Object.freeze({
  version: '1.11.0',
  environment: 'production',
  integrations: {
    supabase: {
      enabled: true,
      url: 'https://rouuppeosmizzqnubhgs.supabase.co',
      publishableKey: 'sb_publishable_nm9slmAVYcgzoXs-m1gLuw_8K317SbN'
    },
    payments: {
      enabled: false,
      provider: 'asaas',
      checkoutUrl: ''
    },
    platform: {
      bridgeEnabled: false
    }
  }
});
