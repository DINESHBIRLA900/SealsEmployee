import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getCustomerById } from '../../src/services/customerService';
import { Phone, MapPin, Building2, User, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { openDialer, openWhatsApp, openEmail, openMaps, openBrowser } from '../../src/utils/linking';
import { DetailRow } from '../../src/components/DetailRow';
import { SectionCard } from '../../src/components/SectionCard';

const { width } = Dimensions.get('window');

export default function FullProfileScreen() {
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
                console.error("Error fetching full profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, type]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!customer) return <View style={styles.container} />;

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color="#1f2937" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Full Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Header Profile Summary */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{customer.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.name}>{customer.name}</Text>
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: '#eff6ff' }]}>
                            <Text style={[styles.badgeText, { color: '#3b82f6' }]}>{customer.customer_type}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: (customer.status || 'Active') === 'Active' ? '#ecfdf5' : '#fef2f2' }]}>
                            <Text style={[styles.badgeText, { color: (customer.status || 'Active') === 'Active' ? '#059669' : '#dc2626' }]}>
                                {customer.status || 'Active'}
                            </Text>
                        </View>
                    </View>
                </View>

                {customer.customer_type === 'B2B' ? (
                    <SectionCard title="Business Info" icon={<Building2 size={20} color="#3b82f6" />}>
                        <DetailRow label="Business Name" value={customer.name} />
                        <DetailRow label="Branch Type" value={customer.branch_type} />
                        <DetailRow label="GSTIN" value={customer.gstin} />
                        <DetailRow
                            label="Website"
                            value={customer.website}
                            isLink={!!customer.website}
                            onPress={() => customer.website && openBrowser(customer.website)}
                            last
                        />
                    </SectionCard>
                ) : (
                    <SectionCard title="Personal Info" icon={<User size={20} color="#3b82f6" />}>
                        <DetailRow label="Full Name" value={customer.name} />
                        <DetailRow label="Father's Name" value={customer.father_name} />
                        <DetailRow label="Gender" value={customer.gender} />
                        <DetailRow label="Date of Birth" value={formatDate(customer.dob)} last />
                    </SectionCard>
                )}

                <SectionCard title="Contact Details" icon={<Phone size={20} color="#10b981" />}>
                    <DetailRow
                        label="Phone"
                        value={customer.phone}
                        isLink
                        onPress={() => openDialer(customer.phone)}
                    />
                    <DetailRow label="Alternative Mobile" value={customer.alternate_mobile_number} />
                    <DetailRow
                        label="WhatsApp"
                        value={customer.whatsapp_number}
                        isLink
                        onPress={() => openWhatsApp(customer.whatsapp_number)}
                    />
                    <DetailRow
                        label="Email"
                        value={customer.email}
                        isLink
                        onPress={() => openEmail(customer.email)}
                        last
                    />
                </SectionCard>

                <SectionCard title="Address Details" icon={<MapPin size={20} color="#a855f7" />}>
                    <DetailRow
                        label="Address Line"
                        value={customer.address_line || customer.address}
                        isLink
                        onPress={() => openMaps(customer.address_line || customer.address)}
                    />
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <DetailRow label="Village/City" value={customer.village || customer.city} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <DetailRow label="Pincode" value={customer.pincode} />
                        </View>
                    </View>
                    <DetailRow label="Tehsil" value={customer.tehsil} />
                    <DetailRow label="District" value={customer.district} />
                    <DetailRow label="State" value={customer.state} last />
                </SectionCard>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
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
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#dbeafe',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    }
});
