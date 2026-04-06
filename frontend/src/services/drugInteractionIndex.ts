// Cached interaction index for O(1) lookups
import { normalizePairKey } from '../utils/drugPairs';

interface DrugInteractionDetail {
  drugA: string;
  drugB: string;
  mechanism: string;
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  description: string;
  clinicalSignificance: string;
  managementRecommendations: string;
  alternatives?: string[];
  evidenceLevel: string;
  references: string[];
}

interface InteractionIndex {
  index: Map<string, DrugInteractionDetail>;
  version: string;
}

let cachedIndex: InteractionIndex | null = null;

export function buildInteractionIndex(drugDatabase: any[]): Map<string, DrugInteractionDetail> {
  const index = new Map<string, DrugInteractionDetail>();
  
  for (const drugInfo of drugDatabase) {
    if (drugInfo.interactions && Array.isArray(drugInfo.interactions)) {
      for (const interaction of drugInfo.interactions) {
        const pairKey = normalizePairKey(interaction.drugA, interaction.drugB);
        // Only add if not already present (first occurrence wins)
        if (!index.has(pairKey)) {
          index.set(pairKey, interaction);
        }
      }
    }
  }
  
  return index;
}

export function getCachedInteractionIndex(drugDatabase: any[], forceRebuild = false): Map<string, DrugInteractionDetail> {
  // Generate a simple version hash based on database length
  const currentVersion = `v${drugDatabase.length}`;
  
  if (!forceRebuild && cachedIndex && cachedIndex.version === currentVersion) {
    return cachedIndex.index;
  }
  
  // Build new index
  const newIndex = buildInteractionIndex(drugDatabase);
  cachedIndex = {
    index: newIndex,
    version: currentVersion
  };
  
  return newIndex;
}

export function invalidateInteractionIndex(): void {
  cachedIndex = null;
}

export function lookupInteraction(
  drugA: string,
  drugB: string,
  index: Map<string, DrugInteractionDetail>
): DrugInteractionDetail | null {
  const pairKey = normalizePairKey(drugA, drugB);
  return index.get(pairKey) || null;
}
