import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, useWindowDimensions } from 'react-native';
import { LayoutGrid, ChevronRight } from 'lucide-react-native';
import { Image } from 'expo-image';
import { productService } from '../src/services/productService';
import { ProductCategory } from '../src/types/product';
import { BASE_URL } from '../src/services/api';

const CategoryGrid = () => {
    const { width } = useWindowDimensions();
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);

    const CARD_WIDTH = (width - 64) / 4; // 16px padding on each side, gap of 8px (3 gaps of 8px = 24px + 32px padding = 56px, simplified)

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await productService.getCategories();
            // Only show active categories and maybe limit to some number if needed
            setCategories(data.filter(c => c.status === 'Active'));
        } catch (error) {
            console.error('Failed to load categories', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath?: string): string | undefined => {
        if (!imagePath) return undefined;
        if (imagePath.startsWith('http')) return imagePath;
        return `${BASE_URL}/${imagePath}`;
    };

    const renderItem = ({ item }: { item: ProductCategory }) => (
        <TouchableOpacity
            style={[styles.categoryItem, { width: CARD_WIDTH }]}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                {item.image ? (
                    <Image
                        source={{ uri: getImageUrl(item.image) }}
                        style={styles.categoryImage}
                        contentFit="contain"
                        transition={300}
                    />
                ) : (
                    <View style={styles.placeholderContainer}>
                        <LayoutGrid size={24} color="#10b981" />
                    </View>
                )}
            </View>
            <Text style={styles.categoryName} numberOfLines={2}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="small" color="#10b981" />
            </View>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <LayoutGrid size={20} color="#1f2937" />
                    <Text style={styles.headerTitle}>Product Categories</Text>
                </View>
                <TouchableOpacity style={styles.seeAllButton}>
                    <Text style={styles.seeAllText}>See All</Text>
                    <ChevronRight size={16} color="#10b981" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={categories}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                numColumns={4}
                scrollEnabled={false}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.gridContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginVertical: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    seeAllText: {
        fontSize: 14,
        color: '#10b981',
        fontWeight: '600',
    },
    gridContainer: {
        paddingBottom: 8,
    },
    columnWrapper: {
        justifyContent: 'flex-start',
        gap: 8,
        marginBottom: 16,
    },
    categoryItem: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    imageContainer: {
        width: '65%',
        aspectRatio: 1,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        marginBottom: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    categoryImage: {
        width: '70%',
        height: '70%',
    },
    placeholderContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0fdf4',
    },
    categoryName: {
        fontSize: 10,
        fontWeight: '600',
        color: '#475569',
        textAlign: 'center',
        lineHeight: 12,
        marginTop: 2,
        paddingHorizontal: 2,
    },
    centerContainer: {
        height: 150,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default CategoryGrid;
