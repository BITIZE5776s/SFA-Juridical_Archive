import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert Arabic numerals to Western numerals
const arabicToEnglish: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
};

export function convertArabicToEnglish(numStr: string): string {
  return numStr.replace(/[٠-٩]/g, (digit) => arabicToEnglish[digit] || digit);
}

// Format date with Western numerals
export function formatDateWithWesternNumerals(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formatted = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  });
  return formatted;
}

// Format date for Arabic display but with Western numerals
export function formatDateArabic(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formatted = dateObj.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  });
  return convertArabicToEnglish(formatted);
}
