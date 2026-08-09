import { describe, expect, test } from '@jest/globals';
import { buildSupportEmailUrl } from '../services/support/openSupportEmail';

describe('support email', () => {
  test('encodes user input instead of claiming a fake submission', () => {
    expect(buildSupportEmailUrl('help@example.com', 'Budget & goals', 'Line 1\nLine 2'))
      .toBe('mailto:help@example.com?subject=Budget%20%26%20goals&body=Line%201%0ALine%202');
  });
});
