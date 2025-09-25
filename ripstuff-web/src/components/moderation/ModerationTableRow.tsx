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
      <td className="px-4 py-4 text-white">
        <div className="font-medium text-white">{item.title}</div>
        <div className="text-xs text-[var(--muted)]">{item.eulogyPreview}</div>
        <div className="mt-2 text-xs text-[var(--muted)]">Slug: {item.slug}</div>
        {actions.length > 0 && (
          <div className="mt-3 space-y-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            <div>Recent actions:</div>
            {actions.map((entry) => (
              <div key={entry.id} className="text-[var(--muted)] normal-case">
                <span className="mr-2 font-semibold text-white">{entry.action}</span>
                <span>{new Date(entry.createdAt).toLocaleString()}</span>
                {entry.reason && <span className="ml-2 text-[var(--muted)]">— {entry.reason}</span>}
              </div>
            ))}
          </div>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[rgba(255,255,255,0.05)] px-3 py-1 text-xs">{status}</span>
          {status === "HIDDEN" && (
            <span className="rounded-full bg-[rgba(255,145,164,0.18)] px-3 py-1 text-xs text-[#ff8097]">Hidden</span>
          )}
          {status === "PENDING" && (
            <span className="rounded-full bg-[rgba(142,123,255,0.15)] px-3 py-1 text-xs text-[var(--muted)]">Pending review</span>
          )}
          {featured && (
            <span className="rounded-full bg-[rgba(255,255,255,0.1)] px-3 py-1 text-xs text-[var(--muted)]">Featured</span>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={`rounded-full px-3 py-1 text-xs ${reports > 0 ? "bg-[rgba(255,145,164,0.18)] text-[#ff8097]" : "bg-[rgba(255,255,255,0.05)]"}`}>
          {reports}
        </span>
      </td>
      <td className="px-4 py-4">{new Date(item.createdAt).toLocaleString()}</td>
      <td className="px-4 py-4 space-y-2">
        <Button variant="ghost" asChild>
          <Link href={`/grave/${item.slug}`} target="_blank">
            View grave
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
      </td>
    </tr>
  );
}
