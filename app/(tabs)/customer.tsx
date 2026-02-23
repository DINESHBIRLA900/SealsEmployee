import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import HeaderCard from '../../components/HeaderCard';
import { Plus, Building2, User, X, Search, Phone, MapPin } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getCustomers } from '../../src/services/customerService';
import { sync } from '../../src/services/sync';
import { useTranslation } from 'react-i18next';

export default function CustomerScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const [showOptions, setShowOptions] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ total: 0, b2b: 0, b2c: 0 });

    const fetchCustomers = async (shouldSync = false) => {
        try {
            if (shouldSync) {
                await sync();
            }
            const data = await getCustomers();
            setCustomers(data);

            // Calculate stats
            const total = data.length;
            const b2b = data.filter((c: any) => c.customer_type === 'B2B').length;
            const b2c = data.filter((c: any) => c.customer_type === 'B2C').length;
            setStats({ total, b2b, b2c });
        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCustomers(true); // Sync on focus to get latest data
        }, [])
    );

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchCustomers(true);
    }, []);

    const handleNavigate = (type: 'b2b' | 'b2c') => {
        setShowOptions(false);
        if (type === 'b2b') {
            router.push('/add-customer/b2b');
        } else {
            router.push('/add-customer/b2c');
        }
    };

    const StatsCard = ({ title, count, color, icon }: any) => (
        <View style={styles.statsCard}>
            <View style={[styles.statsIcon, { backgroundColor: `${color}20` }]}>
                {icon}
            </View>
            <View>
                <Text style={styles.statsCount}>{count}</Text>
                <Text style={styles.statsTitle}>{title}</Text>
            </View>
        </View>
    );

    const renderCustomerItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.customerCard}
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: `/customer/${item.id}`, params: { type: item.customer_type } } as any)}
        >
            <View style={styles.customerHeader}>
                <View>
                    <Text style={styles.customerName}>{item.name}</Text>
                    <Text style={styles.customerType}>{item.customer_type}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#dcfce7' : '#fee2e2' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'Active' ? '#166534' : '#991b1b' }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.customerDetails}>
                <View style={styles.detailRow}>
                    <Phone size={14} color="#6b7280" />
                    <Text style={styles.detailText}>{item.phone || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MapPin size={14} color="#6b7280" />
                    <Text style={styles.detailText} numberOfLines={1}>
                        {item.address_line || item.address || 'No Address'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <HeaderCard />

            <View style={styles.content}>
                {/* Stats Row */}
                <View style={styles.statsContainer}>
                    <StatsCard
                        title="Total"
                        count={stats.total}
                        color="#6366f1"
                        icon={<User size={16} color="#6366f1" />}
                    />
                    <StatsCard
                        title="Dealer"
                        count={stats.b2b}
                        color="#3b82f6"
                        icon={<Building2 size={16} color="#3b82f6" />}
                    />
                    <StatsCard
                        title="Farmer"
                        count={stats.b2c}
                        color="#22c55e"
                        icon={<User size={16} color="#22c55e" />}
                    />
                </View>

                {/* Customer List */}
                <Text style={styles.sectionTitle}>All Customers</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={customers}
                        renderItem={renderCustomerItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No customers found</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowOptions(true)}
                activeOpacity={0.8}
            >
                <Plus color="#fff" size={24} strokeWidth={3} />
            </TouchableOpacity>

            {/* Options Modal */}
            <Modal
                transparent={true}
                visible={showOptions}
                animationType="fade"
                onRequestClose={() => setShowOptions(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowOptions(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.optionsContainer}>
                                <View style={styles.optionsHeader}>
                                    <Text style={styles.optionsTitle}>Add New Customer</Text>
                                    <TouchableOpacity onPress={() => setShowOptions(false)}>
                                        <X color="#9ca3af" size={20} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.optionsGrid}>
                                    <TouchableOpacity
                                        style={styles.optionCard}
                                        onPress={() => handleNavigate('b2b')}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.iconContainer, { backgroundColor: '#eff6ff' }]}>
                                            <Building2 color="#3b82f6" size={24} />
                                        </View>
                                        <Text style={styles.optionLabel}>Dealer</Text>
                                        <Text style={styles.optionDesc}>Business to Business</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.optionCard}
                                        onPress={() => handleNavigate('b2c')}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
                                            <User color="#22c55e" size={24} />
                                        </View>
                                        <Text style={styles.optionLabel}>Farmer</Text>
                                        <Text style={styles.optionDesc}>Business to Consumer</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    statsCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statsIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsCount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statsTitle: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    listContainer: {
        paddingBottom: 80,
    },
    customerCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    customerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    customerType: {
        fontSize: 12,
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    customerDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#4b5563',
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    optionsContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    optionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    optionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    optionsGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    optionCard: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    optionDesc: {
        fontSize: 12,
        color: '#9ca3af',
    },
});
