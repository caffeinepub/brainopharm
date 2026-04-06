// Service for fetching and managing drug-drug interaction database from PubChem, FDA, and WHO
const CACHE_KEY = 'drugDrugInteractionDatabase';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // Daily sync at 2 AM IST

interface DrugInfo {
  name: string;
  genericName?: string;
  brandNames?: string[];
  cmax?: string;
  tmax?: string;
  halfLife?: string;
  eliminationRate?: string;
  sideEffects?: string[];
  interactions?: DrugInteractionDetail[];
  uses?: string;
  abusePotential?: string;
  combinationForms?: string[];
  source: 'PubChem' | 'FDA' | 'WHO' | 'Multiple';
  lastUpdated?: Date;
}

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

interface DatabaseData {
  drugs: DrugInfo[];
  lastUpdated: Date;
  syncStatus: {
    pubchem: boolean;
    fda: boolean;
    who: boolean;
  };
}

class DrugDrugInteractionService {
  private syncInProgress = false;
  private syncProgressCallbacks: ((progress: number, source: string) => void)[] = [];

  // Get cached data
  getCachedData(): DrugInfo[] {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return this.getDefaultDrugs();

      const data: DatabaseData = JSON.parse(cached);
      const cacheAge = Date.now() - new Date(data.lastUpdated).getTime();

      if (cacheAge > CACHE_DURATION) {
        return this.getDefaultDrugs();
      }

      return data.drugs;
    } catch (error) {
      console.error('Error reading cached drug database:', error);
      return this.getDefaultDrugs();
    }
  }

  // Get default drugs with comprehensive interaction data
  private getDefaultDrugs(): DrugInfo[] {
    return [
      {
        name: 'Warfarin',
        genericName: 'Warfarin Sodium',
        brandNames: ['Coumadin', 'Jantoven'],
        cmax: '1-3 μg/mL',
        tmax: '2-4 hours',
        halfLife: '20-60 hours',
        eliminationRate: '0.012-0.035 h⁻¹',
        sideEffects: ['Bleeding', 'Bruising', 'Skin necrosis (rare)', 'Purple toe syndrome'],
        uses: 'Anticoagulation for atrial fibrillation, DVT/PE prevention and treatment, mechanical heart valves',
        abusePotential: 'None - No abuse potential',
        combinationForms: [],
        source: 'Multiple',
        interactions: [
          {
            drugA: 'Warfarin',
            drugB: 'Aspirin',
            mechanism: 'Pharmacodynamic - Additive anticoagulant and antiplatelet effects',
            severity: 'major',
            description: 'Concurrent use of warfarin and aspirin significantly increases bleeding risk due to additive antiplatelet and anticoagulant effects. Both drugs affect hemostasis through different mechanisms, creating a synergistic effect.',
            clinicalSignificance: 'High risk of major bleeding events including gastrointestinal hemorrhage, intracranial bleeding, and other serious bleeding complications. Studies show 2-3 fold increase in bleeding risk with combination therapy.',
            managementRecommendations: 'Avoid combination if possible. If clinically necessary (e.g., acute coronary syndrome), use lowest effective aspirin dose (75-100mg daily) and monitor INR closely (target 2.0-2.5). Consider gastroprotection with proton pump inhibitor. Educate patient on bleeding signs.',
            alternatives: ['Clopidogrel monotherapy', 'Direct oral anticoagulants (DOACs)', 'Warfarin alone with careful monitoring'],
            evidenceLevel: 'Clinical Trial - High Quality Evidence from multiple RCTs',
            references: ['https://pubchem.ncbi.nlm.nih.gov/', 'https://www.accessdata.fda.gov/scripts/cder/daf/', 'Circulation 2018;137:e67-e492']
          },
          {
            drugA: 'Warfarin',
            drugB: 'Metformin',
            mechanism: 'Pharmacokinetic - Minimal interaction',
            severity: 'minor',
            description: 'Warfarin and metformin have minimal direct interaction. However, changes in diabetes control can affect vitamin K intake and warfarin requirements.',
            clinicalSignificance: 'Low risk of clinically significant interaction. Dietary changes related to diabetes management may affect INR stability.',
            managementRecommendations: 'Monitor INR regularly as with all warfarin therapy. Counsel patient on maintaining consistent vitamin K intake. No specific dose adjustments typically required.',
            alternatives: [],
            evidenceLevel: 'Expert Opinion - Clinical experience',
            references: ['https://pubchem.ncbi.nlm.nih.gov/', 'https://www.accessdata.fda.gov/scripts/cder/daf/']
          },
          {
            drugA: 'Warfarin',
            drugB: 'Lisinopril',
            mechanism: 'Pharmacodynamic - Minimal interaction',
            severity: 'minor',
            description: 'No significant pharmacokinetic or pharmacodynamic interaction between warfarin and lisinopril. Both can be used safely together.',
            clinicalSignificance: 'Minimal clinical significance. Routine INR monitoring sufficient.',
            managementRecommendations: 'Continue standard INR monitoring. No specific precautions beyond routine warfarin management.',
            alternatives: [],
            evidenceLevel: 'Clinical Trial - Multiple studies show safety',
            references: ['https://pubchem.ncbi.nlm.nih.gov/', 'https://www.whocc.no/atc_ddd_index/']
          }
        ]
      },
      {
        name: 'Aspirin',
        genericName: 'Acetylsalicylic Acid',
        brandNames: ['Bayer Aspirin', 'Ecotrin', 'Bufferin'],
        cmax: '30-40 μg/mL',
        tmax: '1-2 hours',
        halfLife: '2-3 hours',
        eliminationRate: '0.23-0.35 h⁻¹',
        sideEffects: ['Gastrointestinal bleeding', 'Nausea', 'Tinnitus', 'Allergic reactions'],
        uses: 'Pain relief, fever reduction, anti-inflammatory, cardiovascular protection',
        abusePotential: 'Low - Generally safe when used as directed',
        combinationForms: ['Aspirin + Dipyridamole', 'Aspirin + Clopidogrel'],
        source: 'Multiple',
        interactions: [
          {
            drugA: 'Aspirin',
            drugB: 'Metformin',
            mechanism: 'Pharmacodynamic - Potential hypoglycemia risk',
            severity: 'moderate',
            description: 'High-dose aspirin (>3g/day) may enhance the hypoglycemic effect of metformin by improving insulin sensitivity and reducing glucose production. Low-dose aspirin (75-325mg) has minimal effect.',
            clinicalSignificance: 'At therapeutic cardiovascular doses (75-325mg), clinical significance is low. At high analgesic doses, may increase hypoglycemia risk in diabetic patients.',
            managementRecommendations: 'Monitor blood glucose when initiating or changing aspirin dose. Low-dose aspirin for cardiovascular protection is generally safe with metformin. Educate patients on hypoglycemia symptoms.',
            alternatives: ['Other NSAIDs with caution', 'Acetaminophen for pain'],
            evidenceLevel: 'Clinical Trial - Moderate Quality Evidence',
            references: ['https://pubchem.ncbi.nlm.nih.gov/', 'https://www.accessdata.fda.gov/scripts/cder/daf/', 'Diabetes Care 2019;42:S139-S147']
          },
          {
            drugA: 'Aspirin',
            drugB: 'Lisinopril',
            mechanism: 'Pharmacodynamic - Potential reduction in ACE inhibitor efficacy',
            severity: 'moderate',
            description: 'Aspirin may reduce the antihypertensive and cardioprotective effects of ACE inhibitors by inhibiting prostaglandin synthesis, which is involved in ACE inhibitor mechanism of action.',
            clinicalSignificance: 'Clinical significance is debated. Some studies show reduced benefit of ACE inhibitors in heart failure patients taking aspirin, while others show minimal effect. Effect appears dose-dependent.',
            managementRecommendations: 'Use lowest effective aspirin dose for cardiovascular protection (75-100mg). Monitor blood pressure regularly. Consider alternative antiplatelet agents if blood pressure control is inadequate. Benefits of combination often outweigh risks in post-MI patients.',
            alternatives: ['Clopidogrel', 'Ticagrelor'],
            evidenceLevel: 'Clinical Trial - Mixed evidence from multiple studies',
            references: ['https://pubchem.ncbi.nlm.nih.gov/', 'https://www.whocc.no/atc_ddd_index/', 'J Am Coll Cardiol 2020;75:1689-1699']
          }
        ]
      },
      {
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        brandNames: ['Glucophage', 'Fortamet', 'Glumetza'],
        cmax: '1-2 μg/mL',
        tmax: '2-3 hours',
        halfLife: '4-9 hours',
        eliminationRate: '0.08-0.17 h⁻¹',
        sideEffects: ['Gastrointestinal upset', 'Diarrhea', 'Lactic acidosis (rare)', 'Vitamin B12 deficiency'],
        uses: 'Type 2 diabetes management, PCOS treatment, metabolic syndrome',
        abusePotential: 'None - No abuse potential',
        combinationForms: ['Metformin + Sitagliptin', 'Metformin + Glipizide'],
        source: 'Multiple',
        interactions: [
          {
            drugA: 'Metformin',
            drugB: 'Contrast Media (Iodinated)',
            mechanism: 'Pharmacokinetic - Reduced renal clearance leading to drug accumulation',
            severity: 'major',
            description: 'Iodinated contrast media can cause acute kidney injury, leading to reduced metformin clearance and accumulation. This significantly increases the risk of life-threatening lactic acidosis.',
            clinicalSignificance: 'Life-threatening lactic acidosis can occur in patients who develop contrast-induced nephropathy. Risk is highest in patients with pre-existing renal impairment, heart failure, or advanced age.',
            managementRecommendations: 'Discontinue metformin 48 hours before contrast procedure in patients with eGFR 30-60 mL/min/1.73m². For eGFR >60, may continue but hold for 48 hours after if risk factors present. Resume only after renal function confirmed stable. Ensure adequate hydration.',
            alternatives: ['Insulin therapy during contrast procedures', 'DPP-4 inhibitors (continue through procedure)'],
            evidenceLevel: 'Regulatory Agency - FDA Black Box Warning and international guidelines',
            references: ['https://www.accessdata.fda.gov/scripts/cder/daf/', 'https://pubchem.ncbi.nlm.nih.gov/', 'Radiology 2020;294:182-190']
          },
          {
            drugA: 'Metformin',
            drugB: 'Lisinopril',
            mechanism: 'Pharmacodynamic - Complementary effects',
            severity: 'minor',
            description: 'Metformin and lisinopril have complementary beneficial effects in diabetic patients with hypertension. No significant adverse interaction.',
            clinicalSignificance: 'Positive interaction - both drugs provide renal protection in diabetic patients. Combination is recommended in clinical guidelines.',
            managementRecommendations: 'Continue both medications. Monitor renal function periodically as both are renally cleared. Combination provides cardiovascular and renal benefits.',
            alternatives: [],
            evidenceLevel: 'Clinical Trial - Strong evidence supporting combination',
            references: ['https://pubchem.ncbi.nlm.nih.gov/', 'https://www.whocc.no/atc_ddd_index/', 'Diabetes Care 2021;44:S125-S150']
          }
        ]
      },
      {
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        brandNames: ['Prinivil', 'Zestril'],
        cmax: '50-100 ng/mL',
        tmax: '6-8 hours',
        halfLife: '12 hours',
        eliminationRate: '0.058 h⁻¹',
        sideEffects: ['Dry cough', 'Dizziness', 'Hyperkalemia', 'Angioedema (rare)'],
        uses: 'Hypertension, heart failure, post-myocardial infarction, diabetic nephropathy',
        abusePotential: 'None - No abuse potential',
        combinationForms: ['Lisinopril + Hydrochlorothiazide'],
        source: 'Multiple',
        interactions: [
          {
            drugA: 'Lisinopril',
            drugB: 'Potassium Supplements',
            mechanism: 'Pharmacodynamic - Additive hyperkalemia risk',
            severity: 'moderate',
            description: 'ACE inhibitors like lisinopril reduce aldosterone secretion, leading to potassium retention. When combined with potassium supplements or potassium-sparing diuretics, this significantly increases hyperkalemia risk.',
            clinicalSignificance: 'Moderate to severe hyperkalemia (K+ >5.5 mEq/L) can cause life-threatening cardiac arrhythmias, muscle weakness, and paralysis. Risk is higher in elderly patients and those with renal impairment.',
            managementRecommendations: 'Monitor serum potassium regularly (baseline, 1-2 weeks after initiation, then periodically). Avoid routine potassium supplementation unless documented hypokalemia. Educate patients to avoid salt substitutes containing potassium. If hyperkalemia develops, discontinue potassium supplements and consider adding thiazide diuretic.',
            alternatives: ['Dietary potassium management', 'Thiazide diuretics for potassium balance', 'Patiromer or sodium zirconium cyclosilicate if hyperkalemia persists'],
            evidenceLevel: 'Clinical Trial - High quality evidence from multiple studies',
            references: ['https://pubchem.ncbi.nlm.nih.gov/', 'https://www.whocc.no/atc_ddd_index/', 'Am J Med 2018;131:643-650']
          }
        ]
      },
      {
        name: 'Contrast Media (Iodinated)',
        genericName: 'Iodinated Contrast Agents',
        brandNames: ['Omnipaque', 'Visipaque', 'Isovue'],
        uses: 'Radiological imaging procedures (CT scans, angiography)',
        sideEffects: ['Contrast-induced nephropathy', 'Allergic reactions', 'Nausea', 'Metallic taste'],
        abusePotential: 'None - Diagnostic agent only',
        source: 'FDA',
        interactions: []
      },
      {
        name: 'Potassium Supplements',
        genericName: 'Potassium Chloride',
        brandNames: ['K-Dur', 'Klor-Con', 'Micro-K'],
        uses: 'Treatment and prevention of hypokalemia',
        sideEffects: ['Gastrointestinal irritation', 'Nausea', 'Hyperkalemia', 'Cardiac arrhythmias'],
        abusePotential: 'None - Electrolyte supplement',
        source: 'Multiple',
        interactions: []
      }
    ];
  }

  // Fetch data from all sources
  async fetchMultiSourceData(forceRefresh = false): Promise<DatabaseData> {
    const cached = localStorage.getItem(CACHE_KEY);
    
    if (!forceRefresh && cached) {
      const data: DatabaseData = JSON.parse(cached);
      const cacheAge = Date.now() - new Date(data.lastUpdated).getTime();
      
      if (cacheAge < CACHE_DURATION) {
        return data;
      }
    }

    if (this.syncInProgress) {
      return {
        drugs: this.getCachedData(),
        lastUpdated: new Date(),
        syncStatus: { pubchem: false, fda: false, who: false }
      };
    }

    this.syncInProgress = true;

    try {
      // Simulate fetching from PubChem
      this.notifyProgress(10, 'PubChem');
      await this.delay(500);
      const pubchemDrugs = await this.fetchFromPubChem();
      this.notifyProgress(40, 'PubChem');

      // Simulate fetching from FDA
      this.notifyProgress(50, 'FDA Drugs@FDA');
      await this.delay(500);
      const fdaDrugs = await this.fetchFromFDA();
      this.notifyProgress(70, 'FDA Drugs@FDA');

      // Simulate fetching from WHO
      this.notifyProgress(80, 'WHO ATC/DDD');
      await this.delay(500);
      const whoDrugs = await this.fetchFromWHO();
      this.notifyProgress(100, 'WHO ATC/DDD');

      // Merge and deduplicate
      const allDrugs = this.mergeDrugData([...pubchemDrugs, ...fdaDrugs, ...whoDrugs]);

      const databaseData: DatabaseData = {
        drugs: allDrugs,
        lastUpdated: new Date(),
        syncStatus: {
          pubchem: true,
          fda: true,
          who: true
        }
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(databaseData));
      this.syncInProgress = false;

      return databaseData;
    } catch (error) {
      console.error('Error fetching drug database:', error);
      this.syncInProgress = false;
      
      return {
        drugs: this.getCachedData(),
        lastUpdated: new Date(),
        syncStatus: { pubchem: false, fda: false, who: false }
      };
    }
  }

  // Simulate PubChem fetch
  private async fetchFromPubChem(): Promise<DrugInfo[]> {
    // In production, this would call PubChem API
    return this.getDefaultDrugs().map(drug => ({ ...drug, source: 'PubChem' as const }));
  }

  // Simulate FDA fetch
  private async fetchFromFDA(): Promise<DrugInfo[]> {
    // In production, this would call FDA Drugs@FDA API
    return [];
  }

  // Simulate WHO fetch
  private async fetchFromWHO(): Promise<DrugInfo[]> {
    // In production, this would call WHO ATC/DDD Index API
    return [];
  }

  // Merge drug data from multiple sources
  private mergeDrugData(drugs: DrugInfo[]): DrugInfo[] {
    const drugMap = new Map<string, DrugInfo>();

    for (const drug of drugs) {
      const key = drug.name.toLowerCase();
      
      if (drugMap.has(key)) {
        const existing = drugMap.get(key)!;
        // Merge data from multiple sources
        drugMap.set(key, {
          ...existing,
          ...drug,
          source: 'Multiple',
          brandNames: [...new Set([...(existing.brandNames || []), ...(drug.brandNames || [])])],
          sideEffects: [...new Set([...(existing.sideEffects || []), ...(drug.sideEffects || [])])],
          combinationForms: [...new Set([...(existing.combinationForms || []), ...(drug.combinationForms || [])])],
          interactions: [...(existing.interactions || []), ...(drug.interactions || [])]
        });
      } else {
        drugMap.set(key, drug);
      }
    }

    return Array.from(drugMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get last updated timestamp
  getLastUpdated(): Date | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: DatabaseData = JSON.parse(cached);
      return new Date(data.lastUpdated);
    } catch {
      return null;
    }
  }

  // Get sync status
  getSyncStatus() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return { pubchem: false, fda: false, who: false };

      const data: DatabaseData = JSON.parse(cached);
      return data.syncStatus;
    } catch {
      return { pubchem: false, fda: false, who: false };
    }
  }

  // Progress notification
  private notifyProgress(progress: number, source: string) {
    this.syncProgressCallbacks.forEach(callback => callback(progress, source));
  }

  // Subscribe to progress updates
  onSyncProgress(callback: (progress: number, source: string) => void): () => void {
    this.syncProgressCallbacks.push(callback);
    return () => {
      this.syncProgressCallbacks = this.syncProgressCallbacks.filter(cb => cb !== callback);
    };
  }

  // Utility delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Schedule automatic sync
  scheduleAutoSync() {
    const now = new Date();
    const next2AM = new Date();
    next2AM.setHours(2, 0, 0, 0);
    
    if (next2AM <= now) {
      next2AM.setDate(next2AM.getDate() + 1);
    }

    const timeUntilSync = next2AM.getTime() - now.getTime();

    setTimeout(() => {
      this.fetchMultiSourceData(true);
      setInterval(() => {
        this.fetchMultiSourceData(true);
      }, SYNC_INTERVAL);
    }, timeUntilSync);
  }
}

export const drugDrugInteractionService = new DrugDrugInteractionService();

// Auto-schedule sync on module load
drugDrugInteractionService.scheduleAutoSync();
