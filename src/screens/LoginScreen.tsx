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
  onBack?: () => void;
}

export function LoginScreen({ onLoginSuccess, onBack }: LoginScreenProps) {
  const [authMethod, setAuthMethod] = useState<'selection' | 'email' | 'phone'>('selection');

  // Existing state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirm, setConfirm] = useState<any>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();

  // Reset state when switching methods
  const switchMethod = (method: 'selection' | 'email' | 'phone') => {
    setError('');
    setAuthMethod(method);
  };

  const handleEmailLogin = async () => {
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please enter both email and password');
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
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (authMethod === 'selection') {
            if (onBack) onBack();
          } else {
            switchMethod('selection');
          }
        }} style={styles.backButton}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>

        {authMethod === 'selection' && (
          <>
            <Text style={styles.title}>First, let's set up your MobileX account.</Text>
            <Text style={styles.subtitle}>You can come back anytime to pick up where you left off.</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.whiteButton} onPress={() => switchMethod('email')}>
                <Text style={styles.whiteButtonText}>Continue with email</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.whiteButton} onPress={() => switchMethod('phone')}>
                <Text style={styles.whiteButtonText}>Continue with Phone</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.disclaimer}>
              By continuing, you agree to our <Text style={styles.bold}>Terms of Service</Text> and confirm that you've read our <Text style={styles.bold}>Privacy Policy</Text>.
            </Text>
          </>
        )}

        {authMethod === 'email' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Get started with MobileX.</Text>
            <Text style={styles.formSubtitle}>You can come back anytime to pick up where you left off.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.minimalInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.minimalInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.darkButton, loading && styles.buttonDisabled]}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.darkButtonText}>Login</Text>}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              By continuing, you agree to our <Text style={styles.bold}>Terms of Service</Text> and confirm that you've read our <Text style={styles.bold}>Privacy Policy</Text>.
            </Text>
          </View>
        )}

        {authMethod === 'phone' && (
          <View style={styles.formContainer}>
            {!confirm ? (
              <>
                <Text style={styles.formTitle}>Get a temporary PIN to sign in to your account.</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>MobileX phone number</Text>
                  <TextInput
                    style={styles.minimalInput}
                    placeholder="413-555-3854"
                    placeholderTextColor="#999"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.darkButton, loading && styles.buttonDisabled]}
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.darkButtonText}>Next</Text>}
                </TouchableOpacity>

                <Text style={styles.disclaimer}>
                  *PINs can only be sent to your MobileX number.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.formTitle}>Enter your PIN.</Text>
                <Text style={styles.formSubtitle}>Enter the code sent to {phoneNumber}</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirmation Code</Text>
                  <TextInput
                    style={styles.minimalInput}
                    placeholder="000000"
                    placeholderTextColor="#999"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.darkButton, loading && styles.buttonDisabled]}
                  onPress={handleVerifyCode}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.darkButtonText}>Verify</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setConfirm(null); setCode(''); }} style={styles.linkButton}>
                  <Text style={styles.linkText}>Change Phone Number</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    color: '#666',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    backgroundColor: '#1a2e26', // Dark Green/Black for social
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  whiteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  whiteButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  greenButton: {
    backgroundColor: '#00e600',
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  greenButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  helperText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  formContainer: {
    marginTop: 20,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 32,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  minimalInput: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  darkButton: {
    backgroundColor: '#0b2e26', // Dark Green almost black
    borderRadius: 4,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  darkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
