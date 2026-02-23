import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Send, X, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { withObservables } from '@nozbe/watermelondb/react';
import database from '../../src/database';
import WorkApproval from '../../src/database/models/WorkApproval';
import * as SecureStore from 'expo-secure-store';

function WorkApprovalScreen({ workApprovals }: { workApprovals: WorkApproval[] }) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Form State
    const [forDate, setForDate] = useState(new Date().toISOString().split('T')[0]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentCalDate, setCurrentCalDate] = useState(new Date());

    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');

    // Calendar Logic
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const changeMonth = (increment: number) => {
        const newDate = new Date(currentCalDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setCurrentCalDate(newDate);
    };

    const handleDateSelect = (day: number) => {
        const selectedDate = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth(), day);
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dateDay = String(selectedDate.getDate()).padStart(2, '0');
        setForDate(`${year}-${month}-${dateDay}`);
        setShowCalendar(false);
    };

    const renderCalendar = () => {
        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();

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
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isSelected = dateStr === forDate;

            days.push(
                <TouchableOpacity
                    key={`curr-${i}`}
                    style={[styles.dayCell, isSelected && styles.selectedCell]}
                    onPress={() => handleDateSelect(i)}
                >
                    <Text style={[styles.dayText, isSelected && styles.selectedText]}>{i}</Text>
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return '#10b981';
            case 'rejected': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return <CheckCircle size={16} color="#10b981" />;
            case 'rejected': return <XCircle size={16} color="#ef4444" />;
            default: return <Clock size={16} color="#f59e0b" />;
        }
    };

    const handleSubmit = async () => {
        if (!reason || !description) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            const userStr = await SecureStore.getItemAsync('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user?._id || 'unknown';

            await database.write(async () => {
                const workApprovalsCollection = database.get('work_approvals');
                await workApprovalsCollection.create((entry: WorkApproval) => {
                    entry.user_id = userId;
                    entry.date = forDate;
                    entry.reason = reason;
                    entry.details = description;
                    entry.status = 'Pending';
                });
            });

            setReason('');
            setDescription('');
            Alert.alert('Success', 'Request submitted successfully');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save request');
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Work Approval</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Request Form */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>New Request</Text>

                    {/* For Date */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>For Date</Text>
                        <TouchableOpacity style={styles.dateInputContainer} onPress={() => setShowCalendar(true)}>
                            <Text style={styles.dateInput}>{forDate}</Text>
                            <Calendar size={20} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Reason */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Reason</Text>
                        <TextInput
                            style={styles.input}
                            value={reason}
                            onChangeText={setReason}
                            placeholder="e.g., Client Meeting, Site Visit"
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Enter details..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => router.back()}>
                            <X size={20} color="#ef4444" />
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                        >
                            <Send size={20} color="#fff" />
                            <Text style={styles.submitButtonText}>Send Request</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* History List */}
                <Text style={styles.sectionTitle}>Request History</Text>
                <View style={styles.historyList}>
                    {workApprovals.length === 0 ? (
                        <View style={styles.emptyHistory}>
                            <Text style={styles.emptyHistoryText}>No request history found.</Text>
                        </View>
                    ) : (
                        workApprovals.map((item) => (
                            <View key={(item as any).id} style={styles.historyItem}>
                                <View style={styles.historyHeader}>
                                    <Text style={styles.historyDate}>{item.date}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                                        {getStatusIcon(item.status)}
                                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                                    </View>
                                </View>
                                <Text style={styles.historyReason}>{item.reason}</Text>
                                <Text style={styles.historyDesc} numberOfLines={2}>{item.details}</Text>
                            </View>
                        ))
                    )}
                </View>

            </ScrollView>

            {/* Calendar Modal */}
            <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Date</Text>
                            <TouchableOpacity onPress={() => setShowCalendar(false)}>
                                <X size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.calendarContainer}>
                            <View style={styles.monthHeader}>
                                <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
                                    <ChevronLeft size={24} color="#374151" />
                                </TouchableOpacity>
                                <Text style={styles.monthTitle}>
                                    {currentCalDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </Text>
                                <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
                                    <ChevronRight size={24} color="#374151" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.weekRow}>
                                {DAYS.map(d => <Text key={d} style={styles.weekDayText}>{d}</Text>)}
                            </View>
                            <View style={styles.daysGrid}>
                                {renderCalendar()}
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
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
    },
    card: {
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
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    dateInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    textArea: {
        height: 100,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        gap: 8,
    },
    cancelButton: {
        backgroundColor: '#fee2e2',
    },
    cancelButtonText: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#3b82f6',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    historyList: {
        gap: 12,
        paddingBottom: 40,
    },
    historyItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    historyDate: {
        fontSize: 14,
        color: '#6b7280',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    historyReason: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    historyDesc: {
        fontSize: 14,
        color: '#6b7280',
    },
    emptyHistory: {
        alignItems: 'center',
        padding: 20,
    },
    emptyHistoryText: {
        color: '#9ca3af',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    calendarContainer: {},
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
    navButton: { padding: 8 },
    weekRow: { flexDirection: 'row', marginBottom: 8 },
    weekDayText: { flex: 1, textAlign: 'center', fontSize: 12, color: '#9ca3af', fontWeight: '600' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    dayText: { fontSize: 14, color: '#374151' },
    selectedCell: {
        backgroundColor: '#3b82f6',
        borderRadius: 20,
    },
    selectedText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    otherMonthCell: {
        opacity: 0.5,
    },
    otherMonthText: {
        fontSize: 14,
        color: '#d1d5db',
    },
});

const enhance = withObservables([], () => ({
    workApprovals: database.get('work_approvals').query().observe(),
}));

export default enhance(WorkApprovalScreen);
