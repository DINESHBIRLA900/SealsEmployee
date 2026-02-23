import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class User extends Model {
    static table = 'users'

    @field('name') name!: string
    @field('email') email?: string
    @field('phone') phone?: string
    @field('role') role?: string
    @field('department') department?: string
    @field('designation') designation?: string
    @field('mpin') mpin?: string
    @field('is_mpin_set') isMpinSet!: boolean

    @field('father_name') fatherName?: string
    @field('dob') dob?: string
    @field('gender') gender?: string
    @field('whatsapp_number') whatsappNumber?: string
    @field('alternate_mobile_number') alternateMobileNumber?: string
    @field('address_line') addressLine?: string
    @field('state') state?: string
    @field('district') district?: string
    @field('tehsil') tehsil?: string
    @field('village') village?: string
    @field('pincode') pincode?: string
    @field('bank_name') bankName?: string
    @field('account_holder_name') accountHolderName?: string
    @field('account_number') accountNumber?: string
    @field('upi_id') upiId?: string
    @field('emergency_person_name') emergencyPersonName?: string
    @field('emergency_relation') emergencyRelation?: string
    @field('emergency_contact_number') emergencyContactNumber?: string
    @field('aadhaar_number') aadhaarNumber?: string
    @field('pan_number') panNumber?: string
    @field('driving_license_number') drivingLicenseNumber?: string
    @field('profile_photo') profilePhoto?: string

    @readonly @date('created_at') createdAt!: Date
    @readonly @date('updated_at') updatedAt!: Date
}
