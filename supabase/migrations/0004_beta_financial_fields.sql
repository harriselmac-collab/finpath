-- Fields required by the offline-first beta stores. Additive for existing users.
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS client_updated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE goals ADD COLUMN IF NOT EXISTS classification TEXT NOT NULL DEFAULT 'important';
ALTER TABLE goals ADD COLUMN IF NOT EXISTS emoji TEXT;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE goals ADD CONSTRAINT goals_classification_check CHECK (classification IN ('essential', 'important', 'optional'));
ALTER TABLE goals ADD CONSTRAINT goals_status_check CHECK (status IN ('active', 'paused', 'completed', 'archived'));

ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS recurrence TEXT NOT NULL DEFAULT 'monthly';
ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS next_due_date DATE;
ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER NOT NULL DEFAULT 3;
ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS paid BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS notification_id TEXT;
ALTER TABLE recurring_expenses ADD CONSTRAINT recurring_expenses_recurrence_check CHECK (recurrence IN ('weekly', 'monthly', 'yearly', 'once'));
ALTER TABLE recurring_expenses ADD CONSTRAINT recurring_expenses_reminder_check CHECK (reminder_days_before >= 0);

ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS debt_reminders BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS savings_reminders BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS weekly_summary BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS monthly_review BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS cultural_events BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS product_updates BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS marketing BOOLEAN NOT NULL DEFAULT false;
