-- Doctor Core: one active device session per account, with explicit handoff.
begin;

with ranked as (
  select id, row_number() over (
    partition by user_id order by last_seen_at desc, created_at desc, id desc
  ) as rn
  from public.device_sessions
  where revoked_at is null and app_id is not null
)
update public.device_sessions ds
set revoked_at = now()
from ranked r
where ds.id = r.id and r.rn > 1;

drop index if exists public.device_sessions_one_active_per_user_app_uidx;
create unique index if not exists device_sessions_one_active_per_user_uidx
  on public.device_sessions(user_id)
  where app_id is not null and revoked_at is null;

create table if not exists public.device_session_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  active_session_id uuid not null references public.device_sessions(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  device_id text not null,
  device_name text,
  platform text,
  status text not null default 'pending'
    check (status in ('pending','approved','denied','expired','cancelled')),
  new_session_id uuid references public.device_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 seconds'),
  decided_at timestamptz
);
create index if not exists device_session_requests_user_created_idx
  on public.device_session_requests(user_id, created_at desc);
create index if not exists device_session_requests_active_session_idx
  on public.device_session_requests(active_session_id);
create index if not exists device_session_requests_app_id_idx
  on public.device_session_requests(app_id);
create index if not exists device_session_requests_new_session_idx
  on public.device_session_requests(new_session_id);
create unique index if not exists device_session_requests_one_pending_user_uidx
  on public.device_session_requests(user_id) where status = 'pending';
alter table public.device_session_requests enable row level security;
revoke all on public.device_session_requests from anon, authenticated;

drop policy if exists doctor_session_events_read_own on realtime.messages;
create policy doctor_session_events_read_own
on realtime.messages for select to authenticated
using (
  extension = 'broadcast'
  and realtime.topic() = 'doctor-session:' || (select auth.uid())::text
);

create or replace function public.broadcast_device_session_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if TG_TABLE_NAME = 'device_session_requests' then
    perform realtime.send(
      jsonb_build_object(
        'request_id', NEW.id,
        'device_name', coalesce(NEW.device_name, 'Outro dispositivo'),
        'platform', coalesce(NEW.platform, 'web'),
        'app_id', NEW.app_id,
        'expires_at', NEW.expires_at
      ),
      'takeover_requested',
      'doctor-session:' || NEW.user_id::text,
      true
    );
  elsif TG_TABLE_NAME = 'device_sessions'
    and OLD.revoked_at is null and NEW.revoked_at is not null then
    perform realtime.send(
      jsonb_build_object('session_id', NEW.id, 'reason', 'transferred'),
      'session_revoked',
      'doctor-session:' || NEW.user_id::text,
      true
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists device_session_requests_broadcast on public.device_session_requests;
create trigger device_session_requests_broadcast
after insert on public.device_session_requests
for each row execute function public.broadcast_device_session_event();

drop trigger if exists device_sessions_revoked_broadcast on public.device_sessions;
create trigger device_sessions_revoked_broadcast
after update of revoked_at on public.device_sessions
for each row execute function public.broadcast_device_session_event();

create or replace function public.request_device_session_v1(
  p_app_id uuid, p_device_id text, p_device_name text default null, p_platform text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_active public.device_sessions%rowtype;
  v_session_id uuid;
begin
  if v_user_id is null then raise exception 'not authenticated'; end if;
  if p_app_id is null or length(btrim(coalesce(p_device_id,''))) < 8 or length(p_device_id) > 180 then
    raise exception 'invalid app or device identity';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));
  if not public.is_admin() and not exists (
    select 1 from public.access_grants ag
    join public.products p on p.id=ag.product_id and p.status='published'
    join public.product_apps pa on pa.product_id=ag.product_id and pa.app_id=ag.app_id
    join public.apps a on a.id=ag.app_id and a.status='active'
    where ag.user_id=v_user_id and ag.app_id=p_app_id and ag.active=true
      and ag.starts_at<=now() and ag.ends_at>now()
  ) then raise exception 'active app access required'; end if;
  if public.is_admin() and not exists(select 1 from public.apps a where a.id=p_app_id) then
    raise exception 'app not found';
  end if;

  update public.device_session_requests
    set status='cancelled', decided_at=now()
  where user_id=v_user_id and status='pending';

  select * into v_active from public.device_sessions
  where user_id=v_user_id and app_id is not null and revoked_at is null
  limit 1 for update;

  if found and v_active.device_id=p_device_id and v_active.app_id=p_app_id then
    update public.device_sessions set last_seen_at=now(),
      device_name=nullif(left(coalesce(p_device_name,''),120),''),
      platform=nullif(left(coalesce(p_platform,''),80),'')
    where id=v_active.id;
    return jsonb_build_object('status','claimed','session_id',v_active.id,'app_id',p_app_id);
  end if;

  if found then
    update public.device_sessions set revoked_at=now()
    where id=v_active.id and revoked_at is null;
  end if;

  insert into public.device_sessions(user_id,device_id,device_name,platform,app_id,last_seen_at,revoked_at)
  values(v_user_id,p_device_id,nullif(left(coalesce(p_device_name,''),120),''),
    nullif(left(coalesce(p_platform,''),80),''),p_app_id,now(),null)
  on conflict on constraint device_sessions_user_device_app_key do update
    set device_name=excluded.device_name,platform=excluded.platform,last_seen_at=now(),revoked_at=null
  returning id into v_session_id;

  return jsonb_build_object('status','claimed','session_id',v_session_id,'app_id',p_app_id);
