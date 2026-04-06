import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { validateRequired, validateEmail, getFirstInvalidField } from '../utils/formValidation';

interface ProfileSetupModalProps {
  open: boolean;
}

interface ValidationErrors {
  [key: string]: string | undefined;
  name?: string;
  email?: string;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const saveProfile = useSaveCallerUserProfile();

  // Refs for focus management
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    const nameValidation = validateRequired(name, 'Name');
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error;
    }

    // Email is optional, but if provided, must be valid
    if (email.trim()) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.error;
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
      email: emailRef,
    };

    const ref = refMap[firstInvalid];
    if (ref?.current) {
      ref.current.focus();
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setTimeout(focusFirstInvalidField, 100);
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        email: email.trim() || undefined,
        role: 'user',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950 border-2 border-purple-200 dark:border-purple-800"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="absolute top-4 right-4 opacity-20">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-20">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400" />
        </div>

        <DialogHeader className="relative z-10">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Welcome to BRAINOPHARM
          </DialogTitle>
          <DialogDescription className="text-gray-700 dark:text-gray-300">
            Please set up your profile to continue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-800 dark:text-gray-200 font-medium">
              Name <span className="text-red-600 dark:text-red-400">*</span>
            </Label>
            <Input
              ref={nameRef}
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 ${
                validationErrors.name ? 'border-red-500' : 'border-purple-200 dark:border-purple-800'
              } focus:border-purple-500 dark:focus:border-purple-400`}
              disabled={saveProfile.isPending}
              aria-required="true"
              aria-invalid={!!validationErrors.name}
              aria-describedby={validationErrors.name ? 'name-error' : undefined}
            />
            {validationErrors.name && (
              <p id="name-error" className="text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-800 dark:text-gray-200 font-medium">
              Email (Optional)
            </Label>
            <Input
              ref={emailRef}
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 ${
                validationErrors.email ? 'border-red-500' : 'border-purple-200 dark:border-purple-800'
              } focus:border-purple-500 dark:focus:border-purple-400`}
              disabled={saveProfile.isPending}
              aria-invalid={!!validationErrors.email}
              aria-describedby={validationErrors.email ? 'email-error' : undefined}
            />
            {validationErrors.email && (
              <p id="email-error" className="text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={saveProfile.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
