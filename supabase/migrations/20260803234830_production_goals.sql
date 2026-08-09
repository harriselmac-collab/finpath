alter table public.goals
  add column if not exists description text,
  add column if not exists category text not null default 'other',
  add column if not exists vector_key text not null default 'target',
  add column if not exists color_key text not null default 'pocket_blue',
  add column if not exists reminder_frequency text not null default 'none',
  add column if not exists reminder_date date,
  add column if not exists reminder_notification_id text,
  add column if not exists completed_at timestamptz,
  add column if not exists celebration_shown_at timestamptz,
  add column if not exists client_updated_at timestamptz;

alter table public.goal_contributions
  add column if not exists note text,
  add column if not exists client_updated_at timestamptz;

update public.goals
set completed_at = coalesce(completed_at, updated_at),
    celebration_shown_at = coalesce(celebration_shown_at, updated_at)
where status = 'completed';

alter table public.goals
  drop constraint if exists goals_category_check,
  add constraint goals_category_check check (category in ('emergency_fund','home','vehicle','education','travel','family','health','business','debt_payoff','technology','wedding','religious_event','personal','other')),
  drop constraint if exists goals_vector_key_check,
  add constraint goals_vector_key_check check (vector_key in ('shield','umbrella','medical_cross','home','key','car','maintenance','graduation_cap','book','school','airplane','suitcase','map','family','gift','wallet','piggy_bank','debt_free','target','briefcase','store','laptop','heart','celebration','star','custom_goal')),
  drop constraint if exists goals_color_key_check,
  add constraint goals_color_key_check check (color_key in ('pocket_blue','deep_navy','positive_lime','teal','violet','amber','coral','rose','sky','neutral')),
  drop constraint if exists goals_reminder_frequency_check,
  add constraint goals_reminder_frequency_check check (reminder_frequency in ('none','weekly','monthly','once')),
  drop constraint if exists goals_amounts_check,
  add constraint goals_amounts_check check (target_amount > 0 and already_saved >= 0);

alter table public.goal_contributions
  drop constraint if exists goal_contributions_amount_check,
  add constraint goal_contributions_amount_check check (amount > 0);

grant select, insert, update, delete on table public.goals to authenticated;
grant select, insert, update, delete on table public.goal_contributions to authenticated;
revoke all on table public.goals from anon;
revoke all on table public.goal_contributions from anon;
