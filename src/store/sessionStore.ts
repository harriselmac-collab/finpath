import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../services/supabase/supabaseClient';
import { useTransactionsStore } from './transactionsStore';
import { useGoalsStore } from './goalsStore';
import { useBillsStore } from './billsStore';
import { useOnboardingStore } from './onboardingStore';
import { useNotificationPreferencesStore } from './notificationPreferencesStore';

export const LOCAL_OWNER_ID = 'local';

const financialStores = [
  useTransactionsStore,
  useGoalsStore,
  useBillsStore,
  useOnboardingStore,
  useNotificationPreferencesStore,
] as const;

let financialHydrationPromise: Promise<void> | null = null;
let ownerRequestVersion = 0;

const ensureFinancialStoresHydrated = () => {
  financialHydrationPromise ??= Promise.all(
    financialStores.map((store) => (
      store.persist.hasHydrated() ? Promise.resolve() : store.persist.rehydrate()
    )),
  ).then(() => undefined).catch((error) => {
    financialHydrationPromise = null;
    throw error;
  });
  return financialHydrationPromise;
};

const setActiveFinancialOwner = async (ownerId: string | null) => {
  const requestVersion = ++ownerRequestVersion;
  await ensureFinancialStoresHydrated();
  if (requestVersion !== ownerRequestVersion) return;

  const effectiveOwnerId = ownerId || LOCAL_OWNER_ID;
  useTransactionsStore.getState().setActiveOwner(effectiveOwnerId);
  useGoalsStore.getState().setActiveOwner(effectiveOwnerId);
  useBillsStore.getState().setActiveOwner(effectiveOwnerId);
  useOnboardingStore.getState().setActiveOwner(effectiveOwnerId);
  useNotificationPreferencesStore.getState().setActiveOwner(effectiveOwnerId);
};

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'offline'
  | 'serviceUnavailable'
  | 'error';

const invalidSessionCodes = new Set([
  'bad_jwt',
  'refresh_token_already_used',
  'refresh_token_not_found',
  'session_not_found',
  'user_not_found',
]);

const shouldInvalidateSession = (error: unknown) => {
  const authError = error as { code?: string; status?: number } | null;
  return authError?.status === 401
    || authError?.status === 403
    || (typeof authError?.code === 'string' && invalidSessionCodes.has(authError.code));
};

interface SessionState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  authStatus: AuthStatus;
  authError: string | null;
  syncing: boolean;
  setSession: (session: Session | null) => Promise<void>;
  initializeAuth: () => () => void;
  signOut: () => Promise<void>;
  syncOnboardingAnswers: (answers: Record<string, any>, completed: boolean) => Promise<boolean>;
  fetchOnboardingAnswers: () => Promise<Record<string, any> | null>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  authStatus: 'idle',
  authError: null,
  syncing: false,

  setSession: async (session) => {
    await setActiveFinancialOwner(session?.user.id ?? null);
    set({
      session,
      user: session?.user ?? null,
      loading: false,
      authStatus: session ? 'authenticated' : 'unauthenticated',
      authError: null,
    });
  },

  initializeAuth: () => {
    if (!isSupabaseConfigured) {
      void setActiveFinancialOwner(null).finally(() => {
        set({
          session: null,
          user: null,
          loading: false,
          authStatus: 'serviceUnavailable',
          authError: 'Authentication service is not configured.',
        });
      });
      return () => {};
    }

    set({ loading: true, authStatus: 'loading', authError: null });
    void supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        await setActiveFinancialOwner(null);
        set({ session: null, user: null, loading: false, authStatus: 'error', authError: error.message });
        return;
      }
      if (session) {
        const { error: validationError } = await supabase.auth.getUser();
        if (validationError) {
          if (!shouldInvalidateSession(validationError)) {
            await setActiveFinancialOwner(session.user.id);
            set({
              session,
              user: session.user,
              loading: false,
              authStatus: 'offline',
              authError: 'Your cached session could not be verified while offline.',
            });
            return;
          }
          await supabase.auth.signOut({ scope: 'local' });
          await setActiveFinancialOwner(null);
          set({
            session: null,
            user: null,
            loading: false,
            authStatus: 'unauthenticated',
            authError: 'Your session expired. Please sign in again.',
          });
          return;
        }
      }
      await setActiveFinancialOwner(session?.user.id ?? null);
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        authStatus: session ? 'authenticated' : 'unauthenticated',
        authError: null,
      });
    }).catch(async () => {
      await setActiveFinancialOwner(null);
      set({
        session: null,
        user: null,
        loading: false,
        authStatus: 'error',
        authError: 'Authentication could not be initialized.',
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const invalidSession = event === 'SIGNED_OUT';
      void setActiveFinancialOwner(invalidSession ? null : session?.user.id ?? null).then(() => {
        set({
          session: invalidSession ? null : session,
          user: invalidSession ? null : session?.user ?? null,
          loading: false,
          authStatus: !invalidSession && session ? 'authenticated' : 'unauthenticated',
          authError: null,
        });
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  signOut: async () => {
    set({ loading: true, authStatus: 'loading', authError: null });
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    await setActiveFinancialOwner(null);
    set({
      session: null,
      user: null,
      loading: false,
      authStatus: error ? 'error' : 'unauthenticated',
      authError: error?.message ?? null,
    });
    if (error) throw error;
  },

  syncOnboardingAnswers: async (answers: Record<string, any>, completed: boolean): Promise<boolean> => {
    const user = get().user;
    if (!user) return false;

    set({ syncing: true });
    const { error } = await supabase.from('onboarding_answers').upsert({
      user_id: user.id,
      answers_json: answers,
      onboarding_completed: completed,
    }, { onConflict: 'user_id' });
    set({ syncing: false });
    return !error;
  },

  fetchOnboardingAnswers: async (): Promise<Record<string, any> | null> => {
    const user = get().user;
    if (!user) return null;

    const { data, error } = await supabase
      .from('onboarding_answers')
      .select('answers_json')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    return data?.answers_json as Record<string, any> | null;
  },
}));
