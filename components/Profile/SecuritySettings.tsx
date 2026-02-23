import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from '@/node_modules/react-i18next';
import { router } from 'expo-router';

interface SecuritySettingsProps {
    userData: {
        phone?: string;
    };
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ userData }) => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Security Settings</Text>

            {/* ID */}
            <View style={styles.row}>
                <Text style={styles.label}>ID:</Text>
                <Text style={styles.value}>{userData.phone || 'Not Set'}</Text>
            </View>

            {/* Password */}
            <View style={styles.row}>
                <Text style={styles.label}>Password:</Text>
                <View style={styles.valueContainer}>
                    <Text style={styles.maskedValue}>******</Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/change-password')}>
                        <Text style={styles.actionText}>[Change]</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* mPIN */}
            <View style={styles.row}>
                <Text style={styles.label}>mPIN:</Text>
                <View style={styles.valueContainer}>
                    <Text style={styles.maskedValue}>****</Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/set-mpin')}>
                        <Text style={styles.actionText}>[Reset]</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        elevation: 2, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1f2937',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
        width: 80,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    maskedValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9ca3af',
        letterSpacing: 2,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10b981', // Emerald-500
    },
});

export default SecuritySettings;
