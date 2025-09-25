'use client';

import { useState } from 'react';

interface FacebookSignInButtonProps {
  onError: (error: string) => void;
}

export default function FacebookSignInButton({ onError }: FacebookSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    
    try {
      // Generate state parameter for CSRF protection
      const state = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
      
      // Store state in sessionStorage for verification
      sessionStorage.setItem('facebook_oauth_state', state);
      
      // Facebook OAuth parameters
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
        redirect_uri: `${window.location.origin}/api/auth/callback/facebook`,
        scope: 'public_profile,email',
        response_type: 'code',
        state: state,
      });

      // Redirect to Facebook OAuth
      const facebookUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
      window.location.href = facebookUrl;
      
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      onError('Failed to initiate Facebook sign-in');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFacebookSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )}
      {isLoading ? 'Signing in...' : 'Sign in with Facebook'}
    </button>
  );
}