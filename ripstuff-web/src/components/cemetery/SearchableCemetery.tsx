"use client";

import { useState, useCallback, useEffect } from "react";
import { HeadstoneCard } from "@/components/HeadstoneCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SearchAndFilter, type SearchFilters } from "@/components/SearchAndFilter";
import type { FeedItem } from "@/lib/validation";

interface SearchableCemeteryProps {
  initialItems: (FeedItem & { keeper: string })[];
  className?: string;
}

interface CemeteryResponse {
  items: (FeedItem & { keeper: string })[];
  nextCursor: string | null;
}

export function SearchableCemetery({ initialItems, className = "" }: SearchableCemeteryProps) {
  const [items, setItems] = useState<(FeedItem & { keeper: string })[]>(initialItems);
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Build query parameters from filters
  const buildQueryParams = useCallback((searchFilters: SearchFilters) => {
    const params = new URLSearchParams();
    params.set('limit', '60'); // More items for cemetery view
    
    if (searchFilters.query) {
      params.set('search', searchFilters.query);
    }
    
    if (searchFilters.category !== 'ALL') {
      params.set('category', searchFilters.category);
    }
    
    if (searchFilters.sortBy !== 'newest') {
      params.set('sortBy', searchFilters.sortBy);
    }
    
    if (searchFilters.timeRange !== 'all') {
      params.set('timeRange', searchFilters.timeRange);
    }
    
    if (searchFilters.hasPhoto !== null) {
      params.set('hasPhoto', searchFilters.hasPhoto.toString());
    }
    
    if (searchFilters.minReactions > 0) {
      params.set('minReactions', searchFilters.minReactions.toString());
    }
    
    return params.toString();
  }, []);

  // Transform API response to match cemetery format
  const transformApiResponse = (apiItems: FeedItem[]): (FeedItem & { keeper: string })[] => {
    return apiItems.map(item => ({
      ...item,
      keeper: `Keeper ${item.id.slice(0, 8)}` // Simulate keeper info
    }));
  };

  // Perform search with current filters
  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryParams(searchFilters);
      const response = await fetch(`/api/feed?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to search cemetery');
      }
      
      const data: { items: FeedItem[]; nextCursor: string | null } = await response.json();
      const transformedItems = transformApiResponse(data.items);
      
      setItems(transformedItems);
      setSearchPerformed(true);
      
    } catch (err) {
      console.error('Cemetery search error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    performSearch(newFilters);
  }, [performSearch]);

  // Show initial content or search results
  const showingResults = searchPerformed || filters;
  const displayItems = showingResults ? items : initialItems;
  
  const hasActiveFilters = filters && (
    filters.query !== "" ||
    filters.category !== "ALL" ||
    filters.sortBy !== "newest" ||
    filters.timeRange !== "all" ||
    filters.hasPhoto !== null ||
    filters.minReactions > 0
  );

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Search and Filter Interface */}
      <SearchAndFilter 
        onFiltersChange={handleFiltersChange}
        initialFilters={{ sortBy: 'newest' }}
        className="max-w-4xl mx-auto"
      />

      {/* Results Section */}
      <div className="space-y-6">
        {/* Results Header */}
        {showingResults && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--muted)]">
              {loading ? (
                "Searching cemetery..."
              ) : (
                <>
                  {displayItems.length > 0 ? (
                    <>
                      {displayItems.length} grave{displayItems.length !== 1 ? 's' : ''}
                      {hasActiveFilters && " found"}
                    </>
                  ) : (
                    hasActiveFilters ? "No graves match your criteria" : "No graves found"
                  )}
                </>
              )}
            </div>
            
            {hasActiveFilters && displayItems.length > 0 && (
              <div className="text-xs text-[var(--accent)]">
                🔍 Filtered cemetery
              </div>
            )}
          </div>
        )}

        {/* Cemetery Container */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(80,120,80,0.14),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to bottom, rgba(40,60,50,0.20), rgba(40,60,50,0.20) 16px, rgba(20,30,30,0.12) 16px, rgba(20,30,30,0.12) 64px)]" />
          
          {/* Error State */}
          {error && (
            <div className="relative z-10 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="relative z-10 flex justify-center py-12">
              <LoadingSpinner label="Searching cemetery..." />
            </div>
          )}

          {/* Empty State */}
          {!loading && displayItems.length === 0 && !error && (
            <div className="relative z-10 text-center py-12">
              {hasActiveFilters ? (
                <>
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-white mb-2">No graves found</h3>
                  <p className="text-sm text-[var(--muted)] mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <button 
                    onClick={() => setFilters(null)}
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    Show all graves
                  </button>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-4">💀</div>
                  <p className="text-sm text-[var(--muted)]">No graves in this cemetery yet.</p>
                </>
              )}
            </div>
          )}

          {/* Cemetery Grid */}
          {!loading && displayItems.length > 0 && (
            <div className="relative z-10 grid grid-cols-3 gap-5 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
              {displayItems.map((grave, i) => (
                <div 
                  key={grave.id} 
                  style={{ transform: `rotate(${((i % 7) - 3) * 0.5}deg)` }} 
                  className="scale-[1.08] transition-transform duration-200 hover:scale-[1.15]"
                >
                  <HeadstoneCard grave={grave} />
                  <p className="mt-1 text-center text-[10px] text-[var(--muted)]">{grave.keeper}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cemetery Stats */}
        {!loading && displayItems.length > 0 && (
          <div className="flex justify-center">
            <div className="rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-4 py-2">
              <p className="text-xs text-[var(--muted)]">
                {displayItems.length} memorial{displayItems.length !== 1 ? 's' : ''} in this view
                {hasActiveFilters && " • Filtered results"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}