import { useState } from 'react';
import { useAddAdr } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Info } from 'lucide-react';

interface AdrFormProps {
  patientId: string;
}

export default function AdrForm({ patientId }: AdrFormProps) {
  const addAdr = useAddAdr();
  const [formData, setFormData] = useState({
    description: '',
    severity: '',
    suspectedDrug: '',
    onsetDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const onsetDateNs = formData.onsetDate ? BigInt(new Date(formData.onsetDate).getTime() * 1000000) : null;

    addAdr.mutate(
      {
        patientId,
        description: formData.description,
        severity: formData.severity,
        suspectedDrug: formData.suspectedDrug,
        onsetDate: onsetDateNs,
      },
      {
        onSuccess: () => {
          setFormData({
            description: '',
            severity: '',
            suspectedDrug: '',
            onsetDate: '',
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adverse Drug Reaction (ADR) Recording</CardTitle>
        <CardDescription>
          Document adverse drug reactions with MedDRA terminology support
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            MedDRA (Medical Dictionary for Regulatory Activities) terminology integration provides standardized
            classification of adverse events. Use preferred terms (PT) and System Organ Class (SOC) categories.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suspectedDrug">
              Suspected Drug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="suspectedDrug"
              value={formData.suspectedDrug}
              onChange={(e) => setFormData({ ...formData, suspectedDrug: e.target.value })}
              placeholder="e.g., Aspirin"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">
              Severity <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
              <SelectTrigger id="severity">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mild">Mild</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Severe">Severe</SelectItem>
                <SelectItem value="Life-threatening">Life-threatening</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description / MedDRA Term <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the adverse reaction using MedDRA preferred terms (e.g., Nausea, Rash, Dizziness)"
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Common MedDRA SOC categories: Gastrointestinal disorders, Skin and subcutaneous tissue disorders,
              Nervous system disorders, Cardiac disorders
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="onsetDate">Onset Date</Label>
            <Input
              id="onsetDate"
              type="date"
              value={formData.onsetDate}
              onChange={(e) => setFormData({ ...formData, onsetDate: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={addAdr.isPending}>
            {addAdr.isPending ? 'Recording...' : 'Record ADR'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
