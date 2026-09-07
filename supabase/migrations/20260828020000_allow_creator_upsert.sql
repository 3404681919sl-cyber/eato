-- An INSERT ... ON CONFLICT statement evaluates the SELECT policy for its
-- proposed row. A new meal has no membership until the insert trigger runs,
-- so the creator must be able to read their own row during that transition.

alter policy "meal_members_read_visible_events"
on public.meal_events
using (creator_id = auth.uid() or public.is_meal_member(id));
