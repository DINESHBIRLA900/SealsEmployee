import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
    version: 5,
    tables: [
        tableSchema({
            name: 'users',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'email', type: 'string', isOptional: true },
                { name: 'phone', type: 'string', isOptional: true },
                { name: 'role', type: 'string', isOptional: true },
                { name: 'department', type: 'string', isOptional: true },
                { name: 'designation', type: 'string', isOptional: true },
                { name: 'mpin', type: 'string', isOptional: true },
                { name: 'is_mpin_set', type: 'boolean' },

                // Basic Info
                { name: 'father_name', type: 'string', isOptional: true },
                { name: 'dob', type: 'string', isOptional: true },
                { name: 'gender', type: 'string', isOptional: true },

                // Contact
                { name: 'whatsapp_number', type: 'string', isOptional: true },
                { name: 'alternate_mobile_number', type: 'string', isOptional: true },

                // Address
                { name: 'address_line', type: 'string', isOptional: true },
                { name: 'state', type: 'string', isOptional: true },
                { name: 'district', type: 'string', isOptional: true },
                { name: 'tehsil', type: 'string', isOptional: true },
                { name: 'village', type: 'string', isOptional: true },
                { name: 'pincode', type: 'string', isOptional: true },

                // Bank Details
                { name: 'bank_name', type: 'string', isOptional: true },
                { name: 'account_holder_name', type: 'string', isOptional: true },
                { name: 'account_number', type: 'string', isOptional: true },
                { name: 'upi_id', type: 'string', isOptional: true },

                // Emergency Contact
                { name: 'emergency_person_name', type: 'string', isOptional: true },
                { name: 'emergency_relation', type: 'string', isOptional: true },
                { name: 'emergency_contact_number', type: 'string', isOptional: true },

                // Documents
                { name: 'aadhaar_number', type: 'string', isOptional: true },
                { name: 'pan_number', type: 'string', isOptional: true },
                { name: 'driving_license_number', type: 'string', isOptional: true },
                { name: 'profile_photo', type: 'string', isOptional: true },

                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'customers_b2b',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'company_name', type: 'string', isOptional: true },
                { name: 'gstin', type: 'string', isOptional: true },
                { name: 'website', type: 'string', isOptional: true },
                { name: 'email', type: 'string', isOptional: true },
                { name: 'phone', type: 'string', isOptional: true },
                { name: 'branch_type', type: 'string', isOptional: true },

                // Address
                { name: 'address_line', type: 'string', isOptional: true },
                { name: 'pincode', type: 'string', isOptional: true },
                { name: 'state', type: 'string', isOptional: true },
                { name: 'district', type: 'string', isOptional: true },
                { name: 'tehsil', type: 'string', isOptional: true },
                { name: 'village', type: 'string', isOptional: true },
                { name: 'registered_by', type: 'string', isOptional: true },
                { name: 'team', type: 'string', isOptional: true },

                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'customers_b2c',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'father_name', type: 'string', isOptional: true },
                { name: 'dob', type: 'string', isOptional: true }, // stored as string or number usually in WMDB? date type maps to number
                { name: 'gender', type: 'string', isOptional: true },

                // Contact
                { name: 'email', type: 'string', isOptional: true },
                { name: 'phone', type: 'string', isOptional: true },
                { name: 'whatsapp_number', type: 'string', isOptional: true },
                { name: 'alternate_mobile_number', type: 'string', isOptional: true },

                // Address
                { name: 'address_line', type: 'string', isOptional: true },
                { name: 'pincode', type: 'string', isOptional: true },
                { name: 'state', type: 'string', isOptional: true },
                { name: 'district', type: 'string', isOptional: true },
                { name: 'tehsil', type: 'string', isOptional: true },
                { name: 'village', type: 'string', isOptional: true },
                { name: 'city', type: 'string', isOptional: true },
                { name: 'registered_by', type: 'string', isOptional: true },
                { name: 'team', type: 'string', isOptional: true },

                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'work_approvals',
            columns: [
                { name: 'user_id', type: 'string', isOptional: true },
                { name: 'date', type: 'string' },
                { name: 'reason', type: 'string' },
                { name: 'description', type: 'string' },
                { name: 'status', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
    ],
})
