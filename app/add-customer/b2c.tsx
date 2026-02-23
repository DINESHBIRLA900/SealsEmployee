import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Save } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BasicInformation from '../../components/Form/BasicInformation';
import AddressDetails from '../../components/Form/AddressDetails';
import { createCustomer } from '../../src/services/customerService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function AddB2CCustomer() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    // Form State
    const [formData, setFormData] = useState({
        // Basic Info
        name: '',
        father_name: '',
        gender: '',
        dob: '',

        // Contact Info
        phone: '', // Mobile Number
        whatsapp_number: '',
        alternate_mobile_number: '',
        email: '',

        // Address Details
        address_line: '',
        village: '',
        tehsil: '',
        district: '',
        state: '',
        pincode: '',

        customer_type: 'B2C',
        status: 'Active'
    });

    const handleChange = (field: string, value: string) => {
        // Map BasicInformation fields to formData if names mismatch, 
        // but here they match: name, father_name, gender, dob, phone(mapped from mobile_number in BasicInfo?), whatsapp_number, alternate_mobile_number, email

        // BasicInformation uses specific field names, let's ensure they match
        // BasicInformation fields: name, father_name, gender, dob, mobile_number, whatsapp_number, alternate_mobile_number, email

        if (field === 'mobile_number') {
            setFormData(prev => ({ ...prev, phone: value }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.phone) {
            Alert.alert(t('error'), t('error_business_name_phone_required').replace('Business Name', 'Name')); // Reuse error or add new key
            return;
        }

        setLoading(true);
        try {
            const customerPayload = {
                ...formData,
            };

            await createCustomer(customerPayload);
            Alert.alert(t('success'), "Customer created successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error("Submission error:", error);
            Alert.alert(t('error'), error.response?.data?.message || t('failed_to_create_customer'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Add Farmer' }} />

            <KeyboardAwareScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 100 }}
                enableOnAndroid={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
            >

                {/* Basic Information */}
                <View style={styles.section}>
                    <BasicInformation
                        formData={{
                            ...formData,
                            mobile_number: formData.phone // Map back for display
                        }}
                        handleChange={handleChange}
                        personType="Customer"
                    />
                </View>

                {/* Address Details */}
                <View style={styles.section}>
                    <AddressDetails
                        formData={formData}
                        handleChange={handleChange}
                        setFormData={setFormData}
                    />
                </View>

            </KeyboardAwareScrollView>

            {/* Footer Actions */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Save size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.submitButtonText}>{t('save_customer')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
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
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 2, // BasicInfo has its own padding
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden'
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    cancelButtonText: {
        color: '#4b5563',
        fontWeight: '600',
        fontSize: 16,
    },
    submitButton: {
        flex: 2,
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#3b82f6',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
