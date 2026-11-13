-- Secure automatic source monitoring: cron token lives only in Vault.
create extension if not exists pg_cron with schema pg_catalog;
create schema if not exists extensions;
create extension if not exists pg_net with schema extensions;

create or replace function public.verify_legal_library_cron_token(p_token text)
returns boolean
language sql
security definer
set search_path = public, vault, pg_temp
as $$
  select coalesce(
    p_token is not null
    and length(p_token) >= 32
    and exists (
      select 1
      from vault.decrypted_secrets
      where name = 'legal-library-cron-token'
        and decrypted_secret = p_token
    ),
    false
  );
$$;

revoke all on function public.verify_legal_library_cron_token(text) from public, anon, authenticated;
grant execute on function public.verify_legal_library_cron_token(text) to service_role;

do $$
begin
  if not exists (
    select 1 from vault.secrets where name = 'legal-library-cron-token'
  ) then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'legal-library-cron-token',
      'Internal trigger token for Doctor Concursos legal source monitoring. Never expose to clients.'
    );
  end if;
end;
$$;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id from cron.job where jobname = 'doctor-legal-library-daily';
  if existing_job_id is not null then perform cron.unschedule(existing_job_id); end if;

  select jobid into existing_job_id from cron.job where jobname = 'doctor-legal-library-weekly';
  if existing_job_id is not null then perform cron.unschedule(existing_job_id); end if;

  perform cron.schedule(
    'doctor-legal-library-daily',
    '30 11 * * *',
    $daily$
      select net.http_post(
        url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-doctor-cron-token', (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'legal-library-cron-token'
            limit 1
          )
        ),
        body := '{"mode":"daily"}'::jsonb,
        timeout_milliseconds := 30000
      ) as request_id;
    $daily$
  );

  perform cron.schedule(
    'doctor-legal-library-weekly',
    '45 11 * * 1',
    $weekly$
      select net.http_post(
        url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-doctor-cron-token', (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'legal-library-cron-token'
            limit 1
          )
        ),
        body := '{"mode":"weekly"}'::jsonb,
        timeout_milliseconds := 30000
      ) as request_id;
    $weekly$
  );
end;
$$;
