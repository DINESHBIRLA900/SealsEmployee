import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../src/i18n/i18n';

interface EmergencyContactProps {
    formData: any;
    handleChange: (field: string, value: string) => void;
    readOnly?: boolean;
}

const EmergencyContact: React.FC<EmergencyContactProps> = ({ formData, handleChange, readOnly = false }) => {
    const { t } = useTranslation();

    const renderInput = (label: string, field: string, placeholder: string, keyboardType: 'default' | 'numeric' | 'phone-pad' = 'default', required: boolean = false, maxLength?: number) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
            <TextInput
                style={[styles.input, readOnly && styles.readOnlyInput]}
                value={formData[field]}
                onChangeText={(text) => handleChange(field, text)}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                keyboardType={keyboardType}
                editable={!readOnly}
                maxLength={maxLength}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{t('emergency_contact', 'Emergency Contact')}</Text>

            {renderInput(t('person_name', 'Person Name'), "emergency_person_name", t('enter_person_name', 'Enter Person Name'), "default")}
            {renderInput(t('relation', 'Relation'), "emergency_relation", t('enter_relation', 'Enter Relation'), "default")}
            {renderInput(t('contact_number', 'Contact Number'), "emergency_contact_number", t('enter_contact_number', 'Enter Contact Number'), "phone-pad", false, 10)}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
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
    readOnlyInput: {
        backgroundColor: '#f3f4f6',
        borderColor: '#e5e7eb',
        opacity: 0.8,
    },
});

export default EmergencyContact;
