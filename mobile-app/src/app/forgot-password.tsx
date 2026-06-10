import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordScreen() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email.trim());
            setSent(true);
        } catch (err: any) {
            const msg =
                err?.code === 'auth/user-not-found'
                    ? 'No account found with this email.'
                    : err?.code === 'auth/invalid-email'
                        ? 'Invalid email address.'
                        : 'Failed to send reset email. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <View style={styles.container}>
                <Text style={styles.successIcon}>📧</Text>
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successText}>
                    Check your inbox at {email} for password reset instructions.
                </Text>
                <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
                    <Text style={styles.btnText}>Back to Sign In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
                Enter your email and we'll send you a reset link.
            </Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#8F7772"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoFocus
                />
            </View>

            <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleReset}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFAF5" />
                ) : (
                    <Text style={styles.btnText}>Send Reset Email</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFAF5',
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        color: '#1F1C1A',
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        color: '#8F7772',
        fontSize: 14,
        marginBottom: 32,
        lineHeight: 20,
    },
    inputGroup: { marginBottom: 20 },
    label: { color: '#8F7772', fontSize: 13, fontWeight: '600', marginBottom: 6 },
    input: {
        backgroundColor: '#F0E7DD',
        borderWidth: 1,
        borderColor: '#D8C3A5',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: '#1F1C1A',
        fontSize: 16,
    },
    btn: {
        backgroundColor: '#C6453E',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#FFFAF5', fontSize: 16, fontWeight: '700' },
    cancelBtn: { alignItems: 'center', paddingVertical: 8 },
    cancelBtnText: { color: '#8F7772', fontSize: 14 },
    successIcon: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
    successTitle: {
        color: '#1F1C1A',
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 12,
    },
    successText: {
        color: '#8F7772',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
});
