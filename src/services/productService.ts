import api from './api';
import { ProductCategory, Product } from '../types/product';

export const productService = {
    getCategories: async (): Promise<ProductCategory[]> => {
        try {
            const response = await api.get('/products/category');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },
    getProducts: async (): Promise<Product[]> => {
        try {
            const response = await api.get('/products/product-list');
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }
};
