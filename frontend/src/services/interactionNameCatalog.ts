// Helper functions to derive canonical suggestion lists for drugs and foods

import { drugDrugInteractionService } from './drugDrugInteractionService';
import { getAllFoods } from '../data/foodList';
import { normalizeName } from '../utils/nameNormalization';

/**
 * Get all unique drug names from the built-in drug database
 */
export function getAllDrugNames(): string[] {
  const drugDatabase = drugDrugInteractionService.getCachedData();
  const drugNames = new Set<string>();
  
  // Add all drug names from the database
  for (const drugInfo of drugDatabase) {
    drugNames.add(drugInfo.name);
    
    // Also add generic name if different
    if (drugInfo.genericName && drugInfo.genericName !== drugInfo.name) {
      drugNames.add(drugInfo.genericName);
    }
    
    // Add brand names
    if (drugInfo.brandNames) {
      for (const brandName of drugInfo.brandNames) {
        drugNames.add(brandName);
      }
    }
  }
  
  return Array.from(drugNames).sort();
}

/**
 * Get all food names from the built-in food list
 */
export function getAllFoodNames(): string[] {
  return getAllFoods().sort();
}

/**
 * Filter suggestions based on user input (normalization-aware)
 */
export function filterSuggestions(input: string, suggestions: string[]): string[] {
  if (!input || input.trim() === '') {
    return suggestions;
  }
  
  const normalizedInput = normalizeName(input);
  
  return suggestions.filter(suggestion => {
    const normalizedSuggestion = normalizeName(suggestion);
    return normalizedSuggestion.includes(normalizedInput);
  });
}
