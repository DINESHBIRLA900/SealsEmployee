import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Package, ShoppingCart } from 'lucide-react-native';
import { Image } from 'expo-image';
import { productService } from '../src/services/productService';
import { Product } from '../src/types/product';
import { BASE_URL } from '../src/services/api';

export const ProductGrid = () => {
    const { width } = useWindowDimensions();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const ITEM_WIDTH = (width - 48) / 2; // 16px padding on each side, 16px gap between items

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data.filter(p => p.status === 'Active').slice(0, 10)); // Limit to first 10 for home page
        } catch (error) {
            console.error('Failed to load products', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath?: string): string | undefined => {
        if (!imagePath) return undefined;
        if (imagePath.startsWith('http')) return imagePath;
        return `${BASE_URL}/${imagePath}`;
    };

    const renderItem = ({ item }: { item: Product }) => {
        const firstVariant = item.variants?.[0];
        const mrp = firstVariant?.gst_bill?.mrp;
        const imageUrl = item.product_images?.[0]?.url;

        return (
            <TouchableOpacity
                style={[styles.productCard, { width: ITEM_WIDTH }]}
                activeOpacity={0.7}
            >
                <View style={styles.imageContainer}>
                    {imageUrl ? (
                        <Image
                            source={{ uri: getImageUrl(imageUrl) }}
                            style={styles.productImage}
                            contentFit="contain"
                            transition={300}
                        />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Package size={40} color="#cbd5e1" />
                        </View>
                    )}
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.categoryName} numberOfLines={1}>
                        {item.category?.name || 'Category'}
                    </Text>
                    <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{mrp || 0}</Text>
                        <TouchableOpacity style={styles.addButton}>
                            <ShoppingCart size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="small" color="#10b981" />
            </View>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Featured Products</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                numColumns={2}
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
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    seeAllText: {
        fontSize: 14,
        color: '#10b981',
        fontWeight: '600',
    },
    gridContainer: {
        paddingBottom: 16,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    productImage: {
        width: '80%',
        height: '80%',
    },
    placeholderContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContainer: {
        padding: 12,
    },
    categoryName: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        lineHeight: 18,
        height: 36,
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#10b981',
    },
    addButton: {
        backgroundColor: '#10b981',
        padding: 6,
        borderRadius: 8,
    },
    centerContainer: {
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

