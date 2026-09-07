-- Cloud aggregate RPCs for Eato. Execute only after 20260828000000_meal_access.sql.
-- These functions run as the caller, so RLS and auth.uid() remain in force.

create policy "meal_creators_update_own_member_profile"
on public.meal_members for update to authenticated
using (user_id = auth.uid() and public.is_meal_creator(event_id))
with check (user_id = auth.uid() and role = 'creator' and public.is_meal_creator(event_id));

create function public.meal_event_payload(target_event_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'event', to_jsonb(e),
    'members', coalesce((select jsonb_agg(to_jsonb(m) order by m.created_at) from public.meal_members m where m.event_id = e.id), '[]'::jsonb),
    'availabilities', coalesce((select jsonb_agg(to_jsonb(a) order by a.available_date, a.meal_period) from public.meal_availabilities a where a.event_id = e.id), '[]'::jsonb),
    'preferences', coalesce((select jsonb_agg(to_jsonb(p) order by p.user_id) from public.meal_preferences p where p.event_id = e.id), '[]'::jsonb),
    'candidates', coalesce((select jsonb_agg(to_jsonb(c) order by c.created_at) from public.meal_candidates c where c.event_id = e.id), '[]'::jsonb),
    'votes', coalesce((select jsonb_agg(to_jsonb(v) order by v.created_at) from public.meal_votes v where v.event_id = e.id), '[]'::jsonb),
    'decision', (select to_jsonb(d) from public.meal_decisions d where d.event_id = e.id),
    'history', (select to_jsonb(h) from public.meal_histories h where h.event_id = e.id)
  )
  from public.meal_events e
  where e.id = target_event_id;
$$;

create function public.list_meal_events()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(jsonb_agg(public.meal_event_payload(e.id) order by e.updated_at desc), '[]'::jsonb)
  from public.meal_events e;
$$;

