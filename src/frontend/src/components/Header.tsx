import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { LogOut, Stethoscope } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function Header() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-24 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <img 
            src="/assets/BRAINOPHARM  Pharmacovigilance System.png" 
            alt="BRAINOPHARM Logo" 
            className="h-20 w-auto object-contain"
            style={{ maxWidth: '400px' }}
            loading="eager"
            fetchPriority="high"
          />
          <div className="hidden sm:flex items-center gap-2 border-l pl-4">
            <Stethoscope className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">BRAINOPHARM</h1>
              <p className="text-xs text-muted-foreground">Pharmacovigilance System</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {userProfile && (
            <div className="hidden md:block text-sm">
              <span className="text-muted-foreground">Welcome, </span>
              <span className="font-semibold text-foreground">{userProfile.name}</span>
            </div>
          )}
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
