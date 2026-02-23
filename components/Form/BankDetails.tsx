import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface BankDetailsProps {
    formData: any;
    handleChange: (field: string, value: string) => void;
    readOnly?: boolean;
}

const BankDetails: React.FC<BankDetailsProps> = ({ formData, handleChange, readOnly = false }) => {
    const { t } = useTranslation();
    const [reEnterAccountNumber, setReEnterAccountNumber] = useState(formData.account_number || '');
    const [error, setError] = useState('');

    const handleReEnterChange = (text: string) => {
        setReEnterAccountNumber(text);
        if (text !== formData.account_number) {
            setError(t('account_numbers_mismatch') || 'Account numbers do not match');
        } else {
            setError('');
        }
    };

    const handleAccountChange = (text: string) => {
        handleChange('account_number', text);
        if (reEnterAccountNumber && text !== reEnterAccountNumber) {
            setError(t('account_numbers_mismatch') || 'Account numbers do not match');
        } else {
            setError('');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{t('bank_details', 'Bank Details')}</Text>

            {/* Bank Name */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('bank_name', 'Bank Name')}</Text>
                <TextInput
                    style={[styles.input, readOnly && styles.readOnlyInput]}
                    value={formData.bank_name}
                    onChangeText={(text) => handleChange('bank_name', text)}
                    placeholder={t('enter_bank_name') || "Enter Bank Name"}
                    placeholderTextColor="#9ca3af"
                    editable={!readOnly}
                />
            </View>

            {/* Account Holder Name */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('account_holder_name', 'Account Holder Name')}</Text>
                <TextInput
                    style={[styles.input, readOnly && styles.readOnlyInput]}
                    value={formData.account_holder_name}
                    onChangeText={(text) => handleChange('account_holder_name', text)}
                    placeholder={t('enter_account_holder_name') || "Enter Account Holder Name"}
                    placeholderTextColor="#9ca3af"
                    editable={!readOnly}
                />
            </View>

            {/* Account Number */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('account_number', 'Account Number')}</Text>
                <TextInput
                    style={[styles.input, readOnly && styles.readOnlyInput]}
                    value={formData.account_number}
                    onChangeText={handleAccountChange}
                    placeholder={t('enter_account_number') || "Enter Account Number"}
                    placeholderTextColor="#9ca3af"
                    editable={!readOnly}
                    secureTextEntry={!readOnly} // Hide account number initially if editable? Usually redundant if re-enter is there, but standard practice. Let's keep it visible for user ease unless requested otherwise, user requested "Re-Enter" implies validation.
                // Actually user didn't ask to hide it, just to have a re-enter field.
                // I'll keep it simple text.
                />
            </View>

            {/* Re-Enter Account Number */}
            {!readOnly && (
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('re_enter_account_number', 'Re-Enter Account Number')}</Text>
                    <TextInput
                        style={[styles.input, error ? styles.inputError : null]}
                        value={reEnterAccountNumber}
                        onChangeText={handleReEnterChange}
                        placeholder={t('re_enter_account_number') || "Re-Enter Account Number"}
                        placeholderTextColor="#9ca3af"
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>
            )}

            {/* UPI ID */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('upi_id', 'UPI ID')}</Text>
                <TextInput
                    style={[styles.input, readOnly && styles.readOnlyInput]}
                    value={formData.upi_id}
                    onChangeText={(text) => handleChange('upi_id', text)}
                    placeholder={t('enter_upi_id') || "Enter UPI ID"}
                    placeholderTextColor="#9ca3af"
                    editable={!readOnly}
                />
            </View>
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
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#1f2937',
        backgroundColor: '#f9fafb',
    },
    readOnlyInput: {
        backgroundColor: '#f3f4f6', // Slightly darker/grayer to indicate read-only
        opacity: 0.8,
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
});

export default BankDetails;
