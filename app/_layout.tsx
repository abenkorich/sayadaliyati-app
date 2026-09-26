import { LanguageProvider } from '../src/language';
import { ScanSettingsProvider } from '../src/scan-settings';
import { Stack } from 'expo-router';
import { SessionProvider } from '../src/session';
export default function Layout() {
  return (
    <LanguageProvider>
      <SessionProvider>
        <ScanSettingsProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ScanSettingsProvider>
      </SessionProvider>
    </LanguageProvider>
  );
}
