// Pre-configured example drug sets with known interactions in the local dataset

export interface DrugExampleSet {
  id: string;
  name: string;
  description: string;
  drugs: string[];
}

export const drugInteractionExamples: DrugExampleSet[] = [
  {
    id: 'example-1',
    name: 'Anticoagulation Risk (2 drugs)',
    description: 'Common combination with bleeding risk',
    drugs: ['Warfarin', 'Aspirin'],
  },
  {
    id: 'example-2',
    name: 'Diabetes + Imaging (2 drugs)',
    description: 'Metformin with contrast media interaction',
    drugs: ['Metformin', 'Contrast Media (Iodinated)'],
  },
  {
    id: 'example-3',
    name: 'Hypertension Management (2 drugs)',
    description: 'ACE inhibitor with potassium',
    drugs: ['Lisinopril', 'Potassium Supplements'],
  },
  {
    id: 'example-4',
    name: 'Cardiovascular Polypharmacy (3 drugs)',
    description: 'Multiple cardiovascular medications',
    drugs: ['Warfarin', 'Aspirin', 'Lisinopril'],
  },
  {
    id: 'example-5',
    name: 'Complex Regimen (4 drugs)',
    description: 'Multiple drug classes with potential interactions',
    drugs: ['Warfarin', 'Aspirin', 'Metformin', 'Lisinopril'],
  },
];

/**
 * Load an example set into the four drug input slots
 * Returns an object with drug1-drug4 filled appropriately
 */
export function loadExampleSet(exampleId: string): {
  drug1: string;
  drug2: string;
  drug3: string;
  drug4: string;
} {
  const example = drugInteractionExamples.find(ex => ex.id === exampleId);
  
  if (!example) {
    return { drug1: '', drug2: '', drug3: '', drug4: '' };
  }
  
  // Fill slots with example drugs, leaving unused slots empty
  return {
    drug1: example.drugs[0] || '',
    drug2: example.drugs[1] || '',
    drug3: example.drugs[2] || '',
    drug4: example.drugs[3] || '',
  };
}

/**
 * Validate that an example set has no duplicate drugs
 */
export function validateExampleSet(drugs: string[]): boolean {
  const normalized = drugs.map(d => d.toLowerCase().trim());
  const unique = new Set(normalized);
  return unique.size === drugs.length;
}
