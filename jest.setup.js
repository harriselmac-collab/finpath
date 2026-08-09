jest.mock('expo-crypto', () => {
  class MockKey {
    static import() { return Promise.resolve(new MockKey()); }
    static generate() { return Promise.resolve(new MockKey()); }
    encoded() { return Promise.resolve('mock-key'); }
  }

  return {
    AESEncryptionKey: MockKey,
    AESSealedData: { fromCombined: (value) => ({ value }) },
    aesEncryptAsync: async (value) => ({
      combined: async () => Buffer.from(value).toString('base64'),
    }),
    aesDecryptAsync: async ({ value }) => new Uint8Array(Buffer.from(value, 'base64')),
  };
});

Object.defineProperty(globalThis, 'fetch', {
  configurable: true,
  writable: true,
  value: jest.fn(),
});
