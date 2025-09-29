"use client";

import { useState } from "react";
import { ViralHashtagGenerator } from "@/lib/hashtag-generator";

interface TikTokBurialTemplateProps {
  grave: {
    title: string;
    category: string;
    eulogyText: string;
    createdAt: string;
  };
  graveUrl: string;
}

interface BurialTemplate {
  id: string;
  name: string;
  description: string;
  script: string[];
  trendingSounds: string[];
  props: string[];
  hashtags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  trending: boolean;
}

export function TikTokBurialTemplate({ grave, graveUrl }: TikTokBurialTemplateProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<BurialTemplate | null>(null);
  const [copied, setCopied] = useState(false);

  const templates: BurialTemplate[] = [
    {
      id: 'dramatic-funeral',
      name: '💀 Dramatic Funeral Service',
      description: 'Full funeral service with eulogy reading',
      script: [
        '🎬 Scene 1: Show the broken item dramatically',
        '📖 Scene 2: Read the eulogy with serious music',
        '⚰️ Scene 3: "Bury" the item (box/drawer/trash)',
        '😢 Scene 4: Moment of silence with sad face',
        '📱 Scene 5: Show memorial link on screen'
      ],
      trendingSounds: [
        'Sad Violin Music',
        'My Heart Will Go On (Titanic)',
        'Ave Maria',
        'Taps Bugle Call',
        'Funeral March'
      ],
      props: ['Black clothing', 'Candles', 'Flowers', 'Small box/coffin'],
      hashtags: ['#FuneralService', '#ItemRIP', '#DramaticTikTok'],
      difficulty: 'Hard',
      duration: '60 seconds',
      trending: true
    },
    {
      id: 'quick-burial',
      name: '⚡ Quick & Funny Burial',
      description: 'Fast-paced comedic burial ceremony',
      script: [
        '🎬 Scene 1: Item breaks (show the moment!)',
        '😱 Scene 2: Dramatic gasp and "NOOO!"',
        '📦 Scene 3: Quick "burial" in trash/box',
        '🪦 Scene 4: Make tombstone sign',
        '📱 Scene 5: Point to memorial link text overlay'
      ],
      trendingSounds: [
        'Oh No Audio',
        'Curb Your Enthusiasm Theme',
        'Dramatic Chipmunk',
        'Windows Error Sound',
        'Sad Trombone'
      ],
      props: ['Cardboard for tombstone', 'Marker', 'Box/trash can'],
      hashtags: ['#ItemFail', '#TechFail', '#QuickBurial'],
      difficulty: 'Easy',
      duration: '15-30 seconds',
      trending: true
    },
    {
      id: 'memorial-slideshow',
      name: '📸 Memorial Photo Slideshow',
      description: 'Nostalgic photo memories of the item',
      script: [
        '🎬 Scene 1: "In loving memory of..." text',
        '📱 Scene 2: Show old photos with the item',
        '💔 Scene 3: Show the item broken/dead',
        '🕯️ Scene 4: Light a candle for remembrance',
        '🔗 Scene 5: "Full memorial at [link]" overlay'
      ],
      trendingSounds: [
        'Memory/Nostalgic Music',
        'Sarah McLachlan - Angel',
        'Green Day - Good Riddance',
        'Piano Sad Music',
        'Vintage Home Video Audio'
      ],
      props: ['Old photos with item', 'Candle', 'Phone for slideshow'],
      hashtags: ['#MemorialSlideshow', '#Memories', '#GoneButNotForgotten'],
      difficulty: 'Medium',
      duration: '45-60 seconds',
      trending: false
    },
    {
      id: 'roast-session',
      name: '🔥 Roast Session',
      description: 'Comedy roast of the broken item',
      script: [
        '🎬 Scene 1: "Ladies and gentlemen, we gather today..."',
        '😂 Scene 2: List all the ways item failed you',
        '🎭 Scene 3: Friends/family "roast" the item',
        '💀 Scene 4: Final "burial" with laughter',
        '📱 Scene 5: "Roast them more at [link]"'
      ],
      trendingSounds: [
        'Comedy Club Music',
        'Roast Battle Audio',
        'Sarcastic Music',
        'Clapping/Laughter Track',
        'Upbeat Comedy Music'
      ],
      props: ['Multiple people', 'Microphone (fake)', 'Comedy timing'],
      hashtags: ['#RoastSession', '#ItemRoast', '#ComedyTikTok'],
      difficulty: 'Medium',
      duration: '30-45 seconds',
      trending: true
    },
    {
      id: 'tech-autopsy',
      name: '🔬 Tech Autopsy',
      description: 'Scientific examination of what went wrong',
      script: [
        '🎬 Scene 1: "Time of death..." with serious voice',
        '🔍 Scene 2: "Examine" the broken item closely',
        '📋 Scene 3: List "cause of death" dramatically',
        '⚖️ Scene 4: "Official diagnosis" with certificate',
        '🌐 Scene 5: "Full autopsy report at [link]"'
      ],
      trendingSounds: [
        'CSI Theme Music',
        'Medical Drama Music',
        'Detective/Mystery Audio',
        'Scientific Documentary Sounds',
        'Dramatic Investigation Music'
      ],
      props: ['Magnifying glass', 'Lab coat/serious outfit', 'Clipboard'],
      hashtags: ['#TechAutopsy', '#CauseOfDeath', '#TechFail'],
      difficulty: 'Medium',
      duration: '30-45 seconds',
      trending: false
    }
  ];

  const getCategorySpecificTemplate = () => {
    const categoryTemplates: Record<string, Partial<BurialTemplate>> = {
      'TECH_GADGETS': {
        name: '📱 Tech Item Funeral',
        hashtags: ['#TechFail', '#PhoneFail', '#GadgetDeath'],
        script: [
          '🎬 Scene 1: Show broken screen/device dramatically',
          '📞 Scene 2: "It lived a good life... 2 years, 3 months"',
          '⚰️ Scene 3: Put in old phone box as coffin',
          '📱 Scene 4: Show memorial on your working phone',
          '🔗 Scene 5: Point to link overlay'
        ]
      },
      'CLOTHING_FASHION': {
        name: '👕 Fashion Item Memorial',
        hashtags: ['#FashionFail', '#ClothingRIP', '#OutfitFail'],
        script: [
          '🎬 Scene 1: Show the hole/stain/damage',
          '👗 Scene 2: "You saw me through so many outfits..."',
          '🗂️ Scene 3: Fold and put in donation bag',
          '📸 Scene 4: Show old photos wearing the item',
          '🔗 Scene 5: "Full fashion eulogy at [link]"'
        ]
      }
    };

    return categoryTemplates[grave.category];
  };

  const generateTikTokScript = (template: BurialTemplate) => {
    const hashtags = ViralHashtagGenerator.getFormattedHashtags(grave, { 
      maxCount: 8, 
      platform: 'tiktok' 
    });

    const customTemplate = getCategorySpecificTemplate();
    const finalScript = customTemplate?.script || template.script;
    const finalHashtags = [...(customTemplate?.hashtags || []), ...template.hashtags, ...hashtags];

    return {
      script: finalScript,
      hashtags: [...new Set(finalHashtags)], // Remove duplicates
      caption: generateCaption(template, finalHashtags),
      sounds: template.trendingSounds,
      props: template.props
    };
  };

  const generateCaption = (template: BurialTemplate, hashtags: string[]) => {
    const baseCaption = `RIP ${grave.title} 💔 ${template.description}

Full memorial: ${graveUrl}

${hashtags.join(' ')}`;

    return baseCaption;
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">🎬 TikTok Burial Ceremony Templates</h3>
        <p className="text-sm text-gray-400">
          Create viral burial videos that drive traffic to your memorial
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedTemplate?.id === template.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-white text-sm">{template.name}</h4>
              {template.trending && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">🔥 TRENDING</span>
              )}
            </div>
            
            <p className="text-xs text-gray-400 mb-2">{template.description}</p>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>⏱️ {template.duration}</span>
              <span className={`px-2 py-1 rounded ${
                template.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                template.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {template.difficulty}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-white">{selectedTemplate.name}</h4>
            <button
              onClick={() => {
                const script = generateTikTokScript(selectedTemplate);
                copyToClipboard(script.caption);
              }}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {copied ? '✅ Copied!' : '📋 Copy TikTok Caption'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Script */}
            <div>
              <h5 className="font-semibold text-white mb-3">🎬 Video Script</h5>
              <div className="space-y-2">
                {generateTikTokScript(selectedTemplate).script.map((step, index) => (
                  <div key={index} className="text-sm text-gray-300 bg-gray-700/30 p-2 rounded">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Sounds */}
            <div>
              <h5 className="font-semibold text-white mb-3">🎵 Trending Sounds</h5>
              <div className="space-y-1">
                {selectedTemplate.trendingSounds.map((sound, index) => (
                  <div key={index} className="text-sm text-gray-400">
                    • {sound}
                  </div>
                ))}
              </div>

              <h5 className="font-semibold text-white mb-2 mt-4">🎭 Props Needed</h5>
              <div className="space-y-1">
                {selectedTemplate.props.map((prop, index) => (
                  <div key={index} className="text-sm text-gray-400">
                    • {prop}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Caption Preview */}
          <div className="mt-6 p-4 bg-gray-900/50 rounded border border-gray-600">
            <h5 className="font-semibold text-white mb-2">📱 TikTok Caption</h5>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
              {generateTikTokScript(selectedTemplate).caption}
            </pre>
          </div>

          {/* Call to Action */}
          <div className="mt-4 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded">
            <div className="text-center">
              <h6 className="font-semibold text-white mb-2">🚀 Ready to go viral?</h6>
              <p className="text-sm text-gray-300 mb-3">
                Film your burial ceremony and watch the views roll in! Don't forget to include your memorial link.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    const script = generateTikTokScript(selectedTemplate);
                    copyToClipboard(script.caption);
                  }}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  📋 Copy Caption
                </button>
                <button
                  onClick={() => {
                    const tiktokUrl = `https://www.tiktok.com/upload`;
                    window.open(tiktokUrl, '_blank');
                  }}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm"
                >
                  🎬 Open TikTok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h5 className="font-semibold text-blue-400 mb-2">💡 TikTok Success Tips</h5>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• <strong>Post during peak hours:</strong> 6-10 PM EST for maximum engagement</li>
          <li>• <strong>Use trending sounds:</strong> Check TikTok's Creative Center for current viral audio</li>
          <li>• <strong>Hook viewers fast:</strong> Make the first 3 seconds dramatic or funny</li>
          <li>• <strong>Include text overlays:</strong> Many users watch without sound</li>
          <li>• <strong>Engage quickly:</strong> Reply to comments within the first hour</li>
          <li>• <strong>Cross-post content:</strong> Share to Instagram Reels and YouTube Shorts too</li>
        </ul>
      </div>
    </div>
  );
}