'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserSummary {
  id: string;
  name?: string;
  picture?: string;
  email: string;
}

interface FollowListProps {
  userId: string;
  type: 'followers' | 'following';
  isVisible: boolean;
  onClose: () => void;
}

export default function FollowList({ userId, type, isVisible, onClose }: FollowListProps) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      fetchUsers();
    }
  }, [isVisible, userId, type]);

  const fetchUsers = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/users/${userId}/${type}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error('Failed to fetch', type);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching', type, error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[500px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold capitalize">{type}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-gray-600">Loading {type}...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {type} yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/user/${user.id}`}
                  onClick={onClose}
                  className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium mr-3 flex-shrink-0">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name || user.email}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {user.name || 'Anonymous User'}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {user.email}
                    </div>
                  </div>
                  
                  <div className="text-gray-400 ml-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}