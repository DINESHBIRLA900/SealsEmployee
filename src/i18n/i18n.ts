import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translationEn from './en.json';
import translationHi from './hi.json';

const resources = {
    en: {
        translation: translationEn,
    },
    hi: {
        translation: translationHi,
    },
};

// Initialize i18n synchronously with default language
i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v4', // Required for Android compatibility with newer i18next
        resources,
        lng: 'en', // Default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

// Load saved language asynchronously
const loadLanguage = async () => {
    try {
        const savedLanguage = await AsyncStorage.getItem('language');
        if (savedLanguage) {
            await i18n.changeLanguage(savedLanguage);
        } else {
            const locales = Localization.getLocales();
            const deviceLang = locales && locales.length > 0 ? locales[0].languageTag.split('-')[0] : 'en';
            if (deviceLang === 'hi') {
                await i18n.changeLanguage('hi');
            }
        }
    } catch (error) {
        console.error('Failed to load language', error);
    }
};

loadLanguage();

export default i18n;
