interface AuthProfile {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}

const normalizedText = (value: unknown) => typeof value === 'string' ? value.trim() : '';

export const resolveProfileDisplayName = (
  preferredName: unknown,
  user: AuthProfile | null,
  guestLabel: string,
) => {
  const metadata = user?.user_metadata;
  return normalizedText(preferredName)
    || normalizedText(metadata?.full_name)
    || normalizedText(metadata?.name)
    || normalizedText(user?.email?.split('@')[0])
    || guestLabel;
};
