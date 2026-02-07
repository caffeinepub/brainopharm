import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Download, User, Activity, Pill, AlertTriangle } from 'lucide-react';
import { useGetAllLabResults, useGetAllMedications, useGetAllAdrs, useGetPatient } from '../hooks/useQueries';
import { toast } from 'sonner';

interface CaseSummaryProps {
  patientId: string;
}

export default function CaseSummary({ patientId }: CaseSummaryProps) {
  const { data: patient, isLoading: patientLoading } = useGetPatient(patientId);
  const { data: allLabResults = [], isLoading: labLoading } = useGetAllLabResults();
  const { data: allMedications = [], isLoading: medLoading } = useGetAllMedications();
  const { data: allAdrs = [], isLoading: adrLoading } = useGetAllAdrs();

  const isLoading = patientLoading || labLoading || medLoading || adrLoading;

  // Filter data for current patient
  const labResults = allLabResults.filter(lab => lab.patientId === patientId);
  const medications = allMedications.filter(med => med.patientId === patientId);
  const adrs = allAdrs.filter(adr => adr.patientId === patientId);

  const handleExportPdf = () => {
    toast.info('PDF export functionality would integrate with a PDF generation library');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading summary...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!patient) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No data available</p>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Case Summary</CardTitle>
              <CardDescription>Complete clinical overview for the selected patient</CardDescription>
            </div>
            <Button onClick={handleExportPdf} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Patient Information</h3>
            </div>
            <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Patient ID</p>
                <p className="font-mono text-sm">{patient.patientId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age / Gender</p>
                <p>{Number(patient.age)} years / {patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nationality</p>
                <p>{patient.nationality}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Height / Weight</p>
                <p>{patient.height} cm / {patient.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">BMI</p>
                <div className="flex items-center gap-2">
                  <span>{patient.bmi.toFixed(1)}</span>
                  <Badge variant={bmiCategory.variant}>{bmiCategory.label}</Badge>
                </div>
              </div>
              {patient.bloodGroup && (
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p>{patient.bloodGroup}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Lab Results ({labResults.length})</h3>
            </div>
            {labResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lab results recorded</p>
            ) : (
              <div className="space-y-3">
                {labResults.map((lab) => (
                  <div key={lab.labResultsId} className="rounded-lg border p-4">
                    <p className="mb-2 text-xs text-muted-foreground">
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
          </div>

          <Separator />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Medications ({medications.length})</h3>
            </div>
            {medications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No medications recorded</p>
            ) : (
              <div className="space-y-3">
                {medications.map((med) => (
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
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Adverse Drug Reactions ({adrs.length})</h3>
            </div>
            {adrs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ADRs recorded</p>
            ) : (
              <div className="space-y-3">
                {adrs.map((adr) => (
                  <div key={adr.adrId} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-medium">{adr.suspectedDrug}</p>
                      <Badge variant={adr.severity === 'Severe' || adr.severity === 'Life-threatening' ? 'destructive' : 'secondary'}>
                        {adr.severity}
                      </Badge>
                    </div>
                    <p className="text-sm">{adr.description}</p>
                    {adr.onsetDate && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Onset: {new Date(Number(adr.onsetDate) / 1000000).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