create function public.get_meal_event(target_event_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select public.meal_event_payload(target_event_id);
$$;

create function public.save_meal_event(meal_event jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  payload_event jsonb := meal_event -> 'event';
  target_event_id uuid := (meal_event -> 'event' ->> 'id')::uuid;
  payload_creator_id uuid := (meal_event -> 'event' ->> 'creator_id')::uuid;
  item jsonb;
begin
  if payload_event is null or target_event_id is null or payload_creator_id is null then
    raise exception 'meal_event requires event.id and event.creator_id';
  end if;
  if payload_creator_id <> auth.uid() then
    raise exception 'creator must match auth.uid()' using errcode = '42501';
  end if;

  insert into public.meal_events (
    id, creator_id, title, city, area, budget_min, budget_max,
    candidate_date_start, candidate_date_end, status, created_at, updated_at
  ) values (
    target_event_id, payload_creator_id, payload_event ->> 'title', coalesce(payload_event ->> 'city', ''),
    coalesce(payload_event ->> 'area', ''), (payload_event ->> 'budget_min')::numeric,
    (payload_event ->> 'budget_max')::numeric, (payload_event ->> 'candidate_date_start')::date,
    (payload_event ->> 'candidate_date_end')::date, payload_event ->> 'status',
    coalesce((payload_event ->> 'created_at')::timestamptz, now()), now()
  )
  on conflict (id) do update set
    title = excluded.title, city = excluded.city, area = excluded.area,
    budget_min = excluded.budget_min, budget_max = excluded.budget_max,
    candidate_date_start = excluded.candidate_date_start, candidate_date_end = excluded.candidate_date_end,
    status = excluded.status
  where public.meal_events.creator_id = auth.uid();

  if not exists (select 1 from public.meal_events where id = target_event_id and creator_id = auth.uid()) then
    raise exception 'meal event is not writable by current user' using errcode = '42501';
  end if;

  update public.meal_members
  set display_name = coalesce(meal_event -> 'members' -> 0 ->> 'display_name', display_name),
      avatar_url = meal_event -> 'members' -> 0 ->> 'avatar_url'
  where event_id = target_event_id and user_id = auth.uid();

  delete from public.meal_availabilities where event_id = target_event_id and user_id = auth.uid();
  for item in select value from jsonb_array_elements(coalesce(meal_event -> 'availabilities', '[]'::jsonb)) loop
    if (item ->> 'user_id')::uuid <> auth.uid() then raise exception 'availability user must match auth.uid()' using errcode = '42501'; end if;
    insert into public.meal_availabilities (event_id, user_id, available_date, meal_period)
    values (target_event_id, auth.uid(), (item ->> 'available_date')::date, item ->> 'meal_period');
  end loop;

  delete from public.meal_preferences where event_id = target_event_id and user_id = auth.uid();
  for item in select value from jsonb_array_elements(coalesce(meal_event -> 'preferences', '[]'::jsonb)) loop
    if (item ->> 'user_id')::uuid <> auth.uid() then raise exception 'preference user must match auth.uid()' using errcode = '42501'; end if;
    insert into public.meal_preferences (event_id, user_id, liked_cuisines, disliked_cuisines, taboos, max_travel_minutes, budget_min, budget_max, is_flexible)
    values (target_event_id, auth.uid(), array(select jsonb_array_elements_text(coalesce(item -> 'liked_cuisines', '[]'::jsonb))), array(select jsonb_array_elements_text(coalesce(item -> 'disliked_cuisines', '[]'::jsonb))), array(select jsonb_array_elements_text(coalesce(item -> 'taboos', '[]'::jsonb))), (item ->> 'max_travel_minutes')::integer, (item ->> 'budget_min')::numeric, (item ->> 'budget_max')::numeric, coalesce((item ->> 'is_flexible')::boolean, true));
  end loop;

  delete from public.meal_votes where event_id = target_event_id and user_id = auth.uid();
  delete from public.meal_candidates where event_id = target_event_id;
  for item in select value from jsonb_array_elements(coalesce(meal_event -> 'candidates', '[]'::jsonb)) loop
    insert into public.meal_candidates (id, event_id, name, kind, address, cuisine_tags, price_per_person, source, source_url, offers)
    values ((item ->> 'id')::uuid, target_event_id, item ->> 'name', item ->> 'kind', item ->> 'address', array(select jsonb_array_elements_text(coalesce(item -> 'cuisine_tags', '[]'::jsonb))), (item ->> 'price_per_person')::numeric, item ->> 'source', item ->> 'source_url', coalesce(item -> 'offers', '[]'::jsonb));
  end loop;

  for item in select value from jsonb_array_elements(coalesce(meal_event -> 'votes', '[]'::jsonb)) loop
    if (item ->> 'user_id')::uuid <> auth.uid() then raise exception 'vote user must match auth.uid()' using errcode = '42501'; end if;
    insert into public.meal_votes (event_id, user_id, candidate_id, value, reason)
    values (target_event_id, auth.uid(), (item ->> 'candidate_id')::uuid, item ->> 'value', item ->> 'reason');
  end loop;

  delete from public.meal_decisions where event_id = target_event_id;
  if meal_event -> 'decision' is not null then
    item := meal_event -> 'decision';
    insert into public.meal_decisions (event_id, candidate_id, selected_date, meal_period, reasoning, confidence, confirmed_at)
    values (target_event_id, (item ->> 'candidate_id')::uuid, (item ->> 'selected_date')::date, item ->> 'meal_period', coalesce(item ->> 'reasoning', ''), (item ->> 'confidence')::numeric, (item ->> 'confirmed_at')::timestamptz);
  end if;

  delete from public.meal_histories where event_id = target_event_id;
  if meal_event -> 'history' is not null then
    item := meal_event -> 'history';
    insert into public.meal_histories (event_id, occurred, actual_spend, rating, note, completed_at)
    values (target_event_id, coalesce((item ->> 'occurred')::boolean, false), (item ->> 'actual_spend')::numeric, (item ->> 'rating')::integer, item ->> 'note', (item ->> 'completed_at')::timestamptz);
  end if;

  return public.meal_event_payload(target_event_id);
end;
$$;

create function public.delete_meal_event(target_event_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.meal_events where id = target_event_id and creator_id = auth.uid();
  return found;
end;
$$;

revoke all on function public.meal_event_payload(uuid) from public;
revoke all on function public.list_meal_events() from public;
revoke all on function public.get_meal_event(uuid) from public;
revoke all on function public.save_meal_event(jsonb) from public;
revoke all on function public.delete_meal_event(uuid) from public;
grant execute on function public.list_meal_events() to authenticated;
grant execute on function public.get_meal_event(uuid) to authenticated;
grant execute on function public.save_meal_event(jsonb) to authenticated;
grant execute on function public.delete_meal_event(uuid) to authenticated;
