import { useState, useCallback, useMemo, memo, useRef } from 'react';
import { useAddPatient } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { validateRequired, validateNumeric, getFirstInvalidField } from '../utils/formValidation';

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ValidationErrors {
  [key: string]: string | undefined;
  name?: string;
  age?: string;
  gender?: string;
  nationality?: string;
  height?: string;
  weight?: string;
}

interface FormData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  nationality: string;
  address: string;
  phone: string;
  bloodGroup: string;
}

const initialFormData: FormData = {
  name: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  nationality: '',
  address: '',
  phone: '',
  bloodGroup: '',
};

// Memoized BMI calculator
const calculateBmi = (height: string, weight: string): string | null => {
  if (height && weight) {
    const heightM = parseFloat(height) / 100;
    const weightKg = parseFloat(weight);
    if (heightM > 0 && weightKg > 0) {
      return (weightKg / (heightM * heightM)).toFixed(1);
    }
  }
  return null;
};

// Memoized input class name generator
const getInputClassName = (fieldName: keyof ValidationErrors, validationErrors: ValidationErrors) => {
  const baseClass = "border-2 transition-all";
  if (validationErrors[fieldName]) {
    return `${baseClass} border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20`;
  }
  return `${baseClass} border-gray-300 dark:border-gray-600 focus:border-[#007bff] focus:ring-2 focus:ring-[#007bff]/20`;
};

