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
import { useGetDrugDrugInteractionData } from '../hooks/useQueries';
import { resolveDrugMonograph } from '../services/drugMonographService';
import DrugMonographSections from './DrugMonographSections';

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
  const [activeTab, setActiveTab] = useState<'search' | 'details' | 'interactions' | 'monograph'>('search');
  const [manualDrugName, setManualDrugName] = useState('');

  const { data: databaseData, isLoading, error, refetch } = useGetDrugDrugInteractionData();

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
    setManualDrugName('');
  }, []);

  // Handle manual drug name entry
  const handleManualLookup = useCallback(() => {
    if (!manualDrugName.trim()) return;
    
    // Try to find in database first
    const foundDrug = databaseData?.find(d => 
      d.name.toLowerCase() === manualDrugName.toLowerCase() ||
      d.genericName?.toLowerCase() === manualDrugName.toLowerCase()
    );
    
    if (foundDrug) {
      handleSelectDrug(foundDrug);
    } else {
      // Create a minimal drug info object for monograph lookup
      setSelectedDrug({
        name: manualDrugName,
        source: 'Multiple'
      });
      setActiveTab('monograph');
    }
  }, [manualDrugName, databaseData, handleSelectDrug]);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    refetch();
  }, [refetch]);

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

  // Resolve monograph for selected drug
  const monograph = selectedDrug ? resolveDrugMonograph(selectedDrug.name) : null;

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
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
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
              <TabsTrigger value="monograph" disabled={!selectedDrug} className="gap-2">
                <FileText className="h-4 w-4" />
                Monograph
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

              {/* Manual Drug Name Entry */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Manual Drug Lookup
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Enter any drug name to view its monograph data (Cmax, Tmax, t½, side effects, contraindications, special populations)
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter drug name..."
                    value={manualDrugName}
                    onChange={(e) => setManualDrugName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
                    className="flex-1"
                  />
                  <Button onClick={handleManualLookup} disabled={!manualDrugName.trim()}>
                    Lookup
                  </Button>
                </div>
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
                            <ChevronDown className="h-5 w-5 text-gray-400" />
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
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedDrug.name}
                      </h2>
                      {selectedDrug.genericName && (
                        <p className="text-gray-600 dark:text-gray-400">
                          Generic: {selectedDrug.genericName}
                        </p>
                      )}
                    </div>
                    <Badge className={getSourceColor(selectedDrug.source)}>
                      {selectedDrug.source}
                    </Badge>
                  </div>

                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-6">
                      {/* Pharmacokinetic Parameters */}
                      {(selectedDrug.cmax || selectedDrug.tmax || selectedDrug.halfLife) && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Activity className="h-5 w-5 text-blue-600" />
                              Pharmacokinetic Parameters
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {selectedDrug.cmax && (
                              <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Cmax</p>
                                <p className="text-lg text-gray-900 dark:text-gray-100">{selectedDrug.cmax}</p>
                              </div>
                            )}
                            {selectedDrug.tmax && (
                              <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Tmax</p>
                                <p className="text-lg text-gray-900 dark:text-gray-100">{selectedDrug.tmax}</p>
                              </div>
                            )}
                            {selectedDrug.halfLife && (
                              <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Half-life (t½)</p>
                                <p className="text-lg text-gray-900 dark:text-gray-100">{selectedDrug.halfLife}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Uses */}
                      {selectedDrug.uses && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Pill className="h-5 w-5 text-green-600" />
                              Clinical Uses
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-700 dark:text-gray-300">{selectedDrug.uses}</p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Side Effects */}
                      {selectedDrug.sideEffects && selectedDrug.sideEffects.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-orange-600" />
                              Side Effects
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {selectedDrug.sideEffects.map((effect, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-orange-500 mt-1">•</span>
                                  <span className="text-gray-700 dark:text-gray-300">{effect}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {/* Brand Names */}
                      {selectedDrug.brandNames && selectedDrug.brandNames.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-purple-600" />
                              Brand Names
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {selectedDrug.brandNames.map((brand, idx) => (
                                <Badge key={idx} variant="outline">
                                  {brand}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Combination Forms */}
                      {selectedDrug.combinationForms && selectedDrug.combinationForms.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Database className="h-5 w-5 text-teal-600" />
                              Combination Forms
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {selectedDrug.combinationForms.map((combo, idx) => (
                                <li key={idx} className="text-gray-700 dark:text-gray-300">
                                  • {combo}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                </>
              )}
            </TabsContent>

            {/* Interactions Tab */}
            <TabsContent value="interactions" className="space-y-4">
              {selectedDrug && selectedDrug.interactions && selectedDrug.interactions.length > 0 ? (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {selectedDrug.interactions.map((interaction, idx) => (
                      <Card key={idx} className="border-2">
                        <CardHeader 
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => setExpandedInteraction(expandedInteraction === idx ? null : idx)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">
                                {interaction.drugA} + {interaction.drugB}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getSeverityColor(interaction.severity)}>
                                  {interaction.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">{interaction.evidenceLevel}</Badge>
                              </div>
                            </div>
                            {expandedInteraction === idx ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </CardHeader>
                        
                        {expandedInteraction === idx && (
                          <CardContent className="space-y-4 pt-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Mechanism</h4>
                              <p className="text-gray-700 dark:text-gray-300">{interaction.mechanism}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Description</h4>
                              <p className="text-gray-700 dark:text-gray-300">{interaction.description}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Clinical Significance</h4>
                              <p className="text-gray-700 dark:text-gray-300">{interaction.clinicalSignificance}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Management Recommendations</h4>
                              <p className="text-gray-700 dark:text-gray-300">{interaction.managementRecommendations}</p>
                            </div>
                            
                            {interaction.alternatives && interaction.alternatives.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Alternative Options</h4>
                                <ul className="space-y-1">
                                  {interaction.alternatives.map((alt, altIdx) => (
                                    <li key={altIdx} className="text-gray-700 dark:text-gray-300">
                                      • {alt}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {interaction.references && interaction.references.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">References</h4>
                                <ul className="space-y-1">
                                  {interaction.references.map((ref, refIdx) => (
                                    <li key={refIdx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                      <ExternalLink className="h-3 w-3 mt-1 flex-shrink-0" />
                                      <span>{ref}</span>
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
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <Info className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No interaction data available for this drug
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Monograph Tab */}
            <TabsContent value="monograph" className="space-y-4">
              {selectedDrug && (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedDrug.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Comprehensive Monograph Data
                      </p>
                    </div>
                  </div>

                  <ScrollArea className="h-[600px] pr-4">
                    <DrugMonographSections monograph={monograph} drugName={selectedDrug.name} />
                  </ScrollArea>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
