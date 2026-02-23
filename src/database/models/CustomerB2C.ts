import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class CustomerB2C extends Model {
    static table = 'customers_b2c'

    @field('name') name!: string
    @field('father_name') fatherName?: string
    @field('dob') dob?: string // WatermelonDB date decorator expects number/date, but if schema has string, we use string? Schema said string/optional.
    @field('gender') gender?: string

    // Contact
    @field('email') email?: string
    @field('phone') phone?: string
    @field('whatsapp_number') whatsappNumber?: string
    @field('alternate_mobile_number') alternateMobileNumber?: string

    // Address
    @field('address_line') addressLine?: string
    @field('pincode') pincode?: string
    @field('state') state?: string
    @field('district') district?: string
    @field('tehsil') tehsil?: string
    @field('village') village?: string
    @field('city') city?: string

    @readonly @date('created_at') createdAt!: Date
    @readonly @date('updated_at') updatedAt!: Date
}
