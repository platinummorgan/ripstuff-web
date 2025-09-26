'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  isModerator?: boolean;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      // Use profile API which has better user data handling
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        console.log('UserContext fetched user data:', data.user);
        setUser(data.user);
      } else {
        // Fallback to auth/me API
        console.log('Profile API failed, trying auth/me');
        const authResponse = await fetch('/api/auth/me');
        if (authResponse.ok) {
          const authData = await authResponse.json();
          console.log('Auth/me returned:', authData.user);
          setUser(authData.user);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Sign-out error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    await fetchCurrentUser();
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const value: UserContextType = {
    user,
    isLoading,
    signOut,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}