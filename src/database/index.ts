import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'

import schema from './schema'
import migrations from './db_migrations'
import User from './models/User'
import CustomerB2B from './models/CustomerB2B'
import CustomerB2C from './models/CustomerB2C'
import WorkApproval from './models/WorkApproval'

const adapter = new LokiJSAdapter({
    schema,
    // (You might want to comment out migrations if you haven't created them yet)
    migrations,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    // dbName: 'myapp', // optional db name
    // onQuotaExceededError: (error) => {
    //   // Browser ran out of disk space
    // }
})

export const database = new Database({
    adapter,
    modelClasses: [User, CustomerB2B, CustomerB2C, WorkApproval],
})

export default database
