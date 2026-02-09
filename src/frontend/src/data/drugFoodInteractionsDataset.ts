/**
 * Drug-Food Interactions Dataset - Substantially Expanded
 * Comprehensive built-in dataset with clinically oriented fields
 */

import { normalizeName } from '../utils/nameNormalization';

export interface DrugFoodInteraction {
  drug: string;
  food: string;
  interactionType: 'pharmacokinetic' | 'pharmacodynamic' | 'both';
  evidenceLevel: 'caseReport' | 'clinicalTrial' | 'metaAnalysis' | 'expertOpinion' | 'regulatoryAgency';
  description: string;
  clinicalEffects: string;
  toxicityRisk: 'low' | 'moderate' | 'high' | 'unknown';
  managementRecommendations: string;
  references: string[];
}

export const DRUG_FOOD_INTERACTIONS: DrugFoodInteraction[] = [
  // Warfarin interactions
  {
    drug: 'Warfarin',
    food: 'Vitamin K-rich foods',
    interactionType: 'pharmacodynamic',
    evidenceLevel: 'clinicalTrial',
    description: 'Vitamin K-rich foods (leafy greens, broccoli, Brussels sprouts) antagonize warfarin anticoagulant effect',
    clinicalEffects: 'Reduced INR, decreased anticoagulation, increased risk of thromboembolism',
    toxicityRisk: 'moderate',
    managementRecommendations: 'Maintain consistent vitamin K intake. Avoid sudden large changes in dietary vitamin K. Monitor INR regularly.',
    references: ['Holbrook AM et al. Arch Intern Med. 2005', 'MIMS India Drug Interactions Database'],
  },
  {
    drug: 'Warfarin',
    food: 'Cranberry juice',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'caseReport',
    description: 'Cranberry juice may inhibit CYP2C9 metabolism of warfarin, increasing anticoagulant effect',
    clinicalEffects: 'Elevated INR, increased bleeding risk, potential for major hemorrhage',
    toxicityRisk: 'high',
    managementRecommendations: 'Avoid cranberry juice or limit to small occasional amounts. Monitor INR closely if consumed.',
    references: ['Suvarna R et al. Am J Health Syst Pharm. 2003', 'FDA Drug Safety Communication'],
  },
  {
    drug: 'Warfarin',
    food: 'Grapefruit juice',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'Grapefruit juice inhibits CYP3A4 and may affect warfarin metabolism',
    clinicalEffects: 'Variable effect on INR, potential for increased bleeding or reduced efficacy',
    toxicityRisk: 'moderate',
    managementRecommendations: 'Avoid grapefruit juice. Use alternative citrus juices. Monitor INR if consumed.',
    references: ['Holbrook AM et al. Arch Intern Med. 2005'],
  },

  // Statins interactions
  {
    drug: 'Atorvastatin',
    food: 'Grapefruit juice',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'Grapefruit juice inhibits CYP3A4 metabolism of atorvastatin, increasing plasma levels',
    clinicalEffects: 'Increased risk of myopathy, rhabdomyolysis, elevated CK levels, muscle pain',
    toxicityRisk: 'high',
    managementRecommendations: 'Avoid grapefruit juice completely. Use alternative statins (pravastatin, rosuvastatin) if grapefruit consumption desired.',
    references: ['Bailey DG et al. Clin Pharmacol Ther. 2013', 'FDA Drug Safety Communication'],
  },
  {
    drug: 'Simvastatin',
    food: 'Grapefruit juice',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'Grapefruit juice markedly increases simvastatin bioavailability via CYP3A4 inhibition',
    clinicalEffects: 'Severe myopathy, rhabdomyolysis, acute renal failure, elevated transaminases',
    toxicityRisk: 'high',
    managementRecommendations: 'Strictly avoid grapefruit juice. Even small amounts can cause significant interaction. Switch to non-CYP3A4 metabolized statin if needed.',
    references: ['Lilja JJ et al. Clin Pharmacol Ther. 1998', 'MIMS India'],
  },

  // Calcium channel blockers
  {
    drug: 'Amlodipine',
    food: 'Grapefruit juice',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'Grapefruit juice inhibits CYP3A4 metabolism, increasing amlodipine levels',
    clinicalEffects: 'Enhanced hypotensive effect, dizziness, peripheral edema, headache, flushing',
    toxicityRisk: 'moderate',
    managementRecommendations: 'Avoid grapefruit juice or limit to small amounts. Monitor blood pressure. Adjust dose if needed.',
    references: ['Vincent J et al. Eur J Clin Pharmacol. 2000'],
  },

  // Antibiotics
  {
    drug: 'Ciprofloxacin',
    food: 'Dairy products',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'Calcium in dairy products chelates with ciprofloxacin, reducing absorption',
    clinicalEffects: 'Reduced antibiotic efficacy, treatment failure, prolonged infection',
    toxicityRisk: 'moderate',
    managementRecommendations: 'Take ciprofloxacin 2 hours before or 6 hours after dairy products. Avoid calcium-fortified foods during treatment.',
    references: ['Neuhofel AL et al. Clin Pharmacokinet. 2002', 'CDSCO Guidelines'],
  },
  {
    drug: 'Tetracycline',
    food: 'Dairy products',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'Calcium, magnesium, and iron form insoluble complexes with tetracycline',
    clinicalEffects: 'Markedly reduced absorption (up to 50-90%), antibiotic failure',
    toxicityRisk: 'moderate',
    managementRecommendations: 'Take on empty stomach 1 hour before or 2 hours after meals. Avoid dairy, antacids, and iron supplements.',
    references: ['Agwuh KN et al. J Antimicrob Chemother. 2006'],
  },
  {
    drug: 'Azithromycin',
    food: 'High-fat meal',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'High-fat meals delay and reduce azithromycin absorption',
    clinicalEffects: 'Delayed peak concentration, reduced bioavailability, potential treatment delay',
    toxicityRisk: 'low',
    managementRecommendations: 'Take on empty stomach or with light meal. Avoid high-fat meals within 2 hours of dosing.',
    references: ['Foulds G et al. J Antimicrob Chemother. 1990'],
  },

  // MAO Inhibitors
  {
    drug: 'Phenelzine',
    food: 'Tyramine-rich foods',
    interactionType: 'pharmacodynamic',
    evidenceLevel: 'clinicalTrial',
    description: 'MAO inhibitors prevent tyramine breakdown, leading to hypertensive crisis',
    clinicalEffects: 'Severe hypertension, hypertensive crisis, stroke, intracranial hemorrhage, death',
    toxicityRisk: 'high',
    managementRecommendations: 'Strict avoidance of aged cheese, cured meats, fermented foods, draft beer, soy sauce. Provide detailed dietary counseling.',
    references: ['Shulman KI et al. J Clin Psychopharmacol. 1989', 'FDA Black Box Warning'],
  },
  {
    drug: 'Linezolid',
    food: 'Tyramine-rich foods',
    interactionType: 'pharmacodynamic',
    evidenceLevel: 'caseReport',
    description: 'Linezolid has weak MAO inhibitor activity, can interact with tyramine',
    clinicalEffects: 'Hypertensive episodes, elevated blood pressure, headache',
    toxicityRisk: 'moderate',
    managementRecommendations: 'Limit tyramine intake. Avoid large amounts of aged cheese, cured meats, fermented foods. Monitor blood pressure.',
    references: ['Lawrence KR et al. Pharmacotherapy. 2006'],
  },

  // Antidiabetics
  {
    drug: 'Metformin',
    food: 'Alcohol',
    interactionType: 'pharmacodynamic',
    evidenceLevel: 'clinicalTrial',
    description: 'Alcohol increases risk of lactic acidosis with metformin',
    clinicalEffects: 'Lactic acidosis, hypoglycemia, nausea, vomiting, abdominal pain',
    toxicityRisk: 'high',
    managementRecommendations: 'Avoid excessive alcohol consumption. Limit to moderate amounts with food. Monitor for lactic acidosis symptoms.',
    references: ['Bailey CJ et al. Diabetes Care. 2016', 'CDSCO Safety Alert'],
  },
  {
    drug: 'Glimepiride',
    food: 'Alcohol',
    interactionType: 'pharmacodynamic',
    evidenceLevel: 'clinicalTrial',
    description: 'Alcohol potentiates hypoglycemic effect of sulfonylureas',
    clinicalEffects: 'Severe hypoglycemia, confusion, seizures, loss of consciousness',
    toxicityRisk: 'high',
    managementRecommendations: 'Avoid alcohol or consume only with food. Monitor blood glucose closely. Educate on hypoglycemia symptoms.',
    references: ['Scheen AJ. Diabetes Metab. 2014'],
  },

  // Thyroid medications
  {
    drug: 'Levothyroxine',
    food: 'Soy products',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'Soy products reduce levothyroxine absorption',
    clinicalEffects: 'Reduced thyroid hormone levels, hypothyroidism symptoms, increased TSH',
    toxicityRisk: 'moderate',
    managementRecommendations: 'Take levothyroxine on empty stomach 30-60 minutes before breakfast. Separate from soy products by 4 hours.',
    references: ['Bell DS et al. Thyroid. 2001'],
  },
  {
    drug: 'Levothyroxine',
    food: 'Coffee',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'Coffee reduces levothyroxine absorption',
    clinicalEffects: 'Decreased thyroid hormone levels, need for dose adjustment',
    toxicityRisk: 'low',
    managementRecommendations: 'Take levothyroxine with water only. Wait 30-60 minutes before coffee consumption.',
    references: ['Benvenga S et al. Thyroid. 2008'],
  },
  {
    drug: 'Levothyroxine',
    food: 'High-fiber foods',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'High-fiber diet reduces levothyroxine absorption',
    clinicalEffects: 'Reduced bioavailability, suboptimal thyroid control',
    toxicityRisk: 'low',
    managementRecommendations: 'Maintain consistent fiber intake. Take levothyroxine on empty stomach. Monitor TSH levels.',
    references: ['Liel Y et al. Ann Intern Med. 1996'],
  },

  // Bisphosphonates
  {
    drug: 'Alendronate',
    food: 'Food and beverages',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'Food markedly reduces alendronate absorption (by 60-90%)',
    clinicalEffects: 'Reduced bone mineral density improvement, treatment failure',
    toxicityRisk: 'low',
    managementRecommendations: 'Take on empty stomach with plain water only. Wait 30 minutes before eating. Remain upright for 30 minutes.',
    references: ['Gertz BJ et al. Clin Pharmacol Ther. 1995'],
  },

  // Immunosuppressants
  {
    drug: 'Cyclosporine',
    food: 'Grapefruit juice',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'Grapefruit juice increases cyclosporine levels via CYP3A4 inhibition',
    clinicalEffects: 'Increased nephrotoxicity, neurotoxicity, hypertension, tremor',
    toxicityRisk: 'high',
    managementRecommendations: 'Avoid grapefruit juice completely. Monitor cyclosporine levels closely. Watch for toxicity signs.',
    references: ['Ducharme MP et al. Clin Pharmacol Ther. 1995'],
  },

  // Antihypertensives
  {
    drug: 'Lisinopril',
    food: 'Potassium-rich foods',
    interactionType: 'pharmacodynamic',
    evidenceLevel: 'clinicalTrial',
    description: 'ACE inhibitors increase potassium retention; high dietary potassium adds to this effect',
    clinicalEffects: 'Hyperkalemia, cardiac arrhythmias, muscle weakness',
    toxicityRisk: 'moderate',
    managementRecommendations: 'Monitor potassium levels. Avoid excessive potassium-rich foods and salt substitutes. Check renal function.',
    references: ['Palmer BF. N Engl J Med. 2004'],
  },
  {
    drug: 'Losartan',
    food: 'Potassium-rich foods',
    interactionType: 'pharmacodynamic',
    evidenceLevel: 'clinicalTrial',
    description: 'ARBs increase potassium retention similar to ACE inhibitors',
    clinicalEffects: 'Hyperkalemia, cardiac conduction abnormalities',
    toxicityRisk: 'moderate',
    managementRecommendations: 'Monitor serum potassium. Limit high-potassium foods. Avoid potassium supplements and salt substitutes.',
    references: ['Juurlink DN et al. BMJ. 2004'],
  },

  // Bronchodilators
  {
    drug: 'Theophylline',
    food: 'High-protein diet',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'High-protein diet increases theophylline metabolism',
    clinicalEffects: 'Reduced theophylline levels, decreased bronchodilation, asthma exacerbation',
    toxicityRisk: 'moderate',
    managementRecommendations: 'Maintain consistent protein intake. Monitor theophylline levels. Adjust dose if diet changes significantly.',
    references: ['Kappas A et al. Clin Pharmacol Ther. 1976'],
  },
  {
    drug: 'Theophylline',
    food: 'Caffeine',
    interactionType: 'pharmacodynamic',
    evidenceLevel: 'expertOpinion',
    description: 'Caffeine has similar structure and effects to theophylline, additive toxicity',
    clinicalEffects: 'Increased CNS stimulation, tachycardia, tremor, insomnia, nausea',
    toxicityRisk: 'moderate',
    managementRecommendations: 'Limit caffeine intake. Monitor for theophylline toxicity symptoms. Reduce caffeine if side effects occur.',
    references: ['Weinberger M et al. J Allergy Clin Immunol. 1977'],
  },

  // Antidepressants
  {
    drug: 'Fluoxetine',
    food: 'Alcohol',
    interactionType: 'pharmacodynamic',
    evidenceLevel: 'expertOpinion',
    description: 'Alcohol may enhance CNS depressant effects and impair judgment',
    clinicalEffects: 'Increased sedation, impaired coordination, worsened depression',
    toxicityRisk: 'moderate',
    managementRecommendations: 'Avoid or limit alcohol consumption. Counsel on CNS effects. Monitor for increased side effects.',
    references: ['Ciraulo DA et al. J Clin Psychopharmacol. 1985'],
  },

  // Anticoagulants (additional)
  {
    drug: 'Rivaroxaban',
    food: 'High-fat meal',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'High-fat meals increase rivaroxaban absorption and bioavailability',
    clinicalEffects: 'Increased drug levels, enhanced anticoagulation, bleeding risk',
    toxicityRisk: 'moderate',
    managementRecommendations: 'Take 15mg and 20mg doses with food for optimal absorption. Lower doses can be taken without food.',
    references: ['Kubitza D et al. J Clin Pharmacol. 2013'],
  },

  // Analgesics
  {
    drug: 'Aspirin',
    food: 'Alcohol',
    interactionType: 'pharmacodynamic',
    evidenceLevel: 'clinicalTrial',
    description: 'Alcohol and aspirin both irritate gastric mucosa and increase bleeding risk',
    clinicalEffects: 'Increased GI bleeding, gastric ulceration, hemorrhage',
    toxicityRisk: 'high',
    managementRecommendations: 'Avoid alcohol, especially with chronic aspirin use. Monitor for GI bleeding signs. Consider gastroprotection.',
    references: ['Kaufman DW et al. Arch Intern Med. 2000'],
  },
  {
    drug: 'Ibuprofen',
    food: 'Alcohol',
    interactionType: 'pharmacodynamic',
    evidenceLevel: 'clinicalTrial',
    description: 'Combined use increases risk of GI bleeding and liver toxicity',
    clinicalEffects: 'GI bleeding, peptic ulcer, hepatotoxicity',
    toxicityRisk: 'high',
    managementRecommendations: 'Avoid concurrent use. Take NSAID with food. Use gastroprotective agents if needed.',
    references: ['Hernández-Díaz S et al. Arch Intern Med. 2000'],
  },

  // Antifungals
  {
    drug: 'Ketoconazole',
    food: 'Acidic beverages',
    interactionType: 'pharmacokinetic',
    evidenceLevel: 'clinicalTrial',
    description: 'Ketoconazole requires acidic environment for dissolution and absorption',
    clinicalEffects: 'Improved absorption with acidic drinks, reduced efficacy with antacids',
    toxicityRisk: 'low',
    managementRecommendations: 'Take with acidic beverage (cola, orange juice) if on acid suppressants. Avoid antacids within 2 hours.',
    references: ['Chin TW et al. Antimicrob Agents Chemother. 1995'],
  },
];

// Create normalized index for O(1) lookups
export function getNormalizedDrugFoodInteractions(): Map<string, DrugFoodInteraction[]> {
  const index = new Map<string, DrugFoodInteraction[]>();
  
  for (const interaction of DRUG_FOOD_INTERACTIONS) {
    const key = `${normalizeName(interaction.drug)}|${normalizeName(interaction.food)}`;
    const existing = index.get(key) || [];
    existing.push(interaction);
    index.set(key, existing);
  }
  
  return index;
}
