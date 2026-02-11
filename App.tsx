import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OnlineStatusIndicator } from './components/OnlineStatusIndicator';
import Navigation from './navigation';

function AppContent() {
  const { isDark } = useTheme();
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
        <OnlineStatusIndicator />
        <StatusBar style={isDark ? 'light' : 'auto'} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
