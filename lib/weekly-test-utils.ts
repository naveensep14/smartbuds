/**
 * Utility functions for handling weekly test expiry logic
 */

/**
 * Get the next Sunday date (when weekly tests become available)
 */
export function getNextSunday(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek; // If today is Sunday, next Sunday is in 7 days
  
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(0, 0, 0, 0); // Start of day
  
  return nextSunday;
}

/**
 * Get the expiry date for a weekly test (1 week after it becomes available)
 */
export function getWeeklyTestExpiryDate(availableDate?: Date): Date {
  const baseDate = availableDate || getNextSunday();
  const expiryDate = new Date(baseDate);
  expiryDate.setDate(baseDate.getDate() + 7); // Add 7 days
  expiryDate.setHours(23, 59, 59, 999); // End of day
  
  return expiryDate;
}

/**
 * Check if a weekly test is currently available (not expired)
 */
export function isWeeklyTestAvailable(expiryDate: Date): boolean {
  const now = new Date();
  return now < expiryDate;
}

/**
 * Get the time remaining until a weekly test expires
 */
export function getTimeUntilExpiry(expiryDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  totalHours: number;
  isExpired: boolean;
} {
  const now = new Date();
  const timeDiff = expiryDate.getTime() - now.getTime();
  
  if (timeDiff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      totalHours: 0,
      isExpired: true
    };
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const totalHours = Math.floor(timeDiff / (1000 * 60 * 60));
  
  return {
    days,
    hours,
    minutes,
    totalHours,
    isExpired: false
  };
}

/**
 * Get a human-readable string for time remaining
 */
export function getTimeRemainingString(expiryDate: Date): string {
  const timeInfo = getTimeUntilExpiry(expiryDate);
  
  if (timeInfo.isExpired) {
    return 'Expired';
  }
  
  if (timeInfo.days > 0) {
    return `${timeInfo.days} day${timeInfo.days !== 1 ? 's' : ''} remaining`;
  } else if (timeInfo.hours > 0) {
    return `${timeInfo.hours} hour${timeInfo.hours !== 1 ? 's' : ''} remaining`;
  } else {
    return `${timeInfo.minutes} minute${timeInfo.minutes !== 1 ? 's' : ''} remaining`;
  }
}

/**
 * Get urgency level based on time remaining
 */
export function getUrgencyLevel(expiryDate: Date): 'low' | 'medium' | 'high' | 'critical' {
  const timeInfo = getTimeUntilExpiry(expiryDate);
  
  if (timeInfo.isExpired) {
    return 'critical';
  }
  
  if (timeInfo.totalHours <= 24) {
    return 'critical';
  } else if (timeInfo.totalHours <= 72) {
    return 'high';
  } else if (timeInfo.totalHours <= 120) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Get urgency color class
 */
export function getUrgencyColorClass(urgencyLevel: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (urgencyLevel) {
    case 'low':
      return 'text-green bg-green border-green';
    case 'medium':
      return 'text-yellow bg-yellow border-yellow';
    case 'high':
      return 'text-peach bg-peach border-peach';
    case 'critical':
      return 'text-pink bg-pink border-pink';
  }
}

/**
 * Check if a weekly test is currently within its date range
 * @param startDate - Start date in dd/mm format (e.g., "15/03")
 * @param endDate - End date in dd/mm format (e.g., "21/03")
 * @returns true if the test is currently within its date range
 */
export function isWeeklyTestInDateRange(startDate: string, endDate: string): boolean {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11
  
  // Parse start and end dates
  const [startDay, startMonth] = startDate.split('/').map(Number);
  const [endDay, endMonth] = endDate.split('/').map(Number);
  
  // Convert to comparable format (month * 100 + day)
  const currentDateValue = currentMonth * 100 + currentDay;
  const startDateValue = startMonth * 100 + startDay;
  const endDateValue = endMonth * 100 + endDay;
  
  // Handle year boundary (e.g., 29/12 to 04/01)
  if (startDateValue > endDateValue) {
    // Date range spans across year boundary
    return currentDateValue >= startDateValue || currentDateValue <= endDateValue;
  } else {
    // Normal date range within same year
    return currentDateValue >= startDateValue && currentDateValue <= endDateValue;
  }
}
