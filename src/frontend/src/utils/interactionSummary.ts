import { ClinicallyOrientedInteraction, Severity, ToxicityRiskLevel } from '../backend';
import { formatDrugPairLabel } from './drugPairs';

export interface OverallSummary {
  highestSeverity: Severity | null;
  highestSeverityPairs: string[];
  highestToxicityRisk: ToxicityRiskLevel | null;
  topRecommendations: string[];
  allDataMissing: boolean;
  hasAnyData: boolean;
}

// Check if an interaction has real data (not placeholder)
function hasRealData(interaction: ClinicallyOrientedInteraction): boolean {
  return !!(
    interaction.description ||
    interaction.severity ||
    interaction.managementRecommendations ||
    interaction.clinicalEffects ||
    interaction.toxicityRisk
  );
}

// Generate overall summary from pairwise interactions - OPTIMIZED
export function generateOverallSummary(interactions: ClinicallyOrientedInteraction[]): OverallSummary {
  // Filter out placeholder interactions
  const realInteractions = interactions.filter(hasRealData);
  
  if (realInteractions.length === 0) {
    return {
      highestSeverity: null,
      highestSeverityPairs: [],
      highestToxicityRisk: null,
      topRecommendations: [],
      allDataMissing: true,
      hasAnyData: false,
    };
  }
  
  // Find highest severity
  const severityOrder = {
    [Severity.contraindicated]: 4,
    [Severity.major]: 3,
    [Severity.moderate]: 2,
    [Severity.minor]: 1,
  };
  
  let highestSeverity: Severity | null = null;
  let highestSeverityValue = 0;
  
  for (const interaction of realInteractions) {
    if (interaction.severity) {
      const value = severityOrder[interaction.severity] || 0;
      if (value > highestSeverityValue) {
        highestSeverityValue = value;
        highestSeverity = interaction.severity;
      }
    }
  }
  
  // Find pairs with highest severity
  const highestSeverityPairs: string[] = [];
  if (highestSeverity) {
    for (const interaction of realInteractions) {
      if (interaction.severity === highestSeverity) {
        highestSeverityPairs.push(formatDrugPairLabel(interaction.drugs.drugA, interaction.drugs.drugB));
      }
    }
  }
  
  // Find highest toxicity risk
  const toxicityOrder = {
    [ToxicityRiskLevel.high]: 3,
    [ToxicityRiskLevel.moderate]: 2,
    [ToxicityRiskLevel.low]: 1,
    [ToxicityRiskLevel.unknown_]: 0,
  };
  
  let highestToxicityRisk: ToxicityRiskLevel | null = null;
  let highestToxicityValue = 0;
  
  for (const interaction of realInteractions) {
    if (interaction.toxicityRisk) {
      const value = toxicityOrder[interaction.toxicityRisk] || 0;
      if (value > highestToxicityValue) {
        highestToxicityValue = value;
        highestToxicityRisk = interaction.toxicityRisk;
      }
    }
  }
  
  // Collect top recommendations (from highest severity interactions)
  const topRecommendations: string[] = [];
  for (const interaction of realInteractions) {
    if (interaction.severity === highestSeverity && interaction.managementRecommendations) {
      topRecommendations.push(interaction.managementRecommendations);
    }
  }
  
  return {
    highestSeverity,
    highestSeverityPairs,
    highestToxicityRisk,
    topRecommendations,
    allDataMissing: false,
    hasAnyData: true,
  };
}

// Format severity for display
export function formatSeverity(severity: Severity | null | undefined): string {
  if (!severity) return 'Unknown';
  
  switch (severity) {
    case Severity.contraindicated:
      return 'Contraindicated';
    case Severity.major:
      return 'Major';
    case Severity.moderate:
      return 'Moderate';
    case Severity.minor:
      return 'Minor';
    default:
      return 'Unknown';
  }
}

// Format toxicity risk for display
export function formatToxicityRisk(risk: ToxicityRiskLevel | null | undefined): string {
  if (!risk) return 'Unknown';
  
  switch (risk) {
    case ToxicityRiskLevel.high:
      return 'High';
    case ToxicityRiskLevel.moderate:
      return 'Moderate';
    case ToxicityRiskLevel.low:
      return 'Low';
    case ToxicityRiskLevel.unknown_:
      return 'Unknown';
    default:
      return 'Unknown';
  }
}
