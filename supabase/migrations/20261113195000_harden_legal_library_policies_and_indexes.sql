-- Doctor Concursos legal library hardening: safe function path, one read policy, FK indexes.
alter function public.prevent_published_legal_version_mutation()
  set search_path = public, pg_temp;

drop policy if exists "Admins can read all legal versions"
  on public.legal_document_versions;
drop policy if exists "Authenticated users can read published legal versions"
  on public.legal_document_versions;

create policy "Authenticated users read published versions or admins read all"
  on public.legal_document_versions
  for select to authenticated
  using (status = 'published' or public.is_admin());

create index if not exists legal_events_run_id_idx
  on public.legal_change_events(run_id)
  where run_id is not null;

create index if not exists legal_events_version_id_idx
  on public.legal_change_events(version_id)
  where version_id is not null;

create index if not exists legal_documents_current_version_fk_idx
  on public.legal_documents(document_id, current_version_id)
  where current_version_id is not null;
