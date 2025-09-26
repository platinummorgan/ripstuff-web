'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';

import { Button } from "@/components/Button";
import { ModerationTableRow } from "@/components/moderation/ModerationTableRow";
import { SectionHeader } from "@/components/SectionHeader";
import { moderationQueueResponse } from "@/lib/validation";

type SearchParams = {
  status?: string;
  reported?: string;
  cursor?: string;
};

interface ModerationContentProps {
  searchParams: SearchParams;
}

export function ModerationContent({ searchParams }: ModerationContentProps) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadQueue = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);

    const query = new URLSearchParams();
    query.set("limit", "25");
    if (params.status) query.set("status", params.status);
    if (params.reported) query.set("reported", params.reported);
    if (params.cursor) query.set("cursor", params.cursor);

    try {
      const res = await fetch(`/api/moderation/graves?${query.toString()}`, {
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
      const parsedData = moderationQueueResponse.parse(json);
      setData(parsedData);
    } catch (err) {
      setError("REQUEST_FAILED");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue(searchParams);
  }, [searchParams]);

  const buildHref = (current: SearchParams, overrides: Partial<SearchParams>) => {
    const params = new URLSearchParams();
    const nextStatus = overrides.status ?? current.status;
    const nextReported = overrides.reported ?? current.reported;

    if (nextStatus) params.set("status", nextStatus);
    if (nextReported) params.set("reported", nextReported);
    if (overrides.cursor) params.set("cursor", overrides.cursor);

    const search = params.toString();
    return search ? `/moderation?${search}` : "/moderation";
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-16">
        <SectionHeader
          title="Loading moderation queue..."
          description="Please wait while we fetch the latest data."
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
          description="We couldn't load the moderation queue. Please try again."
        />
        <div className="text-center">
          <Button onClick={() => loadQueue(searchParams)}>
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
          description="Unable to load moderation queue."
        />
      </div>
    );
  }

  const activeStatus = searchParams.status ?? "ALL";
  const activeReported = searchParams.reported ?? "all";

  const statusFilters = [
    { label: "All", value: undefined },
    { label: "Pending", value: "PENDING" },
    { label: "Hidden", value: "HIDDEN" },
    { label: "Approved", value: "APPROVED" },
  ];

  const reportedFilters = [
    { label: "All", value: undefined },
    { label: "Reported", value: "true" },
    { label: "Clean", value: "false" },
  ];

  return (
    <div className="space-y-10 pb-16">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          eyebrow="Moderator"
          title="Pending and reported graves"
          description="Review the latest submissions and community reports."
        />
        <div className="flex gap-2">
          <Button onClick={() => loadQueue(searchParams)}>
            Refresh
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/feed">Back to feed</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-[0.3em] text-[var(--muted)]">Status</span>
          {statusFilters.map((filter) => {
            const value = filter.value ?? "ALL";
            const isActive = value === activeStatus;
            return (
              <Button key={filter.label} asChild variant={isActive ? "primary" : "ghost"}>
                <Link href={buildHref(searchParams, { status: filter.value, cursor: undefined })}>{filter.label}</Link>
              </Button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-[0.3em] text-[var(--muted)]">Reports</span>
          {reportedFilters.map((filter) => {
            const value = filter.value ?? "all";
            const isActive = value === activeReported;
            return (
              <Button key={filter.label} asChild variant={isActive ? "primary" : "ghost"}>
                <Link href={buildHref(searchParams, { reported: filter.value, cursor: undefined })}>{filter.label}</Link>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(10,14,25,0.82)]">
        {data.items.length === 0 ? (
          <div className="p-10 text-center text-sm text-[var(--muted)]">No graves match these filters.</div>
        ) : (
          <table className="w-full min-w-[1200px] text-sm text-[var(--muted)]">
            <thead>
              <tr className="bg-[rgba(142,123,255,0.08)] text-left uppercase tracking-[0.3em] text-xs">
                <th className="px-4 py-3 text-[var(--muted)] w-2/5">Title</th>
                <th className="px-4 py-3 text-[var(--muted)] w-1/6">Status</th>
                <th className="px-4 py-3 text-[var(--muted)] w-1/12">Reports</th>
                <th className="px-4 py-3 text-[var(--muted)] w-1/6">Created</th>
                <th className="px-4 py-3 text-[var(--muted)] w-1/4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item: any) => (
                <ModerationTableRow key={item.id} item={item} />
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