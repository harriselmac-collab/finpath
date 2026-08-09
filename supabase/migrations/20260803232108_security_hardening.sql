-- Harden ownership policies and privileged database code.
create or replace function public.update_modified_column()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

revoke all on function public.delete_user_account() from public, anon, authenticated;
drop function public.delete_user_account();

do $$
declare
  policy_record record;
begin
  for policy_record in
    select * from (values
      ('profiles', 'Users can manage their own profile'),
      ('onboarding_answers', 'Users can manage their own onboarding answers'),
      ('income_sources', 'Users can manage their own income'),
      ('recurring_expenses', 'Users can manage their own recurring expenses'),
      ('annual_expenses', 'Users can manage their own annual expenses'),
      ('transactions', 'Users can manage their own transactions'),
      ('debts', 'Users can manage their own debts'),
      ('debt_payments', 'Users can manage their own debt payments'),
      ('goals', 'Users can manage their own goals'),
      ('goal_contributions', 'Users can manage their own goal contributions'),
      ('upcoming_events', 'Users can manage their own upcoming events'),
      ('event_contributions', 'Users can manage their own event contributions'),
      ('financial_plans', 'Users can manage their own plans'),
      ('financial_plan_items', 'Users can manage their own plan items'),
      ('ai_insights', 'Users can manage their own insights'),
      ('notification_preferences', 'Users can manage their own notification settings'),
      ('user_preferences', 'Users can manage their own preferences'),
      ('privacy_consents', 'Users can manage their own privacy consents'),
      ('data_export_requests', 'Users can manage their own export requests'),
      ('account_deletion_requests', 'Users can manage their own deletion requests')
    ) as policies(table_name, policy_name)
  loop
    execute format(
      'alter policy %I on public.%I to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      policy_record.policy_name,
      policy_record.table_name
    );
  end loop;
end;
$$;

-- A child record cannot point at another user's parent record.
create unique index debts_id_user_id_idx on public.debts(id, user_id);
create unique index goals_id_user_id_idx on public.goals(id, user_id);
create unique index upcoming_events_id_user_id_idx on public.upcoming_events(id, user_id);
create unique index financial_plans_id_user_id_idx on public.financial_plans(id, user_id);

alter table public.debt_payments
  add constraint debt_payments_owner_fkey foreign key (debt_id, user_id)
  references public.debts(id, user_id) on delete cascade;
alter table public.goal_contributions
  add constraint goal_contributions_owner_fkey foreign key (goal_id, user_id)
  references public.goals(id, user_id) on delete cascade;
alter table public.event_contributions
  add constraint event_contributions_owner_fkey foreign key (event_id, user_id)
  references public.upcoming_events(id, user_id) on delete cascade;
alter table public.financial_plan_items
  add constraint financial_plan_items_owner_fkey foreign key (plan_id, user_id)
  references public.financial_plans(id, user_id) on delete cascade;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('private-user-files', 'private-user-files', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can read their private files"
on storage.objects for select to authenticated
using (bucket_id = 'private-user-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can upload their private files"
on storage.objects for insert to authenticated
with check (bucket_id = 'private-user-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can update their private files"
on storage.objects for update to authenticated
using (bucket_id = 'private-user-files' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'private-user-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can delete their private files"
on storage.objects for delete to authenticated
using (bucket_id = 'private-user-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
