import { router } from 'expo-router';

/**
 * Safely navigates back if there is a history stack to return to.
 * Otherwise, falls back to the specified route (defaulting to the Profile tab).
 */
export const safeBack = (fallback: string = '/(tabs)/profile') => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback as any);
  }
};
