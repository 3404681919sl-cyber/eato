-- Eato meal-access foundation.
-- Apply through the Supabase SQL Editor only after a project exists and its
-- anonymous sign-in setting has been explicitly enabled.

create table public.meal_events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  city text not null default '',
  area text not null default '',
  budget_min numeric not null check (budget_min >= 0),
  budget_max numeric not null check (budget_max >= budget_min),
  candidate_date_start date not null,
  candidate_date_end date not null check (candidate_date_end >= candidate_date_start),
  status text not null check (status in ('draft', 'collecting', 'deciding', 'confirmed', 'completed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.meal_members (
  event_id uuid not null references public.meal_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) > 0),
  avatar_url text,
  role text not null check (role in ('creator', 'member')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (event_id, user_id)
);

create table public.meal_availabilities (
  event_id uuid not null references public.meal_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  available_date date not null,
  meal_period text not null check (meal_period in ('lunch', 'afternoon', 'dinner')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (event_id, user_id, available_date, meal_period),
  foreign key (event_id, user_id) references public.meal_members(event_id, user_id) on delete cascade
);

create table public.meal_preferences (
  event_id uuid not null references public.meal_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  liked_cuisines text[] not null default '{}',
  disliked_cuisines text[] not null default '{}',
  taboos text[] not null default '{}',
  max_travel_minutes integer check (max_travel_minutes is null or max_travel_minutes >= 0),
  budget_min numeric check (budget_min is null or budget_min >= 0),
  budget_max numeric,
  is_flexible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (event_id, user_id),
  check (budget_max is null or budget_max >= 0),
  check (budget_min is null or budget_max is null or budget_max >= budget_min),
  foreign key (event_id, user_id) references public.meal_members(event_id, user_id) on delete cascade
);

create table public.meal_candidates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.meal_events(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  kind text not null check (kind in ('restaurant', 'cuisine')),
  address text,
  cuisine_tags text[] not null default '{}',
  price_per_person numeric check (price_per_person is null or price_per_person >= 0),
  source text,
  source_url text,
  offers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, event_id)
);

create table public.meal_votes (
  event_id uuid not null references public.meal_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate_id uuid not null,
  value text not null check (value in ('support', 'neutral', 'veto')),
  reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (event_id, user_id, candidate_id),
  foreign key (event_id, user_id) references public.meal_members(event_id, user_id) on delete cascade,
  foreign key (candidate_id, event_id) references public.meal_candidates(id, event_id) on delete cascade
);

create table public.meal_decisions (
  event_id uuid primary key references public.meal_events(id) on delete cascade,
  candidate_id uuid not null,
  selected_date date not null,
  meal_period text not null check (meal_period in ('lunch', 'afternoon', 'dinner')),
  reasoning text not null default '',
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  confirmed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (candidate_id, event_id) references public.meal_candidates(id, event_id) on delete restrict
);

