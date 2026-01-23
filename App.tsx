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
  const [showingTerms, setShowingTerms] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Handle user state changes
  React.useEffect(() => {
    const subscriber = auth().onAuthStateChanged(userState => {
      setUser(userState);
      if (userState) {
        setIsVerified(userState.emailVerified);
      } else {
        setIsVerified(false);
      }
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  // AUTO-POLL VERIFICATION STATUS
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (user && !isVerified) {
      console.log('--- STARTING VERIFICATION POLL ---');
      interval = setInterval(async () => {
        try {
          const u = auth().currentUser;
          if (u) {
            await u.reload();
            await u.getIdToken(true); // Force token refresh
            const updatedUser = auth().currentUser;
            console.log('App Poll - Verified:', updatedUser?.emailVerified);

            if (updatedUser?.emailVerified) {
              console.log('✅ VERIFICATION DETECTED');
              setIsVerified(true);
              setUser(updatedUser);
            }
          }
        } catch (e) {
          console.error('App Poll Error:', e);
        }
      }, 3000);
    }

    return () => {
      if (interval) {
        console.log('--- STOPPING VERIFICATION POLL ---');
        clearInterval(interval);
      }
    };
  }, [user, isVerified]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0b2e26" />
      </View>
    );
  }

  if (user) {
    // BLOCK ACCESS TO DASHBOARD IF EMAIL IS NOT VERIFIED
    const isEmailProvider = user.providerData.some(p => p.providerId === 'password');
    if (isEmailProvider && !isVerified) {
      return <VerificationPendingScreen />;
    }

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
            onShowTerms={() => setShowingTerms(true)}
          />
        </View>
      )}

      {showingTerms && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 2 }]}>
          <TermsScreen onClose={() => setShowingTerms(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ... any other global styles if needed
});

export default App;
