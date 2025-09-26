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
  const [showReports, setShowReports] = useState(false);
  const [resolvingReport, setResolvingReport] = useState<string | null>(null);

  const handleResolveReport = async (reportId: string) => {
    setResolvingReport(reportId);
    try {
      const res = await fetch(`/api/moderation/reports/${reportId}/resolve`, {
        method: 'POST',
      });
      
      if (res.ok) {
        // Remove the resolved report from the UI
        setReports(prev => Math.max(0, prev - 1));
        // Refresh the data or show success feedback
      }
    } catch (error) {
      console.error('Failed to resolve report:', error);
    } finally {
      setResolvingReport(null);
    }
  };

  return (
    <>
      <tr className={`border-t border-[rgba(255,255,255,0.05)] transition-colors ${showReports ? 'bg-[rgba(255,255,255,0.02)]' : 'hover:bg-[rgba(255,255,255,0.01)]'}`}>
        <td className="px-3 py-4 text-white max-w-0 w-2/5 overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white break-words text-sm leading-tight">{item.title}</div>
                <div className="text-xs text-[var(--muted)] mt-1 capitalize">
                  {item.category.replace(/_/g, ' ').toLowerCase()}
                </div>
              </div>
              {reports > 0 && (
                <button
                  onClick={() => setShowReports(!showReports)}
                  className={`flex-shrink-0 px-2 py-1 text-xs rounded-full border transition-all ${
                    showReports 
                      ? 'bg-red-500/20 border-red-500/30 text-red-300' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15'
                  }`}
                >
                  🚩 {reports} report{reports > 1 ? 's' : ''}
                </button>
              )}
            </div>
            
            <div className="text-[11px] text-[var(--muted)] break-words line-clamp-2 mt-1 overflow-hidden">
              <div className="truncate max-w-full">
                {item.eulogyPreview}
              </div>
            </div>
            
            {item.backstory && (
              <div className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                💡 Backstory: {item.backstory}
              </div>
            )}
          </div>
        </td>
        
        <td className="px-3 py-4">
          <div className="flex flex-col gap-2">
            <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
              status === 'APPROVED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
              status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
              status === 'HIDDEN' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
              'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}>
              {status}
            </span>
            {featured && (
              <span className="inline-flex items-center justify-center rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 text-xs">
                ⭐ Featured
              </span>
            )}
          </div>
        </td>
        
        <td className="px-3 py-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <span className={`rounded-full px-3 py-1 text-xs font-bold min-w-[30px] inline-block border ${
              reports > 0 
                ? "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse" 
                : "bg-[rgba(255,255,255,0.05)] text-[var(--muted)] border-[rgba(255,255,255,0.1)]"
            }`}>
              {reports}
            </span>
            {reports > 0 && (
              <button
                onClick={() => setShowReports(!showReports)}
                className="text-[10px] text-red-400 hover:text-red-300 underline"
              >
                {showReports ? 'Hide' : 'View'}
              </button>
            )}
          </div>
        </td>
        
        <td className="px-3 py-4 text-xs text-[var(--muted)]">
          <div className="space-y-1">
            <div className="font-medium text-white">
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
            <div className="opacity-70">
              {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        </td>
        
        <td className="px-3 py-4 min-w-[280px]">
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              <Button variant="ghost" asChild className="text-xs px-3 py-1 h-7 bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/15">
                <Link href={`/grave/${item.slug}`} target="_blank">
                  👁️ View Live
                </Link>
              </Button>
              
              {reports > 0 && (
                <button
                  onClick={() => setShowReports(!showReports)}
                  className="text-xs px-3 py-1 h-7 bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/15 rounded-full transition-colors"
                >
                  {showReports ? '📋 Hide Reports' : '🚩 View Reports'}
                </button>
              )}
            </div>
            
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
                ].slice(0, 5));
              }}
            />
          </div>
        </td>
      </tr>
      
      {/* Expandable Reports Section */}
      {showReports && item.reportDetails.length > 0 && (
        <tr className="bg-red-500/5 border-t border-red-500/20">
          <td colSpan={5} className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-red-300">
                🚨 Active Reports ({item.reportDetails.length})
              </div>
              
              <div className="grid gap-3">
                {item.reportDetails.map((report) => (
                  <div 
                    key={report.id}
                    className="bg-[rgba(0,0,0,0.3)] border border-red-500/20 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                          <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded font-mono">
                            {report.deviceHash}
                          </span>
                          <span>
                            📅 {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        {report.reason ? (
                          <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded p-3">
                            <div className="text-xs text-[var(--muted)] mb-1">Reason:</div>
                            <div className="text-sm text-white">{report.reason}</div>
                          </div>
                        ) : (
                          <div className="text-xs text-[var(--muted)] italic">
                            No specific reason provided
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleResolveReport(report.id)}
                        disabled={resolvingReport === report.id}
                        className="flex-shrink-0 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white text-xs rounded-lg font-medium transition-colors"
                      >
                        {resolvingReport === report.id ? '⏳ Resolving...' : '✅ Resolve'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-red-500/20">
                <button
                  onClick={() => {
                    // Resolve all reports
                    item.reportDetails.forEach(report => handleResolveReport(report.id));
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition-colors"
                >
                  ✅ Resolve All Reports
                </button>
                
                <button
                  onClick={() => setShowReports(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                  📋 Hide Reports
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
      
      {/* Recent Actions Summary */}
      {actions.length > 0 && (
        <tr className="bg-[rgba(255,255,255,0.01)] border-t border-[rgba(255,255,255,0.02)]">
          <td colSpan={5} className="px-6 py-2">
            <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
              <span className="font-medium text-purple-300">📋 Recent Actions:</span>
              <div className="flex gap-4">
                {actions.slice(0, 3).map((action, idx) => (
                  <div key={action.id} className="flex items-center gap-2">
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-medium">
                      {action.action}
                    </span>
                    <span className="text-[10px] opacity-70">
                      {new Date(action.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
