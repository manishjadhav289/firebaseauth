
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface UserDashboardProps {
  onSignOut?: () => void;
}

export function UserDashboard({ onSignOut }: UserDashboardProps) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const user = auth().currentUser;

  // LOG TOKEN ON MOUNT
  React.useEffect(() => {
    const logTokenInfo = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          console.log('--- USER LOGGED IN ---');
          const tokenResult = await user.getIdTokenResult(true);
          console.log('@@@START_JWT@@@');
          console.log(JSON.stringify({
            token: tokenResult.token,
            claims: tokenResult.claims
          }, null, 2));
          console.log('@@@END_JWT@@@');
        } else {
          console.log('No user signed in');
        }
      } catch (e) {
        console.error('Failed to log token info:', e);
      }
    };

    logTokenInfo();
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await auth().signOut();
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        console.log('Google Sign-Out error', e);
      }
      if (onSignOut) {
        onSignOut();
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>{user?.email || user?.phoneNumber || 'User'}</Text>
        <Text style={styles.statusText}>You are signed in and verified.</Text>

        <TouchableOpacity
          style={[styles.signOutButton, loading && styles.buttonDisabled]}
          onPress={handleSignOut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#4caf50', // Green
    fontWeight: '600',
    marginBottom: 40,
  },
  signOutButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
