-- Doctor Concursos shared legal library: central metadata, immutable versions and offline-ready storage.
-- CI validates this complete migration in an isolated PostgreSQL WASM instance; production is not touched.
-- This migration is additive. It does not alter auth, payments, GROQ, student progress or existing buckets.

begin;

create table if not exists public.legal_documents (
  document_id text primary key,
  slug text not null unique,
  official_title text not null,
  display_title text not null,
  category text not null,
  jurisdiction text not null default 'BR',
  authority text not null,
  official_source_url text not null,
  priority text not null default 'P2' check (priority in ('P0','P1','P2','P3')),
  is_active boolean not null default true,
  current_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id text not null references public.legal_documents(document_id) on delete restrict,
  version_label text not null,
  source_url text not null,
  source_retrieved_at timestamptz,
  source_published_at timestamptz,
  effective_from date,
  effective_until date,
  source_etag text,
  source_last_modified text,
  content_sha256 text,
  storage_path text,
  content_format text not null default 'text/markdown',
  status text not null default 'candidate'
    check (status in ('candidate','in_review','approved','published','superseded','rejected','failed')),
  change_summary jsonb not null default '{}'::jsonb,
  reviewed_by text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique(document_id, version_label),
  unique(document_id, id),
  unique(storage_path),
  check (content_sha256 is null or content_sha256 ~ '^[a-f0-9]{64}$')
);

alter table public.legal_documents
  drop constraint if exists legal_documents_current_version_fk;
alter table public.legal_documents
  add constraint legal_documents_current_version_fk
  foreign key (document_id, current_version_id)
  references public.legal_document_versions(document_id, id)
  on delete restrict;

-- A published version is immutable: corrections create a new version instead of rewriting history.
create or replace function public.prevent_published_legal_version_mutation()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    if old.status in ('published','superseded') then
      raise exception 'Published legal versions cannot be deleted; create a new version instead';
    end if;
    return old;
  end if;

  if old.status in ('published','superseded') and new.status not in ('published','superseded') then
    raise exception 'Published legal versions can only remain published or become superseded';
  end if;

  if old.status in ('published','superseded') and (
    new.document_id is distinct from old.document_id or
    new.version_label is distinct from old.version_label or
    new.source_url is distinct from old.source_url or
    new.source_retrieved_at is distinct from old.source_retrieved_at or
    new.source_published_at is distinct from old.source_published_at or
    new.effective_from is distinct from old.effective_from or
    new.effective_until is distinct from old.effective_until or
    new.source_etag is distinct from old.source_etag or
    new.source_last_modified is distinct from old.source_last_modified or
    new.content_sha256 is distinct from old.content_sha256 or
    new.storage_path is distinct from old.storage_path or
    new.content_format is distinct from old.content_format or
    new.change_summary is distinct from old.change_summary or
    new.published_at is distinct from old.published_at
  ) then
    raise exception 'Published legal version content and provenance are immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists legal_versions_immutable_guard on public.legal_document_versions;
create trigger legal_versions_immutable_guard
  before update or delete on public.legal_document_versions
  for each row execute function public.prevent_published_legal_version_mutation();

