import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'nanoanalyzer_user_session';
const USER_ID_KEY = 'nanoanalyzer_user_id';

// Fallback in-memory storage for web/environments where SecureStore is unavailable
let memoryStorage = {};

async function setItem(key, value) {
  try {
    if (Platform.OS === 'web') {
      memoryStorage[key] = value;
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (e) {
    memoryStorage[key] = value;
  }
}

async function getItem(key) {
  try {
    if (Platform.OS === 'web') {
      return memoryStorage[key] || null;
    }
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    return memoryStorage[key] || null;
  }
}

async function deleteItem(key) {
  try {
    if (Platform.OS === 'web') {
      delete memoryStorage[key];
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (e) {
    delete memoryStorage[key];
  }
}

export const saveSession = async (user) => {
  if (!user || !user.id) return;
  await setItem(SESSION_KEY, JSON.stringify(user));
  await setItem(USER_ID_KEY, user.id);
};

export const getSession = async () => {
  const json = await getItem(SESSION_KEY);
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

export const getUserId = async () => {
  return await getItem(USER_ID_KEY);
};

export const clearSession = async () => {
  await deleteItem(SESSION_KEY);
  await deleteItem(USER_ID_KEY);
};
