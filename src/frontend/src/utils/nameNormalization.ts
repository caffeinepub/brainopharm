// Shared normalization helpers for drug and food names

/**
 * Normalize a name (drug or food) for consistent matching:
 * - Convert to lowercase
 * - Trim whitespace
 * - Collapse multiple spaces to single space
 * - Remove/standardize punctuation (hyphens, periods, parentheses, etc.)
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/[.\-_()]/g, '') // Remove common punctuation
    .replace(/\s/g, ''); // Remove all spaces for final comparison
}

/**
 * Check if two names are equivalent after normalization
 */
export function areNamesEquivalent(name1: string, name2: string): boolean {
  return normalizeName(name1) === normalizeName(name2);
}

/**
 * Find duplicates in a list of names (case/space/punctuation insensitive)
 * Returns the original names that are duplicates
 */
export function findDuplicateNames(names: string[]): string[] {
  const normalized = names.map(n => normalizeName(n));
  const seen = new Set<string>();
  const duplicates: string[] = [];
  
  for (let i = 0; i < normalized.length; i++) {
    if (seen.has(normalized[i])) {
      duplicates.push(names[i]);
    } else {
      seen.add(normalized[i]);
    }
  }
  
  return duplicates;
}
