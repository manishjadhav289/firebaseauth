import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

interface LoginScreenProps {
  mode: 'login' | 'signup';
  onLoginSuccess?: () => void;
  onBack?: () => void;
}

export function LoginScreen({ mode: initialMode, onLoginSuccess, onBack }: LoginScreenProps) {
  const [authMethod, setAuthMethod] = useState<'selection' | 'email' | 'phone' | 'forgotPassword'>('selection');
  const [resetSent, setResetSent] = useState(false);

  // Existing state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirm, setConfirm] = useState<any>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '26055029207-9vq8sd5nlcloda0o1p06pskdq68h38at.apps.googleusercontent.com',
    });
  }, []);

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const signInResult = await GoogleSignin.signIn();

      // Check if cancelled
      if (signInResult.type === 'cancelled') {
        return;
      }

      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token found');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      await auth().signInWithCredential(googleCredential);

      if (onLoginSuccess) onLoginSuccess();
    } catch (error: any) {
      console.error(error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        setError('Google Play Services not available.');
      } else {
        // some other error happened
        setError('Google Sign-In failed.');
      }
    }
  };

  // Reset state when switching methods
  const switchMethod = (method: 'selection' | 'email' | 'phone' | 'forgotPassword') => {
    setError('');
    setAuthMethod(method);
  };

  const handleEmailAction = async () => {
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }

      if (initialMode === 'signup') {
        await auth().createUserWithEmailAndPassword(email, password);
      } else {
        await auth().signInWithEmailAndPassword(email, password);
      }

      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('That email address is already in use!');
      } else if (err.code === 'auth/invalid-email') {
        setError('That email address is invalid!');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else {
        setError(initialMode === 'signup' ? 'Sign up failed.' : 'Login failed.');
        if (err.message) setError(err.message);
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

  const handleForgotPassword = async () => {
    setError('');
    setLoading(true);
    try {
      if (!email) {
        setError('Please enter your email address');
        return;
      }
      await auth().sendPasswordResetEmail(email);
      setResetSent(true);
    } catch (error: any) {
      console.error('Forgot Password error:', error);
      if (error.code === 'auth/user-not-found') {
        // Show explicit warning modal as requested
        Alert.alert('User Not Found', 'No user found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Failed to send reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.overlayContainer}>
        {/* Dimmed Background - tapping it closes the modal */}
        <TouchableOpacity
          style={styles.dimmedBackground}
          activeOpacity={1}
          onPress={() => {
            if (onBack) onBack();
          }}
        />

        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
          {/* Drag Handle Icon */}
          <View style={styles.handleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.content}>

            {authMethod === 'selection' && (
              <>
                <Text style={styles.title}>
                  {initialMode === 'signup' ? "Get started with MobileX." : "Welcome back."}
                </Text>

                <Text style={styles.subtitle}>
                  {initialMode === 'signup' ? "You can come back anytime to pick up where you left off." : "Log in to your account."}
                </Text>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialButtonText}>Continue with Apple</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.socialButton} onPress={onGoogleButtonPress}>
                    <Text style={styles.socialButtonText}>Continue with Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.whiteButton} onPress={() => switchMethod('email')}>
                    <Text style={styles.whiteButtonText}>Email and password</Text>
                  </TouchableOpacity>

                  {initialMode !== 'signup' && (
                    <TouchableOpacity style={styles.whiteButton} onPress={() => switchMethod('phone')}>
                      <Text style={styles.whiteButtonText}>MobileX phone number</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.disclaimer}>
                  By continuing, you agree to our <Text style={styles.bold}>Terms of Service</Text> and confirm that you've read our <Text style={styles.bold}>Privacy Policy</Text>.
                </Text>

                {initialMode === 'login' && (
                  <View style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'center' }}>
                    <Text style={styles.helperText}>Having trouble with your log in? </Text>
                    <TouchableOpacity onPress={() => switchMethod('forgotPassword')}>
                      <Text style={styles.bold}>Send a magic link</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {authMethod === 'email' && (
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>
                  {initialMode === 'signup' ? "Get started with MobileX." : "Welcome Back."}
                </Text>
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
                  onPress={handleEmailAction}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.darkButtonText}>
                      {initialMode === 'signup' ? "Create my account" : "Login"}
                    </Text>
                  )}
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

            {authMethod === 'forgotPassword' && (
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Forgot your password?</Text>
                <Text style={styles.formSubtitle}>
                  We'll send you a magic link to your email that you can use for a one-time to sign in.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.minimalInput}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                    autoComplete="off"
                    autoCorrect={false}
                    textContentType="none"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.darkButton, loading && styles.buttonDisabled]}
                  onPress={handleForgotPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.darkButtonText}>Send magic link</Text>
                  )}
                </TouchableOpacity>

                <View style={{ marginTop: 20 }}>
                  <Text style={[styles.disclaimer, { textAlign: 'left' }]}>
                    Not your first time forgetting?
                  </Text>
                  <TouchableOpacity onPress={() => switchMethod('email')}>
                    <Text style={[styles.bold, { fontSize: 13, marginTop: 4 }]}>Reset your password.</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>
      </View>

      {/* Success Overlay */}
      {resetSent && (
        <View style={StyleSheet.absoluteFill}>
          <View style={{ flex: 1, backgroundColor: '#1a2e26', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <TouchableOpacity
              style={{ position: 'absolute', top: insets.top + 20, left: 24 }}
              onPress={() => { setResetSent(false); switchMethod('email'); }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>CLOSE</Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 16, marginBottom: 8, textAlign: 'center' }}>We emailed a password reset link</Text>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>{email}</Text>
              <Text style={{ color: '#aaa', fontSize: 14, textAlign: 'center' }}>Click the link to change password.</Text>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dimmedBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', // Slight dim
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 8,
    width: '100%',
    maxHeight: '85%', // Don't take full height
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
  },
  content: {
    // No flex: 1 needed here as it will push bottom sheet height naturally
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  // ... existing form styles ...
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
    backgroundColor: '#1a2e26',
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
