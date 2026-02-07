import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { UserCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      saveProfile.mutate({
        name: name.trim(),
        email: email.trim() || undefined,
        role: 'Healthcare Professional',
      });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Vibrant gradient background with decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-tr from-teal-400/30 via-transparent to-green-400/30" />
      
      {/* Decorative dosage form illustrations */}
      <div className="absolute top-10 left-10 opacity-20">
        <img 
          src="/assets/generated/capsule-illustration.dim_200x200.png" 
          alt="" 
          className="h-32 w-32 animate-pulse"
          loading="eager"
        />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20">
        <img 
          src="/assets/generated/tablet-illustration.dim_200x200.png" 
          alt="" 
          className="h-32 w-32 animate-pulse"
          loading="eager"
        />
      </div>
      <div className="absolute top-1/2 right-20 opacity-15">
        <img 
          src="/assets/generated/syringe-illustration.dim_200x200.png" 
          alt="" 
          className="h-24 w-24 animate-pulse"
          loading="eager"
        />
      </div>

      {/* Main content card with high contrast */}
      <Card className="relative z-10 w-full max-w-md border-2 border-white/30 bg-white/95 shadow-2xl backdrop-blur-md">
        <CardHeader className="space-y-4 text-center">
          {/* Icon with vibrant gradient background */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
            <UserCircle className="h-10 w-10 text-white" />
          </div>
          
          {/* Title with strong contrast */}
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-base text-gray-700">
              Please provide your information to continue to the dashboard
            </CardDescription>
          </div>

          {/* Guidance text with icon */}
          <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-gray-800">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span>Complete your profile to continue</span>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field with enhanced styling */}
            <div className="space-y-2">
              <Label 
                htmlFor="name" 
                className="text-base font-semibold text-gray-900"
              >
                Full Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="h-12 border-2 border-gray-300 bg-white text-base text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            {/* Email field with enhanced styling */}
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-base font-semibold text-gray-900"
              >
                Email <span className="text-sm font-normal text-gray-600">(Optional)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.smith@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-2 border-gray-300 bg-white text-base text-gray-900 placeholder:text-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
            </div>

            {/* Prominently colored action button with icon */}
            <Button
              type="submit"
              className="group relative h-14 w-full overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
              disabled={!name.trim() || saveProfile.isPending}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {saveProfile.isPending ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
              {/* Animated gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Button>

            {/* Additional guidance text */}
            <p className="text-center text-sm text-gray-700">
              Your profile helps us personalize your experience
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