end;
$$;

create or replace function public.resolve_device_session_request_v1(
  p_request_id uuid, p_decision text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_req public.device_session_requests%rowtype;
  v_session_id uuid;
begin
  if v_user_id is null then raise exception 'not authenticated'; end if;
  if p_decision not in ('keep','transfer') then raise exception 'invalid decision'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));
  select * into v_req from public.device_session_requests
  where id=p_request_id and user_id=v_user_id for update;
  if not found then raise exception 'session request not found'; end if;
  if v_req.status <> 'pending' then
    return jsonb_build_object('status',v_req.status,'session_id',v_req.new_session_id);
  end if;
  if v_req.expires_at <= now() then
    update public.device_session_requests set status='expired',decided_at=now() where id=v_req.id;
    return jsonb_build_object('status','expired');
  end if;
  if not exists (
    select 1 from public.device_sessions
    where id=v_req.active_session_id and user_id=v_user_id and revoked_at is null
  ) then
    update public.device_session_requests set status='cancelled',decided_at=now() where id=v_req.id;
    return jsonb_build_object('status','cancelled');
  end if;
  if p_decision='keep' then
    update public.device_session_requests set status='denied',decided_at=now() where id=v_req.id;
    return jsonb_build_object('status','denied');
  end if;

  update public.device_sessions set revoked_at=now()
  where id=v_req.active_session_id and user_id=v_user_id and revoked_at is null;
  insert into public.device_sessions(user_id,device_id,device_name,platform,app_id,last_seen_at,revoked_at)
  values(v_user_id,v_req.device_id,v_req.device_name,v_req.platform,v_req.app_id,now(),null)
  on conflict on constraint device_sessions_user_device_app_key do update
    set device_name=excluded.device_name,platform=excluded.platform,last_seen_at=now(),revoked_at=null
  returning id into v_session_id;

  update public.device_session_requests
    set status='approved',new_session_id=v_session_id,decided_at=now()
  where id=v_req.id;
  return jsonb_build_object('status','approved','session_id',v_session_id,'app_id',v_req.app_id);
end;
$$;

