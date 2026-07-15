-- Alter profiles table to add profile settings and optional fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'MAD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_range TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employment_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS household_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS religion_consent_granted BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS religion_consent_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_consent_granted BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_consent_date TIMESTAMP WITH TIME ZONE;

-- Create privacy consents table
CREATE TABLE IF NOT EXISTS privacy_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL, -- 'ai_explanations', 'religion', 'analytics', 'marketing'
    granted BOOLEAN NOT NULL DEFAULT false,
    policy_version TEXT NOT NULL DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own privacy consents" ON privacy_consents
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_privacy_consents_user_id ON privacy_consents(user_id);

-- Create data export requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own export requests" ON data_export_requests
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON data_export_requests(user_id);

-- Create account deletion requests table
CREATE TABLE IF NOT EXISTS account_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own deletion requests" ON account_deletion_requests
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_id ON account_deletion_requests(user_id);

-- Create secure SECURITY DEFINER delete function to allow self-account deletion
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS VOID AS $$
BEGIN
    -- Delete the user from auth.users (cascades will delete user data from public tables)
    DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
