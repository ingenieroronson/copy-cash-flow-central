
import { ServiceState } from '@/types/sales';
import { getTodayInMexicoTimezone } from './dateUtils';

const ROLLOVER_STORAGE_KEY = 'lastRolloverDate';

/**
 * Initializes or updates the rollover date tracking
 * This should be called on every app load
 */
export const initializeRolloverTracking = (): void => {
  const today = getTodayInMexicoTimezone();
  const lastRolloverDate = localStorage.getItem(ROLLOVER_STORAGE_KEY);
  
  console.log('Initializing rollover tracking - Today:', today, 'Last rollover:', lastRolloverDate);
  
  // Always update the date to today when the app loads
  localStorage.setItem(ROLLOVER_STORAGE_KEY, today);
};

/**
 * Checks if a rollover is needed and performs it if necessary
 * @param currentServices Current service state
 * @returns Updated service state if rollover was performed, null if no rollover needed
 */
export const checkAndPerformServiceRollover = (currentServices: ServiceState): ServiceState | null => {
  const today = getTodayInMexicoTimezone();
  const lastRolloverDate = localStorage.getItem(ROLLOVER_STORAGE_KEY);
  
  console.log('Checking rollover - Today:', today, 'Last rollover:', lastRolloverDate);
  
  // If this is the first time or the date has changed, perform rollover
  if (!lastRolloverDate || lastRolloverDate !== today) {
    console.log('Performing service rollover for date:', today);
    
    const rolledOverServices: ServiceState = {
      colorCopies: {
        yesterday: currentServices.colorCopies.today,
        today: 0,
        errors: 0
      },
      bwCopies: {
        yesterday: currentServices.bwCopies.today,
        today: 0,
        errors: 0
      },
      colorPrints: {
        yesterday: currentServices.colorPrints.today,
        today: 0,
        errors: 0
      },
      bwPrints: {
        yesterday: currentServices.bwPrints.today,
        today: 0,
        errors: 0
      }
    };
    
    // Update the last rollover date
    localStorage.setItem(ROLLOVER_STORAGE_KEY, today);
    
    return rolledOverServices;
  }
  
  return null; // No rollover needed
};

/**
 * Forces a rollover regardless of date (for testing or manual triggers)
 */
export const forceServiceRollover = (currentServices: ServiceState): ServiceState => {
  const today = getTodayInMexicoTimezone();
  
  console.log('Forcing service rollover for date:', today);
  
  const rolledOverServices: ServiceState = {
    colorCopies: {
      yesterday: currentServices.colorCopies.today,
      today: 0,
      errors: 0
    },
    bwCopies: {
      yesterday: currentServices.bwCopies.today,
      today: 0,
      errors: 0
    },
    colorPrints: {
      yesterday: currentServices.colorPrints.today,
      today: 0,
      errors: 0
    },
    bwPrints: {
      yesterday: currentServices.bwPrints.today,
      today: 0,
      errors: 0
    }
  };
  
  localStorage.setItem(ROLLOVER_STORAGE_KEY, today);
  
  return rolledOverServices;
};
