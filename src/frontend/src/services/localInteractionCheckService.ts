// Client-side service for computing drug-drug, drug-food, and food-food interactions
import { normalizeName } from '../utils/nameNormalization';
import { generateAllNamePairs } from '../utils/namePairs';
import { getCachedInteractionIndex, lookupInteraction } from './drugInteractionIndex';
import { getCachedDrugFoodIndex, getCachedFoodFoodIndex, lookupDrugFoodInteraction, lookupFoodFoodInteraction } from './foodInteractionIndex';
import { drugDrugInteractionService } from './drugDrugInteractionService';
import { InteractionType, Severity, EvidenceLevel, ToxicityRiskLevel } from '../backend';

// Drug-Drug interaction result shape
export interface DrugDrugInteractionResult {
  drugs: {
    drugA: string;
    drugB: string;
  };
  interactionType?: InteractionType;
  description?: string;
  clinicalEffects?: string;
  toxicityRisk?: ToxicityRiskLevel;
  managementRecommendations?: string;
  severity?: Severity;
  evidenceLevel?: EvidenceLevel;
  references: string[];
}

// Drug-Food interaction result shape
export interface DrugFoodInteractionResult {
  drug: string;
  food: string;
  interactionType?: string;
  description?: string;
  clinicalEffects?: string;
  toxicityRisk?: string;
  managementRecommendations?: string;
  evidenceLevel?: string;
  references: string[];
}

// Food-Food interaction result shape
export interface FoodFoodInteractionResult {
  foods: {
    foodA: string;
    foodB: string;
  };
  description?: string;
  clinicalEffects?: string;
  managementRecommendations?: string;
  references: string[];
}

/**
 * Compute Drug-Drug interactions for multiple drugs (2-4 drugs)
 * Returns one result per unique pair
 */
export function computeMultiDrugInteractions(drugs: string[]): DrugDrugInteractionResult[] {
  const validDrugs = drugs.filter(d => d && d.trim() !== '');
  
  if (validDrugs.length < 2) {
    return [];
  }

  // Get the drug database and build index
  const drugDatabase = drugDrugInteractionService.getCachedData();
  const interactionIndex = getCachedInteractionIndex(drugDatabase);

  // Generate all unique pairs
  const pairs = generateAllNamePairs(validDrugs);

  // Look up each pair
  const results: DrugDrugInteractionResult[] = pairs.map(pair => {
    const interaction = lookupInteraction(pair.nameA, pair.nameB, interactionIndex);

    if (interaction) {
      // Map severity string to enum
      let severityEnum: Severity | undefined;
      switch (interaction.severity) {
        case 'minor':
          severityEnum = Severity.minor;
          break;
        case 'moderate':
          severityEnum = Severity.moderate;
          break;
        case 'major':
          severityEnum = Severity.major;
          break;
        case 'contraindicated':
          severityEnum = Severity.contraindicated;
          break;
      }

      // Map mechanism to interaction type
      let interactionType: InteractionType | undefined;
      if (interaction.mechanism.toLowerCase().includes('pharmacokinetic')) {
        interactionType = InteractionType.pharmacokinetic;
      } else if (interaction.mechanism.toLowerCase().includes('pharmacodynamic')) {
        interactionType = InteractionType.pharmacodynamic;
      } else if (interaction.mechanism.toLowerCase().includes('both')) {
        interactionType = InteractionType.both;
      }

      // Infer toxicity risk from severity
      let toxicityRisk: ToxicityRiskLevel | undefined;
      switch (interaction.severity) {
        case 'minor':
          toxicityRisk = ToxicityRiskLevel.low;
          break;
        case 'moderate':
          toxicityRisk = ToxicityRiskLevel.moderate;
          break;
        case 'major':
        case 'contraindicated':
          toxicityRisk = ToxicityRiskLevel.high;
          break;
      }

      // Map evidence level string to enum
      let evidenceLevelEnum: EvidenceLevel | undefined;
      const evidenceLower = interaction.evidenceLevel.toLowerCase();
      if (evidenceLower.includes('clinical trial')) {
        evidenceLevelEnum = EvidenceLevel.clinicalTrial;
      } else if (evidenceLower.includes('meta-analysis') || evidenceLower.includes('meta analysis')) {
        evidenceLevelEnum = EvidenceLevel.metaAnalysis;
      } else if (evidenceLower.includes('regulatory') || evidenceLower.includes('fda')) {
        evidenceLevelEnum = EvidenceLevel.regulatoryAgency;
      } else if (evidenceLower.includes('expert opinion') || evidenceLower.includes('clinical experience')) {
        evidenceLevelEnum = EvidenceLevel.expertOpinion;
      } else if (evidenceLower.includes('case report')) {
        evidenceLevelEnum = EvidenceLevel.caseReport;
      } else {
        evidenceLevelEnum = EvidenceLevel.others;
      }

      return {
        drugs: {
          drugA: pair.nameA,
          drugB: pair.nameB,
        },
        interactionType,
        description: interaction.description,
        clinicalEffects: interaction.clinicalSignificance,
        toxicityRisk,
        managementRecommendations: interaction.managementRecommendations,
        severity: severityEnum,
        evidenceLevel: evidenceLevelEnum,
        references: interaction.references,
      };
    } else {
      // No interaction data found - return placeholder
      return {
        drugs: {
          drugA: pair.nameA,
          drugB: pair.nameB,
        },
        description: undefined,
        references: [],
      };
    }
  });

  return results;
}

