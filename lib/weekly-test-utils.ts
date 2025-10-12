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
      return 'text-green-600 bg-green-50 border-green-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
  }
}
