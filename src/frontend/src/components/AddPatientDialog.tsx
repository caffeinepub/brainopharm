import { useState, useCallback, useMemo, memo } from 'react';
import { useAddPatient } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ValidationErrors {
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
  className
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
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        className={className}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default function AddPatientDialog({ open, onOpenChange }: AddPatientDialogProps) {
  const addPatient = useAddPatient();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showValidationError, setShowValidationError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Memoized BMI calculation
  const bmi = useMemo(() => calculateBmi(formData.height, formData.weight), [formData.height, formData.weight]);

  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
      isValid = false;
    }

    const ageNum = parseInt(formData.age);
    if (!formData.age || isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
      errors.age = 'Valid age is required (1-150)';
      isValid = false;
    }

    if (!formData.gender) {
      errors.gender = 'Gender is required';
      isValid = false;
    }

    if (!formData.nationality.trim()) {
      errors.nationality = 'Nationality is required';
      isValid = false;
    }

    const heightNum = parseFloat(formData.height);
    if (!formData.height || isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
      errors.height = 'Valid height is required (1-300 cm)';
      isValid = false;
    }

    const weightNum = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
      errors.weight = 'Valid weight is required (1-500 kg)';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setValidationErrors({});
    setShowValidationError(false);
    setShowSuccess(false);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    setShowValidationError(false);
    setShowSuccess(false);

    if (!validateForm()) {
      setShowValidationError(true);
      return;
    }

    addPatient.mutate(
      {
        name: formData.name.trim(),
        age: BigInt(formData.age),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        nationality: formData.nationality.trim(),
        address: formData.address.trim() || null,
        phone: formData.phone.trim() || null,
        bloodGroup: formData.bloodGroup || null,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          resetForm();
          
          setTimeout(() => {
            setShowSuccess(false);
            onOpenChange(false);
          }, 1000);
        },
        onError: (error) => {
          console.error('Failed to add patient:', error);
        }
      }
    );
  }, [formData, validateForm, addPatient, resetForm, onOpenChange]);

  // Memoized field change handlers
  const handleFieldChange = useCallback((field: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [validationErrors]);

  const handleGenderChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, gender: value }));
    if (validationErrors.gender) {
      setValidationErrors(prev => ({ ...prev, gender: undefined }));
    }
  }, [validationErrors.gender]);

  const handleBloodGroupChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, bloodGroup: value }));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px] bg-[#f5f5f5] dark:bg-gray-900">
        <DialogHeader className="bg-white dark:bg-gray-800 rounded-t-lg p-6 -mx-6 -mt-6 mb-4">
          <DialogTitle className="text-2xl text-[#007bff] dark:text-blue-400">Add New Patient</DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
            Enter patient demographic information. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        {showSuccess && (
          <Alert className="bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-700 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200 font-medium">
              Patient added successfully
            </AlertDescription>
          </Alert>
        )}

        {showValidationError && Object.keys(validationErrors).length > 0 && (
          <Alert className="bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
              Please fill out all required fields correctly.
            </AlertDescription>
          </Alert>
        )}

        {addPatient.isError && (
          <Alert className="bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
              Failed to save patient. Please try again.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#007bff] dark:text-blue-400 border-b-2 border-[#007bff] dark:border-blue-400 pb-2">
                Mandatory Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleFieldChange('name')}
                  error={validationErrors.name}
                  required
                  placeholder="Enter full name"
                  className={getInputClassName('name', validationErrors)}
                />
                <FormField
                  id="age"
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={handleFieldChange('age')}
                  error={validationErrors.age}
                  required
                  placeholder="Enter age"
                  min="0"
                  max="150"
                  className={getInputClassName('age', validationErrors)}
                />
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Gender <span className="text-red-600 dark:text-red-400">*</span>
                  </Label>
                  <Select value={formData.gender} onValueChange={handleGenderChange}>
                    <SelectTrigger 
                      id="gender"
                      className={getInputClassName('gender', validationErrors)}
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
                    <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.gender}</p>
                  )}
                </div>
                <FormField
                  id="nationality"
                  label="Nationality"
                  value={formData.nationality}
                  onChange={handleFieldChange('nationality')}
                  error={validationErrors.nationality}
                  required
                  placeholder="Enter nationality"
                  className={getInputClassName('nationality', validationErrors)}
                />
                <FormField
                  id="height"
                  label="Height (cm)"
                  type="number"
                  value={formData.height}
                  onChange={handleFieldChange('height')}
                  error={validationErrors.height}
                  required
                  placeholder="Enter height in cm"
                  min="0"
                  max="300"
                  step="0.1"
                  className={getInputClassName('height', validationErrors)}
                />
                <FormField
                  id="weight"
                  label="Weight (kg)"
                  type="number"
                  value={formData.weight}
                  onChange={handleFieldChange('weight')}
                  error={validationErrors.weight}
                  required
                  placeholder="Enter weight in kg"
                  min="0"
                  max="500"
                  step="0.1"
                  className={getInputClassName('weight', validationErrors)}
                />
              </div>
              
              {bmi && (
                <div className="rounded-lg bg-[#e0f7fa] dark:bg-blue-900/30 border-2 border-[#007bff]/30 dark:border-blue-400/30 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    <span className="font-bold text-[#007bff] dark:text-blue-400">Calculated BMI:</span> {bmi}
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#5a9fd4] dark:text-blue-300 border-b-2 border-[#5a9fd4] dark:border-blue-300 pb-2">
                Optional Information
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="phone"
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleFieldChange('phone')}
                  placeholder="Enter phone number"
                  className="border-2 border-gray-300 dark:border-gray-600 focus:border-[#007bff] focus:ring-2 focus:ring-[#007bff]/20 transition-all"
                />
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup" className="text-sm font-medium text-gray-700 dark:text-gray-200">Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={handleBloodGroupChange}>
                    <SelectTrigger 
                      id="bloodGroup"
                      className="border-2 border-gray-300 dark:border-gray-600 focus:border-[#007bff] focus:ring-2 focus:ring-[#007bff]/20 transition-all"
                    >
                      <SelectValue placeholder="Select blood group" />
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
                <div className="space-y-2 sm:col-span-2">
                  <FormField
                    id="address"
                    label="Address"
                    value={formData.address}
                    onChange={handleFieldChange('address')}
                    placeholder="Enter address"
                    className="border-2 border-gray-300 dark:border-gray-600 focus:border-[#007bff] focus:ring-2 focus:ring-[#007bff]/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={addPatient.isPending}
              className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addPatient.isPending}
              className="bg-[#007bff] hover:bg-[#0056b3] text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {addPatient.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Patient...
                </>
              ) : (
                'Add Patient'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
