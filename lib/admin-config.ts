// Admin configuration
// Add email addresses that should have admin access

export const ADMIN_EMAILS = [
  'naveensep14@gmail.com',
  'nethramukund2015@gmail.com',
  'niveditha.2587@gmail.com',
  // Add more admin emails here
] as const;

// Type for admin emails
export type AdminEmail = typeof ADMIN_EMAILS[number];

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Secure admin email check with validation
export const isAdminEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Validate email format
  if (!isValidEmail(normalizedEmail)) {
    return false;
  }
  
  return ADMIN_EMAILS.includes(normalizedEmail as AdminEmail);
};

export const getUserRole = (email: string): 'admin' | 'user' => {
  return isAdminEmail(email) ? 'admin' : 'user';
};

// Server-side admin verification (for API routes)
export const verifyAdminEmail = (email: string): boolean => {
  // Additional server-side validation
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Check for suspicious patterns
  if (email.includes('..') || email.includes('@.') || email.startsWith('.') || email.endsWith('.')) {
    return false;
  }
  
  return isAdminEmail(email);
};
