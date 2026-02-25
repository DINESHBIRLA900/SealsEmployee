import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use local IP for physical device testing
// Replace this with your computer's local IP address
import Constants from 'expo-constants';

// Live Backend URL
const LIVE_URL = 'https://samridhi-backend-1ay3.onrender.com/api';

// Dynamic IP detection (for local development)
const getBaseUrl = () => {
    // If we are in development and not on a real device, we might want local IP
    // But for APK build, we want the LIVE_URL
    if (__DEV__) {
        const debuggerHost = Constants.expoConfig?.hostUri;
        if (debuggerHost) {
            const ip = debuggerHost.split(':')[0];
            return `http://${ip}:5002/api`;
        }
    }

    return LIVE_URL;
};

const API_URL = getBaseUrl();
const BASE_URL = API_URL.replace('/api', '');
console.log('API Service initialized with URL:', API_URL);

export { API_URL, BASE_URL };

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
