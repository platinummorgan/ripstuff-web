"use client";

import { useState, useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { useVoting } from "@/components/VotingContext";

interface RoastEulogyVotingProps {
  graveId: string;
  graveSlug: string;
}

interface VotingState {
  sympathyCount: number; // Maps to eulogyCount from API
  roastCount: number;
  userVote: 'EULOGY' | 'ROAST' | null; // API uses EULOGY for sympathy votes
  loading: boolean;
  error: string | null;
}

export function RoastEulogyVoting({ graveId, graveSlug }: RoastEulogyVotingProps) {
  const { votingState, updateVotingState } = useVoting();
  const [state, setState] = useState<VotingState>({
    sympathyCount: votingState.eulogyCount,
    roastCount: votingState.roastCount,
    userVote: null,
    loading: true,
    error: null,
  });

  // Fetch current vote counts and user's existing vote
  useEffect(() => {
    async function fetchVotingData() {
      try {
        const response = await fetch(`/api/graves/${graveSlug}/roast-eulogy`);
        if (response.ok) {
          const data = await response.json();
          setState(prev => ({
            ...prev,
            sympathyCount: data.eulogyCount || 0, // API returns eulogyCount, display as sympathy
            roastCount: data.roastCount || 0,
            userVote: data.userVote,
            loading: false,
          }));
        } else {
          setState(prev => ({ ...prev, loading: false, error: 'Failed to load voting data' }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, loading: false, error: 'Failed to load voting data' }));
      }
    }

    fetchVotingData();
  }, [graveSlug]);

  async function handleVote(type: 'EULOGY' | 'ROAST') {
    const isCurrentVote = state.userVote === type;
    const action = isCurrentVote ? 'REMOVE' : 'ADD';
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/graves/${graveSlug}/roast-eulogy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, action }),
      });

      if (response.ok) {
        const data = await response.json();
        const newVotingState = {
          roastCount: data.roastCount || 0,
          eulogyCount: data.eulogyCount || 0,
        };
        
        // Update both local state and global voting context
        setState(prev => ({
          ...prev,
          sympathyCount: data.eulogyCount || 0, // Map eulogyCount to sympathy display
          roastCount: data.roastCount || 0,
          userVote: isCurrentVote ? null : type,
          loading: false,
        }));
        
        // Update the shared voting state so Death Certificate updates immediately
        updateVotingState(newVotingState);

        // Track analytics
        analytics.trackRoastEulogyVote(graveId, type === 'EULOGY' ? 'eulogy' : 'roast');
      } else {
        const errorData = await response.json();
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorData.message || 'Failed to vote' 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to vote' 
      }));
    }
  }

  const totalVotes = state.sympathyCount + state.roastCount;
  const roastPercentage = totalVotes > 0 ? Math.round((state.roastCount / totalVotes) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Voting Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => handleVote('EULOGY')}
          disabled={state.loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all ${
            state.userVote === 'EULOGY'
              ? 'border-green-500 bg-green-500/20 text-green-300'
              : 'border-green-600/50 bg-green-900/20 text-green-200 hover:border-green-500 hover:bg-green-500/10'
          } ${state.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span>❤️</span>
          <span>Condolences</span>
          <span className="bg-green-600/30 px-2 py-1 rounded-full text-xs">
            {state.sympathyCount}
          </span>
        </button>

        <button
          onClick={() => handleVote('ROAST')}
          disabled={state.loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all ${
            state.userVote === 'ROAST'
              ? 'border-red-500 bg-red-500/20 text-red-300'
              : 'border-red-600/50 bg-red-900/20 text-red-200 hover:border-red-500 hover:bg-red-500/10'
          } ${state.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span>🔥</span>
          <span>Roasts</span>
          <span className="bg-red-600/30 px-2 py-1 rounded-full text-xs">
            {state.roastCount}
          </span>
        </button>
      </div>

      {/* Vote Summary */}
      {totalVotes > 0 && (
        <div className="text-center text-sm text-gray-400">
          Condolences: {state.sympathyCount} • Roasts: {state.roastCount} → {roastPercentage}% roasted
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="text-center text-sm text-red-400">
          {state.error}
        </div>
      )}
    </div>
  );
}