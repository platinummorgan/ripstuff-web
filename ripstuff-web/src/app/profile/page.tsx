'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/components/UserContext';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';

interface LinkedAccount {
  provider: string;
  name: string | null;
  picture: string | null;
  createdAt: string;
}

interface AccountLinkingSectionProps {
  user: any;
}

function AccountLinkingSection({ user }: AccountLinkingSectionProps) {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState<string | null>(null);
  const [linkingMessage, setLinkingMessage] = useState('');

  useEffect(() => {
    fetchLinkedAccounts();
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      const response = await fetch('/api/auth/link-account');
      if (response.ok) {
        const data = await response.json();
        setLinkedAccounts(data.linkedAccounts || []);
      }
    } catch (error) {
      console.error('Failed to fetch linked accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startLinkingProcess = (provider: 'google' | 'facebook') => {
    setIsLinking(provider);
    setLinkingMessage(`Redirecting to ${provider}...`);

    // Build OAuth URL for linking
    if (provider === 'google') {
      // Use the Google config API like in sign-in
      fetch('/api/auth/google-config')
        .then(res => res.json())
        .then(data => {
          if (data.configured) {
            const params = new URLSearchParams({
              client_id: data.clientId,
              redirect_uri: `${window.location.origin}/api/auth/callback/google?linking=true`,
              response_type: 'code',
              scope: 'openid email profile',
              access_type: 'offline',
              state: 'linking', // Add state to indicate this is for linking
            });
            window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
          }
        })
        .catch(() => {
          setLinkingMessage('Failed to start Google linking');
          setIsLinking(null);
        });
    } else if (provider === 'facebook') {
      // Use the Facebook config API
      fetch('/api/auth/facebook-config')
        .then(res => res.json())
        .then(data => {
          if (data.configured) {
            const params = new URLSearchParams({
              client_id: data.appId,
              redirect_uri: `${window.location.origin}/api/auth/callback/facebook?linking=true`,
              scope: 'public_profile',
              response_type: 'code',
              state: 'linking', // Add state to indicate this is for linking
            });
            window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
          }
        })
        .catch(() => {
          setLinkingMessage('Failed to start Facebook linking');
          setIsLinking(null);
        });
    }
  };

  const getProviderIcon = (provider: string) => {
    if (provider === 'google') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      );
    } else if (provider === 'facebook') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877f2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    }
    return null;
  };

  const getProviderName = (provider: string) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  const isAccountLinked = (provider: string) => {
    return linkedAccounts.some(account => account.provider === provider);
  };

  if (isLoading) {
    return (
      <div className="mt-8 pt-8 border-t border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Connected Accounts</h3>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-white/10">
      <h3 className="text-xl font-semibold text-white mb-4">Connected Accounts</h3>
      <p className="text-gray-400 text-sm mb-6">
        Link multiple accounts to access all your content and maintain your moderator status across login methods.
      </p>

      <div className="space-y-4">
        {/* Google Account */}
        <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
          <div className="flex items-center gap-3">
            {getProviderIcon('google')}
            <div>
              <div className="text-white font-medium">Google</div>
              {isAccountLinked('google') ? (
                <div className="text-sm text-green-400">✓ Connected</div>
              ) : (
                <div className="text-sm text-gray-400">Not connected</div>
              )}
            </div>
          </div>
          
          {!isAccountLinked('google') && (
            <Button
              onClick={() => startLinkingProcess('google')}
              disabled={isLinking === 'google'}
            >
              {isLinking === 'google' ? 'Connecting...' : 'Link Google'}
            </Button>
          )}
        </div>

        {/* Facebook Account */}
        <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
          <div className="flex items-center gap-3">
            {getProviderIcon('facebook')}
            <div>
              <div className="text-white font-medium">Facebook</div>
              {isAccountLinked('facebook') ? (
                <div className="text-sm text-green-400">✓ Connected</div>
              ) : (
                <div className="text-sm text-gray-400">Not connected</div>
              )}
            </div>
          </div>
          
          {!isAccountLinked('facebook') && (
            <Button
              onClick={() => startLinkingProcess('facebook')}
              disabled={isLinking === 'facebook'}
            >
              {isLinking === 'facebook' ? 'Connecting...' : 'Link Facebook'}
            </Button>
          )}
        </div>

        {/* Status Message */}
        {linkingMessage && (
          <div className="p-3 rounded-lg text-sm bg-blue-900/30 border border-blue-500/30 text-blue-300">
            {linkingMessage}
          </div>
        )}

        {/* Linked Accounts List */}
        {linkedAccounts.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Linked Accounts ({linkedAccounts.length})</h4>
            <div className="space-y-2">
              {linkedAccounts.map((account, index) => (
                <div key={index} className="flex items-center gap-3 p-2 text-sm">
                  {getProviderIcon(account.provider)}
                  <span className="text-gray-300">{getProviderName(account.provider)}</span>
                  {account.name && <span className="text-gray-400">({account.name})</span>}
                  <span className="text-gray-500 text-xs ml-auto">
                    Linked {new Date(account.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useUser();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '');
    }
  }, [user]);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setMessage('Display name cannot be empty');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: displayName.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile save response:', data);
        setMessage('Profile updated successfully!');
        
        // Refresh user data in context to immediately reflect changes
        await refreshUser();
        
        // Update local state with the returned user data
        if (data.user) {
          console.log('Updating local state with:', data.user.name);
          setDisplayName(data.user.name || '');
        }
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('An error occurred while updating profile');
      console.error('Profile update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to sign in
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>
          
          {/* Profile Picture */}
          <div className="flex items-center gap-4 mb-6">
            {user.picture && (
              <img 
                src={user.picture} 
                alt={user.name || 'User'} 
                className="w-16 h-16 rounded-full border-2 border-white/20"
              />
            )}
            <div>
              <h2 className="text-xl text-white">{user.name || 'Anonymous'}</h2>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Display Name Editor */}
          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-white mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Enter your display name"
                maxLength={50}
              />
              <p className="text-xs text-gray-400 mt-1">
                This is how your name will appear throughout the site
              </p>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleSave}
                disabled={isSaving || !displayName.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>

            {/* Status Message */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('successfully') 
                  ? 'bg-green-900/30 border border-green-500/30 text-green-300'
                  : 'bg-red-900/30 border border-red-500/30 text-red-300'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Account Linking Section */}
          <AccountLinkingSection user={user} />
        </div>
      </div>
    </div>
  );
}