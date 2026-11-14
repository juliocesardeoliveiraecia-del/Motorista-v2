create or replace function public.auto_publish_legal_document_version(
  p_version_id uuid,
  p_expected_sha256 text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v public.legal_document_versions%rowtype;
  previous_id uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Internal service role required';
  end if;
  select * into v from public.legal_document_versions where id = p_version_id for update;
  if not found then raise exception 'Legal version not found'; end if;
  if v.status not in ('candidate','approved') then raise exception 'Only unpublished candidate versions can be auto-published'; end if;
  if v.content_sha256 is null or v.content_sha256 <> p_expected_sha256 or v.storage_path is null
     or coalesce(v.change_summary->>'automatic_publication_eligible','false') <> 'true'
     or coalesce(v.change_summary->>'integrity_verified','false') <> 'true'
     or coalesce(v.change_summary->>'official_source_verified','false') <> 'true' then
    raise exception 'Automatic publication integrity gate failed';
  end if;
  select current_version_id into previous_id from public.legal_documents
  where document_id = v.document_id and is_active = true for update;
  if not found then raise exception 'Active legal document not found'; end if;
  if previous_id is not null and previous_id <> v.id then
    update public.legal_document_versions set status = 'superseded'
    where id = previous_id and status = 'published';
  end if;
  update public.legal_document_versions set status = 'published', published_at = now(),
    reviewed_by = 'system:official-source-monitor', reviewed_at = now(),
    change_summary = change_summary || jsonb_build_object(
      'publication_mode','automatic_official_source','published_by','system:official-source-monitor',
      'automatic_publication_at',now())
  where id = v.id;
  update public.legal_documents set current_version_id = v.id, updated_at = now()
  where document_id = v.document_id;
  insert into public.legal_change_events(document_id,version_id,event_type,severity,details)
  values(v.document_id,v.id,'published','info',
    jsonb_build_object('publication_mode','automatic_official_source','sha256',v.content_sha256));
  return jsonb_build_object('document_id',v.document_id,'version_id',v.id,'status','published','previous_version_id',previous_id);
end;
$$;
revoke all on function public.auto_publish_legal_document_version(uuid,text) from public, anon, authenticated;
grant execute on function public.auto_publish_legal_document_version(uuid,text) to service_role;

insert into public.legal_documents
(document_id,slug,official_title,display_title,category,jurisdiction,authority,official_source_url,priority,is_active)
values ('BR-CPC-2015','codigo-de-processo-civil','Lei nº 13.105, de 16 de março de 2015',
'Código de Processo Civil (CPC)','civil_law','BR','Presidência da República — Planalto',
'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm','P1',true)
on conflict (document_id) do update set slug=excluded.slug,official_title=excluded.official_title,
display_title=excluded.display_title,category=excluded.category,authority=excluded.authority,
official_source_url=excluded.official_source_url,priority=excluded.priority,is_active=true,updated_at=now();
