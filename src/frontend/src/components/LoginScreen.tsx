import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, Stethoscope, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LoginScreen() {
  const { login, loginStatus, loginError, clear } = useInternetIdentity();
  const [logoLoaded, setLogoLoaded] = useState(false);

  const isLoggingIn = loginStatus === 'logging-in';
  const hasError = loginStatus === 'loginError';

  // Asynchronous logo preloading for instant visibility without blocking
  useEffect(() => {
    const preloadImages = () => {
      const criticalImages = [
        '/assets/BRAINOPHARM  Pharmacovigilance System.png',
        '/assets/generated/mukabot-avatar.dim_64x64.png',
        '/assets/generated/stethoscope-icon.dim_64x64.png',
      ];
      
      const promises = criticalImages.map((src) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if one fails
          img.src = src;
        });
      });
      
      Promise.all(promises).then(() => {
        setLogoLoaded(true);
      });
    };

    // Use requestIdleCallback for non-blocking preload
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadImages, { timeout: 500 });
    } else {
      setTimeout(preloadImages, 100);
    }
  }, []);

  // Clear error state when user clicks retry
  const handleRetry = () => {
    clear(); // Clear any existing state
    setTimeout(() => {
      login(); // Attempt login again
    }, 100);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-100 via-green-50 to-blue-50 dark:from-blue-950 dark:via-green-950 dark:to-blue-900">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Asynchronously loaded logo with fade-in */}
            <div className={`transition-opacity duration-300 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <img 
                src="/assets/BRAINOPHARM  Pharmacovigilance System.png" 
                alt="BRAINOPHARM Logo" 
                className="w-full max-w-[300px] h-auto object-contain"
                style={{ maxHeight: '150px' }}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary">BRAINOPHARM</h1>
              <p className="text-base text-muted-foreground mt-2">Pharmacovigilance System</p>
            </div>
          </div>

          <Card className="w-full shadow-xl border-2">
            <CardHeader className="space-y-3 text-center pb-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Secure Access</CardTitle>
              <CardDescription className="text-base">
                Authorized Personnel Only
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                  This application is restricted to authorized personnel only. All access is logged and monitored.
                </AlertDescription>
              </Alert>

              {/* Error Alert for Login Failures */}
              {hasError && loginError && (
                <Alert variant="destructive" className="border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm font-medium">
                    {loginError.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Status indicator during login */}
              {isLoggingIn && (
                <Alert className="border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                  <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                    Opening Internet Identity window... Please complete authentication in the popup window.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <Lock className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Secure Authentication</p>
                    <p className="text-muted-foreground mt-1">
                      Login using Internet Identity for secure, privacy-preserving access
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={login} disabled={isLoggingIn} className="w-full" size="lg">
                {isLoggingIn ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    Logging in...
                  </>
                ) : (
                  'Login with Internet Identity'
                )}
              </Button>

              {hasError && (
                <Button 
                  onClick={handleRetry} 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}

              <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Important Disclaimers:</p>
                <ul className="list-inside list-disc space-y-1 ml-2">
                  <li>For educational purposes only</li>
                  <li>Not intended for diagnostic or treatment use</li>
                  <li>GDPR-compliant data handling</li>
                  <li>No external trackers or analytics</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
