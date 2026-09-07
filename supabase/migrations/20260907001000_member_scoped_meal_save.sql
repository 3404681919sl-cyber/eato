-- Let a meal member persist only their own profile, availability and votes.
-- The creator remains the only role allowed to alter meal-wide state.

create or replace function public.save_meal_event(meal_event jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  payload_event jsonb := meal_event -> 'event';
  target_event_id uuid := (meal_event -> 'event' ->> 'id')::uuid;
  payload_creator_id uuid := (meal_event -> 'event' ->> 'creator_id')::uuid;
  existing_creator_id uuid;
  is_creator boolean;
  item jsonb;
begin
  if auth.uid() is null then
    raise exception 'authentication is required' using errcode = '42501';
  end if;
  if payload_event is null or target_event_id is null or payload_creator_id is null then
    raise exception 'meal_event requires event.id and event.creator_id';
  end if;

  select creator_id into existing_creator_id
  from public.meal_events where id = target_event_id;

  if existing_creator_id is null then
    if payload_creator_id <> auth.uid() then
      raise exception 'creator must match auth.uid()' using errcode = '42501';
    end if;
    insert into public.meal_events (
      id, creator_id, title, city, area, budget_min, budget_max,
      candidate_date_start, candidate_date_end, status, created_at, updated_at
    ) values (
      target_event_id, auth.uid(), payload_event ->> 'title', coalesce(payload_event ->> 'city', ''),
      coalesce(payload_event ->> 'area', ''), (payload_event ->> 'budget_min')::numeric,
      (payload_event ->> 'budget_max')::numeric, (payload_event ->> 'candidate_date_start')::date,
      (payload_event ->> 'candidate_date_end')::date, payload_event ->> 'status',
      coalesce((payload_event ->> 'created_at')::timestamptz, now()), now()
    );
    existing_creator_id := auth.uid();
  elsif not public.is_meal_member(target_event_id) then
    raise exception 'meal event is not visible to current user' using errcode = '42501';
  end if;

  is_creator := existing_creator_id = auth.uid();
  if is_creator then
    update public.meal_events set
      title = payload_event ->> 'title', city = coalesce(payload_event ->> 'city', ''), area = coalesce(payload_event ->> 'area', ''),
      budget_min = (payload_event ->> 'budget_min')::numeric, budget_max = (payload_event ->> 'budget_max')::numeric,
      candidate_date_start = (payload_event ->> 'candidate_date_start')::date,
      candidate_date_end = (payload_event ->> 'candidate_date_end')::date, status = payload_event ->> 'status'
    where id = target_event_id and creator_id = auth.uid();
  end if;

  select value into item from jsonb_array_elements(coalesce(meal_event -> 'members', '[]'::jsonb))
  where value ->> 'user_id' = auth.uid()::text limit 1;
  if item is not null then
    update public.meal_members
    set display_name = coalesce(item ->> 'display_name', display_name), avatar_url = item ->> 'avatar_url'
    where event_id = target_event_id and user_id = auth.uid();
  end if;

  delete from public.meal_availabilities where event_id = target_event_id and user_id = auth.uid();
  for item in select value from jsonb_array_elements(coalesce(meal_event -> 'availabilities', '[]'::jsonb)) loop
    if item ->> 'user_id' = auth.uid()::text then
      insert into public.meal_availabilities (event_id, user_id, available_date, meal_period)
      values (target_event_id, auth.uid(), (item ->> 'available_date')::date, item ->> 'meal_period');
    end if;
  end loop;

  delete from public.meal_preferences where event_id = target_event_id and user_id = auth.uid();
  for item in select value from jsonb_array_elements(coalesce(meal_event -> 'preferences', '[]'::jsonb)) loop
    if item ->> 'user_id' = auth.uid()::text then
      insert into public.meal_preferences (event_id, user_id, liked_cuisines, disliked_cuisines, taboos, max_travel_minutes, budget_min, budget_max, is_flexible)
      values (target_event_id, auth.uid(), array(select jsonb_array_elements_text(coalesce(item -> 'liked_cuisines', '[]'::jsonb))), array(select jsonb_array_elements_text(coalesce(item -> 'disliked_cuisines', '[]'::jsonb))), array(select jsonb_array_elements_text(coalesce(item -> 'taboos', '[]'::jsonb))), (item ->> 'max_travel_minutes')::integer, (item ->> 'budget_min')::numeric, (item ->> 'budget_max')::numeric, coalesce((item ->> 'is_flexible')::boolean, true));
    end if;
  end loop;

  delete from public.meal_votes where event_id = target_event_id and user_id = auth.uid();
  for item in select value from jsonb_array_elements(coalesce(meal_event -> 'votes', '[]'::jsonb)) loop
    if item ->> 'user_id' = auth.uid()::text then
      insert into public.meal_votes (event_id, user_id, candidate_id, value, reason)
      values (target_event_id, auth.uid(), (item ->> 'candidate_id')::uuid, item ->> 'value', item ->> 'reason');
    end if;
  end loop;

  if is_creator then
    delete from public.meal_candidates where event_id = target_event_id;
    for item in select value from jsonb_array_elements(coalesce(meal_event -> 'candidates', '[]'::jsonb)) loop
      insert into public.meal_candidates (id, event_id, name, kind, address, cuisine_tags, price_per_person, source, source_url, offers)
      values ((item ->> 'id')::uuid, target_event_id, item ->> 'name', item ->> 'kind', item ->> 'address', array(select jsonb_array_elements_text(coalesce(item -> 'cuisine_tags', '[]'::jsonb))), (item ->> 'price_per_person')::numeric, item ->> 'source', item ->> 'source_url', coalesce(item -> 'offers', '[]'::jsonb));
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
  end if;

  return public.meal_event_payload(target_event_id);
end;
$$;
