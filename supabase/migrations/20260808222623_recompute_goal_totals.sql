-- Keep the denormalized goals.already_saved value consistent when two devices
-- add, edit, or remove contributions concurrently.
create or replace function public.recompute_goal_saved_amount()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected_goal_id uuid;
  affected_user_id uuid;
  saved_total numeric(15, 2);
begin
  if tg_op = 'DELETE' then
    affected_goal_id := old.goal_id;
    affected_user_id := old.user_id;
  else
    affected_goal_id := new.goal_id;
    affected_user_id := new.user_id;
  end if;

  select coalesce(sum(contribution.amount), 0)
    into saved_total
  from public.goal_contributions as contribution
  where contribution.goal_id = affected_goal_id
    and contribution.user_id = affected_user_id;

  update public.goals as goal
  set already_saved = saved_total,
      status = case
        when saved_total >= goal.target_amount and goal.status <> 'archived' then 'completed'
        when saved_total < goal.target_amount and goal.status = 'completed' then 'active'
        else goal.status
      end,
      completed_at = case
        when saved_total >= goal.target_amount and goal.status <> 'archived'
          then coalesce(goal.completed_at, pg_catalog.now())
        when saved_total < goal.target_amount and goal.status = 'completed' then null
        else goal.completed_at
      end
  where goal.id = affected_goal_id
    and goal.user_id = affected_user_id;

  return coalesce(new, old);
end;
$$;

revoke all on function public.recompute_goal_saved_amount() from public;

drop trigger if exists recompute_goal_saved_amount_after_change on public.goal_contributions;
create trigger recompute_goal_saved_amount_after_change
after insert or delete or update of amount, goal_id
on public.goal_contributions
for each row
execute function public.recompute_goal_saved_amount();
