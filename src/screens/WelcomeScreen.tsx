import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WelcomeScreenProps {
    onSignIn: () => void;
    onSignUp: () => void;
}

export function WelcomeScreen({ onSignIn, onSignUp }: WelcomeScreenProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="light-content" backgroundColor="#0b2e26" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.brand}>mobileX</Text>
                <TouchableOpacity onPress={onSignIn} style={styles.signInButton}>
                    <Text style={styles.signInText}>SIGN IN</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                <Text style={styles.heroText}>MOBILE.</Text>
                <Text style={styles.heroText}>DONE</Text>
                <Text style={styles.heroText}>DIFFERENT.</Text>

                <Text style={styles.subHeader}>Black Friday Deals available!</Text>

                <Text style={styles.bodyText}>
                    Try the only <Text style={styles.boldWhite}>AI-powered phone service</Text> on one of America's fastest <Text style={styles.boldWhite}>5G networks</Text>.
                </Text>
            </View>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.greenButton} onPress={onSignUp}>
                    <Text style={styles.greenButtonText}>Let's GO!</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.whiteButton} onPress={onSignUp}>
                    <Text style={styles.whiteButtonText}>Got our SIM? Get activated</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0b2e26', // Dark Green
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    brand: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -1,
    },
    signInButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    signInText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    heroText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#fff', // Or slightly transparent white if needed
        lineHeight: 48,
        textTransform: 'uppercase',
    },
    heroTextGreen: {
        color: '#00ff00', // Neon green accent if needed
    },
    subHeader: {
        color: '#fff',
        fontSize: 18,
        marginTop: 24,
        marginBottom: 8,
    },
    bodyText: {
        color: '#aaa',
        fontSize: 16,
        lineHeight: 24,
    },
    boldWhite: {
        color: '#fff',
        fontWeight: 'bold',
    },
    footer: {
        paddingBottom: 32,
        gap: 16,
    },
    greenButton: {
        backgroundColor: '#00e600', // Bright Green
        paddingVertical: 16,
        borderRadius: 4,
        alignItems: 'center',
    },
    greenButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 18,
    },
    whiteButton: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 4,
        alignItems: 'center',
    },
    whiteButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
