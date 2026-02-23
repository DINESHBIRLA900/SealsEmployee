import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import HeaderCard from '../components/HeaderCard';

const { width } = Dimensions.get('window');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AttendanceScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [currentDate, setCurrentDate] = useState(new Date());



    const changeMonth = (increment: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(1); // Avoid overflow issues
        newDate.setMonth(newDate.getMonth() + increment);
        setCurrentDate(newDate);
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();

        const days = [];
        const totalSlots = 42; // 6 rows * 7 days

        // Previous month days
        for (let i = 0; i < firstDayOfMonth; i++) {
            const dayNum = daysInPrevMonth - (firstDayOfMonth - 1) + i;
            days.push(
                <View key={`prev-${i}`} style={[styles.dayCell, styles.otherMonthCell]}>
                    <Text style={styles.otherMonthText}>{dayNum}</Text>
                </View>
            );
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday =
                i === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

            days.push(
                <TouchableOpacity key={`curr-${i}`} style={[styles.dayCell, isToday && styles.todayCell]}>
                    <Text style={[styles.dayText, isToday && styles.todayText]}>{i}</Text>
                    {/* Placeholder dot for attendance example */}
                    {i < new Date().getDate() && month === new Date().getMonth() && (
                        <View style={[styles.dot, { backgroundColor: i % 7 === 0 ? '#ef4444' : '#10b981' }]} />
                    )}
                </TouchableOpacity>
            );
        }

        // Next month days
        const remainingSlots = totalSlots - days.length;
        for (let i = 1; i <= remainingSlots; i++) {
            days.push(
                <View key={`next-${i}`} style={[styles.dayCell, styles.otherMonthCell]}>
                    <Text style={styles.otherMonthText}>{i}</Text>
                </View>
            );
        }

        return days;
    };

    const actionButtons = [
        { title: 'Work Approval', icon: <CheckCircle size={24} color="#fff" />, color: '#3b82f6', path: '/attendance/work-approval' },
        { title: 'Leave Request', icon: <Clock size={24} color="#fff" />, color: '#f59e0b', path: null },
        { title: 'Holiday List', icon: <AlertCircle size={24} color="#fff" />, color: '#10b981', path: null },
    ];

    return (
        <View style={styles.container}>
            <HeaderCard />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.pageTitle}>Attendance</Text>
                {/* Calendar Card */}
                <View style={styles.calendarCard}>
                    <View style={styles.monthHeader}>
                        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
                            <ChevronLeft size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text style={styles.monthTitle}>
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
                            <ChevronRight size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekRow}>
                        {DAYS.map(day => (
                            <Text key={day} style={styles.weekDayText}>{day}</Text>
                        ))}
                    </View>

                    <View style={styles.daysGrid}>
                        {renderCalendar()}
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    {actionButtons.map((btn, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.actionButton, { backgroundColor: btn.color }]}
                            activeOpacity={0.8}
                            onPress={() => btn.path && router.push(btn.path as any)}
                        >
                            <View style={styles.actionIcon}>
                                {btn.icon}
                            </View>
                            <Text style={styles.actionText}>{btn.title}</Text>
                        </TouchableOpacity>
                    ))}
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
    content: {
        padding: 16,
    },
    calendarCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 24,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    navButton: {
        padding: 8,
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '600',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    todayCell: {
        backgroundColor: '#3b82f6',
        borderRadius: 20,
    },
    dayText: {
        fontSize: 14,
        color: '#374151',
    },
    todayText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 2,
    },
    actionsContainer: {
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIcon: {
        marginRight: 16,
    },
    actionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    otherMonthCell: {
        opacity: 0.5,
    },
    otherMonthText: {
        fontSize: 14,
        color: '#d1d5db',
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
});
