import api from './api';

export interface LeaveRequestData {
    user_id?: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
}

export const applyLeave = async (data: LeaveRequestData) => {
    try {
        const response = await api.post('/attendance/leave/apply', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUserLeaves = async (userId: string) => {
    try {
        const response = await api.get(`/attendance/leave/user/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
