/**
 * CDSCO Drug Data Service
 * Handles fetching and parsing drug data from official CDSCO sources
 * Note: Since Motoko backend cannot interact with public APIs, this is handled client-side
 */

import { Drug, DrugStatus, DrugSource } from '../backend';

interface CDSCODataCache {
  drugs: Drug[];
  lastUpdated: Date;
}

const CACHE_KEY = 'cdsco_drug_data_cache';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Simulated CDSCO data fetching and parsing
 * In production, this would make actual HTTP requests to CDSCO sources
 * For now, we'll simulate the data structure and provide sample data
 */
export class CDSCODrugService {
  private static cache: CDSCODataCache | null = null;

  /**
   * Fetch banned drugs from CDSCO PDF
   * URL: https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/Consumer_Section_PDFs/banneddrugs.pdf
   */
  private static async fetchBannedDrugs(): Promise<Drug[]> {
    // Simulated banned drugs data from CDSCO PDF
    // In production, this would parse the actual PDF
    const bannedDrugs: Drug[] = [
      // Original 22 banned FDC entries
      {
        name: 'Nimesulide + Tizanidine',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Fixed dose combination banned by CDSCO',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Banned due to safety concerns and lack of therapeutic justification',
      },
      {
        name: 'Phenylpropanolamine',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'Banned sympathomimetic drug',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Associated with increased risk of hemorrhagic stroke',
      },
      {
        name: 'Sibutramine',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'Anti-obesity drug banned by CDSCO',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Increased cardiovascular risks including heart attack and stroke',
      },
      {
        name: 'Rosiglitazone',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'Antidiabetic drug banned in India',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Increased risk of cardiovascular events and heart failure',
      },
      {
        name: 'Tegaserod',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'IBS medication banned by CDSCO',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Associated with serious cardiovascular adverse events',
      },
      {
        name: 'Cisapride',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'Prokinetic agent banned due to cardiac risks',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Causes serious cardiac arrhythmias including QT prolongation',
      },
      {
        name: 'Rofecoxib',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'COX-2 inhibitor withdrawn from market',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Increased risk of heart attack and stroke',
      },
      {
        name: 'Valdecoxib',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'COX-2 inhibitor banned by CDSCO',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Serious skin reactions and cardiovascular risks',
      },
      {
        name: 'Nimesulide + Paracetamol',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Fixed dose combination banned',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Hepatotoxicity concerns and lack of therapeutic advantage',
      },
      {
        name: 'Terfenadine',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'Antihistamine banned due to cardiac risks',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Cardiac arrhythmias and QT interval prolongation',
      },
      {
        name: 'Nimesulide + Serratiopeptidase',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Fixed dose combination banned by CDSCO',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Lack of therapeutic justification and safety concerns',
      },
      {
        name: 'Paracetamol + Nimesulide + Cetirizine',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple combination FDC banned',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Irrational combination with hepatotoxicity risks',
      },
      {
        name: 'Diclofenac + Paracetamol + Chlorzoxazone',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple combination FDC banned',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Increased risk of adverse effects without proven benefit',
      },
      {
        name: 'Nimesulide + Diclofenac',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Dual NSAID combination banned',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Increased gastrointestinal and hepatic toxicity',
      },
      {
        name: 'Paracetamol + Diclofenac + Famotidine',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple combination FDC banned',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Irrational combination without therapeutic advantage',
      },
      {
        name: 'Nimesulide + Pitofenone + Fenpiverinium',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple combination FDC banned',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Lack of safety data and therapeutic justification',
      },
      {
        name: 'Paracetamol + Tramadol + Domperidone',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple combination FDC banned',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Cardiac risks and potential for abuse',
      },
      {
        name: 'Aceclofenac + Paracetamol + Rabeprazole',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple combination FDC banned',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Irrational combination with safety concerns',
      },
      {
        name: 'Diclofenac + Paracetamol + Serratiopeptidase',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple combination FDC banned',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Lack of proven efficacy and safety data',
      },
      {
        name: 'Nimesulide + Paracetamol + Levocetirizine',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple combination FDC banned',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Hepatotoxicity risks and irrational combination',
      },
      {
        name: 'Paracetamol + Diclofenac + Serratiopeptidase',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple combination FDC banned',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Increased adverse effects without therapeutic benefit',
      },
      {
        name: 'Nimesulide + Paracetamol + Cetirizine + Phenylephrine',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Quadruple combination FDC banned',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Complex irrational combination with multiple safety concerns',
      },
      // 10 NEW BANNED FDCs ADDED IN 2025
      {
        name: 'Dapagliflozin + Glimepiride + Metformin',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple antidiabetic combination banned in 2025',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Increased risk of hypoglycemia and cardiovascular complications',
      },
      {
        name: 'Cilnidipine + Metoprolol Succinate',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Antihypertensive combination banned in 2025',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Excessive bradycardia and hypotension risks',
      },
      {
        name: 'Etodolac + Paracetamol + Chlorzoxazone',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple analgesic combination banned in 2025',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Hepatotoxicity and gastrointestinal bleeding risks',
      },
      {
        name: 'Lornoxicam + Paracetamol + Serratiopeptidase',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple combination banned in 2025',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Lack of therapeutic justification and safety data',
      },
      {
        name: 'Aceclofenac + Thiocolchicoside',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'NSAID and muscle relaxant combination banned in 2025',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Neurotoxicity and genotoxicity concerns',
      },
      {
        name: 'Dicyclomine + Paracetamol + Drotaverine',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple antispasmodic combination banned in 2025',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Irrational combination with anticholinergic side effects',
      },
      {
        name: 'Amoxicillin + Clavulanic Acid + Tinidazole',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple antibiotic combination banned in 2025',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Increased antibiotic resistance and adverse effects',
      },
      {
        name: 'Levocetirizine + Montelukast + Ambroxol',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple respiratory combination banned in 2025',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Neuropsychiatric adverse effects and lack of proven benefit',
      },
      {
        name: 'Ofloxacin + Ornidazole + Clobazam',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple combination with benzodiazepine banned in 2025',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'CNS depression and potential for dependence',
      },
      {
        name: 'Aceclofenac + Paracetamol + Serratiopeptidase',
        status: DrugStatus.banned,
        date: BigInt(Date.now() * 1000000),
        category: 'FDC',
        description: 'Triple analgesic combination banned in 2025',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Hepatotoxicity and gastrointestinal risks without proven efficacy',
      },
    ];

    return bannedDrugs;
  }

