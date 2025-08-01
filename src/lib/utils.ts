import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, format } from 'date-fns';
import { id } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const formatRelativeTime = (date: Date): string => {
    const now = new Date();

    const seconds = differenceInSeconds(now, date);
    if (seconds < 60) return 'Baru saja';

    const minutes = differenceInMinutes(now, date);
    if (minutes < 60) return `${minutes} menit yang lalu`;

    const hours = differenceInHours(now, date);
    if (hours < 24) return `${hours} jam yang lalu`;

    const days = differenceInDays(now, date);
    if (days === 1) return 'Kemarin';
    if (days <= 7) return `${days} hari yang lalu`;
    if (days <= 30) return `${days} hari yang lalu (${format(date, 'dd MMMM', { locale: id })})`;

    return format(date, 'dd MMMM yyyy', { locale: id });
};

export function formatRupiah(number: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
}

export function formatDate(date: Date): string {
    return format(date, 'dd MMMM yyyy', { locale: id });
}

export default formatRelativeTime;
