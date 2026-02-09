// Cached indexing and lookup for Drug-Food and Food-Food interactions

import { normalizeName } from '../utils/nameNormalization';
import { 
  DRUG_FOOD_INTERACTIONS, 
  DrugFoodInteraction,
  getNormalizedDrugFoodInteractions 
} from '../data/drugFoodInteractionsDataset';
import { 
  FOOD_FOOD_INTERACTIONS, 
  FoodFoodInteraction,
  getNormalizedFoodFoodInteractions 
} from '../data/foodFoodInteractionsDataset';

interface DrugFoodIndex {
  index: Map<string, DrugFoodInteraction[]>;
  version: string;
}

interface FoodFoodIndex {
  index: Map<string, FoodFoodInteraction[]>;
  version: string;
}

let cachedDrugFoodIndex: DrugFoodIndex | null = null;
let cachedFoodFoodIndex: FoodFoodIndex | null = null;

/**
 * Get cached Drug-Food interaction index
 */
export function getCachedDrugFoodIndex(forceRebuild = false): Map<string, DrugFoodInteraction[]> {
  const currentVersion = `v${DRUG_FOOD_INTERACTIONS.length}`;
  
  if (!forceRebuild && cachedDrugFoodIndex && cachedDrugFoodIndex.version === currentVersion) {
    return cachedDrugFoodIndex.index;
  }
  
  const newIndex = getNormalizedDrugFoodInteractions();
  cachedDrugFoodIndex = {
    index: newIndex,
    version: currentVersion
  };
  
  return newIndex;
}

/**
 * Get cached Food-Food interaction index
 */
export function getCachedFoodFoodIndex(forceRebuild = false): Map<string, FoodFoodInteraction[]> {
  const currentVersion = `v${FOOD_FOOD_INTERACTIONS.length}`;
  
  if (!forceRebuild && cachedFoodFoodIndex && cachedFoodFoodIndex.version === currentVersion) {
    return cachedFoodFoodIndex.index;
  }
  
  const newIndex = getNormalizedFoodFoodInteractions();
  cachedFoodFoodIndex = {
    index: newIndex,
    version: currentVersion
  };
  
  return newIndex;
}

/**
 * Look up Drug-Food interaction
 */
export function lookupDrugFoodInteraction(
  drug: string,
  food: string,
  index: Map<string, DrugFoodInteraction[]>
): DrugFoodInteraction | null {
  const key = `${normalizeName(drug)}|${normalizeName(food)}`;
  const interactions = index.get(key);
  return interactions && interactions.length > 0 ? interactions[0] : null;
}

/**
 * Look up Food-Food interaction
 */
export function lookupFoodFoodInteraction(
  foodA: string,
  foodB: string,
  index: Map<string, FoodFoodInteraction[]>
): FoodFoodInteraction | null {
  const normA = normalizeName(foodA);
  const normB = normalizeName(foodB);
  const key = normA < normB ? `${normA}|${normB}` : `${normB}|${normA}`;
  
  const interactions = index.get(key);
  return interactions && interactions.length > 0 ? interactions[0] : null;
}

/**
 * Invalidate caches
 */
export function invalidateFoodInteractionIndexes(): void {
  cachedDrugFoodIndex = null;
  cachedFoodFoodIndex = null;
}
