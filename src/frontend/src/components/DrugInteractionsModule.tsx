import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ExternalLink, AlertTriangle, Info, GitCompare, Database, Shield, Activity, Pill, Lightbulb, Apple, UtensilsCrossed } from 'lucide-react';
import { useCheckMultiDrugInteractions, useCheckDrugFoodInteractions, useCheckFoodFoodInteractions } from '../hooks/useQueries';
import { Skeleton } from './ui/skeleton';
import { Severity, InteractionType, EvidenceLevel, ToxicityRiskLevel } from '../backend';
import { formatSeverity, formatToxicityRisk } from '../utils/interactionSummary';
import { formatDrugPairLabel } from '../utils/drugPairs';
import { drugInteractionExamples, loadExampleSet } from '../data/drugInteractionExamples';
import { NameAutocompleteInput } from './NameAutocompleteInput';
import { getAllDrugNames, getAllFoodNames } from '../services/interactionNameCatalog';
import { findDuplicateNames } from '../utils/nameNormalization';
import { formatPairLabel } from '../utils/namePairs';
import type { DrugDrugInteractionResult, DrugFoodInteractionResult, FoodFoodInteractionResult } from '../services/localInteractionCheckService';

// Memoized drug pair interaction card component
const DrugPairCard = memo(({ 
  interaction, 
  getSeverityBadgeVariant, 
  getToxicityBadgeVariant,
  getInteractionTypeLabel,
  getEvidenceLevelLabel,
  hasRealData 
}: {
  interaction: DrugDrugInteractionResult;
  getSeverityBadgeVariant: (severity?: Severity) => 'default' | 'secondary' | 'destructive' | 'outline';
  getToxicityBadgeVariant: (risk?: ToxicityRiskLevel) => 'default' | 'secondary' | 'destructive' | 'outline';
  getInteractionTypeLabel: (type?: InteractionType | null) => string;
  getEvidenceLevelLabel: (level?: EvidenceLevel | null) => string;
  hasRealData: (interaction: DrugDrugInteractionResult) => boolean;
}) => {
  const pairLabel = formatDrugPairLabel(interaction.drugs.drugA, interaction.drugs.drugB);
  const hasData = hasRealData(interaction);

  if (!hasData) {
    return (
      <Card key={pairLabel} className="border-stone-200 dark:border-stone-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <Pill className="h-4 w-4 text-stone-500" />
            {pairLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <Info className="h-4 w-4 text-stone-500" />
            <AlertTitle className="text-sm font-medium text-stone-700 dark:text-stone-300">No interaction data found</AlertTitle>
            <AlertDescription className="text-xs text-stone-600 dark:text-stone-400">
              No interaction information is available in the built-in dataset for this drug combination.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card key={pairLabel} className="border-stone-200 dark:border-stone-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
          <Pill className="h-4 w-4 text-emerald-600" />
          {pairLabel}
        </CardTitle>
        <CardDescription className="flex flex-wrap gap-2 mt-2">
          {interaction.severity && (
            <Badge variant={getSeverityBadgeVariant(interaction.severity)} className="text-xs">
              Severity: {formatSeverity(interaction.severity)}
            </Badge>
          )}
          {interaction.toxicityRisk && (
            <Badge variant={getToxicityBadgeVariant(interaction.toxicityRisk)} className="text-xs">
              Risk: {formatToxicityRisk(interaction.toxicityRisk)}
            </Badge>
          )}
          {interaction.interactionType && (
            <Badge variant="outline" className="text-xs">
              {getInteractionTypeLabel(interaction.interactionType)}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {interaction.description && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              Description
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-400">{interaction.description}</p>
          </div>
        )}

        {interaction.clinicalEffects && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              Clinical Effects
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-400">{interaction.clinicalEffects}</p>
          </div>
        )}

        {interaction.managementRecommendations && (
          <div>
            <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
              <Lightbulb className="h-3.5 w-3.5" />
              Management Recommendations
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-400">{interaction.managementRecommendations}</p>
          </div>
        )}

        {interaction.evidenceLevel && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              Evidence Level
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-400">{getEvidenceLevelLabel(interaction.evidenceLevel)}</p>
          </div>
        )}

        {interaction.references && interaction.references.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <ExternalLink className="h-3.5 w-3.5" />
              References
            </h4>
            <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1">
              {interaction.references.map((ref, idx) => (
                <li key={idx}>
                  {ref.startsWith('http') ? (
                    <a href={ref} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                      {ref}
                    </a>
                  ) : (
                    ref
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

DrugPairCard.displayName = 'DrugPairCard';

// Memoized drug-food interaction card component
const DrugFoodCard = memo(({ 
  interaction,
  hasRealData 
}: {
  interaction: DrugFoodInteractionResult;
  hasRealData: (interaction: DrugFoodInteractionResult) => boolean;
}) => {
  const pairLabel = `${interaction.drug} + ${interaction.food}`;
  const hasData = hasRealData(interaction);

  if (!hasData) {
    return (
      <Card key={pairLabel} className="border-stone-200 dark:border-stone-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <Apple className="h-4 w-4 text-stone-500" />
            {pairLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <Info className="h-4 w-4 text-stone-500" />
            <AlertTitle className="text-sm font-medium text-stone-700 dark:text-stone-300">No interaction data found</AlertTitle>
            <AlertDescription className="text-xs text-stone-600 dark:text-stone-400">
              No interaction information is available in the built-in dataset for this drug-food combination.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card key={pairLabel} className="border-stone-200 dark:border-stone-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
          <Apple className="h-4 w-4 text-emerald-600" />
          {pairLabel}
        </CardTitle>
        <CardDescription className="flex flex-wrap gap-2 mt-2">
          {interaction.toxicityRisk && (
            <Badge variant="outline" className="text-xs">
              Risk: {interaction.toxicityRisk}
            </Badge>
          )}
          {interaction.interactionType && (
            <Badge variant="outline" className="text-xs">
              {interaction.interactionType}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {interaction.description && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              Description
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-400">{interaction.description}</p>
          </div>
        )}

        {interaction.clinicalEffects && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              Clinical Effects
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-400">{interaction.clinicalEffects}</p>
          </div>
        )}

        {interaction.managementRecommendations && (
          <div>
            <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
              <Lightbulb className="h-3.5 w-3.5" />
              Management Recommendations
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-400">{interaction.managementRecommendations}</p>
          </div>
        )}

        {interaction.evidenceLevel && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              Evidence Level
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-400">{interaction.evidenceLevel}</p>
          </div>
        )}

        {interaction.references && interaction.references.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <ExternalLink className="h-3.5 w-3.5" />
              References
            </h4>
            <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1">
              {interaction.references.map((ref, idx) => (
                <li key={idx}>
                  {ref.startsWith('http') ? (
                    <a href={ref} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                      {ref}
                    </a>
                  ) : (
                    ref
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

DrugFoodCard.displayName = 'DrugFoodCard';

// Memoized food-food interaction card component
const FoodFoodCard = memo(({ 
  interaction,
  hasRealData 
}: {
  interaction: FoodFoodInteractionResult;
  hasRealData: (interaction: FoodFoodInteractionResult) => boolean;
}) => {
  const pairLabel = formatPairLabel(interaction.foods.foodA, interaction.foods.foodB);
  const hasData = hasRealData(interaction);

  if (!hasData) {
    return (
      <Card key={pairLabel} className="border-stone-200 dark:border-stone-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-stone-500" />
            {pairLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <Info className="h-4 w-4 text-stone-500" />
            <AlertTitle className="text-sm font-medium text-stone-700 dark:text-stone-300">No interaction data found</AlertTitle>
            <AlertDescription className="text-xs text-stone-600 dark:text-stone-400">
              No interaction information is available in the built-in dataset for this food combination.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card key={pairLabel} className="border-stone-200 dark:border-stone-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4 text-emerald-600" />
          {pairLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {interaction.description && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              Description
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-400">{interaction.description}</p>
          </div>
        )}

        {interaction.clinicalEffects && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              Clinical Effects
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-400">{interaction.clinicalEffects}</p>
          </div>
        )}

        {interaction.managementRecommendations && (
          <div>
            <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
              <Lightbulb className="h-3.5 w-3.5" />
              Management Recommendations
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-400">{interaction.managementRecommendations}</p>
          </div>
        )}

        {interaction.references && interaction.references.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <ExternalLink className="h-3.5 w-3.5" />
              References
            </h4>
            <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1">
              {interaction.references.map((ref, idx) => (
                <li key={idx}>
                  {ref.startsWith('http') ? (
                    <a href={ref} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                      {ref}
                    </a>
                  ) : (
                    ref
                  )}
                </li>
              ))}
            </ul>
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

  // Drug-Food state
  const [dfDrug1, setDfDrug1] = useState('');
  const [dfDrug2, setDfDrug2] = useState('');
  const [dfFood1, setDfFood1] = useState('');
  const [dfFood2, setDfFood2] = useState('');
  const [drugFoodSearchPerformed, setDrugFoodSearchPerformed] = useState(false);

  // Food-Food state
  const [food1, setFood1] = useState('');
  const [food2, setFood2] = useState('');
  const [food3, setFood3] = useState('');
  const [food4, setFood4] = useState('');
  const [foodFoodSearchPerformed, setFoodFoodSearchPerformed] = useState(false);

  // Validation error states
  const [drugDrugError, setDrugDrugError] = useState<string | null>(null);
  const [drugFoodError, setDrugFoodError] = useState<string | null>(null);
  const [foodFoodError, setFoodFoodError] = useState<string | null>(null);

  // Get drug and food name suggestions
  const drugSuggestions = useMemo(() => getAllDrugNames(), []);
  const foodSuggestions = useMemo(() => getAllFoodNames(), []);

  // Prepare arrays for queries
  const drugsArray = useMemo(() => [drug1, drug2, drug3, drug4].filter(d => d.trim()), [drug1, drug2, drug3, drug4]);
  const dfDrugsArray = useMemo(() => [dfDrug1, dfDrug2].filter(d => d.trim()), [dfDrug1, dfDrug2]);
  const dfFoodsArray = useMemo(() => [dfFood1, dfFood2].filter(f => f.trim()), [dfFood1, dfFood2]);
  const foodsArray = useMemo(() => [food1, food2, food3, food4].filter(f => f.trim()), [food1, food2, food3, food4]);

  // React Query hooks for interaction checks
  const multiDrugQuery = useCheckMultiDrugInteractions(drugsArray);
  const drugFoodQuery = useCheckDrugFoodInteractions(dfDrugsArray, dfFoodsArray);
  const foodFoodQuery = useCheckFoodFoodInteractions(foodsArray);

  // Helper functions
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
      default:
        return 'outline';
    }
  }, []);

  const getInteractionTypeLabel = useCallback((type?: InteractionType | null): string => {
    if (!type) return 'Unknown';
    switch (type) {
      case InteractionType.pharmacokinetic:
        return 'Pharmacokinetic';
      case InteractionType.pharmacodynamic:
        return 'Pharmacodynamic';
      case InteractionType.both:
        return 'Both (PK/PD)';
      default:
        return 'Unknown';
    }
  }, []);

  const getEvidenceLevelLabel = useCallback((level?: EvidenceLevel | null): string => {
    if (!level) return 'Unknown';
    switch (level) {
      case EvidenceLevel.regulatoryAgency:
        return 'Regulatory Agency';
      case EvidenceLevel.clinicalTrial:
        return 'Clinical Trial';
      case EvidenceLevel.metaAnalysis:
        return 'Meta-Analysis';
      case EvidenceLevel.caseReport:
        return 'Case Report';
      case EvidenceLevel.expertOpinion:
        return 'Expert Opinion';
      case EvidenceLevel.others:
        return 'Other Evidence';
      default:
        return 'Unknown';
    }
  }, []);

  const hasRealDrugDrugData = useCallback((interaction: DrugDrugInteractionResult): boolean => {
    return !!(
      interaction.description ||
      interaction.clinicalEffects ||
      interaction.managementRecommendations ||
      interaction.severity ||
      interaction.toxicityRisk ||
      interaction.interactionType ||
      interaction.evidenceLevel ||
      (interaction.references && interaction.references.length > 0)
    );
  }, []);

  const hasRealDrugFoodData = useCallback((interaction: DrugFoodInteractionResult): boolean => {
    return !!(
      interaction.description ||
      interaction.clinicalEffects ||
      interaction.managementRecommendations ||
      interaction.toxicityRisk ||
      interaction.interactionType ||
      interaction.evidenceLevel ||
      (interaction.references && interaction.references.length > 0)
    );
  }, []);

  const hasRealFoodFoodData = useCallback((interaction: FoodFoodInteractionResult): boolean => {
    return !!(
      interaction.description ||
      interaction.clinicalEffects ||
      interaction.managementRecommendations ||
      (interaction.references && interaction.references.length > 0)
    );
  }, []);

  // Validation handlers
  const handleDrugDrugCheck = useCallback(() => {
    setDrugDrugError(null);
    
    if (drugsArray.length < 2) {
      setDrugDrugError('Please enter at least 2 drugs');
      return;
    }

    const duplicates = findDuplicateNames(drugsArray);
    if (duplicates.length > 0) {
      setDrugDrugError(`Duplicate drugs detected: ${duplicates.join(', ')}`);
      return;
    }

    setDrugDrugSearchPerformed(true);
  }, [drugsArray]);

  const handleDrugFoodCheck = useCallback(() => {
    setDrugFoodError(null);
    
    if (dfDrugsArray.length === 0) {
      setDrugFoodError('Please enter at least 1 drug');
      return;
    }

    if (dfFoodsArray.length === 0) {
      setDrugFoodError('Please enter at least 1 food');
      return;
    }

    const drugDuplicates = findDuplicateNames(dfDrugsArray);
    if (drugDuplicates.length > 0) {
      setDrugFoodError(`Duplicate drugs detected: ${drugDuplicates.join(', ')}`);
      return;
    }

    const foodDuplicates = findDuplicateNames(dfFoodsArray);
    if (foodDuplicates.length > 0) {
      setDrugFoodError(`Duplicate foods detected: ${foodDuplicates.join(', ')}`);
      return;
    }

    setDrugFoodSearchPerformed(true);
  }, [dfDrugsArray, dfFoodsArray]);

  const handleFoodFoodCheck = useCallback(() => {
    setFoodFoodError(null);
    
    if (foodsArray.length < 2) {
      setFoodFoodError('Please enter at least 2 foods');
      return;
    }

    const duplicates = findDuplicateNames(foodsArray);
    if (duplicates.length > 0) {
      setFoodFoodError(`Duplicate foods detected: ${duplicates.join(', ')}`);
      return;
    }

    setFoodFoodSearchPerformed(true);
  }, [foodsArray]);

  // Example loading handlers - pass the example ID string
  const handleLoadExample = useCallback((exampleId: string) => {
    const loaded = loadExampleSet(exampleId);
    setDrug1(loaded.drug1);
    setDrug2(loaded.drug2);
    setDrug3(loaded.drug3);
    setDrug4(loaded.drug4);
    setDrugDrugSearchPerformed(false);
    setDrugDrugError(null);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 border-stone-200 dark:border-stone-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600 rounded-lg">
                  <GitCompare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    Drug & Food Interaction Checker
                  </CardTitle>
                  <CardDescription className="text-stone-700 dark:text-stone-300 mt-1">
                    Check for interactions between drugs, foods, and combinations using built-in datasets
                  </CardDescription>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="drug-drug" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-stone-100 dark:bg-stone-800">
          <TabsTrigger value="drug-drug" className="data-[state=active]:bg-white dark:data-[state=active]:bg-stone-700">
            <Pill className="h-4 w-4 mr-2" />
            Drug-Drug
          </TabsTrigger>
          <TabsTrigger value="drug-food" className="data-[state=active]:bg-white dark:data-[state=active]:bg-stone-700">
            <Apple className="h-4 w-4 mr-2" />
            Drug-Food
          </TabsTrigger>
          <TabsTrigger value="food-food" className="data-[state=active]:bg-white dark:data-[state=active]:bg-stone-700">
            <UtensilsCrossed className="h-4 w-4 mr-2" />
            Food-Food
          </TabsTrigger>
        </TabsList>

        {/* Drug-Drug Tab */}
        <TabsContent value="drug-drug" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-emerald-600" />
                Drug-Drug Interaction Check
              </CardTitle>
              <CardDescription>
                Enter 2-4 drug names to check for interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Example selector */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Quick Examples:</Label>
                <Select onValueChange={handleLoadExample}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Load an example..." />
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

              {/* Drug inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="drug1">Drug 1 *</Label>
                  <NameAutocompleteInput
                    id="drug1"
                    value={drug1}
                    onChange={setDrug1}
                    suggestions={drugSuggestions}
                    placeholder="Enter drug name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drug2">Drug 2 *</Label>
                  <NameAutocompleteInput
                    id="drug2"
                    value={drug2}
                    onChange={setDrug2}
                    suggestions={drugSuggestions}
                    placeholder="Enter drug name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drug3">Drug 3 (optional)</Label>
                  <NameAutocompleteInput
                    id="drug3"
                    value={drug3}
                    onChange={setDrug3}
                    suggestions={drugSuggestions}
                    placeholder="Enter drug name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drug4">Drug 4 (optional)</Label>
                  <NameAutocompleteInput
                    id="drug4"
                    value={drug4}
                    onChange={setDrug4}
                    suggestions={drugSuggestions}
                    placeholder="Enter drug name..."
                  />
                </div>
              </div>

              {drugDrugError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{drugDrugError}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleDrugDrugCheck} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Shield className="h-4 w-4 mr-2" />
                Check Interactions
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {drugDrugSearchPerformed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-600" />
                  Interaction Results
                </CardTitle>
                <CardDescription>
                  {drugsArray.length} drug{drugsArray.length !== 1 ? 's' : ''} analyzed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {multiDrugQuery.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                  </div>
                ) : multiDrugQuery.error ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Error checking interactions: {multiDrugQuery.error.message}
                    </AlertDescription>
                  </Alert>
                ) : multiDrugQuery.data && multiDrugQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {multiDrugQuery.data.map((interaction, idx) => (
                      <DrugPairCard
                        key={idx}
                        interaction={interaction}
                        getSeverityBadgeVariant={getSeverityBadgeVariant}
                        getToxicityBadgeVariant={getToxicityBadgeVariant}
                        getInteractionTypeLabel={getInteractionTypeLabel}
                        getEvidenceLevelLabel={getEvidenceLevelLabel}
                        hasRealData={hasRealDrugDrugData}
                      />
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No interaction data available for the selected drugs.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Drug-Food Tab */}
        <TabsContent value="drug-food" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5 text-emerald-600" />
                Drug-Food Interaction Check
              </CardTitle>
              <CardDescription>
                Enter drugs and foods to check for interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="df-drug1">Drug 1 *</Label>
                  <NameAutocompleteInput
                    id="df-drug1"
                    value={dfDrug1}
                    onChange={setDfDrug1}
                    suggestions={drugSuggestions}
                    placeholder="Enter drug name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="df-drug2">Drug 2 (optional)</Label>
                  <NameAutocompleteInput
                    id="df-drug2"
                    value={dfDrug2}
                    onChange={setDfDrug2}
                    suggestions={drugSuggestions}
                    placeholder="Enter drug name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="df-food1">Food 1 *</Label>
                  <NameAutocompleteInput
                    id="df-food1"
                    value={dfFood1}
                    onChange={setDfFood1}
                    suggestions={foodSuggestions}
                    placeholder="Enter food name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="df-food2">Food 2 (optional)</Label>
                  <NameAutocompleteInput
                    id="df-food2"
                    value={dfFood2}
                    onChange={setDfFood2}
                    suggestions={foodSuggestions}
                    placeholder="Enter food name..."
                  />
                </div>
              </div>

              {drugFoodError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{drugFoodError}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleDrugFoodCheck} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Shield className="h-4 w-4 mr-2" />
                Check Interactions
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {drugFoodSearchPerformed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-600" />
                  Interaction Results
                </CardTitle>
                <CardDescription>
                  {dfDrugsArray.length} drug{dfDrugsArray.length !== 1 ? 's' : ''} × {dfFoodsArray.length} food{dfFoodsArray.length !== 1 ? 's' : ''} analyzed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {drugFoodQuery.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                  </div>
                ) : drugFoodQuery.error ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Error checking interactions: {drugFoodQuery.error.message}
                    </AlertDescription>
                  </Alert>
                ) : drugFoodQuery.data && drugFoodQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {drugFoodQuery.data.map((interaction, idx) => (
                      <DrugFoodCard
                        key={idx}
                        interaction={interaction}
                        hasRealData={hasRealDrugFoodData}
                      />
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No interaction data available for the selected drugs and foods.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Food-Food Tab */}
        <TabsContent value="food-food" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
                Food-Food Interaction Check
              </CardTitle>
              <CardDescription>
                Enter 2-4 food names to check for interactions
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
                    placeholder="Enter food name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="food2">Food 2 *</Label>
                  <NameAutocompleteInput
                    id="food2"
                    value={food2}
                    onChange={setFood2}
                    suggestions={foodSuggestions}
                    placeholder="Enter food name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="food3">Food 3 (optional)</Label>
                  <NameAutocompleteInput
                    id="food3"
                    value={food3}
                    onChange={setFood3}
                    suggestions={foodSuggestions}
                    placeholder="Enter food name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="food4">Food 4 (optional)</Label>
                  <NameAutocompleteInput
                    id="food4"
                    value={food4}
                    onChange={setFood4}
                    suggestions={foodSuggestions}
                    placeholder="Enter food name..."
                  />
                </div>
              </div>

              {foodFoodError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{foodFoodError}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleFoodFoodCheck} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Shield className="h-4 w-4 mr-2" />
                Check Interactions
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {foodFoodSearchPerformed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-600" />
                  Interaction Results
                </CardTitle>
                <CardDescription>
                  {foodsArray.length} food{foodsArray.length !== 1 ? 's' : ''} analyzed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {foodFoodQuery.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                  </div>
                ) : foodFoodQuery.error ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Error checking interactions: {foodFoodQuery.error.message}
                    </AlertDescription>
                  </Alert>
                ) : foodFoodQuery.data && foodFoodQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {foodFoodQuery.data.map((interaction, idx) => (
                      <FoodFoodCard
                        key={idx}
                        interaction={interaction}
                        hasRealData={hasRealFoodFoodData}
                      />
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No interaction data available for the selected foods.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
