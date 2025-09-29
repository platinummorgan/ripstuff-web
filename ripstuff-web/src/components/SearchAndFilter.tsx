"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { GraveCategory } from "@prisma/client";

// Simple SVG Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

interface SearchAndFilterProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  className?: string;
}

export interface SearchFilters {
  query: string;
  category: GraveCategory | "ALL";
  sortBy: "newest" | "oldest" | "popular" | "controversial" | "alphabetical";
  timeRange: "all" | "today" | "week" | "month" | "year";
  hasPhoto: boolean | null;
  minReactions: number;
}

const DEFAULT_FILTERS: SearchFilters = {
  query: "",
  category: "ALL",
  sortBy: "newest",
  timeRange: "all",
  hasPhoto: null,
  minReactions: 0,
};

const CATEGORY_OPTIONS: Array<{ value: GraveCategory | "ALL"; label: string; icon: string }> = [
  { value: "ALL", label: "All Categories", icon: "🏷️" },
  { value: "TECH_GADGETS", label: "Tech & Gadgets", icon: "📱" },
  { value: "KITCHEN_FOOD", label: "Kitchen & Food", icon: "🍽️" },
  { value: "CLOTHING_LAUNDRY", label: "Clothing & Laundry", icon: "👕" },
  { value: "TOYS_GAMES", label: "Toys & Games", icon: "🎮" },
  { value: "CAR_TOOLS", label: "Car & Tools", icon: "🔧" },
  { value: "PETS_CHEWABLES", label: "Pet Items", icon: "🐕" },
  { value: "OUTDOORS_ACCIDENTS", label: "Outdoor Items", icon: "🏕️" },
  { value: "MISC", label: "Miscellaneous", icon: "📦" },
];

const SORT_OPTIONS = [
  { value: "newest" as const, label: "Newest First", icon: "⬇️" },
  { value: "oldest" as const, label: "Oldest First", icon: "⬆️" },
  { value: "popular" as const, label: "Most Popular", icon: "❤️" },
  { value: "controversial" as const, label: "Most Controversial", icon: "🔥" },
  { value: "alphabetical" as const, label: "A to Z", icon: "🔤" },
];

const TIME_RANGES = [
  { value: "all" as const, label: "All Time" },
  { value: "today" as const, label: "Today" },
  { value: "week" as const, label: "This Week" },
  { value: "month" as const, label: "This Month" },
  { value: "year" as const, label: "This Year" },
];

