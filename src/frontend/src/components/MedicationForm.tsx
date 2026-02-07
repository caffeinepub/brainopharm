import { useState } from 'react';
import { useAddMedication } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Info } from 'lucide-react';

interface MedicationFormProps {
  patientId: string;
}

export default function MedicationForm({ patientId }: MedicationFormProps) {
  const addMedication = useAddMedication();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDateNs = formData.startDate ? BigInt(new Date(formData.startDate).getTime() * 1000000) : null;

    addMedication.mutate(
      {
        patientId,
        name: formData.name,
        dosage: formData.dosage || null,
        frequency: formData.frequency || null,
        startDate: startDateNs,
        endDate: null,
      },
      {
        onSuccess: () => {
          setFormData({
            name: '',
            dosage: '',
            frequency: '',
            startDate: '',
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication Entry</CardTitle>
        <CardDescription>
          Record medications prescribed or administered to the patient
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Drug interaction checking is available. After entering medications, you can check for potential interactions
            using external databases (Drugs.com, FDA, DrugBank).
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medName">
              Medication Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="medName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Aspirin"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., 100mg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="e.g., Once daily"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={addMedication.isPending}>
            {addMedication.isPending ? 'Adding...' : 'Add Medication'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
