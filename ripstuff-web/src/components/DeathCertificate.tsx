"use client";

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

interface DeathCertificateProps {
  grave: {
    title: string;
    category: string;
    eulogyText: string;
    createdAt: string;
    roastCount?: number;
    eulogyCount?: number;
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
            
            <div className="mt-4">
              <div className="text-amber-300 font-semibold">Date of Passing:</div>
              <div className="text-lg">{formatDate(grave.createdAt)}</div>
            </div>
          </div>

          {/* Controversy Meter */}
          <div className="bg-black/30 rounded-lg p-4 border border-amber-600/50">
            <div className="text-amber-300 font-semibold mb-3">CONTROVERSY RATING</div>
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
                <div className="text-sm text-gray-300">{controversy.level}</div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-400">{controversy.description}</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-900/30 rounded-lg p-3 border border-green-600/50 text-center">
              <div className="text-2xl font-bold text-green-300">{grave.eulogyCount || 0}</div>
              <div className="text-sm text-green-200">Eulogies</div>
            </div>
            <div className="bg-red-900/30 rounded-lg p-3 border border-red-600/50 text-center">
              <div className="text-2xl font-bold text-red-300">{grave.roastCount || 0}</div>
              <div className="text-sm text-red-200">Roasts</div>
            </div>
          </div>

          {/* QR Code and Footer */}
          <div className="flex justify-between items-end">
            <div className="flex-1">
              <div className="text-xs text-gray-400 leading-relaxed">
                This certificate verifies the digital death and memorial of the above-named item. 
                All controversy ratings are calculated based on community voting and reflect 
                the democratic opinion of our mourners.
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