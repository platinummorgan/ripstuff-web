'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/components/UserContext';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';

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
        </div>
      </div>
    </div>
  );
}