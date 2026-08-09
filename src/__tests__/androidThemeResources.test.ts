import { describe, expect, it, jest } from '@jest/globals';
import appConfig from '../../app.json';

jest.mock('@/global.css', () => ({}));

// Expo config plugins load through CommonJS during prebuild.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const androidColorsPlugin = require('../../plugins/with-pocket-ahead-colors');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DARK_COLORS, LIGHT_COLORS } = require('../constants/theme');

describe('Android theme resources', () => {
  it('registers the palette resource plugin in Expo configuration', () => {
    expect(appConfig.expo.plugins).toContain('./plugins/with-pocket-ahead-colors');
  });

  it('keeps generated Android resources aligned with runtime theme tokens', () => {
    expect(androidColorsPlugin.LIGHT_COLORS).toEqual(LIGHT_COLORS);
    expect(androidColorsPlugin.DARK_COLORS).toEqual(DARK_COLORS);
  });
});
