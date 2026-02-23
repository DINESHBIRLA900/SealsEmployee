import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import database from '../../src/database';
import { Q } from '@nozbe/watermelondb';

export default function OfflineTestScreen() {
    const [users, setUsers] = useState<any[]>([]);
    const [status, setStatus] = useState('Initializing...');

    const fetchUsers = async () => {
        try {
            const usersCollection = database.get('users');
            const allUsers = await usersCollection.query().fetch();
            setUsers(allUsers);
            setStatus('Fetched ' + allUsers.length + ' users');
        } catch (error: any) {
            setStatus('Error fetching: ' + error.message);
            console.error(error);
        }
    };

    const addUser = async () => {
        try {
            await database.write(async () => {
                await database.get('users').create((user: any) => {
                    user.name = 'Test User ' + Math.floor(Math.random() * 1000);
                    user.email = 'test@example.com';
                    user.isMpinSet = false;
                    user.role = 'USER';
                });
            });
            setStatus('User added!');
            fetchUsers();
        } catch (error: any) {
            setStatus('Error adding: ' + error.message);
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Offline DB Test</Text>
            <Text style={styles.status}>Status: {status}</Text>

            <Button title="Add Random User" onPress={addUser} />
            <View style={styles.spacer} />
            <Button title="Refresh List" onPress={fetchUsers} />

            <View style={styles.list}>
                {users.map((u, i) => (
                    <Text key={i} style={styles.item}>{u.name} ({u._raw.id})</Text>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    status: {
        marginBottom: 20,
        color: 'blue',
    },
    spacer: {
        height: 10,
    },
    list: {
        marginTop: 20,
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    }
});
