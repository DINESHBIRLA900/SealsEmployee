import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, ToastAndroid } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import api from '../../src/services/api';

export default function MpinLoginScreen() {
    const [mpin, setMpin] = useState(['', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('User');
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userDataStr = await SecureStore.getItemAsync('user');
                if (userDataStr) {
                    const user = JSON.parse(userDataStr);
                    setUserName(user.name ? user.name.split(' ')[0] : 'User');
                }
            } catch (error) {
                console.error('Failed to load user', error);
            }
        };
        loadUser();
    }, []);

    const handleMpinChange = (text: string, index: number) => {
        const newMpin = [...mpin];
        newMpin[index] = text;
        setMpin(newMpin);

        if (text && index < 3) {
            inputs.current[index + 1]?.focus();
        }

        // Optional: Auto-submit if all filled
        if (index === 3 && text) {
            // handleMpinLogin(); 
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !mpin[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleMpinLogin = async () => {
        const mpinString = mpin.join('');
        if (mpinString.length !== 4) {
            Alert.alert('Error', 'Please enter 4-digit mPIN');
            return;
        }

        setLoading(true);
        try {
            const userDataStr = await SecureStore.getItemAsync('user');
            if (!userDataStr) {
                Alert.alert('Error', 'Session expired. Please login again.');
                router.replace('/(auth)/login');
                return;
            }
            const localUser = JSON.parse(userDataStr);

            const mobile = localUser.phone || localUser.mobile_number;
            const email = localUser.email;
            const userId = localUser._id;

            if (!mobile && !email && !userId) {
                Alert.alert('Error', 'User identifier not found in session. Please login again.');
                router.replace('/(auth)/login');
                return;
            }

            // Verify mPIN with backend
            const response = await api.post('/users/login-mpin', {
                mobile_number: mobile,
                email: email,
                userId: userId,
                mpin: mpinString
            });

            const { token, user } = response.data;

            if (token) {
                await SecureStore.setItemAsync('token', token);
                await SecureStore.setItemAsync('user', JSON.stringify(user));
                // Ensure isMpinSet is true if successful
                await SecureStore.setItemAsync('isMpinSet', 'true');

                router.replace('/(tabs)');
            }
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || 'Invalid mPIN';
            Alert.alert('Error', message);
            setMpin(['', '', '', '']); // Clear mPIN on error
            inputs.current[0]?.focus(); // Reset focus
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout? You will need to enter password next time.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await SecureStore.deleteItemAsync('token');
                        await SecureStore.deleteItemAsync('isMpinSet');
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Welcome Back,</Text>
                    <Text style={styles.name}>{userName}</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Enter mPIN to Unlock</Text>

                    <View style={styles.inputContainer}>
                        {mpin.map((digit, index) => (
                            <View key={index} style={styles.otpBox}>
                                <TextInput
                                    ref={(ref) => { inputs.current[index] = ref; }}
                                    style={styles.otpInput}
                                    keyboardType="numeric"
                                    maxLength={1}
                                    secureTextEntry
                                    cursorColor='transparent'
                                    selectionColor='transparent'
                                    caretHidden={true}
                                    value={digit}
                                    onChangeText={(text) => handleMpinChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    placeholder={digit ? "" : "-"}
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleMpinLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Unlock</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.textButton}
                        onPress={handleLogout}
                    >
                        <Text style={styles.textButtonLabel}>Login with Password / Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6', // Light gray background
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        width: '100%',
        padding: 24,
        alignItems: 'center',
    },
    header: {
        marginBottom: 48,
        alignItems: 'center',
    },
    greeting: {
        fontSize: 18,
        color: '#6b7280', // Gray 500
        marginBottom: 8,
    },
    name: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937', // Gray 900
    },
    form: {
        width: '100%',
        gap: 24,
        alignItems: 'center',
    },
    label: {
        color: '#374151', // Gray 700
        fontSize: 16,
        fontWeight: '500',
        marginBottom: -12,
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 24,
    },
    otpBox: {
        width: 60,
        height: 60,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpInput: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        padding: 0,
        includeFontPadding: false,
    },
    button: {
        backgroundColor: '#10b981', // Emerald 500
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
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
    textButton: {
        padding: 12,
        marginTop: 12,
    },
    textButtonLabel: {
        color: '#6b7280', // Gray 500
        fontSize: 14,
    },
});
