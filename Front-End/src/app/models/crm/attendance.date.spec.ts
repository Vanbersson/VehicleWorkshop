import { parseAttendanceDate, serializeAttendanceDate, attendanceDeliveryDeadline } from './attendance.date';

describe('Attendance delivery date', () => {
    it('loads an API date as a local calendar date', () => {
        const date = parseAttendanceDate('2026-11-05')!;
        expect(date.getFullYear()).toBe(2026);
        expect(date.getMonth()).toBe(10);
        expect(date.getDate()).toBe(5);
    });
    it('saves the selected calendar date without time or timezone', () => {
        expect(serializeAttendanceDate(new Date(2026, 10, 5, 23, 30))).toBe('2026-11-05');
        expect(serializeAttendanceDate(parseAttendanceDate('2028-02-29'))).toBe('2028-02-29');
    });
    it('clears an optional date and rejects invalid dates', () => {
        expect(parseAttendanceDate(null)).toBeNull();
        expect(parseAttendanceDate('2026-02-30')).toBeNull();
        expect(serializeAttendanceDate(null)).toBeNull();
        expect(serializeAttendanceDate(new Date('invalid'))).toBeNull();
    });
});

describe('Attendance delivery deadline', () => {
    const now = new Date('2026-11-05T15:00:00Z');
    it('highlights overdue, today and future dates', () => {
        expect(attendanceDeliveryDeadline('2026-11-03', now)).toEqual({ severity: 'danger', label: 'Atrasada há 2 dias' });
        expect(attendanceDeliveryDeadline('2026-11-05', now)).toEqual({ severity: 'warn', label: 'Entrega hoje' });
        expect(attendanceDeliveryDeadline('2026-11-06', now)).toEqual({ severity: 'info', label: 'Entrega amanhã' });
        expect(attendanceDeliveryDeadline('2026-11-10', now).label).toBe('Faltam 5 dias');
    });
    it('uses the calendar day in Sao Paulo rather than the UTC date', () => {
        expect(attendanceDeliveryDeadline('2026-11-05', new Date('2026-11-06T01:00:00Z')).severity).toBe('warn');
    });
    it('handles missing dates and month boundaries', () => {
        expect(attendanceDeliveryDeadline(null, now).severity).toBe('secondary');
        expect(attendanceDeliveryDeadline('2027-01-01', new Date('2026-12-31T15:00:00Z')).label).toBe('Entrega amanhã');
    });
});
