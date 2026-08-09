export type EntryRoute = '/dashboard' | '/onboarding/welcome' | null;

export const resolveEntryRoute = (
  hasHydrated: boolean,
  onboardingCompleted: boolean,
): EntryRoute => {
  if (!hasHydrated) return null;
  return onboardingCompleted ? '/dashboard' : '/onboarding/welcome';
};
