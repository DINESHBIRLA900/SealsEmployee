import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface DetailRowProps {
    label: string;
    value?: string | null;
    icon?: React.ReactNode;
    onPress?: () => void;
    isLink?: boolean;
    isStatus?: boolean;
    last?: boolean;
}

export const DetailRow = ({ label, value, icon, onPress, isLink, isStatus, last }: DetailRowProps) => {
    const Component = onPress ? TouchableOpacity : View;

    return (
        <Component
            style={[styles.container, !last && styles.borderBottom]}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.7}
        >
            {icon && (
                <View style={[styles.iconBox, isLink && styles.iconBoxLink]}>
                    {icon}
                </View>
            )}
            <View style={styles.content}>
                <Text style={styles.label}>{label}</Text>
                <Text
                    style={[
                        styles.value,
                        isLink && styles.linkText,
                        isStatus && (value === 'Active' ? styles.statusActive : styles.statusInactive)
                    ]}
                >
                    {value || '-'}
                </Text>
            </View>
        </Component>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBoxLink: {
        backgroundColor: '#eff6ff',
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 15,
        color: '#1f2937',
        fontWeight: '500',
    },
    linkText: {
        color: '#3b82f6',
        textDecorationLine: 'underline',
    },
    statusActive: {
        color: '#059669',
        fontWeight: '600',
    },
    statusInactive: {
        color: '#dc2626',
        fontWeight: '600',
    },
});
