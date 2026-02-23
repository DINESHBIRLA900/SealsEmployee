import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Customer extends Model {
    static table = 'customers'

    @field('name') name!: string
    @field('mobile') mobile?: string
    @field('email') email?: string
    @field('address') address?: string
    @field('city') city?: string
    @field('state') state?: string
    @field('pincode') pincode?: string
    @field('customer_type') customerType?: string
    @field('gst_number') gstNumber?: string

    @readonly @date('created_at') createdAt!: Date
    @readonly @date('updated_at') updatedAt!: Date
}
