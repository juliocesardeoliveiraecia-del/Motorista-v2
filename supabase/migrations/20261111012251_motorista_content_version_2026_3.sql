-- Registra a revisão 2026.3, que redistribui a posição das alternativas
-- sem alterar o conteúdo correto, as explicações ou a identidade das questões.
BEGIN;
UPDATE public.product_context_versions pv
SET source_snapshot=jsonb_set(coalesce(pv.source_snapshot,'{}'::jsonb),'{contentVersion}','"2026.3"'::jsonb,true)
FROM public.product_contexts pc
WHERE pv.product_context_id=pc.id
AND pc.product_id='003a9301-9294-480c-9ebf-03055566d77f'
AND pv.version_number=1;

UPDATE public.question_traceability
SET metadata=jsonb_set(coalesce(metadata,'{}'::jsonb),'{contentVersion}','"2026.3"'::jsonb,true)
WHERE product_id='003a9301-9294-480c-9ebf-03055566d77f'
AND metadata ? 'questionId';
COMMIT;