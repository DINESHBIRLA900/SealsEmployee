import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../../src/i18n/i18n';

interface AddressDetailsProps {
    formData: any;
    handleChange: (field: string, value: string) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    readOnly?: boolean;
}

const AddressDetails: React.FC<AddressDetailsProps> = ({ formData, handleChange, setFormData, readOnly = false }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handlePincodeChange = async (text: string) => {
        if (readOnly) return;
        handleChange('pincode', text);

        if (text.length === 6) {
            setLoading(true);
            try {
                const response = await axios.get(`https://api.postalpincode.in/pincode/${text}`);
                const data = response.data;

                if (data && data[0].Status === 'Success') {
                    const postOffice = data[0].PostOffice[0];
                    setFormData((prev: any) => ({
                        ...prev,
                        pincode: text,
                        state: postOffice.State,
                        district: postOffice.District,
                        // Use safe merging for nested objects if any, though here it's flat for address
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch address details", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const renderInput = (label: string, field: string, placeholder: string, keyboardType: 'default' | 'numeric' = 'default', required: boolean = false, editable: boolean = true) => {
        const isEditable = editable && !readOnly;
        return (
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={[styles.input, !isEditable && styles.disabledInput]}
                        value={formData[field]}
                        onChangeText={(text) => field === 'pincode' ? handlePincodeChange(text) : handleChange(field, text)}
                        placeholder={placeholder}
                        placeholderTextColor="#9ca3af"
                        keyboardType={keyboardType}
                        editable={isEditable}
                        maxLength={field === 'pincode' ? 6 : undefined}
                        autoCapitalize="words"
                    />
                    {field === 'pincode' && loading && (
                        <ActivityIndicator style={styles.loader} size="small" color="#10b981" />
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{t('address_details', 'Address Details')}</Text>

            {renderInput(t('pincode', 'Pincode'), "pincode", t('enter_pincode', 'Enter Pincode'), "numeric", true)}
            {renderInput(t('state', 'State'), "state", t('state', 'State'), "default", false, false)}
            {renderInput(t('district', 'District'), "district", t('district', 'District'), "default", false, false)}
            {renderInput(t('tehsil', 'Tehsil'), "tehsil", t('enter_tehsil', 'Enter Tehsil'))}
            {renderInput(t('city_village', 'City / Village'), "village", t('enter_village', 'Enter City / Village'))}
            {renderInput(t('address_line', 'Address Line'), "address_line", t('enter_address_line', 'Enter Address Line'))}
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
    inputWrapper: {
        position: 'relative',
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
    disabledInput: {
        backgroundColor: '#e5e7eb',
        color: '#6b7280',
    },
    loader: {
        position: 'absolute',
        right: 12,
        top: 12,
    }
});

export default AddressDetails;
