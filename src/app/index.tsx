import React from 'react';
import { Redirect } from 'expo-router';
import { useOnboardingStore } from '../store/onboardingStore';

export default function EntryScreen() {
  const onboardingCompleted = useOnboardingStore((state) => state.onboardingCompleted);

  if (onboardingCompleted) {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/onboarding/welcome" />;
}