// Memoized form field component
const FormField = memo(({ 
  id, 
  label, 
  value, 
  onChange, 
  error, 
  required, 
  type = 'text',
  placeholder,
  min,
  max,
  step,
  className,
  inputRef
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label} {required && <span className="text-red-600 dark:text-red-400">*</span>}
      </Label>
      <Input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        className={className}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default function AddPatientDialog({ open, onOpenChange }: AddPatientDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addPatient = useAddPatient();

  // Refs for focus management
  const nameRef = useRef<HTMLInputElement | null>(null);
  const ageRef = useRef<HTMLInputElement | null>(null);
  const heightRef = useRef<HTMLInputElement | null>(null);
  const weightRef = useRef<HTMLInputElement | null>(null);
  const nationalityRef = useRef<HTMLInputElement | null>(null);

  const bmi = useMemo(() => calculateBmi(formData.height, formData.weight), [formData.height, formData.weight]);

  const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof ValidationErrors];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {};

    const nameValidation = validateRequired(formData.name, 'Name');
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error;
    }

    const ageValidation = validateNumeric(formData.age, 'Age', { min: 0, max: 150 });
    if (!ageValidation.isValid) {
      errors.age = ageValidation.error;
    }

    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }

    const nationalityValidation = validateRequired(formData.nationality, 'Nationality');
    if (!nationalityValidation.isValid) {
      errors.nationality = nationalityValidation.error;
    }

    const heightValidation = validateNumeric(formData.height, 'Height', { min: 30, max: 300, allowDecimals: true });
    if (!heightValidation.isValid) {
      errors.height = heightValidation.error;
    }

    const weightValidation = validateNumeric(formData.weight, 'Weight', { min: 1, max: 500, allowDecimals: true });
    if (!weightValidation.isValid) {
      errors.weight = weightValidation.error;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const focusFirstInvalidField = useCallback(() => {
    const firstInvalid = getFirstInvalidField(validationErrors);
    if (!firstInvalid) return;

    const refMap: Record<string, React.RefObject<HTMLInputElement | null>> = {
      name: nameRef,
      age: ageRef,
      height: heightRef,
      weight: weightRef,
      nationality: nationalityRef,
    };

    const ref = refMap[firstInvalid];
    if (ref?.current) {
      ref.current.focus();
    }
  }, [validationErrors]);

  const handleSubmit = useCallback(async () => {
    setShowSuccess(false);
    setShowError(false);

    if (!validateForm()) {
      setShowError(true);
      setErrorMessage('Please fix the validation errors before submitting');
      setTimeout(focusFirstInvalidField, 100);
      return;
    }

    try {
      const result = await addPatient.mutateAsync({
        name: formData.name.trim(),
        age: BigInt(parseInt(formData.age, 10)),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        nationality: formData.nationality.trim(),
        address: formData.address.trim() || null,
        phone: formData.phone.trim() || null,
        bloodGroup: formData.bloodGroup || null,
      });

      if (result.status === 'success') {
        setShowSuccess(true);
        setTimeout(() => {
          setFormData(initialFormData);
          setValidationErrors({});
          setShowSuccess(false);
          onOpenChange(false);
        }, 1000);
      } else {
        setShowError(true);
        setErrorMessage(result.error || 'Failed to add patient');
      }
    } catch (error: any) {
      console.error('Error adding patient:', error);
      setShowError(true);
      setErrorMessage(error.message || 'An unexpected error occurred');
    }
  }, [formData, validateForm, addPatient, onOpenChange, focusFirstInvalidField]);

  const handleClose = useCallback(() => {
    setFormData(initialFormData);
    setValidationErrors({});
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage('');
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Add New Patient
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Enter patient information to create a new record
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {showSuccess && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/30">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Patient added successfully!
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
            <FormField
              id="name"
              label="Full Name"
              value={formData.name}
              onChange={(value) => handleFieldChange('name', value)}
              error={validationErrors.name}
              required
              placeholder="Enter full name"
              className={getInputClassName('name', validationErrors)}
              inputRef={nameRef}
            />

            <FormField
              id="age"
              label="Age"
              value={formData.age}
              onChange={(value) => handleFieldChange('age', value)}
              error={validationErrors.age}
              required
              type="number"
              min="0"
              max="150"
              placeholder="Enter age"
              className={getInputClassName('age', validationErrors)}
              inputRef={ageRef}
            />

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Gender <span className="text-red-600 dark:text-red-400">*</span>
              </Label>
              <Select value={formData.gender} onValueChange={(value) => handleFieldChange('gender', value)}>
                <SelectTrigger 
                  id="gender" 
                  className={getInputClassName('gender', validationErrors)}
                  aria-required="true"
                  aria-invalid={!!validationErrors.gender}
                  aria-describedby={validationErrors.gender ? 'gender-error' : undefined}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.gender && (
                <p id="gender-error" className="text-sm text-red-600 dark:text-red-400">{validationErrors.gender}</p>
              )}
            </div>

            <FormField
              id="nationality"
              label="Nationality"
              value={formData.nationality}
              onChange={(value) => handleFieldChange('nationality', value)}
              error={validationErrors.nationality}
              required
              placeholder="Enter nationality"
              className={getInputClassName('nationality', validationErrors)}
              inputRef={nationalityRef}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="height"
              label="Height (cm)"
              value={formData.height}
              onChange={(value) => handleFieldChange('height', value)}
              error={validationErrors.height}
              required
              type="number"
              step="0.1"
              min="30"
              max="300"
              placeholder="Enter height in cm"
              className={getInputClassName('height', validationErrors)}
              inputRef={heightRef}
            />

            <FormField
              id="weight"
              label="Weight (kg)"
              value={formData.weight}
              onChange={(value) => handleFieldChange('weight', value)}
              error={validationErrors.weight}
              required
              type="number"
              step="0.1"
              min="1"
              max="500"
              placeholder="Enter weight in kg"
              className={getInputClassName('weight', validationErrors)}
              inputRef={weightRef}
            />

            {bmi && (
              <div className="md:col-span-2">
                <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/30">
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Calculated BMI:</strong> {bmi} kg/m²
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="address"
              label="Address"
              value={formData.address}
              onChange={(value) => handleFieldChange('address', value)}
              placeholder="Enter address (optional)"
              className="border-2 border-gray-300 dark:border-gray-600"
            />

            <FormField
              id="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={(value) => handleFieldChange('phone', value)}
              placeholder="Enter phone number (optional)"
              className="border-2 border-gray-300 dark:border-gray-600"
            />

            <div className="space-y-2">
              <Label htmlFor="bloodGroup" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Blood Group
              </Label>
              <Select value={formData.bloodGroup} onValueChange={(value) => handleFieldChange('bloodGroup', value)}>
                <SelectTrigger id="bloodGroup" className="border-2 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select blood group (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={addPatient.isPending}
              className="border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addPatient.isPending}
              className="bg-[#007bff] hover:bg-[#0056b3] text-white"
            >
              {addPatient.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Patient'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
