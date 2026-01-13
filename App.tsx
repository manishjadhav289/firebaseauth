/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, useColorScheme, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/LoginScreen';
import { UserDashboard } from './src/screens/UserDashboard';
import { WelcomeScreen } from './src/screens/WelcomeScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0b2e26" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

  if (isAuthenticated) {
    return <UserDashboard onSignOut={() => setIsAuthenticated(false)} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <WelcomeScreen
        onSignIn={() => setAuthMode('login')}
        onSignUp={() => setAuthMode('signup')}
      />
      {authMode && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]}>
          <LoginScreen
            mode={authMode}
            onLoginSuccess={() => setIsAuthenticated(true)}
            onBack={() => setAuthMode(null)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ... any other global styles if needed
});

export default App;
