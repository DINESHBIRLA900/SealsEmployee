import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Platform } from 'react-native';
import { Bell, Search, User } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/node_modules/react-i18next';
import '../src/i18n/i18n';

export default function HeaderCard() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userStr = await SecureStore.getItemAsync('user');
            if (userStr) {
                setUser(JSON.parse(userStr));
            }
        } catch (error) {
            console.error('Failed to load user', error);
        }
    };

    const employeeId = user?._id ? `EMP-${user._id.slice(-4).toUpperCase()}` : 'EMP-0000';

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <View style={styles.topRow}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <User size={24} color="#10b981" />
                    </View>
                    <View>
                        <Text style={styles.name}>{user?.name || 'Employee Name'}</Text>
                        <Text style={styles.id}>{employeeId}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.notificationButton}>
                    <Bell size={24} color="#fff" />
                    <View style={styles.badge} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Search size={20} color="#9ca3af" />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('search') || "Search..."}
                    placeholderTextColor="#9ca3af"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#10b981', // Emerald 500
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#fff',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    id: {
        fontSize: 12,
        color: '#d1fae5', // Emerald 100
        marginTop: 2,
    },
    notificationButton: {
        padding: 8,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        backgroundColor: '#ef4444',
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#10b981',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20, // More rounded for better look at smaller height
        paddingHorizontal: 12,
        height: 35, // Height reduced to 35 as requested
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14, // Slightly smaller text for compact bar
        color: '#1f2937',
        height: '100%',
        paddingVertical: 0, // Critical for centering
    },
});
