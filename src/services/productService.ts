import api from './api';
import { ProductCategory } from '../types/product';

export const productService = {
    getCategories: async (): Promise<ProductCategory[]> => {
        try {
            const response = await api.get('/products/category');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }
};
