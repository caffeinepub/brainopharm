// Service for resolving drug names to monograph data using normalization-aware matching

import { DRUG_MONOGRAPHS, buildMonographIndex, DrugMonograph } from '../data/drugMonographsDataset';
import { normalizeName } from '../utils/nameNormalization';

// Cached index for O(1) lookups
let cachedIndex: Map<string, DrugMonograph> | null = null;

/**
 * Get or build the monograph index (cached for performance)
 */
function getMonographIndex(): Map<string, DrugMonograph> {
  if (!cachedIndex) {
    cachedIndex = buildMonographIndex();
  }
  return cachedIndex;
}

/**
 * Resolve a drug name to its monograph using normalization-aware matching.
 * 
 * Collision handling: If multiple drugs normalize to the same key (unlikely with our dataset),
 * the first one indexed (canonical name) takes precedence. This is deterministic and stable.
 * 
 * @param drugName - The drug name to look up (case/space/punctuation insensitive)
 * @returns The monograph if found, or null if not available in the dataset
 */
export function resolveDrugMonograph(drugName: string): DrugMonograph | null {
  if (!drugName || drugName.trim() === '') {
    return null;
  }
  
  const normalized = normalizeName(drugName);
  const index = getMonographIndex();
  
  return index.get(normalized) || null;
}

/**
 * Check if a drug has monograph data available
 */
export function hasMonographData(drugName: string): boolean {
  return resolveDrugMonograph(drugName) !== null;
}

/**
 * Get all available drug names in the monograph dataset (for autocomplete/suggestions)
 */
export function getAllMonographDrugNames(): string[] {
  return DRUG_MONOGRAPHS.map(m => m.drugName).sort();
}

/**
 * Invalidate the cached index (useful for testing or if dataset is updated dynamically)
 */
export function invalidateMonographCache(): void {
  cachedIndex = null;
}
