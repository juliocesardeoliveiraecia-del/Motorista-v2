-- Replace single long sync requests with bounded HTML/PDF batches; publication still requires manual review.
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
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'daily', 'document_ids', array['BR-CF-1988']),
  timeout_milliseconds := 120000
);

select net.http_post(
  url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-doctor-cron-token', (
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'daily', 'document_ids', array['BR-ADCT-1988']),
  timeout_milliseconds := 120000
);

select net.http_post(
  url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-doctor-cron-token', (
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'daily', 'document_ids', array['BR-CTB-1997', 'INT-UDHR-1948-PT']),
  timeout_milliseconds := 120000
);

select net.http_post(
  url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-doctor-cron-token', (
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'daily', 'document_ids', array['BR-CP-1940', 'BR-CPP-1941']),
  timeout_milliseconds := 120000
);

select net.http_post(
  url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-doctor-cron-token', (
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'daily', 'document_ids', array['BR-LEP-1984', 'BR-ECA-1990']),
  timeout_milliseconds := 120000
);

select net.http_post(
  url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-doctor-cron-token', (
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'daily', 'document_ids', array['BR-CC-2002', 'BR-CDC-1990']),
  timeout_milliseconds := 120000
);

select net.http_post(
  url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-doctor-cron-token', (
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'daily', 'document_ids', array['BR-LMP-2006', 'BR-ESTATUTO-IDOSO-2003', 'INT-MANDELA-2015-PT']),
  timeout_milliseconds := 120000
);
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
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'weekly', 'document_ids', array['BR-CF-1988']),
  timeout_milliseconds := 120000
);

select net.http_post(
  url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-doctor-cron-token', (
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'weekly', 'document_ids', array['BR-ADCT-1988']),
  timeout_milliseconds := 120000
);

select net.http_post(
  url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-doctor-cron-token', (
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'weekly', 'document_ids', array['BR-CTB-1997', 'INT-UDHR-1948-PT']),
  timeout_milliseconds := 120000
);

select net.http_post(
  url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-doctor-cron-token', (
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'weekly', 'document_ids', array['BR-CP-1940', 'BR-CPP-1941']),
  timeout_milliseconds := 120000
);

select net.http_post(
  url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-doctor-cron-token', (
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'weekly', 'document_ids', array['BR-LEP-1984', 'BR-ECA-1990']),
  timeout_milliseconds := 120000
);

select net.http_post(
  url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-doctor-cron-token', (
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'weekly', 'document_ids', array['BR-CC-2002', 'BR-CDC-1990']),
  timeout_milliseconds := 120000
);

select net.http_post(
  url := 'https://oyxdypypxremphiiipiz.supabase.co/functions/v1/legal-library-sync',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-doctor-cron-token', (
      select decrypted_secret from vault.decrypted_secrets
      where name = 'legal-library-cron-token' limit 1
    )
  ),
  body := jsonb_build_object('mode', 'weekly', 'document_ids', array['BR-LMP-2006', 'BR-ESTATUTO-IDOSO-2003']),
  timeout_milliseconds := 120000
);
    $weekly$
  );
end;
$$;
