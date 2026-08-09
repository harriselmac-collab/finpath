import { describe, expect, test, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import * as SecureStore from 'expo-secure-store';
import {
  ExpoSecureStoreAdapter,
  hasSupabaseCredentials,
  shouldEnableAuthSimulation,
} from '../services/supabase/supabaseClient';

// Mock expo-secure-store as namespace exports
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve('mock-token')),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

describe('Supabase SecureStore Storage Adapter', () => {
  test('getItem delegates to SecureStore', async () => {
    const value = await ExpoSecureStoreAdapter.getItem('supabase-auth-token');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('supabase-auth-token');
    expect(value).toBe('mock-token');
  });

  test('setItem delegates to SecureStore', async () => {
    await ExpoSecureStoreAdapter.setItem('supabase-auth-token', 'new-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('supabase-auth-token', 'new-token');
  });

  test('removeItem delegates to SecureStore', async () => {
    await ExpoSecureStoreAdapter.removeItem('supabase-auth-token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('supabase-auth-token');
  });

  test('does not hide secure storage failures', async () => {
    jest.mocked(SecureStore.setItemAsync).mockRejectedValueOnce(new Error('keychain unavailable'));
    await expect(ExpoSecureStoreAdapter.setItem('token', 'value')).rejects.toThrow('keychain unavailable');
  });
});

describe('Production authentication configuration', () => {
  test('requires both real Supabase credentials', () => {
    expect(hasSupabaseCredentials(undefined, undefined)).toBe(false);
    expect(hasSupabaseCredentials('https://mock-url.supabase.co', 'mock-anon-key-placeholder')).toBe(false);
    expect(hasSupabaseCredentials('https://example.supabase.co', 'real-anon-key')).toBe(true);
  });

  test('allows simulation only in development with the explicit flag', () => {
    expect(shouldEnableAuthSimulation(false, 'true')).toBe(false);
    expect(shouldEnableAuthSimulation(true, 'false')).toBe(false);
    expect(shouldEnableAuthSimulation(true, 'true')).toBe(true);
  });
});

describe('Supabase Schema SQL Migrations Static Verification', () => {
  test('migration file should define all 17 tables with RLS and triggers', () => {
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/0001_initial_schema.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    // List of 17 required tables
    const requiredTables = [
      'profiles',
      'onboarding_answers',
      'income_sources',
      'recurring_expenses',
      'annual_expenses',
      'transactions',
      'debts',
      'debt_payments',
      'goals',
      'goal_contributions',
      'upcoming_events',
      'event_contributions',
      'financial_plans',
      'financial_plan_items',
      'ai_insights',
      'notification_preferences',
      'user_preferences',
    ];

    // Assert CREATE TABLE exists for each table
    requiredTables.forEach((table) => {
      expect(sqlContent).toContain(`CREATE TABLE ${table}`);
    });

    // Assert ROW LEVEL SECURITY is enabled on all tables
    requiredTables.forEach((table) => {
      expect(sqlContent).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    });

    // Assert update trigger is added to keep timestamps updated
    requiredTables.forEach((table) => {
      expect(sqlContent).toContain(`BEFORE UPDATE ON ${table}`);
    });

    // Verify policies contain auth.uid() checks
    expect(sqlContent).toContain('auth.uid() = user_id');
  });
});
