"use client";

import { useState, useCallback, useEffect } from "react";
import { GraveCard } from "@/components/GraveCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SearchAndFilter, type SearchFilters } from "@/components/SearchAndFilter";
import type { FeedItem } from "@/lib/validation";

interface SearchableFeedListProps {
  initialItems?: FeedItem[];
  initialFilters?: Partial<SearchFilters>;
  className?: string;
}

interface ListResponse {
  items: FeedItem[];
  nextCursor: string | null;
}

export function SearchableFeedList({ 
  initialItems = [], 
  initialFilters = {},
  className = "" 
}: SearchableFeedListProps) {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Build query parameters from filters
  const buildQueryParams = useCallback((searchFilters: SearchFilters, cursorParam?: string, offsetParam?: number) => {
    const params = new URLSearchParams();
    params.set('limit', '12');
    
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

    // Determine if we have active filters (affects pagination method)
    const hasActiveFilters = searchFilters.query || 
                           searchFilters.category !== 'ALL' || 
                           searchFilters.sortBy !== 'newest' || 
                           searchFilters.timeRange !== 'all' || 
                           searchFilters.hasPhoto !== null || 
                           searchFilters.minReactions > 0;
    
    if (hasActiveFilters && offsetParam !== undefined) {
      params.set('offset', offsetParam.toString());
    } else if (cursorParam) {
      params.set('cursor', cursorParam);
    }
    
    return params.toString();
  }, []);

  // Perform search with current filters
  const performSearch = useCallback(async (searchFilters: SearchFilters, isLoadMore = false) => {
    console.log('[SearchableFeedList] performSearch called:', { searchFilters, isLoadMore });
    setLoading(true);
    setError(null);

    try {
      // Determine if we have active filters
      const hasActiveFilters = searchFilters.query || 
                             searchFilters.category !== 'ALL' || 
                             searchFilters.sortBy !== 'newest' || 
                             searchFilters.timeRange !== 'all' || 
                             searchFilters.hasPhoto !== null || 
                             searchFilters.minReactions > 0;

      let queryParams: string;
      if (hasActiveFilters && isLoadMore) {
        // Use offset-based pagination for filtered results
        queryParams = buildQueryParams(searchFilters, undefined, offset);
      } else if (isLoadMore && cursor) {
        // Use cursor-based pagination for simple queries
        queryParams = buildQueryParams(searchFilters, cursor);
      } else {
        // New search - no pagination params
        queryParams = buildQueryParams(searchFilters);
      }

      const response = await fetch(`/api/feed?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to search memorials');
      }
      
      const data: ListResponse = await response.json();
      
      if (isLoadMore) {
        setItems(prev => [...prev, ...data.items]);
        if (hasActiveFilters) {
          setOffset(prev => prev + 12); // Increment offset by limit
        }
      } else {
        setItems(data.items);
        setSearchPerformed(true);
        setOffset(12); // Reset offset for new search
      }
      
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      if (!isLoadMore) {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [cursor, offset, buildQueryParams]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    console.log('[SearchableFeedList] Filter change triggered:', newFilters);
    
    setFilters(newFilters);
    setCursor(null); // Reset cursor for new search
    setOffset(0); // Reset offset for new search
    performSearch(newFilters, false);
  }, [performSearch]);

  // Load more items
  const loadMore = useCallback(() => {
    if (!loading && hasMore && filters) {
      performSearch(filters, true);
    }
  }, [loading, hasMore, filters, performSearch]);

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
        initialFilters={initialFilters}
      />

      {/* Results Section */}
      <div className="space-y-6">
        {/* Results Header */}
        {showingResults && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--muted)]">
              {loading ? (
                "Searching..."
              ) : (
                <>
                  {displayItems.length > 0 ? (
                    <>
                      Showing {displayItems.length} memorial{displayItems.length !== 1 ? 's' : ''}
                      {hasActiveFilters && " matching your criteria"}
                    </>
                  ) : (
                    hasActiveFilters ? "No memorials match your criteria" : "No memorials found"
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
        {loading && !items.length && (
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
                  onClick={() => {
                    console.log('[SearchableFeedList] Clear all filters clicked');
                    setFilters(null);
                    setSearchPerformed(false);
                    setCursor(null);
                    setOffset(0);
                    setLoading(false);
                    setError(null);
                  }}
                  className="text-sm text-[var(--accent)] hover:underline"
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <div className="text-4xl mb-4">💀</div>
                <h3 className="text-lg font-medium text-white mb-2">No memorials yet</h3>
                <p className="text-sm text-[var(--muted)]">
                  Be the first to create a memorial for your departed items
                </p>
              </>
            )}
          </div>
        )}

        {/* Results Grid */}
        {displayItems.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {displayItems.map((item, index) => (
              <GraveCard 
                key={`${item.id}-${item.slug}-${index}`} 
                grave={item} 
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {showingResults && hasMore && !loading && displayItems.length > 0 && (
          <div className="flex justify-center pt-6">
            <button
              onClick={loadMore}
              disabled={loading}
              className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-6 py-3 text-sm text-white transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(154,230,180,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner label="" />
                  Loading...
                </span>
              ) : (
                "Load More Memorials"
              )}
            </button>
          </div>
        )}

        {/* End of Results */}
        {showingResults && !hasMore && displayItems.length > 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--muted)]">
              You've reached the end of the graveyard 💀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}