import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase/supabaseClient';

interface SessionState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  syncing: boolean;
  setSession: (session: Session | null) => void;
  initializeAuth: () => () => void; // Returns unsubscribe function
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
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, loading: false });
    });

    // Subscribe to changes
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
    
    const isMockSupabase = !process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('mock-url.supabase.co');
    if (isMockSupabase) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      set({ syncing: false });
      return true;
    }

    try {
      // Upsert answers based on user_id
      const { error } = await supabase.from('onboarding_answers').upsert(
        {
          user_id: user.id,
          answers_json: answers,
          onboarding_completed: completed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      set({ syncing: false });
      return !error;
    } catch {
      set({ syncing: false });
      return false;
    }
  },

  fetchOnboardingAnswers: async (): Promise<Record<string, any> | null> => {
    const user = get().user;
    if (!user) return null;

    set({ loading: true });
    
    const isMockSupabase = !process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('mock-url.supabase.co');
    if (isMockSupabase) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      set({ loading: false });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('onboarding_answers')
        .select('answers_json')
        .eq('user_id', user.id)
        .maybeSingle();

      set({ loading: false });
      if (error || !data) return null;
      return data.answers_json as Record<string, any>;
    } catch {
      set({ loading: false });
      return null;
    }
  },
}));
