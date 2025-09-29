"use client";

import { useState, useCallback } from "react";
import { GraveCard } from "@/components/GraveCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SearchAndFilter, type SearchFilters } from "@/components/SearchAndFilter";
import type { FeedItem } from "@/lib/validation";

interface SearchableUserFeedProps {
  initialItems: FeedItem[];
  userId: string;
  className?: string;
}

export function SearchableUserFeed({ initialItems, userId, className = "" }: SearchableUserFeedProps) {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Build query parameters from filters, including user filter
  const buildQueryParams = useCallback((searchFilters: SearchFilters) => {
    const params = new URLSearchParams();
    params.set('limit', '20');
    params.set('userId', userId); // Filter by this specific user
    
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
  }, [userId]);

  // Perform search with current filters
  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryParams(searchFilters);
      const response = await fetch(`/api/feed?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to search user memorials');
      }
      
      const data: { items: FeedItem[]; nextCursor: string | null } = await response.json();
      
      setItems(data.items);
      setSearchPerformed(true);
      
    } catch (err) {
      console.error('User feed search error:', err);
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
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter Interface */}
      <SearchAndFilter 
        onFiltersChange={handleFiltersChange}
        initialFilters={{ sortBy: 'newest' }}
      />

      {/* Results Header */}
      {showingResults && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--muted)]">
            {loading ? (
              "Searching memorials..."
            ) : (
              <>
                {displayItems.length > 0 ? (
                  <>
                    Showing {displayItems.length} memorial{displayItems.length !== 1 ? 's' : ''}
                    {hasActiveFilters && " matching criteria"}
                  </>
                ) : (
                  hasActiveFilters ? "No memorials match criteria" : "No memorials found"
                )}
              </>
            )}
          </div>
          
          {hasActiveFilters && displayItems.length > 0 && (
            <div className="text-xs text-[var(--accent)]">
              🔍 Filtered results
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner label="Searching memorials..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && displayItems.length === 0 && !error && (
        <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-8 text-center">
          {hasActiveFilters ? (
            <>
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-white mb-2">No memorials found</h3>
              <p className="text-sm text-[var(--muted)] mb-4">
                Try adjusting your search criteria or filters
              </p>
              <button 
                onClick={() => setFilters(null)}
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Show all memorials
              </button>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">💀</div>
              <h3 className="text-lg font-medium text-white mb-2">No public memorials</h3>
              <p className="text-sm text-[var(--muted)]">
                This user hasn't created any public memorials yet
              </p>
            </>
          )}
        </div>
      )}

      {/* Results Grid */}
      {!loading && displayItems.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item, index) => (
            <GraveCard 
              key={`${item.id}-${item.slug}-${index}`} 
              grave={item} 
            />
          ))}
        </div>
      )}

      {/* Results Footer */}
      {!loading && displayItems.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--muted)]">
            Showing {displayItems.length} of this user's memorials
            {hasActiveFilters && " • Filtered results"}
          </p>
        </div>
      )}
    </div>
  );
}