export function parseAttendanceDate(value: string | null | undefined): Date | null {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(0);
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function serializeAttendanceDate(value: Date | null): string | null {
    if (!value || Number.isNaN(value.getTime())) return null;
    return [String(value.getFullYear()).padStart(4, '0'), String(value.getMonth() + 1).padStart(2, '0'), String(value.getDate()).padStart(2, '0')].join('-');
}

export function attendanceDeliveryDeadline(value: string | null | undefined, now = new Date()): { severity: 'danger' | 'warn' | 'info' | 'secondary'; label: string } {
    const delivery = parseAttendanceDate(value);
    if (!delivery) return { severity: 'secondary', label: 'Não informada' };
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const number = (type: string) => Number(parts.find((part) => part.type === type)!.value);
    const days = Math.round((Date.UTC(delivery.getFullYear(), delivery.getMonth(), delivery.getDate()) - Date.UTC(number('year'), number('month') - 1, number('day'))) / 86400000);
    if (days < 0) return { severity: 'danger', label: `Atrasada há ${-days} ${days === -1 ? 'dia' : 'dias'}` };
    if (days === 0) return { severity: 'warn', label: 'Entrega hoje' };
    return { severity: 'info', label: days === 1 ? 'Entrega amanhã' : `Faltam ${days} dias` };
}
