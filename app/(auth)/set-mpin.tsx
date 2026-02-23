import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ToastAndroid, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../src/services/api';
import { StatusBar } from 'expo-status-bar';

export default function SetMpinScreen() {
    const router = useRouter();
    const [mpin, setMpin] = useState(['', '', '', '']);
    const [confirmMpin, setConfirmMpin] = useState(['', '', '', '']);

    // Refs for focus management
    const mpinInputs = useRef<Array<TextInput | null>>([]);
    const confirmInputs = useRef<Array<TextInput | null>>([]);

    const [loading, setLoading] = useState(false);

    const handleMpinChange = (text: string, index: number) => {
        const newMpin = [...mpin];
        newMpin[index] = text;
        setMpin(newMpin);

        if (text && index < 3) {
            mpinInputs.current[index + 1]?.focus();
        }
    };

    const handleMpinKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !mpin[index] && index > 0) {
            mpinInputs.current[index - 1]?.focus();
        }
    };

    const handleConfirmChange = (text: string, index: number) => {
        const newConfirmMpin = [...confirmMpin];
        newConfirmMpin[index] = text;
        setConfirmMpin(newConfirmMpin);

        if (text && index < 3) {
            confirmInputs.current[index + 1]?.focus();
        }
    };

    const handleConfirmKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !confirmMpin[index] && index > 0) {
            confirmInputs.current[index - 1]?.focus();
        }
    };

    const alert = (msg: string) => {
        Platform.OS === 'android' ? ToastAndroid.show(msg, ToastAndroid.SHORT) : Alert.alert(msg);
    };

    const handleSubmit = async () => {
        const mpinString = mpin.join('');
        const confirmMpinString = confirmMpin.join('');

        if (mpinString.length !== 4 || confirmMpinString.length !== 4) {
            alert('Please fill all 4 digits');
            return;
        }

        if (mpinString !== confirmMpinString) {
            alert('mPINs do not match');
            return;
        }

        setLoading(true);
        try {
            const userDataStr = await SecureStore.getItemAsync('user');
            if (!userDataStr) throw new Error('User not found');
            const user = JSON.parse(userDataStr);

            if (!user._id) {
                alert('User data corrupted. Please login again.');
                await SecureStore.deleteItemAsync('token');
                await SecureStore.deleteItemAsync('user');
                router.replace('/(auth)/login');
                return;
            }

            // Using configured API service
            await api.post('/users/update-mpin-v2', {
                userId: user._id,
                mpin: mpinString
            });

            await SecureStore.setItemAsync('isMpinSet', 'true');

            Platform.OS === 'android' ? ToastAndroid.show('mPIN set successfully!', ToastAndroid.SHORT) : Alert.alert('Success', 'mPIN set successfully!');

            // All secure setup done, go to tabs
            router.replace('/(tabs)');

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Failed to set mPIN';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <Text style={styles.title}>Set mPIN</Text>
            <Text style={styles.subtitle}>Set a 4-digit PIN for quick access.</Text>

            <View style={styles.form}>
                <Text style={styles.label}>Enter 4-Digit mPIN</Text>
                <View style={styles.inputContainer}>
                    {mpin.map((digit, index) => (
                        <View key={`mpin-${index}`} style={styles.otpBox}>
                            <TextInput
                                ref={(ref) => { mpinInputs.current[index] = ref; }}
                                style={styles.otpInput}
                                keyboardType="numeric"
                                maxLength={1}
                                secureTextEntry={false}
                                cursorColor='transparent'
                                selectionColor='transparent'
                                caretHidden={true}
                                value={digit}
                                onChangeText={(text) => handleMpinChange(text, index)}
                                onKeyPress={(e) => handleMpinKeyPress(e, index)}
                                placeholder={digit ? "" : "-"}
                                placeholderTextColor="#9ca3af"
                                autoFocus={index === 0}
                            />
                        </View>
                    ))}
                </View>

                <Text style={styles.label}>Confirm mPIN</Text>
                <View style={styles.inputContainer}>
                    {confirmMpin.map((digit, index) => (
                        <View key={`confirm-${index}`} style={styles.otpBox}>
                            <TextInput
                                ref={(ref) => { confirmInputs.current[index] = ref; }}
                                style={styles.otpInput}
                                keyboardType="numeric"
                                maxLength={1}
                                secureTextEntry={false}
                                cursorColor='transparent'
                                selectionColor='transparent'
                                caretHidden={true}
                                value={digit}
                                onChangeText={(text) => handleConfirmChange(text, index)}
                                onKeyPress={(e) => handleConfirmKeyPress(e, index)}
                                placeholder={digit ? "" : "-"}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Setting mPIN...' : 'Set mPIN'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 32,
    },
    form: {
        width: '100%',
        gap: 24,
        alignItems: 'center',
    },
    label: {
        color: '#374151',
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
        backgroundColor: '#10b981',
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
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
