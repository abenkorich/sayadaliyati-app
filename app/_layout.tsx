import { LanguageProvider } from '../src/language';
import { Stack } from 'expo-router';
import { SessionProvider } from '../src/session';
export default function Layout() {
  return (
    <LanguageProvider>
      <SessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SessionProvider>
    </LanguageProvider>
  );
}
