"use client";

import { useState, useRef } from 'react';
import domtoimage from 'dom-to-image';
import { analytics } from "@/lib/analytics";
import { ViralHashtagGenerator } from "@/lib/hashtag-generator";

interface MemorialShareCardProps {
  grave: {
    id: string;
    title: string;
    category: string;
    eulogyText: string;
    createdAt: string;
    photoUrl?: string | null;
    reactions: {
      heart: number;
      candle: number;
      rose: number;
      lol: number;
    };
  };
  graveUrl: string;
}

type ShareFormat = 'instagram-story' | 'twitter-post' | 'facebook-post' | 'square';

interface ShareCardProps {
  grave: MemorialShareCardProps['grave'];
  format: ShareFormat;
}

function ShareCard({ grave, format }: ShareCardProps) {
  const formatConfig = {
    'instagram-story': {
      width: '360px',
      height: '640px', // 9:16 ratio
      className: 'memorial-card-instagram-story',
      gradient: 'from-purple-900 via-blue-900 to-black',
      textSize: 'text-lg',
      titleSize: 'text-2xl'
    },
    'twitter-post': {
      width: '600px', 
      height: '338px', // 16:9 ratio
      className: 'memorial-card-twitter',
      gradient: 'from-gray-900 via-gray-800 to-black',
      textSize: 'text-sm',
      titleSize: 'text-xl'
    },
    'facebook-post': {
      width: '600px',
      height: '315px', // Facebook recommended ratio
      className: 'memorial-card-facebook', 
      gradient: 'from-indigo-900 via-purple-900 to-black',
      textSize: 'text-sm',
      titleSize: 'text-xl'
    },
    'square': {
      width: '600px',
      height: '600px', // 1:1 ratio for Instagram posts
      className: 'memorial-card-square',
      gradient: 'from-rose-900 via-pink-900 to-black',
      textSize: 'text-base',
      titleSize: 'text-2xl'
    }
  };

  const config = formatConfig[format];
  const totalReactions = Object.values(grave.reactions).reduce((sum, count) => sum + count, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      'TECH_GADGETS': '📱',
      'CLOTHING_FASHION': '👕',
      'KITCHEN_APPLIANCES': '🍳',
      'TOYS_GAMES': '🎮',
      'FURNITURE_DECOR': '🪑',
      'ELECTRONICS': '⚡',
      'VEHICLES': '🚗',
      'BOOKS_MEDIA': '📚',
      'SPORTS_FITNESS': '⚽',
      'BEAUTY_PERSONAL_CARE': '💄',
      'TOOLS_HARDWARE': '🔧',
      'PET_SUPPLIES': '🐕',
      'OUTDOOR_GARDEN': '🌱',
      'OTHER': '💔'
    };
    return emojiMap[category] || '💔';
  };

  return (
    <div 
      className={`${config.className} relative overflow-hidden bg-gradient-to-br ${config.gradient} text-white flex flex-col justify-between p-6`}
      style={{ width: config.width, height: config.height }}
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
        <div className="absolute top-1/2 right-0 w-16 h-16 bg-white rounded-full translate-x-8"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryEmoji(grave.category)}</span>
            <span className={`${config.textSize} text-gray-300 uppercase tracking-wider`}>
              Memorial
            </span>
          </div>
          <div className="text-right">
            <div className={`${config.textSize} text-gray-300`}>RipStuff.net</div>
          </div>
        </div>

        <h1 className={`${config.titleSize} font-bold mb-2 leading-tight`}>
          {grave.title}
        </h1>
        
        <div className={`${config.textSize} text-gray-300 mb-4`}>
          {formatDate(grave.createdAt)} • {grave.category.replace(/_/g, ' ')}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        {grave.photoUrl && (
          <div className="mb-4 flex justify-center">
            <img 
              src={grave.photoUrl} 
              alt={grave.title}
              className="w-32 h-32 object-cover rounded-lg border-2 border-white/20"
            />
          </div>
        )}

        <div className="text-center mb-4">
          <blockquote className={`${config.textSize} italic text-gray-100 leading-relaxed line-clamp-4`}>
            "{grave.eulogyText.slice(0, format === 'instagram-story' ? 200 : 150)}..."
          </blockquote>
        </div>

        {/* Reactions */}
        {totalReactions > 0 && (
          <div className="flex justify-center items-center gap-4 mb-4">
            {grave.reactions.heart > 0 && (
              <span className={`${config.textSize} flex items-center gap-1`}>
                ❤️ {grave.reactions.heart}
              </span>
            )}
            {grave.reactions.candle > 0 && (
              <span className={`${config.textSize} flex items-center gap-1`}>
                🕯️ {grave.reactions.candle}
              </span>
            )}
            {grave.reactions.rose > 0 && (
              <span className={`${config.textSize} flex items-center gap-1`}>
                🌹 {grave.reactions.rose}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <div className="text-center">
          <div className={`${config.textSize} text-gray-300 mb-2`}>
            💔 Rest in Peace 💔
          </div>
          <div className="text-xs text-gray-400">
            Share your condolences at ripstuff.net
          </div>
        </div>

        {/* Hashtag suggestions for social copy */}
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-500">
            {ViralHashtagGenerator.getFormattedHashtags(grave, { maxCount: 3, platform: 'twitter' }).join(' ')}
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 right-4 opacity-20">
        <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
          <span className="text-sm">🪦</span>
        </div>
      </div>
    </div>
  );
}

export function MemorialShareCard({ grave, graveUrl }: MemorialShareCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFormat, setActiveFormat] = useState<ShareFormat | null>(null);
  const cardRefs = {
    'instagram-story': useRef<HTMLDivElement>(null),
    'twitter-post': useRef<HTMLDivElement>(null),
    'facebook-post': useRef<HTMLDivElement>(null),
    'square': useRef<HTMLDivElement>(null),
  };

  const downloadShareCard = async (format: ShareFormat) => {
    const cardRef = cardRefs[format];
    if (!cardRef.current) return;

    setIsGenerating(true);
    setActiveFormat(format);

    try {
      const dataUrl = await domtoimage.toPng(cardRef.current, {
        quality: 0.9,
        bgcolor: '#000000',
        width: cardRef.current.scrollWidth,
        height: cardRef.current.scrollHeight,
      });

      const link = document.createElement('a');
      link.download = `memorial-card-${format}-${grave.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();

      // Track download
      analytics.trackDeathCertificateDownload(grave.id, undefined);
      
    } catch (error) {
      console.error('Memorial card generation failed:', error);
      alert('Failed to generate memorial card. Please try again.');
    } finally {
      setIsGenerating(false);
      setActiveFormat(null);
    }
  };

  const shareToSocial = async (format: ShareFormat, platform: 'twitter' | 'facebook' | 'instagram') => {
    // Generate viral hashtags based on category and content
    const hashtags = ViralHashtagGenerator.getFormattedHashtags(grave, { 
      maxCount: platform === 'instagram' ? 15 : platform === 'twitter' ? 8 : 5,
      platform 
    });
    
    const shareText = format === 'instagram-story' 
      ? `💔 RIP ${grave.title} - Gone but not forgotten 💔\n\n${hashtags.join(' ')}`
      : `💔 Memorial for ${grave.title} 💔\n\n"${grave.eulogyText.slice(0, 100)}..."\n\nShare your condolences: ${graveUrl}\n\n${hashtags.join(' ')}`;

    // First download the card
    await downloadShareCard(format);

    // Then open social platform
    setTimeout(() => {
      switch (platform) {
        case 'twitter':
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
          window.open(twitterUrl, '_blank');
          break;
        case 'facebook':
          const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(graveUrl)}&quote=${encodeURIComponent(shareText)}`;
          window.open(fbUrl, '_blank');
          break;
        case 'instagram':
          // Instagram doesn't support direct posting, so just copy text
          navigator.clipboard.writeText(shareText);
          alert('Memorial card downloaded! Text copied to clipboard. Upload the image to Instagram and paste the caption.');
          break;
      }
      
      analytics.trackSocialShare(platform, grave.id, 'grave');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">📱 Share Memorial Cards</h3>
        <p className="text-sm text-gray-400">
          Download beautiful memorial cards optimized for social media
        </p>
      </div>

      {/* Format Selection & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Instagram Story (9:16)</h4>
          <div className="flex gap-2">
            <button
              onClick={() => shareToSocial('instagram-story', 'instagram')}
              disabled={isGenerating && activeFormat === 'instagram-story'}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              {isGenerating && activeFormat === 'instagram-story' ? '⏳ Generating...' : '📸 Share to Instagram'}
            </button>
            <button
              onClick={() => downloadShareCard('instagram-story')}
              disabled={isGenerating && activeFormat === 'instagram-story'}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors text-sm"
            >
              📥
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-white">Twitter Post (16:9)</h4>
          <div className="flex gap-2">
            <button
              onClick={() => shareToSocial('twitter-post', 'twitter')}
              disabled={isGenerating && activeFormat === 'twitter-post'}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              {isGenerating && activeFormat === 'twitter-post' ? '⏳ Generating...' : '🐦 Share to Twitter'}
            </button>
            <button
              onClick={() => downloadShareCard('twitter-post')}
              disabled={isGenerating && activeFormat === 'twitter-post'}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors text-sm"
            >
              📥
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-white">Facebook Post</h4>
          <div className="flex gap-2">
            <button
              onClick={() => shareToSocial('facebook-post', 'facebook')}
              disabled={isGenerating && activeFormat === 'facebook-post'}
              className="flex-1 bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              {isGenerating && activeFormat === 'facebook-post' ? '⏳ Generating...' : '📘 Share to Facebook'}
            </button>
            <button
              onClick={() => downloadShareCard('facebook-post')}
              disabled={isGenerating && activeFormat === 'facebook-post'}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors text-sm"
            >
              📥
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-white">Square (1:1)</h4>
          <div className="flex gap-2">
            <button
              onClick={() => downloadShareCard('square')}
              disabled={isGenerating && activeFormat === 'square'}
              className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              {isGenerating && activeFormat === 'square' ? '⏳ Generating...' : '📱 Download Square'}
            </button>
            <button
              onClick={() => downloadShareCard('square')}
              disabled={isGenerating && activeFormat === 'square'}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors text-sm"
            >
              📥
            </button>
          </div>
        </div>
      </div>

      {/* Preview Cards (Hidden, used for generation) */}
      <div className="hidden">
        {Object.entries(cardRefs).map(([format, ref]) => (
          <div key={format} ref={ref}>
            <ShareCard grave={grave} format={format as ShareFormat} />
          </div>
        ))}
      </div>

      {/* Live Preview (Optional - show one format) */}
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-4">Preview (Instagram Story format)</p>
        <div className="flex justify-center">
          <div className="transform scale-50 origin-center">
            <ShareCard grave={grave} format="instagram-story" />
          </div>
        </div>
      </div>
    </div>
  );
}