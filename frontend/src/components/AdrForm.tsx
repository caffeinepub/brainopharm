import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAddAdr } from '../hooks/useQueries';
import { validateRequired, getFirstInvalidField } from '../utils/formValidation';
import { validateAndParseDateToNanoseconds } from '../utils/dateParsing';

interface AdrFormProps {
  patientId: string;
}

interface ValidationErrors {
  [key: string]: string | undefined;
  suspectedDrug?: string;
  severity?: string;
  description?: string;
  onsetDate?: string;
}

export default function AdrForm({ patientId }: AdrFormProps) {
  const [suspectedDrug, setSuspectedDrug] = useState('');
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const [onsetDate, setOnsetDate] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addAdr = useAddAdr();

  // Refs for focus management
  const suspectedDrugRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const onsetDateRef = useRef<HTMLInputElement | null>(null);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    const suspectedDrugValidation = validateRequired(suspectedDrug, 'Suspected drug');
    if (!suspectedDrugValidation.isValid) {
      errors.suspectedDrug = suspectedDrugValidation.error;
    }

    if (!severity) {
      errors.severity = 'Severity is required';
    }

    const descriptionValidation = validateRequired(description, 'Description');
    if (!descriptionValidation.isValid) {
      errors.description = descriptionValidation.error;
    }

    // Validate onset date if provided
    if (onsetDate.trim()) {
      const onsetDateValidation = validateAndParseDateToNanoseconds(onsetDate, 'Onset date');
      if (!onsetDateValidation.isValid) {
        errors.onsetDate = onsetDateValidation.error;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const focusFirstInvalidField = () => {
    const firstInvalid = getFirstInvalidField(validationErrors);
    if (!firstInvalid) return;

    const refMap: Record<string, React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>> = {
      suspectedDrug: suspectedDrugRef,
      description: descriptionRef,
      onsetDate: onsetDateRef,
    };

    const ref = refMap[firstInvalid];
    if (ref?.current) {
      ref.current.focus();
    }
  };

  const handleSubmit = async () => {
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage('');

    if (!validateForm()) {
      setShowError(true);
      setErrorMessage('Please fix the validation errors before submitting');
      setTimeout(focusFirstInvalidField, 100);
      return;
    }

    try {
      // Parse onset date safely
      const onsetDateValidation = validateAndParseDateToNanoseconds(onsetDate, 'Onset date');

      const result = await addAdr.mutateAsync({
        patientId,
        suspectedDrug: suspectedDrug.trim(),
        severity,
        description: description.trim(),
        onsetDate: onsetDateValidation.isValid ? onsetDateValidation.value : null,
      });

      if (result.status === 'success') {
        setShowSuccess(true);
        setSuspectedDrug('');
        setSeverity('');
        setDescription('');
        setOnsetDate('');
        setValidationErrors({});
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setShowError(true);
        setErrorMessage(result.error || 'Failed to add ADR');
      }
    } catch (error: any) {
      console.error('Error adding ADR:', error);
      setShowError(true);
      setErrorMessage(error.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/30">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Adverse drug reaction recorded successfully!
          </AlertDescription>
        </Alert>
      )}

      {showError && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950/30">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="suspectedDrug" className="text-sm font-medium">
            Suspected Drug <span className="text-red-600 dark:text-red-500">*</span>
          </Label>
          <Input
            ref={suspectedDrugRef}
            id="suspectedDrug"
            value={suspectedDrug}
            onChange={(e) => setSuspectedDrug(e.target.value)}
            placeholder="Enter suspected drug name"
            className={validationErrors.suspectedDrug ? 'border-red-500' : ''}
            aria-required="true"
            aria-invalid={!!validationErrors.suspectedDrug}
            aria-describedby={validationErrors.suspectedDrug ? 'suspectedDrug-error' : undefined}
          />
          {validationErrors.suspectedDrug && (
            <p id="suspectedDrug-error" className="text-xs text-red-600 dark:text-red-500">{validationErrors.suspectedDrug}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="severity" className="text-sm font-medium">
            Severity <span className="text-red-600 dark:text-red-500">*</span>
          </Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger 
              id="severity" 
              className={validationErrors.severity ? 'border-red-500' : ''}
              aria-required="true"
              aria-invalid={!!validationErrors.severity}
              aria-describedby={validationErrors.severity ? 'severity-error' : undefined}
            >
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mild">Mild</SelectItem>
              <SelectItem value="Moderate">Moderate</SelectItem>
              <SelectItem value="Severe">Severe</SelectItem>
              <SelectItem value="Life-threatening">Life-threatening</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.severity && (
            <p id="severity-error" className="text-xs text-red-600 dark:text-red-500">{validationErrors.severity}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description <span className="text-red-600 dark:text-red-500">*</span>
          </Label>
          <Textarea
            ref={descriptionRef}
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the adverse reaction..."
            rows={4}
            className={validationErrors.description ? 'border-red-500' : ''}
            aria-required="true"
            aria-invalid={!!validationErrors.description}
            aria-describedby={validationErrors.description ? 'description-error' : undefined}
          />
          {validationErrors.description && (
            <p id="description-error" className="text-xs text-red-600 dark:text-red-500">{validationErrors.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="onsetDate" className="text-sm font-medium">
            Onset Date
          </Label>
          <Input
            ref={onsetDateRef}
            id="onsetDate"
            type="date"
            value={onsetDate}
            onChange={(e) => setOnsetDate(e.target.value)}
            className={validationErrors.onsetDate ? 'border-red-500' : ''}
            aria-invalid={!!validationErrors.onsetDate}
            aria-describedby={validationErrors.onsetDate ? 'onsetDate-error' : undefined}
          />
          {validationErrors.onsetDate && (
            <p id="onsetDate-error" className="text-xs text-red-600 dark:text-red-500">{validationErrors.onsetDate}</p>
          )}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={addAdr.isPending}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        {addAdr.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Record ADR'
        )}
      </Button>
    </div>
  );
}