  /**
   * Fetch approved drugs from CDSCO online database
   * URL: https://cdscoonline.gov.in/CDSCO/Drugs
   */
  private static async fetchApprovedDrugs(): Promise<Drug[]> {
    // Simulated approved drugs data from CDSCO database
    // In production, this would scrape the actual website
    const approvedDrugs: Drug[] = [
      {
        name: 'Paracetamol',
        status: DrugStatus.approved,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'Analgesic and antipyretic medication',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Safe when used as directed; avoid overdose to prevent hepatotoxicity',
      },
      {
        name: 'Ibuprofen',
        status: DrugStatus.approved,
        date: BigInt(Date.now() * 1000000),
        category: 'Painkiller',
        description: 'Non-steroidal anti-inflammatory drug (NSAID)',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Use with caution in patients with cardiovascular or gastrointestinal conditions',
      },
      {
        name: 'Amoxicillin',
        status: DrugStatus.approved,
        date: BigInt(Date.now() * 1000000),
        category: 'Antibiotic',
        description: 'Beta-lactam antibiotic',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Check for penicillin allergy before administration',
      },
      {
        name: 'Metformin',
        status: DrugStatus.approved,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'First-line antidiabetic medication',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Monitor renal function; contraindicated in severe renal impairment',
      },
      {
        name: 'Atorvastatin',
        status: DrugStatus.approved,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'HMG-CoA reductase inhibitor for cholesterol management',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Monitor liver function; avoid in pregnancy',
      },
      {
        name: 'Amlodipine',
        status: DrugStatus.approved,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'Calcium channel blocker for hypertension',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'May cause peripheral edema; use with caution in heart failure',
      },
      {
        name: 'Omeprazole',
        status: DrugStatus.approved,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'Proton pump inhibitor for acid-related disorders',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Long-term use may increase risk of bone fractures and vitamin B12 deficiency',
      },
      {
        name: 'Salbutamol',
        status: DrugStatus.approved,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'Beta-2 agonist bronchodilator',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Use with caution in cardiovascular disease; may cause tremor and tachycardia',
      },
      {
        name: 'Cetirizine',
        status: DrugStatus.approved,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'Second-generation antihistamine',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'May cause drowsiness; adjust dose in renal impairment',
      },
      {
        name: 'Azithromycin',
        status: DrugStatus.approved,
        date: BigInt(Date.now() * 1000000),
        category: 'Antibiotic',
        description: 'Macrolide antibiotic',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Monitor for QT prolongation; use with caution in cardiac patients',
      },
      {
        name: 'Losartan',
        status: DrugStatus.approved,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'Angiotensin II receptor blocker for hypertension',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Contraindicated in pregnancy; monitor potassium levels',
      },
      {
        name: 'Levothyroxine',
        status: DrugStatus.approved,
        date: BigInt(Date.now() * 1000000),
        category: 'General',
        description: 'Thyroid hormone replacement therapy',
        source: { __kind__: 'cdsco', cdsco: null },
        safetyInfo: 'Requires regular monitoring of thyroid function tests',
      },
    ];

    return approvedDrugs;
  }

