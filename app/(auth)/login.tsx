import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../src/services/api'; // Adjust path if necessary
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!mobileNumber || !password) {
            Alert.alert('Error', 'Please enter mobile number and password');
            return;
        }

        setLoading(true);
        try {
            // Login with Mobile + Password
            const response = await api.post('/users/login', {
                phone: mobileNumber,
                password
            });

            const { token, user, isMpinSet } = response.data;

            if (token) {
                await SecureStore.setItemAsync('token', token);
                await SecureStore.setItemAsync('user', JSON.stringify(user));

                // Store mPIN status locally to help _layout decide
                if (isMpinSet) {
                    await SecureStore.setItemAsync('isMpinSet', 'true');
                    router.replace('/(auth)/mpin-login');
                } else {
                    router.replace('/(auth)/set-mpin');
                }
            } else {
                Alert.alert('Login Failed', 'No token received');
            }
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="dark" />
            <View style={styles.content}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mobile Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your mobile number"
                            placeholderTextColor="#9ca3af"
                            value={mobileNumber}
                            onChangeText={setMobileNumber}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#9ca3af"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6', // Light gray background
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937', // Dark gray text
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280', // Medium gray text
        marginBottom: 48,
    },
    form: {
        gap: 24,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        color: '#374151', // Gray 700
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#ffffff', // White input
        borderWidth: 1,
        borderColor: '#e5e7eb', // Gray 200 border
        borderRadius: 12,
        padding: 16,
        color: '#1f2937', // Dark text
        fontSize: 16,
    },
    button: {
        backgroundColor: '#10b981', // Emerald 500
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
