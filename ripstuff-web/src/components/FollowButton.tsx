'use client';

import { useState, useEffect } from 'react';

interface FollowButtonProps {
  userId: string;
  initialFollowState?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ 
  userId, 
  initialFollowState = false, 
  onFollowChange 
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowState);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });

      if (response.ok) {
        const newFollowState = !isFollowing;
        setIsFollowing(newFollowState);
        onFollowChange?.(newFollowState);
      } else {
        const errorText = await response.text();
        console.error('Follow toggle failed:', errorText);
        
        // Show user-friendly error messages
        if (response.status === 401) {
          alert('Please log in to follow users');
        } else if (response.status === 400) {
          alert(errorText);
        } else {
          alert('Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 min-w-[100px] ${
        isFollowing
          ? 'bg-gray-200 text-gray-800 hover:bg-red-100 hover:text-red-700 hover:border-red-200 border border-gray-300'
          : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
          <span className="text-xs">Loading...</span>
        </div>
      ) : isFollowing ? (
        'Following'
      ) : (
        'Follow'
      )}
    </button>
  );
}