'use client';

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/UserContext";
import { Button } from "@/components/Button";

export function SiteHeader() {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { user, isLoading, signOut } = useUser();

  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(4,7,15,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-[0.3em] uppercase text-[var(--muted)]">
          <span role="img" aria-hidden>
            🕯️
          </span>
          RipStuff
        </Link>
        
        <nav className="flex items-center gap-2 sm:gap-3 text-sm">
          {/* Primary Navigation */}
          <Link className="text-[var(--muted)] hover:text-white" href="/feed">
            Feed
          </Link>
          <Link className="text-[var(--muted)] hover:text-white whitespace-nowrap" href="/trending">
            🔥 <span className="hidden sm:inline">Trending</span>
          </Link>
          <Link className="text-[var(--muted)] hover:text-white" href="/overworld">
            Map
          </Link>
          
          {/* More Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="text-[var(--muted)] hover:text-white flex items-center gap-1"
            >
              More
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0B1123] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-xl z-50">
                <div className="py-2">
                  <Link 
                    href="/my-graveyard" 
                    className="block px-4 py-2 text-sm text-[var(--muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    My Graveyard
                  </Link>
                  <Link 
                    href="/analytics" 
                    className="block px-4 py-2 text-sm text-[var(--muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    📊 Analytics
                  </Link>
                  <Link 
                    href="/death-reports" 
                    className="block px-4 py-2 text-sm text-[var(--muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    📈 Death Reports
                  </Link>
                  <hr className="border-[rgba(255,255,255,0.08)] my-2" />
                  <Link 
                    href="/guidelines" 
                    className="block px-4 py-2 text-sm text-[var(--muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    Guidelines
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* User Authentication */}
          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  {user.picture && (
                    <img 
                      src={user.picture} 
                      alt={user.name || 'User'} 
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-[var(--muted)] text-xs hidden sm:block">
                    <Link href="/profile" className="text-white font-medium hover:text-blue-300">
                      {user.name || user.email}
                    </Link>
                  </span>
                  <button
                    onClick={signOut}
                    className="text-[var(--muted)] hover:text-white text-xs"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link 
                  href="/signin" 
                  className="text-[var(--muted)] hover:text-white"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
          
          <Button asChild>
            <Link href="/bury">Bury an Item</Link>
          </Button>
        </nav>
      </div>
      
      {/* Backdrop to close dropdown */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMoreMenu(false)}
        />
      )}
    </header>
  );
}
