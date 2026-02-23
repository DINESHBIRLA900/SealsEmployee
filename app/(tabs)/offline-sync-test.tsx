import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import database from '../../src/database';
import { sync } from '../../src/services/sync';

export default function OfflineSyncTestScreen() {
    const [status, setStatus] = useState('Ready to sync');
    const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

    const handleSync = async () => {
        setStatus('Syncing...');
        try {
            await sync();
            setStatus('Sync Completed Successfully!');
            setLastSyncTime(new Date().toLocaleTimeString());
        } catch (error: any) {
            setStatus('Sync Failed: ' + error.message);
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Offline Sync Test</Text>
            <Text style={styles.status}>Status: {status}</Text>
            {lastSyncTime && <Text style={styles.info}>Last Sync: {lastSyncTime}</Text>}

            <View style={styles.spacer} />
            <Button title="Start Sync" onPress={handleSync} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 50,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    status: {
        fontSize: 18,
        marginBottom: 10,
        color: 'blue',
        textAlign: 'center',
    },
    info: {
        marginBottom: 20,
        color: 'gray',
    },
    spacer: {
        height: 20,
    }
});
