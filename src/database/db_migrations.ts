import { schemaMigrations, addColumns, createTable } from '@nozbe/watermelondb/Schema/migrations'

export default schemaMigrations({
    migrations: [
        {
            toVersion: 2,
            steps: [
                addColumns({
                    table: 'users',
                    columns: [
                        { name: 'father_name', type: 'string', isOptional: true },
                        { name: 'dob', type: 'string', isOptional: true },
                        { name: 'gender', type: 'string', isOptional: true },
                        { name: 'whatsapp_number', type: 'string', isOptional: true },
                        { name: 'alternate_mobile_number', type: 'string', isOptional: true },
                        { name: 'address_line', type: 'string', isOptional: true },
                        { name: 'state', type: 'string', isOptional: true },
                        { name: 'district', type: 'string', isOptional: true },
                        { name: 'tehsil', type: 'string', isOptional: true },
                        { name: 'village', type: 'string', isOptional: true },
                        { name: 'pincode', type: 'string', isOptional: true },
                        { name: 'bank_name', type: 'string', isOptional: true },
                        { name: 'account_holder_name', type: 'string', isOptional: true },
                        { name: 'account_number', type: 'string', isOptional: true },
                        { name: 'upi_id', type: 'string', isOptional: true },
                        { name: 'emergency_person_name', type: 'string', isOptional: true },
                        { name: 'emergency_relation', type: 'string', isOptional: true },
                        { name: 'emergency_contact_number', type: 'string', isOptional: true },
                        { name: 'aadhaar_number', type: 'string', isOptional: true },
                        { name: 'pan_number', type: 'string', isOptional: true },
                        { name: 'driving_license_number', type: 'string', isOptional: true },
                    ],
                }),
            ],
        },
        {
            toVersion: 3,
            steps: [
                addColumns({
                    table: 'users',
                    columns: [
                        { name: 'profile_photo', type: 'string', isOptional: true },
                    ],
                }),
            ],
        },
        {
            toVersion: 4,
            steps: [
                createTable({
                    name: 'customers_b2b',
                    columns: [
                        { name: 'name', type: 'string' },
                        { name: 'company_name', type: 'string', isOptional: true },
                        { name: 'gstin', type: 'string', isOptional: true },
                        { name: 'website', type: 'string', isOptional: true },
                        { name: 'email', type: 'string', isOptional: true },
                        { name: 'phone', type: 'string', isOptional: true },
                        { name: 'branch_type', type: 'string', isOptional: true },
                        { name: 'address_line', type: 'string', isOptional: true },
                        { name: 'pincode', type: 'string', isOptional: true },
                        { name: 'state', type: 'string', isOptional: true },
                        { name: 'district', type: 'string', isOptional: true },
                        { name: 'tehsil', type: 'string', isOptional: true },
                        { name: 'village', type: 'string', isOptional: true },
                        { name: 'created_at', type: 'number' },
                        { name: 'updated_at', type: 'number' },
                    ],
                }),
                createTable({
                    name: 'customers_b2c',
                    columns: [
                        { name: 'name', type: 'string' },
                        { name: 'father_name', type: 'string', isOptional: true },
                        { name: 'dob', type: 'string', isOptional: true },
                        { name: 'gender', type: 'string', isOptional: true },
                        { name: 'email', type: 'string', isOptional: true },
                        { name: 'phone', type: 'string', isOptional: true },
                        { name: 'whatsapp_number', type: 'string', isOptional: true },
                        { name: 'alternate_mobile_number', type: 'string', isOptional: true },
                        { name: 'address_line', type: 'string', isOptional: true },
                        { name: 'pincode', type: 'string', isOptional: true },
                        { name: 'state', type: 'string', isOptional: true },
                        { name: 'district', type: 'string', isOptional: true },
                        { name: 'tehsil', type: 'string', isOptional: true },
                        { name: 'village', type: 'string', isOptional: true },
                        { name: 'city', type: 'string', isOptional: true },
                        { name: 'created_at', type: 'number' },
                        { name: 'updated_at', type: 'number' },
                    ],
                }),
            ],
        },
        {
            toVersion: 5,
            steps: [
                addColumns({
                    table: 'customers_b2b',
                    columns: [
                        { name: 'registered_by', type: 'string', isOptional: true },
                        { name: 'team', type: 'string', isOptional: true },
                    ],
                }),
                addColumns({
                    table: 'customers_b2c',
                    columns: [
                        { name: 'registered_by', type: 'string', isOptional: true },
                        { name: 'team', type: 'string', isOptional: true },
                    ],
                }),
            ],
        },
    ],
})
