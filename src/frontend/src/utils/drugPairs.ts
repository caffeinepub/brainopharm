// Utility functions for generating and normalizing drug pairs

export interface DrugPair {
  drugA: string;
  drugB: string;
}

/**
 * Normalize a drug name for consistent matching:
 * - Convert to lowercase
 * - Trim whitespace
 * - Collapse multiple spaces to single space
 * - Remove/standardize punctuation (hyphens, periods, etc.)
 */
export function normalizeDrugName(drugName: string): string {
  return drugName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/[.\-_]/g, '') // Remove common punctuation
    .replace(/\s/g, ''); // Remove all spaces for final comparison
}

/**
 * Generate a normalized pair key for consistent lookups
 * Always returns drugs in alphabetical order to handle A+B = B+A
 */
export function normalizePairKey(drugA: string, drugB: string): string {
  const normA = normalizeDrugName(drugA);
  const normB = normalizeDrugName(drugB);
  
  // Sort alphabetically to ensure consistent key regardless of order
  return normA < normB ? `${normA}|${normB}` : `${normB}|${normA}`;
}

/**
 * Check if two drug pairs are equivalent (regardless of order)
 */
export function arePairsEquivalent(pair1: DrugPair, pair2: DrugPair): boolean {
  const key1 = normalizePairKey(pair1.drugA, pair1.drugB);
  const key2 = normalizePairKey(pair2.drugA, pair2.drugB);
  return key1 === key2;
}

/**
 * Generate all unique drug pairs from an array of 2-4 drug names
 */
export function generateAllDrugPairs(drugs: string[]): DrugPair[] {
  const pairs: DrugPair[] = [];
  const validDrugs = drugs.filter(d => d && d.trim() !== '');
  
  for (let i = 0; i < validDrugs.length; i++) {
    for (let j = i + 1; j < validDrugs.length; j++) {
      pairs.push({
        drugA: validDrugs[i],
        drugB: validDrugs[j],
      });
    }
  }
  
  return pairs;
}

/**
 * Format a user-facing drug pair label from two drug names
 * @param drugA First drug name
 * @param drugB Second drug name
 * @returns Formatted label in the format "Drug A + Drug B"
 */
export function formatDrugPairLabel(drugA: string, drugB: string): string {
  return `${drugA} + ${drugB}`;
}
