import api from './api';

export const createSupplier = async (supplierData: any) => {
    try {
        const response = await api.post('/suppliers', supplierData);
        return response.data;
    } catch (error) {
        console.error("Error creating supplier:", error);
        throw error;
    }
};
