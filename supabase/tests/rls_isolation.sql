begin;

insert into auth.users (id, is_sso_user, is_anonymous)
values
  ('10000000-0000-0000-0000-000000000001', false, false),
  ('20000000-0000-0000-0000-000000000002', false, false);

insert into public.transactions (id, user_id, name, amount, type, category)
values
  ('10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'User A record', 10, 'income', 'test'),
  ('20000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000002', 'User B record', 20, 'income', 'test');

insert into public.debts (id, user_id, type, total_amount, minimum_payment, due_date)
values ('20000000-0000-0000-0000-000000000033', '20000000-0000-0000-0000-000000000002', 'test', 100, 10, '1');

insert into public.goals (id, user_id, name, target_amount, target_date)
values
  ('10000000-0000-0000-0000-000000000044', '10000000-0000-0000-0000-000000000001', 'User A goal', 100, '2027-01-01'),
  ('20000000-0000-0000-0000-000000000055', '20000000-0000-0000-0000-000000000002', 'User B goal', 200, '2027-01-01');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

do $$
declare
  visible_count integer;
begin
  select count(*) into visible_count from public.transactions;
  if visible_count <> 1 then raise exception 'RLS isolation failed: user A saw % rows', visible_count; end if;

  select count(*) into visible_count from public.goals;
  if visible_count <> 1 then raise exception 'Goal RLS isolation failed: user A saw % rows', visible_count; end if;

  begin
    update public.transactions
    set user_id = '20000000-0000-0000-0000-000000000002'
    where id = '10000000-0000-0000-0000-000000000011';
    raise exception 'RLS ownership reassignment unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.goals
    set user_id = '20000000-0000-0000-0000-000000000002'
    where id = '10000000-0000-0000-0000-000000000044';
    raise exception 'Goal ownership reassignment unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.goal_contributions (user_id, goal_id, amount)
    values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000055', 5);
    raise exception 'Cross-owner goal contribution unexpectedly succeeded';
  exception when foreign_key_violation then null;
  end;

  begin
    insert into public.debt_payments (user_id, debt_id, amount)
    values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000033', 5);
    raise exception 'Cross-owner parent reference unexpectedly succeeded';
  exception when foreign_key_violation then null;
  end;
end;
$$;

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
begin
  if exists (select 1 from public.transactions) then
    raise exception 'Signed-out request could read private transactions';
  end if;
  begin
    if exists (select 1 from public.goals) then
      raise exception 'Signed-out request could read private goals';
    end if;
  exception when insufficient_privilege then null;
  end;
end;
$$;

rollback;
