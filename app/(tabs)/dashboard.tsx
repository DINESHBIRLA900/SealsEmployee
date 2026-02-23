import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { User, CalendarCheck, IndianRupee, ShoppingCart, MapPin, Wallet, CreditCard, ChevronRight } from 'lucide-react-native';
import { Image } from 'expo-image';
import api from '../../src/services/api';
import HeaderCard from '../../components/HeaderCard';

const { width } = Dimensions.get('window');
const gap = 12;
const itemWidth = (width - 32 - (gap * 2)) / 3;

export default function DashboardScreen() {
    const router = useRouter();
    // userData and related hooks/functions are removed as HeaderCard handles user loading
    // insets is removed as it was only used for the old header

    const menuItems = [
        { id: 'profile', title: 'Profile', icon: <User size={32} color="#3b82f6" />, path: '/(tabs)/profile', color: '#eff6ff' },
        { id: 'attendance', title: 'Attendance', icon: <CalendarCheck size={32} color="#10b981" />, path: '/attendance', color: '#ecfdf5' },
        { id: 'revenue', title: 'Revenue', icon: <IndianRupee size={32} color="#f59e0b" />, path: null, color: '#fffbeb' },
        { id: 'order', title: 'Order', icon: <ShoppingCart size={32} color="#8b5cf6" />, path: '/(tabs)/order', color: '#f5f3ff' },
        { id: 'visit', title: 'Visit', icon: <MapPin size={32} color="#ec4899" />, path: null, color: '#fdf2f8' },
        { id: 'payment', title: 'Payment', icon: <CreditCard size={32} color="#6366f1" />, path: null, color: '#eef2ff' },
        { id: 'wallet', title: 'Wallet', icon: <Wallet size={32} color="#14b8a6" />, path: null, color: '#f0fdfa' },
    ];

    return (
        <View style={styles.container}>
            <HeaderCard />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Stats / Revenue Overview Placeholder */}
                <View style={styles.statsCard}>
                    <View style={styles.statsHeader}>
                        <Text style={styles.statsTitle}>Total Revenue</Text>
                        <View style={styles.statsBadge}>
                            <Text style={styles.statsBadgeText}>+2.5%</Text>
                        </View>
                    </View>
                    <Text style={styles.statsValue}>₹ 0</Text>
                    <Text style={styles.statsSubtitle}>vs last month</Text>
                </View>

                <Text style={styles.sectionTitle}>Menu</Text>

                <View style={styles.grid}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            activeOpacity={0.7}
                            onPress={() => item.path && router.push(item.path as any)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                                {item.icon}
                            </View>
                            <Text style={styles.menuText}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                    {/* Fill empty slots to maintain alignment if needed, although flex-wrap handles extensive lists */}
                </View>

                {/* Recent Activity Placeholder */}
                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.activityCard}>
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No recent activity</Text>
                    </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    greeting: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    profileButton: {
        padding: 4,
        backgroundColor: '#fff',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statsTitle: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '600',
    },
    statsBadge: {
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statsBadgeText: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: 'bold',
    },
    statsValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    statsSubtitle: {
        fontSize: 12,
        color: '#9ca3af',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: gap,
    },
    menuItem: {
        width: itemWidth,
        height: itemWidth, // Make it square
        backgroundColor: '#ffffff', // Full White
        borderRadius: 16,
        padding: 8, // Reduced padding
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ffffff', // White Border (effectively invisible)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 4,
    },
    iconBox: {
        width: 56, // Increased size
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    menuText: {
        fontSize: 12, // Slightly smaller text
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: '600',
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        minHeight: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
    },
    emptyStateText: {
        color: '#9ca3af',
        fontSize: 14,
    },
});
