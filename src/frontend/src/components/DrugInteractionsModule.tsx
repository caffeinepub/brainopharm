import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ExternalLink, AlertTriangle, Info, Search, GitCompare, X, Database, Shield, Activity, Pill, Users, Lightbulb } from 'lucide-react';
import { useCheckMultiDrugInteraction } from '../hooks/useQueries';
import { Skeleton } from './ui/skeleton';
import { Severity, InteractionType, EvidenceLevel, ToxicityRiskLevel } from '../backend';
import type { ClinicallyOrientedInteraction } from '../backend';
import { generateOverallSummary, formatSeverity, formatToxicityRisk } from '../utils/interactionSummary';
import { normalizeDrugName, formatDrugPairLabel } from '../utils/drugPairs';
import { drugInteractionExamples, loadExampleSet } from '../data/drugInteractionExamples';

export default function DrugInteractionsModule() {
  const [drug1, setDrug1] = useState('');
  const [drug2, setDrug2] = useState('');
  const [drug3, setDrug3] = useState('');
  const [drug4, setDrug4] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [selectedExample, setSelectedExample] = useState<string>('');
  
  const checkInteraction = useCheckMultiDrugInteraction();

  const handleCheckInteraction = async () => {
    setValidationError('');

    const drugs = [drug1.trim(), drug2.trim(), drug3.trim(), drug4.trim()].filter(d => d);

    if (drugs.length < 2) {
      setValidationError('Please enter at least two medications to check interactions.');
      return;
    }

    // Use normalized drug names for duplicate detection
    const normalizedDrugs = drugs.map(d => normalizeDrugName(d));
    const uniqueNormalized = new Set(normalizedDrugs);
    
    if (uniqueNormalized.size !== drugs.length) {
      setValidationError('Please enter different medications. Duplicate drug names detected.');
      return;
    }

    checkInteraction.mutate(
      { drugs },
      {
        onSuccess: () => {
          setSearchPerformed(true);
          setValidationError('');
        },
        onError: () => {
          setValidationError('Failed to check drug interactions. Please try again.');
        },
      }
    );
  };

  const handleReset = () => {
    setDrug1('');
    setDrug2('');
    setDrug3('');
    setDrug4('');
    setSearchPerformed(false);
    setValidationError('');
    setSelectedExample('');
    checkInteraction.reset();
  };

  const handleLoadExample = (exampleId: string) => {
    if (!exampleId) return;
    
    const example = loadExampleSet(exampleId);
    setDrug1(example.drug1);
    setDrug2(example.drug2);
    setDrug3(example.drug3);
    setDrug4(example.drug4);
    setSelectedExample(exampleId);
    setSearchPerformed(false);
    setValidationError('');
    checkInteraction.reset();
  };

  const getSeverityBadgeVariant = (severity?: Severity): 'default' | 'secondary' | 'destructive' | 'outline' => {
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
  };

  const getToxicityBadgeVariant = (risk?: ToxicityRiskLevel): 'default' | 'secondary' | 'destructive' | 'outline' => {
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
  };

  const getInteractionTypeLabel = (type?: InteractionType | null) => {
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
  };

  const getEvidenceLevelLabel = (level?: EvidenceLevel | null) => {
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
  };

  // Check if an interaction has real data
  const hasRealData = (interaction: ClinicallyOrientedInteraction): boolean => {
    return !!(
      interaction.description ||
      interaction.severity ||
      interaction.managementRecommendations ||
      interaction.clinicalEffects
    );
  };

  const enteredDrugs = [drug1.trim(), drug2.trim(), drug3.trim(), drug4.trim()].filter(d => d);
  const canCheck = enteredDrugs.length >= 2;

  const safetyAdvisory = checkInteraction.data;
  const overallSummary = safetyAdvisory ? generateOverallSummary(safetyAdvisory.pairwiseInteractions) : null;

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
                Check for potential interactions between 2-4 medications with comprehensive safety details
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

            <TabsContent value="drug-drug" className="space-y-6">
              {/* Data Source Disclaimer */}
              <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-900 dark:text-blue-100">Data Source Information</AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  Interaction results are sourced from the app's built-in interaction database. Coverage may be incomplete for some drug combinations. This tool does not use external AI services (ChatGPT, Perplexity, etc.). Always verify with current medical literature and prescribing information.
                </AlertDescription>
              </Alert>

              {/* Load Example Section */}
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
                      <SelectTrigger className="flex-1 bg-white dark:bg-gray-950">
                        <SelectValue placeholder="Select an example..." />
                      </SelectTrigger>
                      <SelectContent>
                        {drugInteractionExamples.map((example) => (
                          <SelectItem key={example.id} value={example.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{example.name}</span>
                              <span className="text-xs text-muted-foreground">{example.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedExample && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedExample('');
                          handleReset();
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Comprehensive Drug Safety Analysis</AlertTitle>
                <AlertDescription>
                  Enter 2-4 medications to receive detailed interaction analysis including clinical effects, toxicity risk, management recommendations, and special population guidance.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="drug1" className="flex items-center gap-2">
                    Drug 1 <Badge variant="destructive" className="text-xs">Required</Badge>
                  </Label>
                  <div className="relative">
                    <Input
                      id="drug1"
                      value={drug1}
                      onChange={(e) => setDrug1(e.target.value)}
                      placeholder="e.g., Warfarin"
                      className="pr-8"
                    />
                    {drug1 && (
                      <button
                        onClick={() => setDrug1('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drug2" className="flex items-center gap-2">
                    Drug 2 <Badge variant="destructive" className="text-xs">Required</Badge>
                  </Label>
                  <div className="relative">
                    <Input
                      id="drug2"
                      value={drug2}
                      onChange={(e) => setDrug2(e.target.value)}
                      placeholder="e.g., Aspirin"
                      className="pr-8"
                    />
                    {drug2 && (
                      <button
                        onClick={() => setDrug2('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drug3" className="flex items-center gap-2">
                    Drug 3 <Badge variant="outline" className="text-xs">Optional</Badge>
                  </Label>
                  <div className="relative">
                    <Input
                      id="drug3"
                      value={drug3}
                      onChange={(e) => setDrug3(e.target.value)}
                      placeholder="e.g., Metformin"
                      className="pr-8"
                    />
                    {drug3 && (
                      <button
                        onClick={() => setDrug3('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drug4" className="flex items-center gap-2">
                    Drug 4 <Badge variant="outline" className="text-xs">Optional</Badge>
                  </Label>
                  <div className="relative">
                    <Input
                      id="drug4"
                      value={drug4}
                      onChange={(e) => setDrug4(e.target.value)}
                      placeholder="e.g., Lisinopril"
                      className="pr-8"
                    />
                    {drug4 && (
                      <button
                        onClick={() => setDrug4('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {validationError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleCheckInteraction}
                  disabled={!canCheck || checkInteraction.isPending}
                  size="lg"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {checkInteraction.isPending ? 'Analyzing...' : 'Check Interactions'}
                </Button>
                {searchPerformed && (
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                )}
                {!canCheck && !validationError && (
                  <p className="text-sm text-muted-foreground">
                    Enter at least two medications to check interactions
                  </p>
                )}
              </div>

              {checkInteraction.isPending && (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
              )}

              {searchPerformed && safetyAdvisory && overallSummary && (
                <div className="space-y-6">
                  {/* Disclaimer Section */}
                  <Alert className="border-2 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
                    <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-900 dark:text-amber-100">Clinical Decision Support Disclaimer</AlertTitle>
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      This interaction checker is for educational and informational purposes only. It is not intended to provide medical advice or replace professional healthcare consultation. Always consult with qualified healthcare professionals before making any clinical decisions or treatment changes. The drug interaction information should be verified with current medical literature and prescribing information.
                    </AlertDescription>
                  </Alert>

                  {/* Overall Summary Section */}
                  {!overallSummary.allDataMissing && (
                    <Card className="border-2 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                          <Activity className="h-5 w-5" />
                          Overall Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {overallSummary.highestSeverity ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-blue-900 dark:text-blue-100">Highest Severity:</span>
                              <Badge variant={getSeverityBadgeVariant(overallSummary.highestSeverity)}>
                                {formatSeverity(overallSummary.highestSeverity)}
                              </Badge>
                            </div>
                            {overallSummary.highestSeverityPairs.length > 0 && (
                              <div>
                                <span className="font-semibold text-blue-900 dark:text-blue-100">Critical Pair(s):</span>
                                <ul className="mt-2 space-y-1">
                                  {overallSummary.highestSeverityPairs.map((pairLabel, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                      <Pill className="h-4 w-4" />
                                      {pairLabel}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-blue-800 dark:text-blue-200">
                            No severity information available for the checked drug combinations.
                          </p>
                        )}

                        {overallSummary.topRecommendations.length > 0 && (
                          <div className="space-y-2">
                            <span className="font-semibold text-blue-900 dark:text-blue-100">Key Recommendations:</span>
                            <ul className="mt-2 space-y-1">
                              {overallSummary.topRecommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm text-blue-800 dark:text-blue-200">
                                  • {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Pairwise Interactions Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Pairwise Drug Interactions
                    </h3>

                    {safetyAdvisory.pairwiseInteractions.map((interaction, index) => {
                      const pairLabel = formatDrugPairLabel(interaction.drugs.drugA, interaction.drugs.drugB);
                      const hasData = hasRealData(interaction);

                      return (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Pill className="h-4 w-4 text-primary" />
                              {pairLabel}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {!hasData ? (
                              <Alert className="border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/30">
                                <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                <AlertDescription className="text-gray-700 dark:text-gray-300">
                                  No interaction data found for this drug pair in the database.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <>
                                {/* Severity and Toxicity Risk */}
                                <div className="flex flex-wrap gap-3">
                                  {interaction.severity && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">Severity:</span>
                                      <Badge variant={getSeverityBadgeVariant(interaction.severity)}>
                                        {formatSeverity(interaction.severity)}
                                      </Badge>
                                    </div>
                                  )}
                                  {interaction.toxicityRisk && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">Toxicity Risk:</span>
                                      <Badge variant={getToxicityBadgeVariant(interaction.toxicityRisk)}>
                                        {formatToxicityRisk(interaction.toxicityRisk)}
                                      </Badge>
                                    </div>
                                  )}
                                  {interaction.interactionType && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">Type:</span>
                                      <Badge variant="outline">
                                        {getInteractionTypeLabel(interaction.interactionType)}
                                      </Badge>
                                    </div>
                                  )}
                                </div>

                                {/* Description */}
                                {interaction.description && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Description</h4>
                                    <p className="text-sm text-muted-foreground">{interaction.description}</p>
                                  </div>
                                )}

                                {/* Clinical Effects */}
                                {interaction.clinicalEffects && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Clinical Effects</h4>
                                    <p className="text-sm text-muted-foreground">{interaction.clinicalEffects}</p>
                                  </div>
                                )}

                                {/* Management Recommendations */}
                                {interaction.managementRecommendations && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Management Recommendations</h4>
                                    <p className="text-sm text-muted-foreground">{interaction.managementRecommendations}</p>
                                  </div>
                                )}

                                {/* Evidence Level */}
                                {interaction.evidenceLevel && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Evidence Level:</span>
                                    <Badge variant="outline">
                                      {getEvidenceLevelLabel(interaction.evidenceLevel)}
                                    </Badge>
                                  </div>
                                )}

                                {/* References */}
                                {interaction.references && interaction.references.length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">References</h4>
                                    <ul className="space-y-1">
                                      {interaction.references.map((ref, refIdx) => (
                                        <li key={refIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                                          <ExternalLink className="h-3 w-3 mt-1 flex-shrink-0" />
                                          <span>{ref}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Special Populations Section */}
                  {(safetyAdvisory.specialPopulations.pregnancy ||
                    safetyAdvisory.specialPopulations.lactation ||
                    safetyAdvisory.specialPopulations.pediatrics ||
                    safetyAdvisory.specialPopulations.geriatrics) && (
                    <Card className="border-2 border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                          <Users className="h-5 w-5" />
                          Special Populations Guidance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {safetyAdvisory.specialPopulations.pregnancy && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Pregnancy</h4>
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                              {safetyAdvisory.specialPopulations.pregnancy}
                            </p>
                          </div>
                        )}
                        {safetyAdvisory.specialPopulations.lactation && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Lactation</h4>
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                              {safetyAdvisory.specialPopulations.lactation}
                            </p>
                          </div>
                        )}
                        {safetyAdvisory.specialPopulations.pediatrics && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Pediatrics</h4>
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                              {safetyAdvisory.specialPopulations.pediatrics}
                            </p>
                          </div>
                        )}
                        {safetyAdvisory.specialPopulations.geriatrics && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Geriatrics</h4>
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                              {safetyAdvisory.specialPopulations.geriatrics}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="drug-food" className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  Drug-Food interaction checking will be available in a future update.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="food-food" className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  Food-Food interaction checking will be available in a future update.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
