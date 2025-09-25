'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function FacebookSignInButton({ onError }: { onError: (error: string) => void }) {
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

function GoogleSignInButton({ onError }: { onError: (error: string) => void }) {
  const handleGoogleSignIn = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === 'your-google-client-id-here') {
      onError('Google OAuth client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment.');
      return;
    }

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/api/auth/callback/google`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
    });

    // Redirect to Google OAuth
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Sign in with Google
    </button>
  );
}

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const searchParams = useSearchParams();

  // Handle OAuth errors from URL params
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      switch (urlError) {
        case 'oauth_error':
          setError('OAuth authentication failed');
          break;
        case 'no_code':
          setError('No authorization code received');
          break;
        case 'token_error':
          setError('Failed to exchange token');
          break;
        case 'user_info_error':
          setError('Failed to get user information');
          break;
        case 'server_error':
          setError('Server error during sign-in');
          break;
        default:
          setError('Sign-in failed');
      }
    }
  }, [searchParams]);

  const handleGoogleError = (error: string) => {
    setError(error);
    setIsLoading(false);
  };

  // Facebook sign-in handler  
  const handleFacebookError = (error: string) => {
    setError(error);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <span role="img" aria-hidden className="text-6xl mb-4 block">🪦</span>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to the Graveyard</h1>
          <p className="text-gray-300 mb-8">Choose how you'd like to sign in</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Google Sign-In */}
          <GoogleSignInButton onError={handleGoogleError} />

          {/* Facebook Sign-In */}
          <FacebookSignInButton onError={handleFacebookError} />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            By signing in, you agree to memorialize things with honor and a wink
          </p>
        </div>
      </div>
    </div>
  );
}