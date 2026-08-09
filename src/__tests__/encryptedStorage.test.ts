import { expect, jest, test } from '@jest/globals';
import { encryptedFinancialStorage } from '../services/storage/encryptedStorage';

const mockMemory = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockMemory.get(key) ?? null)),
  setItem: jest.fn((key: string, value: string) => { mockMemory.set(key, value); return Promise.resolve(); }),
  removeItem: jest.fn((key: string) => { mockMemory.delete(key); return Promise.resolve(); }),
}));

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
}));
test('encrypts new values and safely migrates legacy plaintext', async () => {
  await encryptedFinancialStorage.setItem('new', 'financial data');
  expect(mockMemory.get('new')).toMatch(/^enc:v1:/);
  expect(mockMemory.get('new')).not.toContain('financial data');
  await expect(encryptedFinancialStorage.getItem('new')).resolves.toBe('financial data');

  mockMemory.set('legacy', 'old financial data');
  await expect(encryptedFinancialStorage.getItem('legacy')).resolves.toBe('old financial data');
  expect(mockMemory.get('legacy')).toMatch(/^enc:v1:/);
  expect(mockMemory.get('legacy')).not.toContain('old financial data');
});
