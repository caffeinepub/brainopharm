import { useGetPatient, useGetAllMedications } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import MedicationForm from './MedicationForm';
import { Pill, List } from 'lucide-react';

interface MedicationsModuleProps {
  patientId: string;
}

export default function MedicationsModule({ patientId }: MedicationsModuleProps) {
  const { data: patient, isLoading: patientLoading } = useGetPatient(patientId);
  const { data: allMedications = [], isLoading: medsLoading } = useGetAllMedications();

  const patientMedications = allMedications.filter((med) => med.patientId === patientId);

  if (patientLoading) {
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
          <CardDescription>Medications for the following patient</CardDescription>
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

      <Tabs defaultValue="entry" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entry" className="gap-2">
            <Pill className="h-4 w-4" />
            Add Medication
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            View Medications ({patientMedications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entry">
          <MedicationForm patientId={patientId} />
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Medication History</CardTitle>
              <CardDescription>All recorded medications for this patient</CardDescription>
            </CardHeader>
            <CardContent>
              {medsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Loading medications...</p>
                  </div>
                </div>
              ) : patientMedications.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No medications recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {patientMedications.map((med) => (
                    <div key={med.medicationId} className="rounded-lg border p-4">
                      <p className="font-medium">{med.name}</p>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {med.dosage && <span>Dosage: {med.dosage}</span>}
                        {med.frequency && <span className="ml-3">Frequency: {med.frequency}</span>}
                      </div>
                      {med.startDate && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Started: {new Date(Number(med.startDate) / 1000000).toLocaleDateString()}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Recorded: {new Date(Number(med.timestamp) / 1000000).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
