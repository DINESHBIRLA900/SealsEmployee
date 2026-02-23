import { StyleSheet, View, Text } from 'react-native';
import HeaderCard from '../../components/HeaderCard';

export default function OrderScreen() {
    return (
        <View style={styles.container}>
            <HeaderCard />
            <View style={styles.content}>
                <Text style={styles.title}>Orders</Text>
                <Text style={styles.text}>Order list goes here.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1f2937',
    },
    text: {
        fontSize: 16,
        color: '#4b5563',
    },
});
