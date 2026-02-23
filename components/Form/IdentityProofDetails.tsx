import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../src/i18n/i18n';

interface IdentityProofDetailsProps {
    formData: any;
    handleChange: (field: string, value: string) => void;
    readOnly?: boolean;
}

const IdentityProofDetails: React.FC<IdentityProofDetailsProps> = ({ formData, handleChange, readOnly = false }) => {
    const { t } = useTranslation();

    const renderInput = (label: string, field: string, placeholder: string, keyboardType: 'default' | 'numeric' | 'phone-pad' = 'default', required: boolean = false, optionalText: string = '') => (
        <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
                {optionalText ? <Text style={styles.optionalText}>({optionalText})</Text> : null}
            </View>
            <TextInput
                style={[styles.input, field !== 'aadhaar_number' && styles.uppercaseInput, readOnly && styles.readOnlyInput]}
                value={formData[field]}
                onChangeText={(text) => handleChange(field, field === 'aadhaar_number' ? text : text.toUpperCase())}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                keyboardType={keyboardType}
                autoCapitalize={field !== 'aadhaar_number' ? 'characters' : 'none'}
                editable={!readOnly}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{t('identity_proof_details', 'Identity Proof Details')}</Text>

            {renderInput(t('aadhaar_number', 'Aadhaar Number'), "aadhaar_number", t('enter_aadhaar_number', 'Enter Aadhaar Number'), "numeric")}
            {renderInput(t('pan_number', 'PAN Number'), "pan_number", t('enter_pan_number', 'Enter PAN Number'), "default")}
            {renderInput(t('driving_license_number', 'Driving License Number'), "driving_license_number", t('enter_dl_number', 'Enter Driving License Number'), "default", false, t('optional', 'Optional'))}
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
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
    },
    required: {
        color: '#ef4444',
    },
    optionalText: {
        fontSize: 12,
        color: '#9ca3af',
        marginLeft: 4,
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
    uppercaseInput: {
        // Additional styling if needed for uppercase inputs visual cue
    }
});

export default IdentityProofDetails;
