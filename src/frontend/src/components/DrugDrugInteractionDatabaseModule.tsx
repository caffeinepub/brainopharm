import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  Database, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Pill,
  Activity,
  FileText,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useGetDrugDrugInteractionData, useGetDrugDrugInteractionLastUpdated, useRefreshDrugDrugInteractionData } from '../hooks/useQueries';

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

export default function DrugDrugInteractionDatabaseModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null);
  const [expandedInteraction, setExpandedInteraction] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'details' | 'interactions'>('search');

  const { data: databaseData, isLoading, error, refetch } = useGetDrugDrugInteractionData();
  const { data: lastUpdated } = useGetDrugDrugInteractionLastUpdated();
  const refreshMutation = useRefreshDrugDrugInteractionData();

  // Filter drugs based on search term
  const filteredDrugs = useMemo(() => {
    if (!databaseData) return [];
    if (!searchTerm.trim()) return databaseData;

    const lowerSearch = searchTerm.toLowerCase();
    return databaseData.filter(drug => 
      drug.name.toLowerCase().includes(lowerSearch) ||
      drug.genericName?.toLowerCase().includes(lowerSearch) ||
      drug.brandNames?.some(brand => brand.toLowerCase().includes(lowerSearch))
    );
  }, [databaseData, searchTerm]);

  // Handle drug selection
  const handleSelectDrug = useCallback((drug: DrugInfo) => {
    setSelectedDrug(drug);
    setActiveTab('details');
    setExpandedInteraction(null);
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    await refreshMutation.mutateAsync();
    refetch();
  }, [refreshMutation, refetch]);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'contraindicated': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get source badge color
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'PubChem': return 'bg-blue-100 text-blue-800';
      case 'FDA': return 'bg-purple-100 text-purple-800';
      case 'WHO': return 'bg-teal-100 text-teal-800';
      case 'Multiple': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    Drug-Drug Interaction Database
                  </CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300 mt-1">
                    Comprehensive pharmacological data from PubChem, FDA Drugs@FDA, and WHO ATC/DDD Index
                  </CardDescription>
                </div>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Data Sources Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200 dark:border-blue-800">
              <img 
                src="/assets/generated/pubchem-integration-icon.dim_64x64.png" 
                alt="PubChem" 
                className="h-10 w-10"
                loading="lazy"
              />
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">PubChem</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Interaction Profiles</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200 dark:border-blue-800">
              <img 
                src="/assets/generated/fda-drugs-integration-icon.dim_64x64.png" 
                alt="FDA" 
                className="h-10 w-10"
                loading="lazy"
              />
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">FDA Drugs@FDA</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Official Labeling</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200 dark:border-blue-800">
              <img 
                src="/assets/generated/who-atc-integration-icon.dim_64x64.png" 
                alt="WHO" 
                className="h-10 w-10"
                loading="lazy"
              />
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">WHO ATC/DDD</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Combination Forms</p>
              </div>
            </div>
          </div>

          {/* Last Updated Info */}
          {lastUpdated && (
            <div className="flex items-center gap-2 mt-4 text-sm text-blue-700 dark:text-blue-300">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdated.toLocaleString()}</span>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="search" className="gap-2">
                <Search className="h-4 w-4" />
                Search Drugs
              </TabsTrigger>
              <TabsTrigger value="details" disabled={!selectedDrug} className="gap-2">
                <Pill className="h-4 w-4" />
                Drug Details
              </TabsTrigger>
              <TabsTrigger value="interactions" disabled={!selectedDrug} className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Interactions
              </TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by drug name, generic name, or brand name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load drug database. Please try refreshing.
                  </AlertDescription>
                </Alert>
              ) : filteredDrugs.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {searchTerm ? 'No drugs found matching your search' : 'Start typing to search drugs'}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {filteredDrugs.map((drug, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
                        onClick={() => handleSelectDrug(drug)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                  {drug.name}
                                </h3>
                                <Badge className={getSourceColor(drug.source)}>
                                  {drug.source}
                                </Badge>
                              </div>
                              {drug.genericName && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  Generic: {drug.genericName}
                                </p>
                              )}
                              {drug.brandNames && drug.brandNames.length > 0 && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Brands: {drug.brandNames.slice(0, 3).join(', ')}
                                  {drug.brandNames.length > 3 && ` +${drug.brandNames.length - 3} more`}
                                </p>
                              )}
                            </div>
                            <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* Drug Details Tab */}
            <TabsContent value="details" className="space-y-4">
              {selectedDrug && (
                <div className="space-y-6">
                  {/* Drug Header */}
                  <div className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {selectedDrug.name}
                      </h2>
                      {selectedDrug.genericName && (
                        <p className="text-gray-600 dark:text-gray-400">
                          Generic: {selectedDrug.genericName}
                        </p>
                      )}
                      {selectedDrug.brandNames && selectedDrug.brandNames.length > 0 && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          Brand Names: {selectedDrug.brandNames.join(', ')}
                        </p>
                      )}
                    </div>
                    <Badge className={getSourceColor(selectedDrug.source)} variant="outline">
                      {selectedDrug.source}
                    </Badge>
                  </div>

                  {/* Pharmacological Parameters */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Pharmacological Parameters
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedDrug.cmax && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cmax (Maximum Plasma Concentration)</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedDrug.cmax}</p>
                          </div>
                        )}
                        {selectedDrug.tmax && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tmax (Time to Reach Cmax)</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedDrug.tmax}</p>
                          </div>
                        )}
                        {selectedDrug.halfLife && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">t½ (Elimination Half-Life)</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedDrug.halfLife}</p>
                          </div>
                        )}
                        {selectedDrug.eliminationRate && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Elimination Rate</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedDrug.eliminationRate}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Clinical Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Clinical Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedDrug.uses && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Uses & Indications</h4>
                          <p className="text-gray-700 dark:text-gray-300">{selectedDrug.uses}</p>
                        </div>
                      )}
                      {selectedDrug.abusePotential && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Abuse Potential</h4>
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>{selectedDrug.abusePotential}</AlertDescription>
                          </Alert>
                        </div>
                      )}
                      {selectedDrug.sideEffects && selectedDrug.sideEffects.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Side Effects (FDA Labelled)</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedDrug.sideEffects.map((effect, idx) => (
                              <Badge key={idx} variant="outline" className="bg-orange-50 text-orange-800 border-orange-300">
                                {effect}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedDrug.combinationForms && selectedDrug.combinationForms.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Combination Dosage Forms (WHO ATC/DDD)</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedDrug.combinationForms.map((form, idx) => (
                              <Badge key={idx} variant="outline" className="bg-teal-50 text-teal-800 border-teal-300">
                                {form}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Interactions Tab */}
            <TabsContent value="interactions" className="space-y-4">
              {selectedDrug && (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      The following interactions are documented for {selectedDrug.name}. Always consult current medical literature and prescribing information.
                    </AlertDescription>
                  </Alert>

                  {selectedDrug.interactions && selectedDrug.interactions.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDrug.interactions.map((interaction, idx) => (
                        <Card key={idx} className="border-l-4" style={{
                          borderLeftColor: interaction.severity === 'contraindicated' || interaction.severity === 'major'
                            ? 'rgb(239, 68, 68)'
                            : interaction.severity === 'moderate'
                            ? 'rgb(251, 191, 36)'
                            : 'rgb(34, 197, 94)'
                        }}>
                          <CardHeader className="cursor-pointer" onClick={() => setExpandedInteraction(expandedInteraction === idx ? null : idx)}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CardTitle className="text-base">
                                  {interaction.drugA} + {interaction.drugB}
                                </CardTitle>
                                <Badge className={getSeverityColor(interaction.severity)}>
                                  {interaction.severity.toUpperCase()}
                                </Badge>
                              </div>
                              {expandedInteraction === idx ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </CardHeader>
                          {expandedInteraction === idx && (
                            <CardContent className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Mechanism</h4>
                                <p className="text-gray-700 dark:text-gray-300">{interaction.mechanism}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h4>
                                <p className="text-gray-700 dark:text-gray-300">{interaction.description}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Clinical Significance</h4>
                                <p className="text-gray-700 dark:text-gray-300">{interaction.clinicalSignificance}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Management Recommendations</h4>
                                <p className="text-gray-700 dark:text-gray-300">{interaction.managementRecommendations}</p>
                              </div>
                              {interaction.alternatives && interaction.alternatives.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Alternative Options</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {interaction.alternatives.map((alt, altIdx) => (
                                      <Badge key={altIdx} variant="outline" className="bg-green-50 text-green-800 border-green-300">
                                        {alt}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Evidence Level</h4>
                                <Badge variant="outline">{interaction.evidenceLevel}</Badge>
                              </div>
                              {interaction.references && interaction.references.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">References</h4>
                                  <ul className="space-y-1">
                                    {interaction.references.map((ref, refIdx) => (
                                      <li key={refIdx} className="text-sm">
                                        <a
                                          href={ref}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          {ref}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        No documented interactions found for {selectedDrug.name}
                      </p>
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
