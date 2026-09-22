/* Doctor Core — configuração pública e segura de produção.
 * Nunca coloque segredos neste arquivo. Valores sensíveis devem ficar no Vercel.
 * Este arquivo existe para manter o contrato de integração estável enquanto
 * Supabase, pagamentos e a Plataforma Principal são conectados.
 */
window.DOCTOR_PRODUCTION_CONFIG = Object.freeze({
  version: '1.10.11',
  environment: 'production',
  integrations: {
    supabase: {
      enabled: false,
      url: '',
      anonKey: ''
    },
    payments: {
      enabled: false,
      provider: 'mercado-pago',
      checkoutUrl: ''
    },
    platform: {
      bridgeEnabled: false
    }
  }
});
