import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronDown, X } from 'lucide-react-native';
import api from '../../src/services/api';
import '../../src/i18n/i18n';

import { API_URL } from '../../src/config';

// Helper to get API URL - hardcoded for mobile for now or use config
// const API_URL = 'http://192.168.1.5:5001/api/company'; // Update this with your actual machine IP

interface OfficeDetailsProps {
    formData: any;
    handleChange: (field: string, value: string) => void;
    readOnlyFields?: string[];
}

const OfficeDetails: React.FC<OfficeDetailsProps> = ({ formData, handleChange, readOnlyFields = [] }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);

    // Data states
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [jobTypes, setJobTypes] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);

    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState<string | null>(null);
    const [currentOptions, setCurrentOptions] = useState<any[]>([]);
    const [currentKeyName, setCurrentKeyName] = useState<string>('');
    const [currentLabel, setCurrentLabel] = useState<string>('');

    // Fetch Initial Data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [deptRes, roleRes, jobRes, catRes, teamRes, userRes] = await Promise.all([
                    api.get('/company/department'),
                    api.get('/company/roletype'),
                    api.get('/company/jobtype'),
                    api.get('/company/category'),
                    api.get('/company/teams'),
                    api.get('/users/active') // Assuming an endpoint for active users/managers
                ]);

                setDepartments(deptRes.data);
                setRoles(roleRes.data);
                setJobTypes(jobRes.data);
                setCategories(catRes.data);
                setTeams(teamRes.data);
                setManagers(userRes.data); // Or filter locally if needed
            } catch (error) {
                console.error("Error fetching office details data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Fetch Designations when Department changes
    useEffect(() => {
        const fetchDesignations = async () => {
            if (!formData.department) {
                setDesignations([]);
                return;
            }

            try {
                // Assuming endpoint supports ?department=ID filtering
                const res = await api.get(`/company/designation?department=${formData.department}`);
                setDesignations(res.data);
            } catch (error) {
                console.error("Error fetching designations:", error);
            }
        };

        fetchDesignations();
    }, [formData.department]);


    const openSelector = (field: string, options: any[], keyName: string, label: string) => {
        if (readOnlyFields.includes(field)) return;

        // Special case: If opening Designation but no Department is selected
        if (field === 'designation' && !formData.department) {
            alert(t('please_select_department_first') || "Please select a Department first");
            return;
        }

        setCurrentField(field);
        setCurrentOptions(options);
        setCurrentKeyName(keyName);
        setCurrentLabel(label);
        setModalVisible(true);
    };

    const handleSelect = (item: any) => {
        if (currentField) {
            handleChange(currentField, item._id);

            // If department changes, clear designation
            if (currentField === 'department') {
                // We need to clear the designation. 
                // Since handleChange updates one field, we might need a way to clear another.
                // Ideally handleChange handles this or we call it again.
                // Check if `handleChange` supports just one update. 
                // If the parent component manages state, we should probably trigger a clear there, 
                // but for now, we rely on the user to re-select or we'd need a multi-update prop.
                // A common pattern is to just let the value become invalid or clear it via a second call if parent allows.
                handleChange('designation', '');
            }
        }
        setModalVisible(false);
    };

    const toTitleCase = (str: string) => {
        if (!str) return '';
        return str.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    };

    const renderSelector = (label: string, field: string, options: any[], keyName: string = 'name', required: boolean = false) => {
        const isReadOnly = readOnlyFields.includes(field);
        const selectedItem = options.find(opt => opt._id === formData[field]);
        // Fallback for designation if it's loading or not found in new list
        const displayValue = selectedItem
            ? toTitleCase(selectedItem[keyName] || selectedItem.name)
            : (formData[field] && field !== 'designation' ? "Loading..." : (t(`select_${field.replace('_', '')}`) || `Select ${label}`));

        return (
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
                <TouchableOpacity
                    style={[styles.selector, isReadOnly && styles.readOnlyInput]}
                    onPress={() => openSelector(field, options, keyName, label)}
                    disabled={isReadOnly}
                >
                    <Text style={[styles.selectorText, !selectedItem && styles.placeholderText, isReadOnly && styles.readOnlyInputText]}>
                        {displayValue}
                    </Text>
                    {!isReadOnly && <ChevronDown size={20} color="#6b7280" />}
                </TouchableOpacity>
                {isReadOnly && <Text style={styles.readOnlyText}>Editable by Admin only</Text>}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{t('office_details', 'Office Details')}</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    {renderSelector(t('department', 'Department'), "department", departments, 'department_name', true)}
                    {renderSelector(t('designation', 'Designation'), "designation", designations, 'designation_name', true)}
                    {renderSelector(t('role_type', 'Role Type'), "role", roles, 'role_name', true)}
                    {renderSelector(t('job_type', 'Job Type'), "job_type", jobTypes, 'job_type_name', true)}
                    {renderSelector(t('employee_category', 'Employee Category'), "employee_category", categories, 'category_name', true)}

                    {/* Optional Fields */}
                    {renderSelector(t('team', 'Team Structure'), "team", teams, 'team_name', false)}
                    {renderSelector(t('reporting_manager', 'Reporting Manager'), "manager", managers, 'name', false)}
                </>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{currentLabel}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#1f2937" />
                            </TouchableOpacity>
                        </View>

                        {currentOptions.length === 0 ? (
                            <Text style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>No options available</Text>
                        ) : (
                            <FlatList
                                data={currentOptions}
                                keyExtractor={(item) => item._id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.optionItem}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={styles.optionText}>{toTitleCase(item[currentKeyName] || item.name)}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
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
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#f9fafb',
    },
    selectorText: {
        fontSize: 16,
        color: '#1f2937',
    },
    placeholderText: {
        color: '#9ca3af',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    optionItem: {
        paddingVertical: 15,
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

export default OfficeDetails;
