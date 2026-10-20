# Doctor Core — auditoria e mudanças V1.12.6

## Mudanças desta entrega
- Home reorganizada: Ferramentas Doctor aparece antes de Evolução do seu Doctor.
- O cartão Radar da Home foi substituído por Scanner Doctor, com ícone de câmera.
- Scanner Doctor permite capturar/selecionar imagem, pré-visualizar, salvar em IndexedDB, listar, baixar e excluir documentos localmente.
- O Scanner informa explicitamente que os arquivos ficam no dispositivo e não são enviados automaticamente para a nuvem.
- Versão/cache alinhados para 1.12.6 nos arquivos de runtime, manifest, service worker e version.json.
- Banner de concurso recebe fundo de contingência quando a imagem externa falha; a imagem oficial não é substituída por uma imagem inventada.
- Auditoria de assets: os PNGs `assets/doctor/evolution/doctor-level-01.png` até `doctor-level-10.png` não existem no branch `main`/branch auditado; o fallback SVG existe e é usado pelo runtime quando o PNG não carrega. Recuperar os dez assets oficiais reais do pacote histórico antes de considerar a evolução visualmente homologada.

## Limites e pendências de homologação
- A câmera depende de suporte/permissões do navegador e normalmente funciona em contexto HTTPS; validar em Android e desktop.
- IndexedDB é armazenamento local do navegador/dispositivo: limpar dados do app ou trocar de dispositivo pode apagar/inacessar os documentos. Ainda não há sincronização em nuvem para o Scanner.
- O scanner desta etapa registra fotos/documentos como imagens; não faz OCR nem correção automática de perspectiva.
- Antes de produção em massa continuam obrigatórios: revisão editorial independente do banco de questões, simulado com distribuição oficial 10/3/2/25, integração de Product Context oficial, catálogo/fontes do Radar central, bridge/sync/device, pagamentos/entitlements e E2E real em desktop/mobile.
- Não foram alterados schema, RLS, RPC, dados comerciais ou configuração de produção do Supabase.
