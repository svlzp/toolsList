import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useActions } from './useActions';
import { useAppSelector } from './reduxHooks';

const AUTH_STORAGE_KEY = '@auth_tokens';

interface StoredAuth {
  accessToken: string;
  refreshToken?: string;
}


export const saveAuthToStorage = async (tokens: StoredAuth): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error saving auth to storage:', error);
  }
};


export const getAuthFromStorage = async (): Promise<StoredAuth | null> => {
  try {
    const value = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting auth from storage:', error);
    return null;
  }
};


export const removeAuthFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Error removing auth from storage:', error);
  }
};


export const useAuthPersist = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setStoredTokens] = useState<StoredAuth | null>(null);

  useEffect(() => {
    const restoreAuth = async () => {
      const storedAuth = await getAuthFromStorage();
      setStoredTokens(storedAuth);
      setIsLoading(false);
    };

    restoreAuth();
  }, []);

  return { isLoading, tokens };
};
