-- Create trigger function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =========================================================================
-- 1. PROFILES TABLE
-- =========================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 2. ONBOARDING_ANSWERS TABLE
-- =========================================================================
CREATE TABLE onboarding_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE onboarding_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own onboarding answers" ON onboarding_answers
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_onboarding_answers_user_id ON onboarding_answers(user_id);

CREATE TRIGGER update_onboarding_answers_modtime
    BEFORE UPDATE ON onboarding_answers
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 3. INCOME_SOURCES TABLE
-- =========================================================================
CREATE TABLE income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'monthly', -- e.g. monthly, weekly, irregular
    is_irregular BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own income" ON income_sources
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_income_sources_user_id ON income_sources(user_id);

CREATE TRIGGER update_income_sources_modtime
    BEFORE UPDATE ON income_sources
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 4. RECURRING_EXPENSES TABLE
-- =========================================================================
CREATE TABLE recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    category TEXT NOT NULL, -- e.g. housing, utilities, food, healthcare
    is_essential BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own recurring expenses" ON recurring_expenses
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_recurring_expenses_user_id ON recurring_expenses(user_id);

CREATE TRIGGER update_recurring_expenses_modtime
    BEFORE UPDATE ON recurring_expenses
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 5. ANNUAL_EXPENSES TABLE
-- =========================================================================
CREATE TABLE annual_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE annual_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own annual expenses" ON annual_expenses
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_annual_expenses_user_id ON annual_expenses(user_id);

CREATE TRIGGER update_annual_expenses_modtime
    BEFORE UPDATE ON annual_expenses
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 6. TRANSACTIONS TABLE
-- =========================================================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    type TEXT NOT NULL, -- e.g. income, essential, flexible, debt, savings
    category TEXT NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own transactions" ON transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

CREATE TRIGGER update_transactions_modtime
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 7. DEBTS TABLE
-- =========================================================================
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g. credit card, personal loan, vehicle loan
    total_amount NUMERIC(15, 2) NOT NULL,
    minimum_payment NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    due_date TEXT NOT NULL, -- day of the month, e.g. '15'
    is_overdue BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own debts" ON debts
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_debts_user_id ON debts(user_id);

CREATE TRIGGER update_debts_modtime
    BEFORE UPDATE ON debts
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 8. DEBT_PAYMENTS TABLE
-- =========================================================================
CREATE TABLE debt_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own debt payments" ON debt_payments
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_debt_payments_user_id ON debt_payments(user_id);
CREATE INDEX idx_debt_payments_debt_id ON debt_payments(debt_id);

CREATE TRIGGER update_debt_payments_modtime
    BEFORE UPDATE ON debt_payments
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 9. GOALS TABLE
-- =========================================================================
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL,
    already_saved NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    target_date DATE NOT NULL,
    is_essential BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own goals" ON goals
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_goals_user_id ON goals(user_id);

CREATE TRIGGER update_goals_modtime
    BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 10. GOAL_CONTRIBUTIONS TABLE
-- =========================================================================
CREATE TABLE goal_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own goal contributions" ON goal_contributions
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_goal_contributions_user_id ON goal_contributions(user_id);
CREATE INDEX idx_goal_contributions_goal_id ON goal_contributions(goal_id);

CREATE TRIGGER update_goal_contributions_modtime
    BEFORE UPDATE ON goal_contributions
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 11. UPCOMING_EVENTS TABLE
-- =========================================================================
CREATE TABLE upcoming_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    event_date DATE NOT NULL,
    estimated_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE upcoming_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own upcoming events" ON upcoming_events
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_upcoming_events_user_id ON upcoming_events(user_id);

CREATE TRIGGER update_upcoming_events_modtime
    BEFORE UPDATE ON upcoming_events
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 12. EVENT_CONTRIBUTIONS TABLE
-- =========================================================================
CREATE TABLE event_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES upcoming_events(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE event_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own event contributions" ON event_contributions
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_event_contributions_user_id ON event_contributions(user_id);
CREATE INDEX idx_event_contributions_event_id ON event_contributions(event_id);

CREATE TRIGGER update_event_contributions_modtime
    BEFORE UPDATE ON event_contributions
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 13. FINANCIAL_PLANS TABLE
-- =========================================================================
CREATE TABLE financial_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    total_income NUMERIC(15, 2) NOT NULL,
    total_essential NUMERIC(15, 2) NOT NULL,
    total_debt_payments NUMERIC(15, 2) NOT NULL,
    available_surplus NUMERIC(15, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE financial_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own plans" ON financial_plans
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_financial_plans_user_id ON financial_plans(user_id);

CREATE TRIGGER update_financial_plans_modtime
    BEFORE UPDATE ON financial_plans
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 14. FINANCIAL_PLAN_ITEMS TABLE
-- =========================================================================
CREATE TABLE financial_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES financial_plans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    allocated_amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE financial_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own plan items" ON financial_plan_items
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_financial_plan_items_user_id ON financial_plan_items(user_id);
CREATE INDEX idx_financial_plan_items_plan_id ON financial_plan_items(plan_id);

CREATE TRIGGER update_financial_plan_items_modtime
    BEFORE UPDATE ON financial_plan_items
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 15. AI_INSIGHTS TABLE
-- =========================================================================
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    insight_type TEXT NOT NULL, -- e.g. shortfall, warning, tips, goal
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own insights" ON ai_insights
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);

CREATE TRIGGER update_ai_insights_modtime
    BEFORE UPDATE ON ai_insights
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 16. NOTIFICATION_PREFERENCES TABLE
-- =========================================================================
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    shortfall_alerts BOOLEAN NOT NULL DEFAULT true,
    goal_reminders BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notification settings" ON notification_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_notification_pref_modtime
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =========================================================================
-- 17. USER_PREFERENCES TABLE
-- =========================================================================
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'light',
    locale TEXT NOT NULL DEFAULT 'en',
    currency TEXT NOT NULL DEFAULT 'MAD',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_user_preferences_modtime
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
