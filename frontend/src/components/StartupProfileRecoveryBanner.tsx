import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';

interface StartupProfileRecoveryBannerProps {
  onRetry: () => Promise<void>;
  onLogout: () => Promise<void>;
  isLoading: boolean;
}

export default function StartupProfileRecoveryBanner({ 
  onRetry, 
  onLogout, 
  isLoading 
}: StartupProfileRecoveryBannerProps) {
  const handleRetry = async () => {
    await onRetry();
  };

  const handleLogout = async () => {
    await onLogout();
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-400 font-semibold">
          Profile Loading Delayed
        </AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300 mt-2">
          <p className="mb-3">
            Your profile is taking longer than expected to load. The Drug Database and other features remain fully accessible. You can retry loading your profile or continue using the application.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleRetry}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="border-yellow-600 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-400 dark:hover:bg-yellow-950/40"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
            <Button
              onClick={handleLogout}
              size="sm"
              variant="outline"
              className="border-yellow-600 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-400 dark:hover:bg-yellow-950/40"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
