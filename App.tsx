/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, useColorScheme, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/LoginScreen';
import { UserDashboard } from './src/screens/UserDashboard';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { VerificationPendingScreen } from './src/screens/VerificationPendingScreen';
import { TermsScreen } from './src/screens/TermsScreen';

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
  const [showingTerms, setShowingTerms] = useState<'terms' | 'privacy' | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Handle user state changes
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    console.log('App: Setting up auth subscriber');
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b2e26' }}>
        <ActivityIndicator size="large" color="#00e600" />
      </View>
    );
  }

  if (user) {
    return (
      <UserDashboard
        onSignOut={async () => {
          console.log('User signed out');
          // Auth state listener will handle the state update
        }}
      />
    );
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
              setAuthMode(null);
              // user state update via onAuthStateChanged will switch screen
            }}
            onBack={() => setAuthMode(null)}
            onShowTerms={(tab) => setShowingTerms(tab || 'terms')}
          />
        </View>
      )}

      {showingTerms && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 2 }]}>
          <TermsScreen
            initialTab={showingTerms}
            onClose={() => setShowingTerms(null)}
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
