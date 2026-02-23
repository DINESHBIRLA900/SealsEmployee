import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Building2, Plus, Trash2, Save, ArrowLeft } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AddressDetails from '../../components/Form/AddressDetails';
import { createCustomer } from '../../src/services/customerService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function AddB2BCustomer() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    // Form State
    const [formData, setFormData] = useState({
        name: '', // Business Name
        branch_type: 'Head Office',
        gstin: '',
        phone: '',
        email: '',
        website: '',

        // Address Details (handled by AddressDetails component linkage)
        address_line: '',
        village: '',
        tehsil: '',
        district: '',
        state: '',
        pincode: '',

        contact_persons: [] as any[], // Array of contact persons
        customer_type: 'B2B',
        status: 'Active'
    });

    const [contactPersons, setContactPersons] = useState<any[]>([{
        person_name: '',
        number: '',
        whatsapp_number: '',
        mail_id: ''
    }]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleContactPersonChange = (index: number, field: string, value: string) => {
        const updated = [...contactPersons];
        updated[index][field] = value;
        setContactPersons(updated);
    };

    const addContactPerson = () => {
        setContactPersons([...contactPersons, { person_name: '', number: '', whatsapp_number: '', mail_id: '' }]);
    };

    const removeContactPerson = (index: number) => {
        if (contactPersons.length === 1) {
            Alert.alert(t('warning'), t('at_least_one_contact_person_required'));
            return;
        }
        const updated = [...contactPersons];
        updated.splice(index, 1);
        setContactPersons(updated);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.phone) {
            Alert.alert(t('error'), t('error_business_name_phone_required'));
            return;
        }

        setLoading(true);
        try {
            const customerPayload = {
                ...formData,
                contact_persons: contactPersons
            };

            await createCustomer(customerPayload);
            Alert.alert(t('success'), t('b2b_customer_created_successfully'), [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error("Submission error:", error);
            Alert.alert(t('error'), error.response?.data?.message || t('failed_to_create_customer'));
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label: string, field: string, placeholder: string, keyboardType: 'default' | 'numeric' | 'phone-pad' | 'email-address' | 'url' = 'default', required = false, maxLength?: number) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
            <TextInput
                style={styles.input}
                value={(formData as any)[field]}
                onChangeText={(text) => handleChange(field, text)}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                keyboardType={keyboardType}
                maxLength={maxLength}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: t('add_b2b_customer') }} />

            <KeyboardAwareScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 100 }}
                enableOnAndroid={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
            >

                {/* Branch Type Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('branch_type')}</Text>
                    <View style={styles.radioGroup}>
                        {['Head Office', 'Branch Office'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.radioButton, formData.branch_type === type && styles.radioButtonSelected]}
                                onPress={() => handleChange('branch_type', type)}
                            >
                                <View style={[styles.radioCircle, formData.branch_type === type && styles.radioCircleSelected]}>
                                    {formData.branch_type === type && <View style={styles.radioDot} />}
                                </View>
                                <Text style={[styles.radioLabel, formData.branch_type === type && styles.radioLabelSelected]}>{type === 'Head Office' ? t('head_office') : t('branch_office')}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Business Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('business_details')}</Text>
                    {renderInput(t('business_name'), 'name', t('enter_business_name'), 'default', true)}
                    {renderInput(t('gstin'), 'gstin', t('enter_gstin'))}

                    {renderInput(t('website'), 'website', 'https://example.com', 'url')}
                </View>

                {/* Contact Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('business_contact')}</Text>
                    {renderInput(t('business_phone'), 'phone', t('enter_primary_phone'), 'phone-pad', true, 10)}
                    {renderInput(t('business_email'), 'email', t('enter_business_email'), 'email-address')}
                </View>

                {/* Address Details - Reusing Component */}
                <View style={styles.section}>
                    <AddressDetails
                        formData={formData}
                        handleChange={handleChange}
                        setFormData={setFormData}
                    />
                </View>

                {/* Contact Persons */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('contact_persons')}</Text>
                        <TouchableOpacity onPress={addContactPerson} style={styles.addButton}>
                            <Plus size={16} color="#fff" />
                            <Text style={styles.addButtonText}>{t('add')}</Text>
                        </TouchableOpacity>
                    </View>

                    {contactPersons.map((person, index) => (
                        <View key={index} style={styles.contactPersonCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{t('contact')} #{index + 1}</Text>
                                {contactPersons.length > 1 && (
                                    <TouchableOpacity onPress={() => removeContactPerson(index)}>
                                        <Trash2 size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>{t('person_name')}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={person.person_name}
                                    onChangeText={(text) => handleContactPersonChange(index, 'person_name', text)}
                                    placeholder={t('enter_person_name')}
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>
                            <View style={styles.row}>
                                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>{t('contact_number')}</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={person.number}
                                        onChangeText={(text) => handleContactPersonChange(index, 'number', text)}
                                        placeholder={t('enter_contact_number')}
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                    />
                                </View>
                                <View style={[styles.inputContainer, { flex: 1 }]}>
                                    <Text style={styles.label}>{t('whatsapp_number')}</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={person.whatsapp_number}
                                        onChangeText={(text) => handleContactPersonChange(index, 'whatsapp_number', text)}
                                        placeholder={t('enter_whatsapp_number')}
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                    />
                                </View>
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>{t('email_id')}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={person.mail_id}
                                    onChangeText={(text) => handleContactPersonChange(index, 'mail_id', text)}
                                    placeholder={t('enter_email_id')}
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>
                    ))}
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
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
        marginBottom: 6,
    },
    required: {
        color: '#ef4444',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10, // Adjusted for better touch target/visual
        fontSize: 16,
        color: '#1f2937',
        backgroundColor: '#f9fafb',
    },
    row: {
        flexDirection: 'row',
    },
    // Radio Button Styles
    radioGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 20,
        backgroundColor: '#f9fafb',
    },
    radioButtonSelected: {
        borderColor: '#3b82f6',
        backgroundColor: '#eff6ff',
    },
    radioCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#9ca3af',
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleSelected: {
        borderColor: '#3b82f6',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3b82f6',
    },
    radioLabel: {
        fontSize: 14,
        color: '#4b5563',
    },
    radioLabelSelected: {
        color: '#3b82f6',
        fontWeight: '500',
    },
    // Chips for Customer Type
    radioGroupRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipSelected: {
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
    },
    chipLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    chipLabelSelected: {
        color: '#059669',
        fontWeight: '500',
    },
    // Contact Person Card
    contactPersonCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    // Footer
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
