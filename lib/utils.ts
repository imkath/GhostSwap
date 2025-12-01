import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a date string (YYYY-MM-DD) as a local date to avoid timezone issues.
 * When using new Date("2024-12-24"), JS interprets it as UTC midnight,
 * which can shift the date backward in negative UTC offset timezones.
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Format a date string (YYYY-MM-DD) for display without timezone issues.
 */
export function formatLocalDate(dateString: string, locale = 'es-ES'): string {
  return parseLocalDate(dateString).toLocaleDateString(locale)
}
