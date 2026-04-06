// Shared validation helpers for forms across the application

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate that a string is non-empty after trimming
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}

/**
 * Validate email format
 */
export function validateEmail(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email is required' };
  }
  
  // Basic email regex pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

/**
 * Validate contact number format
 * Allows common formats: +, spaces, dashes, parentheses, digits
 */
export function validateContactNumber(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Contact number is required' };
  }
  
  // Allow digits, spaces, +, -, (, )
  const phonePattern = /^[\d\s\-+()]+$/;
  if (!phonePattern.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid contact number' };
  }
  
  // Ensure at least some digits are present
  const digitCount = (trimmed.match(/\d/g) || []).length;
  if (digitCount < 7) {
    return { isValid: false, error: 'Contact number must contain at least 7 digits' };
  }
  
  return { isValid: true };
}

/**
 * Validate numeric input (age, height, weight, etc.)
 */
export function validateNumeric(
  value: string,
  fieldName: string,
  options?: { min?: number; max?: number; allowDecimals?: boolean }
): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const num = options?.allowDecimals ? parseFloat(trimmed) : parseInt(trimmed, 10);
  
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  
  if (options?.min !== undefined && num < options.min) {
    return { isValid: false, error: `${fieldName} must be at least ${options.min}` };
  }
  
  if (options?.max !== undefined && num > options.max) {
    return { isValid: false, error: `${fieldName} must not exceed ${options.max}` };
  }
  
  return { isValid: true };
}

/**
 * Get the first invalid field name from a validation errors object
 * Used for focus management after validation failure
 */
export function getFirstInvalidField<T extends Record<string, string | undefined>>(errors: T): string | null {
  const keys = Object.keys(errors).filter(key => errors[key]);
  return keys.length > 0 ? keys[0] : null;
}
