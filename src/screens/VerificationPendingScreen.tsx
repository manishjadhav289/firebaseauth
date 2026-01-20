
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

export function VerificationPendingScreen() {
    const insets = useSafeAreaInsets();
    const user = auth().currentUser;

    const handleResend = async () => {
        try {
            if (user) {
                await user.sendEmailVerification();
                Alert.alert('Email Sent', 'A verification link has been sent to ' + user.email);
            }
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>✉️</Text>
                </View>
                <Text style={styles.title}>Check your inbox</Text>
                <Text style={styles.subtitle}>
                    We sent a verification link to:{"\n"}
                    <Text style={styles.bold}>{user?.email}</Text>
                </Text>

                <View style={styles.waitingContainer}>
                    <ActivityIndicator color="#0b2e26" style={{ marginBottom: 16 }} size="large" />
                    <Text style={styles.info}>
                        Waiting for you to click the link in your email... This screen will close automatically once verified.
                    </Text>
                </View>

                <TouchableOpacity style={styles.secondaryButton} onPress={handleResend}>
                    <Text style={styles.secondaryButtonText}>Resend email</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkButton} onPress={() => auth().signOut()}>
                    <Text style={styles.linkText}>Back to Sign In</Text>
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
        paddingHorizontal: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f4f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    icon: {
        fontSize: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0b2e26',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#444',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    bold: {
        fontWeight: '700',
        color: '#000',
    },
    waitingContainer: {
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 24,
        borderRadius: 16,
        width: '100%',
        marginBottom: 32,
    },
    info: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    secondaryButton: {
        paddingVertical: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 16,
    },
    secondaryButtonText: {
        color: '#0b2e26',
        fontSize: 15,
        fontWeight: '600',
    },
    linkButton: {
        marginTop: 10,
    },
    linkText: {
        color: '#666',
        fontSize: 14,
        textDecorationLine: 'underline',
    }
});
