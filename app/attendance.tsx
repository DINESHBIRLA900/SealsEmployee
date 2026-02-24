import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle, MapPin } from 'lucide-react-native';
import HeaderCard from '../components/HeaderCard';
import * as SecureStore from 'expo-secure-store';
import { checkIn, checkOut, getUserAttendance } from '../src/services/attendanceService';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AttendanceScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [todayLog, setTodayLog] = useState<any>(null);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const userStr = await SecureStore.getItemAsync('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const data = await getUserAttendance(user.id || user._id);
            setAttendanceLogs(data);

            // Find today's log
            const today = new Date().toDateString();
            const log = data.find((l: any) => new Date(l.date).toDateString() === today);
            setTodayLog(log);
        } catch (error) {
            console.error("Failed to fetch attendance", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        setProcessing(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required for attendance.');
                setProcessing(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let address = "Unknown Location";

            try {
                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
                if (reverseGeocode.length > 0) {
                    const item = reverseGeocode[0];
                    address = `${item.name || ''} ${item.city || ''} ${item.region || ''}`.trim();
                }
            } catch (err) {
                console.log("Geocoding failed", err);
            }

            const userStr = await SecureStore.getItemAsync('user');
            const user = userStr ? JSON.parse(userStr) : null;

            await checkIn({
                user_id: user?.id || user?._id,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                address
            });

            Alert.alert('Success', 'Check-in successful!');
            fetchAttendance();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to check-in');
        } finally {
            setProcessing(false);
        }
    };

    const handleCheckOut = async () => {
        setProcessing(true);
        try {
            let location = await Location.getCurrentPositionAsync({});
            let address = "Unknown Location";

            try {
                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
                if (reverseGeocode.length > 0) {
                    const item = reverseGeocode[0];
                    address = `${item.name || ''} ${item.city || ''} ${item.region || ''}`.trim();
                }
            } catch (err) {
                console.log("Geocoding failed", err);
            }

            const userStr = await SecureStore.getItemAsync('user');
            const user = userStr ? JSON.parse(userStr) : null;

            await checkOut({
                user_id: user?.id || user?._id,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                address
            });

            Alert.alert('Success', 'Check-out successful!');
            fetchAttendance();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to check-out');
        } finally {
            setProcessing(false);
        }
    };

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

            const cellDate = new Date(year, month, i).toDateString();
            const log = attendanceLogs.find(l => new Date(l.date).toDateString() === cellDate);

            days.push(
                <TouchableOpacity key={`curr-${i}`} style={[styles.dayCell, isToday && styles.todayCell]}>
                    <Text style={[styles.dayText, isToday && styles.todayText]}>{i}</Text>
                    {log && (
                        <View style={[styles.dot, { backgroundColor: log.status === 'Present' ? '#10b981' : '#f59e0b' }]} />
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
        { title: 'Work Approval', icon: <CheckCircle size={20} color="#fff" />, color: '#3b82f6', path: '/attendance/work-approval' },
        { title: 'Leave Request', icon: <Clock size={20} color="#fff" />, color: '#f59e0b', path: '/apply-leave' },
        { title: 'Holiday List', icon: <AlertCircle size={20} color="#fff" />, color: '#10b981', path: null },
    ];

    return (
        <View style={styles.container}>
            <HeaderCard />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.pageTitle}>Attendance</Text>
                    {todayLog ? (
                        <View style={[styles.statusBadge, { backgroundColor: todayLog.check_out ? '#10b981' : '#3b82f6' }]}>
                            <Text style={styles.statusBadgeText}>{todayLog.check_out ? 'Finalized' : 'Checked In'}</Text>
                        </View>
                    ) : (
                        <View style={[styles.statusBadge, { backgroundColor: '#ef4444' }]}>
                            <Text style={styles.statusBadgeText}>Not Checked In</Text>
                        </View>
                    )}
                </View>

                {/* Check-in/Check-out Card */}
                <View style={styles.attendanceActionCard}>
                    {!todayLog ? (
                        <TouchableOpacity
                            style={styles.mainActionButton}
                            onPress={handleCheckIn}
                            disabled={processing}
                        >
                            {processing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <View style={styles.iconCircle}>
                                        <MapPin size={28} color="#fff" />
                                    </View>
                                    <View>
                                        <Text style={styles.actionTitle}>Check In Now</Text>
                                        <Text style={styles.actionSubtitle}>Start your workday</Text>
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : !todayLog.check_out ? (
                        <TouchableOpacity
                            style={[styles.mainActionButton, { backgroundColor: '#f97316' }]}
                            onPress={handleCheckOut}
                            disabled={processing}
                        >
                            {processing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                        <Clock size={28} color="#fff" />
                                    </View>
                                    <View>
                                        <Text style={styles.actionTitle}>Check Out Now</Text>
                                        <Text style={styles.actionSubtitle}>End your workday</Text>
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.finishedCard}>
                            <CheckCircle size={32} color="#10b981" />
                            <Text style={styles.finishedText}>Workday Finished</Text>
                            <Text style={styles.durationText}>
                                Duration: {Math.floor((todayLog.work_duration || 0) / 60)}h {(todayLog.work_duration || 0) % 60}m
                            </Text>
                        </View>
                    )}
                </View>

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
                        {loading ? (
                            <View style={{ width: '100%', paddingVertical: 40, alignItems: 'center' }}>
                                <ActivityIndicator color="#3b82f6" />
                            </View>
                        ) : renderCalendar()}
                    </View>
                </View>

                {/* Sub-Action Buttons */}
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
        backgroundColor: '#f8fafc',
    },
    content: {
        padding: 16,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    attendanceActionCard: {
        marginBottom: 24,
    },
    mainActionButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    actionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
    },
    actionSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    finishedCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    finishedText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        marginTop: 12,
    },
    durationText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 4,
    },
    calendarCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
    },
    navButton: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    todayCell: {
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3b82f6',
    },
    dayText: {
        fontSize: 15,
        color: '#334155',
        fontWeight: '600',
    },
    todayText: {
        color: '#3b82f6',
        fontWeight: '900',
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        marginTop: 2,
    },
    actionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 40,
    },
    actionButton: {
        flex: 1,
        minWidth: '45%',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIcon: {
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        borderRadius: 12,
    },
    actionText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    otherMonthCell: {
        opacity: 0.2,
    },
    otherMonthText: {
        fontSize: 14,
        color: '#94a3b8',
    },
});
