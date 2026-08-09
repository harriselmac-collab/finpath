create index debt_payments_debt_id_user_id_idx on public.debt_payments(debt_id, user_id);
create index goal_contributions_goal_id_user_id_idx on public.goal_contributions(goal_id, user_id);
create index event_contributions_event_id_user_id_idx on public.event_contributions(event_id, user_id);
create index financial_plan_items_plan_id_user_id_idx on public.financial_plan_items(plan_id, user_id);