  /**
   * Fetch and combine all CDSCO drug data
   */
  public static async fetchCDSCOData(forceRefresh = false): Promise<CDSCODataCache> {
    // Check cache first
    if (!forceRefresh && this.cache) {
      const cacheAge = Date.now() - this.cache.lastUpdated.getTime();
      if (cacheAge < CACHE_DURATION) {
        return this.cache;
      }
    }

    // Check localStorage cache
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          const cacheAge = Date.now() - new Date(parsed.lastUpdated).getTime();
          if (cacheAge < CACHE_DURATION) {
            this.cache = {
              drugs: parsed.drugs.map((d: any) => ({
                ...d,
                date: BigInt(d.date),
              })),
              lastUpdated: new Date(parsed.lastUpdated),
            };
            return this.cache;
          }
        } catch (error) {
          console.error('Error parsing cached CDSCO data:', error);
        }
      }
    }

    try {
      // Fetch data from both sources
      const [bannedDrugs, approvedDrugs] = await Promise.all([
        this.fetchBannedDrugs(),
        this.fetchApprovedDrugs(),
      ]);

      const allDrugs = [...bannedDrugs, ...approvedDrugs];

      const cacheData: CDSCODataCache = {
        drugs: allDrugs,
        lastUpdated: new Date(),
      };

      // Update memory cache
      this.cache = cacheData;

      // Update localStorage cache
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            drugs: allDrugs.map((d) => ({
              ...d,
              date: d.date.toString(),
            })),
            lastUpdated: cacheData.lastUpdated.toISOString(),
          })
        );
      } catch (error) {
        console.error('Error caching CDSCO data:', error);
      }

      return cacheData;
    } catch (error) {
      console.error('Error fetching CDSCO data:', error);
      
      // Return cached data if available, even if expired
      if (this.cache) {
        return this.cache;
      }

      // Return empty data as fallback
      return {
        drugs: [],
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Get last updated timestamp
   */
  public static getLastUpdated(): Date | null {
    if (this.cache) {
      return this.cache.lastUpdated;
    }

    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        return new Date(parsed.lastUpdated);
      } catch (error) {
        return null;
      }
    }

    return null;
  }

  /**
   * Clear cache
   */
  public static clearCache(): void {
    this.cache = null;
    localStorage.removeItem(CACHE_KEY);
  }
}
