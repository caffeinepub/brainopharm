import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ExternalLink, AlertTriangle, Info, GitCompare, Database, Shield, Activity, Pill, Lightbulb, Apple, UtensilsCrossed } from 'lucide-react';
import { useCheckMultiDrugInteraction, useCheckDrugFoodInteractions, useCheckFoodFoodInteractions } from '../hooks/useQueries';
import { Skeleton } from './ui/skeleton';
import { Severity, InteractionType, EvidenceLevel, ToxicityRiskLevel } from '../backend';
import type { ClinicallyOrientedInteraction } from '../backend';
import { generateOverallSummary, formatSeverity, formatToxicityRisk } from '../utils/interactionSummary';
import { normalizeDrugName, formatDrugPairLabel } from '../utils/drugPairs';
import { drugInteractionExamples, loadExampleSet } from '../data/drugInteractionExamples';
import { NameAutocompleteInput } from './NameAutocompleteInput';
import { getAllDrugNames, getAllFoodNames } from '../services/interactionNameCatalog';
import { findDuplicateNames } from '../utils/nameNormalization';
import { formatPairLabel } from '../utils/namePairs';

// Memoized drug pair interaction card component
const DrugPairCard = memo(({ 
  interaction, 
  getSeverityBadgeVariant, 
  getToxicityBadgeVariant,
  getInteractionTypeLabel,
  getEvidenceLevelLabel,
  hasRealData 
}: {
  interaction: ClinicallyOrientedInteraction;
  getSeverityBadgeVariant: (severity?: Severity) => 'default' | 'secondary' | 'destructive' | 'outline';
  getToxicityBadgeVariant: (risk?: ToxicityRiskLevel) => 'default' | 'secondary' | 'destructive' | 'outline';
  getInteractionTypeLabel: (type?: InteractionType | null) => string;
  getEvidenceLevelLabel: (level?: EvidenceLevel | null) => string;
  hasRealData: (interaction: ClinicallyOrientedInteraction) => boolean;
}) => {
  const pairLabel = formatDrugPairLabel(interaction.drugs.drugA, interaction.drugs.drugB);
  const hasData = hasRealData(interaction);
  
  if (!hasData) {
    return (
      <Card key={pairLabel} className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="h-5 w-5 text-gray-500" />
            {pairLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/30">
            <Info className="h-4 w-4 text-gray-500" />
            <AlertDescription className="text-gray-700 dark:text-gray-300">
              No interaction data found for this pair in the local database. This does not necessarily mean they are safe to combine. Always consult current medical literature and prescribing information.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card key={pairLabel} className="border-2 border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          {pairLabel}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {interaction.severity && (
            <Badge variant={getSeverityBadgeVariant(interaction.severity)}>
              Severity: {formatSeverity(interaction.severity)}
            </Badge>
          )}
          {interaction.toxicityRisk && (
            <Badge variant={getToxicityBadgeVariant(interaction.toxicityRisk)}>
              Toxicity: {formatToxicityRisk(interaction.toxicityRisk)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {interaction.description && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Description
            </h4>
            <p className="text-sm text-muted-foreground">{interaction.description}</p>
          </div>
        )}
        
        {interaction.clinicalEffects && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Clinical Effects
            </h4>
            <p className="text-sm text-muted-foreground">{interaction.clinicalEffects}</p>
          </div>
        )}
        
        {interaction.managementRecommendations && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Management Recommendations
            </h4>
            <p className="text-sm text-muted-foreground">{interaction.managementRecommendations}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <h4 className="font-semibold text-xs mb-1 text-muted-foreground">Interaction Type</h4>
            <p className="text-sm">{getInteractionTypeLabel(interaction.interactionType)}</p>
          </div>
          <div>
            <h4 className="font-semibold text-xs mb-1 text-muted-foreground">Evidence Level</h4>
            <p className="text-sm">{getEvidenceLevelLabel(interaction.evidenceLevel)}</p>
          </div>
        </div>
        
        {interaction.references && interaction.references.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs mb-2 text-muted-foreground">References</h4>
            <div className="space-y-1">
              {interaction.references.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  {ref.length > 60 ? ref.substring(0, 60) + '...' : ref}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

DrugPairCard.displayName = 'DrugPairCard';

// Drug-Food interaction card component
const DrugFoodCard = memo(({ 
  interaction 
}: {
  interaction: {
    drug: string;
    food: string;
    interactionType?: string;
    description?: string;
    clinicalEffects?: string;
    toxicityRisk?: string;
    managementRecommendations?: string;
    evidenceLevel?: string;
    references: string[];
  };
}) => {
  const pairLabel = `${interaction.drug} + ${interaction.food}`;
  const hasData = !!(interaction.description || interaction.clinicalEffects || interaction.managementRecommendations);
  
  if (!hasData) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Apple className="h-5 w-5 text-gray-500" />
            {pairLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/30">
            <Info className="h-4 w-4 text-gray-500" />
            <AlertDescription className="text-gray-700 dark:text-gray-300">
              No interaction data found for this combination in the local database.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-2 border-green-200 dark:border-green-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Apple className="h-5 w-5 text-green-600 dark:text-green-400" />
          {pairLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {interaction.description && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Description
            </h4>
            <p className="text-sm text-muted-foreground">{interaction.description}</p>
          </div>
        )}
        
        {interaction.clinicalEffects && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Clinical Effects
            </h4>
            <p className="text-sm text-muted-foreground">{interaction.clinicalEffects}</p>
          </div>
        )}
        
        {interaction.managementRecommendations && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Management Recommendations
            </h4>
            <p className="text-sm text-muted-foreground">{interaction.managementRecommendations}</p>
          </div>
        )}
        
        {interaction.references && interaction.references.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs mb-2 text-muted-foreground">References</h4>
            <div className="space-y-1">
              {interaction.references.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  {ref.length > 60 ? ref.substring(0, 60) + '...' : ref}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

DrugFoodCard.displayName = 'DrugFoodCard';

// Food-Food interaction card component
const FoodFoodCard = memo(({ 
  interaction 
}: {
  interaction: {
    foodA: string;
    foodB: string;
    description?: string;
    clinicalEffects?: string;
    managementRecommendations?: string;
    references: string[];
  };
}) => {
  const pairLabel = `${interaction.foodA} + ${interaction.foodB}`;
  const hasData = !!(interaction.description || interaction.clinicalEffects || interaction.managementRecommendations);
  
  if (!hasData) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-gray-500" />
            {pairLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/30">
            <Info className="h-4 w-4 text-gray-500" />
            <AlertDescription className="text-gray-700 dark:text-gray-300">
              No interaction data found for this combination in the local database.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          {pairLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {interaction.description && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Description
            </h4>
            <p className="text-sm text-muted-foreground">{interaction.description}</p>
          </div>
        )}
        
        {interaction.clinicalEffects && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Clinical Effects
            </h4>
            <p className="text-sm text-muted-foreground">{interaction.clinicalEffects}</p>
          </div>
        )}
        
        {interaction.managementRecommendations && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Management Recommendations
            </h4>
            <p className="text-sm text-muted-foreground">{interaction.managementRecommendations}</p>
          </div>
        )}
        
        {interaction.references && interaction.references.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs mb-2 text-muted-foreground">References</h4>
            <div className="space-y-1">
              {interaction.references.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  {ref.length > 60 ? ref.substring(0, 60) + '...' : ref}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

FoodFoodCard.displayName = 'FoodFoodCard';

export default function DrugInteractionsModule() {
  // Drug-Drug state
  const [drug1, setDrug1] = useState('');
  const [drug2, setDrug2] = useState('');
  const [drug3, setDrug3] = useState('');
  const [drug4, setDrug4] = useState('');
  const [drugDrugSearchPerformed, setDrugDrugSearchPerformed] = useState(false);
  const [drugDrugValidationError, setDrugDrugValidationError] = useState('');
  const [selectedExample, setSelectedExample] = useState<string>('');
  const [drugsToCheck, setDrugsToCheck] = useState<string[]>([]);

  // Drug-Food state
  const [dfDrug1, setDfDrug1] = useState('');
  const [dfDrug2, setDfDrug2] = useState('');
  const [dfFood1, setDfFood1] = useState('');
  const [dfFood2, setDfFood2] = useState('');
  const [drugFoodSearchPerformed, setDrugFoodSearchPerformed] = useState(false);
  const [drugFoodValidationError, setDrugFoodValidationError] = useState('');
  const [drugFoodToCheck, setDrugFoodToCheck] = useState<{ drugs: string[]; foods: string[] }>({ drugs: [], foods: [] });

  // Food-Food state
  const [food1, setFood1] = useState('');
  const [food2, setFood2] = useState('');
  const [food3, setFood3] = useState('');
  const [food4, setFood4] = useState('');
  const [foodFoodSearchPerformed, setFoodFoodSearchPerformed] = useState(false);
  const [foodFoodValidationError, setFoodFoodValidationError] = useState('');
  const [foodsToCheck, setFoodsToCheck] = useState<string[]>([]);

  // Get suggestion lists
  const drugSuggestions = useMemo(() => getAllDrugNames(), []);
  const foodSuggestions = useMemo(() => getAllFoodNames(), []);

  // Drug-Drug queries
  const enteredDrugs = useMemo(() => 
    [drug1.trim(), drug2.trim(), drug3.trim(), drug4.trim()].filter(d => d),
    [drug1, drug2, drug3, drug4]
  );
  
  const canCheckDrugDrug = useMemo(() => enteredDrugs.length >= 2, [enteredDrugs]);
  const checkDrugDrugInteraction = useCheckMultiDrugInteraction(drugsToCheck);
  const drugDrugAdvisory = checkDrugDrugInteraction.data || [];
  const drugDrugOverallSummary = useMemo(() => 
    drugDrugAdvisory.length > 0 ? generateOverallSummary(drugDrugAdvisory) : null,
    [drugDrugAdvisory]
  );

  // Drug-Food queries
  const enteredDfDrugs = useMemo(() => 
    [dfDrug1.trim(), dfDrug2.trim()].filter(d => d),
    [dfDrug1, dfDrug2]
  );
  const enteredDfFoods = useMemo(() => 
    [dfFood1.trim(), dfFood2.trim()].filter(f => f),
    [dfFood1, dfFood2]
  );
  const canCheckDrugFood = useMemo(() => 
    enteredDfDrugs.length >= 1 && enteredDfFoods.length >= 1,
    [enteredDfDrugs, enteredDfFoods]
  );
  const checkDrugFoodInteraction = useCheckDrugFoodInteractions(drugFoodToCheck.drugs, drugFoodToCheck.foods);
  const drugFoodResults = checkDrugFoodInteraction.data || [];

  // Food-Food queries
  const enteredFoods = useMemo(() => 
    [food1.trim(), food2.trim(), food3.trim(), food4.trim()].filter(f => f),
    [food1, food2, food3, food4]
  );
  const canCheckFoodFood = useMemo(() => enteredFoods.length >= 2, [enteredFoods]);
  const checkFoodFoodInteraction = useCheckFoodFoodInteractions(foodsToCheck);
  const foodFoodResults = checkFoodFoodInteraction.data || [];

  // Drug-Drug handlers
  const handleCheckDrugDrugInteraction = useCallback(async () => {
    setDrugDrugValidationError('');

    const drugs = enteredDrugs;

    if (drugs.length < 2) {
      setDrugDrugValidationError('Please enter at least two medications to check interactions.');
      return;
    }

    const duplicates = findDuplicateNames(drugs);
    if (duplicates.length > 0) {
      setDrugDrugValidationError('Please enter different medications. Duplicate drug names detected.');
      return;
    }

    // Create a fresh copy of the array to ensure React Query sees it as a new value
    setDrugsToCheck([...drugs]);
    setDrugDrugSearchPerformed(true);
    setDrugDrugValidationError('');
  }, [enteredDrugs]);

  const handleResetDrugDrug = useCallback(() => {
    setDrug1('');
    setDrug2('');
    setDrug3('');
    setDrug4('');
    setDrugDrugSearchPerformed(false);
    setDrugDrugValidationError('');
    setSelectedExample('');
    setDrugsToCheck([]);
  }, []);

  const handleLoadExample = useCallback((exampleId: string) => {
    if (!exampleId) return;
    
    const example = loadExampleSet(exampleId);
    setDrug1(example.drug1);
    setDrug2(example.drug2);
    setDrug3(example.drug3);
    setDrug4(example.drug4);
    setSelectedExample(exampleId);
    setDrugDrugSearchPerformed(false);
    setDrugDrugValidationError('');
    setDrugsToCheck([]);
  }, []);

  // Drug-Food handlers
  const handleCheckDrugFoodInteraction = useCallback(() => {
    setDrugFoodValidationError('');

    const drugs = enteredDfDrugs;
    const foods = enteredDfFoods;

    if (drugs.length < 1 || foods.length < 1) {
      setDrugFoodValidationError('Please enter at least one drug and one food item to check interactions.');
      return;
    }

    const allItems = [...drugs, ...foods];
    const duplicates = findDuplicateNames(allItems);
    if (duplicates.length > 0) {
      setDrugFoodValidationError('Please enter different items. Duplicate names detected.');
      return;
    }

    // Create fresh copies of the arrays to ensure React Query sees them as new values
    setDrugFoodToCheck({ drugs: [...drugs], foods: [...foods] });
    setDrugFoodSearchPerformed(true);
    setDrugFoodValidationError('');
  }, [enteredDfDrugs, enteredDfFoods]);

  const handleResetDrugFood = useCallback(() => {
    setDfDrug1('');
    setDfDrug2('');
    setDfFood1('');
    setDfFood2('');
    setDrugFoodSearchPerformed(false);
    setDrugFoodValidationError('');
    setDrugFoodToCheck({ drugs: [], foods: [] });
  }, []);

  // Food-Food handlers
  const handleCheckFoodFoodInteraction = useCallback(() => {
    setFoodFoodValidationError('');

    const foods = enteredFoods;

    if (foods.length < 2) {
      setFoodFoodValidationError('Please enter at least two food items to check interactions.');
      return;
    }

    const duplicates = findDuplicateNames(foods);
    if (duplicates.length > 0) {
      setFoodFoodValidationError('Please enter different food items. Duplicate names detected.');
      return;
    }

    // Create a fresh copy of the array to ensure React Query sees it as a new value
    setFoodsToCheck([...foods]);
    setFoodFoodSearchPerformed(true);
    setFoodFoodValidationError('');
  }, [enteredFoods]);

  const handleResetFoodFood = useCallback(() => {
    setFood1('');
    setFood2('');
    setFood3('');
    setFood4('');
    setFoodFoodSearchPerformed(false);
    setFoodFoodValidationError('');
    setFoodsToCheck([]);
  }, []);

  const getSeverityBadgeVariant = useCallback((severity?: Severity): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (!severity) return 'outline';
    switch (severity) {
      case Severity.contraindicated:
      case Severity.major:
        return 'destructive';
      case Severity.moderate:
        return 'default';
      case Severity.minor:
        return 'secondary';
      default:
        return 'outline';
    }
  }, []);

  const getToxicityBadgeVariant = useCallback((risk?: ToxicityRiskLevel): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (!risk) return 'outline';
    switch (risk) {
      case ToxicityRiskLevel.high:
        return 'destructive';
      case ToxicityRiskLevel.moderate:
        return 'default';
      case ToxicityRiskLevel.low:
        return 'secondary';
      case ToxicityRiskLevel.unknown_:
        return 'outline';
      default:
        return 'outline';
    }
  }, []);

  const getInteractionTypeLabel = useCallback((type?: InteractionType | null) => {
    if (!type) return 'Not Available';
    switch (type) {
      case InteractionType.pharmacokinetic:
        return 'Pharmacokinetic';
      case InteractionType.pharmacodynamic:
        return 'Pharmacodynamic';
      case InteractionType.both:
        return 'Both (PK/PD)';
      default:
        return 'Not Available';
    }
  }, []);

  const getEvidenceLevelLabel = useCallback((level?: EvidenceLevel | null) => {
    if (!level) return 'Not Available';
    switch (level) {
      case EvidenceLevel.clinicalTrial:
        return 'Clinical Trial';
      case EvidenceLevel.metaAnalysis:
        return 'Meta-Analysis';
      case EvidenceLevel.regulatoryAgency:
        return 'Regulatory Agency';
      case EvidenceLevel.expertOpinion:
        return 'Expert Opinion';
      case EvidenceLevel.caseReport:
        return 'Case Report';
      case EvidenceLevel.others:
        return 'Other Evidence';
      default:
        return 'Not Available';
    }
  }, []);

  const hasRealData = useCallback((interaction: ClinicallyOrientedInteraction): boolean => {
    return !!(
      interaction.description ||
      interaction.severity ||
      interaction.managementRecommendations ||
      interaction.clinicalEffects
    );
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Drug Interaction Checker with Safety Advisory
              </CardTitle>
              <CardDescription>
                Check for potential interactions between drugs, foods, and combinations
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Database className="h-3 w-3" />
              Clinical Safety Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="drug-drug" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="drug-drug">Drug-Drug</TabsTrigger>
              <TabsTrigger value="drug-food">Drug-Food</TabsTrigger>
              <TabsTrigger value="food-food">Food-Food</TabsTrigger>
            </TabsList>

            {/* Drug-Drug Tab */}
            <TabsContent value="drug-drug" className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-900 dark:text-blue-100">Data Source Information</AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  Interaction results are sourced from the app's built-in interaction database. Coverage may be incomplete for some drug combinations. This tool does not use external AI services. Always verify with current medical literature.
                </AlertDescription>
              </Alert>

              <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-amber-900 dark:text-amber-100">
                    <Lightbulb className="h-4 w-4" />
                    Try an Example
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Load a pre-configured example to see how the interaction checker works with known drug combinations.
                  </p>
                  <div className="flex items-center gap-3">
                    <Select value={selectedExample} onValueChange={handleLoadExample}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select an example..." />
                      </SelectTrigger>
                      <SelectContent>
                        {drugInteractionExamples.map((example) => (
                          <SelectItem key={example.id} value={example.id}>
                            {example.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Enter Medications (2-4 drugs)</CardTitle>
                  <CardDescription>
                    Enter drug names to check for potential interactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="drug1">Drug 1 *</Label>
                      <NameAutocompleteInput
                        id="drug1"
                        value={drug1}
                        onChange={setDrug1}
                        suggestions={drugSuggestions}
                        placeholder="e.g., Warfarin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="drug2">Drug 2 *</Label>
                      <NameAutocompleteInput
                        id="drug2"
                        value={drug2}
                        onChange={setDrug2}
                        suggestions={drugSuggestions}
                        placeholder="e.g., Aspirin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="drug3">Drug 3 (Optional)</Label>
                      <NameAutocompleteInput
                        id="drug3"
                        value={drug3}
                        onChange={setDrug3}
                        suggestions={drugSuggestions}
                        placeholder="e.g., Metformin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="drug4">Drug 4 (Optional)</Label>
                      <NameAutocompleteInput
                        id="drug4"
                        value={drug4}
                        onChange={setDrug4}
                        suggestions={drugSuggestions}
                        placeholder="e.g., Lisinopril"
                      />
                    </div>
                  </div>

                  {drugDrugValidationError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{drugDrugValidationError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleCheckDrugDrugInteraction}
                      disabled={!canCheckDrugDrug || checkDrugDrugInteraction.isLoading}
                      className="flex-1"
                    >
                      {checkDrugDrugInteraction.isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Checking...
                        </>
                      ) : (
                        'Check Interactions'
                      )}
                    </Button>
                    <Button
                      onClick={handleResetDrugDrug}
                      variant="outline"
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Drug-Drug Results */}
              {drugDrugSearchPerformed && (
                <div className="space-y-4">
                  {checkDrugDrugInteraction.isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                      ))}
                    </div>
                  ) : checkDrugDrugInteraction.error ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Failed to check interactions. Please try again.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      {drugDrugOverallSummary && drugDrugOverallSummary.hasAnyData && (
                        <Alert className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30">
                          <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <AlertTitle className="text-purple-900 dark:text-purple-100">Overall Safety Summary</AlertTitle>
                          <AlertDescription className="text-purple-800 dark:text-purple-200 space-y-2">
                            {drugDrugOverallSummary.highestSeverity && (
                              <div>
                                <strong>Highest Severity:</strong> {formatSeverity(drugDrugOverallSummary.highestSeverity)}
                                {drugDrugOverallSummary.highestSeverityPairs.length > 0 && (
                                  <span> ({drugDrugOverallSummary.highestSeverityPairs.join(', ')})</span>
                                )}
                              </div>
                            )}
                            {drugDrugOverallSummary.highestToxicityRisk && (
                              <div>
                                <strong>Highest Toxicity Risk:</strong> {formatToxicityRisk(drugDrugOverallSummary.highestToxicityRisk)}
                              </div>
                            )}
                            {drugDrugOverallSummary.topRecommendations.length > 0 && (
                              <div>
                                <strong>Key Recommendations:</strong>
                                <ul className="list-disc list-inside mt-1">
                                  {drugDrugOverallSummary.topRecommendations.slice(0, 2).map((rec, idx) => (
                                    <li key={idx}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Pairwise Interaction Results</h3>
                        {drugDrugAdvisory.map((interaction, idx) => (
                          <DrugPairCard
                            key={`${interaction.drugs.drugA}-${interaction.drugs.drugB}-${idx}`}
                            interaction={interaction}
                            getSeverityBadgeVariant={getSeverityBadgeVariant}
                            getToxicityBadgeVariant={getToxicityBadgeVariant}
                            getInteractionTypeLabel={getInteractionTypeLabel}
                            getEvidenceLevelLabel={getEvidenceLevelLabel}
                            hasRealData={hasRealData}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Drug-Food Tab */}
            <TabsContent value="drug-food" className="space-y-6">
              <Alert className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
                <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-900 dark:text-green-100">Drug-Food Interactions</AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Check how foods and beverages may interact with medications. Results are from the built-in database.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Enter Drugs and Foods</CardTitle>
                  <CardDescription>
                    Enter at least one drug and one food item
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dfDrug1">Drug 1 *</Label>
                      <NameAutocompleteInput
                        id="dfDrug1"
                        value={dfDrug1}
                        onChange={setDfDrug1}
                        suggestions={drugSuggestions}
                        placeholder="e.g., Warfarin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dfDrug2">Drug 2 (Optional)</Label>
                      <NameAutocompleteInput
                        id="dfDrug2"
                        value={dfDrug2}
                        onChange={setDfDrug2}
                        suggestions={drugSuggestions}
                        placeholder="e.g., Metformin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dfFood1">Food 1 *</Label>
                      <NameAutocompleteInput
                        id="dfFood1"
                        value={dfFood1}
                        onChange={setDfFood1}
                        suggestions={foodSuggestions}
                        placeholder="e.g., Grapefruit Juice"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dfFood2">Food 2 (Optional)</Label>
                      <NameAutocompleteInput
                        id="dfFood2"
                        value={dfFood2}
                        onChange={setDfFood2}
                        suggestions={foodSuggestions}
                        placeholder="e.g., Green Leafy Vegetables"
                      />
                    </div>
                  </div>

                  {drugFoodValidationError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{drugFoodValidationError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleCheckDrugFoodInteraction}
                      disabled={!canCheckDrugFood || checkDrugFoodInteraction.isLoading}
                      className="flex-1"
                    >
                      {checkDrugFoodInteraction.isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Checking...
                        </>
                      ) : (
                        'Check Interactions'
                      )}
                    </Button>
                    <Button
                      onClick={handleResetDrugFood}
                      variant="outline"
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Drug-Food Results */}
              {drugFoodSearchPerformed && (
                <div className="space-y-4">
                  {checkDrugFoodInteraction.isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                      ))}
                    </div>
                  ) : checkDrugFoodInteraction.error ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Failed to check interactions. Please try again.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Drug-Food Interaction Results</h3>
                      {drugFoodResults.map((interaction, idx) => (
                        <DrugFoodCard
                          key={`${interaction.drug}-${interaction.food}-${idx}`}
                          interaction={interaction}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Food-Food Tab */}
            <TabsContent value="food-food" className="space-y-6">
              <Alert className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30">
                <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertTitle className="text-orange-900 dark:text-orange-100">Food-Food Interactions</AlertTitle>
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  Check how different foods and beverages may interact with each other. Results are from the built-in database.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Enter Foods (2-4 items)</CardTitle>
                  <CardDescription>
                    Enter food or beverage names to check for potential interactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="food1">Food 1 *</Label>
                      <NameAutocompleteInput
                        id="food1"
                        value={food1}
                        onChange={setFood1}
                        suggestions={foodSuggestions}
                        placeholder="e.g., Grapefruit Juice"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="food2">Food 2 *</Label>
                      <NameAutocompleteInput
                        id="food2"
                        value={food2}
                        onChange={setFood2}
                        suggestions={foodSuggestions}
                        placeholder="e.g., Alcohol"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="food3">Food 3 (Optional)</Label>
                      <NameAutocompleteInput
                        id="food3"
                        value={food3}
                        onChange={setFood3}
                        suggestions={foodSuggestions}
                        placeholder="e.g., Caffeine"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="food4">Food 4 (Optional)</Label>
                      <NameAutocompleteInput
                        id="food4"
                        value={food4}
                        onChange={setFood4}
                        suggestions={foodSuggestions}
                        placeholder="e.g., Green Tea"
                      />
                    </div>
                  </div>

                  {foodFoodValidationError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{foodFoodValidationError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleCheckFoodFoodInteraction}
                      disabled={!canCheckFoodFood || checkFoodFoodInteraction.isLoading}
                      className="flex-1"
                    >
                      {checkFoodFoodInteraction.isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Checking...
                        </>
                      ) : (
                        'Check Interactions'
                      )}
                    </Button>
                    <Button
                      onClick={handleResetFoodFood}
                      variant="outline"
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Food-Food Results */}
              {foodFoodSearchPerformed && (
                <div className="space-y-4">
                  {checkFoodFoodInteraction.isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                      ))}
                    </div>
                  ) : checkFoodFoodInteraction.error ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Failed to check interactions. Please try again.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Food-Food Interaction Results</h3>
                      {foodFoodResults.map((interaction, idx) => (
                        <FoodFoodCard
                          key={`${interaction.foodA}-${interaction.foodB}-${idx}`}
                          interaction={interaction}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
