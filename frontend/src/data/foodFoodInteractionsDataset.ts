// Built-in Food-Food interaction dataset

import { normalizeName } from '../utils/nameNormalization';

export interface FoodFoodInteraction {
  foodA: string;
  foodB: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major';
  clinicalEffects: string;
  managementRecommendations: string;
  references: string[];
}

export const FOOD_FOOD_INTERACTIONS: FoodFoodInteraction[] = [
  {
    foodA: 'Grapefruit Juice',
    foodB: 'Orange Juice',
    description: 'Both citrus juices can affect drug metabolism, but orange juice has milder effects than grapefruit.',
    severity: 'minor',
    clinicalEffects: 'Minimal interaction between the two. Both may affect certain medications differently.',
    managementRecommendations: 'Generally safe to consume together. Consider timing with medications separately.',
    references: ['https://pubchem.ncbi.nlm.nih.gov/']
  },
  {
    foodA: 'Green Leafy Vegetables',
    foodB: 'Avocados',
    description: 'Both are high in vitamin K, which is important for blood clotting.',
    severity: 'minor',
    clinicalEffects: 'Additive vitamin K content. Important for patients on anticoagulants.',
    managementRecommendations: 'Maintain consistent intake of vitamin K-rich foods. Track total daily vitamin K consumption if on warfarin.',
    references: ['Circulation 2018;137:e67-e492']
  },
  {
    foodA: 'Bananas',
    foodB: 'Avocados',
    description: 'Both are high in potassium.',
    severity: 'minor',
    clinicalEffects: 'High combined potassium intake. Relevant for patients with kidney disease or on certain medications.',
    managementRecommendations: 'Monitor total potassium intake if on ACE inhibitors, ARBs, or have kidney disease. Generally safe for healthy individuals.',
    references: ['Am J Med 2018;131:643-650']
  },
  {
    foodA: 'Alcohol',
    foodB: 'Caffeine',
    description: 'Caffeine can mask alcohol\'s depressant effects, leading to increased alcohol consumption.',
    severity: 'moderate',
    clinicalEffects: 'Reduced perception of intoxication, potential for excessive alcohol intake, dehydration.',
    managementRecommendations: 'Be aware that caffeine does not reduce alcohol impairment. Limit combined intake. Stay hydrated.',
    references: ['J Stud Alcohol Drugs 2019;80:109-116']
  },
  {
    foodA: 'Alcohol',
    foodB: 'Grapefruit Juice',
    description: 'Both affect liver enzymes and can have additive effects on certain medications.',
    severity: 'moderate',
    clinicalEffects: 'Combined effects on drug metabolism, increased medication side effects.',
    managementRecommendations: 'Avoid combining if taking medications affected by either substance. Consult healthcare provider.',
    references: ['Clin Pharmacol Ther 2020;107:1015-1025']
  },
  {
    foodA: 'Green Tea',
    foodB: 'Milk',
    description: 'Milk proteins may bind to tea polyphenols, reducing antioxidant benefits.',
    severity: 'minor',
    clinicalEffects: 'Reduced absorption of beneficial tea catechins and antioxidants.',
    managementRecommendations: 'Drink green tea without milk for maximum health benefits. Or consume separately.',
    references: ['Eur J Clin Nutr 2007;61:1-9']
  },
  {
    foodA: 'Spinach',
    foodB: 'Cheese',
    description: 'Oxalates in spinach can bind to calcium in cheese, reducing calcium absorption.',
    severity: 'minor',
    clinicalEffects: 'Reduced calcium bioavailability from cheese.',
    managementRecommendations: 'Generally not clinically significant. Ensure adequate calcium intake from multiple sources.',
    references: ['Am J Clin Nutr 2008;88:88-96']
  },
  {
    foodA: 'Coffee',
    foodB: 'Milk',
    description: 'Milk proteins may slightly reduce coffee\'s antioxidant effects.',
    severity: 'minor',
    clinicalEffects: 'Minimal reduction in polyphenol absorption.',
    managementRecommendations: 'Not clinically significant. Enjoy coffee as preferred.',
    references: ['Free Radic Biol Med 2009;46:1043-1049']
  },
  {
    foodA: 'Soy Products',
    foodB: 'Green Tea',
    description: 'Both contain beneficial compounds that may have synergistic health effects.',
    severity: 'minor',
    clinicalEffects: 'Potential synergistic antioxidant and health benefits.',
    managementRecommendations: 'Beneficial combination. No restrictions needed.',
    references: ['J Nutr 2010;140:1355S-1362S']
  },
  {
    foodA: 'Turmeric',
    foodB: 'Black Pepper',
    description: 'Black pepper (piperine) enhances turmeric (curcumin) absorption by up to 2000%.',
    severity: 'minor',
    clinicalEffects: 'Dramatically increased curcumin bioavailability and effects.',
    managementRecommendations: 'Beneficial combination for maximizing turmeric benefits. Use together for therapeutic purposes.',
    references: ['Planta Med 1998;64:353-356']
  },
];

/**
 * Normalize the dataset for consistent lookups
 */
export function getNormalizedFoodFoodInteractions(): Map<string, FoodFoodInteraction[]> {
  const map = new Map<string, FoodFoodInteraction[]>();
  
  for (const interaction of FOOD_FOOD_INTERACTIONS) {
    // Create bidirectional keys (A+B and B+A)
    const normA = normalizeName(interaction.foodA);
    const normB = normalizeName(interaction.foodB);
    const key1 = normA < normB ? `${normA}|${normB}` : `${normB}|${normA}`;
    
    const existing = map.get(key1) || [];
    map.set(key1, [...existing, interaction]);
  }
  
  return map;
}
