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
  const sealed = AESSealedData.fromCombined(value.slice(PREFIX.length));
  const plaintext = await aesDecryptAsync(sealed, await getKey());
  return new TextDecoder().decode(plaintext as Uint8Array);
};

export const encryptedFinancialStorage = Platform.OS === 'web'
  ? AsyncStorage
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
