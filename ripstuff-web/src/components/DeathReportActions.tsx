"use client";

import { useState } from "react";
import { analytics } from "@/lib/analytics";

interface DeathReportActionsProps {
  report: {
    date: string;
    total: number;
    causes: { [key: string]: number };
    trends: { [key: string]: string };
    notableFacts: string[];
  };
}

export function DeathReportActions({ report }: DeathReportActionsProps) {
  const [copied, setCopied] = useState(false);

  const reportText = `📊 DAILY DEATH REPORT | ${report.date}

Total Deaths: ${report.total.toLocaleString()}

Top Causes:
${Object.entries(report.causes)
  .map(([cause, count]) => `${cause}: ${count.toLocaleString()}`)
  .join('\n')}

Trends:
${Object.entries(report.trends)
  .map(([cause, trend]) => `${cause}: ${trend}`)
  .join('\n')}

Notable Facts:
${report.notableFacts.map(fact => `• ${fact}`).join('\n')}

Honor the departed at RipStuff.com 🪦`;

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      analytics.trackShare('copy', window.location.href, 'death-report');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareReport = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `📊 Today's Death Report: ${report.total.toLocaleString()} deaths worldwide\n\nHonor the departed at RipStuff.com 🪦`
    )}&url=${encodeURIComponent(window.location.href)}`;
    
    window.open(url, '_blank');
    analytics.trackShare('twitter', window.location.href, 'death-report');
  };

  return (
    <div className="flex gap-4 mt-6">
      <button 
        onClick={copyReport}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        {copied ? 'Copied!' : 'Copy Report'}
      </button>
      <button 
        onClick={shareReport}
        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
      >
        Share Report
      </button>
    </div>
  );
}