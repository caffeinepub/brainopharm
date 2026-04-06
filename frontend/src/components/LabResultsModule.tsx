import { useGetPatient, useGetAllLabResults } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import LabResultsForm from './LabResultsForm';
import { Activity, List } from 'lucide-react';

interface LabResultsModuleProps {
  patientId: string;
}

export default function LabResultsModule({ patientId }: LabResultsModuleProps) {
  const { data: patient, isLoading: patientLoading } = useGetPatient(patientId);
  const { data: allLabResults = [], isLoading: labsLoading } = useGetAllLabResults();

  const patientLabResults = allLabResults.filter((lab) => lab.patientId === patientId);

  if (patientLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
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
          <CardDescription>Lab results for the following patient</CardDescription>
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
            <Activity className="h-4 w-4" />
            Data Entry
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Results ({patientLabResults.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entry">
          <LabResultsForm patientId={patientId} />
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Lab Results History</CardTitle>
              <CardDescription>All recorded lab results for this patient</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {labsLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : patientLabResults.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No lab results recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {patientLabResults.map((lab) => (
                    <div key={lab.labResultsId} className="rounded-lg border p-4">
                      <p className="mb-3 text-xs text-muted-foreground">
                        {new Date(Number(lab.timestamp) / 1000000).toLocaleString()}
                      </p>
                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        {lab.uricAcid !== undefined && (
                          <div>
                            <span className="font-medium">Uric Acid:</span> {lab.uricAcid} mg/dL
                          </div>
                        )}
                        {lab.creatinine !== undefined && (
                          <div>
                            <span className="font-medium">Creatinine:</span> {lab.creatinine} mg/dL
                          </div>
                        )}
                        {lab.bloodPressureSystolic !== undefined && lab.bloodPressureDiastolic !== undefined && (
                          <div>
                            <span className="font-medium">Blood Pressure:</span>{' '}
                            {Number(lab.bloodPressureSystolic)}/{Number(lab.bloodPressureDiastolic)} mmHg
                          </div>
                        )}
                      </div>
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
