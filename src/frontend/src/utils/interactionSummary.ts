import { Severity, ToxicityRiskLevel } from '../backend';
import type { ClinicallyOrientedInteraction } from '../backend';

export interface OverallSummary {
  highestSeverity: Severity | null;
  highestSeverityPairs: string[];
  topRecommendations: string[];
  allDataMissing: boolean;
}

/**
 * Check if an interaction has real data (not a placeholder)
 */
function hasRealData(interaction: ClinicallyOrientedInteraction): boolean {
  return !!(
    interaction.description ||
    interaction.severity ||
    interaction.managementRecommendations ||
    interaction.clinicalEffects
  );
}

/**
 * Generate overall summary from pairwise interactions
 * Ignores placeholder/no-data interactions
 */
export function generateOverallSummary(
  pairwiseInteractions: ClinicallyOrientedInteraction[]
): OverallSummary {
  // Filter out interactions with no real data
  const realInteractions = pairwiseInteractions.filter(hasRealData);
  
  if (realInteractions.length === 0) {
    return {
      highestSeverity: null,
      highestSeverityPairs: [],
      topRecommendations: [],
      allDataMissing: true,
    };
  }

  // Find highest severity
  const severityRank: Record<Severity, number> = {
    [Severity.contraindicated]: 4,
    [Severity.major]: 3,
    [Severity.moderate]: 2,
    [Severity.minor]: 1,
  };

  let highestSeverity: Severity | null = null;
  let highestRank = 0;

  for (const interaction of realInteractions) {
    if (interaction.severity) {
      const rank = severityRank[interaction.severity];
      if (rank > highestRank) {
        highestRank = rank;
        highestSeverity = interaction.severity;
      }
    }
  }

  // Find all pairs with highest severity
  const highestSeverityPairs: string[] = [];
  if (highestSeverity) {
    for (const interaction of realInteractions) {
      if (interaction.severity === highestSeverity) {
        highestSeverityPairs.push(
          `${interaction.drugs.drugA} + ${interaction.drugs.drugB}`
        );
      }
    }
  }

  // Collect top recommendations (from highest severity interactions)
  const topRecommendations: string[] = [];
  for (const interaction of realInteractions) {
    if (
      interaction.severity === highestSeverity &&
      interaction.managementRecommendations
    ) {
      topRecommendations.push(interaction.managementRecommendations);
    }
  }

  // If no recommendations from highest severity, get from any interaction
  if (topRecommendations.length === 0) {
    for (const interaction of realInteractions) {
      if (interaction.managementRecommendations) {
        topRecommendations.push(interaction.managementRecommendations);
        break;
      }
    }
  }

  return {
    highestSeverity,
    highestSeverityPairs,
    topRecommendations,
    allDataMissing: false,
  };
}

/**
 * Format severity for display
 */
export function formatSeverity(severity: Severity): string {
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

/**
 * Format toxicity risk for display
 */
export function formatToxicityRisk(risk: ToxicityRiskLevel): string {
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
