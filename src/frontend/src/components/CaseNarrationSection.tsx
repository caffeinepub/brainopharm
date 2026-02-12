import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, 
  Copy, 
  CheckCircle, 
  Sparkles, 
  User, 
  Activity, 
  Pill, 
  AlertTriangle, 
  UserCog,
  Save,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  useGetAllLabResults, 
  useGetAllMedications, 
  useGetAllAdrs, 
  useGetPatient, 
  useGetPrescriberDetails,
  useGetCaseNarrations,
  useAddCaseNarration
} from '../hooks/useQueries';
import { generateCaseNarration, generateExternalToolPrompt } from '../services/caseNarrationGenerator';
import { toast } from 'sonner';

interface CaseNarrationSectionProps {
  patientId: string;
}

export default function CaseNarrationSection({ patientId }: CaseNarrationSectionProps) {
  const [copiedNarration, setCopiedNarration] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [expandedNarrationId, setExpandedNarrationId] = useState<string | null>(null);

  const { data: patient, isLoading: patientLoading } = useGetPatient(patientId);
  const { data: allLabResults = [], isLoading: labLoading } = useGetAllLabResults();
  const { data: allMedications = [], isLoading: medLoading } = useGetAllMedications();
  const { data: allAdrs = [], isLoading: adrLoading } = useGetAllAdrs();
  const { data: prescriberDetails, isLoading: prescriberLoading } = useGetPrescriberDetails(patientId);
  const { data: savedNarrations = [], isLoading: narrationsLoading } = useGetCaseNarrations(patientId);
  const addNarration = useAddCaseNarration();

  const isLoading = patientLoading || labLoading || medLoading || adrLoading || prescriberLoading;

  // Filter data for current patient
  const labResults = useMemo(() => allLabResults.filter(lab => lab.patientId === patientId), [allLabResults, patientId]);
  const medications = useMemo(() => allMedications.filter(med => med.patientId === patientId), [allMedications, patientId]);
  const adrs = useMemo(() => allAdrs.filter(adr => adr.patientId === patientId), [allAdrs, patientId]);

  // Generate narration and prompt
  const { narration, externalPrompt } = useMemo(() => {
    if (!patient) {
      return { narration: '', externalPrompt: '' };
    }

    const caseSummaryData = {
      patient,
      prescriberDetails,
      labResults,
      medications,
      adrs,
    };

    return {
      narration: generateCaseNarration(caseSummaryData),
      externalPrompt: generateExternalToolPrompt(caseSummaryData),
    };
  }, [patient, prescriberDetails, labResults, medications, adrs]);

  const handleCopyNarration = async () => {
    try {
      await navigator.clipboard.writeText(narration);
      setCopiedNarration(true);
      toast.success('Narration copied to clipboard');
      setTimeout(() => setCopiedNarration(false), 2000);
    } catch (error) {
      toast.error('Failed to copy narration');
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(externalPrompt);
      setCopiedPrompt(true);
      toast.success('Prompt copied to clipboard');
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  const handleSaveNarration = async () => {
    if (!patient) return;

    try {
      await addNarration.mutateAsync({
        patientId,
        content: narration,
      });
      toast.success('Narration saved successfully');
    } catch (error) {
      toast.error('Failed to save narration');
    }
  };

  const formatDate = (timestamp: bigint) => {
    try {
      const date = new Date(Number(timestamp) / 1000000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Not available';
    }
  };

  const toggleNarrationExpansion = (narrationId: string) => {
    setExpandedNarrationId(expandedNarrationId === narrationId ? null : narrationId);
  };

  // Sort saved narrations by timestamp (most recent first)
  const sortedNarrations = useMemo(() => {
    return [...savedNarrations].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  }, [savedNarrations]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading case data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!patient) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Patient not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border-violet-200 dark:border-violet-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-violet-600 dark:bg-violet-500">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-violet-900 dark:text-violet-100">Narration Creation</CardTitle>
              <CardDescription className="text-violet-700 dark:text-violet-300">
                Generate clinical narrations from case summary data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="narration" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="narration" className="gap-2">
                <FileText className="h-4 w-4" />
                Generated Narration
              </TabsTrigger>
              <TabsTrigger value="prompt" className="gap-2">
                <Sparkles className="h-4 w-4" />
                External Tool Prompt
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                Saved Narrations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="narration" className="space-y-4">
              <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Clinical Case Narration</CardTitle>
                      <CardDescription>
                        Structured narration generated from case summary data
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveNarration}
                        disabled={addNarration.isPending || !narration}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        {addNarration.isPending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCopyNarration}
                        disabled={!narration}
                        variant="default"
                        size="sm"
                        className="gap-2"
                      >
                        {copiedNarration ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {narration ? (
                    <ScrollArea className="h-[500px] w-full rounded-md border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-stone-900 dark:text-stone-100">
                          {narration}
                        </pre>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No case data available to generate narration</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Data Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                      <div>
                        <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">1</p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">Patient</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Activity className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{labResults.length}</p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">Lab Results</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Pill className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{medications.length}</p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">Medications</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{adrs.length}</p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">ADRs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="prompt" className="space-y-4">
              <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">External Tool Prompt</CardTitle>
                      <CardDescription>
                        Copy this prompt to Perplexity, Copilot, ChatGPT, or Gemini for AI-powered narration
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleCopyPrompt}
                      disabled={!externalPrompt}
                      variant="default"
                      size="sm"
                      className="gap-2"
                    >
                      {copiedPrompt ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Prompt
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {externalPrompt ? (
                    <ScrollArea className="h-[500px] w-full rounded-md border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-stone-900 dark:text-stone-100">
                          {externalPrompt}
                        </pre>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No case data available to generate prompt</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900 dark:text-blue-100">How to Use</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                  <div className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">1</Badge>
                    <p>Click "Copy Prompt" to copy the structured prompt to your clipboard</p>
                  </div>
                  <div className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">2</Badge>
                    <p>Open your preferred AI tool (Perplexity, Copilot, ChatGPT, or Gemini)</p>
                  </div>
                  <div className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">3</Badge>
                    <p>Paste the prompt and receive an AI-generated clinical narration</p>
                  </div>
                  <div className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">4</Badge>
                    <p>Review and refine the AI-generated narration as needed</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
                <CardHeader>
                  <CardTitle className="text-lg">Saved Narrations</CardTitle>
                  <CardDescription>
                    Previously saved narrations for {patient.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {narrationsLoading ? (
                    <div className="text-center py-8">
                      <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="text-sm text-muted-foreground">Loading saved narrations...</p>
                    </div>
                  ) : sortedNarrations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No saved narrations yet</p>
                      <p className="text-sm mt-2">Save your first narration from the "Generated Narration" tab</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3">
                        {sortedNarrations.map((narr) => (
                          <Card key={narr.narrationId} className="border-stone-200 dark:border-stone-800">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                  <div>
                                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                                      Version {Number(narr.version)}
                                    </p>
                                    <p className="text-xs text-stone-600 dark:text-stone-400">
                                      {formatDate(narr.timestamp)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {narr.status === 'draft' ? 'Draft' : narr.status === 'finalized' ? 'Finalized' : 'Reviewed'}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleNarrationExpansion(narr.narrationId)}
                                  >
                                    {expandedNarrationId === narr.narrationId ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            {expandedNarrationId === narr.narrationId && (
                              <CardContent className="pt-0">
                                <Separator className="mb-3" />
                                <ScrollArea className="h-[300px] w-full rounded-md border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
                                  <div className="p-4">
                                    <pre className="whitespace-pre-wrap font-mono text-xs text-stone-900 dark:text-stone-100">
                                      {narr.content}
                                    </pre>
                                  </div>
                                </ScrollArea>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
