'use client';

import { useUser } from './UserContext';
import { Button } from './Button';
import { SectionHeader } from './SectionHeader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallbackMessage?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  fallbackMessage = "You need to be signed in to access this page."
}: ProtectedRouteProps) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--muted)]">Loading...</div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="max-w-md w-full space-y-8 text-center">
          <span role="img" aria-hidden className="text-6xl mb-4 block">🔒</span>
          <SectionHeader
            title="Sign In Required"
            description={fallbackMessage}
          />
          <div className="space-y-4">
            <Button asChild className="w-full">
              <a href="/signin">Sign In to Continue</a>
            </Button>
            <p className="text-sm text-[var(--muted)]">
              Choose from Google or Facebook sign-in options
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}