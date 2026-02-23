import api from './api';

export const createVendor = async (vendorData: any) => {
    try {
        const response = await api.post('/vendors', vendorData);
        return response.data;
    } catch (error) {
        console.error("Error creating vendor:", error);
        throw error;
    }
};