create table public.meal_histories (
  event_id uuid primary key references public.meal_events(id) on delete cascade,
  occurred boolean not null,
  actual_spend numeric check (actual_spend is null or actual_spend >= 0),
  rating integer check (rating is null or rating between 1 and 5),
  note text,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index meal_members_user_id_idx on public.meal_members(user_id);
create index meal_availabilities_event_id_idx on public.meal_availabilities(event_id);
create index meal_preferences_event_id_idx on public.meal_preferences(event_id);
create index meal_candidates_event_id_idx on public.meal_candidates(event_id);
create index meal_votes_event_id_idx on public.meal_votes(event_id);

create function public.set_meal_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create function public.add_meal_creator_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.meal_members (event_id, user_id, display_name, role)
  values (new.id, new.creator_id, '创建者', 'creator');
  return new;
end;
$$;

create trigger set_meal_events_updated_at
before update on public.meal_events
for each row execute function public.set_meal_updated_at();
create trigger set_meal_members_updated_at
before update on public.meal_members
for each row execute function public.set_meal_updated_at();
create trigger set_meal_availabilities_updated_at
before update on public.meal_availabilities
for each row execute function public.set_meal_updated_at();
create trigger set_meal_preferences_updated_at
before update on public.meal_preferences
for each row execute function public.set_meal_updated_at();
create trigger set_meal_candidates_updated_at
before update on public.meal_candidates
for each row execute function public.set_meal_updated_at();
create trigger set_meal_votes_updated_at
before update on public.meal_votes
for each row execute function public.set_meal_updated_at();
create trigger set_meal_decisions_updated_at
before update on public.meal_decisions
for each row execute function public.set_meal_updated_at();
create trigger set_meal_histories_updated_at
before update on public.meal_histories
for each row execute function public.set_meal_updated_at();
create trigger add_meal_creator_membership
after insert on public.meal_events
for each row execute function public.add_meal_creator_membership();

create function public.is_meal_member(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.meal_members
    where event_id = target_event_id and user_id = auth.uid()
  );
$$;

create function public.is_meal_creator(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.meal_events
    where id = target_event_id and creator_id = auth.uid()
  );
$$;

revoke all on function public.set_meal_updated_at() from public;
revoke all on function public.add_meal_creator_membership() from public;
revoke all on function public.is_meal_member(uuid) from public;
revoke all on function public.is_meal_creator(uuid) from public;
grant execute on function public.is_meal_member(uuid) to authenticated;
grant execute on function public.is_meal_creator(uuid) to authenticated;

alter table public.meal_events enable row level security;
alter table public.meal_members enable row level security;
alter table public.meal_availabilities enable row level security;
alter table public.meal_preferences enable row level security;
alter table public.meal_candidates enable row level security;
alter table public.meal_votes enable row level security;
alter table public.meal_decisions enable row level security;
alter table public.meal_histories enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.meal_events to authenticated;
grant select, insert, update, delete on public.meal_members to authenticated;
grant select, insert, update, delete on public.meal_availabilities to authenticated;
grant select, insert, update, delete on public.meal_preferences to authenticated;
grant select, insert, update, delete on public.meal_candidates to authenticated;
grant select, insert, update, delete on public.meal_votes to authenticated;
grant select, insert, update, delete on public.meal_decisions to authenticated;
grant select, insert, update, delete on public.meal_histories to authenticated;

create policy "meal_members_read_visible_events"
on public.meal_events for select to authenticated
using (public.is_meal_member(id));
create policy "meal_creators_create_events"
on public.meal_events for insert to authenticated
with check (creator_id = auth.uid());
create policy "meal_creators_update_events"
on public.meal_events for update to authenticated
using (public.is_meal_creator(id))
with check (creator_id = auth.uid());
create policy "meal_creators_delete_events"
on public.meal_events for delete to authenticated
using (public.is_meal_creator(id));

create policy "meal_members_read_members"
on public.meal_members for select to authenticated
using (public.is_meal_member(event_id));
create policy "meal_creators_add_members"
on public.meal_members for insert to authenticated
with check (public.is_meal_creator(event_id) and role = 'member');
create policy "meal_creators_update_members"
on public.meal_members for update to authenticated
using (public.is_meal_creator(event_id) and user_id <> auth.uid())
with check (public.is_meal_creator(event_id) and role = 'member');
create policy "meal_creators_remove_members"
on public.meal_members for delete to authenticated
using (public.is_meal_creator(event_id) and user_id <> auth.uid());

create policy "meal_members_read_availabilities"
on public.meal_availabilities for select to authenticated
using (public.is_meal_member(event_id));
create policy "meal_members_manage_own_availabilities"
on public.meal_availabilities for all to authenticated
using (user_id = auth.uid() and public.is_meal_member(event_id))
with check (user_id = auth.uid() and public.is_meal_member(event_id));

create policy "meal_members_read_preferences"
on public.meal_preferences for select to authenticated
using (public.is_meal_member(event_id));
create policy "meal_members_manage_own_preferences"
on public.meal_preferences for all to authenticated
using (user_id = auth.uid() and public.is_meal_member(event_id))
with check (user_id = auth.uid() and public.is_meal_member(event_id));

create policy "meal_members_read_candidates"
on public.meal_candidates for select to authenticated
using (public.is_meal_member(event_id));
create policy "meal_creators_manage_candidates"
on public.meal_candidates for all to authenticated
using (public.is_meal_creator(event_id))
with check (public.is_meal_creator(event_id));

create policy "meal_members_read_votes"
on public.meal_votes for select to authenticated
using (public.is_meal_member(event_id));
create policy "meal_members_manage_own_votes"
on public.meal_votes for all to authenticated
using (user_id = auth.uid() and public.is_meal_member(event_id))
with check (user_id = auth.uid() and public.is_meal_member(event_id));

create policy "meal_members_read_decisions"
on public.meal_decisions for select to authenticated
using (public.is_meal_member(event_id));
create policy "meal_creators_manage_decisions"
on public.meal_decisions for all to authenticated
using (public.is_meal_creator(event_id))
with check (public.is_meal_creator(event_id));

create policy "meal_members_read_histories"
on public.meal_histories for select to authenticated
using (public.is_meal_member(event_id));
create policy "meal_creators_manage_histories"
on public.meal_histories for all to authenticated
using (public.is_meal_creator(event_id))
with check (public.is_meal_creator(event_id));
