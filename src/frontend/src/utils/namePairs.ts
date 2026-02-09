// Utility for generating unique pairs from 2-4 names

export interface NamePair {
  nameA: string;
  nameB: string;
}

/**
 * Generate all unique pairs from an array of 2-4 names
 * Returns pairs in deterministic order
 */
export function generateAllNamePairs(names: string[]): NamePair[] {
  const pairs: NamePair[] = [];
  const validNames = names.filter(n => n && n.trim() !== '');
  
  for (let i = 0; i < validNames.length; i++) {
    for (let j = i + 1; j < validNames.length; j++) {
      pairs.push({
        nameA: validNames[i],
        nameB: validNames[j],
      });
    }
  }
  
  return pairs;
}

/**
 * Format a user-facing pair label
 */
export function formatPairLabel(nameA: string, nameB: string): string {
  return `${nameA} + ${nameB}`;
}
