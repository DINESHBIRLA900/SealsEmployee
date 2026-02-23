import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
// import { useTranslation } from 'react-i18next'; // Uncomment if using i18n later

interface ContactPersonProps {
    formData: any;
    handleChange: (field: string, value: string) => void;
    readOnly?: boolean;
}

const ContactPerson: React.FC<ContactPersonProps> = ({ formData, handleChange, readOnly = false }) => {
    // const { t } = useTranslation();

    const renderInput = (label: string, field: string, placeholder: string, keyboardType: 'default' | 'numeric' | 'phone-pad' | 'email-address' = 'default', maxLength?: number) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
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
            <Text style={styles.sectionTitle}>Contact Person</Text>

            {renderInput('Person Name', 'person_name', 'Enter Person Name')}
            {renderInput('Mobile Number', 'number', 'Enter Mobile Number', 'phone-pad', 10)}
            {renderInput('WhatsApp Number', 'whatsapp_number', 'Enter WhatsApp Number', 'phone-pad', 10)}
            {renderInput('Email ID', 'mail_id', 'Enter Email ID', 'email-address')}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
        borderRadius: 10, // Consistent with other cards
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

export default ContactPerson;
