import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'employee_token';
const PHONE_KEY = 'employee_phone';
const NAME_KEY = 'employee_name';

export async function purgeLegacyStorage() {
  try {
    // Remove keys from web localStorage if available
    if (typeof localStorage !== 'undefined') {
      try { localStorage.removeItem('admin_user'); } catch {}
      try { localStorage.removeItem('auth_token'); } catch {}
      try { localStorage.removeItem('companies_list'); } catch {}
      try { localStorage.removeItem('employees_count'); } catch {}
    }
    // Remove from AsyncStorage for native/web fallback
    await AsyncStorage.removeItem('admin_user');
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('companies_list');
    await AsyncStorage.removeItem('employees_count');
  } catch {}
}

export async function isSignedIn() {
  if (Platform.OS === 'web') {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    return !!t;
  }
  const t = await SecureStore.getItemAsync(TOKEN_KEY);
  return !!t;
}

export async function signIn(token: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function signOut() {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(PHONE_KEY);
    await AsyncStorage.removeItem(NAME_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getEmployeeId(): Promise<string | undefined> {
  if (Platform.OS === 'web') {
    const p = await AsyncStorage.getItem(PHONE_KEY);
    return p || undefined;
  }
  const p = await SecureStore.getItemAsync(PHONE_KEY);
  return p || undefined;
}

export async function setEmployeeName(name: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(NAME_KEY, name);
    return;
  }
  await AsyncStorage.setItem(NAME_KEY, name);
}

export async function getEmployeeName(): Promise<string | undefined> {
  const n = await AsyncStorage.getItem(NAME_KEY);
  return n || undefined;
}
