import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User as UserIcon, Phone, MapPin, Building2, CreditCard, Shield, Lock, Mail, LogOut, ChevronRight, Languages, Edit, X, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import HeaderCard from '../../components/HeaderCard';
import i18n from '../../src/i18n/i18n'; // Direct import of the initialized instance
import api from '../../src/services/api';
import BasicInformation from '../../components/Form/BasicInformation';
import AddressDetails from '../../components/Form/AddressDetails';
import BankDetails from '../../components/Form/BankDetails';
import EmergencyContact from '../../components/Form/EmergencyContact';
import database from '../../src/database';
import { sync } from '../../src/services/sync';


export default function ProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const [userData, setUserData] = React.useState<any>({});
    const [loading, setLoading] = React.useState(false);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    const handleEdit = (sectionId: string) => {
        // Flatten data for edit form
        const formData = { ...userData };

        // Flatten bank details
        if (userData.bank_details) {
            formData.bank_name = userData.bank_details.bank_name;
            formData.account_holder_name = userData.bank_details.account_holder_name;
            formData.account_number = userData.bank_details.account_number;
            formData.upi_id = userData.bank_details.upi_id;
        }

        // Map phone to mobile_number for BasicInformation component
        if (userData.phone) {
            formData.mobile_number = userData.phone;
        }

        setEditFormData(formData);
        setEditingSection(sectionId);
    };

    const handleModalClose = () => {
        setEditingSection(null);
        setEditFormData({});
    };

    const handleModalChange = (field: string, value: string) => {
        setEditFormData((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('permission_denied'), t('permission_needed_for_photo'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadProfilePhoto(result.assets[0]);
        }
    };

    const uploadProfilePhoto = async (asset: ImagePicker.ImagePickerAsset) => {
        setLoading(true);
        try {
            const formData = new FormData();

            // Append file
            const uriParts = asset.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            formData.append('profile_photo', {
                uri: asset.uri,
                name: `profile_${userData._id}.${fileType}`,
                type: `image/${fileType}`
            } as any);

            // Append userId if needed by backend update route (userRoutes.js uses params.id)
            // But we use api.put('/users/:id')

            const response = await api.put(`/users/${userData._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: (data, headers) => {
                    return data; // Prevent Axios from stringifying FormData
                },
            });

            console.log("Photo upload success:", response.data);

            // Update local DB
            await database.write(async () => {
                const userRecord = await (database.get('users') as any).find(userData._id);
                await userRecord.update((user: any) => {
                    user.profilePhoto = response.data.profile_photo;
                });
            });

            Alert.alert(t('success'), t('profile_photo_updated'));
            loadUser(); // Refresh UI

        } catch (error: any) {
            console.error("Profile photo upload failed:", error);
            Alert.alert(t('error'), t('photo_upload_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        console.log("Attempting OFFLINE SAVE..."); // DEBUG LOG
        setSaving(true);
        try {
            // Update local database (offline first)
            await database.write(async () => {
                const userRecord = await (database.get('users') as any).find(userData._id);
                await userRecord.update((user: any) => {
                    // Map editable fields

                    // Basic
                    if (editFormData.name) user.name = editFormData.name;
                    if (editFormData.father_name) user.fatherName = editFormData.father_name;
                    if (editFormData.dob) user.dob = editFormData.dob;
                    if (editFormData.gender) user.gender = editFormData.gender;

                    // Contact
                    if (editFormData.mobile_number) user.phone = editFormData.mobile_number;
                    if (editFormData.email) user.email = editFormData.email;
                    if (editFormData.whatsapp_number) user.whatsappNumber = editFormData.whatsapp_number;
                    if (editFormData.alternate_mobile_number) user.alternateMobileNumber = editFormData.alternate_mobile_number;

                    // Address
                    if (editFormData.address_line) user.addressLine = editFormData.address_line;
                    if (editFormData.state) user.state = editFormData.state;
                    if (editFormData.district) user.district = editFormData.district;
                    if (editFormData.tehsil) user.tehsil = editFormData.tehsil;
                    if (editFormData.city_village) user.village = editFormData.city_village;
                    if (editFormData.pincode) user.pincode = editFormData.pincode;

                    // Bank
                    if (editFormData.bank_name) user.bankName = editFormData.bank_name;
                    if (editFormData.account_holder_name) user.accountHolderName = editFormData.account_holder_name;
                    if (editFormData.account_number) user.accountNumber = editFormData.account_number;
                    if (editFormData.upi_id) user.upiId = editFormData.upi_id;

                    // Emergency
                    if (editFormData.person_name) user.emergencyPersonName = editFormData.person_name;
                    if (editFormData.relation) user.emergencyRelation = editFormData.relation;
                    if (editFormData.contact_number) user.emergencyContactNumber = editFormData.contact_number;
                });
            });

            // Trigger sync in background if possible
            sync().catch(err => console.log('Background sync failed', err));

            // Show success message
            Alert.alert(t('success'), t('profile_updated_successfully'), [
                {
                    text: 'OK',
                    onPress: async () => {
                        await loadUser(); // Refresh data
                        handleModalClose();
                    }
                }
            ]);

        } catch (error: any) {
            console.error("Failed to update profile locally", error);
            Alert.alert(t('error'), t('failed_to_update_profile') + ': ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    React.useEffect(() => {
        loadUser();
        // Trigger background sync to get latest data from server
        sync().then(() => {
            console.log("Sync completed on mount");
            loadUser(); // Refresh UI with synced data
        }).catch(err => console.log("Background sync on mount failed", err));
    }, []);

    const loadUser = async () => {
        setLoading(true);
        try {
            // Get logged in user ID from SecureStore
            const userStr = await SecureStore.getItemAsync('user');
            if (userStr) {
                const secureUser = JSON.parse(userStr);
                const userId = secureUser._id || secureUser.id;

                if (userId) {
                    // Try to get from local DB
                    try {
                        const userRecord = await (database.get('users') as any).find(userId);
                        // Construct user object matching UI expectations (nested objects handled here)
                        const raw = userRecord._raw as any;
                        const constructedUser = {
                            ...raw,
                            _id: userRecord.id,
                            // Map flat fields back to nested structures if needed by UI components
                            bank_details: {
                                bank_name: userRecord.bankName,
                                account_holder_name: userRecord.accountHolderName,
                                account_number: userRecord.accountNumber,
                                upi_id: userRecord.upiId
                            },
                            // Provide defaults or map manually if names differ
                            phone: userRecord.phone,
                            dob: userRecord.dob,
                            gender: userRecord.gender,
                            district: userRecord.district,
                            tehsil: userRecord.tehsil,
                            village: userRecord.village,
                            pincode: userRecord.pincode,
                            state: userRecord.state,
                            address_line: userRecord.addressLine,
                            emergency_person_name: userRecord.emergencyPersonName,
                            emergency_relation: userRecord.emergencyRelation,
                            emergency_contact_number: userRecord.emergencyContactNumber,
                            profile_photo: userRecord.profilePhoto, // Map local photo mapping
                            // Ensure read-only fields coming from sync/login are present
                            role: secureUser.role, // Role object structure might need fetch from Relation or API, keeping simple
                            department: secureUser.department,
                            designation: secureUser.designation,
                            team: secureUser.team,
                            reporting_manager: secureUser.reporting_manager
                        };
                        setUserData(constructedUser);
                    } catch (e) {
                        console.log("User not found locally, fetching from API...");
                        try {
                            console.log(`Fetching from API: /users/${userId}`);
                            const response = await api.get(`/users/${userId}`);
                            const apiUser = response.data;
                            setUserData(apiUser);

                            // Save to local DB for offline access - DISABLED to avoid Sync collision
                            // Sync will handle the DB population. 
                            // If we save here, Sync (first run) will try to Create again and fail/warn.
                            // await saveUserToLocal(apiUser); 
                        } catch (error) {
                            console.error("Failed to fetch full user details", error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error loading user", error);
        } finally {
            setLoading(false);
        }
    };

    /*
    // Disabled to prevent Sync Conflict (Invariant Error)
    // The "Server wants client to create record... but it already exists" error happens
    // because we saved locally here, and then Sync tried to Create it again.
    const saveUserToLocal = async (apiUser: any) => {
        try {
            await database.write(async () => {
                const usersCollection = database.get('users') as any;
                const userExists = await usersCollection.find(apiUser._id).catch(() => null);

                if (userExists) {
                    await userExists.update((user: any) => {
                        mapApiUserToModel(user, apiUser);
                    });
                    console.log("User updated locally from API");
                } else {
                    await usersCollection.create((user: any) => {
                        user._raw.id = apiUser._id; // Ensure ID matches
                        mapApiUserToModel(user, apiUser);
                    });
                    console.log("User created locally from API");
                }
            });
        } catch (error) {
            console.error("Failed to save user locally", error);
        }
    };
    */

    // Kept to allow manual field mapping if needed later, or can be removed.
    // But mapApiUserToModel was only used by saveUserToLocal.
    /*
    const mapApiUserToModel = (user: any, apiUser: any) => {
        // ...
    };
    */

    /*
    const mapApiUserToModel = (user: any, apiUser: any) => {
        user.name = apiUser.name;
        user.email = apiUser.email;
        user.phone = apiUser.phone;
        // Basic
        user.fatherName = apiUser.father_name;
        user.dob = apiUser.dob;
        user.gender = apiUser.gender;

        // Contact
        user.whatsappNumber = apiUser.whatsapp_number;
        user.alternateMobileNumber = apiUser.alternate_mobile_number;

        // Address
        user.addressLine = apiUser.address_line;
        user.state = apiUser.state;
        user.district = apiUser.district;
        user.tehsil = apiUser.tehsil;
        user.village = apiUser.village;
        user.pincode = apiUser.pincode;

        // Bank
        if (apiUser.bank_details) {
            user.bankName = apiUser.bank_details.bank_name;
            user.accountHolderName = apiUser.bank_details.account_holder_name;
            user.accountNumber = apiUser.bank_details.account_number;
            user.upiId = apiUser.bank_details.upi_id;
        }

        // Emergency
        user.emergencyPersonName = apiUser.emergency_person_name;
        user.emergencyRelation = apiUser.emergency_relation;
        user.emergencyContactNumber = apiUser.emergency_contact_number;

        // Docs
        user.aadhaarNumber = apiUser.aadhaar_number;
        user.panNumber = apiUser.pan_number;
        user.drivingLicenseNumber = apiUser.driving_license_number;
        user.profilePhoto = apiUser.profile_photo;
    };
    */

    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    const handleLogout = () => {
        setLogoutModalVisible(true);
    };

    const confirmLogout = async () => {
        setLogoutModalVisible(false);
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
        router.replace('/(auth)/login');
    };

    const changeLanguage = async (lng: string) => {
        if (i18n && typeof i18n.changeLanguage === 'function') {
            await i18n.changeLanguage(lng);
            await AsyncStorage.setItem('language', lng);
        } else {
            console.error("i18n.changeLanguage is not a function", i18n);
        }
    };

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    // Helper for Title Case
    const toTitleCase = (str: string) => {
        if (!str) return '';
        // Replace underscores with spaces and then capitalize
        return str.replace(/_/g, ' ').replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    };

    // Define Profile Sections
    const getProfileSections = (user: any) => [
        {
            id: 'basic',
            title: toTitleCase(t('basic_information') || "Basic Info"),
            icon: <UserIcon color="#60a5fa" size={20} />, // blue-400
            data: [
                { label: t('employee_full_name'), value: user.name },
                { label: t('fathers_name'), value: user.father_name },
                { label: t('dob'), value: formatDate(user.dob) },
                { label: t('gender'), value: user.gender },
            ],
            isEditable: false
        },
        {
            id: 'contact',
            title: toTitleCase(t('contact_details') || "Contact Details"),
            icon: <Phone color="#34d399" size={20} />, // emerald-400
            data: [
                { label: t('mobile_number'), value: user.phone },
                { label: t('email_id'), value: user.email },
                { label: t('whatsapp_number'), value: user.whatsapp_number },
                { label: t('alternate_mobile_number'), value: user.alternate_mobile_number },
            ],
            isEditable: true
        },
        {
            id: 'security',
            title: toTitleCase(t('security_access') || "Security & Access"),
            icon: <Lock color="#ef4444" size={20} />, // red-500
            data: [
                { label: t('username_mobile'), value: user.phone },
                { label: t('password'), value: user.visible_password }, // Only visible to admin/self if allowed
                { label: t('security_code_mpin'), value: user.visible_mpin ? t('set') : t('not_set') },
                { label: t('access_level'), value: user.role?.role_name },
            ],
            isEditable: false
        },
        {
            id: 'address',
            title: toTitleCase(t('address_details') || "Address Details"),
            icon: <MapPin color="#60a5fa" size={20} />, // blue-400
            data: [
                { label: t('address_line'), value: user.address_line },
                { label: t('state'), value: user.state },
                { label: t('district'), value: user.district },
                { label: t('tehsil'), value: user.tehsil },
                { label: t('city_village'), value: user.village },
                { label: t('pincode'), value: user.pincode },
            ],
            isEditable: true
        },
        {
            id: 'office',
            title: toTitleCase(t('office_details') || "Office Details"),
            icon: <Building2 color="#c084fc" size={20} />, // purple-400
            data: [
                { label: t('department'), value: user.department?.department_name },
                { label: t('designation'), value: user.designation?.designation_name },
                { label: t('role_type'), value: user.role?.role_name },
                { label: t('team_structure'), value: user.team?.team_name },
                { label: t('reporting_manager'), value: user.reporting_manager?.name },
                { label: t('date_of_joining'), value: formatDate(user.created_at) },
            ],
            isEditable: false
        },
        {
            id: 'bank',
            title: toTitleCase(t('bank_details') || "Bank Details"),
            icon: <CreditCard color="#facc15" size={20} />, // yellow-400
            data: [
                { label: t('bank_name'), value: user.bank_details?.bank_name },
                { label: t('account_holder'), value: user.bank_details?.account_holder_name },
                { label: t('account_number'), value: user.bank_details?.account_number },
                { label: t('upi_id'), value: user.bank_details?.upi_id },
            ],
            isEditable: true
        },
        {
            id: 'emergency',
            title: toTitleCase(t('emergency_contact') || "Emergency Contact"),
            icon: <Shield color="#f87171" size={20} />, // red-400
            data: [
                { label: t('person_name'), value: user.emergency_person_name },
                { label: t('relation'), value: user.emergency_relation },
                { label: t('contact_number'), value: user.emergency_contact_number },
            ],
            isEditable: true
        },
        {
            id: 'documents',
            title: toTitleCase(t('documents') || "Documents"),
            icon: <Shield color="#fb923c" size={20} />, // orange-400
            data: [
                { label: t('aadhaar_number'), value: user.aadhaar_number },
                { label: t('pan_number'), value: user.pan_number },
                { label: t('driving_license_number'), value: user.driving_license_number },
            ],
            isEditable: false
        }
    ];

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    const sections = getProfileSections(userData);

    return (
        <View style={styles.container}>
            <HeaderCard />
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

                {/* User Header */}
                <View style={styles.userHeader}>
                    <View style={styles.avatarContainer}>
                        {userData.profile_photo ? (
                            <Image
                                source={{ uri: `${api.defaults.baseURL?.replace('/api', '')}/${userData.profile_photo}` }}
                                style={styles.avatarImage}
                                contentFit="cover"
                                cachePolicy="disk"
                            />
                        ) : (
                            <Text style={styles.avatarText}>
                                {userData.name?.charAt(0).toUpperCase() || '?'}
                            </Text>
                        )}
                        <TouchableOpacity style={styles.avatarEditButton} onPress={handlePickImage}>
                            <Edit size={12} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={styles.userName}>{userData.name || 'User'}</Text>
                        <Text style={styles.userRole}>{userData.designation?.designation_name || userData.role?.role_name || 'Employee'}</Text>
                    </View>
                </View>

                {/* Profile Sections */}
                {sections.map((section, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.headerLeft}>
                                <View style={styles.iconContainer}>
                                    {section.icon}
                                </View>
                                <Text style={styles.cardTitle}>{section.title}</Text>
                            </View>
                            {/* Render Edit Button if editable */}
                            {section.isEditable && (
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => handleEdit(section.id)}
                                >
                                    <Edit size={16} color="#6b7280" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.cardBody}>
                            {section.data.map((item, idx) => (
                                <View key={idx} style={styles.row}>
                                    <Text style={styles.label}>{item.label}</Text>
                                    <Text style={styles.value}>{item.value || '-'}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Language Switcher */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.headerLeft}>
                            <View style={styles.iconContainer}>
                                <Languages color="#6b7280" size={20} />
                            </View>
                            <Text style={styles.cardTitle}>{toTitleCase(t('change_language') || "Change Language")}</Text>
                        </View>
                    </View>
                    <View style={styles.languageContainer}>
                        <TouchableOpacity
                            style={[styles.langButton, i18n.language?.startsWith('en') && styles.activeLangButton]}
                            onPress={() => changeLanguage('en')}>
                            <Text style={[styles.langText, i18n.language?.startsWith('en') && styles.activeLangText]}>{toTitleCase(t('english') || "English")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.langButton, i18n.language?.startsWith('hi') && styles.activeLangButton]}
                            onPress={() => changeLanguage('hi')}>
                            <Text style={[styles.langText, i18n.language?.startsWith('hi') && styles.activeLangText]}>{toTitleCase(t('hindi') || "Hindi")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <LogOut color="#fff" size={20} style={{ marginRight: 8 }} />
                    <Text style={styles.logoutButtonText}>{toTitleCase(t('sign_out') || "Sign Out")}</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={!!editingSection}
                onRequestClose={handleModalClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit {sections.find(s => s.id === editingSection)?.title}</Text>
                            <TouchableOpacity onPress={handleModalClose}>
                                <X size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {editingSection === 'contact' && (
                                <BasicInformation
                                    formData={editFormData}
                                    handleChange={handleModalChange}
                                    readOnlyFields={['name', 'father_name', 'mother_name', 'dob', 'gender', 'marital_status', 'blood_group']} // Make basic info read-only here
                                />
                            )}
                            {editingSection === 'address' && (
                                <AddressDetails
                                    formData={editFormData}
                                    handleChange={handleModalChange}
                                    setFormData={setEditFormData}
                                />
                            )}
                            {editingSection === 'bank' && (
                                <BankDetails
                                    formData={editFormData}
                                    handleChange={handleModalChange}
                                />
                            )}
                            {editingSection === 'emergency' && (
                                <EmergencyContact
                                    formData={editFormData}
                                    handleChange={handleModalChange}
                                />
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleModalClose}>
                                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={saving}>
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>{t('save')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Logout Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={logoutModalVisible}
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.logoutModalContent}>
                        <Text style={styles.logoutTitle}>{toTitleCase(t('sign_out') || "Sign Out")}</Text>
                        <Text style={styles.logoutMessage}>{toTitleCase(t('are_you_sure_want_to_sign_out') || "Are you sure you want to sign out?")}</Text>

                        <View style={styles.logoutButtonContainer}>
                            <TouchableOpacity
                                style={styles.logoutCancelButton}
                                onPress={() => setLogoutModalVisible(false)}
                            >
                                <Text style={styles.logoutCancelText}>{toTitleCase(t('cancel') || "Cancel")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.logoutConfirmButton}
                                onPress={confirmLogout}
                            >
                                <Text style={styles.logoutConfirmText}>{toTitleCase(t('sign_out') || "Sign Out")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#eff6ff', // blue-50
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#bfdbfe', // blue-200
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3b82f6', // blue-500
    },
    avatarImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    avatarEditButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3b82f6',
        borderRadius: 10,
        padding: 4,
        borderWidth: 2,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    userRole: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        justifyContent: 'space-between', // Push Edit button to right
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        padding: 8,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        textTransform: 'capitalize', // Capitalize first letter of each word
    },
    editButton: {
        padding: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
    },
    cardBody: {
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Allow multiline values to align top
    },
    label: {
        fontSize: 13,
        color: '#6b7280',
        flex: 1,
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        color: '#111827',
        flex: 1.5,
        textAlign: 'right',
        fontWeight: '500',
    },
    languageContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    langButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    activeLangButton: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    langText: {
        color: '#374151',
        fontWeight: '500',
    },
    activeLangText: {
        color: '#fff',
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#ef4444',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Modal Styles
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
        height: '90%', // Occupy most of screen
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
    modalBody: {
        flex: 1,
        padding: 2, // Padding handled by child components mostly
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#10b981',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Logout Modal Specific Styles
    logoutModalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        alignSelf: 'center',
        marginBottom: 'auto',
        marginTop: 'auto', // Center vertically
        alignItems: 'center',
    },
    logoutTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    logoutMessage: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    logoutButtonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    logoutCancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    logoutCancelText: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '600',
    },
    logoutConfirmButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#fee2e2', // Light red background
        alignItems: 'center',
    },
    logoutConfirmText: {
        fontSize: 16,
        color: '#ef4444', // Red text as requested
        fontWeight: '700',
    },
});