create or replace function public.get_device_session_request_v1(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_req public.device_session_requests%rowtype;
begin
  if v_user_id is null then raise exception 'not authenticated'; end if;
  select * into v_req from public.device_session_requests
  where id=p_request_id and user_id=v_user_id;
  if not found then raise exception 'session request not found'; end if;
  if v_req.status='pending' and v_req.expires_at<=now() then
    update public.device_session_requests set status='expired',decided_at=now() where id=v_req.id;
    v_req.status := 'expired';
  end if;
  return jsonb_build_object('status',v_req.status,'session_id',v_req.new_session_id,'expires_at',v_req.expires_at);
end;
$$;

create or replace function public.claim_device_session_v1(
  p_app_id uuid, p_device_id text, p_device_name text default null, p_platform text default null
) returns table(session_id uuid, app_id uuid, last_seen_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_active public.device_sessions%rowtype;
  v_session_id uuid;
begin
  if v_user_id is null then raise exception 'not authenticated'; end if;
  if p_app_id is null or length(btrim(coalesce(p_device_id,'')))<8 or length(p_device_id)>180 then
    raise exception 'invalid app or device identity';
  end if;

  -- Serialize account-wide claims so simultaneous logins cannot leave two active sessions.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text,0));

  if not public.is_admin() and not exists (
    select 1 from public.access_grants ag
    join public.products p on p.id=ag.product_id and p.status='published'
    join public.product_apps pa on pa.product_id=ag.product_id and pa.app_id=ag.app_id
    join public.apps a on a.id=ag.app_id and a.status='active'
    where ag.user_id=v_user_id and ag.app_id=p_app_id and ag.active=true
      and ag.starts_at<=now() and ag.ends_at>now()
  ) then raise exception 'active app access required'; end if;
  if public.is_admin() and not exists(select 1 from public.apps where id=p_app_id) then
    raise exception 'app not found';
  end if;

  select * into v_active from public.device_sessions
    where user_id=v_user_id and app_id is not null and revoked_at is null
    order by last_seen_at desc limit 1 for update;

  if found and v_active.device_id=p_device_id and v_active.app_id=p_app_id then
    update public.device_sessions set last_seen_at=now(),
      device_name=nullif(left(coalesce(p_device_name,''),120),''),
      platform=nullif(left(coalesce(p_platform,''),80),'')
    where id=v_active.id;
    return query select v_active.id,p_app_id,now();
    return;
  end if;

  if found then
    update public.device_sessions set revoked_at=now()
    where id=v_active.id and revoked_at is null;
  end if;

  insert into public.device_sessions(user_id,device_id,device_name,platform,app_id,last_seen_at,revoked_at)
  values(v_user_id,p_device_id,nullif(left(coalesce(p_device_name,''),120),''),
    nullif(left(coalesce(p_platform,''),80),''),p_app_id,now(),null)
  on conflict on constraint device_sessions_user_device_app_key do update
    set device_name=excluded.device_name,platform=excluded.platform,last_seen_at=now(),revoked_at=null
  returning id into v_session_id;

  return query select v_session_id,p_app_id,now();
end;
$$;

create or replace function public.heartbeat_device_session_v1(p_session_id uuid,p_app_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_updated integer;
begin
  if v_user_id is null then raise exception 'not authenticated'; end if;
  if p_session_id is null or p_app_id is null then return false; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text,0));
  if not public.is_admin() and not exists (
    select 1 from public.access_grants ag
    join public.products p on p.id=ag.product_id and p.status='published'
    join public.product_apps pa on pa.product_id=ag.product_id and pa.app_id=ag.app_id
    join public.apps a on a.id=ag.app_id and a.status='active'
    where ag.user_id=v_user_id and ag.app_id=p_app_id and ag.active=true
      and ag.starts_at<=now() and ag.ends_at>now()
  ) then return false; end if;
  update public.device_sessions set last_seen_at=now()
  where id=p_session_id and user_id=v_user_id and app_id=p_app_id and revoked_at is null;
  get diagnostics v_updated=row_count;
  return v_updated=1;
end;
$$;

revoke execute on function public.broadcast_device_session_event() from anon;
revoke execute on function public.broadcast_device_session_event() from authenticated;
revoke execute on function public.broadcast_device_session_event() from public;
revoke all on function public.request_device_session_v1(uuid,text,text,text) from public, anon;
revoke all on function public.resolve_device_session_request_v1(uuid,text) from public, anon;
revoke all on function public.get_device_session_request_v1(uuid) from public, anon;
revoke all on function public.claim_device_session_v1(uuid,text,text,text) from public, anon;
revoke all on function public.heartbeat_device_session_v1(uuid,uuid) from public, anon;
grant execute on function public.request_device_session_v1(uuid,text,text,text) to authenticated;
grant execute on function public.resolve_device_session_request_v1(uuid,text) to authenticated;
grant execute on function public.get_device_session_request_v1(uuid) to authenticated;
grant execute on function public.claim_device_session_v1(uuid,text,text,text) to authenticated;
grant execute on function public.heartbeat_device_session_v1(uuid,uuid) to authenticated;

commit;
