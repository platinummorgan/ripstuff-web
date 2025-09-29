"use client";

import { useState, useRef } from 'react';
import domtoimage from 'dom-to-image';
import QRCode from 'qrcode';
import { useVoting } from "@/components/VotingContext";
import { analytics } from "@/lib/analytics";
import { ViralHashtagGenerator } from "@/lib/hashtag-generator";

interface DeathCertificateProps {
  grave: {
    title: string;
    category: string;
    eulogyText: string; // Display as "Epitaph" in UI
    createdAt: string;
    roastCount?: number;
    eulogyCount?: number; // Display as "Sympathy Votes" in UI  
    datesText?: string; // For cause of death extraction
    candleCount?: number; // For candles lit display
  };
  graveUrl: string;
}

interface ControversyScore {
  score: number;
  level: 'Saint' | 'Respected' | 'Divisive' | 'Controversial' | 'Roasted';
  color: string;
  description: string;
}

interface DeathCertificateShareButtonProps {
  grave: {
    title: string;
    category: string;
    eulogyText: string;
    createdAt: string;
  };
  graveUrl: string;
  graveSlug: string;
  controversy: ControversyScore;
}

function DeathCertificateShareButton({ grave, graveUrl, graveSlug, controversy }: DeathCertificateShareButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Color normalization functions (need to be accessible in this scope)
  const normalizeColorValue = (property: keyof CSSStyleDeclaration, value: string) => {
    try {
      const probe = document.createElement('div');
      probe.style.position = 'absolute';
      probe.style.visibility = 'hidden';
      probe.style.pointerEvents = 'none';
      
      if (typeof property === 'string' && probe.style[property as any] !== undefined) {
        (probe.style as any)[property] = value;
        document.body.appendChild(probe);
        const computedValue = window.getComputedStyle(probe).getPropertyValue(property);
        document.body.removeChild(probe);
        return computedValue || value;
      }
      return value;
    } catch (error) {
      console.warn(`Error normalizing color value for ${String(property)}:`, error);
      return value;
    }
  };

  const applyLegacyColorOverrides = (root: HTMLElement) => {
    const elementsToRestore: Array<{ element: HTMLElement; property: string; originalValue: string }> = [];
    const colorProperties = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'];
    
    const processElement = (element: HTMLElement) => {
      const computedStyle = window.getComputedStyle(element);
      
      colorProperties.forEach(property => {
        const currentValue = (computedStyle as any)[property];
        if (currentValue && (currentValue.includes('oklch') || currentValue.includes('color-mix'))) {
          const legacyValue = normalizeColorValue(property as keyof CSSStyleDeclaration, currentValue);
          elementsToRestore.push({ element, property, originalValue: currentValue });
          (element.style as any)[property] = legacyValue;
        }
      });
    };

    processElement(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let node = walker.nextNode();
    while (node) {
      processElement(node as HTMLElement);
      node = walker.nextNode();
    }

    return () => {
      elementsToRestore.forEach(({ element, property, originalValue }) => {
        (element.style as any)[property] = originalValue;
      });
    };
  };

  const generateShareText = (platform: 'twitter' | 'facebook' | 'reddit' | 'copy') => {
    const baseText = `💀 Official Death Certificate for my ${grave.title}`;
    const status = controversy.level === 'Saint' ? 'beloved' : 
                  controversy.level === 'Respected' ? 'well-respected' : 
                  controversy.level === 'Divisive' ? 'controversial' :
                  controversy.level === 'Controversial' ? 'highly controversial' : 'absolutely roasted';
    
    // Generate viral hashtags for the grave
    const hashtags = ViralHashtagGenerator.getFormattedHashtags({
      title: grave.title,
      category: grave.category,
      eulogyText: grave.eulogyText,
      createdAt: grave.createdAt
    }, {
      maxCount: platform === 'twitter' ? 8 : platform === 'facebook' ? 5 : 10,
      platform: platform === 'copy' ? 'twitter' : platform === 'reddit' ? 'twitter' : platform as 'twitter' | 'facebook'
    });

    // Add controversy-specific hashtags
    const controversyTags = ViralHashtagGenerator.getControversyHashtags(controversy.level);
    const allHashtags = [...hashtags.slice(0, 6), ...controversyTags.slice(0, 2)];
    
    switch (platform) {
      case 'twitter':
        return `${baseText} - Status: ${status} 📊\n\nMourn with me at ${graveUrl}\n\n${allHashtags.join(' ')}`;
      case 'facebook':
        return `${baseText}\n\nThis ${status} item has officially been laid to rest in the Virtual Graveyard. View the full memorial and share your condolences:\n\n${graveUrl}\n\n${hashtags.slice(0, 3).join(' ')}`;
      case 'reddit':
        return `${baseText} - Community voted it as "${status}"`;
      default:
        return baseText;
    }
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'reddit' | 'copy') => {
    const shareText = generateShareText(platform);
    
    // For Twitter and Facebook, generate and share the certificate image
    if (platform === 'twitter' || platform === 'facebook') {
      try {
        // Generate the certificate image first
        const certificateElement = document.querySelector('[data-certificate="true"]') as HTMLElement;
        if (!certificateElement) {
          console.error('Certificate element not found for sharing');
          return;
        }

        // Apply color fixes and generate image
        const restoreColors = applyLegacyColorOverrides(certificateElement);
        const dataUrl = await domtoimage.toPng(certificateElement, { 
          quality: 1,
          width: 800,
          height: 700
        });
        restoreColors();

        // Convert to blob for sharing
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `death-certificate-${graveSlug}.png`, { type: 'image/png' });

        // Check if Web Share API supports files (mainly mobile)
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: `Death Certificate for ${grave.title}`,
            text: shareText,
            url: graveUrl,
            files: [file]
          });
          analytics.trackSocialShare(platform, grave.title, 'death_certificate');
          return;
        }

        // Fallback: Create downloadable link and open social platform
        const link = document.createElement('a');
        link.download = `death-certificate-${graveSlug}.png`;
        link.href = dataUrl;
        link.click();

        // Still open the social platform with text
        setTimeout(() => {
          if (platform === 'twitter') {
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + '\n\n📄 Certificate image downloaded - attach it to your tweet!')}`;
            window.open(twitterUrl, '_blank');
          } else if (platform === 'facebook') {
            const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(graveUrl)}&quote=${encodeURIComponent(shareText + '\n\n📄 Certificate image downloaded - attach it to your post!')}`;
            window.open(fbUrl, '_blank');
          }
        }, 500);

        analytics.trackSocialShare(platform, grave.title, 'death_certificate');

      } catch (error) {
        console.error('Error generating certificate for sharing:', error);
        // Fallback to text-only sharing
        handleTextOnlyShare(platform, shareText);
      }
    } else {
      handleTextOnlyShare(platform, shareText);
    }
  };

  const handleTextOnlyShare = (platform: 'twitter' | 'facebook' | 'reddit' | 'copy', shareText: string) => {
    switch (platform) {
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank');
        analytics.trackSocialShare('twitter', grave.title, 'death_certificate');
        break;
      case 'facebook':
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(graveUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(fbUrl, '_blank');
        analytics.trackSocialShare('facebook', grave.title, 'death_certificate');
        break;
      case 'reddit':
        const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(graveUrl)}&title=${encodeURIComponent(shareText)}`;
        window.open(redditUrl, '_blank');
        analytics.trackSocialShare('reddit', grave.title, 'death_certificate');
        break;
      case 'copy':
        navigator.clipboard.writeText(`${shareText}\n\n${graveUrl}`);
        analytics.trackSocialShare('copy_link', grave.title, 'death_certificate');
        break;
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2"
      >
        📤 Share Certificate
      </button>

      {showDropdown && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 bg-[#0B1123] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-xl z-50">
          <div className="p-2">
            <div className="text-xs text-[var(--muted)] mb-2 px-2">Share death certificate</div>
            
            <button
              onClick={() => handleShare('twitter')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[rgba(29,161,242,0.1)] hover:text-[#1DA1F2] rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </button>
            
            <button
              onClick={() => handleShare('facebook')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[rgba(24,119,242,0.1)] hover:text-[#1877F2] rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            
            <button
              onClick={() => handleShare('reddit')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[rgba(255,69,0,0.1)] hover:text-[#FF4500] rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
              Reddit
            </button>
            
            <button
              onClick={() => handleShare('copy')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[rgba(255,255,255,0.05)] rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              Copy Link
            </button>
          </div>
        </div>
      )}
      
      {/* Click outside to close */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

export function DeathCertificate({ grave, graveUrl }: DeathCertificateProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const { votingState } = useVoting();

  const calculateAge = (): string => {
    const createdDate = new Date(grave.createdAt);
    const now = new Date();
    
    // Calculate difference in total days to avoid month/year calculation issues
    const diffMs = now.getTime() - createdDate.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (totalDays >= 365) {
      const years = Math.floor(totalDays / 365);
      const remainingDays = totalDays % 365;
      const months = Math.floor(remainingDays / 30);
      return months > 0 ? `${years}y ${months}m` : `${years}y`;
    } else if (totalDays >= 30) {
      const months = Math.floor(totalDays / 30);
      const days = totalDays % 30;
      return days > 0 ? `${months}m ${days}d` : `${months}m`;
    } else if (totalDays >= 1) {
      return `${totalDays}d`;
    } else {
      return "New";
    }
  };

  const determineCauseOfDeath = (): { icon: string; cause: string } => {
    const category = grave.category.toLowerCase();
    const title = grave.title.toLowerCase();
    const datesText = grave.datesText?.toLowerCase() || '';
    
    // Check dates text for clues first
    if (datesText.includes('drop') || datesText.includes('fell')) {
      return { icon: '⚡', cause: 'Gravity-Related Trauma' };
    }
    if (datesText.includes('water') || datesText.includes('spill')) {
      return { icon: '💧', cause: 'Liquid Damage' };
    }
    if (datesText.includes('break') || datesText.includes('broke')) {
      return { icon: '⚡', cause: 'Structural Failure' };
    }
    if (datesText.includes('lost') || datesText.includes('missing')) {
      return { icon: '🔋', cause: 'Mysterious Disappearance' };
    }
    
    // Extract cause from category and context
    if (category.includes('tech')) {
      if (title.includes('phone') || title.includes('iphone') || title.includes('android')) {
        return { icon: '⚡', cause: 'Catastrophic Screen Failure' };
      }
      if (title.includes('laptop') || title.includes('computer') || title.includes('pc') || title.includes('macbook')) {
        return { icon: '🔋', cause: 'Hardware Malfunction' };
      }
      if (title.includes('headphone') || title.includes('airpod') || title.includes('earbud') || title.includes('pro (right ear)') || title.includes('pro (left ear)')) {
        return { icon: '🎵', cause: 'Audio Driver Separation' };
      }
      if (title.includes('cable') || title.includes('charger')) {
        return { icon: '⚡', cause: 'Connector Deterioration' };
      }
      return { icon: '🔋', cause: 'Electronic Component Failure' };
    }
    
    if (category.includes('appliance')) {
      return { icon: '🔥', cause: 'Mechanical Breakdown' };
    }
    
    if (category.includes('games') || title.includes('playstation') || title.includes('xbox') || title.includes('nintendo') || title.includes('console') || title.includes('ps4') || title.includes('ps5')) {
      return { icon: '🎮', cause: 'System Overload Failure' };
    }
    
    if (category.includes('toy')) {
      return { icon: '💧', cause: 'Childhood Neglect Syndrome' };
    }
    
    if (category.includes('clothing')) {
      return { icon: '💧', cause: 'Fabric Integrity Loss' };
    }
    
    if (category.includes('furniture')) {
      return { icon: '⚡', cause: 'Structural Collapse' };
    }
    
    if (category.includes('vehicle')) {
      return { icon: '🔥', cause: 'Mechanical Failure' };
    }
    
    if (category.includes('accessory')) {
      return { icon: '💧', cause: 'Wear and Tear' };
    }
    
    return { icon: '🔋', cause: 'Natural Wear and Obsolescence' };
  };

  const calculateControversy = (): ControversyScore => {
    // Use live voting state instead of static props for real-time updates
    const roasts = votingState.roastCount;
    const eulogies = votingState.eulogyCount;
    const total = roasts + eulogies;

    if (total === 0) {
      return {
        score: 0,
        level: 'Saint',
        color: '#22c55e',
        description: 'Beloved'
      };
    }

    const roastPercentage = (roasts / total) * 100;

    if (roastPercentage >= 80) {
      return {
        score: Math.round(roastPercentage),
        level: 'Roasted',
        color: '#dc2626',
        description: 'Mercilessly Roasted'
      };
    } else if (roastPercentage >= 60) {
      return {
        score: Math.round(roastPercentage),
        level: 'Controversial',
        color: '#f59e0b',
        description: 'Controversial'
      };
    } else if (roastPercentage >= 40) {
      return {
        score: Math.round(roastPercentage),
        level: 'Divisive',
        color: '#f59e0b',
        description: 'Divisive'
      };
    } else if (roastPercentage >= 20) {
      return {
        score: Math.round(roastPercentage),
        level: 'Respected',
        color: '#3b82f6',
        description: 'Mostly Respected'
      };
    } else {
      return {
        score: Math.round(roastPercentage),
        level: 'Saint',
        color: '#22c55e',
        description: 'Beloved'
      };
    }
  };

  const controversy = calculateControversy();
  const causeInfo = determineCauseOfDeath();

  const generateQRCode = async (url: string): Promise<string> => {
    let restoreColors: (() => void) | null = null;

    try {
      return await QRCode.toDataURL(url, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    } catch (error) {
      console.error('QR Code generation failed:', error);
      return '';
    }
  };

  const normalizeColorValue = (property: keyof CSSStyleDeclaration, value: string) => {
    if (!value || !value.includes('oklch')) {
      return value;
    }

    const probe = document.createElement('div');
    Object.assign(probe.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      left: '-9999px',
      top: '0',
      pointerEvents: 'none',
      visibility: 'hidden',
    });

    document.body.appendChild(probe);
    try {
      (probe.style as any)[property] = value;
      const computed = getComputedStyle(probe)[property];
      return computed || value;
    } catch {
      return value;
    } finally {
      document.body.removeChild(probe);
    }
  };

  const applyLegacyColorOverrides = (root: HTMLElement) => {
    const properties: (keyof CSSStyleDeclaration)[] = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'outlineColor',
      'backgroundImage',
      'boxShadow',
    ];

    const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
    const originals: Array<{ element: HTMLElement; property: keyof CSSStyleDeclaration; value: string } > = [];

    for (const element of elements) {
      const computed = getComputedStyle(element);

      for (const property of properties) {
        const currentValue = computed[property];
        if (typeof currentValue === 'string' && currentValue.includes('oklch')) {
          const legacyValue = normalizeColorValue(property, currentValue);
          if (legacyValue && legacyValue !== currentValue) {
            const inlineValue = (element.style as any)[property] as string;
            originals.push({ element, property, value: inlineValue });
            (element.style as any)[property] = legacyValue;
          }
        }
      }
    }

    return () => {
      for (const { element, property, value } of originals) {
        if (value) {
          (element.style as any)[property] = value;
        } else {
          (element.style as any)[property] = '';
        }
      }
    };
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);

    let cleanupCloneColors: (() => void) | null = null;
    let removeCloneFromDom: (() => void) | null = null;

    try {
      // Generate QR code
      const qrCodeDataUrl = await generateQRCode(graveUrl);
      
      // Update QR code in the certificate
      const qrImg = certificateRef.current.querySelector('#qr-code') as HTMLImageElement;
      if (qrImg) {
        if (qrCodeDataUrl) {
          qrImg.src = qrCodeDataUrl;
        } else {
          // Hide QR code if generation failed
          qrImg.style.display = 'none';
        }
      }

      // Wait a moment for QR code to render
      await new Promise(resolve => setTimeout(resolve, 500));

      const node = certificateRef.current;
      const measuredRect = node.getBoundingClientRect();
      // Use the actual certificate width but ensure minimum width to prevent wrapping
      const minWidth = 800; // Increased width to accommodate full epitaph text
      const targetWidth = Math.max(minWidth, Math.ceil(measuredRect.width * 0.85));

      const clone = node.cloneNode(true) as HTMLElement;
      clone.style.margin = '0';
      clone.style.width = `${targetWidth}px`;
      clone.style.maxWidth = 'none';
      clone.style.height = 'auto';
      clone.style.boxSizing = 'border-box';

      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.top = '-9999px'; // Move off-screen to prevent flash
      wrapper.style.left = '-9999px'; // Move off-screen to prevent flash
      wrapper.style.padding = '0';
      wrapper.style.margin = '0';
      wrapper.style.zIndex = '-1';
      wrapper.style.pointerEvents = 'none';
      wrapper.style.background = '#0b0d16';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);
      removeCloneFromDom = () => {
        document.body.removeChild(wrapper);
      };

      // Allow layout to settle at the new width before measuring for export
      const cloneRect = clone.getBoundingClientRect();
      const exportWidth = Math.ceil(cloneRect.width);
      const exportHeight = Math.ceil(cloneRect.height);

      cleanupCloneColors = applyLegacyColorOverrides(clone);

      const dataUrl = await domtoimage.toPng(clone, {
        width: exportWidth, // Use actual measured width of the certificate
        height: exportHeight, // Use actual measured height of the certificate
        quality: 0.8, // Keep quality reasonable for file size
        bgcolor: '#0b0d16',
      });

      // Direct download of full certificate
      const link = document.createElement('a');
      link.download = `death-certificate-${grave.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Certificate generation failed:', error);
      alert(`Failed to generate certificate: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      cleanupCloneColors?.();
      removeCloneFromDom?.();
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <div 
        ref={certificateRef}
        data-certificate="true"
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-8 border-amber-600 rounded-lg p-8 text-white relative overflow-hidden mx-auto"
        style={{ width: '100%', maxWidth: '800px' }}
      >
        {/* Decorative Border */}
        <div className="absolute inset-2 border-4 border-amber-500 rounded opacity-50"></div>
        <div className="absolute inset-4 border border-amber-400 rounded opacity-30"></div>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-amber-300 mb-2">
            ⚰️ Official Death Certificate ⚰️
          </div>
          <div className="text-lg text-gray-300 mb-1">
            Virtual Graveyard Registry • RipStuff.net
          </div>
          <div className="text-xs text-amber-600 font-mono">
            Certificate #VG-{grave.title.replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 8)}-{new Date().getFullYear()}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Deceased Information */}
          <div className="bg-black/30 rounded-lg p-4 border border-amber-600/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-amber-300 font-semibold">Deceased:</div>
                <div className="text-xl font-bold">
                  {grave.title} <span className="text-sm text-gray-400 font-normal">Age: {calculateAge()}</span>
                </div>
              </div>
              <div>
                <div className="text-amber-300 font-semibold">Category:</div>
                <div className="text-lg capitalize">{grave.category.replace(/_/g, ' ')}</div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-amber-300 font-semibold">Date of Passing:</div>
                <div className="text-lg">{formatDate(grave.createdAt)}</div>
              </div>
              <div>
                <div className="text-amber-300 font-semibold">Cause of Death:</div>
                <div className="text-lg flex items-center gap-2">
                  <span>{causeInfo.icon}</span>
                  <span>{causeInfo.cause}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Roast Meter */}
          <div className="bg-black/30 rounded-lg p-4 border border-amber-600/50">
            <div className="text-amber-300 font-semibold mb-3">ROAST METER — CONDOLENCES VS ROASTS</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-400">Condolences ({votingState.eulogyCount})</span>
                <span className="text-red-400">Roasts ({votingState.roastCount})</span>
              </div>
              
              <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${controversy.score}%`,
                    backgroundColor: controversy.color,
                  }}
                ></div>
                {/* 50% tick mark */}
                <div className="absolute top-0 left-1/2 transform -translate-x-0.5 w-1 h-full bg-white/30 border-l border-white/50"></div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: controversy.color }}>
                  {controversy.level}
                </div>
                <div className="text-sm text-gray-400">
                  {controversy.description}
                </div>
              </div>
            </div>
          </div>

          {/* Epitaph Excerpt */}
          <div className="bg-black/30 rounded-lg p-4 border border-amber-600/50">
            <div className="text-amber-300 font-semibold mb-3">Epitaph</div>
            <div className="text-gray-200 text-sm leading-relaxed italic line-clamp-4">
              "{grave.eulogyText}"
            </div>
          </div>



          {/* Micro-CTA */}
          <div className="text-center py-1 border-t border-amber-600/30">
            <div className="text-xs text-amber-400">
              💭 Vote Condolences or Roasts
            </div>
          </div>

          {/* QR Code and Footer */}
          <div className="flex justify-between items-end">
            <div className="flex-1">
              <div className="text-sm text-gray-400 leading-relaxed">
                This certificate verifies the digital death and memorial of the above-named item. 
                The controversy rating reflects the ratio of roast votes to condolence votes on the 
                epitaph above, representing community sentiment toward the deceased item.
              </div>
            </div>
            <div className="ml-4">
              <img 
                id="qr-code"
                src="" 
                alt="QR Code"
                className="w-20 h-20 border border-amber-600/50 rounded"
              />
              <div className="text-xs text-gray-400 text-center mt-1">Visit Memorial</div>
            </div>
          </div>

          {/* Signature Line */}
          <div className="border-t border-amber-600/50 pt-4 text-center">
            <div className="text-sm text-amber-300">
              Certified by RipStuff Virtual Graveyard Authority
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Generated on {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Download & Share Buttons */}
      <div className="text-center">
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={downloadCertificate}
            disabled={isGenerating}
            className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Generating Certificate...
              </>
            ) : (
              <>
                📜 Download Certificate
              </>
            )}
          </button>
          
          <DeathCertificateShareButton 
            grave={{
              title: grave.title,
              category: grave.category,
              eulogyText: grave.eulogyText,
              createdAt: grave.createdAt
            }}
            graveUrl={graveUrl}
            graveSlug={graveUrl.split('/').pop() || 'certificate'}
            controversy={controversy}
          />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          High-resolution PNG • Perfect for sharing or framing
        </p>
      </div>
    </div>
  );
}