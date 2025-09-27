"use client";

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
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
  level: 'Saint' | 'Balanced' | 'Controversial' | 'Roasted';
  color: string;
  description: string;
}

export function DeathCertificate({ grave, graveUrl }: DeathCertificateProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const determineCauseOfDeath = (): string => {
    const category = grave.category.toLowerCase();
    const title = grave.title.toLowerCase();
    const datesText = grave.datesText?.toLowerCase() || '';
    
    // Extract cause from category and context
    if (category.includes('tech')) {
      if (title.includes('phone') || title.includes('iphone') || title.includes('android')) {
        return 'Catastrophic Screen Failure';
      }
      if (title.includes('laptop') || title.includes('computer') || title.includes('pc') || title.includes('macbook')) {
        return 'Hardware Malfunction';
      }
      if (title.includes('headphone') || title.includes('airpod') || title.includes('earbud')) {
        return 'Audio Driver Separation';
      }
      if (title.includes('cable') || title.includes('charger')) {
        return 'Connector Deterioration';
      }
      return 'Electronic Component Failure';
    }
    
    if (category.includes('appliance')) {
      return 'Mechanical Breakdown';
    }
    
    if (category.includes('toy')) {
      return 'Childhood Neglect Syndrome';
    }
    
    if (category.includes('clothing')) {
      return 'Fabric Integrity Loss';
    }
    
    if (category.includes('furniture')) {
      return 'Structural Collapse';
    }
    
    if (category.includes('vehicle')) {
      return 'Mechanical Failure';
    }
    
    if (category.includes('accessory')) {
      return 'Wear and Tear';
    }
    
    // Check dates text for clues
    if (datesText.includes('drop') || datesText.includes('fell')) {
      return 'Gravity-Related Trauma';
    }
    if (datesText.includes('water') || datesText.includes('spill')) {
      return 'Liquid Damage';
    }
    if (datesText.includes('break') || datesText.includes('broke')) {
      return 'Structural Failure';
    }
    if (datesText.includes('lost') || datesText.includes('missing')) {
      return 'Mysterious Disappearance';
    }
    
    return 'Natural Wear and Obsolescence';
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
        description: 'Uncontested'
      };
    }

    const roastPercentage = (roasts / total) * 100;

    if (roastPercentage >= 75) {
      return {
        score: Math.round(roastPercentage),
        level: 'Roasted',
        color: '#dc2626',
        description: 'Heavily Criticized'
      };
    } else if (roastPercentage >= 40) {
      return {
        score: Math.round(roastPercentage),
        level: 'Controversial',
        color: '#f59e0b',
        description: 'Highly Debated'
      };
    } else if (roastPercentage >= 10) {
      return {
        score: Math.round(roastPercentage),
        level: 'Balanced',
        color: '#3b82f6',
        description: 'Mixed Reception'
      };
    } else {
      return {
        score: Math.round(roastPercentage),
        level: 'Saint',
        color: '#22c55e',
        description: 'Widely Beloved'
      };
    }
  };

  const controversy = calculateControversy();

  const generateQRCode = async (url: string): Promise<string> => {
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

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);

    try {
      // Generate QR code
      const qrCodeDataUrl = await generateQRCode(graveUrl);
      
      // Update QR code in the certificate
      const qrImg = certificateRef.current.querySelector('#qr-code') as HTMLImageElement;
      if (qrImg && qrCodeDataUrl) {
        qrImg.src = qrCodeDataUrl;
      }

      // Wait a moment for QR code to render
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: '#1a1a1a',
        scale: 2,
        width: 800,
        height: 600,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `death-certificate-${grave.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Certificate generation failed:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
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
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-4 border-amber-600 rounded-lg p-8 text-white relative overflow-hidden"
        style={{ width: '800px', height: '600px' }}
      >
        {/* Decorative Border */}
        <div className="absolute inset-2 border-2 border-amber-500 rounded opacity-50"></div>
        <div className="absolute inset-4 border border-amber-400 rounded opacity-30"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-amber-300 mb-2">
            ⚰️ OFFICIAL DEATH CERTIFICATE ⚰️
          </div>
          <div className="text-lg text-gray-300">
            Virtual Graveyard Registry • RipStuff.net
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Deceased Information */}
          <div className="bg-black/30 rounded-lg p-4 border border-amber-600/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-amber-300 font-semibold">Deceased:</div>
                <div className="text-xl font-bold">{grave.title}</div>
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
                <div className="text-lg">{determineCauseOfDeath()}</div>
              </div>
            </div>
          </div>

          {/* Roast Meter */}
          <div className="bg-black/30 rounded-lg p-4 border border-amber-600/50">
            <div className="text-amber-300 font-semibold mb-3">ROAST METER — SYMPATHIES VS ROASTS</div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>Beloved</span>
                  <span>Roasted</span>
                </div>
                <div className="h-6 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${controversy.score}%`,
                      backgroundColor: controversy.color,
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: controversy.color }}>
                  {controversy.score}%
                </div>
                <div className="text-sm text-gray-300">roasted</div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-400 text-center">
              Sympathies: {grave.eulogyCount || 0} • Roasts: {grave.roastCount || 0} → {controversy.score}% roasted
            </div>
          </div>

          {/* Epitaph Excerpt */}
          <div className="bg-black/30 rounded-lg p-4 border border-amber-600/50">
            <div className="text-amber-300 font-semibold mb-2">EPITAPH</div>
            <div className="text-gray-200 text-sm leading-relaxed italic">
              "{grave.eulogyText.length > 150 ? 
                grave.eulogyText.substring(0, 150) + '...' : 
                grave.eulogyText}"
            </div>
          </div>

          {/* Optional Community Tiles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-600/50 text-center">
              <div className="text-2xl font-bold text-purple-300">0</div>
              <div className="text-sm text-purple-200">Memories</div>
            </div>
            <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-600/50 text-center">
              <div className="text-2xl font-bold text-yellow-300">{grave.candleCount || 0}</div>
              <div className="text-sm text-yellow-200">Candles Lit</div>
            </div>
          </div>

          {/* QR Code and Footer */}
          <div className="flex justify-between items-end">
            <div className="flex-1">
              <div className="text-xs text-gray-400 leading-relaxed">
                This certificate verifies the digital death and memorial of the above-named item. 
                The controversy rating reflects the ratio of roast votes to sympathy votes on the 
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