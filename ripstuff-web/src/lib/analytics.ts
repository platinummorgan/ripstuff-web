/**
 * Simple analytics tracking for sharing and engagement events
 */

interface AnalyticsEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  custom?: Record<string, any>;
}

class Analytics {
  private initialized = false;

  init() {
    if (typeof window !== 'undefined' && !this.initialized) {
      this.initialized = true;
      console.log('Analytics initialized');
    }
  }

  track(event: AnalyticsEvent) {
    if (typeof window === 'undefined') return;

    // Google Analytics 4
    if ((window as any).gtag) {
      (window as any).gtag('event', event.action || event.event, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom,
      });
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }

    // Custom analytics endpoint (for future implementation)
    this.sendToCustomEndpoint(event);
  }

  private async sendToCustomEndpoint(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      // Silently fail analytics
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics endpoint failed:', error);
      }
    }
  }

  // Predefined tracking methods for common events
  trackShare(platform: string, contentType: string, contentId: string) {
    this.track({
      event: 'share',
      category: 'engagement',
      action: 'share',
      label: platform,
      custom: {
        method: platform,
        content_type: contentType,
        content_id: contentId,
      },
    });
  }

  trackGraveView(graveId: string, graveTitle: string) {
    this.track({
      event: 'grave_view',
      category: 'content',
      action: 'view',
      label: graveTitle,
      custom: {
        grave_id: graveId,
      },
    });
  }

  trackReaction(graveId: string, reactionType: string) {
    this.track({
      event: 'reaction',
      category: 'engagement',
      action: reactionType,
      custom: {
        grave_id: graveId,
      },
    });
  }

  trackSympathy(graveId: string) {
    this.track({
      event: 'sympathy_left',
      category: 'engagement',
      action: 'comment',
      custom: {
        grave_id: graveId,
      },
    });
  }

  trackGraveCreation(category: string, hasPhoto: boolean, eulogyType: 'ai' | 'manual') {
    this.track({
      event: 'grave_created',
      category: 'conversion',
      action: 'create',
      custom: {
        grave_category: category,
        has_photo: hasPhoto,
        eulogy_type: eulogyType,
      },
    });
  }
}

export const analytics = new Analytics();

// Auto-initialize
if (typeof window !== 'undefined') {
  analytics.init();
}