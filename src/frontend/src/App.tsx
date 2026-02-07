import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import LoginScreen from './components/LoginScreen';
import ProfileSetupModal from './components/ProfileSetupModal';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import { useState, useEffect, memo } from 'react';

// Ultra-optimized QueryClient with aggressive caching and minimal refetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes default
      gcTime: 1000 * 60 * 90, // 90 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

// Memoized loading component with enhanced feedback and progress tracking
const LoadingScreen = memo(({ message = 'Loading BRAINOPHARM...', progress }: { message?: string; progress?: number }) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-green-50 to-blue-50 dark:from-blue-950 dark:via-green-950 dark:to-blue-900">
    <div className="text-center space-y-6 max-w-md px-4">
      <img 
        src="/assets/BRAINOPHARM  Pharmacovigilance System.png" 
        alt="BRAINOPHARM Logo" 
        className="w-full max-w-[300px] h-auto object-contain mx-auto transform-gpu"
        style={{ maxHeight: '150px' }}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
      <div className="space-y-4">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto will-change-transform"></div>
        <p className="text-lg font-medium text-foreground">{message}</p>
        {progress !== undefined && (
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out will-change-transform"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  </div>
));
LoadingScreen.displayName = 'LoadingScreen';

function AppContent() {
  const { identity, isInitializing, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, error: profileError } = useGetCallerUserProfile();
  const [currentModule, setCurrentModule] = useState('patients');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Loading BRAINOPHARM...');
  const [showDashboard, setShowDashboard] = useState(false);

  const isAuthenticated = !!identity && loginStatus === 'success';

  // Optimized sequential loading with non-blocking profile validation
  useEffect(() => {
    if (isAuthenticated) {
      // Stage 1: Start profile loading immediately
      if (!isFetched && !profileError) {
        setLoadingProgress(30);
        setLoadingMessage('Loading your profile...');
        setShowDashboard(false);
      }
      // Stage 2: Profile loaded or error occurred - show dashboard immediately
      else if (isFetched || profileError) {
        setLoadingProgress(100);
        setLoadingMessage('Ready!');
        
        // Show dashboard immediately without delay
        setShowDashboard(true);
      }
    } else {
      setLoadingProgress(0);
      setLoadingMessage('Loading BRAINOPHARM...');
      setShowDashboard(false);
    }
  }, [isAuthenticated, isFetched, profileError]);

  // Reset state on logout with instant cleanup
  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingProgress(0);
      setLoadingMessage('Loading BRAINOPHARM...');
      setShowDashboard(false);
    }
  }, [isAuthenticated]);

  // Show loading screen during initialization
  if (isInitializing) {
    return <LoadingScreen progress={loadingProgress} message="Initializing..." />;
  }

  // Show login screen if not authenticated or login failed
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Show loading screen only while profile is being fetched for the first time
  // If there's an error or profile is fetched, show dashboard immediately
  if (!showDashboard && !isFetched && !profileError) {
    return <LoadingScreen progress={loadingProgress} message={loadingMessage} />;
  }

  // Determine if profile setup is needed (only if profile is null and successfully fetched)
  const needsProfileSetup = isFetched && userProfile === null && !profileError;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 dark:from-blue-950 dark:via-green-950 dark:to-blue-900">
      <Header />
      <main className="flex-1 w-full">
        {needsProfileSetup ? (
          <ProfileSetupModal />
        ) : (
          <Dashboard onModuleChange={setCurrentModule} currentModule={currentModule} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
