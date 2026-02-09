import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Download, User, Activity, Pill, AlertTriangle, UserCog } from 'lucide-react';
import { useGetAllLabResults, useGetAllMedications, useGetAllAdrs, useGetPatient, useGetPrescriberDetails } from '../hooks/useQueries';
import { PrescriberPrefix } from '../backend';
import { toast } from 'sonner';

interface CaseSummaryProps {
  patientId: string;
}

export default function CaseSummary({ patientId }: CaseSummaryProps) {
  const { data: patient, isLoading: patientLoading } = useGetPatient(patientId);
  const { data: allLabResults = [], isLoading: labLoading } = useGetAllLabResults();
  const { data: allMedications = [], isLoading: medLoading } = useGetAllMedications();
  const { data: allAdrs = [], isLoading: adrLoading } = useGetAllAdrs();
  const { data: prescriberDetails, isLoading: prescriberLoading } = useGetPrescriberDetails(patientId);

  const isLoading = patientLoading || labLoading || medLoading || adrLoading || prescriberLoading;

  // Filter data for current patient
  const labResults = allLabResults.filter(lab => lab.patientId === patientId);
  const medications = allMedications.filter(med => med.patientId === patientId);
  const adrs = allAdrs.filter(adr => adr.patientId === patientId);

  const handleExportPdf = () => {
    toast.info('PDF export functionality would integrate with a PDF generation library');
  };

  const getPrefixLabel = (prefix: PrescriberPrefix): string => {
    switch (prefix) {
      case PrescriberPrefix.doctor:
        return 'Dr.';
      case PrescriberPrefix.practitionerNurse:
        return 'Practitioner Nurse';
      case PrescriberPrefix.pharmacist:
        return 'Pharmacist';
      default:
        return 'Dr.';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-stone-200 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-900/50">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent dark:border-emerald-500"></div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Loading summary...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!patient) {
    return (
      <Card className="border-stone-200 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-900/50">
        <CardContent className="py-8 text-center">
          <p className="text-stone-600 dark:text-stone-400">No data available</p>
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
      <Card className="border-stone-200 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-stone-900 dark:text-stone-100">Case Summary</CardTitle>
              <CardDescription className="text-stone-600 dark:text-stone-400">Complete clinical overview for the selected patient</CardDescription>
            </div>
            <Button onClick={handleExportPdf} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Patient Information</h3>
            </div>
            <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950 sm:grid-cols-2">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Patient ID</p>
                <p className="font-mono text-sm text-stone-900 dark:text-stone-100">{patient.patientId}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Name</p>
                <p className="font-medium text-stone-900 dark:text-stone-100">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Age / Gender</p>
                <p className="text-stone-900 dark:text-stone-100">{Number(patient.age)} years / {patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Nationality</p>
                <p className="text-stone-900 dark:text-stone-100">{patient.nationality}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Height / Weight</p>
                <p className="text-stone-900 dark:text-stone-100">{patient.height} cm / {patient.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">BMI</p>
                <div className="flex items-center gap-2">
                  <span className="text-stone-900 dark:text-stone-100">{patient.bmi.toFixed(1)}</span>
                  <Badge variant={bmiCategory.variant}>{bmiCategory.label}</Badge>
                </div>
              </div>
              {patient.bloodGroup && (
                <div>
                  <p className="text-sm text-stone-600 dark:text-stone-400">Blood Group</p>
                  <p className="text-stone-900 dark:text-stone-100">{patient.bloodGroup}</p>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-stone-200 dark:bg-stone-800" />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <UserCog className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Prescriber Details</h3>
            </div>
            {prescriberDetails ? (
              <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-stone-600 dark:text-stone-400">Prefix</p>
                  <p className="font-medium text-stone-900 dark:text-stone-100">{getPrefixLabel(prescriberDetails.prefix)}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 dark:text-stone-400">Full Name</p>
                  <p className="font-medium text-stone-900 dark:text-stone-100">{prescriberDetails.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 dark:text-stone-400">Registration Number</p>
                  <p className="text-stone-900 dark:text-stone-100">{prescriberDetails.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 dark:text-stone-400">Specialization</p>
                  <p className="text-stone-900 dark:text-stone-100">{prescriberDetails.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 dark:text-stone-400">Contact Number</p>
                  <p className="text-stone-900 dark:text-stone-100">{prescriberDetails.contactNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 dark:text-stone-400">Mail ID</p>
                  <p className="text-stone-900 dark:text-stone-100">{prescriberDetails.email}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-stone-600 dark:text-stone-400">Address</p>
                  <p className="text-stone-900 dark:text-stone-100">{prescriberDetails.address}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-600 dark:text-stone-400">No prescriber details recorded for this patient.</p>
            )}
          </div>

          <Separator className="bg-stone-200 dark:bg-stone-800" />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Lab Results</h3>
            </div>
            {labResults.length > 0 ? (
              <div className="space-y-3">
                {labResults.map((lab) => (
                  <div key={lab.labResultsId} className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {lab.uricAcid !== undefined && (
                        <div>
                          <p className="text-sm text-stone-600 dark:text-stone-400">Uric Acid</p>
                          <p className="font-medium text-stone-900 dark:text-stone-100">{lab.uricAcid} mg/dL</p>
                        </div>
                      )}
                      {lab.creatinine !== undefined && (
                        <div>
                          <p className="text-sm text-stone-600 dark:text-stone-400">Creatinine</p>
                          <p className="font-medium text-stone-900 dark:text-stone-100">{lab.creatinine} mg/dL</p>
                        </div>
                      )}
                      {lab.bloodPressureSystolic !== undefined && lab.bloodPressureDiastolic !== undefined && (
                        <div>
                          <p className="text-sm text-stone-600 dark:text-stone-400">Blood Pressure</p>
                          <p className="font-medium text-stone-900 dark:text-stone-100">
                            {Number(lab.bloodPressureSystolic)}/{Number(lab.bloodPressureDiastolic)} mmHg
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-600 dark:text-stone-400">No lab results recorded</p>
            )}
          </div>

          <Separator className="bg-stone-200 dark:bg-stone-800" />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Medications</h3>
            </div>
            {medications.length > 0 ? (
              <div className="space-y-3">
                {medications.map((med) => (
                  <div key={med.medicationId} className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
                    <p className="font-medium text-stone-900 dark:text-stone-100">{med.name}</p>
                    <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                      {med.dosage && (
                        <div>
                          <span className="text-stone-600 dark:text-stone-400">Dosage: </span>
                          <span className="text-stone-900 dark:text-stone-100">{med.dosage}</span>
                        </div>
                      )}
                      {med.frequency && (
                        <div>
                          <span className="text-stone-600 dark:text-stone-400">Frequency: </span>
                          <span className="text-stone-900 dark:text-stone-100">{med.frequency}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-600 dark:text-stone-400">No medications recorded</p>
            )}
          </div>

          <Separator className="bg-stone-200 dark:bg-stone-800" />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Adverse Drug Reactions</h3>
            </div>
            {adrs.length > 0 ? (
              <div className="space-y-3">
                {adrs.map((adr) => (
                  <div key={adr.adrId} className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-medium text-stone-900 dark:text-stone-100">{adr.suspectedDrug}</p>
                      <Badge variant={adr.severity === 'Severe' ? 'destructive' : 'secondary'}>{adr.severity}</Badge>
                    </div>
                    <p className="text-sm text-stone-700 dark:text-stone-300">{adr.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-600 dark:text-stone-400">No adverse drug reactions recorded</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
