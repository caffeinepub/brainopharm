import { useMemo, memo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Activity, Pill, AlertTriangle } from 'lucide-react';
import { useGetPatient, useGetAllLabResults, useGetAllMedications, useGetAllAdrs } from '../hooks/useQueries';
import type { LabResults, Medication, AdverseDrugReaction } from '../backend';

interface PatientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
}

// Memoized BMI category calculator
const getBmiCategory = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', variant: 'secondary' as const };
  if (bmi < 25) return { label: 'Normal', variant: 'default' as const };
  if (bmi < 30) return { label: 'Overweight', variant: 'secondary' as const };
  return { label: 'Obese', variant: 'destructive' as const };
};

// Memoized lab result card
const LabResultCard = memo(({ lab }: { lab: LabResults }) => (
  <div className="rounded-lg border p-3 transition-colors hover:bg-muted/50">
    <p className="mb-2 text-xs text-muted-foreground">
      {new Date(Number(lab.timestamp) / 1000000).toLocaleDateString()}
    </p>
    <div className="grid gap-2 text-sm sm:grid-cols-2">
      {lab.uricAcid !== undefined && (
        <div>
          <span className="text-muted-foreground">Uric Acid:</span> {lab.uricAcid} mg/dL
        </div>
      )}
      {lab.creatinine !== undefined && (
        <div>
          <span className="text-muted-foreground">Creatinine:</span> {lab.creatinine} mg/dL
        </div>
      )}
      {lab.bloodPressureSystolic !== undefined && lab.bloodPressureDiastolic !== undefined && (
        <div>
          <span className="text-muted-foreground">Blood Pressure:</span>{' '}
          {Number(lab.bloodPressureSystolic)}/{Number(lab.bloodPressureDiastolic)} mmHg
        </div>
      )}
    </div>
  </div>
));

LabResultCard.displayName = 'LabResultCard';

// Memoized medication card
const MedicationCard = memo(({ med }: { med: Medication }) => (
  <div className="rounded-lg border p-3 transition-colors hover:bg-muted/50">
    <p className="font-medium">{med.name}</p>
    <div className="mt-1 text-sm text-muted-foreground">
      {med.dosage && <span>Dosage: {med.dosage}</span>}
      {med.frequency && <span className="ml-3">Frequency: {med.frequency}</span>}
    </div>
  </div>
));

MedicationCard.displayName = 'MedicationCard';

// Memoized ADR card
const AdrCard = memo(({ adr }: { adr: AdverseDrugReaction }) => (
  <div className="rounded-lg border p-3 transition-colors hover:bg-muted/50">
    <div className="mb-2 flex items-center justify-between">
      <p className="font-medium">{adr.suspectedDrug}</p>
      <Badge variant={adr.severity === 'Severe' ? 'destructive' : 'secondary'}>
        {adr.severity}
      </Badge>
    </div>
    <p className="text-sm text-muted-foreground">{adr.description}</p>
  </div>
));

AdrCard.displayName = 'AdrCard';

export default function PatientDetailsDialog({ open, onOpenChange, patientId }: PatientDetailsDialogProps) {
  const { data: patient, isLoading: patientLoading } = useGetPatient(patientId);
  const { data: allLabResults = [], isLoading: labLoading } = useGetAllLabResults();
  const { data: allMedications = [], isLoading: medLoading } = useGetAllMedications();
  const { data: allAdrs = [], isLoading: adrLoading } = useGetAllAdrs();

  const isLoading = patientLoading || labLoading || medLoading || adrLoading;

  // Memoized filtered data
  const labResults = useMemo(() => 
    allLabResults.filter(lab => lab.patientId === patientId),
    [allLabResults, patientId]
  );

  const medications = useMemo(() => 
    allMedications.filter(med => med.patientId === patientId),
    [allMedications, patientId]
  );

  const adrs = useMemo(() => 
    allAdrs.filter(adr => adr.patientId === patientId),
    [allAdrs, patientId]
  );

  // Memoized BMI category
  const bmiCategory = useMemo(() => 
    patient ? getBmiCategory(patient.bmi) : null,
    [patient]
  );

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading patient details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Patient Details</DialogTitle>
          <DialogDescription>Complete patient record and clinical summary</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-mono text-sm">{patient.patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{patient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p>{Number(patient.age)} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p>{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p>{patient.nationality}</p>
                </div>
                {patient.bloodGroup && (
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Group</p>
                    <p>{patient.bloodGroup}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p>{patient.height} cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p>{patient.weight} kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">BMI</p>
                  <div className="flex items-center gap-2">
                    <span>{patient.bmi.toFixed(1)}</span>
                    {bmiCategory && <Badge variant={bmiCategory.variant}>{bmiCategory.label}</Badge>}
                  </div>
                </div>
              </div>
              {patient.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{patient.phone}</p>
                </div>
              )}
              {patient.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p>{patient.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {labResults.length > 0 && (
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5" />
                  Lab Results ({labResults.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {labResults.map((lab) => (
                    <LabResultCard key={lab.labResultsId} lab={lab} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {medications.length > 0 && (
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Pill className="h-5 w-5" />
                  Medications ({medications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medications.map((med) => (
                    <MedicationCard key={med.medicationId} med={med} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {adrs.length > 0 && (
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5" />
                  Adverse Drug Reactions ({adrs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adrs.map((adr) => (
                    <AdrCard key={adr.adrId} adr={adr} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
