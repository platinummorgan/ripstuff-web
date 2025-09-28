"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VotingState {
  roastCount: number;
  eulogyCount: number;
}

interface VotingContextType {
  votingState: VotingState;
  updateVotingState: (newState: VotingState) => void;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export function VotingProvider({ 
  children, 
  initialRoastCount, 
  initialEulogyCount 
}: { 
  children: ReactNode;
  initialRoastCount: number;
  initialEulogyCount: number;
}) {
  const [votingState, setVotingState] = useState<VotingState>({
    roastCount: initialRoastCount,
    eulogyCount: initialEulogyCount,
  });

  const updateVotingState = (newState: VotingState) => {
    setVotingState(newState);
  };

  return (
    <VotingContext.Provider value={{ votingState, updateVotingState }}>
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
}