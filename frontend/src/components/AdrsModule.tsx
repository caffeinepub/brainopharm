import { useGetPatient, useGetAllAdrs } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import AdrForm from './AdrForm';
import { AlertTriangle, List } from 'lucide-react';

interface AdrsModuleProps {
  patientId: string;
}

export default function AdrsModule({ patientId }: AdrsModuleProps) {
  const { data: patient, isLoading: patientLoading } = useGetPatient(patientId);
  const { data: allAdrs = [], isLoading: adrsLoading } = useGetAllAdrs();

  const patientAdrs = allAdrs.filter((adr) => adr.patientId === patientId);

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
          <CardDescription>Adverse drug reactions for the following patient</CardDescription>
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
            <AlertTriangle className="h-4 w-4" />
            Record ADR
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            View ADRs ({patientAdrs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entry">
          <AdrForm patientId={patientId} />
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>ADR History</CardTitle>
              <CardDescription>All recorded adverse drug reactions for this patient</CardDescription>
            </CardHeader>
            <CardContent>
              {adrsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Loading ADRs...</p>
                  </div>
                </div>
              ) : patientAdrs.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No ADRs recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {patientAdrs.map((adr) => (
                    <div key={adr.adrId} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium">{adr.suspectedDrug}</p>
                        <Badge
                          variant={
                            adr.severity === 'Severe' || adr.severity === 'Life-threatening'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {adr.severity}
                        </Badge>
                      </div>
                      <p className="text-sm">{adr.description}</p>
                      {adr.onsetDate && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Onset: {new Date(Number(adr.onsetDate) / 1000000).toLocaleDateString()}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Recorded: {new Date(Number(adr.timestamp) / 1000000).toLocaleString()}
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
