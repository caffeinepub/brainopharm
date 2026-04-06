import { useState } from 'react';
import { useGetPatient } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import LabResultsForm from './LabResultsForm';
import MedicationForm from './MedicationForm';
import AdrForm from './AdrForm';
import CaseSummary from './CaseSummary';
import PrescriberDetailsSection from './PrescriberDetailsSection';
import CaseNarrationSection from './CaseNarrationSection';
import { Activity, Pill, AlertTriangle, FileText, UserCog, Sparkles } from 'lucide-react';

interface CaseEntryProps {
  patientId: string;
}

export default function CaseEntry({ patientId }: CaseEntryProps) {
  const { data: patient, isLoading } = useGetPatient(patientId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading patient...</p>
        </div>
      </div>
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

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', variant: 'secondary' as const };
    if (bmi < 25) return { label: 'Normal', variant: 'default' as const };
    if (bmi < 30) return { label: 'Overweight', variant: 'secondary' as const };
    return { label: 'Obese', variant: 'destructive' as const };
  };

  const bmiCategory = getBmiCategory(patient.bmi);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Selected Patient</CardTitle>
          <CardDescription>Recording data for the following patient</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Age / Gender</p>
              <p>{Number(patient.age)} years / {patient.gender}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">BMI</p>
              <div className="flex items-center gap-2">
                <span>{patient.bmi.toFixed(1)}</span>
                <Badge variant={bmiCategory.variant}>{bmiCategory.label}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="lab" className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-auto w-full min-w-max">
            <TabsTrigger value="lab" className="gap-2 whitespace-nowrap">
              <Activity className="h-4 w-4" />
              Lab Results
            </TabsTrigger>
            <TabsTrigger value="medications" className="gap-2 whitespace-nowrap">
              <Pill className="h-4 w-4" />
              Medications
            </TabsTrigger>
            <TabsTrigger value="adr" className="gap-2 whitespace-nowrap">
              <AlertTriangle className="h-4 w-4" />
              ADR
            </TabsTrigger>
            <TabsTrigger value="prescriber" className="gap-2 whitespace-nowrap">
              <UserCog className="h-4 w-4" />
              Prescriber
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-2 whitespace-nowrap">
              <FileText className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="narration" className="gap-2 whitespace-nowrap">
              <Sparkles className="h-4 w-4" />
              Narration Creation
            </TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="lab">
          <LabResultsForm patientId={patientId} />
        </TabsContent>

        <TabsContent value="medications">
          <MedicationForm patientId={patientId} />
        </TabsContent>

        <TabsContent value="adr">
          <AdrForm patientId={patientId} />
        </TabsContent>

        <TabsContent value="prescriber">
          <PrescriberDetailsSection patientId={patientId} />
        </TabsContent>

        <TabsContent value="summary">
          <CaseSummary patientId={patientId} />
        </TabsContent>

        <TabsContent value="narration">
          <CaseNarrationSection patientId={patientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
