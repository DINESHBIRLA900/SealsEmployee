import { synchronize } from '@nozbe/watermelondb/sync'
import database from '../database'
import api from './api' // Your robust API service

export async function sync() {
    await synchronize({
        database,
        pullChanges: async ({ lastPulledAt, schemaVersion, migration }: { lastPulledAt: number | null, schemaVersion: number, migration: any }) => {
            // 1. Request changes from backend
            // API call to /sync
            // We send lastPulledAt timestamp
            // Backend returns { changes, timestamp }

            const response = await api.post('/sync', {
                lastPulledAt,
                schemaVersion,
                migration
            });

            if (!response.data) {
                throw new Error('Sync failed: No data received');
            }

            const { changes, timestamp } = response.data;

            return { changes, timestamp };
        },
        pushChanges: async ({ changes, lastPulledAt }: { changes: any, lastPulledAt: number }) => {
            // 2. Send local changes to backend
            // API call to /sync with local changes

            await api.post('/sync', {
                lastPulledAt,
                changes
            });
        },
        migrationsEnabledAtVersion: 1,
    })
}
