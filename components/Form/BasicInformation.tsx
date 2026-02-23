import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, Platform } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import '../../src/i18n/i18n'; // Import i18n configuration

interface BasicInformationProps {
    formData: any;
    handleChange: (field: string, value: string) => void;
    readOnlyFields?: string[];
    personType?: 'Employee' | 'Customer';
}

const BasicInformation: React.FC<BasicInformationProps> = ({ formData, handleChange, readOnlyFields = [], personType = 'Employee' }) => {
    const { t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState<string | null>(null);
    const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
    const [headerTitle, setHeaderTitle] = useState('');

    const openSelector = (field: string, title: string, items: { label: string; value: string }[]) => {
        if (readOnlyFields.includes(field)) return;
        setCurrentField(field);
        setHeaderTitle(title);
        setOptions(items);
        setModalVisible(true);
    };

    const handleSelect = (value: string) => {
        if (currentField) {
            handleChange(currentField, value);
        }
        setModalVisible(false);
    };

    const renderInput = (label: string, field: string, placeholder: string, keyboardType: 'default' | 'numeric' | 'phone-pad' | 'email-address' = 'default', required: boolean = false, maxLength?: number) => {
        const isReadOnly = readOnlyFields.includes(field);
        return (
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
                <TextInput
                    style={[styles.input, isReadOnly && styles.readOnlyInput]}
                    value={formData[field]}
                    onChangeText={(text) => handleChange(field, text)}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    editable={!isReadOnly}
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                />
                {isReadOnly && <Text style={styles.readOnlyText}>Editable by Admin only</Text>}
            </View>
        );
    };

    const renderDropdown = (label: string, field: string, value: string, title: string, items: { label: string; value: string }[]) => {
        const isReadOnly = readOnlyFields.includes(field);
        const selectedItem = items.find(item => item.value === value);
        return (
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{label}</Text>
                <TouchableOpacity
                    style={[styles.dropdown, isReadOnly && styles.readOnlyInput]}
                    onPress={() => openSelector(field, title, items)}
                    disabled={isReadOnly}
                >
                    <Text style={[styles.inputText, !value && styles.placeholderText, isReadOnly && styles.readOnlyInputText]}>
                        {selectedItem ? selectedItem.label : `${t('select_status')} ${label}`}
                    </Text>
                    {!isReadOnly && <ChevronDown size={20} color="#9ca3af" />}
                </TouchableOpacity>
                {isReadOnly && <Text style={styles.readOnlyText}>Editable by Admin only</Text>}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{t('section_basic_info', 'Basic Information')}</Text>

            {renderInput(personType === 'Customer' ? t('customer_full_name', 'Customer Full Name') : t('employee_full_name', 'Employee Full Name'), "name", personType === 'Customer' ? t('enter_customer_name', 'Enter Customer Name') : t('enter_full_name', 'Enter Full Name'), 'default', true)}
            {renderInput(t('fathers_name', "Father's Name"), "father_name", t('enter_fathers_name', "Enter Father's Name"))}

            {renderDropdown(t('gender', 'Gender'), "gender", formData.gender, t('select_gender', 'Select Gender'), [
                { label: t('male', 'Male'), value: "Male" },
                { label: t('female', 'Female'), value: "Female" },
                { label: t('other', 'Other'), value: "Other" }
            ])}

            {/* Date of Birth - Using basic text input for now, ideally DatePicker */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('dob', 'Date of Birth (DOB)')}</Text>
                <TextInput
                    style={styles.input}
                    value={formData.dob}
                    onChangeText={(text) => handleChange("dob", text)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                />
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#e5e7eb' }]}>{t('section_contact_details', 'Contact Details')}</Text>

            {renderInput(t('mobile_number', 'Mobile Number'), "mobile_number", t('enter_mobile_number', 'Enter Mobile Number'), 'phone-pad', true, 10)}
            {renderInput(t('whatsapp_number', 'WhatsApp Number'), "whatsapp_number", t('enter_whatsapp_number', 'Enter WhatsApp Number'), 'phone-pad', false, 10)}
            {renderInput(t('alternate_mobile_number', 'Alternate Mobile Number'), "alternate_mobile_number", t('enter_alternate_mobile', 'Enter Alternate Mobile Number'), 'phone-pad', false, 10)}
            {renderInput(t('email_id', 'Email ID'), "email", t('enter_email_id', 'Enter Email ID'))}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{headerTitle}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text style={styles.optionText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1f2937',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
        marginBottom: 8,
    },
    required: {
        color: '#ef4444',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1f2937',
        backgroundColor: '#f9fafb',
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#f9fafb',
    },
    inputText: {
        fontSize: 16,
        color: '#1f2937',
    },
    placeholderText: {
        color: '#9ca3af',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        maxHeight: '50%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    optionItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    optionText: {
        fontSize: 16,
        color: '#374151',
    },
    readOnlyInput: {
        backgroundColor: '#f3f4f6',
        borderColor: '#e5e7eb',
        opacity: 0.8,
    },
    readOnlyInputText: {
        color: '#6b7280',
    },
    readOnlyText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
        fontStyle: 'italic',
    },
});

export default BasicInformation;
