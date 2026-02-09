import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Loader2, Save, X, UserCog } from 'lucide-react';
import { useGetPrescriberDetails, useSavePrescriberDetails } from '../hooks/useQueries';
import { PrescriberPrefix, PrescriberDetails } from '../backend';
import { toast } from 'sonner';

interface PrescriberDetailsSectionProps {
  patientId: string;
}

export default function PrescriberDetailsSection({ patientId }: PrescriberDetailsSectionProps) {
  const { data: existingDetails, isLoading: loadingDetails } = useGetPrescriberDetails(patientId);
  const saveDetails = useSavePrescriberDetails();

  const [isEditing, setIsEditing] = useState(false);
  const [prefix, setPrefix] = useState<PrescriberPrefix>(PrescriberPrefix.doctor);
  const [fullName, setFullName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing details when available
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
    } else if (!/^\+?[\d\s\-()]+$/.test(contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid contact number';
    }

    if (!email.trim()) {
      newErrors.email = 'Mail ID is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors before saving');
      return;
    }

    const details: PrescriberDetails = {
      prefix,
      fullName: fullName.trim(),
      registrationNumber: registrationNumber.trim(),
      specialization: specialization.trim(),
      contactNumber: contactNumber.trim(),
      email: email.trim(),
      address: address.trim(),
    };

    try {
      await saveDetails.mutateAsync({ patientId, details });
      toast.success('Prescriber details saved successfully');
      setIsEditing(false);
      setErrors({});
    } catch (error: any) {
      console.error('Error saving prescriber details:', error);
      toast.error(error.message || 'Failed to save prescriber details');
    }
  };

  const handleCancel = () => {
    if (existingDetails) {
      setPrefix(existingDetails.prefix);
      setFullName(existingDetails.fullName);
      setRegistrationNumber(existingDetails.registrationNumber);
      setSpecialization(existingDetails.specialization);
      setContactNumber(existingDetails.contactNumber);
      setEmail(existingDetails.email);
      setAddress(existingDetails.address);
    } else {
      setPrefix(PrescriberPrefix.doctor);
      setFullName('');
      setRegistrationNumber('');
      setSpecialization('');
      setContactNumber('');
      setEmail('');
      setAddress('');
    }
    setErrors({});
    setIsEditing(false);
  };

  const getPrefixLabel = (p: PrescriberPrefix): string => {
    switch (p) {
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

  if (loadingDetails) {
    return (
      <Card className="border-stone-200 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-900/50">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-500" />
            <span className="ml-2 text-sm text-stone-600 dark:text-stone-400">Loading prescriber details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-stone-200 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-900/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
            <div>
              <CardTitle className="text-stone-900 dark:text-stone-100">Prescriber Details</CardTitle>
              <CardDescription className="text-stone-600 dark:text-stone-400">Information about the prescribing healthcare professional</CardDescription>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950">
              {existingDetails ? 'Edit' : 'Add Details'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing && !existingDetails ? (
          <p className="text-sm text-stone-600 dark:text-stone-400">No prescriber details recorded for this patient.</p>
        ) : !isEditing && existingDetails ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Prefix</p>
              <p className="font-medium text-stone-900 dark:text-stone-100">{getPrefixLabel(existingDetails.prefix)}</p>
            </div>
            <div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Full Name</p>
              <p className="font-medium text-stone-900 dark:text-stone-100">{existingDetails.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Registration Number</p>
              <p className="font-medium text-stone-900 dark:text-stone-100">{existingDetails.registrationNumber}</p>
            </div>
            <div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Specialization</p>
              <p className="font-medium text-stone-900 dark:text-stone-100">{existingDetails.specialization}</p>
            </div>
            <div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Contact Number</p>
              <p className="font-medium text-stone-900 dark:text-stone-100">{existingDetails.contactNumber}</p>
            </div>
            <div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Mail ID</p>
              <p className="font-medium text-stone-900 dark:text-stone-100">{existingDetails.email}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-stone-600 dark:text-stone-400">Address</p>
              <p className="font-medium text-stone-900 dark:text-stone-100">{existingDetails.address}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prefix" className="text-stone-700 dark:text-stone-300">
                  Prefix <span className="text-red-600 dark:text-red-500">*</span>
                </Label>
                <Select value={prefix} onValueChange={(value) => setPrefix(value as PrescriberPrefix)}>
                  <SelectTrigger id="prefix" className="border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PrescriberPrefix.doctor}>Dr.</SelectItem>
                    <SelectItem value={PrescriberPrefix.practitionerNurse}>Practitioner Nurse</SelectItem>
                    <SelectItem value={PrescriberPrefix.pharmacist}>Pharmacist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-stone-700 dark:text-stone-300">
                  Full Name <span className="text-red-600 dark:text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className={`border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-950 ${errors.fullName ? 'border-red-500' : ''}`}
                />
                {errors.fullName && <p className="text-xs text-red-600 dark:text-red-500">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber" className="text-stone-700 dark:text-stone-300">
                  Registration Number <span className="text-red-600 dark:text-red-500">*</span>
                </Label>
                <Input
                  id="registrationNumber"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="Enter registration number"
                  className={`border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-950 ${errors.registrationNumber ? 'border-red-500' : ''}`}
                />
                {errors.registrationNumber && <p className="text-xs text-red-600 dark:text-red-500">{errors.registrationNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization" className="text-stone-700 dark:text-stone-300">
                  Specialization <span className="text-red-600 dark:text-red-500">*</span>
                </Label>
                <Input
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g., Cardiology, General Medicine"
                  className={`border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-950 ${errors.specialization ? 'border-red-500' : ''}`}
                />
                {errors.specialization && <p className="text-xs text-red-600 dark:text-red-500">{errors.specialization}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber" className="text-stone-700 dark:text-stone-300">
                  Contact Number <span className="text-red-600 dark:text-red-500">*</span>
                </Label>
                <Input
                  id="contactNumber"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 1234567890"
                  className={`border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-950 ${errors.contactNumber ? 'border-red-500' : ''}`}
                />
                {errors.contactNumber && <p className="text-xs text-red-600 dark:text-red-500">{errors.contactNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-700 dark:text-stone-300">
                  Mail ID <span className="text-red-600 dark:text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className={`border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-950 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-xs text-red-600 dark:text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-stone-700 dark:text-stone-300">
                Address <span className="text-red-600 dark:text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete address"
                rows={3}
                className={`border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-950 ${errors.address ? 'border-red-500' : ''}`}
              />
              {errors.address && <p className="text-xs text-red-600 dark:text-red-500">{errors.address}</p>}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saveDetails.isPending} className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800">
                {saveDetails.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Details
                  </>
                )}
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={saveDetails.isPending} className="border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
