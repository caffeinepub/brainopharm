import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAddLabResults } from '../hooks/useQueries';
import { validateNumeric, getFirstInvalidField } from '../utils/formValidation';

interface LabResultsFormProps {
  patientId: string;
}

interface ValidationErrors {
  [key: string]: string | undefined;
  uricAcid?: string;
  creatinine?: string;
  bloodPressureSystolic?: string;
  bloodPressureDiastolic?: string;
}

export default function LabResultsForm({ patientId }: LabResultsFormProps) {
  const [uricAcid, setUricAcid] = useState('');
  const [creatinine, setCreatinine] = useState('');
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addLabResults = useAddLabResults();

  // Refs for focus management
  const uricAcidRef = useRef<HTMLInputElement | null>(null);
  const creatinineRef = useRef<HTMLInputElement | null>(null);
  const systolicRef = useRef<HTMLInputElement | null>(null);
  const diastolicRef = useRef<HTMLInputElement | null>(null);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate uric acid if provided
    if (uricAcid.trim()) {
      const uricAcidValidation = validateNumeric(uricAcid, 'Uric Acid', { min: 0, max: 20, allowDecimals: true });
      if (!uricAcidValidation.isValid) {
        errors.uricAcid = uricAcidValidation.error;
      }
    }

    // Validate creatinine if provided
    if (creatinine.trim()) {
      const creatinineValidation = validateNumeric(creatinine, 'Creatinine', { min: 0, max: 20, allowDecimals: true });
      if (!creatinineValidation.isValid) {
        errors.creatinine = creatinineValidation.error;
      }
    }

    // Validate blood pressure systolic if provided
    if (bloodPressureSystolic.trim()) {
      const systolicValidation = validateNumeric(bloodPressureSystolic, 'Systolic BP', { min: 50, max: 300 });
      if (!systolicValidation.isValid) {
        errors.bloodPressureSystolic = systolicValidation.error;
      }
    }

    // Validate blood pressure diastolic if provided
    if (bloodPressureDiastolic.trim()) {
      const diastolicValidation = validateNumeric(bloodPressureDiastolic, 'Diastolic BP', { min: 30, max: 200 });
      if (!diastolicValidation.isValid) {
        errors.bloodPressureDiastolic = diastolicValidation.error;
      }
    }

    // Check if at least one field is provided
    if (!uricAcid.trim() && !creatinine.trim() && !bloodPressureSystolic.trim() && !bloodPressureDiastolic.trim()) {
      setShowError(true);
      setErrorMessage('Please enter at least one lab result value');
      return false;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const focusFirstInvalidField = () => {
    const firstInvalid = getFirstInvalidField(validationErrors);
    if (!firstInvalid) return;

    const refMap: Record<string, React.RefObject<HTMLInputElement | null>> = {
      uricAcid: uricAcidRef,
      creatinine: creatinineRef,
      bloodPressureSystolic: systolicRef,
      bloodPressureDiastolic: diastolicRef,
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
      if (!errorMessage) {
        setShowError(true);
        setErrorMessage('Please fix the validation errors before submitting');
      }
      setTimeout(focusFirstInvalidField, 100);
      return;
    }

    try {
      const result = await addLabResults.mutateAsync({
        patientId,
        uricAcid: uricAcid.trim() ? parseFloat(uricAcid) : null,
        creatinine: creatinine.trim() ? parseFloat(creatinine) : null,
        bloodPressureSystolic: bloodPressureSystolic.trim() ? BigInt(parseInt(bloodPressureSystolic, 10)) : null,
        bloodPressureDiastolic: bloodPressureDiastolic.trim() ? BigInt(parseInt(bloodPressureDiastolic, 10)) : null,
      });

      if (result.status === 'success') {
        setShowSuccess(true);
        setUricAcid('');
        setCreatinine('');
        setBloodPressureSystolic('');
        setBloodPressureDiastolic('');
        setValidationErrors({});
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setShowError(true);
        setErrorMessage(result.error || 'Failed to add lab results');
      }
    } catch (error: any) {
      console.error('Error adding lab results:', error);
      setShowError(true);
      setErrorMessage(error.message || 'An unexpected error occurred');
    }
  };

  const getRangeStatus = (value: string, min: number, max: number): 'normal' | 'abnormal' | null => {
    if (!value.trim()) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    return num >= min && num <= max ? 'normal' : 'abnormal';
  };

  const uricAcidStatus = getRangeStatus(uricAcid, 3.5, 7.2);
  const creatinineStatus = getRangeStatus(creatinine, 0.6, 1.2);

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/30">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Lab results added successfully!
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="uricAcid" className="text-sm font-medium">
            Uric Acid (mg/dL)
          </Label>
          <Input
            ref={uricAcidRef}
            id="uricAcid"
            type="number"
            step="0.1"
            value={uricAcid}
            onChange={(e) => setUricAcid(e.target.value)}
            placeholder="Normal: 3.5-7.2"
            className={validationErrors.uricAcid ? 'border-red-500' : ''}
            aria-invalid={!!validationErrors.uricAcid}
            aria-describedby={validationErrors.uricAcid ? 'uricAcid-error' : uricAcidStatus ? 'uricAcid-status' : undefined}
          />
          {validationErrors.uricAcid && (
            <p id="uricAcid-error" className="text-xs text-red-600 dark:text-red-500">{validationErrors.uricAcid}</p>
          )}
          {!validationErrors.uricAcid && uricAcidStatus && (
            <p id="uricAcid-status" className={`text-xs ${uricAcidStatus === 'normal' ? 'text-green-600 dark:text-green-500' : 'text-amber-600 dark:text-amber-500'}`}>
              {uricAcidStatus === 'normal' ? '✓ Within normal range' : '⚠ Outside normal range'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="creatinine" className="text-sm font-medium">
            Creatinine (mg/dL)
          </Label>
          <Input
            ref={creatinineRef}
            id="creatinine"
            type="number"
            step="0.1"
            value={creatinine}
            onChange={(e) => setCreatinine(e.target.value)}
            placeholder="Normal: 0.6-1.2"
            className={validationErrors.creatinine ? 'border-red-500' : ''}
            aria-invalid={!!validationErrors.creatinine}
            aria-describedby={validationErrors.creatinine ? 'creatinine-error' : creatinineStatus ? 'creatinine-status' : undefined}
          />
          {validationErrors.creatinine && (
            <p id="creatinine-error" className="text-xs text-red-600 dark:text-red-500">{validationErrors.creatinine}</p>
          )}
          {!validationErrors.creatinine && creatinineStatus && (
            <p id="creatinine-status" className={`text-xs ${creatinineStatus === 'normal' ? 'text-green-600 dark:text-green-500' : 'text-amber-600 dark:text-amber-500'}`}>
              {creatinineStatus === 'normal' ? '✓ Within normal range' : '⚠ Outside normal range'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bloodPressureSystolic" className="text-sm font-medium">
            Blood Pressure Systolic (mmHg)
          </Label>
          <Input
            ref={systolicRef}
            id="bloodPressureSystolic"
            type="number"
            value={bloodPressureSystolic}
            onChange={(e) => setBloodPressureSystolic(e.target.value)}
            placeholder="e.g., 120"
            className={validationErrors.bloodPressureSystolic ? 'border-red-500' : ''}
            aria-invalid={!!validationErrors.bloodPressureSystolic}
            aria-describedby={validationErrors.bloodPressureSystolic ? 'bloodPressureSystolic-error' : undefined}
          />
          {validationErrors.bloodPressureSystolic && (
            <p id="bloodPressureSystolic-error" className="text-xs text-red-600 dark:text-red-500">{validationErrors.bloodPressureSystolic}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bloodPressureDiastolic" className="text-sm font-medium">
            Blood Pressure Diastolic (mmHg)
          </Label>
          <Input
            ref={diastolicRef}
            id="bloodPressureDiastolic"
            type="number"
            value={bloodPressureDiastolic}
            onChange={(e) => setBloodPressureDiastolic(e.target.value)}
            placeholder="e.g., 80"
            className={validationErrors.bloodPressureDiastolic ? 'border-red-500' : ''}
            aria-invalid={!!validationErrors.bloodPressureDiastolic}
            aria-describedby={validationErrors.bloodPressureDiastolic ? 'bloodPressureDiastolic-error' : undefined}
          />
          {validationErrors.bloodPressureDiastolic && (
            <p id="bloodPressureDiastolic-error" className="text-xs text-red-600 dark:text-red-500">{validationErrors.bloodPressureDiastolic}</p>
          )}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={addLabResults.isPending}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {addLabResults.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Lab Results'
        )}
      </Button>
    </div>
  );
}
