"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";

import { Button } from "@/components/Button";
import { ModerationRowActions } from "@/components/moderation/ModerationRowActions";
import { moderationQueueItem } from "@/lib/validation";
import { GraveStatus } from "@prisma/client";

type ModerationQueueItem = z.infer<typeof moderationQueueItem>;

interface ModerationTableRowProps {
  item: ModerationQueueItem;
}

export function ModerationTableRow({ item }: ModerationTableRowProps) {
  const [status, setStatus] = useState<GraveStatus>(item.status);
  const [featured, setFeatured] = useState(item.featured);
  const [reports, setReports] = useState(item.reports);
  const [actions, setActions] = useState(item.lastActions);

  return (
    <tr className="border-t border-[rgba(255,255,255,0.05)]">
      <td className="px-2 py-2 text-white max-w-0 w-2/5">
        <div className="font-medium text-white break-words text-sm leading-tight">{item.title}</div>
        <div className="text-[11px] text-[var(--muted)] break-words line-clamp-1 mt-0.5">{item.eulogyPreview}</div>
        <div className="mt-1 text-[10px] text-[var(--muted)] break-all opacity-70">Slug: {item.slug}</div>
        {actions.length > 0 && (
          <div className="mt-2 space-y-0.5 text-[9px] text-[var(--muted)]">
            <div className="uppercase tracking-[0.1em] opacity-80">Recent:</div>
            {actions.slice(0, 2).map((entry) => (
              <div key={entry.id} className="text-[var(--muted)] normal-case leading-tight">
                <span className="mr-1 font-semibold text-white text-[10px]">{entry.action}</span>
                <span className="text-[9px]">{new Date(entry.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </td>
      <td className="px-2 py-2">
        <div className="flex flex-col gap-1">
          <span className="rounded-full bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[10px] text-center w-fit">{status}</span>
          {featured && (
            <span className="rounded-full bg-[rgba(255,255,255,0.1)] px-2 py-0.5 text-[10px] text-[var(--muted)] w-fit">★</span>
          )}
        </div>
      </td>
      <td className="px-2 py-2 text-center">
        <span className={`rounded-full px-2 py-0.5 text-[10px] min-w-[20px] inline-block ${reports > 0 ? "bg-[rgba(255,145,164,0.18)] text-[#ff8097]" : "bg-[rgba(255,255,255,0.05)]"}`}>
          {reports}
        </span>
      </td>
      <td className="px-2 py-2 text-[10px] text-[var(--muted)]">
        <div>{new Date(item.createdAt).toLocaleDateString()}</div>
        <div className="opacity-70">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      </td>
      <td className="px-2 py-2 min-w-[250px]">
        <div className="space-y-1">
          <Button variant="ghost" asChild className="text-[10px] px-2 py-1 h-6">
            <Link href={`/grave/${item.slug}`} target="_blank">
              View
            </Link>
          </Button>
          <ModerationRowActions
            graveId={item.id}
            initialStatus={status}
            initialFeatured={featured}
            initialReports={reports}
            onChange={({ status: nextStatus, featured: nextFeatured, reports: nextReports, action, reason }) => {
              setStatus(nextStatus);
              setFeatured(nextFeatured);
              setReports(nextReports);
              setActions((prev) => [
                {
                  id: crypto.randomUUID(),
                  action,
                  reason: reason ?? null,
                  createdAt: new Date().toISOString(),
                },
                ...prev,
              ].slice(0, 3));
            }}
          />
        </div>
      </td>
    </tr>
  );
}
