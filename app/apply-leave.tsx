import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar, FileText, Send } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { applyLeave } from '../src/services/leaveService';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Other'];

export default function ApplyLeaveScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        leave_type: LEAVE_TYPES[0],
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: '',
    });

    const handleSubmit = async () => {
        if (!formData.reason) {
            Alert.alert('Error', 'Please provide a reason for leave.');
            return;
        }

        setLoading(true);
        try {
            const userStr = await SecureStore.getItemAsync('user');
            const user = userStr ? JSON.parse(userStr) : null;

            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            if (totalDays <= 0) {
                Alert.alert('Error', 'End date must be after or equal to start date.');
                setLoading(false);
                return;
            }

            await applyLeave({
                user_id: user?.id || user?._id,
                leave_type: formData.leave_type,
                start_date: formData.start_date,
                end_date: formData.end_date,
                total_days: totalDays,
                reason: formData.reason
            });

            Alert.alert('Success', 'Leave application submitted successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit leave application');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={28} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Apply Leave</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { padding: 24 }]}>
                    <Text style={styles.label}>Select Leave Type</Text>
                    <View style={styles.typeGrid}>
                        {LEAVE_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.typeButton,
                                    formData.leave_type === type && styles.typeButtonActive
                                ]}
                                onPress={() => setFormData({ ...formData, leave_type: type })}
                            >
                                <Text style={[
                                    styles.typeText,
                                    formData.leave_type === type && styles.typeTextActive
                                ]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.dateRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Start Date</Text>
                            <TouchableOpacity style={styles.inputContainer}>
                                <Calendar size={18} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    value={formData.start_date}
                                    onChangeText={(val) => setFormData({ ...formData, start_date: val })}
                                    placeholder="YYYY-MM-DD"
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: 16 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>End Date</Text>
                            <TouchableOpacity style={styles.inputContainer}>
                                <Calendar size={18} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    value={formData.end_date}
                                    onChangeText={(val) => setFormData({ ...formData, end_date: val })}
                                    placeholder="YYYY-MM-DD"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.label}>Reason for Leave</Text>
                    <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingVertical: 12 }]}>
                        <FileText size={18} color="#64748b" style={{ marginTop: 4 }} />
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            value={formData.reason}
                            onChangeText={(val) => setFormData({ ...formData, reason: val })}
                            placeholder="Briefly explain why you need leave..."
                            multiline
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Send size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.submitText}>Submit Application</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Important Notes */}
                <View style={styles.noteCard}>
                    <Text style={styles.noteTitle}>Important Notes:</Text>
                    <Text style={styles.noteText}>• Apply at least 2 days in advance for casual leaves.</Text>
                    <Text style={styles.noteText}>• For sick leave, medical certificate may be required for more than 2 days.</Text>
                    <Text style={styles.noteText}>• Final approval rests with your department head.</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#f1f5f9',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
    },
    content: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    label: {
        fontSize: 12,
        fontWeight: '900',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    typeButtonActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    typeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    typeTextActive: {
        color: '#fff',
    },
    dateRow: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    submitButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 16,
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 6,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
    noteCard: {
        padding: 20,
        backgroundColor: '#fff7ed',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ffedd5',
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#9a3412',
        marginBottom: 8,
    },
    noteText: {
        fontSize: 12,
        color: '#c2410c',
        fontWeight: '600',
        marginBottom: 4,
        lineHeight: 18,
    },
});
