import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../services/supabase/supabaseClient';
import { useTransactionsStore } from './transactionsStore';
import { useGoalsStore } from './goalsStore';
import { useBillsStore } from './billsStore';
import { useOnboardingStore } from './onboardingStore';
import { useNotificationPreferencesStore } from './notificationPreferencesStore';

export const LOCAL_OWNER_ID = 'local';

const setActiveFinancialOwner = (ownerId: string | null) => {
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

interface SessionState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  authStatus: AuthStatus;
  authError: string | null;
  syncing: boolean;
  setSession: (session: Session | null) => void;
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

  setSession: (session) => {
    setActiveFinancialOwner(session?.user.id ?? null);
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
      set({
        session: null,
        user: null,
        loading: false,
        authStatus: 'serviceUnavailable',
        authError: 'Authentication service is not configured.',
      });
      return () => {};
    }

    set({ loading: true, authStatus: 'loading', authError: null });
    void supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        set({ session: null, user: null, loading: false, authStatus: 'error', authError: error.message });
        return;
      }
      if (session) {
        const { error: validationError } = await supabase.auth.getUser();
        if (validationError) {
          await supabase.auth.signOut({ scope: 'local' });
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
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        authStatus: session ? 'authenticated' : 'unauthenticated',
        authError: null,
      });
      setActiveFinancialOwner(session?.user.id ?? null);
    }).catch(() => {
      setActiveFinancialOwner(null);
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
      setActiveFinancialOwner(invalidSession ? null : session?.user.id ?? null);
      set({
        session: invalidSession ? null : session,
        user: invalidSession ? null : session?.user ?? null,
        loading: false,
        authStatus: !invalidSession && session ? 'authenticated' : 'unauthenticated',
        authError: null,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  signOut: async () => {
    set({ loading: true, authStatus: 'loading', authError: null });
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    setActiveFinancialOwner(null);
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
