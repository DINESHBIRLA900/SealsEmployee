import { Linking, Platform } from 'react-native';

export const openDialer = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
};

export const openWhatsApp = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`whatsapp://send?phone=${phone}`);
};

export const openEmail = (email: string) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`);
};

export const openMaps = (address: string) => {
    if (!address) return;
    const query = encodeURIComponent(address);
    const url = Platform.select({
        ios: `maps:0,0?q=${query}`,
        android: `geo:0,0?q=${query}`,
    }) || `https://www.google.com/maps/search/?api=1&query=${query}`;

    Linking.openURL(url);
};

export const openBrowser = (url: string) => {
    if (!url) return;
    Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
};
