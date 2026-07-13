import { describe, expect, test } from '@jest/globals';
import { parseQuickEntry } from '../utils/nlpParser';

describe('Natural Language Processing Transaction Parser', () => {
  test('should parse essential housing rent commands correctly', () => {
    const parsed = parseQuickEntry('rent 2500');
    expect(parsed).not.toBeNull();
    expect(parsed?.amount).toBe(2500);
    expect(parsed?.name).toBe('Rent');
    expect(parsed?.type).toBe('essential');
    expect(parsed?.category).toBe('Housing');
  });

  test('should parse essential vehicle fuel commands correctly', () => {
    const parsed = parseQuickEntry('uber fuel 150.50');
    expect(parsed).not.toBeNull();
    expect(parsed?.amount).toBe(150.5);
    expect(parsed?.name).toBe('Uber fuel');
    expect(parsed?.type).toBe('essential');
    expect(parsed?.category).toBe('Vehicle');
  });

  test('should parse flexible dining out cafe commands correctly', () => {
    const parsed = parseQuickEntry('coffee 45');
    expect(parsed).not.toBeNull();
    expect(parsed?.amount).toBe(45);
    expect(parsed?.name).toBe('Coffee');
    expect(parsed?.type).toBe('flexible');
    expect(parsed?.category).toBe('Dining Out');
  });

  test('should parse income salary commands correctly', () => {
    const parsed = parseQuickEntry('freelance wage 8000');
    expect(parsed).not.toBeNull();
    expect(parsed?.amount).toBe(8000);
    expect(parsed?.name).toBe('Freelance wage');
    expect(parsed?.type).toBe('income');
    expect(parsed?.category).toBe('Salary');
  });

  test('should return null for invalid commands without numeric amounts', () => {
    const parsed = parseQuickEntry('just random text here');
    expect(parsed).toBeNull();
  });

  test('should return null for empty commands', () => {
    const parsed = parseQuickEntry('');
    expect(parsed).toBeNull();
  });
});
