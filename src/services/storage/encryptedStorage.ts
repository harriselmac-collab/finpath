import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AESEncryptionKey,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync,
} from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY_NAME = 'pocket-ahead-financial-storage-key-v1';
const PREFIX = 'enc:v1:';

let keyPromise: Promise<AESEncryptionKey> | null = null;

export const base64ToBytes = (encoded: string): Uint8Array => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const getKey = () => {
  keyPromise ??= (async () => {
    const encoded = await SecureStore.getItemAsync(KEY_NAME);
    if (encoded) return AESEncryptionKey.import(encoded, 'base64');

    const key = await AESEncryptionKey.generate();
    await SecureStore.setItemAsync(KEY_NAME, await key.encoded('base64'));
    return key;
  })();
  return keyPromise;
};

const encrypt = async (value: string) => {
  const sealed = await aesEncryptAsync(new TextEncoder().encode(value), await getKey());
  return `${PREFIX}${await sealed.combined('base64')}`;
};

const decrypt = async (value: string) => {
  // Expo Crypto's Android bridge currently rejects a base64 string here even
  // though the TypeScript API accepts one. Passing bytes works on every target.
  const sealed = AESSealedData.fromCombined(base64ToBytes(value.slice(PREFIX.length)));
  const plaintext = await aesDecryptAsync(sealed, await getKey());
  return new TextDecoder().decode(plaintext as Uint8Array);
};

const webFinancialStorage = {
  getItem: (name: string) => typeof window === 'undefined'
    ? Promise.resolve(null)
    : AsyncStorage.getItem(name),
  setItem: (name: string, value: string) => typeof window === 'undefined'
    ? Promise.resolve()
    : AsyncStorage.setItem(name, value),
  removeItem: (name: string) => typeof window === 'undefined'
    ? Promise.resolve()
    : AsyncStorage.removeItem(name),
};

export const encryptedFinancialStorage = Platform.OS === 'web'
  ? webFinancialStorage
  : {
      getItem: async (name: string) => {
        const stored = await AsyncStorage.getItem(name);
        if (!stored || stored.startsWith(PREFIX)) {
          return stored ? decrypt(stored) : null;
        }

        // Migrate legacy plaintext only after the encrypted write succeeds.
        await AsyncStorage.setItem(name, await encrypt(stored));
        return stored;
      },
      setItem: async (name: string, value: string) => {
        await AsyncStorage.setItem(name, await encrypt(value));
      },
      removeItem: (name: string) => AsyncStorage.removeItem(name),
    };
