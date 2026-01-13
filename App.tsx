/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
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
  const [showLogin, setShowLogin] = useState(false);

  if (isAuthenticated) {
    return <UserDashboard onSignOut={() => setIsAuthenticated(false)} />;
  }

  if (showLogin) {
    return (
      <LoginScreen
        onLoginSuccess={() => setIsAuthenticated(true)}
        onBack={() => setShowLogin(false)}
      />
    );
  }

  return <WelcomeScreen onSignIn={() => setShowLogin(true)} />;
}

export default App;
