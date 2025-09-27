'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

interface GraveViewTrackerProps {
  graveId: string;
  graveTitle: string;
  graveCategory?: string;
}

export function GraveViewTracker({ graveId, graveTitle, graveCategory }: GraveViewTrackerProps) {
  useEffect(() => {
    // Track grave view on component mount
    analytics.trackGraveView(graveId, graveTitle);
    
    // Track with additional context if available
    if (graveCategory) {
      analytics.track({
        event: 'grave_view_detailed',
        category: 'content',
        action: 'view',
        label: graveTitle,
        custom: {
          grave_id: graveId,
          grave_category: graveCategory,
          content_type: 'grave',
        },
      });
    }
  }, [graveId, graveTitle, graveCategory]);

  // This component doesn't render anything
  return null;
}