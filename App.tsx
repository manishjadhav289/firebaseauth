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

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { ActivityIndicator } from 'react-native';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0b2e26" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

  // Handle user state changes
  React.useEffect(() => {
    const subscriber = auth().onAuthStateChanged(userState => {
      setUser(userState);
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0b2e26" />
      </View>
    );
  }

  if (user) {
    return <UserDashboard onSignOut={() => setUser(null)} />;
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
            onLoginSuccess={() => {
              // No need to manually set state here, onAuthStateChanged will handle it
              // But we can reset authMode to clean up
              setAuthMode(null);
            }}
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
