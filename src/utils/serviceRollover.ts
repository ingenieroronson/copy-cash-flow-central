
import { ServiceState } from '@/types/sales';
import { getTodayInMexicoTimezone } from './dateUtils';

const ROLLOVER_STORAGE_KEY = 'lastRolloverDate';

/**
 * Checks if a rollover is needed and returns true if it should be performed
 * This should be called on every app load
 */
export const shouldPerformRollover = (): boolean => {
  const today = getTodayInMexicoTimezone();
  const lastRolloverDate = localStorage.getItem(ROLLOVER_STORAGE_KEY);
  
  console.log('Checking if rollover needed - Today:', today, 'Last rollover:', lastRolloverDate);
  
  // If this is the first time or the date has changed, rollover is needed
  const needsRollover = !lastRolloverDate || lastRolloverDate !== today;
  
  if (needsRollover) {
    console.log('Rollover needed for date:', today);
  } else {
    console.log('No rollover needed - already performed for today');
  }
  
  return needsRollover;
};

/**
 * Marks that rollover has been completed for today
 */
export const markRolloverCompleted = (): void => {
  const today = getTodayInMexicoTimezone();
  localStorage.setItem(ROLLOVER_STORAGE_KEY, today);
  console.log('Rollover marked as completed for date:', today);
};

/**
 * Checks if a rollover is needed and performs it if necessary
 * @param currentServices Current service state
 * @returns Updated service state if rollover was performed, null if no rollover needed
 */
export const checkAndPerformServiceRollover = (currentServices: ServiceState): ServiceState | null => {
  if (!shouldPerformRollover()) {
    return null; // No rollover needed
  }
  
  console.log('Performing service rollover');
  
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
  
  // Mark rollover as completed
  markRolloverCompleted();
  
  return rolledOverServices;
};

/**
 * Forces a rollover regardless of date (for testing or manual triggers)
 */
export const forceServiceRollover = (currentServices: ServiceState): ServiceState => {
  console.log('Forcing service rollover');
  
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
  
  markRolloverCompleted();
  
  return rolledOverServices;
};
