// Comprehensive drug monograph dataset with pharmacokinetic parameters,
// side effects, contraindications, and special population guidance

export interface DrugMonograph {
  drugName: string; // Canonical name
  aliases?: string[]; // Alternative names/spellings
  pharmacokinetics: {
    cmax?: string; // Peak plasma concentration
    tmax?: string; // Time to peak concentration
    halfLife?: string; // Elimination half-life (t½)
    bioavailability?: string;
    proteinBinding?: string;
    metabolism?: string;
    elimination?: string;
  };
  sideEffects: string[];
  contraindications: string[];
  specialPopulations: {
    eligiblePopulations: string[];
    restrictedPopulations: string[]; // Pharmacovigilance special populations
  };
  references: string[]; // Source attribution
}

// Comprehensive monograph dataset
export const DRUG_MONOGRAPHS: DrugMonograph[] = [
  // Antibiotics
  {
    drugName: "Amoxicillin",
    aliases: ["Amoxycillin"],
    pharmacokinetics: {
      cmax: "5-10 mcg/mL (after 500mg oral dose)",
      tmax: "1-2 hours",
      halfLife: "1-1.5 hours",
      bioavailability: "70-90%",
      proteinBinding: "17-20%",
      metabolism: "Minimal hepatic metabolism",
      elimination: "Primarily renal (60-90% unchanged in urine)"
    },
    sideEffects: [
      "Diarrhea",
      "Nausea and vomiting",
      "Skin rash",
      "Hypersensitivity reactions",
      "Candidiasis (oral/vaginal)",
      "Pseudomembranous colitis (rare)"
    ],
    contraindications: [
      "Known hypersensitivity to penicillins or beta-lactam antibiotics",
      "History of severe allergic reaction to any beta-lactam antibiotic",
      "Infectious mononucleosis (risk of rash)"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults and children (all ages with dose adjustment)",
        "Pregnant women (FDA Category B - generally safe)",
        "Lactating mothers (compatible with breastfeeding, small amounts in milk)"
      ],
      restrictedPopulations: [
        "Patients with severe renal impairment (dose adjustment required)",
        "Patients with history of penicillin allergy",
        "Patients with phenylketonuria (some formulations contain phenylalanine)"
      ]
    },
    references: [
      "CDSCO Drug Information",
      "MIMS India - Amoxicillin Monograph",
      "FDA Prescribing Information",
      "British National Formulary (BNF)"
    ]
  },
  {
    drugName: "Azithromycin",
    aliases: ["Azithromycin Dihydrate"],
    pharmacokinetics: {
      cmax: "0.4-0.5 mcg/mL (after 500mg oral dose)",
      tmax: "2-3 hours",
      halfLife: "68 hours (terminal half-life)",
      bioavailability: "37-40%",
      proteinBinding: "7-50% (concentration dependent)",
      metabolism: "Hepatic (minimal CYP450 involvement)",
      elimination: "Primarily biliary (50% unchanged), renal (6%)"
    },
    sideEffects: [
      "Gastrointestinal disturbances (nausea, diarrhea, abdominal pain)",
      "Headache",
      "Dizziness",
      "QT prolongation (rare but serious)",
      "Hepatotoxicity (rare)",
      "Hearing impairment (reversible, rare)"
    ],
    contraindications: [
      "Hypersensitivity to azithromycin or other macrolides",
      "History of cholestatic jaundice/hepatic dysfunction with prior azithromycin use",
      "Concurrent use with ergot derivatives"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults and children over 6 months",
        "Pregnant women (FDA Category B - use if clearly needed)",
        "Elderly patients (with caution)"
      ],
      restrictedPopulations: [
        "Patients with prolonged QT interval or risk factors for QT prolongation",
        "Severe hepatic impairment",
        "Lactating mothers (use with caution, excreted in breast milk)",
        "Patients with myasthenia gravis (may exacerbate symptoms)"
      ]
    },
    references: [
      "MIMS India - Azithromycin",
      "FDA Label - Azithromycin",
      "European Medicines Agency (EMA) Assessment Report",
      "WHO Essential Medicines List"
    ]
  },
  {
    drugName: "Cefuroxime",
    aliases: ["Cefuroxime Axetil"],
    pharmacokinetics: {
      cmax: "4-7 mcg/mL (after 500mg oral dose)",
      tmax: "2-3 hours",
      halfLife: "1-2 hours",
      bioavailability: "37-52% (oral), 100% (IV)",
      proteinBinding: "33-50%",
      metabolism: "Not metabolized",
      elimination: "Renal (66-100% unchanged)"
    },
    sideEffects: [
      "Diarrhea",
      "Nausea",
      "Hypersensitivity reactions",
      "Transient elevation of liver enzymes",
      "Thrombophlebitis (IV administration)",
      "Positive Coombs test"
    ],
    contraindications: [
      "Hypersensitivity to cephalosporins",
      "History of severe hypersensitivity to penicillins (cross-reactivity risk)"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults and children (3 months and older)",
        "Pregnant women (FDA Category B)",
        "Lactating mothers (small amounts in milk, generally compatible)"
      ],
      restrictedPopulations: [
        "Severe renal impairment (dose adjustment required)",
        "Patients with history of gastrointestinal disease, especially colitis",
        "Neonates under 3 months"
      ]
    },
    references: [
      "CDSCO Approved Drug List",
      "MIMS India - Cefuroxime",
      "FDA Prescribing Information",
      "Pediatric Dosage Handbook"
    ]
  },
  {
    drugName: "Doxycycline",
    aliases: ["Doxycycline Hyclate", "Doxycycline Monohydrate"],
    pharmacokinetics: {
      cmax: "2.6-3 mcg/mL (after 200mg oral dose)",
      tmax: "2-4 hours",
      halfLife: "15-25 hours",
      bioavailability: "90-100%",
      proteinBinding: "80-95%",
      metabolism: "Minimal hepatic metabolism",
      elimination: "Fecal (20-40%), renal (23-40%)"
    },
    sideEffects: [
      "Photosensitivity",
      "Gastrointestinal upset (nausea, vomiting, diarrhea)",
      "Esophageal irritation/ulceration",
      "Tooth discoloration (in children)",
      "Hepatotoxicity (rare)",
      "Intracranial hypertension (rare)"
    ],
    contraindications: [
      "Hypersensitivity to tetracyclines",
      "Children under 8 years (risk of permanent tooth discoloration)",
      "Pregnancy (FDA Category D - risk of fetal harm)",
      "Severe hepatic impairment"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults",
        "Children over 8 years (with caution for weight-based dosing)"
      ],
      restrictedPopulations: [
        "Pregnant women (contraindicated - risk of fetal skeletal development issues)",
        "Lactating mothers (excreted in milk, avoid use)",
        "Children under 8 years (permanent tooth discoloration and enamel hypoplasia)",
        "Patients with myasthenia gravis (may exacerbate muscle weakness)"
      ]
    },
    references: [
      "CDSCO Guidelines",
      "MIMS India - Doxycycline",
      "FDA Prescribing Information",
      "WHO Model Formulary"
    ]
  },
  // Painkillers/NSAIDs
  {
    drugName: "Paracetamol",
    aliases: ["Acetaminophen", "APAP"],
    pharmacokinetics: {
      cmax: "10-20 mcg/mL (after 1000mg oral dose)",
      tmax: "0.5-2 hours",
      halfLife: "2-3 hours",
      bioavailability: "70-90%",
      proteinBinding: "10-25%",
      metabolism: "Hepatic (glucuronidation, sulfation, CYP2E1)",
      elimination: "Renal (90-100% as metabolites)"
    },
    sideEffects: [
      "Rare at therapeutic doses",
      "Hepatotoxicity (overdose)",
      "Skin rash (rare)",
      "Blood dyscrasias (very rare)",
      "Acute renal tubular necrosis (overdose)"
    ],
    contraindications: [
      "Hypersensitivity to paracetamol",
      "Severe hepatic impairment",
      "Acute hepatitis"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults and children (all ages with appropriate dosing)",
        "Pregnant women (considered safe at therapeutic doses)",
        "Lactating mothers (compatible with breastfeeding)",
        "Elderly patients (preferred NSAID alternative)"
      ],
      restrictedPopulations: [
        "Patients with chronic liver disease (dose reduction required)",
        "Chronic alcohol users (increased hepatotoxicity risk)",
        "Severe renal impairment (dose adjustment required)",
        "Patients with G6PD deficiency (risk of hemolysis at high doses)"
      ]
    },
    references: [
      "MIMS India - Paracetamol",
      "WHO Essential Medicines List",
      "FDA Prescribing Information",
      "British National Formulary (BNF)"
    ]
  },
  {
    drugName: "Ibuprofen",
    aliases: [],
    pharmacokinetics: {
      cmax: "15-30 mcg/mL (after 400mg oral dose)",
      tmax: "1-2 hours",
      halfLife: "2-4 hours",
      bioavailability: "80-100%",
      proteinBinding: ">99%",
      metabolism: "Hepatic (CYP2C9, CYP2C8)",
      elimination: "Renal (90% as metabolites)"
    },
    sideEffects: [
      "Gastrointestinal upset (dyspepsia, nausea, abdominal pain)",
      "Peptic ulceration and bleeding",
      "Cardiovascular events (MI, stroke at high doses)",
      "Renal impairment",
      "Hypersensitivity reactions (bronchospasm, angioedema)",
      "Fluid retention and edema"
    ],
    contraindications: [
      "Active peptic ulcer disease or GI bleeding",
      "Severe heart failure",
      "Severe hepatic or renal impairment",
      "Third trimester of pregnancy",
      "Hypersensitivity to NSAIDs or aspirin (risk of cross-reactivity)"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults and children over 6 months (with weight-based dosing)",
        "Short-term use in first and second trimester of pregnancy (with caution)"
      ],
      restrictedPopulations: [
        "Third trimester pregnancy (risk of premature closure of ductus arteriosus)",
        "Lactating mothers (small amounts in milk, short-term use acceptable)",
        "Elderly patients (increased risk of GI and cardiovascular events)",
        "Patients with hypertension, heart failure, or cardiovascular disease",
        "Patients with renal impairment",
        "Patients with history of GI ulceration or bleeding"
      ]
    },
    references: [
      "CDSCO Drug Information",
      "MIMS India - Ibuprofen",
      "FDA Prescribing Information",
      "European Medicines Agency (EMA)"
    ]
  },
  {
    drugName: "Aspirin",
    aliases: ["Acetylsalicylic Acid", "ASA"],
    pharmacokinetics: {
      cmax: "30-40 mcg/mL (after 650mg oral dose)",
      tmax: "0.5-2 hours",
      halfLife: "15-20 minutes (aspirin), 2-3 hours (salicylate)",
      bioavailability: "50-75% (dose-dependent)",
      proteinBinding: "80-90%",
      metabolism: "Hepatic (hydrolysis to salicylic acid)",
      elimination: "Renal (as salicylic acid and metabolites)"
    },
    sideEffects: [
      "Gastrointestinal irritation and bleeding",
      "Tinnitus (high doses)",
      "Hypersensitivity reactions (bronchospasm, urticaria)",
      "Reye's syndrome (in children with viral infections)",
      "Prolonged bleeding time",
      "Salicylism (chronic toxicity)"
    ],
    contraindications: [
      "Active peptic ulcer disease",
      "Hemophilia or bleeding disorders",
      "Children under 16 years with viral infections (Reye's syndrome risk)",
      "Third trimester of pregnancy",
      "Severe renal or hepatic impairment",
      "Hypersensitivity to salicylates or NSAIDs"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults for cardiovascular prophylaxis (low dose)",
        "Adults for pain/fever (short-term use)"
      ],
      restrictedPopulations: [
        "Children and adolescents under 16 years (contraindicated with viral infections due to Reye's syndrome risk)",
        "Pregnant women (especially third trimester - risk of bleeding and premature closure of ductus arteriosus)",
        "Lactating mothers (excreted in milk, avoid high doses)",
        "Elderly patients (increased bleeding risk)",
        "Patients with asthma (risk of bronchospasm)",
        "Patients on anticoagulants (increased bleeding risk)"
      ]
    },
    references: [
      "MIMS India - Aspirin",
      "FDA Prescribing Information",
      "WHO Essential Medicines List",
      "American Heart Association Guidelines"
    ]
  },
  // Cardiovascular Drugs
  {
    drugName: "Metformin",
    aliases: ["Metformin Hydrochloride"],
    pharmacokinetics: {
      cmax: "1-2 mcg/mL (after 500mg oral dose)",
      tmax: "2-3 hours",
      halfLife: "4-9 hours",
      bioavailability: "50-60%",
      proteinBinding: "Negligible",
      metabolism: "Not metabolized",
      elimination: "Renal (90% unchanged)"
    },
    sideEffects: [
      "Gastrointestinal disturbances (diarrhea, nausea, abdominal pain)",
      "Metallic taste",
      "Vitamin B12 deficiency (long-term use)",
      "Lactic acidosis (rare but serious)",
      "Hypoglycemia (when combined with other antidiabetic agents)"
    ],
    contraindications: [
      "Severe renal impairment (eGFR <30 mL/min/1.73m²)",
      "Acute or chronic metabolic acidosis",
      "Diabetic ketoacidosis",
      "Severe hepatic impairment",
      "Conditions predisposing to lactic acidosis (heart failure, respiratory failure, sepsis)"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults with type 2 diabetes mellitus",
        "Children over 10 years with type 2 diabetes (with caution)"
      ],
      restrictedPopulations: [
        "Pregnant women (insulin preferred for diabetes management)",
        "Lactating mothers (excreted in milk, use with caution)",
        "Elderly patients (increased risk of lactic acidosis, renal function monitoring required)",
        "Patients with renal impairment (dose adjustment or contraindication based on eGFR)",
        "Patients undergoing radiological studies with iodinated contrast (temporary discontinuation required)"
      ]
    },
    references: [
      "CDSCO Guidelines for Diabetes Management",
      "MIMS India - Metformin",
      "FDA Prescribing Information",
      "American Diabetes Association Standards of Care"
    ]
  },
  {
    drugName: "Lisinopril",
    aliases: [],
    pharmacokinetics: {
      cmax: "50-90 ng/mL (after 10mg oral dose)",
      tmax: "6-8 hours",
      halfLife: "12 hours",
      bioavailability: "25-30%",
      proteinBinding: "Minimal",
      metabolism: "Not metabolized",
      elimination: "Renal (100% unchanged)"
    },
    sideEffects: [
      "Dry cough (common)",
      "Hypotension (especially first dose)",
      "Dizziness and headache",
      "Hyperkalemia",
      "Angioedema (rare but serious)",
      "Renal impairment",
      "Fatigue"
    ],
    contraindications: [
      "Hypersensitivity to ACE inhibitors",
      "History of angioedema related to ACE inhibitor use",
      "Pregnancy (FDA Category D - fetal toxicity)",
      "Bilateral renal artery stenosis",
      "Concurrent use with aliskiren in diabetic patients"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults with hypertension, heart failure, or post-MI",
        "Diabetic nephropathy patients"
      ],
      restrictedPopulations: [
        "Pregnant women (contraindicated - risk of fetal renal dysfunction, oligohydramnios, and death)",
        "Lactating mothers (limited data, use with caution)",
        "Patients with severe renal impairment (dose adjustment required)",
        "Elderly patients (start with lower doses)",
        "Patients with aortic stenosis or hypertrophic cardiomyopathy",
        "Patients on potassium-sparing diuretics or potassium supplements (hyperkalemia risk)"
      ]
    },
    references: [
      "MIMS India - Lisinopril",
      "FDA Prescribing Information",
      "European Society of Cardiology Guidelines",
      "JNC 8 Hypertension Guidelines"
    ]
  },
  {
    drugName: "Warfarin",
    aliases: ["Warfarin Sodium"],
    pharmacokinetics: {
      cmax: "1-3 mcg/mL (after 5mg oral dose)",
      tmax: "2-8 hours",
      halfLife: "36-42 hours",
      bioavailability: "Nearly 100%",
      proteinBinding: "99%",
      metabolism: "Hepatic (CYP2C9, CYP3A4, CYP1A2)",
      elimination: "Renal (as metabolites)"
    },
    sideEffects: [
      "Bleeding (major and minor)",
      "Skin necrosis (rare)",
      "Purple toe syndrome (rare)",
      "Alopecia",
      "Gastrointestinal disturbances",
      "Hypersensitivity reactions"
    ],
    contraindications: [
      "Active bleeding",
      "Severe hepatic or renal disease",
      "Pregnancy (FDA Category X - fetal warfarin syndrome)",
      "Recent or planned surgery",
      "Uncontrolled hypertension",
      "History of hemorrhagic stroke"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults requiring anticoagulation (atrial fibrillation, DVT/PE, mechanical heart valves)"
      ],
      restrictedPopulations: [
        "Pregnant women (contraindicated - teratogenic, especially first trimester)",
        "Lactating mothers (small amounts in milk, monitor infant)",
        "Elderly patients (increased bleeding risk, lower doses often required)",
        "Patients with CYP2C9 or VKORC1 genetic variants (dose adjustment required)",
        "Patients with hepatic or renal impairment",
        "Patients at high risk of falls or trauma"
      ]
    },
    references: [
      "MIMS India - Warfarin",
      "FDA Prescribing Information",
      "American College of Chest Physicians Antithrombotic Guidelines",
      "European Heart Rhythm Association Guidelines"
    ]
  },
  // Additional Common Drugs
  {
    drugName: "Omeprazole",
    aliases: [],
    pharmacokinetics: {
      cmax: "0.6-3.6 mcg/mL (after 40mg oral dose)",
      tmax: "0.5-3.5 hours",
      halfLife: "0.5-1 hour",
      bioavailability: "30-40%",
      proteinBinding: "95%",
      metabolism: "Hepatic (CYP2C19, CYP3A4)",
      elimination: "Renal (77%), fecal (18%)"
    },
    sideEffects: [
      "Headache",
      "Diarrhea or constipation",
      "Abdominal pain",
      "Nausea",
      "Vitamin B12 deficiency (long-term use)",
      "Increased risk of fractures (long-term use)",
      "Clostridium difficile infection (long-term use)"
    ],
    contraindications: [
      "Hypersensitivity to omeprazole or other proton pump inhibitors",
      "Concurrent use with rilpivirine"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults with GERD, peptic ulcer disease, or Zollinger-Ellison syndrome",
        "Children over 1 year (for specific indications)"
      ],
      restrictedPopulations: [
        "Pregnant women (FDA Category C - use if benefit outweighs risk)",
        "Lactating mothers (excreted in milk, use with caution)",
        "Patients with severe hepatic impairment (dose reduction required)",
        "Elderly patients (increased risk of fractures with long-term use)",
        "Patients with osteoporosis risk factors"
      ]
    },
    references: [
      "MIMS India - Omeprazole",
      "FDA Prescribing Information",
      "American Gastroenterological Association Guidelines",
      "European Medicines Agency Assessment"
    ]
  },
  {
    drugName: "Atorvastatin",
    aliases: ["Atorvastatin Calcium"],
    pharmacokinetics: {
      cmax: "8-37 ng/mL (after 40mg oral dose)",
      tmax: "1-2 hours",
      halfLife: "14 hours",
      bioavailability: "12-14%",
      proteinBinding: ">98%",
      metabolism: "Hepatic (CYP3A4)",
      elimination: "Biliary/fecal (70%), renal (<2%)"
    },
    sideEffects: [
      "Myalgia and muscle pain",
      "Elevated liver enzymes",
      "Headache",
      "Gastrointestinal disturbances",
      "Rhabdomyolysis (rare but serious)",
      "Diabetes mellitus (increased risk)"
    ],
    contraindications: [
      "Active liver disease or unexplained persistent elevations of serum transaminases",
      "Pregnancy (FDA Category X)",
      "Lactation",
      "Hypersensitivity to atorvastatin"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults with hypercholesterolemia or cardiovascular disease"
      ],
      restrictedPopulations: [
        "Pregnant women (contraindicated - risk of fetal harm)",
        "Lactating mothers (contraindicated - excreted in milk)",
        "Patients with active liver disease",
        "Elderly patients (increased risk of myopathy)",
        "Patients on CYP3A4 inhibitors (increased statin levels, myopathy risk)",
        "Patients with renal impairment (use with caution)"
      ]
    },
    references: [
      "MIMS India - Atorvastatin",
      "FDA Prescribing Information",
      "ACC/AHA Cholesterol Guidelines",
      "European Society of Cardiology Guidelines"
    ]
  },
  {
    drugName: "Amlodipine",
    aliases: ["Amlodipine Besylate"],
    pharmacokinetics: {
      cmax: "5-12 ng/mL (after 10mg oral dose)",
      tmax: "6-12 hours",
      halfLife: "30-50 hours",
      bioavailability: "64-90%",
      proteinBinding: "93-98%",
      metabolism: "Hepatic (CYP3A4)",
      elimination: "Renal (60% as metabolites)"
    },
    sideEffects: [
      "Peripheral edema",
      "Headache",
      "Flushing",
      "Dizziness",
      "Palpitations",
      "Fatigue",
      "Gingival hyperplasia (rare)"
    ],
    contraindications: [
      "Hypersensitivity to amlodipine or other dihydropyridines",
      "Severe hypotension",
      "Cardiogenic shock"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults with hypertension or angina",
        "Elderly patients (with dose adjustment)"
      ],
      restrictedPopulations: [
        "Pregnant women (FDA Category C - use if benefit outweighs risk)",
        "Lactating mothers (excreted in milk, use with caution)",
        "Patients with severe hepatic impairment (lower starting dose)",
        "Patients with severe aortic stenosis",
        "Elderly patients (start with lower doses due to increased exposure)"
      ]
    },
    references: [
      "MIMS India - Amlodipine",
      "FDA Prescribing Information",
      "JNC 8 Hypertension Guidelines",
      "European Society of Hypertension Guidelines"
    ]
  },
  {
    drugName: "Levothyroxine",
    aliases: ["L-Thyroxine", "T4"],
    pharmacokinetics: {
      cmax: "Variable (depends on baseline thyroid status)",
      tmax: "2-4 hours",
      halfLife: "6-7 days",
      bioavailability: "40-80% (affected by food)",
      proteinBinding: ">99%",
      metabolism: "Hepatic and peripheral (deiodination to T3)",
      elimination: "Renal and fecal"
    },
    sideEffects: [
      "Symptoms of hyperthyroidism (if overdosed): palpitations, tremor, anxiety, weight loss",
      "Cardiac arrhythmias (excessive doses)",
      "Osteoporosis (long-term excessive doses)",
      "Hair loss (transient, especially in children)"
    ],
    contraindications: [
      "Untreated thyrotoxicosis",
      "Acute myocardial infarction",
      "Uncorrected adrenal insufficiency"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults and children with hypothyroidism",
        "Pregnant women (essential for fetal development, dose often increased)",
        "Lactating mothers (compatible with breastfeeding)"
      ],
      restrictedPopulations: [
        "Elderly patients (start with lower doses, increased cardiovascular risk)",
        "Patients with cardiovascular disease (start low, titrate slowly)",
        "Patients with diabetes mellitus (may increase insulin requirements)",
        "Patients with adrenal insufficiency (treat adrenal insufficiency first)"
      ]
    },
    references: [
      "MIMS India - Levothyroxine",
      "FDA Prescribing Information",
      "American Thyroid Association Guidelines",
      "European Thyroid Association Guidelines"
    ]
  },
  {
    drugName: "Prednisone",
    aliases: [],
    pharmacokinetics: {
      cmax: "Variable (prodrug converted to prednisolone)",
      tmax: "1-2 hours",
      halfLife: "2-3 hours (prednisolone)",
      bioavailability: "80-90%",
      proteinBinding: "70-90%",
      metabolism: "Hepatic (converted to prednisolone)",
      elimination: "Renal"
    },
    sideEffects: [
      "Immunosuppression and increased infection risk",
      "Hyperglycemia and diabetes",
      "Osteoporosis",
      "Weight gain and fluid retention",
      "Mood changes and insomnia",
      "Cushing's syndrome (long-term use)",
      "Adrenal suppression",
      "Peptic ulceration"
    ],
    contraindications: [
      "Systemic fungal infections",
      "Hypersensitivity to prednisone",
      "Live virus vaccination (during immunosuppressive doses)"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults and children for various inflammatory and autoimmune conditions"
      ],
      restrictedPopulations: [
        "Pregnant women (FDA Category C - use if benefit outweighs risk, risk of cleft palate in first trimester)",
        "Lactating mothers (excreted in milk, monitor infant)",
        "Children (growth suppression with long-term use)",
        "Elderly patients (increased risk of osteoporosis, diabetes, hypertension)",
        "Patients with diabetes (worsens glycemic control)",
        "Patients with osteoporosis or fracture risk",
        "Patients with peptic ulcer disease",
        "Patients with psychiatric disorders"
      ]
    },
    references: [
      "MIMS India - Prednisone",
      "FDA Prescribing Information",
      "American College of Rheumatology Guidelines",
      "British Society for Rheumatology Guidelines"
    ]
  },
  {
    drugName: "Ciprofloxacin",
    aliases: ["Ciprofloxacin Hydrochloride"],
    pharmacokinetics: {
      cmax: "2-4 mcg/mL (after 500mg oral dose)",
      tmax: "1-2 hours",
      halfLife: "4-6 hours",
      bioavailability: "70-80%",
      proteinBinding: "20-40%",
      metabolism: "Hepatic (partial)",
      elimination: "Renal (40-50% unchanged), fecal (20-35%)"
    },
    sideEffects: [
      "Gastrointestinal disturbances (nausea, diarrhea)",
      "Tendinitis and tendon rupture (especially Achilles tendon)",
      "QT prolongation",
      "Central nervous system effects (headache, dizziness, seizures)",
      "Photosensitivity",
      "Peripheral neuropathy (rare)"
    ],
    contraindications: [
      "Hypersensitivity to fluoroquinolones",
      "Concurrent use with tizanidine",
      "Children and adolescents (except specific indications)",
      "Pregnancy and lactation"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults with bacterial infections (UTI, respiratory, GI, skin)"
      ],
      restrictedPopulations: [
        "Pregnant women (FDA Category C - avoid use, risk of arthropathy)",
        "Lactating mothers (excreted in milk, avoid use)",
        "Children and adolescents under 18 years (risk of arthropathy and cartilage damage, use only for specific indications)",
        "Elderly patients (increased risk of tendon rupture, especially if on corticosteroids)",
        "Patients with history of tendon disorders",
        "Patients with myasthenia gravis (may exacerbate muscle weakness)",
        "Patients with seizure disorders or CNS conditions"
      ]
    },
    references: [
      "CDSCO Drug Information",
      "MIMS India - Ciprofloxacin",
      "FDA Prescribing Information with Black Box Warning",
      "European Medicines Agency Safety Review"
    ]
  },
  {
    drugName: "Furosemide",
    aliases: ["Frusemide"],
    pharmacokinetics: {
      cmax: "1-2 mcg/mL (after 40mg oral dose)",
      tmax: "1-2 hours",
      halfLife: "1.5-2 hours",
      bioavailability: "60-70%",
      proteinBinding: ">98%",
      metabolism: "Hepatic (minimal)",
      elimination: "Renal (65% unchanged), biliary"
    },
    sideEffects: [
      "Electrolyte imbalances (hypokalemia, hyponatremia, hypomagnesemia)",
      "Dehydration and hypotension",
      "Ototoxicity (especially with rapid IV administration or high doses)",
      "Hyperuricemia and gout",
      "Hyperglycemia",
      "Photosensitivity"
    ],
    contraindications: [
      "Anuria",
      "Severe electrolyte depletion",
      "Hepatic coma",
      "Hypersensitivity to furosemide or sulfonamides"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults with edema (heart failure, renal disease, hepatic cirrhosis) or hypertension"
      ],
      restrictedPopulations: [
        "Pregnant women (FDA Category C - use if benefit outweighs risk)",
        "Lactating mothers (may suppress lactation, excreted in milk)",
        "Neonates and premature infants (increased risk of nephrocalcinosis)",
        "Elderly patients (increased risk of dehydration and electrolyte imbalance)",
        "Patients with severe renal impairment (higher doses may be needed)",
        "Patients with hepatic cirrhosis (risk of hepatic encephalopathy)",
        "Patients with diabetes (may worsen glycemic control)"
      ]
    },
    references: [
      "MIMS India - Furosemide",
      "FDA Prescribing Information",
      "Heart Failure Society of America Guidelines",
      "European Society of Cardiology Guidelines"
    ]
  },
  {
    drugName: "Albuterol",
    aliases: ["Salbutamol"],
    pharmacokinetics: {
      cmax: "Variable (inhalation), 18 ng/mL (after 4mg oral dose)",
      tmax: "2-3 hours (oral)",
      halfLife: "4-6 hours",
      bioavailability: "50% (oral), higher (inhalation)",
      proteinBinding: "10%",
      metabolism: "Hepatic (sulfation)",
      elimination: "Renal (as metabolites)"
    },
    sideEffects: [
      "Tremor",
      "Tachycardia and palpitations",
      "Headache",
      "Nervousness",
      "Hypokalemia (high doses)",
      "Paradoxical bronchospasm (rare)"
    ],
    contraindications: [
      "Hypersensitivity to albuterol or any component"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults and children (over 2 years for inhalation) with asthma or COPD",
        "Pregnant women (FDA Category C - generally considered safe for asthma management)",
        "Lactating mothers (compatible with breastfeeding)"
      ],
      restrictedPopulations: [
        "Patients with cardiovascular disorders (use with caution, may cause tachycardia)",
        "Patients with hyperthyroidism or diabetes (may worsen conditions)",
        "Patients with hypokalemia (monitor potassium levels)",
        "Elderly patients (increased sensitivity to beta-agonist effects)"
      ]
    },
    references: [
      "MIMS India - Salbutamol",
      "FDA Prescribing Information",
      "Global Initiative for Asthma (GINA) Guidelines",
      "British Thoracic Society Guidelines"
    ]
  },
  {
    drugName: "Losartan",
    aliases: ["Losartan Potassium"],
    pharmacokinetics: {
      cmax: "200-400 ng/mL (after 50mg oral dose)",
      tmax: "1 hour (losartan), 3-4 hours (active metabolite)",
      halfLife: "2 hours (losartan), 6-9 hours (active metabolite)",
      bioavailability: "33%",
      proteinBinding: ">98%",
      metabolism: "Hepatic (CYP2C9, CYP3A4 to active metabolite)",
      elimination: "Renal (35%), biliary/fecal (60%)"
    },
    sideEffects: [
      "Dizziness",
      "Hyperkalemia",
      "Hypotension",
      "Fatigue",
      "Renal impairment",
      "Angioedema (rare)"
    ],
    contraindications: [
      "Hypersensitivity to losartan",
      "Pregnancy (FDA Category D - fetal toxicity)",
      "Concurrent use with aliskiren in diabetic patients"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults with hypertension, heart failure, or diabetic nephropathy"
      ],
      restrictedPopulations: [
        "Pregnant women (contraindicated - risk of fetal renal dysfunction and death)",
        "Lactating mothers (unknown if excreted in milk, use with caution)",
        "Patients with severe hepatic impairment (dose reduction required)",
        "Patients with severe renal impairment or bilateral renal artery stenosis",
        "Elderly patients (may have increased sensitivity)",
        "Patients on potassium supplements or potassium-sparing diuretics (hyperkalemia risk)"
      ]
    },
    references: [
      "MIMS India - Losartan",
      "FDA Prescribing Information",
      "JNC 8 Hypertension Guidelines",
      "European Society of Cardiology Guidelines"
    ]
  },
  {
    drugName: "Gabapentin",
    aliases: [],
    pharmacokinetics: {
      cmax: "2-3 mcg/mL (after 300mg oral dose)",
      tmax: "2-3 hours",
      halfLife: "5-7 hours",
      bioavailability: "60% (dose-dependent, decreases with higher doses)",
      proteinBinding: "<3%",
      metabolism: "Not metabolized",
      elimination: "Renal (100% unchanged)"
    },
    sideEffects: [
      "Somnolence and dizziness",
      "Ataxia",
      "Fatigue",
      "Peripheral edema",
      "Weight gain",
      "Behavioral changes (children)"
    ],
    contraindications: [
      "Hypersensitivity to gabapentin"
    ],
    specialPopulations: {
      eligiblePopulations: [
        "Adults and children (over 3 years) with epilepsy or neuropathic pain"
      ],
      restrictedPopulations: [
        "Pregnant women (FDA Category C - use if benefit outweighs risk)",
        "Lactating mothers (excreted in milk, use with caution)",
        "Patients with renal impairment (dose adjustment required)",
        "Elderly patients (increased risk of CNS side effects, dose adjustment for renal function)",
        "Patients with history of substance abuse (potential for misuse)"
      ]
    },
    references: [
      "MIMS India - Gabapentin",
      "FDA Prescribing Information",
      "American Academy of Neurology Guidelines",
      "European Federation of Neurological Societies Guidelines"
    ]
  }
];

// Build normalized lookup index for O(1) access
export function buildMonographIndex(): Map<string, DrugMonograph> {
  const index = new Map<string, DrugMonograph>();
  
  for (const monograph of DRUG_MONOGRAPHS) {
    // Normalize and index canonical name
    const normalizedName = monograph.drugName.toLowerCase().replace(/[\s\-_.()]/g, '');
    index.set(normalizedName, monograph);
    
    // Index all aliases
    if (monograph.aliases) {
      for (const alias of monograph.aliases) {
        const normalizedAlias = alias.toLowerCase().replace(/[\s\-_.()]/g, '');
        // Only add if not already present (canonical name takes precedence)
        if (!index.has(normalizedAlias)) {
          index.set(normalizedAlias, monograph);
        }
      }
    }
  }
  
  return index;
}
