import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirm, setConfirm] = useState<any>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();

  const handleEmailLogin = async () => {
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      await auth().signInWithEmailAndPassword(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    setError('');
    setLoading(true);
    try {
      if (!phoneNumber) {
        setError('Please enter a valid phone number');
        return;
      }
      // Phone number validation could be added here
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
    } catch (error: any) {
      console.error('Phone auth error:', error);
      setError('Failed to send code. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setLoading(true);
    try {
      if (!code) {
        setError('Please enter the verification code');
        return;
      }
      await confirm.confirm(code);
      if (onLoginSuccess) onLoginSuccess();
    } catch (error: any) {
      console.error('Verification error:', error);
      setError('Invalid code.');
      setLoading(false); // Only stop loading on error, success unmounts
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
        <Text style={styles.title}>Login</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, mode === 'email' && styles.activeTab]}
            onPress={() => { setMode('email'); setError(''); }}
          >
            <Text style={[styles.tabText, mode === 'email' && styles.activeTabText]}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'phone' && styles.activeTab]}
            onPress={() => { setMode('phone'); setError(''); }}
          >
            <Text style={[styles.tabText, mode === 'phone' && styles.activeTabText]}>Phone</Text>
          </TouchableOpacity>
        </View>

        {mode === 'email' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {!confirm ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number (e.g. +1 650-555-1234)"
                  placeholderTextColor="#999"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Code</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.subtitle}>Enter the code sent to {phoneNumber}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmation Code"
                  placeholderTextColor="#999"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleVerifyCode}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Code</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setConfirm(null); setCode(''); }} style={styles.linkButton}>
                  <Text style={styles.linkText}>Change Phone Number</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
