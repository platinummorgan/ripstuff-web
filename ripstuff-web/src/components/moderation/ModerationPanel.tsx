'use client';

import { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { Button } from '@/components/Button';

interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  isModerator?: boolean;
}

interface ModerationPanelProps {
  children: React.ReactNode;
}

export function ModerationPanel({ children }: ModerationPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          if (response.status === 401) {
            setError('AUTHENTICATION_REQUIRED');
          } else {
            setError('FAILED_TO_LOAD_USER');
          }
          setIsLoading(false);
          return;
        }

        const userData = await response.json();
        const userProfile = userData.user;
        setUser(userProfile);

        if (!userProfile?.isModerator) {
          setError('MODERATOR_PERMISSIONS_REQUIRED');
        }
      } catch (err) {
        setError('NETWORK_ERROR');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleLogout = () => {
    // Clear user session and redirect
    fetch('/api/auth/signout', { method: 'POST' })
      .then(() => window.location.href = '/feed')
      .catch(() => window.location.href = '/feed');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--muted)]">Loading...</div>
      </div>
    );
  }

  if (error === 'AUTHENTICATION_REQUIRED') {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="max-w-md w-full space-y-8 text-center">
          <SectionHeader
            title="Sign In Required"
            description="You need to be signed in to access the moderation panel."
          />
          <div className="space-y-4">
            <Button asChild className="w-full">
              <a href="/api/auth/signin">Sign In with Google</a>
            </Button>
            <a
              href="/feed"
              className="text-sm text-[var(--muted)] hover:text-white transition-colors block"
            >
              ← Back to feed
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (error === 'MODERATOR_PERMISSIONS_REQUIRED') {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="max-w-md w-full space-y-8 text-center">
          <SectionHeader
            title="Moderator Access Required"
            description={`Hi ${user?.name || user?.email}! You don't have moderator permissions to access this panel.`}
          />
          <div className="space-y-4">
            <Button onClick={handleLogout} variant="secondary" className="w-full">
              Sign Out
            </Button>
            <a
              href="/feed"
              className="text-sm text-[var(--muted)] hover:text-white transition-colors block"
            >
              ← Back to feed
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="max-w-md w-full space-y-8 text-center">
          <SectionHeader
            title="Something went wrong"
            description="Unable to verify your permissions. Please try again."
          />
          <div className="space-y-4">
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry
            </Button>
            <a
              href="/feed"
              className="text-sm text-[var(--muted)] hover:text-white transition-colors block"
            >
              ← Back to feed
            </a>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and is a moderator
  return (
    <div>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <div className="text-xs text-[var(--muted)]">
          Moderator: {user?.name || user?.email}
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
      {children}
    </div>
  );
}