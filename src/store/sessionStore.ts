import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase/supabaseClient';
import { MOCK_SESSION_DELAY } from '../mocks/supabaseMock';

interface SessionState {
  session: Session | null;
  user: User | null;
  loading: boolean;
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
  syncing: false,

  setSession: (session) => {
    set({ session, user: session?.user ?? null, loading: false });
  },

  initializeAuth: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, loading: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ session: null, user: null, loading: false });
  },

  syncOnboardingAnswers: async (answers: Record<string, any>, completed: boolean): Promise<boolean> => {
    const user = get().user;
    if (!user) return false;

    set({ syncing: true });
    
    await new Promise((resolve) => setTimeout(resolve, MOCK_SESSION_DELAY));
    set({ syncing: false });
    return true;
  },

  fetchOnboardingAnswers: async (): Promise<Record<string, any> | null> => {
    const user = get().user;
    if (!user) return null;

    set({ loading: true });
    
    await new Promise((resolve) => setTimeout(resolve, MOCK_SESSION_DELAY));
    set({ loading: false });
    return null;
  },
}));
