// Shared date parsing and validation utilities

/**
 * Convert a date input string to bigint nanosecond timestamp
 * Returns null if the date is invalid
 */
export function parseDateToNanoseconds(dateString: string): bigint | null {
  if (!dateString || !dateString.trim()) {
    return null;
  }
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return null;
  }
  
  // Convert to nanoseconds (milliseconds * 1,000,000)
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

/**
 * Validate and convert a date input to nanoseconds
 * Returns an error message if invalid, or the bigint timestamp if valid
 */
export function validateAndParseDateToNanoseconds(
  dateString: string,
  fieldName: string
): { isValid: true; value: bigint | null } | { isValid: false; error: string } {
  if (!dateString || !dateString.trim()) {
    // Empty date is allowed (optional field)
    return { isValid: true, value: null };
  }
  
  const timestamp = parseDateToNanoseconds(dateString);
  
  if (timestamp === null) {
    return { isValid: false, error: `${fieldName} is not a valid date` };
  }
  
  return { isValid: true, value: timestamp };
}

/**
 * Format a nanosecond timestamp to a readable date string
 * Returns "Not available" if the timestamp is invalid
 */
export function formatNanosecondsToDate(nanoseconds: bigint | undefined): string {
  if (!nanoseconds) {
    return 'Not available';
  }
  
  try {
    // Convert nanoseconds to milliseconds
    const milliseconds = Number(nanoseconds / BigInt(1_000_000));
    const date = new Date(milliseconds);
    
    if (isNaN(date.getTime())) {
      return 'Not available';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Not available';
  }
}