create table if not exists public.legal_update_runs (
  id uuid primary key default gen_random_uuid(),
  trigger_type text not null check (trigger_type in ('scheduled_daily','scheduled_weekly','manual','retry')),
  status text not null default 'running' check (status in ('running','completed','completed_with_errors','failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  documents_checked integer not null default 0,
  changes_detected integer not null default 0,
  candidates_created integer not null default 0,
  errors jsonb not null default '[]'::jsonb,
  summary jsonb not null default '{}'::jsonb
);

create table if not exists public.legal_change_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.legal_update_runs(id) on delete set null,
  document_id text not null references public.legal_documents(document_id) on delete restrict,
  version_id uuid references public.legal_document_versions(id) on delete set null,
  event_type text not null check (event_type in ('source_changed','candidate_created','review_requested','approved','published','source_unavailable','capture_failed')),
  severity text not null default 'info' check (severity in ('info','low','medium','high','critical')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists legal_versions_document_status_idx
  on public.legal_document_versions(document_id, status, created_at desc);
create index if not exists legal_events_document_created_idx
  on public.legal_change_events(document_id, created_at desc);
create index if not exists legal_runs_started_idx
  on public.legal_update_runs(started_at desc);

alter table public.legal_documents enable row level security;
alter table public.legal_document_versions enable row level security;
alter table public.legal_update_runs enable row level security;
alter table public.legal_change_events enable row level security;

drop policy if exists "Authenticated users can read active legal documents" on public.legal_documents;
create policy "Authenticated users can read active legal documents"
  on public.legal_documents for select to authenticated
  using (is_active);

drop policy if exists "Authenticated users can read published legal versions" on public.legal_document_versions;
create policy "Authenticated users can read published legal versions"
  on public.legal_document_versions for select to authenticated
  using (status = 'published');

-- Operational runs and editorial events are server-side only.
revoke all on public.legal_update_runs, public.legal_change_events from anon, authenticated;

-- Editorial access is restricted to the existing Doctor master-admin permission.
drop policy if exists "Admins can read all legal versions" on public.legal_document_versions;
create policy "Admins can read all legal versions"
  on public.legal_document_versions for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update legal documents" on public.legal_documents;
create policy "Admins can update legal documents"
  on public.legal_documents for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can update legal versions" on public.legal_document_versions;
create policy "Admins can update legal versions"
  on public.legal_document_versions for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can read legal update runs" on public.legal_update_runs;
create policy "Admins can read legal update runs"
  on public.legal_update_runs for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read legal change events" on public.legal_change_events;
create policy "Admins can read legal change events"
  on public.legal_change_events for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert legal change events" on public.legal_change_events;
create policy "Admins can insert legal change events"
  on public.legal_change_events for insert to authenticated
  with check (public.is_admin());

grant update on public.legal_documents, public.legal_document_versions to authenticated;
grant select on public.legal_update_runs, public.legal_change_events to authenticated;
grant insert on public.legal_change_events to authenticated;

-- Publication is atomic: the previous active version is superseded and the new
-- approved version becomes current in the same database transaction.
create or replace function public.publish_legal_document_version(
  p_version_id uuid,
  p_review_note text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  selected_version public.legal_document_versions%rowtype;
  previous_version_id uuid;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Doctor administrator permission required';
  end if;

  select * into selected_version
  from public.legal_document_versions
  where id = p_version_id
  for update;

  if not found then
    raise exception 'Legal version not found';
  end if;
  if selected_version.status <> 'approved' then
    raise exception 'Only an approved legal version can be published';
  end if;
  if selected_version.storage_path is null or selected_version.content_sha256 is null then
    raise exception 'Legal version is missing its verified content package';
  end if;

  select current_version_id into previous_version_id
  from public.legal_documents
  where document_id = selected_version.document_id and is_active = true
  for update;

  if not found then
    raise exception 'Active legal document not found';
  end if;

  if previous_version_id is not null and previous_version_id <> selected_version.id then
    update public.legal_document_versions
    set status = 'superseded'
    where id = previous_version_id and status = 'published';
  end if;

  update public.legal_document_versions
  set status = 'published',
      published_at = now(),
      reviewed_by = coalesce(reviewed_by, auth.uid()::text),
      reviewed_at = coalesce(reviewed_at, now()),
      change_summary = change_summary || jsonb_build_object(
        'publication_review_note', left(coalesce(p_review_note, ''), 2000),
        'published_by', auth.uid()::text
      )
  where id = selected_version.id;

  update public.legal_documents
  set current_version_id = selected_version.id,
      updated_at = now()
  where document_id = selected_version.document_id;

  insert into public.legal_change_events
    (document_id, version_id, event_type, severity, details)
  values
    (selected_version.document_id, selected_version.id, 'published', 'info',
     jsonb_build_object('published_by', auth.uid()::text, 'review_note', left(coalesce(p_review_note, ''), 2000)));

  return jsonb_build_object(
    'document_id', selected_version.document_id,
    'version_id', selected_version.id,
    'status', 'published',
    'previous_version_id', previous_version_id
  );
end;
$$;

revoke all on function public.publish_legal_document_version(uuid, text) from public, anon;
grant execute on function public.publish_legal_document_version(uuid, text) to authenticated;

revoke insert, update, delete on public.legal_documents, public.legal_document_versions from anon, authenticated;
grant select on public.legal_documents, public.legal_document_versions to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('legal-library', 'legal-library', false, 52428800,
  array['text/plain','text/markdown','application/pdf','application/json']::text[])
on conflict (id) do update set
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated users can read published legal files" on storage.objects;
create policy "Authenticated users can read published legal files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'legal-library'
    and exists (
      select 1
      from public.legal_document_versions v
      where v.storage_path = storage.objects.name
        and v.status = 'published'
    )
  );

-- Only trusted server-side service-role operations may write legal files.
drop policy if exists "Service role manages legal library files" on storage.objects;
create policy "Service role manages legal library files"
  on storage.objects for all to service_role
  using (bucket_id = 'legal-library')
  with check (bucket_id = 'legal-library');

insert into public.legal_documents
(document_id, slug, official_title, display_title, category, jurisdiction, authority, official_source_url, priority)
values
('BR-CF-1988','constituicao-federal','Constituição da República Federativa do Brasil de 1988','Constituição Federal','constitutional_law','BR','Câmara dos Deputados','https://www2.camara.leg.br/a-camara/atividade-legislativa/legislacao/constituicao1988','P0'),
('BR-ADCT-1988','adct','Ato das Disposições Constitucionais Transitórias','ADCT','constitutional_law','BR','Câmara dos Deputados','https://www2.camara.leg.br/a-camara/atividade-legislativa/legislacao/constituicao1988','P0'),
('INT-UDHR-1948-PT','declaracao-universal-direitos-humanos','Declaração Universal dos Direitos Humanos','Declaração Universal dos Direitos Humanos','human_rights','INTERNATIONAL','Nações Unidas no Brasil','https://brasil.un.org/pt-br/66717-declaracao-universal-dos-direitos-humanos','P1'),
('BR-CTB-1997','codigo-transito-brasileiro','Lei nº 9.503, de 23 de setembro de 1997','Código de Trânsito Brasileiro','traffic_law','BR','Presidência da República — Planalto','https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm','P0'),
('BR-CP-1940','codigo-penal','Decreto-Lei nº 2.848, de 7 de dezembro de 1940','Código Penal','criminal_law','BR','Presidência da República — Planalto','https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm','P1'),
('BR-CPP-1941','codigo-processo-penal','Decreto-Lei nº 3.689, de 3 de outubro de 1941','Código de Processo Penal','criminal_procedure','BR','Presidência da República — Planalto','https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689.htm','P1'),
('BR-LEP-1984','lei-execucao-penal','Lei nº 7.210, de 11 de julho de 1984','Lei de Execução Penal','criminal_law','BR','Presidência da República — Planalto','https://www.planalto.gov.br/ccivil_03/leis/l7210.htm','P1'),
('BR-ECA-1990','estatuto-crianca-adolescente','Lei nº 8.069, de 13 de julho de 1990','Estatuto da Criança e do Adolescente','special_legislation','BR','Presidência da República — Planalto','https://www.planalto.gov.br/ccivil_03/leis/l8069compilado.htm','P1'),
('BR-CC-2002','codigo-civil','Lei nº 10.406, de 10 de janeiro de 2002','Código Civil','civil_law','BR','Presidência da República — Planalto','https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm','P2'),
('BR-CDC-1990','codigo-defesa-consumidor','Lei nº 8.078, de 11 de setembro de 1990','Código de Defesa do Consumidor','special_legislation','BR','Presidência da República — Planalto','https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm','P2'),
('BR-LMP-2006','lei-maria-penha','Lei nº 11.340, de 7 de agosto de 2006','Lei Maria da Penha','special_legislation','BR','Presidência da República — Planalto','https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm','P2'),
('BR-ESTATUTO-IDOSO-2003','estatuto-pessoa-idosa','Lei nº 10.741, de 1º de outubro de 2003','Estatuto da Pessoa Idosa','special_legislation','BR','Presidência da República — Planalto','https://www.planalto.gov.br/ccivil_03/leis/2003/l10.741.htm','P2'),
('INT-MANDELA-2015-PT','regras-de-mandela','Regras Mínimas das Nações Unidas para o Tratamento de Presos (Regras de Mandela)','Regras de Mandela','human_rights','INTERNATIONAL','Nações Unidas / UNODC','https://www.unodc.org/documents/justice-and-prison-reform/Nelson_Mandela_Rules-P-ebook.pdf','P1')
on conflict (document_id) do update set
  slug=excluded.slug,
  official_title=excluded.official_title,
  display_title=excluded.display_title,
  category=excluded.category,
  jurisdiction=excluded.jurisdiction,
  authority=excluded.authority,
  official_source_url=excluded.official_source_url,
  priority=excluded.priority,
  updated_at=now();

commit;
