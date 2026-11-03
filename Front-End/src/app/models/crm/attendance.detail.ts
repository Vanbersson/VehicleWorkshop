import { CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { Visit } from '@/app/models/crm/visit/visit';

export interface AttendanceDetail {
    attendance: CustomerAttendance;
    visit: Visit | null;
}
