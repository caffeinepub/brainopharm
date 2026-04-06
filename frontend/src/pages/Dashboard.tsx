import { useState, useEffect, lazy, Suspense, memo, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import PatientManagement from '../components/PatientManagement';
import LabResultsModule from '../components/LabResultsModule';
import MedicationsModule from '../components/MedicationsModule';
import AdrsModule from '../components/AdrsModule';
import DrugInteractionsModule from '../components/DrugInteractionsModule';
import CaseSummary from '../components/CaseSummary';
import DrugTableModule from '../components/DrugTableModule';
import DrugDrugInteractionDatabaseModule from '../components/DrugDrugInteractionDatabaseModule';
import { Card, CardContent } from '../components/ui/card';
import { Users, Activity, Pill, AlertTriangle, GitCompare, FileText, ShieldAlert, Database, Layers } from 'lucide-react';

// Lazy load non-critical modules with webpack chunk names for better caching
const RestrictedDrugsModule = lazy(() => import(/* webpackChunkName: "restricted-drugs" */ '../components/RestrictedDrugsModule'));
const DisclaimersSection = lazy(() => import(/* webpackChunkName: "disclaimers" */ '../components/DisclaimersSection'));
const WavebotWidget = lazy(() => import(/* webpackChunkName: "wavebot" */ '../components/WavebotWidget'));

// Memoized loading fallback with skeleton
const ModuleLoadingFallback = memo(() => (
  <Card className="bg-background/80 backdrop-blur-sm">
    <CardContent className="py-12 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading module...</p>
    </CardContent>
  </Card>
));
ModuleLoadingFallback.displayName = 'ModuleLoadingFallback';

// Memoized empty state component
const EmptyStateCard = memo(({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <Card className="bg-background/90 backdrop-blur-md border-border/50 shadow-lg">
    <CardContent className="py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-lg font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
    </CardContent>
  </Card>
));
EmptyStateCard.displayName = 'EmptyStateCard';

interface DashboardProps {
  onModuleChange?: (module: string) => void;
  currentModule?: string;
}

export default function Dashboard({ onModuleChange, currentModule }: DashboardProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('drugs');
  const [showWavebot, setShowWavebot] = useState(false);
  const [loadedModules, setLoadedModules] = useState<Set<string>>(new Set(['drugs']));
  const [prefetchedModules, setPrefetchedModules] = useState<Set<string>>(new Set());

  // Delayed loading for non-critical modules (WAVEBOT loads after 3 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWavebot(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Intelligent prefetch on hover with debouncing
  const handleTabHover = useMemo(() => {
    const timeouts: Record<string, NodeJS.Timeout> = {};
    
    return (tabValue: string) => {
      if (!prefetchedModules.has(tabValue)) {
        if (timeouts[tabValue]) {
          clearTimeout(timeouts[tabValue]);
        }
        
        timeouts[tabValue] = setTimeout(() => {
          setPrefetchedModules(prev => new Set(prev).add(tabValue));
          
          // Prefetch module based on tab value
          if (tabValue === 'restricted') {
            import(/* webpackPrefetch: true */ '../components/RestrictedDrugsModule');
          }
        }, 300);
      }
    };
  }, [prefetchedModules]);

  useEffect(() => {
    if (onModuleChange) {
      onModuleChange(activeTab);
    }
  }, [activeTab, onModuleChange]);

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('lab');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLoadedModules(prev => new Set(prev).add(value));
  };

  // Memoized empty states
  const emptyStates = useMemo(() => ({
    lab: <EmptyStateCard icon={Activity} title="No Patient Selected" description="Please select a patient from the Patient Registry to view lab results" />,
    medications: <EmptyStateCard icon={Pill} title="No Patient Selected" description="Please select a patient from the Patient Registry to manage medications" />,
    adrs: <EmptyStateCard icon={AlertTriangle} title="No Patient Selected" description="Please select a patient from the Patient Registry to record ADRs" />,
    summary: <EmptyStateCard icon={FileText} title="No Patient Selected" description="Please select a patient from the Patient Registry to view case summary" />,
  }), []);

  return (
    <div className="w-full min-h-full relative">
      {/* Optimized gradient background with GPU acceleration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden will-change-transform">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-teal-50/40 to-green-50/50 dark:from-blue-950/25 dark:via-teal-950/20 dark:to-green-950/25 transform-gpu" />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-50/30 via-transparent to-cyan-50/30 dark:from-purple-950/15 dark:via-transparent dark:to-cyan-950/15 transform-gpu" />
      </div>

      {/* Lazy-loaded decorative illustrations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden will-change-transform">
        <img 
          src="/assets/generated/tablet-illustration.dim_200x200.png" 
          alt="" 
          className="absolute top-16 left-8 w-40 h-40 opacity-[0.08] dark:opacity-[0.04] transform-gpu"
          style={{ 
            animation: 'float-slow 12s ease-in-out infinite',
            animationDelay: '0s'
          }}
          loading="lazy"
          decoding="async"
        />
        <img 
          src="/assets/generated/capsule-illustration.dim_200x200.png" 
          alt="" 
          className="absolute top-32 right-16 w-32 h-32 opacity-[0.10] dark:opacity-[0.05] transform-gpu"
          style={{ 
            animation: 'float-medium 10s ease-in-out infinite',
            animationDelay: '1.5s'
          }}
          loading="lazy"
          decoding="async"
        />
        <img 
          src="/assets/generated/syringe-illustration.dim_200x200.png" 
          alt="" 
          className="absolute top-1/3 left-1/4 w-44 h-44 opacity-[0.07] dark:opacity-[0.03] transform-gpu"
          style={{ 
            animation: 'float-slow 14s ease-in-out infinite',
            animationDelay: '3s'
          }}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
            Pharmacovigilance Dashboard
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Manage patient data, record adverse drug reactions, and monitor clinical outcomes
          </p>
        </div>

        {/* Lazy-loaded disclaimers section */}
        <Suspense fallback={<div className="h-24 animate-pulse bg-muted/20 rounded-lg mb-6" />}>
          <DisclaimersSection />
        </Suspense>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6 w-full">
          <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-full min-w-max lg:w-full lg:grid lg:grid-cols-9 h-auto bg-background/90 backdrop-blur-md shadow-sm border border-border/50">
              <TabsTrigger 
                value="drugs" 
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
                onMouseEnter={() => handleTabHover('drugs')}
              >
                <Database className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm">Drug Database</span>
              </TabsTrigger>
              <TabsTrigger 
                value="patients" 
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
                onMouseEnter={() => handleTabHover('patients')}
              >
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm">Patient Registry</span>
              </TabsTrigger>
              <TabsTrigger 
                value="lab" 
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent transition-colors" 
                disabled={!selectedPatientId}
                onMouseEnter={() => handleTabHover('lab')}
              >
                <Activity className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm">Lab Results</span>
              </TabsTrigger>
              <TabsTrigger 
                value="medications" 
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 data-[state=active]:bg-secondary/10 data-[state=active]:text-secondary transition-colors" 
                disabled={!selectedPatientId}
                onMouseEnter={() => handleTabHover('medications')}
              >
                <Pill className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm">Medications</span>
              </TabsTrigger>
              <TabsTrigger 
                value="adrs" 
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 data-[state=active]:bg-warning/10 data-[state=active]:text-warning transition-colors" 
                disabled={!selectedPatientId}
                onMouseEnter={() => handleTabHover('adrs')}
              >
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm">ADRs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="interactions" 
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
                onMouseEnter={() => handleTabHover('interactions')}
              >
                <GitCompare className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm">Drug Interactions</span>
              </TabsTrigger>
              <TabsTrigger 
                value="restricted" 
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive transition-colors"
                onMouseEnter={() => handleTabHover('restricted')}
              >
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm">Restricted Drugs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="drugDatabase" 
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 transition-colors"
                onMouseEnter={() => handleTabHover('drugDatabase')}
              >
                <Layers className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm">Drug-Drug DB</span>
              </TabsTrigger>
              <TabsTrigger 
                value="summary" 
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent transition-colors" 
                disabled={!selectedPatientId}
                onMouseEnter={() => handleTabHover('summary')}
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm">Case Summary</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="drugs" className="space-y-4 mt-6">
            <DrugTableModule />
          </TabsContent>

          <TabsContent value="patients" className="space-y-4 mt-6">
            <PatientManagement onSelectPatient={handleSelectPatient} />
          </TabsContent>

          <TabsContent value="lab" className="space-y-4 mt-6">
            {selectedPatientId ? (
              <LabResultsModule patientId={selectedPatientId} />
            ) : emptyStates.lab}
          </TabsContent>

          <TabsContent value="medications" className="space-y-4 mt-6">
            {selectedPatientId ? (
              <MedicationsModule patientId={selectedPatientId} />
            ) : emptyStates.medications}
          </TabsContent>

          <TabsContent value="adrs" className="space-y-4 mt-6">
            {selectedPatientId ? (
              <AdrsModule patientId={selectedPatientId} />
            ) : emptyStates.adrs}
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4 mt-6">
            <DrugInteractionsModule />
          </TabsContent>

          <TabsContent value="restricted" className="space-y-4 mt-6">
            {loadedModules.has('restricted') || prefetchedModules.has('restricted') ? (
              <Suspense fallback={<ModuleLoadingFallback />}>
                <RestrictedDrugsModule />
              </Suspense>
            ) : (
              <ModuleLoadingFallback />
            )}
          </TabsContent>

          <TabsContent value="drugDatabase" className="space-y-4 mt-6">
            <DrugDrugInteractionDatabaseModule />
          </TabsContent>

          <TabsContent value="summary" className="space-y-4 mt-6">
            {selectedPatientId ? (
              <CaseSummary patientId={selectedPatientId} />
            ) : emptyStates.summary}
          </TabsContent>
        </Tabs>
      </div>

      {/* Lazy-loaded WAVEBOT Widget (delayed 3 seconds) */}
      {showWavebot && (
        <Suspense fallback={null}>
          <WavebotWidget currentModule={currentModule || activeTab} />
        </Suspense>
      )}

      <style>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) translateZ(0);
          }
          50% {
            transform: translateY(-15px) rotate(3deg) translateZ(0);
          }
        }
        
        @keyframes float-medium {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) translateZ(0);
          }
          50% {
            transform: translateY(-12px) rotate(-3deg) translateZ(0);
          }
        }
        
        .transform-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
