import { useState } from 'react';
import { useAddLabResults } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import type { Patient } from '../backend';
import { AlertCircle, CheckCircle2, FileText } from 'lucide-react';

interface LabResultsFormProps {
  patientId: string;
  patient: Patient;
}

// Human reference ranges
const URIC_ACID_RANGE: [number, number] = [3.4, 7.0];
const CREATININE_RANGE: [number, number] = [0.7, 1.3];

const getBloodPressureInterpretation = (systolic: number, diastolic: number): string => {
  if (systolic < 120 && diastolic < 80) return 'Normal';
  if (systolic < 130 && diastolic < 80) return 'Elevated';
  if (systolic < 140 || diastolic < 90) return 'Stage 1 Hypertension';
  return 'Stage 2 Hypertension';
};

export default function LabResultsForm({ patientId, patient }: LabResultsFormProps) {
  const addLabResults = useAddLabResults();
  const [formData, setFormData] = useState({
    uricAcid: '',
    creatinine: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
  });

  const bpInterpretation = formData.bloodPressureSystolic && formData.bloodPressureDiastolic
    ? getBloodPressureInterpretation(
        parseInt(formData.bloodPressureSystolic),
        parseInt(formData.bloodPressureDiastolic)
      )
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLabResults.mutate(
      {
        patientId,
        uricAcid: formData.uricAcid ? parseFloat(formData.uricAcid) : null,
        creatinine: formData.creatinine ? parseFloat(formData.creatinine) : null,
        bloodPressureSystolic: formData.bloodPressureSystolic ? BigInt(parseInt(formData.bloodPressureSystolic)) : null,
        bloodPressureDiastolic: formData.bloodPressureDiastolic ? BigInt(parseInt(formData.bloodPressureDiastolic)) : null,
      },
      {
        onSuccess: () => {
          setFormData({
            uricAcid: '',
            creatinine: '',
            bloodPressureSystolic: '',
            bloodPressureDiastolic: '',
          });
        },
      }
    );
  };

  const checkUricAcidRange = () => {
    if (!formData.uricAcid) return null;
    const value = parseFloat(formData.uricAcid);
    const [min, max] = URIC_ACID_RANGE;
    if (value < min || value > max) {
      return { status: 'abnormal', message: `Normal range: ${min}-${max} mg/dL` };
    }
    return { status: 'normal', message: `Within normal range (${min}-${max} mg/dL)` };
  };

  const checkCreatinineRange = () => {
    if (!formData.creatinine) return null;
    const value = parseFloat(formData.creatinine);
    const [min, max] = CREATININE_RANGE;
    if (value < min || value > max) {
      return { status: 'abnormal', message: `Normal range: ${min}-${max} mg/dL` };
    }
    return { status: 'normal', message: `Within normal range (${min}-${max} mg/dL)` };
  };

  const uricAcidCheck = checkUricAcidRange();
  const creatinineCheck = checkCreatinineRange();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Lab Results Entry</CardTitle>
          </div>
          <CardDescription>
            Enter laboratory values and clinical measurements. Values will be checked against human normal ranges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="uricAcid">Uric Acid (mg/dL)</Label>
                <Input
                  id="uricAcid"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.uricAcid}
                  onChange={(e) => setFormData({ ...formData, uricAcid: e.target.value })}
                  placeholder="e.g., 5.5"
                />
                {uricAcidCheck && (
                  <Alert variant={uricAcidCheck.status === 'abnormal' ? 'destructive' : 'default'}>
                    {uricAcidCheck.status === 'abnormal' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    <AlertDescription>{uricAcidCheck.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="creatinine">Creatinine (mg/dL)</Label>
                <Input
                  id="creatinine"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.creatinine}
                  onChange={(e) => setFormData({ ...formData, creatinine: e.target.value })}
                  placeholder="e.g., 1.0"
                />
                {creatinineCheck && (
                  <Alert variant={creatinineCheck.status === 'abnormal' ? 'destructive' : 'default'}>
                    {creatinineCheck.status === 'abnormal' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    <AlertDescription>{creatinineCheck.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="systolic">Blood Pressure - Systolic (mmHg)</Label>
                  <Input
                    id="systolic"
                    type="number"
                    min="0"
                    value={formData.bloodPressureSystolic}
                    onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                    placeholder="e.g., 120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolic">Blood Pressure - Diastolic (mmHg)</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    min="0"
                    value={formData.bloodPressureDiastolic}
                    onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                    placeholder="e.g., 80"
                  />
                </div>
              </div>

              {bpInterpretation && formData.bloodPressureSystolic && formData.bloodPressureDiastolic && (
                <Alert variant={bpInterpretation.includes('Normal') ? 'default' : 'destructive'}>
                  {bpInterpretation.includes('Normal') ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    Blood Pressure Classification: <strong>{bpInterpretation}</strong>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button type="submit" disabled={addLabResults.isPending}>
              {addLabResults.isPending ? 'Saving...' : 'Save Lab Results'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
