import React from 'react';
import { Redirect } from 'expo-router';
import { resolveEntryRoute } from '../features/onboarding/entryRoute';
import { useOnboardingStore } from '../store/onboardingStore';

const subscribeToHydration = (listener: () => void) => {
  const unsubscribeStart = useOnboardingStore.persist.onHydrate(listener);
  const unsubscribeFinish = useOnboardingStore.persist.onFinishHydration(listener);
  return () => {
    unsubscribeStart();
    unsubscribeFinish();
  };
};

export default function EntryScreen() {
  const onboardingCompleted = useOnboardingStore((state) => state.onboardingCompleted);
  const hasHydrated = React.useSyncExternalStore(
    subscribeToHydration,
    useOnboardingStore.persist.hasHydrated,
    () => false,
  );

  const route = resolveEntryRoute(hasHydrated, onboardingCompleted);

  if (!route) return null;

  return <Redirect href={route} />;
}
