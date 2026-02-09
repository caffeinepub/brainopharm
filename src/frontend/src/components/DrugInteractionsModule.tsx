import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ExternalLink, AlertTriangle, Info, GitCompare, Database, Shield, Activity, Pill, Lightbulb, Apple, UtensilsCrossed } from 'lucide-react';
import { useCheckMultiDrugInteraction, useCheckDrugFoodInteraction, useCheckFoodFoodInteraction } from '../hooks/useQueries';
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
  const drugFoodQuery = useCheckDrugFoodInteraction(dfDrugsToCheck, dfFoodsToCheck);
  const foodFoodQuery = useCheckFoodFoodInteraction(foodsToCheck);

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
        return 'Both (PK + PD)';
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

  // Check if interaction has real data (not placeholder)
  const hasRealDrugDrugData = useCallback((interaction: DrugDrugInteractionResult): boolean => {
    return !!interaction.description && interaction.description.trim() !== '';
  }, []);

  const hasRealDrugFoodData = useCallback((interaction: DrugFoodInteractionResult): boolean => {
    return !!interaction.description && interaction.description.trim() !== '';
  }, []);

  const hasRealFoodFoodData = useCallback((interaction: FoodFoodInteractionResult): boolean => {
    return !!interaction.description && interaction.description.trim() !== '';
  }, []);

  // Drug-Drug handlers
  const handleDrugDrugCheck = useCallback(() => {
    const drugs = [drug1, drug2, drug3, drug4].filter(d => d.trim() !== '');
    
    if (drugs.length < 2) {
      setDrugDrugError('Please enter at least 2 drugs');
      return;
    }

    const duplicates = findDuplicateNames(drugs);
    if (duplicates.length > 0) {
      setDrugDrugError(`Duplicate drugs detected: ${duplicates.join(', ')}`);
      return;
    }

    setDrugDrugError(null);
    setDrugsToCheck(drugs);
    setDrugDrugSearchPerformed(true);
  }, [drug1, drug2, drug3, drug4]);

  const handleDrugDrugClear = useCallback(() => {
    setDrug1('');
    setDrug2('');
    setDrug3('');
    setDrug4('');
    setDrugsToCheck(undefined);
    setDrugDrugSearchPerformed(false);
    setDrugDrugError(null);
  }, []);

  const handleLoadExample = useCallback((exampleId: string) => {
    const result = loadExampleSet(exampleId);
    setDrug1(result.drug1);
    setDrug2(result.drug2);
    setDrug3(result.drug3);
    setDrug4(result.drug4);
    setDrugsToCheck(undefined);
    setDrugDrugSearchPerformed(false);
    setDrugDrugError(null);
  }, []);

  // Drug-Food handlers
  const handleDrugFoodCheck = useCallback(() => {
    const drugs = [dfDrug1, dfDrug2].filter(d => d.trim() !== '');
    const foods = [dfFood1, dfFood2].filter(f => f.trim() !== '');

    if (drugs.length === 0) {
      setDrugFoodError('Please enter at least 1 drug');
      return;
    }

    if (foods.length === 0) {
      setDrugFoodError('Please enter at least 1 food');
      return;
    }

    const drugDuplicates = findDuplicateNames(drugs);
    if (drugDuplicates.length > 0) {
      setDrugFoodError(`Duplicate drugs detected: ${drugDuplicates.join(', ')}`);
      return;
    }

    const foodDuplicates = findDuplicateNames(foods);
    if (foodDuplicates.length > 0) {
      setDrugFoodError(`Duplicate foods detected: ${foodDuplicates.join(', ')}`);
      return;
    }

    setDrugFoodError(null);
    setDfDrugsToCheck(drugs);
    setDfFoodsToCheck(foods);
    setDrugFoodSearchPerformed(true);
  }, [dfDrug1, dfDrug2, dfFood1, dfFood2]);

  const handleDrugFoodClear = useCallback(() => {
    setDfDrug1('');
    setDfDrug2('');
    setDfFood1('');
    setDfFood2('');
    setDfDrugsToCheck(undefined);
    setDfFoodsToCheck(undefined);
    setDrugFoodSearchPerformed(false);
    setDrugFoodError(null);
  }, []);

  // Food-Food handlers
  const handleFoodFoodCheck = useCallback(() => {
    const foods = [food1, food2, food3, food4].filter(f => f.trim() !== '');

    if (foods.length < 2) {
      setFoodFoodError('Please enter at least 2 foods');
      return;
    }

    const duplicates = findDuplicateNames(foods);
    if (duplicates.length > 0) {
      setFoodFoodError(`Duplicate foods detected: ${duplicates.join(', ')}`);
      return;
    }

    setFoodFoodError(null);
    setFoodsToCheck(foods);
    setFoodFoodSearchPerformed(true);
  }, [food1, food2, food3, food4]);

  const handleFoodFoodClear = useCallback(() => {
    setFood1('');
    setFood2('');
    setFood3('');
    setFood4('');
    setFoodsToCheck(undefined);
    setFoodFoodSearchPerformed(false);
    setFoodFoodError(null);
  }, []);

  // Overall summary for Drug-Drug interactions
  const overallSummary = useMemo(() => {
    if (!multiDrugQuery.data || multiDrugQuery.data.length === 0) return null;
    
    // Convert DrugDrugInteractionResult[] to ClinicallyOrientedInteraction[] format
    const clinicalInteractions = multiDrugQuery.data.map(interaction => ({
      drugs: interaction.drugs,
      interactionType: interaction.interactionType,
      description: interaction.description,
      clinicalEffects: interaction.clinicalEffects,
      toxicityRisk: interaction.toxicityRisk,
      managementRecommendations: interaction.managementRecommendations,
      severity: interaction.severity,
      evidenceLevel: interaction.evidenceLevel,
      references: interaction.references,
    }));
    
    return generateOverallSummary(clinicalInteractions);
  }, [multiDrugQuery.data]);

  return (
    <div className="space-y-6">
      <Card className="border-stone-200 dark:border-stone-700">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-600 dark:bg-emerald-500">
              <GitCompare className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-stone-900 dark:text-stone-100">Drug Interaction Checker</CardTitle>
              <CardDescription className="text-stone-700 dark:text-stone-300 mt-1">
                Check for Drug-Drug, Drug-Food, and Food-Food interactions using built-in datasets
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs defaultValue="drug-drug" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="drug-drug" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Drug-Drug
              </TabsTrigger>
              <TabsTrigger value="drug-food" className="flex items-center gap-2">
                <Apple className="h-4 w-4" />
                Drug-Food
              </TabsTrigger>
              <TabsTrigger value="food-food" className="flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Food-Food
              </TabsTrigger>
            </TabsList>

            {/* Drug-Drug Tab */}
            <TabsContent value="drug-drug" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-stone-800 dark:text-stone-100">
                    Enter 2-4 Drug Names
                  </Label>
                  <Select onValueChange={handleLoadExample}>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="drug1" className="text-sm font-medium mb-2 block">Drug 1</Label>
                    <NameAutocompleteInput
                      id="drug1"
                      value={drug1}
                      onChange={setDrug1}
                      suggestions={drugSuggestions}
                      placeholder="Drug 1 (required)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="drug2" className="text-sm font-medium mb-2 block">Drug 2</Label>
                    <NameAutocompleteInput
                      id="drug2"
                      value={drug2}
                      onChange={setDrug2}
                      suggestions={drugSuggestions}
                      placeholder="Drug 2 (required)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="drug3" className="text-sm font-medium mb-2 block">Drug 3</Label>
                    <NameAutocompleteInput
                      id="drug3"
                      value={drug3}
                      onChange={setDrug3}
                      suggestions={drugSuggestions}
                      placeholder="Drug 3 (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="drug4" className="text-sm font-medium mb-2 block">Drug 4</Label>
                    <NameAutocompleteInput
                      id="drug4"
                      value={drug4}
                      onChange={setDrug4}
                      suggestions={drugSuggestions}
                      placeholder="Drug 4 (optional)"
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

                <div className="flex gap-3">
                  <Button onClick={handleDrugDrugCheck} className="flex-1">
                    <Shield className="mr-2 h-4 w-4" />
                    Check Interactions
                  </Button>
                  <Button onClick={handleDrugDrugClear} variant="outline">
                    Clear
                  </Button>
                </div>
              </div>

              {drugDrugSearchPerformed && (
                <div className="space-y-6">
                  {multiDrugQuery.isLoading && (
                    <div className="space-y-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  )}

                  {multiDrugQuery.isError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Failed to check interactions. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}

                  {multiDrugQuery.data && multiDrugQuery.data.length > 0 && (
                    <>
                      {overallSummary && overallSummary.hasAnyData && (
                        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                              <Info className="h-5 w-5" />
                              Overall Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                  Total Pairs Checked
                                </p>
                                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                  {multiDrugQuery.data.length}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                  Interactions Found
                                </p>
                                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                  {multiDrugQuery.data.filter(hasRealDrugDrugData).length}
                                </p>
                              </div>
                            </div>

                            {overallSummary.highestSeverity && (
                              <div>
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                                  Highest Severity
                                </p>
                                <Badge variant={getSeverityBadgeVariant(overallSummary.highestSeverity)}>
                                  {formatSeverity(overallSummary.highestSeverity)}
                                </Badge>
                              </div>
                            )}

                            {overallSummary.highestToxicityRisk && (
                              <div>
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                                  Highest Toxicity Risk
                                </p>
                                <Badge variant={getToxicityBadgeVariant(overallSummary.highestToxicityRisk)}>
                                  {formatToxicityRisk(overallSummary.highestToxicityRisk)}
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                          Pairwise Interactions ({multiDrugQuery.data.length})
                        </h3>
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
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Drug-Food Tab */}
            <TabsContent value="drug-food" className="space-y-6 mt-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold text-stone-800 dark:text-stone-100">
                  Enter Drugs and Foods
                </Label>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">
                      Drugs (1-2)
                    </Label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="dfDrug1" className="text-sm font-medium mb-2 block">Drug 1</Label>
                        <NameAutocompleteInput
                          id="dfDrug1"
                          value={dfDrug1}
                          onChange={setDfDrug1}
                          suggestions={drugSuggestions}
                          placeholder="Drug 1 (required)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dfDrug2" className="text-sm font-medium mb-2 block">Drug 2</Label>
                        <NameAutocompleteInput
                          id="dfDrug2"
                          value={dfDrug2}
                          onChange={setDfDrug2}
                          suggestions={drugSuggestions}
                          placeholder="Drug 2 (optional)"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">
                      Foods (1-2)
                    </Label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="dfFood1" className="text-sm font-medium mb-2 block">Food 1</Label>
                        <NameAutocompleteInput
                          id="dfFood1"
                          value={dfFood1}
                          onChange={setDfFood1}
                          suggestions={foodSuggestions}
                          placeholder="Food 1 (required)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dfFood2" className="text-sm font-medium mb-2 block">Food 2</Label>
                        <NameAutocompleteInput
                          id="dfFood2"
                          value={dfFood2}
                          onChange={setDfFood2}
                          suggestions={foodSuggestions}
                          placeholder="Food 2 (optional)"
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

                <div className="flex gap-3">
                  <Button onClick={handleDrugFoodCheck} className="flex-1">
                    <Shield className="mr-2 h-4 w-4" />
                    Check Interactions
                  </Button>
                  <Button onClick={handleDrugFoodClear} variant="outline">
                    Clear
                  </Button>
                </div>
              </div>

              {drugFoodSearchPerformed && (
                <div className="space-y-6">
                  {drugFoodQuery.isLoading && (
                    <div className="space-y-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  )}

                  {drugFoodQuery.isError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Failed to check interactions. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}

                  {drugFoodQuery.data && drugFoodQuery.data.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                        Drug-Food Interactions ({drugFoodQuery.data.length})
                      </h3>
                      {drugFoodQuery.data.map((interaction, idx) => (
                        <DrugFoodCard
                          key={idx}
                          interaction={interaction}
                          hasRealData={hasRealDrugFoodData}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Food-Food Tab */}
            <TabsContent value="food-food" className="space-y-6 mt-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold text-stone-800 dark:text-stone-100">
                  Enter 2-4 Food Names
                </Label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="food1" className="text-sm font-medium mb-2 block">Food 1</Label>
                    <NameAutocompleteInput
                      id="food1"
                      value={food1}
                      onChange={setFood1}
                      suggestions={foodSuggestions}
                      placeholder="Food 1 (required)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="food2" className="text-sm font-medium mb-2 block">Food 2</Label>
                    <NameAutocompleteInput
                      id="food2"
                      value={food2}
                      onChange={setFood2}
                      suggestions={foodSuggestions}
                      placeholder="Food 2 (required)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="food3" className="text-sm font-medium mb-2 block">Food 3</Label>
                    <NameAutocompleteInput
                      id="food3"
                      value={food3}
                      onChange={setFood3}
                      suggestions={foodSuggestions}
                      placeholder="Food 3 (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="food4" className="text-sm font-medium mb-2 block">Food 4</Label>
                    <NameAutocompleteInput
                      id="food4"
                      value={food4}
                      onChange={setFood4}
                      suggestions={foodSuggestions}
                      placeholder="Food 4 (optional)"
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

                <div className="flex gap-3">
                  <Button onClick={handleFoodFoodCheck} className="flex-1">
                    <Shield className="mr-2 h-4 w-4" />
                    Check Interactions
                  </Button>
                  <Button onClick={handleFoodFoodClear} variant="outline">
                    Clear
                  </Button>
                </div>
              </div>

              {foodFoodSearchPerformed && (
                <div className="space-y-6">
                  {foodFoodQuery.isLoading && (
                    <div className="space-y-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  )}

                  {foodFoodQuery.isError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Failed to check interactions. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}

                  {foodFoodQuery.data && foodFoodQuery.data.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                        Food-Food Interactions ({foodFoodQuery.data.length})
                      </h3>
                      {foodFoodQuery.data.map((interaction, idx) => (
                        <FoodFoodCard
                          key={idx}
                          interaction={interaction}
                          hasRealData={hasRealFoodFoodData}
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
