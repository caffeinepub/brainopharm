import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAddMedication } from '../hooks/useQueries';
import { validateRequired, getFirstInvalidField } from '../utils/formValidation';
import { validateAndParseDateToNanoseconds } from '../utils/dateParsing';

interface MedicationFormProps {
  patientId: string;
}

interface ValidationErrors {
  [key: string]: string | undefined;
  name?: string;
  startDate?: string;
  endDate?: string;
}

export default function MedicationForm({ patientId }: MedicationFormProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addMedication = useAddMedication();

  // Refs for focus management
  const nameRef = useRef<HTMLInputElement | null>(null);
  const startDateRef = useRef<HTMLInputElement | null>(null);
  const endDateRef = useRef<HTMLInputElement | null>(null);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    const nameValidation = validateRequired(name, 'Medication name');
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error;
    }

    // Validate start date if provided
    if (startDate.trim()) {
      const startDateValidation = validateAndParseDateToNanoseconds(startDate, 'Start date');
      if (!startDateValidation.isValid) {
        errors.startDate = startDateValidation.error;
      }
    }

    // Validate end date if provided
    if (endDate.trim()) {
      const endDateValidation = validateAndParseDateToNanoseconds(endDate, 'End date');
      if (!endDateValidation.isValid) {
        errors.endDate = endDateValidation.error;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const focusFirstInvalidField = () => {
    const firstInvalid = getFirstInvalidField(validationErrors);
    if (!firstInvalid) return;

    const refMap: Record<string, React.RefObject<HTMLInputElement | null>> = {
      name: nameRef,
      startDate: startDateRef,
      endDate: endDateRef,
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
      // Parse dates safely
      const startDateValidation = validateAndParseDateToNanoseconds(startDate, 'Start date');
      const endDateValidation = validateAndParseDateToNanoseconds(endDate, 'End date');

      const result = await addMedication.mutateAsync({
        patientId,
        name: name.trim(),
        dosage: dosage.trim() || null,
        frequency: frequency.trim() || null,
        startDate: startDateValidation.isValid ? startDateValidation.value : null,
        endDate: endDateValidation.isValid ? endDateValidation.value : null,
      });

      if (result.status === 'success') {
        setShowSuccess(true);
        setName('');
        setDosage('');
        setFrequency('');
        setStartDate('');
        setEndDate('');
        setValidationErrors({});
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setShowError(true);
        setErrorMessage(result.error || 'Failed to add medication');
      }
    } catch (error: any) {
      console.error('Error adding medication:', error);
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
            Medication added successfully!
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
          <Label htmlFor="name" className="text-sm font-medium">
            Medication Name <span className="text-red-600 dark:text-red-500">*</span>
          </Label>
          <Input
            ref={nameRef}
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter medication name"
            className={validationErrors.name ? 'border-red-500' : ''}
            aria-required="true"
            aria-invalid={!!validationErrors.name}
            aria-describedby={validationErrors.name ? 'name-error' : undefined}
          />
          {validationErrors.name && (
            <p id="name-error" className="text-xs text-red-600 dark:text-red-500">{validationErrors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dosage" className="text-sm font-medium">
              Dosage
            </Label>
            <Input
              id="dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 500mg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-sm font-medium">
              Frequency
            </Label>
            <Input
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="e.g., Twice daily"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium">
              Start Date
            </Label>
            <Input
              ref={startDateRef}
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={validationErrors.startDate ? 'border-red-500' : ''}
              aria-invalid={!!validationErrors.startDate}
              aria-describedby={validationErrors.startDate ? 'startDate-error' : undefined}
            />
            {validationErrors.startDate && (
              <p id="startDate-error" className="text-xs text-red-600 dark:text-red-500">{validationErrors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium">
              End Date
            </Label>
            <Input
              ref={endDateRef}
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={validationErrors.endDate ? 'border-red-500' : ''}
              aria-invalid={!!validationErrors.endDate}
              aria-describedby={validationErrors.endDate ? 'endDate-error' : undefined}
            />
            {validationErrors.endDate && (
              <p id="endDate-error" className="text-xs text-red-600 dark:text-red-500">{validationErrors.endDate}</p>
            )}
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={addMedication.isPending}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {addMedication.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Add Medication'
        )}
      </Button>
    </div>
  );
}
