declare module '@nozbe/watermelondb' {
    export class Database {
        constructor(options: any);
        get(tableName: string): any;
        write(action: () => Promise<void>): Promise<void>;
    }
    export class Model {
        static table: string;
        description: string;
        _raw: any;
    }
    export const appSchema: any;
    export const tableSchema: any;
    export const Q: any;
}

declare module '@nozbe/watermelondb/decorators' {
    export const field: any;
    export const date: any;
    export const readonly: any;
    export const text: any;
    export const children: any;
    export const relation: any;
}

declare module '@nozbe/watermelondb/Schema/migrations' {
    export const schemaMigrations: any;
    export const addColumns: any;
    export const createTable: any;
}

declare module '@nozbe/watermelondb/adapters/sqlite' {
    const SQLiteAdapter: any;
    export default SQLiteAdapter;
}

declare module '@nozbe/watermelondb/sync' {
    export function synchronize(options: any): Promise<void>;
}
