"use client";

import { useState, useRef } from 'react';
import domtoimage from 'dom-to-image';
import QRCode from 'qrcode';

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

export function DeathCertificate({ grave, graveUrl }: DeathCertificateProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

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
    const roasts = grave.roastCount || 0;
    const eulogies = grave.eulogyCount || 0;
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
      const minWidth = 650; // Increased width to accommodate full epitaph text
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
                <span className="text-green-400">Condolences ({grave.eulogyCount || 0})</span>
                <span className="text-red-400">Roasts ({grave.roastCount || 0})</span>
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

      {/* Download Button */}
      <div className="text-center">
        <button
          onClick={downloadCertificate}
          disabled={isGenerating}
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Generating Certificate...
            </>
          ) : (
            <>
              📜 Download Death Certificate
            </>
          )}
        </button>
        <p className="text-sm text-gray-400 mt-2">
          High-resolution PNG • Perfect for sharing or framing
        </p>
      </div>
    </div>
  );
}