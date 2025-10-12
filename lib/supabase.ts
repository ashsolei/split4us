import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://jdvgnwftjivmqcllezxa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkdmdud2Z0aml2bXFjbGxlenhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1OTIyNjcsImV4cCI6MjA0MzE2ODI2N30.h9MU5_V0fv3KpTEXx-VzZyI9BUy3pQD4L05Q_rz5xhE';

// Custom storage adapter using Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for mobile
  },
});
