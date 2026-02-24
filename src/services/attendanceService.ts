import api from './api';

export interface CheckInData {
    user_id?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    status?: string;
    remarks?: string;
}

export const checkIn = async (data: CheckInData) => {
    try {
        const response = await api.post('/attendance/check-in', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const checkOut = async (data: CheckInData) => {
    try {
        const response = await api.post('/attendance/check-out', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUserAttendance = async (userId: string) => {
    try {
        const response = await api.get(`/attendance/user/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
