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

  const formatDate = (timestamp: bigint) => {
    try {
      const date = new Date(Number(timestamp) / 1000000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Not available';
    }
  };

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', variant: 'secondary' as const };
    if (bmi < 25) return { label: 'Normal', variant: 'default' as const };
    if (bmi < 30) return { label: 'Overweight', variant: 'secondary' as const };
    return { label: 'Obese', variant: 'destructive' as const };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading case summary...</p>
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

  const bmiCategory = getBmiCategory(patient.bmi);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-stone-50 to-emerald-50 dark:from-stone-950 dark:to-emerald-950 border-stone-200 dark:border-stone-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-stone-900 dark:text-stone-100">Case Summary</CardTitle>
              <CardDescription className="text-stone-600 dark:text-stone-400">
                Complete clinical overview for {patient.name}
              </CardDescription>
            </div>
            <Button onClick={handleExportPdf} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Demographics */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-stone-700 dark:text-stone-300" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Patient Demographics</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800">
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
              {patient.phone && (
                <div>
                  <p className="text-sm text-stone-600 dark:text-stone-400">Phone</p>
                  <p className="text-stone-900 dark:text-stone-100">{patient.phone}</p>
                </div>
              )}
              {patient.address && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-stone-600 dark:text-stone-400">Address</p>
                  <p className="text-stone-900 dark:text-stone-100">{patient.address}</p>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-stone-200 dark:bg-stone-800" />

          {/* Prescriber Details */}
          {prescriberDetails && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <UserCog className="h-5 w-5 text-stone-700 dark:text-stone-300" />
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Prescriber Details</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800">
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-400">Name</p>
                    <p className="font-medium text-stone-900 dark:text-stone-100">
                      {getPrefixLabel(prescriberDetails.prefix)} {prescriberDetails.fullName}
                    </p>
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
              </div>
              <Separator className="bg-stone-200 dark:bg-stone-800" />
            </>
          )}

          {/* Lab Results */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Lab Results</h3>
            </div>
            {labResults.length === 0 ? (
              <p className="text-sm text-stone-600 dark:text-stone-400 italic">No lab results recorded</p>
            ) : (
              <div className="space-y-3">
                {labResults.map((lab) => (
                  <div
                    key={lab.labResultsId}
                    className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800"
                  >
                    <p className="text-xs text-stone-500 dark:text-stone-500 mb-2">
                      {formatDate(lab.timestamp)}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {lab.uricAcid !== undefined && lab.uricAcid !== null && (
                        <div>
                          <p className="text-sm text-stone-600 dark:text-stone-400">Uric Acid</p>
                          <p className="font-medium text-stone-900 dark:text-stone-100">{lab.uricAcid} mg/dL</p>
                        </div>
                      )}
                      {lab.creatinine !== undefined && lab.creatinine !== null && (
                        <div>
                          <p className="text-sm text-stone-600 dark:text-stone-400">Creatinine</p>
                          <p className="font-medium text-stone-900 dark:text-stone-100">{lab.creatinine} mg/dL</p>
                        </div>
                      )}
                      {lab.bloodPressureSystolic !== undefined && lab.bloodPressureSystolic !== null && (
                        <div>
                          <p className="text-sm text-stone-600 dark:text-stone-400">Blood Pressure</p>
                          <p className="font-medium text-stone-900 dark:text-stone-100">
                            {Number(lab.bloodPressureSystolic)}/{Number(lab.bloodPressureDiastolic || 0)} mmHg
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="bg-stone-200 dark:bg-stone-800" />

          {/* Medications */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Pill className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Medications</h3>
            </div>
            {medications.length === 0 ? (
              <p className="text-sm text-stone-600 dark:text-stone-400 italic">No medications recorded</p>
            ) : (
              <div className="space-y-3">
                {medications.map((med) => (
                  <div
                    key={med.medicationId}
                    className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800"
                  >
                    <p className="font-medium text-stone-900 dark:text-stone-100 mb-2">{med.name}</p>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
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
                      {med.startDate && (
                        <div>
                          <span className="text-stone-600 dark:text-stone-400">Start: </span>
                          <span className="text-stone-900 dark:text-stone-100">{formatDate(med.startDate)}</span>
                        </div>
                      )}
                      {med.endDate && (
                        <div>
                          <span className="text-stone-600 dark:text-stone-400">End: </span>
                          <span className="text-stone-900 dark:text-stone-100">{formatDate(med.endDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="bg-stone-200 dark:bg-stone-800" />

          {/* Adverse Drug Reactions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-300" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Adverse Drug Reactions</h3>
            </div>
            {adrs.length === 0 ? (
              <p className="text-sm text-stone-600 dark:text-stone-400 italic">No ADRs recorded</p>
            ) : (
              <div className="space-y-3">
                {adrs.map((adr) => (
                  <div
                    key={adr.adrId}
                    className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-amber-200 dark:border-amber-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-stone-900 dark:text-stone-100">{adr.suspectedDrug}</p>
                      <Badge
                        variant={
                          adr.severity.toLowerCase() === 'severe'
                            ? 'destructive'
                            : adr.severity.toLowerCase() === 'moderate'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {adr.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-stone-700 dark:text-stone-300 mb-2">{adr.description}</p>
                    <div className="text-xs text-stone-500 dark:text-stone-500">
                      {adr.onsetDate && <span>Onset: {formatDate(adr.onsetDate)} • </span>}
                      <span>Reported: {formatDate(adr.timestamp)}</span>
                    </div>
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
