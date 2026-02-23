import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getCustomerById } from '../../src/services/customerService';
import { Phone, Mail, MapPin, Globe, Building2, User, ArrowLeft, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { openDialer, openWhatsApp, openEmail, openMaps, openBrowser } from '../../src/utils/linking';
import { DetailRow } from '../../src/components/DetailRow';
import { SectionCard } from '../../src/components/SectionCard';

export default function CustomerDetailsScreen() {
    const { id, type } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                if (id && type) {
                    const data = await getCustomerById(id as string, type as string);
                    setCustomer(data);
                }
            } catch (error) {
                console.error("Error fetching customer details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, type]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!customer) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Customer not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerShown: false
            }} />

            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color="#1f2937" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Customer Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{customer.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.name}>{customer.name}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{customer.customer_type}</Text>
                    </View>
                    <Text style={[styles.status, { color: (customer.status || 'Active') === 'Active' ? '#10b981' : '#ef4444' }]}>
                        {customer.status || 'Active'}
                    </Text>
                </View>

                {/* Contact Actions */}
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => openDialer(customer.phone)}>
                        <Phone color="#fff" size={20} />
                        <Text style={styles.actionText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#22c55e' }]} onPress={() => openWhatsApp(customer.whatsapp_number || customer.phone)}>
                        <MessageCircle color="#fff" size={20} />
                        <Text style={styles.actionText}>WhatsApp</Text>
                    </TouchableOpacity>
                </View>

                {/* Menu Grid */}
                <View style={styles.menuGrid}>
                    <TouchableOpacity
                        style={styles.menuCard}
                        activeOpacity={0.7}
                        onPress={() => router.push({ pathname: '/customer/full-profile', params: { id: customer.id, type: customer.customer_type } } as any)}
                    >
                        <View style={[styles.menuIconBox, { backgroundColor: '#ecfdf5' }]}>
                            <User size={32} color="#10b981" />
                        </View>
                        <Text style={[styles.menuText, { color: '#047857' }]}>Profile</Text>
                    </TouchableOpacity>

                    {/* Placeholders for future cards */}
                    <View style={styles.menuCardPlaceholder} />
                    <View style={styles.menuCardPlaceholder} />
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    errorText: {
        fontSize: 18,
        color: '#ef4444',
        textAlign: 'center',
        marginTop: 50,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#dbeafe',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#eff6ff',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
        textAlign: 'center',
    },
    badge: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4b5563',
    },
    status: {
        fontSize: 14,
        color: '#059669',
        fontWeight: '500',
    },
    actionGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    actionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    menuGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    menuCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 0, // Remove elevation for glass feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)', // Light border
        aspectRatio: 1,
    },
    menuCardPlaceholder: {
        flex: 1,
        aspectRatio: 1,
    },
    menuIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    menuText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
});
