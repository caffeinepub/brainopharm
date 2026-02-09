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
import StartupProfileRecoveryBanner from './components/StartupProfileRecoveryBanner';
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

// Memoized loading component for Internet Identity initialization only
const LoadingScreen = memo(({ message = 'Initializing...' }: { message?: string }) => (
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
      </div>
    </div>
  </div>
));
LoadingScreen.displayName = 'LoadingScreen';

function AppContent() {
  const { identity, isInitializing, loginStatus, clear } = useInternetIdentity();
  const { 
    data: userProfile, 
    isFetched, 
    error: profileError, 
    refetch: refetchProfile,
    actorReady,
    profileFetching,
  } = useGetCallerUserProfile();
  const [currentModule, setCurrentModule] = useState('patients');
  const [profileLoadDelayed, setProfileLoadDelayed] = useState(false);

  const isAuthenticated = !!identity && loginStatus === 'success';

  // Start 5-second delay timer ONLY when actor is ready AND profile is actively fetching
  useEffect(() => {
    if (!isAuthenticated || !actorReady) {
      setProfileLoadDelayed(false);
      return;
    }

    // Only start timer when profile query is actively fetching (not during actor init)
    if (profileFetching && !isFetched && !profileError) {
      const delayTimer = setTimeout(() => {
        console.warn('Profile loading exceeded 5 seconds, showing recovery banner');
        setProfileLoadDelayed(true);
      }, 5000);

      return () => clearTimeout(delayTimer);
    }

    // Clear delayed flag when profile loads successfully
    if (isFetched && !profileError) {
      setProfileLoadDelayed(false);
    }
  }, [isAuthenticated, actorReady, profileFetching, isFetched, profileError]);

  // Reset state on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setProfileLoadDelayed(false);
    }
  }, [isAuthenticated]);

  // Show loading screen ONLY during Internet Identity initialization
  if (isInitializing) {
    return <LoadingScreen message="Initializing..." />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // After authentication, ALWAYS show Dashboard immediately
  // Profile Setup modal and recovery banner are shown conditionally within the Dashboard view

  // Show Profile Setup modal only when:
  // - Actor is ready
  // - Profile query has completed (isFetched = true)
  // - Profile is null (user needs to set up profile)
  // - No error occurred
  // - Not in delayed state (to avoid modal flash during slow loading)
  const showProfileSetup = isAuthenticated && actorReady && isFetched && userProfile === null && !profileError && !profileLoadDelayed;

  // Show recovery banner when:
  // - Profile loading is delayed (>5 seconds after actor is ready)
  // - OR profile fetch resulted in an error
  const showRecoveryBanner = profileLoadDelayed || !!profileError;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleRetry = async () => {
    setProfileLoadDelayed(false);
    await refetchProfile();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 dark:from-blue-950 dark:via-green-950 dark:to-blue-900">
      <Header />
      <main className="flex-1 w-full">
        {showRecoveryBanner && (
          <StartupProfileRecoveryBanner 
            onRetry={handleRetry}
            onLogout={handleLogout}
            isLoading={profileFetching}
          />
        )}
        {showProfileSetup ? (
          <ProfileSetupModal open={showProfileSetup} />
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
