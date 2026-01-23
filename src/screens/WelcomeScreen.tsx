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
                <View style={styles.brandContainer}>
                    <Text style={styles.brandMobile}>mobile</Text>
                    <Text style={styles.brandX}>X</Text>
                </View>
                <TouchableOpacity onPress={onSignIn} style={styles.signInButton}>
                    <Text style={styles.signInText}>SIGN IN</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                <Text style={[styles.heroText, styles.heroTextGreen]}>MOBILE.</Text>
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
        marginTop: 8,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandMobile: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -1,
        fontFamily: 'Gilroy-Heavy',
    },
    brandX: {
        fontSize: 32,
        fontWeight: '900',
        color: '#00e600',
        letterSpacing: -1,
        fontStyle: 'italic',
        fontFamily: 'Gilroy-Heavy',
        marginLeft: 0,
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
        fontSize: 12, // Smaller as in image
        fontFamily: 'Gilroy-Bold',
        letterSpacing: 0.5,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 20, // Add some right padding to prevent text hitting edge too hard
    },
    heroText: {
        fontSize: 56, // Larger
        fontWeight: '900',
        color: '#fff',
        lineHeight: 56 * 0.9, // Tight line height
        textTransform: 'uppercase',
        fontFamily: 'Gilroy-Heavy',
    },
    heroTextGreen: {
        color: '#00e600',
    },
    subHeader: {
        color: '#fff',
        fontSize: 18,
        marginTop: 32,
        marginBottom: 8,
        fontFamily: 'Gilroy-Bold',
    },
    bodyText: {
        color: '#e0e0e0',
        fontSize: 18,
        lineHeight: 26,
        fontFamily: 'Gilroy-Regular',
        maxWidth: '90%',
    },
    boldWhite: {
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: 'Gilroy-Bold',
    },
    footer: {
        paddingBottom: 40,
        gap: 12,
    },
    greenButton: {
        backgroundColor: '#00e600',
        paddingVertical: 16,
        borderRadius: 4,
        alignItems: 'center',
    },
    greenButtonText: {
        color: '#000',
        fontWeight: '800', // Heavier weight
        fontSize: 16,
        fontFamily: 'Gilroy-Bold',
        letterSpacing: 0.5,
    },
    whiteButton: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 4,
        alignItems: 'center',
    },
    whiteButtonText: {
        color: '#000',
        fontWeight: '800', // Heavier weight
        fontSize: 16,
        fontFamily: 'Gilroy-Bold',
        letterSpacing: 0.5,
    },
});
