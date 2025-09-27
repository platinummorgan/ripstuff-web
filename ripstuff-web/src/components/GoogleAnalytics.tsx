'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

function GoogleAnalyticsScript({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return;

    // Track page views on route changes  
    if (window.gtag) {
      window.gtag('config', measurementId, {
        page_path: pathname,
        custom_map: {
          custom_parameter_1: 'grave_category',
          custom_parameter_2: 'user_type',
        },
      });
    }
  }, [pathname, measurementId]);

  if (!measurementId) {
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            gtag('config', '${measurementId}', {
              page_title: document.title,
              page_path: window.location.pathname,
              send_page_view: true,
              // Enhanced ecommerce and event tracking
              custom_map: {
                'custom_parameter_1': 'grave_category',
                'custom_parameter_2': 'user_type', 
                'custom_parameter_3': 'content_type'
              },
              // Privacy settings
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });

            // Make gtag available globally for our analytics class
            window.gtag = gtag;
          `,
        }}
      />
    </>
  );
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) {
    return null;
  }

  return <GoogleAnalyticsScript measurementId={measurementId} />;
}

// Type definitions for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: {
        page_path?: string;
        page_title?: string;
        send_page_view?: boolean;
        custom_map?: Record<string, string>;
        event_category?: string;
        event_label?: string;
        value?: number;
        anonymize_ip?: boolean;
        allow_google_signals?: boolean;
        allow_ad_personalization_signals?: boolean;
        [key: string]: any;
      }
    ) => void;
    dataLayer: any[];
  }
}