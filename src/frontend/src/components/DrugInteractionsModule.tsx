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
import { generateOverallSummary, formatSeverity, formatToxicityRisk } from '../utils/interactionSummary';
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
  const [drugsToCheck, setDrugsToCheck] = useState<string[] | undefined>(undefined);
  const [drugDrugSearchPerformed, setDrugDrugSearchPerformed] = useState(false);

  // Drug-Food state
  const [dfDrug1, setDfDrug1] = useState('');
  const [dfDrug2, setDfDrug2] = useState('');
  const [dfFood1, setDfFood1] = useState('');
  const [dfFood2, setDfFood2] = useState('');
  const [dfDrugsToCheck, setDfDrugsToCheck] = useState<string[] | undefined>(undefined);
  const [dfFoodsToCheck, setDfFoodsToCheck] = useState<string[] | undefined>(undefined);
  const [drugFoodSearchPerformed, setDrugFoodSearchPerformed] = useState(false);

  // Food-Food state
  const [food1, setFood1] = useState('');
  const [food2, setFood2] = useState('');
  const [food3, setFood3] = useState('');
  const [food4, setFood4] = useState('');
  const [foodsToCheck, setFoodsToCheck] = useState<string[] | undefined>(undefined);
  const [foodFoodSearchPerformed, setFoodFoodSearchPerformed] = useState(false);

  // Validation error states
  const [drugDrugError, setDrugDrugError] = useState<string | null>(null);
  const [drugFoodError, setDrugFoodError] = useState<string | null>(null);
  const [foodFoodError, setFoodFoodError] = useState<string | null>(null);

  // Get drug and food name suggestions
  const drugSuggestions = useMemo(() => getAllDrugNames(), []);
  const foodSuggestions = useMemo(() => getAllFoodNames(), []);

  // React Query hooks for interaction checks
  const multiDrugQuery = useCheckMultiDrugInteraction(drugsToCheck);
  const drugFoodQuery = useCheckDrugFoodInteractions(dfDrugsToCheck, dfFoodsToCheck);
  const foodFoodQuery = useCheckFoodFoodInteractions(foodsToCheck);

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
        return 'Unknown';
    }
  }, []);

  const hasRealDrugDrugData = useCallback((interaction: DrugDrugInteractionResult): boolean => {
    return !!interaction.description;
  }, []);

  const hasRealDrugFoodData = useCallback((interaction: DrugFoodInteractionResult): boolean => {
    return !!interaction.description;
  }, []);

  const hasRealFoodFoodData = useCallback((interaction: FoodFoodInteractionResult): boolean => {
    return !!interaction.description;
  }, []);

  // Drug-Drug handlers
  const handleCheckDrugDrugInteractions = useCallback(() => {
    const drugs = [drug1, drug2, drug3, drug4].filter(d => d.trim() !== '');

    // Validation
    if (drugs.length < 2) {
      setDrugDrugError('Please enter at least two medications to check interactions.');
      setDrugDrugSearchPerformed(false);
      return;
    }

    const duplicates = findDuplicateNames(drugs);
    if (duplicates.length > 0) {
      setDrugDrugError('Please enter different medications. Duplicate drug names detected.');
      setDrugDrugSearchPerformed(false);
      return;
    }

    // Clear error and perform check
    setDrugDrugError(null);
    setDrugsToCheck(drugs);
    setDrugDrugSearchPerformed(true);
  }, [drug1, drug2, drug3, drug4]);

  const handleLoadDrugExample = useCallback((exampleId: string) => {
    const result = loadExampleSet(exampleId);
    setDrug1(result.drug1);
    setDrug2(result.drug2);
    setDrug3(result.drug3);
    setDrug4(result.drug4);
    setDrugDrugError(null);
    setDrugDrugSearchPerformed(false);
  }, []);

  // Drug-Food handlers
  const handleCheckDrugFoodInteractions = useCallback(() => {
    const drugs = [dfDrug1, dfDrug2].filter(d => d.trim() !== '');
    const foods = [dfFood1, dfFood2].filter(f => f.trim() !== '');

    // Validation
    if (drugs.length === 0) {
      setDrugFoodError('Please enter at least one drug to check interactions.');
      setDrugFoodSearchPerformed(false);
      return;
    }

    if (foods.length === 0) {
      setDrugFoodError('Please enter at least one food item to check interactions.');
      setDrugFoodSearchPerformed(false);
      return;
    }

    const drugDuplicates = findDuplicateNames(drugs);
    if (drugDuplicates.length > 0) {
      setDrugFoodError('Please enter different drugs. Duplicate drug names detected.');
      setDrugFoodSearchPerformed(false);
      return;
    }

    const foodDuplicates = findDuplicateNames(foods);
    if (foodDuplicates.length > 0) {
      setDrugFoodError('Please enter different foods. Duplicate food names detected.');
      setDrugFoodSearchPerformed(false);
      return;
    }

    // Clear error and perform check
    setDrugFoodError(null);
    setDfDrugsToCheck(drugs);
    setDfFoodsToCheck(foods);
    setDrugFoodSearchPerformed(true);
  }, [dfDrug1, dfDrug2, dfFood1, dfFood2]);

  // Food-Food handlers
  const handleCheckFoodFoodInteractions = useCallback(() => {
    const foods = [food1, food2, food3, food4].filter(f => f.trim() !== '');

    // Validation
    if (foods.length < 2) {
      setFoodFoodError('Please enter at least two food items to check interactions.');
      setFoodFoodSearchPerformed(false);
      return;
    }

    const duplicates = findDuplicateNames(foods);
    if (duplicates.length > 0) {
      setFoodFoodError('Please enter different foods. Duplicate food names detected.');
      setFoodFoodSearchPerformed(false);
      return;
    }

    // Clear error and perform check
    setFoodFoodError(null);
    setFoodsToCheck(foods);
    setFoodFoodSearchPerformed(true);
  }, [food1, food2, food3, food4]);

  // Overall summary for Drug-Drug
  const overallSummary = useMemo(() => {
    if (!multiDrugQuery.data || multiDrugQuery.data.length === 0) return null;
    return generateOverallSummary(multiDrugQuery.data as any);
  }, [multiDrugQuery.data]);

  return (
    <div className="space-y-6">
      <Card className="border-stone-200 dark:border-stone-700 bg-gradient-to-br from-stone-50 to-white dark:from-stone-900 dark:to-stone-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-emerald-600" />
            Drug Interaction Checker
          </CardTitle>
          <CardDescription className="text-stone-600 dark:text-stone-400">
            Check for potential interactions between drugs, foods, and combinations
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="drug-drug" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-stone-100 dark:bg-stone-800">
          <TabsTrigger value="drug-drug" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Pill className="h-4 w-4 mr-2" />
            Drug-Drug
          </TabsTrigger>
          <TabsTrigger value="drug-food" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Apple className="h-4 w-4 mr-2" />
            Drug-Food
          </TabsTrigger>
          <TabsTrigger value="food-food" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <UtensilsCrossed className="h-4 w-4 mr-2" />
            Food-Food
          </TabsTrigger>
        </TabsList>

        {/* Drug-Drug Tab */}
        <TabsContent value="drug-drug" className="space-y-4">
          <Card className="border-stone-200 dark:border-stone-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                Enter Medications (2-4 drugs)
              </CardTitle>
              <CardDescription className="text-stone-600 dark:text-stone-400">
                Enter 2 to 4 medication names to check for potential interactions
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

              {drugDrugError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Validation Error</AlertTitle>
                  <AlertDescription>{drugDrugError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleCheckDrugDrugInteractions} className="bg-emerald-600 hover:bg-emerald-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Check Interactions
                </Button>
                <Select onValueChange={handleLoadDrugExample}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Load Example" />
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

          {/* Drug-Drug Results */}
          {drugDrugSearchPerformed && (
            <>
              {multiDrugQuery.isLoading ? (
                <Card className="border-stone-200 dark:border-stone-700">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ) : multiDrugQuery.error ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to check interactions: {(multiDrugQuery.error as Error).message}
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {overallSummary && overallSummary.hasAnyData && (
                    <Card className="border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-emerald-800 dark:text-emerald-100 flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Overall Safety Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {overallSummary.highestSeverity && (
                          <div>
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Highest Severity: </span>
                            <Badge variant={getSeverityBadgeVariant(overallSummary.highestSeverity)} className="ml-2">
                              {formatSeverity(overallSummary.highestSeverity)}
                            </Badge>
                          </div>
                        )}
                        {overallSummary.highestToxicityRisk && (
                          <div>
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Highest Toxicity Risk: </span>
                            <Badge variant={getToxicityBadgeVariant(overallSummary.highestToxicityRisk)} className="ml-2">
                              {formatToxicityRisk(overallSummary.highestToxicityRisk)}
                            </Badge>
                          </div>
                        )}
                        {overallSummary.highestSeverityPairs.length > 0 && (
                          <div>
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Critical Pairs: </span>
                            <span className="text-sm text-emerald-600 dark:text-emerald-400">
                              {overallSummary.highestSeverityPairs.join(', ')}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                      Pairwise Interaction Results
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {multiDrugQuery.data?.map((interaction, idx) => (
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
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>

        {/* Drug-Food Tab */}
        <TabsContent value="drug-food" className="space-y-4">
          <Card className="border-stone-200 dark:border-stone-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                Enter Drugs and Foods
              </CardTitle>
              <CardDescription className="text-stone-600 dark:text-stone-400">
                Enter drugs and food items to check for potential interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Drugs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="df-drug1">Drug 1 *</Label>
                      <NameAutocompleteInput
                        id="df-drug1"
                        value={dfDrug1}
                        onChange={setDfDrug1}
                        suggestions={drugSuggestions}
                        placeholder="e.g., Warfarin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="df-drug2">Drug 2 (Optional)</Label>
                      <NameAutocompleteInput
                        id="df-drug2"
                        value={dfDrug2}
                        onChange={setDfDrug2}
                        suggestions={drugSuggestions}
                        placeholder="e.g., Metformin"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Foods</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="df-food1">Food 1 *</Label>
                      <NameAutocompleteInput
                        id="df-food1"
                        value={dfFood1}
                        onChange={setDfFood1}
                        suggestions={foodSuggestions}
                        placeholder="e.g., Grapefruit"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="df-food2">Food 2 (Optional)</Label>
                      <NameAutocompleteInput
                        id="df-food2"
                        value={dfFood2}
                        onChange={setDfFood2}
                        suggestions={foodSuggestions}
                        placeholder="e.g., Alcohol"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {drugFoodError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Validation Error</AlertTitle>
                  <AlertDescription>{drugFoodError}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleCheckDrugFoodInteractions} className="bg-emerald-600 hover:bg-emerald-700">
                <Shield className="h-4 w-4 mr-2" />
                Check Interactions
              </Button>
            </CardContent>
          </Card>

          {/* Drug-Food Results */}
          {drugFoodSearchPerformed && (
            <>
              {drugFoodQuery.isLoading ? (
                <Card className="border-stone-200 dark:border-stone-700">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ) : drugFoodQuery.error ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to check interactions: {(drugFoodQuery.error as Error).message}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                    Drug-Food Interaction Results
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {drugFoodQuery.data?.map((interaction, idx) => (
                      <DrugFoodCard
                        key={idx}
                        interaction={interaction}
                        hasRealData={hasRealDrugFoodData}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Food-Food Tab */}
        <TabsContent value="food-food" className="space-y-4">
          <Card className="border-stone-200 dark:border-stone-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                Enter Food Items (2-4 foods)
              </CardTitle>
              <CardDescription className="text-stone-600 dark:text-stone-400">
                Enter 2 to 4 food items to check for potential interactions
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
                    placeholder="e.g., Grapefruit"
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
                    placeholder="e.g., Green Tea"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="food4">Food 4 (Optional)</Label>
                  <NameAutocompleteInput
                    id="food4"
                    value={food4}
                    onChange={setFood4}
                    suggestions={foodSuggestions}
                    placeholder="e.g., Milk"
                  />
                </div>
              </div>

              {foodFoodError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Validation Error</AlertTitle>
                  <AlertDescription>{foodFoodError}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleCheckFoodFoodInteractions} className="bg-emerald-600 hover:bg-emerald-700">
                <Shield className="h-4 w-4 mr-2" />
                Check Interactions
              </Button>
            </CardContent>
          </Card>

          {/* Food-Food Results */}
          {foodFoodSearchPerformed && (
            <>
              {foodFoodQuery.isLoading ? (
                <Card className="border-stone-200 dark:border-stone-700">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ) : foodFoodQuery.error ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to check interactions: {(foodFoodQuery.error as Error).message}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                    Food-Food Interaction Results
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {foodFoodQuery.data?.map((interaction, idx) => (
                      <FoodFoodCard
                        key={idx}
                        interaction={interaction}
                        hasRealData={hasRealFoodFoodData}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