/**
 * Compute Drug-Food interactions for multiple drugs and foods
 * Returns one result per drug-food combination
 */
export function computeDrugFoodInteractions(drugs: string[], foods: string[]): DrugFoodInteractionResult[] {
  const validDrugs = drugs.filter(d => d && d.trim() !== '');
  const validFoods = foods.filter(f => f && f.trim() !== '');

  if (validDrugs.length === 0 || validFoods.length === 0) {
    return [];
  }

  // Get the drug-food index
  const drugFoodIndex = getCachedDrugFoodIndex();

  const results: DrugFoodInteractionResult[] = [];

  // Check each drug-food combination
  for (const drug of validDrugs) {
    for (const food of validFoods) {
      const interaction = lookupDrugFoodInteraction(drug, food, drugFoodIndex);

      if (interaction) {
        results.push({
          drug,
          food,
          interactionType: interaction.interactionType,
          description: interaction.description,
          clinicalEffects: interaction.clinicalEffects,
          toxicityRisk: interaction.toxicityRisk,
          managementRecommendations: interaction.managementRecommendations,
          evidenceLevel: interaction.evidenceLevel,
          references: interaction.references,
        });
      } else {
        // No interaction data found - return placeholder
        results.push({
          drug,
          food,
          description: undefined,
          references: [],
        });
      }
    }
  }

  return results;
}

/**
 * Compute Food-Food interactions for multiple foods
 * Returns one result per unique food pair
 */
export function computeFoodFoodInteractions(foods: string[]): FoodFoodInteractionResult[] {
  const validFoods = foods.filter(f => f && f.trim() !== '');

  if (validFoods.length < 2) {
    return [];
  }

  // Get the food-food index
  const foodFoodIndex = getCachedFoodFoodIndex();

  // Generate all unique pairs
  const pairs = generateAllNamePairs(validFoods);

  // Look up each pair
  const results: FoodFoodInteractionResult[] = pairs.map(pair => {
    const interaction = lookupFoodFoodInteraction(pair.nameA, pair.nameB, foodFoodIndex);

    if (interaction) {
      return {
        foods: {
          foodA: pair.nameA,
          foodB: pair.nameB,
        },
        description: interaction.description,
        clinicalEffects: interaction.clinicalEffects,
        managementRecommendations: interaction.managementRecommendations,
        references: interaction.references,
      };
    } else {
      // No interaction data found - return placeholder
      return {
        foods: {
          foodA: pair.nameA,
          foodB: pair.nameB,
        },
        description: undefined,
        references: [],
      };
    }
  });

  return results;
}

/**
 * Normalize and sort inputs for stable query keys
 */
export function normalizeInputsForQueryKey(inputs: string[]): string {
  return inputs
    .filter(i => i && i.trim() !== '')
    .map(i => normalizeName(i))
    .sort()
    .join('|');
}