export function SearchAndFilter({ onFiltersChange, initialFilters, className = "" }: SearchAndFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Only trigger onChange after user interaction, not on initial render
  useEffect(() => {
    if (hasUserInteracted) {
      console.log('[SearchAndFilter] Filter change triggered:', filters);
      onFiltersChange(filters);
    }
  }, [filters, hasUserInteracted]); // Remove onFiltersChange from deps to prevent infinite loop

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setHasUserInteracted(true);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    console.log('[SearchAndFilter] Resetting filters');
    
    // Clear any pending debounced calls
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Reset filters immediately without debounce
    setShowAdvanced(false);
    setFilters(DEFAULT_FILTERS);
    
    // Trigger immediate change
    onFiltersChange(DEFAULT_FILTERS);
  };

  const hasActiveFilters = () => {
    return (
      filters.query !== "" ||
      filters.category !== "ALL" ||
      filters.sortBy !== "newest" ||
      filters.timeRange !== "all" ||
      filters.hasPhoto !== null ||
      filters.minReactions > 0
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className={`relative rounded-xl border transition-all duration-200 ${
          searchFocused 
            ? 'border-[rgba(154,230,180,0.5)] bg-[rgba(154,230,180,0.05)]' 
            : 'border-[var(--border)] bg-[rgba(255,255,255,0.03)]'
        }`}>
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search memorials by title, epitaph, or cause of death..."
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-transparent py-3 pl-11 pr-4 text-sm text-white placeholder:text-[var(--muted)] focus:outline-none"
          />
          {filters.query && (
            <button
              onClick={() => updateFilter("query", "")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-white"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => updateFilter("category", e.target.value as GraveCategory | "ALL")}
          className="rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-white focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
        >
          {CATEGORY_OPTIONS.map(option => (
            <option key={option.value} value={option.value} className="bg-[#0B1123] text-white">
              {option.icon} {option.label}
            </option>
          ))}
        </select>

        {/* Sort By */}
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter("sortBy", e.target.value as SearchFilters["sortBy"])}
          className="rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-white focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value} className="bg-[#0B1123] text-white">
              {option.icon} {option.label}
            </option>
          ))}
        </select>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
            showAdvanced || hasActiveFilters()
              ? 'border-[rgba(154,230,180,0.5)] bg-[rgba(154,230,180,0.1)] text-[var(--accent)]'
              : 'border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-[var(--muted)] hover:text-white'
          }`}
        >
          <FilterIcon className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters() && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-xs text-black font-medium">
              !
            </span>
          )}
        </button>

        {/* Reset Button */}
        {hasActiveFilters() && (
          <button
            onClick={resetFilters}
            className="text-sm text-[var(--muted)] hover:text-white transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-4 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-medium text-white">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Time Range */}
            <div>
              <label className="block text-xs text-[var(--muted)] mb-2">Time Range</label>
              <select
                value={filters.timeRange}
                onChange={(e) => updateFilter("timeRange", e.target.value as SearchFilters["timeRange"])}
                className="w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-white focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              >
                {TIME_RANGES.map(option => (
                  <option key={option.value} value={option.value} className="bg-[#0B1123] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Photo Filter */}
            <div>
              <label className="block text-xs text-[var(--muted)] mb-2">Photo Status</label>
              <select
                value={filters.hasPhoto === null ? "all" : filters.hasPhoto ? "with" : "without"}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFilter("hasPhoto", value === "all" ? null : value === "with");
                }}
                className="w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-white focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              >
                <option value="all" className="bg-[#0B1123] text-white">All Memorials</option>
                <option value="with" className="bg-[#0B1123] text-white">📷 With Photo</option>
                <option value="without" className="bg-[#0B1123] text-white">📝 Text Only</option>
              </select>
            </div>

            {/* Minimum Reactions */}
            <div>
              <label className="block text-xs text-[var(--muted)] mb-2">Min. Reactions</label>
              <select
                value={filters.minReactions}
                onChange={(e) => updateFilter("minReactions", parseInt(e.target.value))}
                className="w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-white focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              >
                <option value={0} className="bg-[#0B1123] text-white">Any Amount</option>
                <option value={1} className="bg-[#0B1123] text-white">1+ Reactions</option>
                <option value={5} className="bg-[#0B1123] text-white">5+ Reactions</option>
                <option value={10} className="bg-[#0B1123] text-white">10+ Reactions</option>
                <option value={25} className="bg-[#0B1123] text-white">25+ Reactions</option>
                <option value={50} className="bg-[#0B1123] text-white">50+ Reactions</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <div className="border-t border-[var(--border)] pt-3">
              <div className="text-xs text-[var(--muted)] mb-2">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                {filters.query && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(154,230,180,0.1)] px-2 py-1 text-xs text-[var(--accent)]">
                    🔍 "{filters.query}"
                  </span>
                )}
                {filters.category !== "ALL" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(154,230,180,0.1)] px-2 py-1 text-xs text-[var(--accent)]">
                    🏷️ {CATEGORY_OPTIONS.find(c => c.value === filters.category)?.label}
                  </span>
                )}
                {filters.sortBy !== "newest" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(154,230,180,0.1)] px-2 py-1 text-xs text-[var(--accent)]">
                    📊 {SORT_OPTIONS.find(s => s.value === filters.sortBy)?.label}
                  </span>
                )}
                {filters.timeRange !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(154,230,180,0.1)] px-2 py-1 text-xs text-[var(--accent)]">
                    📅 {TIME_RANGES.find(t => t.value === filters.timeRange)?.label}
                  </span>
                )}
                {filters.hasPhoto !== null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(154,230,180,0.1)] px-2 py-1 text-xs text-[var(--accent)]">
                    {filters.hasPhoto ? "📷 With Photo" : "📝 Text Only"}
                  </span>
                )}
                {filters.minReactions > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(154,230,180,0.1)] px-2 py-1 text-xs text-[var(--accent)]">
                    ❤️ {filters.minReactions}+ Reactions
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}