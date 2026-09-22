# Doctor Core — Motorista Legislativo

Versão de produção recuperada do deployment ativo do Vercel e preparada para o fluxo **GitHub → Vercel**.

## Estado desta versão

- Versão do aplicativo: **V1.10.11**
- Concurso: Câmara Municipal de Ipameri/GO
- Cargo: Agente Legislativo — Motorista Legislativo
- Banca: Instituto Verbena / UFG
- Edital: nº 02/2026
- PWA/offline: mantido
- Radar Doctor: busca manual, proteção contra 429/cota, busca web obrigatória e parser tolerante aos formatos de resposta do Compound
- GROQ: mantida como provedora de IA; nenhuma chave é gravada no repositório
- Supabase: contrato de integração preparado, ainda desligado
- Pagamentos: contrato de integração preparado para Mercado Pago, ainda desligado
- Plataforma principal: bridge preparada sem alterar o contrato do Main/Supabase

## Fonte

O deployment de produção existente no Vercel foi identificado como um deployment do tipo **Drop**. O HTML publicado foi recuperado diretamente do deployment e versionado nesta branch antes de qualquer alteração estrutural.

## Fluxo de publicação

1. Alterações entram nesta branch.
2. Validar o build/preview.
3. Merge para `main`.
4. Vercel fica conectado ao GitHub e cria o deployment automaticamente.
5. Produção só recebe o código que estiver em `main`.

## Segredos

Não colocar GROQ API Key, Supabase service role key, Mercado Pago access token ou qualquer outro segredo neste repositório. Segredos pertencem às Environment Variables do Vercel.

## Integrações

O arquivo `production-config.js` contém apenas configuração pública e flags. A conexão real deve ser ativada depois de confirmar os contratos da Plataforma Principal.

### Supabase

Planejado para:
- autenticação/entitlement vindo da Plataforma;
- sincronização do progresso;
- sessão de dispositivo único;
- fila offline com timestamps/conflitos;
- nenhuma migração/RLS/RPC nova será inventada no Core.

### Mercado Pago

Planejado para:
- checkout na Plataforma principal;
- confirmação de pagamento no backend/Plataforma;
- geração de entitlement;
- Core apenas consome o entitlement e não recebe credenciais privadas do Mercado Pago.

## Regra do Radar

O Radar deste app deve:
- priorizar o concurso atual;
- usar busca web real;
- priorizar Instituto Verbena/UFG e Câmara de Ipameri;
- nunca fabricar notícia;
- não substituir notícia do concurso por notícias genéricas;
- divulgar outros apps Doctor somente a partir do catálogo ativo da Plataforma;
- respeitar proteção de quota e cooldown.

## Próximo passo

Conectar este repositório ao projeto Vercel existente **doctor-core-v1-motorista-legislativo**, mantendo o deployment atual como rollback até a validação do preview.
