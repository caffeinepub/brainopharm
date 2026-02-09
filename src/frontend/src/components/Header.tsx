import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from './ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { User, LogOut } from 'lucide-react';

export default function Header() {
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile, actorReady, profileFetching } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/BRAINOPHARM  Pharmacovigilance System.png" 
            alt="BRAINOPHARM Logo" 
            className="h-10 w-auto object-contain"
            loading="eager"
          />
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              {actorReady && profileFetching ? (
                <span className="text-muted-foreground">Loading profile...</span>
              ) : userProfile ? (
                <span className="font-medium text-foreground">{userProfile.name}</span>
              ) : null}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
