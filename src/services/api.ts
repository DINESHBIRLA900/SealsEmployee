import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use local IP for physical device testing
// Replace this with your computer's local IP address
import Constants from 'expo-constants';

// Dynamic IP detection
const getBaseUrl = () => {
    // Try to get IP from Expo Go host
    const debuggerHost = Constants.expoConfig?.hostUri;

    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:5001/api`;
    }

    // Fallback for simulators/web or if detection fails
    // You can update this fallback if your IP changes and you are not using Expo Go with host forwarding
    return 'http://10.22.199.241:5001/api';
};

const API_URL = getBaseUrl();
console.log('API Service initialized with URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`Requesting: ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await SecureStore.deleteItemAsync('token');
            // You might want to navigate to login here or handle logout globally
        }
        return Promise.reject(error);
    }
);

export default api;
