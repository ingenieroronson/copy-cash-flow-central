
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const MEXICO_TIMEZONE = 'America/Mexico_City';

/**
 * Formats a date string consistently in Mexico City timezone
 */
export const formatDateInMexicoTimezone = (dateString: string, formatStr: string = 'dd/MM/yyyy'): string => {
  // Create date from the stored date string (YYYY-MM-DD format from Supabase)
  const date = new Date(dateString + 'T00:00:00');
  
  return format(date, formatStr, { locale: es });
};

/**
 * Formats a date for display in Mexico City timezone
 */
export const formatDisplayDate = (dateString: string): string => {
  return formatDateInMexicoTimezone(dateString, 'EEE, d MMM yyyy');
};

/**
 * Gets today's date in Mexico City timezone in YYYY-MM-DD format
 */
export const getTodayInMexicoTimezone = (): string => {
  const now = new Date();
  return now.toLocaleDateString('en-CA', { timeZone: MEXICO_TIMEZONE });
};

/**
 * Converts a date input value to Mexico City timezone date string
 */
export const convertInputDateToMexicoDate = (inputDate: string): string => {
  // Input date is already in YYYY-MM-DD format, just ensure it's treated correctly
  return inputDate;
};
