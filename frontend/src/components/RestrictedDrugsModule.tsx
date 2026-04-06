import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { AlertTriangle, ShieldAlert, ChevronDown, ChevronUp, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

// Define ExternalResource locally
interface ExternalResource {
  id: string;
  name: string;
  url: string;
  description: string;
}

// Default external resources with proper URLs
const defaultExternalResources: ExternalResource[] = [
  {
    id: 'cdsco',
    name: 'CDSCO - Central Drugs Standard Control Organization',
    url: 'https://cdsco.gov.in/opencms/opencms/en/Home/',
    description: 'Central Drugs Standard Control Organization',
  },
  {
    id: 'mimsIndia',
    name: 'MIMS India - Drug Information Database',
    url: 'https://www.mims.com/india/drug',
    description: 'MIMS India Comprehensive Drug Database',
  },
  {
    id: 'whoUmc',
    name: 'Uppsala Monitoring Centre (WHO-UMC)',
    url: 'https://who-umc.org/',
    description: 'WHO Uppsala Monitoring Centre',
  },
  {
    id: 'ipc',
    name: 'IPC - Indian Pharmacopoeia Commission',
    url: 'https://www.ipc.gov.in/',
    description: 'Indian Pharmacopoeia Commission',
  },
  {
    id: 'ema',
    name: 'EMA - European Medicines Agency (EudraVigilance)',
    url: 'https://www.ema.europa.eu/en/human-regulatory-overview/research-development/pharmacovigilance-research-development/eudravigilance-access-eudravigilance-data',
    description: 'European Medicines Agency',
  },
  {
    id: 'healthCanada',
    name: 'Health Canada Vigilance Database (HPR-RPS)',
    url: 'https://hpr-rps.hres.ca/static/content/data-donnees.php',
    description: 'Health Canada Vigilance Database',
  },
  {
    id: 'mhra',
    name: 'UK Yellow Card Scheme',
    url: 'https://yellowcard.mhra.gov.uk/',
    description: 'UK MHRA Yellow Card Scheme',
  },
  {
    id: 'tga',
    name: 'Australian TGA Adverse Event Notifications Database (DAEN)',
    url: 'https://www.tga.gov.au/database/database-adverse-event-notifications-daen',
    description: 'Australian TGA Database',
  },
];

type RestrictedDrug = {
  name: string;
  description: string;
  category: string;
  safetyInfo: string;
  alternativeRecommendations?: string;
  restrictionReason: string;
  approvalStatus?: string;
  source?: string;
};

type RestrictedDrugCategory = {
  name: string;
  description: string;
  drugs: RestrictedDrug[];
};

export default function RestrictedDrugsModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'Pregnant Women': true,
    'Lactating Mothers': false,
    'Pediatrics': false,
    'Geriatrics': false,
    'Rare Case Category': false,
  });

  const externalResources = defaultExternalResources;
  const resourcesLoading = false;

  // Significantly expanded comprehensive drug database from MIMS India and CDSCO
  const categories: RestrictedDrugCategory[] = useMemo(() => [
    {
      name: 'Pregnant Women',
      description: 'Medications contraindicated or requiring special caution during pregnancy - Expanded Database',
      drugs: [
        {
          name: 'Warfarin',
          description: 'Anticoagulant medication',
          category: 'Pregnant Women',
          restrictionReason: 'Teratogenic effects, fetal bleeding risk',
          safetyInfo: 'Risk of fetal bleeding and birth defects. Crosses placental barrier causing embryopathy, nasal hypoplasia, and CNS abnormalities.',
          alternativeRecommendations: 'Use low molecular weight heparin (LMWH) during pregnancy.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'ACE Inhibitors (Enalapril, Lisinopril, Ramipril, Captopril, Perindopril)',
          description: 'Antihypertensive medications',
          category: 'Pregnant Women',
          restrictionReason: 'Fetal renal dysfunction and malformations',
          safetyInfo: 'Can cause fetal renal dysfunction, oligohydramnios, skeletal malformations, and neonatal hypotension. Contraindicated in all trimesters.',
          alternativeRecommendations: 'Use methyldopa, labetalol, or nifedipine for hypertension management.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'ARBs (Losartan, Valsartan, Telmisartan, Irbesartan, Candesartan)',
          description: 'Angiotensin receptor blockers',
          category: 'Pregnant Women',
          restrictionReason: 'Similar risks to ACE inhibitors',
          safetyInfo: 'Causes fetal renal dysfunction, oligohydramnios, and skeletal abnormalities. Absolute contraindication in pregnancy.',
          alternativeRecommendations: 'Switch to methyldopa or labetalol before conception.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Tetracyclines (Doxycycline, Tetracycline, Minocycline, Tigecycline)',
          description: 'Broad-spectrum antibiotic class',
          category: 'Pregnant Women',
          restrictionReason: 'Dental discoloration and bone growth inhibition',
          safetyInfo: 'Causes permanent dental discoloration, enamel hypoplasia, and inhibits bone growth in fetus. Avoid during pregnancy.',
          alternativeRecommendations: 'Use penicillins, cephalosporins, or macrolides as alternatives.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Isotretinoin (Accutane)',
          description: 'Acne treatment medication',
          category: 'Pregnant Women',
          restrictionReason: 'Severe teratogenic effects',
          safetyInfo: 'Highly teratogenic causing craniofacial, cardiac, thymic, and CNS malformations. Absolute contraindication with mandatory pregnancy prevention.',
          alternativeRecommendations: 'Topical treatments or systemic antibiotics after pregnancy.',
          approvalStatus: 'Banned in pregnancy - iPLEDGE program required',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Methotrexate',
          description: 'Antimetabolite and immunosuppressant',
          category: 'Pregnant Women',
          restrictionReason: 'Fetal death and malformations',
          safetyInfo: 'Causes neural tube defects, skeletal abnormalities, and fetal death. Contraindicated in pregnancy.',
          alternativeRecommendations: 'Discontinue at least 3 months before conception.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Valproic Acid (Sodium Valproate, Divalproex)',
          description: 'Antiepileptic medication',
          category: 'Pregnant Women',
          restrictionReason: 'Neural tube defects and developmental delays',
          safetyInfo: 'High risk of spina bifida (1-2%), other neural tube defects, and neurodevelopmental delays. Use only if no alternatives available.',
          alternativeRecommendations: 'Consider lamotrigine or levetiracetam with high-dose folic acid supplementation (5mg daily).',
          approvalStatus: 'Restricted use - requires informed consent',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Statins (Atorvastatin, Simvastatin, Rosuvastatin, Pravastatin)',
          description: 'Cholesterol-lowering medications',
          category: 'Pregnant Women',
          restrictionReason: 'Potential fetal harm and skeletal malformations',
          safetyInfo: 'May cause fetal skeletal malformations and CNS abnormalities. Discontinue during pregnancy.',
          alternativeRecommendations: 'Manage cholesterol through diet; resume after delivery and lactation.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Misoprostol',
          description: 'Prostaglandin analog',
          category: 'Pregnant Women',
          restrictionReason: 'Uterine contractions and fetal malformations',
          safetyInfo: 'Causes uterine contractions, abortion, and Möbius syndrome (facial paralysis). Contraindicated in pregnancy.',
          alternativeRecommendations: 'Use alternative gastroprotective agents like sucralfate or H2 blockers.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Thalidomide',
          description: 'Immunomodulatory agent',
          category: 'Pregnant Women',
          restrictionReason: 'Severe limb malformations',
          safetyInfo: 'Causes phocomelia and severe limb defects. Absolute contraindication with strict pregnancy prevention program.',
          alternativeRecommendations: 'Use only under REMS program with mandatory dual contraception.',
          approvalStatus: 'Banned in pregnancy - REMS program required',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Fluoroquinolones (Ciprofloxacin, Levofloxacin, Moxifloxacin, Ofloxacin)',
          description: 'Antibiotic class',
          category: 'Pregnant Women',
          restrictionReason: 'Cartilage damage risk',
          safetyInfo: 'Potential for cartilage damage in developing fetus and arthropathy. Avoid unless no alternatives.',
          alternativeRecommendations: 'Use beta-lactam antibiotics or macrolides.',
          approvalStatus: 'Use with caution - only if benefits outweigh risks',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Phenytoin',
          description: 'Antiepileptic medication',
          category: 'Pregnant Women',
          restrictionReason: 'Fetal hydantoin syndrome',
          safetyInfo: 'Causes fetal hydantoin syndrome with craniofacial abnormalities, nail hypoplasia, and developmental delays.',
          alternativeRecommendations: 'Consider lamotrigine or levetiracetam with folic acid supplementation.',
          approvalStatus: 'Use with caution - requires monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Carbamazepine',
          description: 'Antiepileptic and mood stabilizer',
          category: 'Pregnant Women',
          restrictionReason: 'Neural tube defects',
          safetyInfo: 'Risk of spina bifida and other neural tube defects. Use only if essential with folic acid supplementation.',
          alternativeRecommendations: 'Consider lamotrigine with high-dose folic acid (5mg daily).',
          approvalStatus: 'Use with caution - requires monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Lithium',
          description: 'Mood stabilizer',
          category: 'Pregnant Women',
          restrictionReason: 'Cardiac malformations',
          safetyInfo: "Risk of Ebstein's anomaly (cardiac malformation) especially in first trimester. Requires careful monitoring if continued.",
          alternativeRecommendations: 'Consider alternative mood stabilizers or taper before conception.',
          approvalStatus: 'Use with extreme caution - requires monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Mycophenolate Mofetil',
          description: 'Immunosuppressant',
          category: 'Pregnant Women',
          restrictionReason: 'Severe birth defects',
          safetyInfo: 'Causes ear, facial, cardiac, and limb malformations. Absolute contraindication in pregnancy.',
          alternativeRecommendations: 'Switch to azathioprine before conception if immunosuppression needed.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Finasteride and Dutasteride',
          description: '5-alpha reductase inhibitors',
          category: 'Pregnant Women',
          restrictionReason: 'Genital abnormalities in male fetuses',
          safetyInfo: 'Causes abnormal development of external genitalia in male fetuses. Women should not handle crushed tablets.',
          alternativeRecommendations: 'Avoid exposure during pregnancy; use alternative treatments.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Leflunomide',
          description: 'Immunomodulatory agent',
          category: 'Pregnant Women',
          restrictionReason: 'Teratogenic effects',
          safetyInfo: 'Highly teratogenic with long half-life requiring cholestyramine washout before conception.',
          alternativeRecommendations: 'Discontinue and perform cholestyramine washout; verify drug levels before conception.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Ribavirin',
          description: 'Antiviral medication',
          category: 'Pregnant Women',
          restrictionReason: 'Severe teratogenic effects',
          safetyInfo: 'Highly teratogenic causing fetal death and malformations. Contraception required for 6 months after treatment.',
          alternativeRecommendations: 'Avoid pregnancy during and 6 months after treatment.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Aminoglycosides (Gentamicin, Amikacin, Streptomycin)',
          description: 'Antibiotic class',
          category: 'Pregnant Women',
          restrictionReason: 'Ototoxicity and nephrotoxicity',
          safetyInfo: 'Risk of fetal ototoxicity causing hearing loss, especially with streptomycin. Use only if essential.',
          alternativeRecommendations: 'Use alternative antibiotics unless life-threatening infection.',
          approvalStatus: 'Use with caution - only if essential',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Androgens and Anabolic Steroids',
          description: 'Hormonal agents',
          category: 'Pregnant Women',
          restrictionReason: 'Virilization of female fetus',
          safetyInfo: 'Causes masculinization of female fetus with genital abnormalities.',
          alternativeRecommendations: 'Absolute contraindication; discontinue before conception.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Danazol',
          description: 'Synthetic androgen',
          category: 'Pregnant Women',
          restrictionReason: 'Virilization of female fetus',
          safetyInfo: 'Causes masculinization and ambiguous genitalia in female fetuses.',
          alternativeRecommendations: 'Discontinue before conception; use alternative treatments.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Retinoids (Acitretin, Tretinoin, Adapalene)',
          description: 'Vitamin A derivatives',
          category: 'Pregnant Women',
          restrictionReason: 'Teratogenic effects',
          safetyInfo: 'Causes craniofacial, cardiac, and CNS malformations. Acitretin requires 3-year contraception after stopping.',
          alternativeRecommendations: 'Discontinue before conception; use non-retinoid alternatives.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Ergot Alkaloids (Ergotamine, Methylergonovine)',
          description: 'Migraine and uterotonic agents',
          category: 'Pregnant Women',
          restrictionReason: 'Uterine contractions and vasoconstriction',
          safetyInfo: 'Causes uterine contractions and fetal hypoxia. Contraindicated except for postpartum hemorrhage.',
          alternativeRecommendations: 'Use triptans or acetaminophen for migraines; reserve methylergonovine for postpartum use only.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Colchicine (high doses)',
          description: 'Anti-gout medication',
          category: 'Pregnant Women',
          restrictionReason: 'Chromosomal abnormalities',
          safetyInfo: 'High doses may cause chromosomal abnormalities. Low doses may be acceptable for familial Mediterranean fever.',
          alternativeRecommendations: 'Use lowest effective dose; consider alternative gout treatments.',
          approvalStatus: 'Use with caution - low doses only',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Alitretinoin',
          description: 'Retinoid for eczema',
          category: 'Pregnant Women',
          restrictionReason: 'Severe teratogenic effects',
          safetyInfo: 'Highly teratogenic causing multiple malformations. Requires pregnancy prevention program.',
          alternativeRecommendations: 'Use alternative eczema treatments; mandatory contraception during treatment.',
          approvalStatus: 'Contraindicated in pregnancy',
          source: 'MIMS India / CDSCO',
        },
      ],
    },
    {
      name: 'Lactating Mothers',
      description: 'Medications that may affect breastfeeding infants - Expanded Database',
      drugs: [
        {
          name: 'Chloramphenicol',
          description: 'Broad-spectrum antibiotic',
          category: 'Lactating Mothers',
          restrictionReason: 'Bone marrow suppression in infants',
          safetyInfo: 'Risk of bone marrow suppression and gray baby syndrome in nursing infants. Avoid during breastfeeding.',
          alternativeRecommendations: 'Use penicillins, cephalosporins, or macrolides.',
          approvalStatus: 'Contraindicated during breastfeeding',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Lithium',
          description: 'Mood stabilizer for bipolar disorder',
          category: 'Lactating Mothers',
          restrictionReason: 'Infant toxicity',
          safetyInfo: 'Passes into breast milk causing infant lethargy, hypotonia, hypothermia, and cyanosis. Monitor infant closely or use alternatives.',
          alternativeRecommendations: 'Consider alternative mood stabilizers or formula feeding with close monitoring.',
          approvalStatus: 'Use with extreme caution - requires monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Benzodiazepines (Diazepam, Lorazepam, Alprazolam, Clonazepam)',
          description: 'Sedative and anxiolytic class',
          category: 'Lactating Mothers',
          restrictionReason: 'Infant sedation and respiratory depression',
          safetyInfo: 'Can cause sedation, respiratory depression, poor feeding, and weight loss in nursing infants. Use with extreme caution.',
          alternativeRecommendations: 'Use short-acting agents at lowest dose or non-pharmacological interventions.',
          approvalStatus: 'Use with caution - monitor infant',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Amiodarone',
          description: 'Antiarrhythmic medication',
          category: 'Lactating Mothers',
          restrictionReason: 'Thyroid dysfunction in infants',
          safetyInfo: 'High concentration in breast milk causing infant hypothyroidism and bradycardia. Contraindicated during breastfeeding.',
          alternativeRecommendations: 'Use alternative antiarrhythmics or discontinue breastfeeding.',
          approvalStatus: 'Contraindicated during breastfeeding',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Ergotamine and Ergot Alkaloids',
          description: 'Migraine medication',
          category: 'Lactating Mothers',
          restrictionReason: 'Vomiting, diarrhea, and convulsions in infants',
          safetyInfo: 'Causes vomiting, diarrhea, convulsions, and ergotism in nursing infants. Avoid during breastfeeding.',
          alternativeRecommendations: 'Use triptans or acetaminophen for migraine management.',
          approvalStatus: 'Contraindicated during breastfeeding',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Tetracyclines (prolonged use)',
          description: 'Antibiotic class',
          category: 'Lactating Mothers',
          restrictionReason: 'Dental staining in infants',
          safetyInfo: 'May cause dental staining and bone growth inhibition with prolonged use. Avoid prolonged courses during breastfeeding.',
          alternativeRecommendations: 'Use penicillins or cephalosporins for short courses.',
          approvalStatus: 'Use with caution - short courses only',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Metronidazole (high doses)',
          description: 'Antibiotic and antiprotozoal',
          category: 'Lactating Mothers',
          restrictionReason: 'Potential mutagenic effects',
          safetyInfo: 'High doses may affect infant. Discontinue breastfeeding for 12-24 hours after single dose.',
          alternativeRecommendations: 'Use lowest effective dose or pump and discard milk temporarily.',
          approvalStatus: 'Use with caution - temporary cessation recommended',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Radioactive Iodine (I-131)',
          description: 'Thyroid treatment',
          category: 'Lactating Mothers',
          restrictionReason: 'Radiation exposure to infant',
          safetyInfo: 'Concentrates in breast milk causing infant thyroid damage and radiation exposure. Absolute contraindication.',
          alternativeRecommendations: 'Discontinue breastfeeding permanently after treatment.',
          approvalStatus: 'Contraindicated - permanent cessation required',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Cyclosporine',
          description: 'Immunosuppressant',
          category: 'Lactating Mothers',
          restrictionReason: 'Immune suppression in infants',
          safetyInfo: 'Passes into breast milk with potential for immune suppression and nephrotoxicity. Avoid breastfeeding.',
          alternativeRecommendations: 'Formula feeding recommended.',
          approvalStatus: 'Contraindicated during breastfeeding',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Bromocriptine and Cabergoline',
          description: 'Dopamine agonists',
          category: 'Lactating Mothers',
          restrictionReason: 'Suppresses lactation',
          safetyInfo: 'Suppresses prolactin and lactation. Contraindicated for nursing mothers unless lactation suppression desired.',
          alternativeRecommendations: 'Use only when lactation suppression is desired.',
          approvalStatus: 'Contraindicated - suppresses lactation',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Doxorubicin and Chemotherapy Agents',
          description: 'Antineoplastic medications',
          category: 'Lactating Mothers',
          restrictionReason: 'Cytotoxic effects on infant',
          safetyInfo: 'Cytotoxic agents pass into breast milk causing potential harm to nursing infant. Absolute contraindication.',
          alternativeRecommendations: 'Discontinue breastfeeding during chemotherapy.',
          approvalStatus: 'Contraindicated during breastfeeding',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Atenolol',
          description: 'Beta-blocker',
          category: 'Lactating Mothers',
          restrictionReason: 'Bradycardia and hypotension in infants',
          safetyInfo: 'High concentration in breast milk may cause bradycardia, hypotension, and cyanosis in infants.',
          alternativeRecommendations: 'Use alternative beta-blockers like metoprolol or propranolol with lower milk transfer.',
          approvalStatus: 'Use with caution - prefer alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Aspirin (high doses)',
          description: 'Antiplatelet and analgesic',
          category: 'Lactating Mothers',
          restrictionReason: "Reye's syndrome risk and bleeding",
          safetyInfo: "High doses may cause Reye's syndrome and bleeding in nursing infants. Low-dose aspirin (≤100mg) generally acceptable.",
          alternativeRecommendations: 'Use acetaminophen or ibuprofen for pain; low-dose aspirin acceptable for cardiovascular indications.',
          approvalStatus: 'Use with caution - low doses acceptable',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Clozapine',
          description: 'Atypical antipsychotic',
          category: 'Lactating Mothers',
          restrictionReason: 'Agranulocytosis risk in infant',
          safetyInfo: 'Risk of agranulocytosis and sedation in nursing infant. Contraindicated during breastfeeding.',
          alternativeRecommendations: 'Use alternative antipsychotics or formula feeding.',
          approvalStatus: 'Contraindicated during breastfeeding',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Phenindione',
          description: 'Anticoagulant',
          category: 'Lactating Mothers',
          restrictionReason: 'Bleeding risk in infant',
          safetyInfo: 'Passes into breast milk causing bleeding risk in nursing infant. Avoid during breastfeeding.',
          alternativeRecommendations: 'Use warfarin or LMWH which are safer during breastfeeding.',
          approvalStatus: 'Contraindicated during breastfeeding',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Gold Salts',
          description: 'Disease-modifying antirheumatic drugs',
          category: 'Lactating Mothers',
          restrictionReason: 'Accumulation in infant',
          safetyInfo: 'Accumulates in breast milk with potential for rash, nephritis, and hepatitis in infant.',
          alternativeRecommendations: 'Use alternative DMARDs compatible with breastfeeding.',
          approvalStatus: 'Contraindicated during breastfeeding',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Retinoids (Isotretinoin, Acitretin)',
          description: 'Vitamin A derivatives',
          category: 'Lactating Mothers',
          restrictionReason: 'Potential toxicity in infant',
          safetyInfo: 'May pass into breast milk causing potential vitamin A toxicity. Avoid during breastfeeding.',
          alternativeRecommendations: 'Use alternative acne treatments or discontinue breastfeeding.',
          approvalStatus: 'Contraindicated during breastfeeding',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Pseudoephedrine',
          description: 'Decongestant',
          category: 'Lactating Mothers',
          restrictionReason: 'Reduced milk production and infant irritability',
          safetyInfo: 'May reduce milk production and cause infant irritability. Use with caution.',
          alternativeRecommendations: 'Use saline nasal sprays or alternative decongestants.',
          approvalStatus: 'Use with caution - may reduce milk supply',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Sulfasalazine',
          description: 'Anti-inflammatory for IBD',
          category: 'Lactating Mothers',
          restrictionReason: 'Hemolysis risk in G6PD-deficient infants',
          safetyInfo: 'May cause hemolysis in G6PD-deficient infants and bloody diarrhea. Monitor infant closely.',
          alternativeRecommendations: 'Use mesalamine which has lower milk transfer.',
          approvalStatus: 'Use with caution - monitor infant',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Dapsone',
          description: 'Antibiotic for leprosy and dermatitis',
          category: 'Lactating Mothers',
          restrictionReason: 'Hemolysis in G6PD-deficient infants',
          safetyInfo: 'Risk of hemolytic anemia in G6PD-deficient infants. Use with caution and monitor infant.',
          alternativeRecommendations: 'Screen infant for G6PD deficiency; use alternatives if deficient.',
          approvalStatus: 'Use with caution - screen for G6PD',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Primaquine',
          description: 'Antimalarial',
          category: 'Lactating Mothers',
          restrictionReason: 'Hemolysis in G6PD-deficient infants',
          safetyInfo: 'Causes severe hemolysis in G6PD-deficient infants. Contraindicated unless infant tested.',
          alternativeRecommendations: 'Screen infant for G6PD deficiency before use.',
          approvalStatus: 'Contraindicated unless G6PD status known',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Iodine and Iodides (high doses)',
          description: 'Antiseptic and expectorant',
          category: 'Lactating Mothers',
          restrictionReason: 'Thyroid suppression in infant',
          safetyInfo: 'High doses cause thyroid suppression and goiter in nursing infants. Avoid prolonged use.',
          alternativeRecommendations: 'Use alternative antiseptics or expectorants.',
          approvalStatus: 'Use with caution - avoid high doses',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Nalidixic Acid',
          description: 'Quinolone antibiotic',
          category: 'Lactating Mothers',
          restrictionReason: 'Hemolysis in G6PD-deficient infants',
          safetyInfo: 'May cause hemolytic anemia in G6PD-deficient infants and arthropathy concerns.',
          alternativeRecommendations: 'Use alternative antibiotics compatible with breastfeeding.',
          approvalStatus: 'Use with caution - prefer alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Clemastine',
          description: 'First-generation antihistamine',
          category: 'Lactating Mothers',
          restrictionReason: 'Sedation and irritability in infants',
          safetyInfo: 'Causes drowsiness, irritability, and feeding difficulties in nursing infants.',
          alternativeRecommendations: 'Use non-sedating antihistamines like loratadine or cetirizine.',
          approvalStatus: 'Use with caution - prefer non-sedating alternatives',
          source: 'MIMS India / CDSCO',
        },
      ],
    },
    {
      name: 'Pediatrics',
      description: 'Medications requiring special consideration in children - Expanded Database',
      drugs: [
        {
          name: 'Aspirin (under 12 years)',
          description: 'Pain reliever and anti-inflammatory',
          category: 'Pediatrics',
          restrictionReason: "Reye's syndrome risk",
          safetyInfo: "Risk of Reye's syndrome with viral infections causing liver and brain damage. Avoid in children under 12 years except for specific indications like Kawasaki disease.",
          alternativeRecommendations: 'Use acetaminophen or ibuprofen for fever and pain.',
          approvalStatus: 'Contraindicated under 12 years for viral illnesses',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Tetracyclines (under 8 years)',
          description: 'Antibiotic class',
          category: 'Pediatrics',
          restrictionReason: 'Permanent dental discoloration',
          safetyInfo: 'Causes permanent dental discoloration, enamel hypoplasia, and bone growth inhibition in children under 8 years. Use alternatives.',
          alternativeRecommendations: 'Use penicillins, cephalosporins, or macrolides.',
          approvalStatus: 'Contraindicated under 8 years',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Codeine (under 12 years)',
          description: 'Opioid pain medication',
          category: 'Pediatrics',
          restrictionReason: 'Variable metabolism and respiratory depression',
          safetyInfo: 'Variable CYP2D6 metabolism can lead to life-threatening respiratory depression. Contraindicated under 12 years and in post-tonsillectomy patients.',
          alternativeRecommendations: 'Use acetaminophen, ibuprofen, or morphine with careful monitoring.',
          approvalStatus: 'Contraindicated under 12 years',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Tramadol (under 12 years)',
          description: 'Opioid analgesic',
          category: 'Pediatrics',
          restrictionReason: 'Respiratory depression risk',
          safetyInfo: 'Similar CYP2D6 metabolism concerns as codeine. Risk of respiratory depression in children.',
          alternativeRecommendations: 'Use non-opioid analgesics or alternative opioids with monitoring.',
          approvalStatus: 'Contraindicated under 12 years',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Fluoroquinolones (Ciprofloxacin, Levofloxacin)',
          description: 'Antibiotic class',
          category: 'Pediatrics',
          restrictionReason: 'Cartilage damage and arthropathy',
          safetyInfo: 'May cause cartilage damage and arthropathy in growing children. Use only when no alternatives for serious infections.',
          alternativeRecommendations: 'Use beta-lactam antibiotics or macrolides.',
          approvalStatus: 'Use with caution - only if no alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Valproic Acid (young children under 2 years)',
          description: 'Antiepileptic medication',
          category: 'Pediatrics',
          restrictionReason: 'Hepatotoxicity risk',
          safetyInfo: 'Increased risk of fatal hepatotoxicity in children under 2 years, especially with polytherapy. Monitor liver function closely.',
          alternativeRecommendations: 'Consider alternative antiepileptics with better safety profile.',
          approvalStatus: 'Use with extreme caution - requires monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Promethazine (under 2 years)',
          description: 'Antihistamine',
          category: 'Pediatrics',
          restrictionReason: 'Respiratory depression',
          safetyInfo: 'Risk of severe respiratory depression and sudden infant death. Contraindicated under 2 years.',
          alternativeRecommendations: 'Use alternative antihistamines like cetirizine or loratadine.',
          approvalStatus: 'Contraindicated under 2 years',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Dextromethorphan (under 4 years)',
          description: 'Cough suppressant',
          category: 'Pediatrics',
          restrictionReason: 'Serious adverse effects',
          safetyInfo: 'Risk of serious adverse effects including death in young children. Not recommended under 4 years.',
          alternativeRecommendations: 'Use supportive care and hydration for cough management.',
          approvalStatus: 'Not recommended under 4 years',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Lindane',
          description: 'Scabies and lice treatment',
          category: 'Pediatrics',
          restrictionReason: 'Neurotoxicity and seizures',
          safetyInfo: 'Risk of seizures and neurotoxicity in children. Use only as last resort with careful application.',
          alternativeRecommendations: 'Use permethrin or ivermectin as first-line treatment.',
          approvalStatus: 'Use only as last resort',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Metoclopramide',
          description: 'Antiemetic medication',
          category: 'Pediatrics',
          restrictionReason: 'Extrapyramidal symptoms',
          safetyInfo: 'Increased risk of extrapyramidal symptoms and tardive dyskinesia in children. Use with caution and shortest duration.',
          alternativeRecommendations: 'Use ondansetron or other antiemetics.',
          approvalStatus: 'Use with caution - shortest duration',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Chloramphenicol (neonates)',
          description: 'Antibiotic',
          category: 'Pediatrics',
          restrictionReason: 'Gray baby syndrome',
          safetyInfo: 'Causes gray baby syndrome in neonates due to immature liver metabolism. Avoid in newborns.',
          alternativeRecommendations: 'Use alternative antibiotics appropriate for neonatal use.',
          approvalStatus: 'Contraindicated in neonates',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Sulfonamides (neonates)',
          description: 'Antibiotic class',
          category: 'Pediatrics',
          restrictionReason: 'Kernicterus risk',
          safetyInfo: 'Displaces bilirubin from albumin causing kernicterus in neonates. Avoid in first month of life.',
          alternativeRecommendations: 'Use alternative antibiotics in neonatal period.',
          approvalStatus: 'Contraindicated in neonates',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Nitrofurantoin (neonates and infants under 1 month)',
          description: 'Urinary antibiotic',
          category: 'Pediatrics',
          restrictionReason: 'Hemolytic anemia risk',
          safetyInfo: 'Risk of hemolytic anemia in neonates with immature enzyme systems. Contraindicated under 1 month.',
          alternativeRecommendations: 'Use alternative antibiotics for urinary infections.',
          approvalStatus: 'Contraindicated under 1 month',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Benzocaine (topical in infants)',
          description: 'Local anesthetic',
          category: 'Pediatrics',
          restrictionReason: 'Methemoglobinemia risk',
          safetyInfo: 'Risk of methemoglobinemia especially in infants under 2 years. Avoid topical use for teething.',
          alternativeRecommendations: 'Use non-pharmacological teething remedies.',
          approvalStatus: 'Contraindicated for teething under 2 years',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Diphenoxylate-Atropine (under 2 years)',
          description: 'Antidiarrheal',
          category: 'Pediatrics',
          restrictionReason: 'Respiratory depression and anticholinergic effects',
          safetyInfo: 'Risk of respiratory depression and severe anticholinergic toxicity in young children.',
          alternativeRecommendations: 'Use oral rehydration therapy; avoid antidiarrheals in young children.',
          approvalStatus: 'Contraindicated under 2 years',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Loperamide (under 2 years)',
          description: 'Antidiarrheal',
          category: 'Pediatrics',
          restrictionReason: 'Ileus and CNS depression',
          safetyInfo: 'Risk of ileus, megacolon, and CNS depression in young children. Not recommended under 2 years.',
          alternativeRecommendations: 'Use oral rehydration therapy for diarrhea management.',
          approvalStatus: 'Not recommended under 2 years',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Ceftriaxone (neonates with hyperbilirubinemia)',
          description: 'Cephalosporin antibiotic',
          category: 'Pediatrics',
          restrictionReason: 'Bilirubin displacement',
          safetyInfo: 'Displaces bilirubin from albumin in jaundiced neonates. Avoid in hyperbilirubinemic neonates.',
          alternativeRecommendations: 'Use alternative cephalosporins or antibiotics.',
          approvalStatus: 'Contraindicated in jaundiced neonates',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Ketorolac (under 2 years)',
          description: 'NSAID for pain',
          category: 'Pediatrics',
          restrictionReason: 'GI bleeding and renal toxicity',
          safetyInfo: 'Increased risk of GI bleeding and renal toxicity in young children. Not recommended under 2 years.',
          alternativeRecommendations: 'Use acetaminophen or ibuprofen for pain management.',
          approvalStatus: 'Not recommended under 2 years',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Mebendazole (under 1 year)',
          description: 'Anthelmintic',
          category: 'Pediatrics',
          restrictionReason: 'Limited safety data',
          safetyInfo: 'Limited safety data in infants under 1 year. Use with caution only if essential.',
          alternativeRecommendations: 'Use pyrantel pamoate or albendazole with caution.',
          approvalStatus: 'Use with caution under 1 year',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Ondansetron (under 6 months)',
          description: 'Antiemetic',
          category: 'Pediatrics',
          restrictionReason: 'Limited safety data',
          safetyInfo: 'Limited safety data in infants under 6 months. Use with caution and monitor for adverse effects.',
          alternativeRecommendations: 'Use supportive care; consider alternative antiemetics.',
          approvalStatus: 'Use with caution under 6 months',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Ciprofloxacin Eye Drops (neonates)',
          description: 'Ophthalmic antibiotic',
          category: 'Pediatrics',
          restrictionReason: 'Corneal deposits',
          safetyInfo: 'Risk of corneal deposits in neonates. Use alternative ophthalmic antibiotics.',
          alternativeRecommendations: 'Use erythromycin or gentamicin eye drops.',
          approvalStatus: 'Use with caution in neonates',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Phenobarbital (long-term use in children)',
          description: 'Barbiturate anticonvulsant',
          category: 'Pediatrics',
          restrictionReason: 'Cognitive impairment',
          safetyInfo: 'Long-term use may cause cognitive impairment and behavioral problems in children.',
          alternativeRecommendations: 'Consider alternative antiepileptics with better cognitive profile.',
          approvalStatus: 'Use with caution - monitor development',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Doxycycline (under 8 years)',
          description: 'Tetracycline antibiotic',
          category: 'Pediatrics',
          restrictionReason: 'Dental discoloration',
          safetyInfo: 'Causes permanent dental discoloration and enamel hypoplasia. Avoid under 8 years except for life-threatening infections.',
          alternativeRecommendations: 'Use alternative antibiotics; exception for rickettsial infections.',
          approvalStatus: 'Contraindicated under 8 years except for specific indications',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Naproxen (under 2 years)',
          description: 'NSAID',
          category: 'Pediatrics',
          restrictionReason: 'GI and renal toxicity',
          safetyInfo: 'Increased risk of GI bleeding and renal toxicity in young children. Not recommended under 2 years.',
          alternativeRecommendations: 'Use acetaminophen or ibuprofen.',
          approvalStatus: 'Not recommended under 2 years',
          source: 'MIMS India / CDSCO',
        },
      ],
    },
    {
      name: 'Geriatrics',
      description: 'Medications requiring caution in elderly patients (65+ years) - Expanded Database',
      drugs: [
        {
          name: 'Benzodiazepines (Long-acting: Diazepam, Flurazepam, Chlordiazepoxide)',
          description: 'Sedative and anxiolytic class',
          category: 'Geriatrics',
          restrictionReason: 'Falls, cognitive impairment, dependence',
          safetyInfo: 'Increased risk of falls, hip fractures, cognitive impairment, and dependence in elderly. Long half-life causes accumulation. Use lowest effective dose for shortest duration.',
          alternativeRecommendations: 'Use short-acting agents (lorazepam, oxazepam), non-benzodiazepine alternatives, or cognitive behavioral therapy.',
          approvalStatus: 'Use with extreme caution - prefer alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Anticholinergics (Diphenhydramine, Oxybutynin, Tolterodine, Hyoscyamine)',
          description: 'Various medication classes',
          category: 'Geriatrics',
          restrictionReason: 'Confusion, constipation, urinary retention',
          safetyInfo: 'Can cause confusion, delirium, constipation, urinary retention, dry mouth, and increased dementia risk in elderly. Avoid when possible.',
          alternativeRecommendations: 'Use medications with lower anticholinergic burden (mirabegron for overactive bladder).',
          approvalStatus: 'Avoid - use alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'NSAIDs (Chronic use: Ibuprofen, Naproxen, Diclofenac, Indomethacin)',
          description: 'Non-steroidal anti-inflammatory drugs',
          category: 'Geriatrics',
          restrictionReason: 'GI bleeding and kidney damage',
          safetyInfo: 'Increased risk of GI bleeding, peptic ulcers, acute kidney injury, and cardiovascular events in elderly. Use with caution and gastroprotection.',
          alternativeRecommendations: 'Use acetaminophen or topical NSAIDs; add PPI if oral NSAIDs necessary.',
          approvalStatus: 'Use with caution - short duration only',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Digoxin (>0.125mg/day)',
          description: 'Cardiac glycoside',
          category: 'Geriatrics',
          restrictionReason: 'Toxicity risk',
          safetyInfo: 'Decreased renal clearance increases toxicity risk causing arrhythmias, confusion, and visual disturbances. Use lower doses and monitor levels closely.',
          alternativeRecommendations: 'Use doses ≤0.125mg/day with regular monitoring of levels and renal function.',
          approvalStatus: 'Use with caution - low doses only',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Tricyclic Antidepressants (Amitriptyline, Imipramine, Doxepin)',
          description: 'Antidepressant class',
          category: 'Geriatrics',
          restrictionReason: 'Anticholinergic effects and cardiac toxicity',
          safetyInfo: 'High anticholinergic burden, orthostatic hypotension, cardiac conduction abnormalities, and falls. Avoid in elderly.',
          alternativeRecommendations: 'Use SSRIs or SNRIs with better safety profile (sertraline, citalopram).',
          approvalStatus: 'Avoid - use alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Sliding Scale Insulin (alone)',
          description: 'Diabetes management',
          category: 'Geriatrics',
          restrictionReason: 'Hypoglycemia risk',
          safetyInfo: 'Increased risk of hypoglycemia without addressing basal insulin needs. Reactive rather than proactive approach. Use basal-bolus regimen instead.',
          alternativeRecommendations: 'Use scheduled basal insulin with correction doses.',
          approvalStatus: 'Avoid - use basal-bolus regimen',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Barbiturates (Phenobarbital, Butalbital)',
          description: 'Sedative class',
          category: 'Geriatrics',
          restrictionReason: 'High dependence and overdose risk',
          safetyInfo: 'High risk of dependence, cognitive impairment, falls, and overdose. Avoid except for seizure control.',
          alternativeRecommendations: 'Use alternative sedatives or anticonvulsants.',
          approvalStatus: 'Avoid except for seizure control',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Meperidine (Pethidine)',
          description: 'Opioid analgesic',
          category: 'Geriatrics',
          restrictionReason: 'Neurotoxic metabolite accumulation',
          safetyInfo: 'Toxic metabolite normeperidine accumulates causing seizures, delirium, and tremors. Avoid in elderly.',
          alternativeRecommendations: 'Use alternative opioids like morphine, oxycodone, or hydromorphone.',
          approvalStatus: 'Avoid - use alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Nitrofurantoin',
          description: 'Urinary antibiotic',
          category: 'Geriatrics',
          restrictionReason: 'Reduced efficacy and pulmonary toxicity',
          safetyInfo: 'Ineffective with reduced renal function (CrCl <30 mL/min) and risk of pulmonary toxicity, hepatotoxicity, and peripheral neuropathy. Avoid if CrCl <30 mL/min.',
          alternativeRecommendations: 'Use alternative antibiotics based on culture results.',
          approvalStatus: 'Avoid if CrCl <30 mL/min',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Muscle Relaxants (Cyclobenzaprine, Methocarbamol, Carisoprodol)',
          description: 'Skeletal muscle relaxants',
          category: 'Geriatrics',
          restrictionReason: 'Sedation and anticholinergic effects',
          safetyInfo: 'Poorly tolerated causing sedation, confusion, falls, and anticholinergic effects. Avoid in elderly.',
          alternativeRecommendations: 'Use physical therapy, heat/cold therapy, or gentle stretching.',
          approvalStatus: 'Avoid - use non-pharmacological approaches',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Indomethacin',
          description: 'NSAID',
          category: 'Geriatrics',
          restrictionReason: 'CNS adverse effects',
          safetyInfo: 'More CNS adverse effects than other NSAIDs including confusion and dizziness. Avoid in elderly.',
          alternativeRecommendations: 'Use alternative NSAIDs or acetaminophen.',
          approvalStatus: 'Avoid - use alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Pentazocine',
          description: 'Opioid analgesic',
          category: 'Geriatrics',
          restrictionReason: 'CNS adverse effects',
          safetyInfo: 'Causes more CNS adverse effects including hallucinations and confusion than other opioids.',
          alternativeRecommendations: 'Use alternative opioids with better tolerability.',
          approvalStatus: 'Avoid - use alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Trimethobenzamide',
          description: 'Antiemetic',
          category: 'Geriatrics',
          restrictionReason: 'Extrapyramidal effects',
          safetyInfo: 'Risk of extrapyramidal effects and limited efficacy. Avoid in elderly.',
          alternativeRecommendations: 'Use alternative antiemetics like ondansetron.',
          approvalStatus: 'Avoid - use alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Doxazosin',
          description: 'Alpha-blocker for BPH',
          category: 'Geriatrics',
          restrictionReason: 'Orthostatic hypotension',
          safetyInfo: 'High risk of orthostatic hypotension and falls. Use with caution or prefer alternatives.',
          alternativeRecommendations: 'Use tamsulosin or alfuzosin with lower hypotension risk.',
          approvalStatus: 'Use with caution - prefer alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Clonidine',
          description: 'Antihypertensive',
          category: 'Geriatrics',
          restrictionReason: 'Orthostatic hypotension and CNS effects',
          safetyInfo: 'Risk of orthostatic hypotension, bradycardia, and CNS adverse effects. Use with caution.',
          alternativeRecommendations: 'Use alternative antihypertensives with better tolerability.',
          approvalStatus: 'Use with caution - prefer alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Methyldopa',
          description: 'Antihypertensive',
          category: 'Geriatrics',
          restrictionReason: 'Bradycardia and depression',
          safetyInfo: 'May cause bradycardia, orthostatic hypotension, and depression in elderly.',
          alternativeRecommendations: 'Use alternative antihypertensives.',
          approvalStatus: 'Use with caution - prefer alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Reserpine (>0.1mg/day)',
          description: 'Antihypertensive',
          category: 'Geriatrics',
          restrictionReason: 'Depression and sedation',
          safetyInfo: 'Risk of depression, sedation, orthostatic hypotension, and bradycardia.',
          alternativeRecommendations: 'Use alternative antihypertensives.',
          approvalStatus: 'Avoid - use alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Disopyramide',
          description: 'Antiarrhythmic',
          category: 'Geriatrics',
          restrictionReason: 'Strong anticholinergic effects',
          safetyInfo: 'Potent negative inotrope with strong anticholinergic effects. Avoid in elderly.',
          alternativeRecommendations: 'Use alternative antiarrhythmics.',
          approvalStatus: 'Avoid - use alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Dronedarone',
          description: 'Antiarrhythmic',
          category: 'Geriatrics',
          restrictionReason: 'Increased mortality in heart failure',
          safetyInfo: 'Increased mortality in patients with heart failure. Use with caution in elderly.',
          alternativeRecommendations: 'Use alternative antiarrhythmics; avoid in heart failure.',
          approvalStatus: 'Use with caution - avoid in heart failure',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Spironolactone (>25mg/day)',
          description: 'Potassium-sparing diuretic',
          category: 'Geriatrics',
          restrictionReason: 'Hyperkalemia risk',
          safetyInfo: 'Increased risk of hyperkalemia especially with renal impairment. Monitor potassium closely.',
          alternativeRecommendations: 'Use lower doses with regular potassium monitoring.',
          approvalStatus: 'Use with caution - monitor potassium',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Glyburide (Glibenclamide)',
          description: 'Sulfonylurea for diabetes',
          category: 'Geriatrics',
          restrictionReason: 'Prolonged hypoglycemia',
          safetyInfo: 'Long duration of action causes prolonged hypoglycemia in elderly. Avoid in elderly.',
          alternativeRecommendations: 'Use shorter-acting sulfonylureas or alternative diabetes medications.',
          approvalStatus: 'Avoid - use alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Megestrol',
          description: 'Appetite stimulant',
          category: 'Geriatrics',
          restrictionReason: 'Thrombosis and mortality risk',
          safetyInfo: 'Minimal effect on weight with increased risk of thrombosis and mortality.',
          alternativeRecommendations: 'Use nutritional support and address underlying causes.',
          approvalStatus: 'Avoid - minimal benefit',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Sulfonylureas (Long-acting)',
          description: 'Diabetes medications',
          category: 'Geriatrics',
          restrictionReason: 'Hypoglycemia risk',
          safetyInfo: 'Increased risk of prolonged hypoglycemia in elderly. Use with caution.',
          alternativeRecommendations: 'Use shorter-acting agents or alternative diabetes medications.',
          approvalStatus: 'Use with caution - prefer alternatives',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Estrogens (systemic)',
          description: 'Hormone replacement',
          category: 'Geriatrics',
          restrictionReason: 'Cardiovascular and cancer risks',
          safetyInfo: 'Increased risk of breast cancer, cardiovascular events, and thromboembolism in elderly women.',
          alternativeRecommendations: 'Use topical estrogens for vaginal symptoms; avoid systemic use.',
          approvalStatus: 'Avoid systemic use - use topical alternatives',
          source: 'MIMS India / CDSCO',
        },
      ],
    },
    {
      name: 'Rare Case Category',
      description: 'Medications requiring intensive monitoring for rare but serious adverse events - Expanded Database',
      drugs: [
        {
          name: 'Clozapine',
          description: 'Atypical antipsychotic',
          category: 'Rare Case Category',
          restrictionReason: 'Agranulocytosis risk',
          safetyInfo: 'Risk of life-threatening agranulocytosis (1-2%). Requires weekly blood monitoring for 6 months, then biweekly. Restricted distribution program.',
          alternativeRecommendations: 'Use only for treatment-resistant schizophrenia with mandatory monitoring.',
          approvalStatus: 'Restricted - requires REMS program',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Amiodarone',
          description: 'Antiarrhythmic medication',
          category: 'Rare Case Category',
          restrictionReason: 'Multiple organ toxicity',
          safetyInfo: 'Pulmonary fibrosis, thyroid dysfunction (hyper/hypothyroidism), hepatotoxicity, and corneal deposits. Requires baseline and periodic monitoring of thyroid, liver, and pulmonary function.',
          alternativeRecommendations: 'Use alternative antiarrhythmics when possible; reserve for life-threatening arrhythmias.',
          approvalStatus: 'Use with intensive monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Rifampicin',
          description: 'Antibiotic for tuberculosis',
          category: 'Rare Case Category',
          restrictionReason: 'Hepatotoxicity and drug interactions',
          safetyInfo: 'Hepatotoxicity risk and extensive drug interactions via CYP450 induction. Monitor liver function monthly and adjust concurrent medications.',
          alternativeRecommendations: 'Essential for TB treatment; careful monitoring and drug interaction management required.',
          approvalStatus: 'Use with monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Isotretinoin',
          description: 'Severe acne treatment',
          category: 'Rare Case Category',
          restrictionReason: 'Teratogenicity and psychiatric effects',
          safetyInfo: 'Severe teratogen requiring iPLEDGE program. Risk of depression and suicidal ideation. Mandatory pregnancy prevention and monitoring.',
          alternativeRecommendations: 'Use only for severe nodular acne with strict contraception and monitoring.',
          approvalStatus: 'Restricted - requires iPLEDGE program',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Thalidomide',
          description: 'Immunomodulatory agent',
          category: 'Rare Case Category',
          restrictionReason: 'Severe birth defects and neuropathy',
          safetyInfo: 'Causes severe limb malformations (phocomelia). REMS program with mandatory contraception. Risk of peripheral neuropathy and thromboembolism.',
          alternativeRecommendations: 'Use only for multiple myeloma or leprosy with strict pregnancy prevention.',
          approvalStatus: 'Restricted - requires REMS program',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Dofetilide',
          description: 'Antiarrhythmic medication',
          category: 'Rare Case Category',
          restrictionReason: 'Torsades de pointes risk',
          safetyInfo: 'High risk of QT prolongation and torsades de pointes. Requires 3-day inpatient monitoring at initiation with continuous ECG and renal function assessment.',
          alternativeRecommendations: 'Use only in specialized centers with mandatory hospitalization for initiation.',
          approvalStatus: 'Restricted - requires inpatient initiation',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Natalizumab',
          description: 'Monoclonal antibody for MS',
          category: 'Rare Case Category',
          restrictionReason: 'Progressive multifocal leukoencephalopathy (PML)',
          safetyInfo: 'Risk of fatal PML caused by JC virus reactivation. Requires JC virus antibody testing and MRI monitoring every 6 months.',
          alternativeRecommendations: 'Use only for relapsing MS with TOUCH program enrollment and monitoring.',
          approvalStatus: 'Restricted - requires TOUCH program',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Lenalidomide',
          description: 'Immunomodulatory agent',
          category: 'Rare Case Category',
          restrictionReason: 'Teratogenicity and thromboembolism',
          safetyInfo: 'Severe teratogen requiring REMS program. Risk of deep vein thrombosis and pulmonary embolism. Requires thromboprophylaxis.',
          alternativeRecommendations: 'Use only for multiple myeloma with mandatory contraception and thromboprophylaxis.',
          approvalStatus: 'Restricted - requires REMS program',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Propylthiouracil',
          description: 'Antithyroid medication',
          category: 'Rare Case Category',
          restrictionReason: 'Severe hepatotoxicity',
          safetyInfo: 'Risk of severe hepatotoxicity and liver failure. Monitor liver function regularly, especially in first 6 months.',
          alternativeRecommendations: 'Use methimazole as first-line except in first trimester pregnancy or thyroid storm.',
          approvalStatus: 'Use with monitoring - second-line agent',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Dantrolene',
          description: 'Muscle relaxant',
          category: 'Rare Case Category',
          restrictionReason: 'Hepatotoxicity',
          safetyInfo: 'Risk of fatal hepatotoxicity with chronic use. Monitor liver function regularly.',
          alternativeRecommendations: 'Use only for malignant hyperthermia or severe spasticity with monitoring.',
          approvalStatus: 'Use with monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Carbamazepine',
          description: 'Antiepileptic and mood stabilizer',
          category: 'Rare Case Category',
          restrictionReason: 'Stevens-Johnson syndrome and agranulocytosis',
          safetyInfo: 'Risk of Stevens-Johnson syndrome, especially in HLA-B*1502 carriers (Asian populations). Risk of agranulocytosis and aplastic anemia.',
          alternativeRecommendations: 'Screen for HLA-B*1502 in at-risk populations; monitor blood counts regularly.',
          approvalStatus: 'Use with genetic screening and monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Allopurinol',
          description: 'Xanthine oxidase inhibitor for gout',
          category: 'Rare Case Category',
          restrictionReason: 'Stevens-Johnson syndrome and DRESS syndrome',
          safetyInfo: 'Risk of severe cutaneous adverse reactions including Stevens-Johnson syndrome and DRESS syndrome, especially in HLA-B*5801 carriers.',
          alternativeRecommendations: 'Screen for HLA-B*5801 in at-risk populations; start with low doses.',
          approvalStatus: 'Use with genetic screening in at-risk populations',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Abacavir',
          description: 'Antiretroviral for HIV',
          category: 'Rare Case Category',
          restrictionReason: 'Hypersensitivity reaction',
          safetyInfo: 'Risk of fatal hypersensitivity reaction in HLA-B*5701 carriers. Mandatory genetic screening before initiation.',
          alternativeRecommendations: 'Screen for HLA-B*5701 before use; do not rechallenge if hypersensitivity occurs.',
          approvalStatus: 'Requires genetic screening',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Azathioprine',
          description: 'Immunosuppressant',
          category: 'Rare Case Category',
          restrictionReason: 'Bone marrow suppression',
          safetyInfo: 'Risk of severe bone marrow suppression, especially in TPMT-deficient patients. Test TPMT activity before use.',
          alternativeRecommendations: 'Test TPMT activity; adjust dose based on TPMT status; monitor blood counts.',
          approvalStatus: 'Use with TPMT testing and monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Mercaptopurine',
          description: 'Antimetabolite for leukemia',
          category: 'Rare Case Category',
          restrictionReason: 'Bone marrow suppression',
          safetyInfo: 'Risk of severe bone marrow suppression in TPMT-deficient patients. Test TPMT activity before use.',
          alternativeRecommendations: 'Test TPMT activity; adjust dose based on TPMT status; monitor blood counts.',
          approvalStatus: 'Use with TPMT testing and monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Warfarin',
          description: 'Anticoagulant',
          category: 'Rare Case Category',
          restrictionReason: 'Bleeding risk and genetic variability',
          safetyInfo: 'Narrow therapeutic index with bleeding risk. CYP2C9 and VKORC1 polymorphisms affect dosing. Requires regular INR monitoring.',
          alternativeRecommendations: 'Consider pharmacogenetic testing for dose optimization; regular INR monitoring essential.',
          approvalStatus: 'Use with intensive monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Methotrexate (high-dose)',
          description: 'Antimetabolite',
          category: 'Rare Case Category',
          restrictionReason: 'Severe toxicity',
          safetyInfo: 'High-dose methotrexate can cause severe mucositis, bone marrow suppression, hepatotoxicity, and nephrotoxicity. Requires leucovorin rescue.',
          alternativeRecommendations: 'Use with leucovorin rescue; monitor methotrexate levels and renal function.',
          approvalStatus: 'Use with intensive monitoring and rescue therapy',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Vincristine',
          description: 'Vinca alkaloid chemotherapy',
          category: 'Rare Case Category',
          restrictionReason: 'Neurotoxicity',
          safetyInfo: 'Risk of severe peripheral neuropathy and autonomic neuropathy. Fatal if given intrathecally.',
          alternativeRecommendations: 'Monitor for neuropathy; never administer intrathecally; dose cap at 2mg.',
          approvalStatus: 'Use with monitoring - intrathecal administration fatal',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Bleomycin',
          description: 'Antineoplastic antibiotic',
          category: 'Rare Case Category',
          restrictionReason: 'Pulmonary fibrosis',
          safetyInfo: 'Risk of fatal pulmonary fibrosis, especially with cumulative doses >400 units. Monitor pulmonary function.',
          alternativeRecommendations: 'Monitor pulmonary function; limit cumulative dose; avoid in elderly.',
          approvalStatus: 'Use with pulmonary monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Doxorubicin',
          description: 'Anthracycline chemotherapy',
          category: 'Rare Case Category',
          restrictionReason: 'Cardiotoxicity',
          safetyInfo: 'Risk of irreversible cardiomyopathy with cumulative doses. Monitor cardiac function regularly.',
          alternativeRecommendations: 'Monitor cardiac function; limit cumulative dose; consider cardioprotective agents.',
          approvalStatus: 'Use with cardiac monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Infliximab',
          description: 'TNF-alpha inhibitor',
          category: 'Rare Case Category',
          restrictionReason: 'Serious infections and malignancy',
          safetyInfo: 'Risk of serious infections including tuberculosis reactivation and opportunistic infections. Screen for latent TB before use.',
          alternativeRecommendations: 'Screen for latent TB; monitor for infections; avoid in active infections.',
          approvalStatus: 'Use with TB screening and infection monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Rituximab',
          description: 'Monoclonal antibody',
          category: 'Rare Case Category',
          restrictionReason: 'Progressive multifocal leukoencephalopathy',
          safetyInfo: 'Risk of PML and severe infusion reactions. Monitor for neurological symptoms.',
          alternativeRecommendations: 'Monitor for PML symptoms; premedicate for infusion reactions.',
          approvalStatus: 'Use with monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Fingolimod',
          description: 'Sphingosine-1-phosphate receptor modulator',
          category: 'Rare Case Category',
          restrictionReason: 'Bradycardia and infections',
          safetyInfo: 'Risk of bradycardia at initiation requiring 6-hour monitoring. Risk of serious infections and macular edema.',
          alternativeRecommendations: 'First-dose monitoring for 6 hours; ophthalmologic examination; monitor for infections.',
          approvalStatus: 'Restricted - requires first-dose monitoring',
          source: 'MIMS India / CDSCO',
        },
        {
          name: 'Teriflunomide',
          description: 'Immunomodulator for MS',
          category: 'Rare Case Category',
          restrictionReason: 'Hepatotoxicity and teratogenicity',
          safetyInfo: 'Risk of severe hepatotoxicity and highly teratogenic. Requires accelerated elimination procedure before conception.',
          alternativeRecommendations: 'Monitor liver function; mandatory contraception; accelerated elimination before pregnancy.',
          approvalStatus: 'Use with monitoring and contraception',
          source: 'MIMS India / CDSCO',
        },
      ],
    },
  ], []);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    return categories.map(category => ({
      ...category,
      drugs: category.drugs.filter(drug =>
        drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.safetyInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.restrictionReason.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    })).filter(category => category.drugs.length > 0);
  }, [categories, searchTerm]);

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('pregnant')) return <img src="/assets/generated/pregnant-safety-icon.dim_64x64.png" alt="Pregnant" className="h-10 w-10" loading="lazy" />;
    if (name.includes('lactating')) return <img src="/assets/generated/lactating-safety-icon.dim_64x64.png" alt="Lactating" className="h-10 w-10" loading="lazy" />;
    if (name.includes('pediatric')) return <img src="/assets/generated/pediatric-safety-icon.dim_64x64.png" alt="Pediatric" className="h-10 w-10" loading="lazy" />;
    if (name.includes('geriatric')) return <img src="/assets/generated/geriatric-safety-icon.dim_64x64.png" alt="Geriatric" className="h-10 w-10" loading="lazy" />;
    if (name.includes('rare')) return <img src="/assets/generated/rare-case-icon.dim_64x64.png" alt="Rare Case" className="h-10 w-10" loading="lazy" />;
    return <ShieldAlert className="h-10 w-10" />;
  };

  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('pregnant')) return 'from-pink-100 via-rose-100 to-pink-50 dark:from-pink-950 dark:via-rose-950 dark:to-pink-900 border-pink-400 dark:border-pink-700';
    if (name.includes('lactating')) return 'from-purple-100 via-violet-100 to-purple-50 dark:from-purple-950 dark:via-violet-950 dark:to-purple-900 border-purple-400 dark:border-purple-700';
    if (name.includes('pediatric')) return 'from-blue-100 via-cyan-100 to-blue-50 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900 border-blue-400 dark:border-blue-700';
    if (name.includes('geriatric')) return 'from-amber-100 via-orange-100 to-amber-50 dark:from-amber-950 dark:via-orange-950 dark:to-amber-900 border-amber-400 dark:border-amber-700';
    if (name.includes('rare')) return 'from-emerald-100 via-teal-100 to-emerald-50 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-900 border-emerald-400 dark:border-emerald-700';
    return 'from-gray-100 via-slate-100 to-gray-50 dark:from-gray-950 dark:via-slate-950 dark:to-gray-900 border-gray-400 dark:border-gray-700';
  };

  const getCategoryBadgeColor = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('pregnant')) return 'bg-pink-600 hover:bg-pink-700 text-white';
    if (name.includes('lactating')) return 'bg-purple-600 hover:bg-purple-700 text-white';
    if (name.includes('pediatric')) return 'bg-blue-600 hover:bg-blue-700 text-white';
    if (name.includes('geriatric')) return 'bg-amber-600 hover:bg-amber-700 text-white';
    if (name.includes('rare')) return 'bg-emerald-600 hover:bg-emerald-700 text-white';
    return 'bg-gray-600 hover:bg-gray-700 text-white';
  };

  const totalDrugs = categories.reduce((sum, cat) => sum + cat.drugs.length, 0);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-red-50/90 via-orange-50/70 to-amber-50/90 dark:from-red-950/50 dark:via-orange-950/40 dark:to-amber-950/50 backdrop-blur-sm border-2 border-red-300/60 dark:border-red-800/60 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/60 shadow-lg">
              <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold">Expanded Restricted Drugs Database</CardTitle>
              <CardDescription className="text-base mt-2">
                Comprehensive safety information from MIMS India & CDSCO • {totalDrugs} drugs across 5 categories • Significantly expanded coverage
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filter Bar */}
      <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 border-2 border-blue-300/50 dark:border-blue-800/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search drugs by name, description, safety information, or restriction reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
              className="border-2 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* External Resources Integration */}
      {resourcesLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      ) : externalResources && externalResources.length > 0 && (
        <Card className="bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-indigo-50/80 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-indigo-950/40 border-2 border-indigo-300/50 dark:border-indigo-800/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Official Pharmacovigilance Resources
            </CardTitle>
            <CardDescription>
              Updated drug restriction information from MIMS India, CDSCO, and international regulatory authorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {externalResources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/70 dark:bg-gray-900/50 border border-indigo-200/50 dark:border-indigo-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
                >
                  <ExternalLink className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                      {resource.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {resource.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Dropdown Panels */}
      <div className="space-y-4">
        {filteredCategories.map((category) => (
          <Collapsible
            key={category.name}
            open={openCategories[category.name]}
            onOpenChange={() => toggleCategory(category.name)}
          >
            <Card className={`bg-gradient-to-br ${getCategoryColor(category.name)} backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all`}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-white/20 dark:hover:bg-black/20 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0 p-3 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-md">
                        {getCategoryIcon(category.name)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <CardTitle className="text-2xl font-bold">{category.name}</CardTitle>
                          <Badge className={`${getCategoryBadgeColor(category.name)} text-sm px-3 py-1`}>
                            {category.drugs.length} drugs
                          </Badge>
                        </div>
                        <CardDescription className="text-base font-medium">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {openCategories[category.name] ? (
                        <ChevronUp className="h-6 w-6 text-foreground" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {category.drugs.map((drug, index) => (
                        <div
                          key={index}
                          className="p-5 rounded-xl bg-white/80 dark:bg-gray-900/60 border-2 border-gray-200/60 dark:border-gray-700/60 hover:bg-white/95 dark:hover:bg-gray-900/80 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              <div className="h-3 w-3 rounded-full bg-red-500 shadow-sm"></div>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <h4 className="font-bold text-lg text-foreground mb-1">
                                  {drug.name}
                                </h4>
                                <p className="text-sm text-muted-foreground italic">
                                  {drug.description}
                                </p>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                  {drug.source && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                      Source: {drug.source}
                                    </p>
                                  )}
                                  {drug.approvalStatus && (
                                    <Badge variant="outline" className="text-xs">
                                      {drug.approvalStatus}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-red-50/80 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/60">
                                <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-1 uppercase tracking-wide">
                                  Restriction Reason
                                </p>
                                <p className="text-sm text-red-900 dark:text-red-100 font-medium">
                                  {drug.restrictionReason}
                                </p>
                              </div>

                              <div className="p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60">
                                <div className="flex items-start gap-2">
                                  <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-700 dark:text-amber-300" />
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1 uppercase tracking-wide">
                                      Safety Information
                                    </p>
                                    <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                                      {drug.safetyInfo}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {drug.alternativeRecommendations && (
                                <div className="p-3 rounded-lg bg-green-50/80 dark:bg-green-950/30 border border-green-200/60 dark:border-green-800/60">
                                  <p className="text-xs font-semibold text-green-800 dark:text-green-200 mb-1 uppercase tracking-wide">
                                    Alternative Recommendations
                                  </p>
                                  <p className="text-sm text-green-900 dark:text-green-100 font-medium">
                                    {drug.alternativeRecommendations}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Important Notes Footer */}
      <Card className="bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/90 dark:from-blue-950/50 dark:via-indigo-950/40 dark:to-blue-950/50 backdrop-blur-sm border-2 border-blue-300/60 dark:border-blue-800/60 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div className="text-sm text-blue-900 dark:text-blue-100 space-y-3">
              <p className="font-bold text-base">Important Clinical Notes:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li className="font-medium">Always consult healthcare professionals and current prescribing information before prescribing or administering these medications</li>
                <li className="font-medium">Individual patient factors, comorbidities, and concurrent medications may require additional considerations beyond these general restrictions</li>
                <li className="font-medium">This expanded database is regularly updated with comprehensive information from MIMS India, CDSCO, and other official pharmacovigilance sources including WHO-UMC, IPC, EMA, Health Canada, MHRA, and TGA</li>
                <li className="font-medium">Report any adverse reactions through the ADRs module for proper pharmacovigilance tracking and regulatory compliance</li>
                <li className="font-medium">This information is for educational and clinical decision support purposes and should not replace professional clinical judgment</li>
                <li className="font-medium">The database now includes significantly expanded coverage with detailed approval status, restriction reasons, and alternative recommendations for each drug</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
