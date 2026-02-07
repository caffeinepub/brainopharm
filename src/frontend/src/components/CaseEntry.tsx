import { useState } from 'react';
import { useGetPatient } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import LabResultsForm from './LabResultsForm';
import MedicationForm from './MedicationForm';
import AdrForm from './AdrForm';
import CaseSummary from './CaseSummary';
import { Activity, Pill, AlertTriangle, FileText } from 'lucide-react';

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lab" className="gap-2">
            <Activity className="h-4 w-4" />
            Lab Results
          </TabsTrigger>
          <TabsTrigger value="medications" className="gap-2">
            <Pill className="h-4 w-4" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="adr" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            ADR
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <FileText className="h-4 w-4" />
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lab">
          <LabResultsForm patientId={patientId} patient={patient} />
        </TabsContent>

        <TabsContent value="medications">
          <MedicationForm patientId={patientId} />
        </TabsContent>

        <TabsContent value="adr">
          <AdrForm patientId={patientId} />
        </TabsContent>

        <TabsContent value="summary">
          <CaseSummary patientId={patientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
