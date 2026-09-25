import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ApiClient, apiUrl } from './client';
const key = 'saydaliyati.refresh.v1';
const Context = createContext<{
  client: ApiClient;
  signedIn: boolean;
  ready: boolean;
  setSignedIn(value: boolean): void;
} | null>(null);
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new ApiClient(apiUrl(process.env.EXPO_PUBLIC_API_URL, __DEV__), {
        get: () => SecureStore.getItemAsync(key),
        set: (value) => SecureStore.setItemAsync(key, value),
        clear: () => SecureStore.deleteItemAsync(key),
      }),
  );
  const [signedIn, setSignedIn] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    client
      .restore()
      .then((value) => {
        if (live) setSignedIn(value);
      })
      .catch(() => {})
      .finally(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, [client]);
  return (
    <Context.Provider value={{ client, signedIn, ready, setSignedIn }}>
      {children}
    </Context.Provider>
  );
}
export function useSession() {
  const context = useContext(Context);
  if (!context) throw new Error('Session unavailable');
  return context;
}
