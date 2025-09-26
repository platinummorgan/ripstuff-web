'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';

import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { UserManagementRow } from "@/components/moderation/UserManagementRow";

type SearchParams = {
  query?: string;
  status?: string;
  cursor?: string;
};

interface UserManagementContentProps {
  searchParams: SearchParams;
}

export function UserManagementContent({ searchParams }: UserManagementContentProps) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.query || '');

  const loadUsers = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);

    const query = new URLSearchParams();
    query.set("limit", "25");
    if (params.query) query.set("query", params.query);
    if (params.status) query.set("status", params.status);
    if (params.cursor) query.set("cursor", params.cursor);

    try {
      const res = await fetch(`/api/moderation/users?${query.toString()}`, {
        cache: "no-store",
      });

      if (res.status === 401) {
        setError("UNAUTHORIZED");
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        setError("REQUEST_FAILED");
        setIsLoading(false);
        return;
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("REQUEST_FAILED");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(searchParams);
  }, [searchParams]);

  const buildHref = (current: SearchParams, overrides: Partial<SearchParams>) => {
    const params = new URLSearchParams();
    const nextQuery = overrides.query ?? current.query;
    const nextStatus = overrides.status ?? current.status;

    if (nextQuery) params.set("query", nextQuery);
    if (nextStatus) params.set("status", nextStatus);
    if (overrides.cursor) params.set("cursor", overrides.cursor);

    const search = params.toString();
    return search ? `/moderation/users?${search}` : "/moderation/users";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = buildHref(searchParams, { query: searchQuery, cursor: undefined });
  };

  const refreshData = () => {
    loadUsers(searchParams);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-16">
        <SectionHeader
          title="Loading user data..."
          description="Please wait while we fetch the latest user information."
        />
      </div>
    );
  }

  if (error === "UNAUTHORIZED") {
    return (
      <div className="space-y-6 py-16">
        <SectionHeader
          title="Authentication expired"
          description="Please refresh the page and log in again."
        />
        <div className="text-center">
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 py-16">
        <SectionHeader
          title="Something went wrong"
          description="We couldn't load the user data. Please try again."
        />
        <div className="text-center">
          <Button onClick={() => loadUsers(searchParams)}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 py-16">
        <SectionHeader
          title="No data available"
          description="Unable to load user data."
        />
      </div>
    );
  }

  const activeStatus = searchParams.status || "all";

  const statusFilters = [
    { label: "All Users", value: undefined },
    { label: "Active", value: "active" },
    { label: "Banned", value: "banned" },
    { label: "Suspended", value: "suspended" },
  ];

  return (
    <div className="space-y-10 pb-16">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          eyebrow="User Management"
          title="User accounts and moderation"
          description="Monitor user activity, manage bans, and control account access."
        />
        <div className="flex gap-2">
          <Button onClick={refreshData}>
            Refresh
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/moderation">Back to Moderation</Link>
          </Button>
        </div>
      </div>

      {/* User Stats Dashboard */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">👥</div>
              <div>
                <div className="text-xl font-bold text-white">{data.items.length}</div>
                <div className="text-xs text-green-300">Total Users</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <div className="text-xl font-bold text-white">
                  {data.items.filter((user: any) => !user.isBanned && !user.suspendedUntil).length}
                </div>
                <div className="text-xs text-blue-300">Active Users</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🚫</div>
              <div>
                <div className="text-xl font-bold text-white">
                  {data.items.filter((user: any) => user.isBanned).length}
                </div>
                <div className="text-xs text-red-300">Banned Users</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⏸️</div>
              <div>
                <div className="text-xl font-bold text-white">
                  {data.items.filter((user: any) => user.suspendedUntil && new Date(user.suspendedUntil) > new Date()).length}
                </div>
                <div className="text-xs text-yellow-300">Suspended Users</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="space-y-4 p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <span className="text-sm font-medium text-purple-200">🔍 Search Users:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, name, or device hash..."
            className="flex-1 px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
          <Button type="submit">
            Search
          </Button>
          {searchParams.query && (
            <Button variant="ghost" asChild>
              <Link href={buildHref(searchParams, { query: undefined, cursor: undefined })}>
                Clear
              </Link>
            </Button>
          )}
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-purple-200">🎯 Filter by Status:</span>
          <div className="flex gap-2">
            {statusFilters.map((filter) => {
              const value = filter.value || "all";
              const isActive = value === activeStatus;
              return (
                <Button key={filter.label} asChild variant={isActive ? "primary" : "ghost"}>
                  <Link href={buildHref(searchParams, { status: filter.value, cursor: undefined })}>
                    {filter.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="overflow-x-auto rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(10,14,25,0.82)]">
        {data.items.length === 0 ? (
          <div className="p-10 text-center text-sm text-[var(--muted)]">No users match these criteria.</div>
        ) : (
          <table className="w-full min-w-[1200px] text-sm text-[var(--muted)]">
            <thead>
              <tr className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-purple-500/20">
                <th className="px-4 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wide w-1/3">
                  👤 User Details
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wide w-1/8">
                  📊 Activity
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-purple-200 uppercase tracking-wide w-1/8">
                  🔒 Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wide w-1/8">
                  📅 Joined
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wide w-1/4">
                  ⚡ Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((user: any) => (
                <UserManagementRow key={user.id} user={user} onUpdate={refreshData} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data.nextCursor && (
        <div className="flex justify-center">
          <Button asChild variant="secondary">
            <Link href={buildHref(searchParams, { cursor: data.nextCursor })}>Load more</Link>
          </Button>
        </div>
      )}
    </div>
  );
}