import api from './api';

export interface AdvertisementCard {
    _id: string;
    title: string;
    image: string;
    imagePublicId?: string;
    status: 'Active' | 'Inactive';
    cardPointId: {
        _id: string;
        pointNumber: number;
        pointName: string;
    };
    fromDate: string;
    toDate: string;
}

export const advertisementService = {
    getHomeCards: async (): Promise<AdvertisementCard[]> => {
        try {
            const response = await api.get('/advertisement/cards');
            if (response.data.success) {
                // Filter for 'home' pointName and 'Active' status
                return response.data.data.filter((card: any) =>
                    card.cardPointId?.pointName === 'home' && card.status === 'Active'
                );
            }
            return [];
        } catch (error) {
            console.error('Error fetching home cards:', error);
            throw error;
        }
    },
    getMiddleCards: async (): Promise<AdvertisementCard[]> => {
        try {
            const response = await api.get('/advertisement/cards');
            if (response.data.success) {
                // Filter for 'home 2' pointName and 'Active' status
                return response.data.data.filter((card: any) =>
                    card.cardPointId?.pointName === 'home 2' && card.status === 'Active'
                );
            }
            return [];
        } catch (error) {
            console.error('Error fetching middle cards:', error);
            throw error;
        }
    }
};
