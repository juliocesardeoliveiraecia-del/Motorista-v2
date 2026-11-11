-- Alinha a versão declarada no contexto e no registro central ao pacote auditado 2026.2.
-- Atualização apenas de metadados; não altera questões, respostas ou progresso.
BEGIN;
UPDATE public.product_context_versions pv
SET source_snapshot=jsonb_set(coalesce(pv.source_snapshot,'{}'::jsonb),'{contentVersion}','"2026.2"'::jsonb,true)
FROM public.product_contexts pc
WHERE pv.product_context_id=pc.id
AND pc.product_id='003a9301-9294-480c-9ebf-03055566d77f'
AND pv.version_number=1;

UPDATE public.question_traceability
SET metadata=jsonb_set(coalesce(metadata,'{}'::jsonb),'{contentVersion}','"2026.2"'::jsonb,true)
WHERE product_id='003a9301-9294-480c-9ebf-03055566d77f'
AND metadata ? 'questionId';
COMMIT;