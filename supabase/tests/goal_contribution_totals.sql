begin;

do $$
declare
  test_user_id uuid;
  test_goal_id uuid := gen_random_uuid();
  test_contribution_id uuid := gen_random_uuid();
  saved_total numeric(15, 2);
begin
  select id into test_user_id from auth.users order by created_at limit 1;
  if test_user_id is null then
    raise exception 'A test user is required to validate goal contribution totals.';
  end if;

  insert into public.goals (id, user_id, name, target_amount, target_date)
  values (test_goal_id, test_user_id, 'Release verification', 100, current_date + 30);

  insert into public.goal_contributions (id, user_id, goal_id, amount)
  values (test_contribution_id, test_user_id, test_goal_id, 25);
  select already_saved into saved_total from public.goals where id = test_goal_id;
  if saved_total <> 25 then raise exception 'Insert total mismatch: %', saved_total; end if;

  update public.goal_contributions set amount = 40 where id = test_contribution_id;
  select already_saved into saved_total from public.goals where id = test_goal_id;
  if saved_total <> 40 then raise exception 'Update total mismatch: %', saved_total; end if;

  delete from public.goal_contributions where id = test_contribution_id;
  select already_saved into saved_total from public.goals where id = test_goal_id;
  if saved_total <> 0 then raise exception 'Delete total mismatch: %', saved_total; end if;
end;
$$;

rollback;
