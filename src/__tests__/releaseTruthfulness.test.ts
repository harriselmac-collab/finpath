import { describe, expect, test } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('release-facing claims', () => {
  test('welcome copy does not advertise an unavailable AI service', () => {
    ['en', 'fr', 'ar'].forEach((language) => {
      const copy = JSON.parse(read(`src/constants/translations/${language}.json`));
      expect(`${copy.welcome.subtitle} ${copy.welcome.privacyNotice}`).not.toMatch(/Gemini|\bAI\b|\bIA\b|الذكاء الاصطناعي/i);
    });
  });

  test('notification settings expose only implemented reminder categories', () => {
    const screen = read('src/app/profile/notifications.tsx');
    ['weeklySummary', 'savingsTitle', 'culturalEvents', 'productUpdates', "setPreference('marketing')"]
      .forEach((unsupported) => expect(screen).not.toContain(unsupported));
    ['preferences.bills', 'preferences.debts', 'preferences.goals', 'preferences.monthlyReview']
      .forEach((implemented) => expect(screen).toContain(implemented));
  });

  test('public account deletion uses real authenticated deletion instead of a mock submission', () => {
    const page = read('docs/delete-account.html');
    const script = read('docs/account-deletion.js');
    const edgeFunction = read('supabase/functions/delete-account/index.ts');
    expect(page).toContain('Type DELETE to continue');
    expect(script).toContain('signInWithPassword');
    expect(script).toContain("provider: 'google'");
    expect(script).toContain("functions.invoke('delete-account'");
    expect(script).not.toMatch(/request submitted|would submit|mock/i);
    expect(edgeFunction).toContain("request.method === 'OPTIONS'");
    expect(edgeFunction).toContain("'Access-Control-Allow-Origin': '*'");
  });
});
