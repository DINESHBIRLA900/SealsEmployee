import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class WorkApproval extends Model {
    static table = 'work_approvals'


    @field('user_id') user_id!: string
    @field('date') date!: string
    @field('reason') reason!: string
    @field('description') details!: string
    @field('status') status!: string

    @readonly @date('created_at') createdAt!: Date
    @readonly @date('updated_at') updatedAt!: Date
}
