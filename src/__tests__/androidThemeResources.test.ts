import { describe, expect, it, jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import appConfig from '../../app.json';

jest.mock('@/global.css', () => ({}));

// Expo config plugins load through CommonJS during prebuild.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const androidColorsPlugin = require('../../plugins/with-pocket-ahead-colors');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DARK_COLORS, LIGHT_COLORS } = require('../constants/theme');

const pngDimensions = (path: string) => {
  const image = readFileSync(join(process.cwd(), path));
  return [image.readUInt32BE(16), image.readUInt32BE(20)];
};

describe('Android theme resources', () => {
  it('registers the palette resource plugin in Expo configuration', () => {
    expect(appConfig.expo.plugins).toContain('./plugins/with-pocket-ahead-colors');
  });

  it('keeps generated Android resources aligned with runtime theme tokens', () => {
    expect(androidColorsPlugin.LIGHT_COLORS).toEqual(LIGHT_COLORS);
    expect(androidColorsPlugin.DARK_COLORS).toEqual(DARK_COLORS);
  });

  it('keeps the launcher icon square and Android-mask safe', () => {
    expect(appConfig.expo.icon).toBe('./assets/branding/app-icon.png');
    expect(appConfig.expo.android.adaptiveIcon).toEqual({
      backgroundColor: '#1858EB',
      foregroundImage: './assets/branding/android-icon-foreground.png',
    });
    expect(pngDimensions('assets/branding/app-icon.png')).toEqual([1024, 1024]);
    expect(pngDimensions('assets/branding/android-icon-foreground.png')).toEqual([1024, 1024]);
  });
});
