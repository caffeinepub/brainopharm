import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { CheckCircle2, AlertCircle, User } from 'lucide-react';
import { useGetPrescriberDetails, useSavePrescriberDetails } from '../hooks/useQueries';
import { PrescriberDetails, PrescriberPrefix } from '../backend';
import { getFirstInvalidField } from '../utils/formValidation';

interface PrescriberDetailsSectionProps {
  patientId: string;
}

export default function PrescriberDetailsSection({ patientId }: PrescriberDetailsSectionProps) {
  const { data: existingDetails, isLoading } = useGetPrescriberDetails(patientId);
  const saveDetails = useSavePrescriberDetails();

  const [prefix, setPrefix] = useState<PrescriberPrefix>(PrescriberPrefix.doctor);
  const [fullName, setFullName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing details
  useEffect(() => {
    if (existingDetails) {
      setPrefix(existingDetails.prefix);
      setFullName(existingDetails.fullName);
      setRegistrationNumber(existingDetails.registrationNumber);
      setSpecialization(existingDetails.specialization);
      setContactNumber(existingDetails.contactNumber);
      setEmail(existingDetails.email);
      setAddress(existingDetails.address);
    }
  }, [existingDetails]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required';
    }

    if (!specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(contactNumber.replace(/\s/g, ''))) {
      newErrors.contactNumber = 'Contact number must be 10 digits';
    }

    if (!email.trim()) {
      newErrors.email = 'Mail ID is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      const firstInvalidField = getFirstInvalidField(errors);
      if (firstInvalidField) {
        document.getElementById(firstInvalidField)?.focus();
      }
      return;
    }

    try {
      const prescriberDetails: PrescriberDetails = {
        prefix,
        fullName: fullName.trim(),
        registrationNumber: registrationNumber.trim(),
        specialization: specialization.trim(),
        contactNumber: contactNumber.trim(),
        email: email.trim(),
        address: address.trim(),
      };

      await saveDetails.mutateAsync({ patientId, prescriberDetails });
      setSuccessMessage('Prescriber details saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving prescriber details:', error);
      setErrors({ submit: 'Failed to save prescriber details. Please try again.' });
    }
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Prescriber Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Prescriber Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prefix */}
          <div className="space-y-2">
            <Label htmlFor="prefix">Prefix *</Label>
            <Select
              value={prefix}
              onValueChange={(value) => setPrefix(value as PrescriberPrefix)}
            >
              <SelectTrigger id="prefix" aria-required="true">
                <SelectValue placeholder="Select prefix" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PrescriberPrefix.doctor}>Dr.</SelectItem>
                <SelectItem value={PrescriberPrefix.practitionerNurse}>Practitioner Nurse</SelectItem>
                <SelectItem value={PrescriberPrefix.pharmacist}>Pharmacist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) {
                  setErrors((prev) => ({ ...prev, fullName: '' }));
                }
              }}
              placeholder="Enter full name"
              aria-required="true"
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            />
            {errors.fullName && (
              <p id="fullName-error" className="text-sm text-destructive">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Registration Number */}
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number *</Label>
            <Input
              id="registrationNumber"
              value={registrationNumber}
              onChange={(e) => {
                setRegistrationNumber(e.target.value);
                if (errors.registrationNumber) {
                  setErrors((prev) => ({ ...prev, registrationNumber: '' }));
                }
              }}
              placeholder="Enter registration number"
              aria-required="true"
              aria-invalid={!!errors.registrationNumber}
              aria-describedby={errors.registrationNumber ? 'registrationNumber-error' : undefined}
            />
            {errors.registrationNumber && (
              <p id="registrationNumber-error" className="text-sm text-destructive">
                {errors.registrationNumber}
              </p>
            )}
          </div>

          {/* Specialization */}
          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization *</Label>
            <Input
              id="specialization"
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value);
                if (errors.specialization) {
                  setErrors((prev) => ({ ...prev, specialization: '' }));
                }
              }}
              placeholder="Enter specialization (e.g., Cardiology, General Medicine)"
              aria-required="true"
              aria-invalid={!!errors.specialization}
              aria-describedby={errors.specialization ? 'specialization-error' : undefined}
            />
            {errors.specialization && (
              <p id="specialization-error" className="text-sm text-destructive">
                {errors.specialization}
              </p>
            )}
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number *</Label>
            <Input
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => {
                setContactNumber(e.target.value);
                if (errors.contactNumber) {
                  setErrors((prev) => ({ ...prev, contactNumber: '' }));
                }
              }}
              placeholder="Enter 10-digit contact number"
              aria-required="true"
              aria-invalid={!!errors.contactNumber}
              aria-describedby={errors.contactNumber ? 'contactNumber-error' : undefined}
            />
            {errors.contactNumber && (
              <p id="contactNumber-error" className="text-sm text-destructive">
                {errors.contactNumber}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Mail ID *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: '' }));
                }
              }}
              placeholder="Enter email address"
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) {
                  setErrors((prev) => ({ ...prev, address: '' }));
                }
              }}
              placeholder="Enter complete address"
              aria-required="true"
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? 'address-error' : undefined}
            />
            {errors.address && (
              <p id="address-error" className="text-sm text-destructive">
                {errors.address}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {successMessage && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={saveDetails.isPending}
          >
            {saveDetails.isPending ? 'Saving...' : 'Save Prescriber Details'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
