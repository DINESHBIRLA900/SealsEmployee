import database from '../database';
import { Q } from '@nozbe/watermelondb';
import * as SecureStore from 'expo-secure-store';

export const createCustomer = async (data: any) => {
    try {
        // Get logged-in user info for registered_by
        let userId = '';
        let userTeam = '';
        try {
            const userStr = await SecureStore.getItemAsync('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                userId = user._id || '';
                userTeam = user.team || '';
            }
        } catch (e) { }

        const type = data.customer_type === 'B2B' ? 'customers_b2b' : 'customers_b2c';
        const collection = database.get(type);

        await database.write(async () => {
            await collection.create((customer: any) => {
                customer.name = data.name;
                customer.email = data.email;
                customer.phone = data.phone;
                customer.addressLine = data.address_line || data.address;
                customer.pincode = data.pincode;
                customer.state = data.state;
                customer.district = data.district;
                customer.tehsil = data.tehsil;
                customer.village = data.village;
                customer.registeredBy = userId;
                customer.team = userTeam;

                if (type === 'customers_b2b') {
                    customer.companyName = data.company_name;
                    customer.gstin = data.gstin;
                    customer.website = data.website;
                    customer.branchType = data.branch_type;
                } else {
                    customer.fatherName = data.father_name;
                    customer.dob = data.dob;
                    customer.gender = data.gender;
                    customer.whatsappNumber = data.whatsapp_number;
                    customer.alternateMobileNumber = data.alternate_mobile_number;
                    customer.city = data.city;
                }
            });
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating customer locally:", error);
        throw error;
    }
};

export const getCustomers = async (type?: string) => {
    try {
        let customers: any[] = [];

        if (type === 'B2B') {
            const b2b = await database.get('customers_b2b').query(Q.sortBy('created_at', Q.desc)).fetch();
            customers = b2b.map((c: any) => ({ ...c._raw, customer_type: 'B2B' }));
        } else if (type === 'B2C') {
            const b2c = await database.get('customers_b2c').query(Q.sortBy('created_at', Q.desc)).fetch();
            customers = b2c.map((c: any) => ({ ...c._raw, customer_type: 'B2C' }));
        } else {
            const [b2b, b2c] = await Promise.all([
                database.get('customers_b2b').query(Q.sortBy('created_at', Q.desc)).fetch(),
                database.get('customers_b2c').query(Q.sortBy('created_at', Q.desc)).fetch()
            ]);

            const b2bMapped = b2b.map((c: any) => ({ ...c._raw, customer_type: 'B2B' }));
            const b2cMapped = b2c.map((c: any) => ({ ...c._raw, customer_type: 'B2C' }));
            customers = [...b2bMapped, ...b2cMapped].sort((a, b) => b.created_at - a.created_at);
        }

        return customers;
    } catch (error) {
        console.error("Error fetching customers locally:", error);
        throw error;
    }
};

export const deleteCustomer = async (id: string, type: string) => {
    try {
        // We need type to know which table to delete from. 
        // If type is missing, try both? (Safety fallback)
        const table = type === 'B2B' ? 'customers_b2b' : 'customers_b2c';
        const collection = database.get(table);

        await database.write(async () => {
            const customer = await collection.find(id);
            await customer.markAsDeleted();
        });
    } catch (error) {
        console.error("Error deleting customer locally:", error);
        throw error;
    }
};

export const getCustomerById = async (id: string, type: string) => {
    try {
        const table = type === 'B2B' ? 'customers_b2b' : 'customers_b2c';
        const collection = database.get(table);
        const customer = await collection.find(id);
        return { ...customer._raw, customer_type: type }; // Return raw data + type
    } catch (error) {
        console.error("Error fetching customer by ID:", error);
        return null;
    }
};
