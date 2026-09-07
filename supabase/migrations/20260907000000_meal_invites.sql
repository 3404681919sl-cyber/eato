-- One opaque invite token per meal. The table is private: only the
-- security-definer RPCs can read or rotate a token.

create table public.meal_invites (
  event_id uuid primary key references public.meal_events(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_meal_invites_updated_at
before update on public.meal_invites
for each row execute function public.set_meal_updated_at();

alter table public.meal_invites enable row level security;

create function public.create_or_rotate_meal_invite(target_event_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_token uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication is required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.meal_events
    where id = target_event_id and creator_id = auth.uid()
  ) then
    raise exception 'only the meal creator can create an invite' using errcode = '42501';
  end if;

  insert into public.meal_invites (event_id, token, created_by)
  values (target_event_id, gen_random_uuid(), auth.uid())
  on conflict (event_id) do update
  set token = gen_random_uuid(), created_by = auth.uid()
  returning token into invite_token;

  return invite_token::text;
end;
$$;

create function public.join_meal_invite(invite_token text, display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_event_id uuid;
  parsed_token uuid;
  normalized_name text := trim(display_name);
begin
  if auth.uid() is null then
    raise exception 'authentication is required' using errcode = '42501';
  end if;
  if normalized_name = '' then
    raise exception 'display name is required' using errcode = '22023';
  end if;

  begin
    parsed_token := invite_token::uuid;
  exception when invalid_text_representation then
    raise exception 'invite is invalid or expired' using errcode = '22023';
  end;

  select event_id into target_event_id
  from public.meal_invites
  where token = parsed_token;
  if target_event_id is null then
    raise exception 'invite is invalid or expired' using errcode = '22023';
  end if;

  insert into public.meal_members (event_id, user_id, display_name, role)
  values (target_event_id, auth.uid(), normalized_name, 'member')
  on conflict (event_id, user_id) do update
  set display_name = excluded.display_name;

  insert into public.meal_preferences (event_id, user_id)
  values (target_event_id, auth.uid())
  on conflict (event_id, user_id) do nothing;

  return target_event_id;
end;
$$;

revoke all on table public.meal_invites from public;
revoke all on function public.create_or_rotate_meal_invite(uuid) from public;
revoke all on function public.join_meal_invite(text, text) from public;
grant execute on function public.create_or_rotate_meal_invite(uuid) to authenticated;
grant execute on function public.join_meal_invite(text, text) to authenticated;
