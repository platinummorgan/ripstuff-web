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

    // Google Analytics 4 - Enhanced event tracking
    if (window.gtag) {
      window.gtag('event', event.action || event.event, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        // Custom dimensions for GA4
        custom_parameter_1: event.custom?.grave_category,
        custom_parameter_2: event.custom?.user_type,
        custom_parameter_3: event.custom?.content_type,
        // Standard GA4 parameters
        engagement_time_msec: event.custom?.engagement_time_msec || 1,
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

  // Track page views manually if needed (GA measurement ID is configured in GoogleAnalytics component)
  trackPageView(path: string, title?: string) {
    if (typeof window === 'undefined') return;

    // The gtag config is handled by the GoogleAnalytics component
    // This method is mainly for manual tracking if needed
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Page view tracked:', { path, title });
    }
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
        content_type: 'grave',
      },
    });
  }

  // RipStuff-specific tracking methods
  trackDeathCertificateDownload(graveId: string, controversy_score?: number) {
    this.track({
      event: 'death_certificate_download',
      category: 'engagement',
      action: 'download',
      custom: {
        grave_id: graveId,
        controversy_score,
        content_type: 'death_certificate',
      },
    });
  }

  trackRoastEulogyVote(graveId: string, voteType: 'roast' | 'eulogy') {
    this.track({
      event: 'roast_eulogy_vote',
      category: 'engagement', 
      action: voteType,
      custom: {
        grave_id: graveId,
        vote_type: voteType,
        content_type: 'voting',
      },
    });
  }

  trackSocialShare(platform: string, graveId?: string, shareType?: 'grave' | 'death_certificate') {
    this.track({
      event: 'share',
      category: 'engagement',
      action: 'share',
      label: platform,
      custom: {
        method: platform,
        grave_id: graveId,
        content_type: shareType || 'grave',
        share_platform: platform,
      },
    });
  }

  trackUserSignIn(method: 'google' | 'facebook', isNewUser: boolean = false) {
    this.track({
      event: isNewUser ? 'sign_up' : 'login',
      category: 'user_engagement',
      action: isNewUser ? 'register' : 'login',
      label: method,
      custom: {
        method,
        user_type: isNewUser ? 'new' : 'returning',
      },
    });
  }

  trackModerationAction(action: 'hide' | 'delete' | 'ban', targetType: 'grave' | 'user' | 'message') {
    this.track({
      event: 'moderation_action',
      category: 'admin',
      action,
      label: targetType,
      custom: {
        moderation_action: action,
        target_type: targetType,
        user_type: 'moderator',
      },
    });
  }
}

export const analytics = new Analytics();

// Auto-initialize
if (typeof window !== 'undefined') {
  analytics.init();
}