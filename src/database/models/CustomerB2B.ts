import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class CustomerB2B extends Model {
    static table = 'customers_b2b'

    @field('name') name!: string
    @field('company_name') companyName?: string
    @field('gstin') gstin?: string
    @field('website') website?: string
    @field('email') email?: string
    @field('phone') phone?: string
    @field('branch_type') branchType?: string

    // Address
    @field('address_line') addressLine?: string
    @field('pincode') pincode?: string
    @field('state') state?: string
    @field('district') district?: string
    @field('tehsil') tehsil?: string
    @field('village') village?: string

    @readonly @date('created_at') createdAt!: Date
    @readonly @date('updated_at') updatedAt!: Date
}
