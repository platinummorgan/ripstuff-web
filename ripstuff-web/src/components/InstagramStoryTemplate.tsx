"use client";

import { useState } from "react";
import { ViralHashtagGenerator } from "@/lib/hashtag-generator";

interface InstagramStoryTemplateProps {
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

interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  style: 'memorial' | 'funny' | 'dramatic' | 'aesthetic';
  elements: string[];
  colors: string;
  trending: boolean;
}

export function InstagramStoryTemplate({ grave, graveUrl }: InstagramStoryTemplateProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null);
  const [copied, setCopied] = useState(false);

  const storyTemplates: StoryTemplate[] = [
    {
      id: 'rip-memorial',
      name: '💔 RIP Memorial Story',
      description: 'Classic memorial format with somber vibes',
      style: 'memorial',
      elements: [
        '🖤 Black/dark background',
        '📱 Item photo with memorial frame', 
        '💔 "RIP [Item Name]" text overlay',
        '📅 Dates of service text',
        '🕯️ Candle/memorial stickers',
        '🔗 "Link in bio" or swipe-up link',
        '📝 Short eulogy excerpt'
      ],
      colors: 'Black, white, gray tones',
      trending: true
    },
    {
      id: 'funny-obituary',
      name: '😂 Funny Obituary Story',
      description: 'Humorous take on item death',
      style: 'funny',
      elements: [
        '🎭 Bright, playful colors',
        '📱 Item photo with funny stickers',
        '😂 "This clumsy human killed me" text',
        '🏆 "Survived by: my warranty" joke',
        '💀 Skull/laughing emojis',
        '🔗 "Full roast at [link]" CTA',
        '#ItemFail hashtag overlay'
      ],
      colors: 'Bright yellows, oranges, fun gradients',
      trending: true
    },
    {
      id: 'aesthetic-tribute',
      name: '✨ Aesthetic Tribute Story',
      description: 'Instagram-pretty memorial with soft aesthetics',
      style: 'aesthetic',
      elements: [
        '🌸 Soft pastel gradients',
        '📱 Item photo with dreamy filter',
        '✨ "Forever in my heart" script font',
        '🌙 Moon/star stickers',
        '💫 Sparkle animations',
        '🔗 Subtle link sticker',
        '📿 Minimalist memorial quote'
      ],
      colors: 'Pastels: pink, lavender, cream',
      trending: false
    },
    {
      id: 'dramatic-funeral',
      name: '⚰️ Dramatic Funeral Story',
      description: 'Over-the-top dramatic memorial service',
      style: 'dramatic',
      elements: [
        '⚫ Deep black background',
        '📱 Item in makeshift coffin',
        '⚰️ "Funeral service today" text',
        '🕯️ Multiple candle stickers',
        '🌹 Rose petal overlays',
        '🎵 Add sad music sticker',
        '😭 "Crying" face with tears'
      ],
      colors: 'Black, gold, deep red accents',
      trending: true
    }
  ];

  const generateStoryContent = (template: StoryTemplate) => {
    const hashtags = ViralHashtagGenerator.getFormattedHashtags(grave, { 
      maxCount: 5, // Stories support fewer hashtags
      platform: 'instagram' 
    });

    const storyText = getStoryText(template);
    const caption = `${storyText}\n\n${hashtags.slice(0, 3).join(' ')}\n\nFull memorial: ${graveUrl}`;

    return {
      caption,
      hashtags,
      template,
      instructions: getInstructions(template)
    };
  };

  const getStoryText = (template: StoryTemplate) => {
    switch (template.style) {
      case 'memorial':
        return `💔 Rest in Peace ${grave.title}\n\n"${grave.eulogyText.slice(0, 80)}..."\n\nGone but never forgotten 🕯️`;
      case 'funny':
        return `😂 OBITUARY: ${grave.title}\n\nCause of death: Human clumsiness\nSurvived by: The warranty nobody kept\n\nF in the chat 💀`;
      case 'aesthetic':
        return `✨ ${grave.title} ✨\n\nYou brought so much joy\nNow you rest among the stars\n\nForever grateful 🌙💫`;
      case 'dramatic':
        return `⚰️ FUNERAL SERVICE\n\nToday we lay to rest\n${grave.title}\n\nA moment of silence... 🕯️\n\n*plays Taps*`;
      default:
        return `RIP ${grave.title} 💔`;
    }
  };

  const getInstructions = (template: StoryTemplate) => {
    const baseInstructions = [
      '📱 Take screenshot of memorial card (9:16 ratio)',
      '📲 Open Instagram and tap "Your Story"',
      '🖼️ Upload the memorial card image',
      '✨ Add stickers and text as described below',
    ];

    const specificInstructions = {
      'memorial': [
        '🎨 Add black overlay (50% opacity)',
        '🕯️ Search "candle" stickers, add 2-3',
        '💔 Add "RIP" text in white, large font',
        '📅 Add dates in smaller text',
        '🔗 Add "Link in Bio" sticker'
      ],
      'funny': [
        '🎭 Use bright background or gradient',
        '😂 Add laughing emoji stickers',
        '💀 Add skull stickers around image',
        '🏷️ Add "OBITUARY" text banner',
        '🔗 Add link sticker with "Full Roast Here"'
      ],
      'aesthetic': [
        '✨ Add sparkle/star stickers',
        '🌸 Use pastel color overlays',
        '📝 Add quote in script font',
        '🌙 Add moon/celestial stickers',
        '🔗 Add subtle link sticker'
      ],
      'dramatic': [
        '⚫ Add dark overlay',
        '🕯️ Add multiple candle stickers',
        '🌹 Add rose petal stickers',
        '⚰️ Add "FUNERAL" text banner',
        '🎵 Add music sticker (sad song)'
      ]
    };

    return [...baseInstructions, ...specificInstructions[template.style] || []];
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
        <h3 className="text-xl font-bold text-white mb-2">📱 Instagram Story Templates</h3>
        <p className="text-sm text-gray-400">
          Create viral Instagram Stories that drive traffic to your memorial
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storyTemplates.map((template) => (
          <div
            key={template.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedTemplate?.id === template.id
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-white text-sm">{template.name}</h4>
              {template.trending && (
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded">
                  🔥 TRENDING
                </span>
              )}
            </div>
            
            <p className="text-xs text-gray-400 mb-2">{template.description}</p>
            
            <div className="text-xs text-gray-500">
              <span className="font-medium">Style:</span> {template.colors}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-white">{selectedTemplate.name}</h4>
            <button
              onClick={() => {
                const content = generateStoryContent(selectedTemplate);
                copyToClipboard(content.caption);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {copied ? '✅ Copied!' : '📋 Copy Story Caption'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Story Elements */}
            <div>
              <h5 className="font-semibold text-white mb-3">✨ Story Elements</h5>
              <div className="space-y-2">
                {selectedTemplate.elements.map((element, index) => (
                  <div key={index} className="text-sm text-gray-300 bg-gray-700/30 p-2 rounded">
                    {element}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h5 className="font-semibold text-white mb-3">📱 How to Create</h5>
              <div className="space-y-1">
                {generateStoryContent(selectedTemplate).instructions.map((instruction, index) => (
                  <div key={index} className="text-sm text-gray-400">
                    {index + 1}. {instruction}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Story Text Preview */}
          <div className="mt-6 p-4 bg-gray-900/50 rounded border border-gray-600">
            <h5 className="font-semibold text-white mb-2">📱 Story Caption Preview</h5>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
              {generateStoryContent(selectedTemplate).caption}
            </pre>
          </div>

          {/* Story Engagement Tips */}
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded">
            <h6 className="font-semibold text-blue-400 mb-2">📈 Story Engagement Tips</h6>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <strong>Post at peak hours:</strong> 12-3 PM and 7-9 PM for max views</li>
              <li>• <strong>Use interactive stickers:</strong> Polls, questions, quizzes increase engagement</li>
              <li>• <strong>Add music:</strong> Stories with music get 30% more engagement</li>
              <li>• <strong>Use location tags:</strong> Help local users discover your content</li>
              <li>• <strong>Add "Close Friends":</strong> Share to close friends list for intimate memorial</li>
              <li>• <strong>Cross-promote:</strong> Share story to your main feed as a highlight</li>
            </ul>
          </div>

          {/* Call to Action */}
          <div className="mt-4 text-center">
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  const content = generateStoryContent(selectedTemplate);
                  copyToClipboard(content.caption);
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                📋 Copy Caption
              </button>
              <button
                onClick={() => {
                  // Open Instagram in new tab
                  const instagramUrl = 'https://www.instagram.com/';
                  window.open(instagramUrl, '_blank');
                }}
                className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                📱 Open Instagram
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Stories Best Practices */}
      <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg p-4">
        <h5 className="font-semibold text-pink-400 mb-2">✨ Instagram Stories Success Guide</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h6 className="font-medium text-white mb-2">📊 Engagement Boosters:</h6>
            <ul className="space-y-1">
              <li>• Use 9:16 aspect ratio for full screen</li>
              <li>• Add interactive elements (polls, questions)</li>
              <li>• Include trending music or sounds</li>
              <li>• Use location and hashtag stickers</li>
              <li>• Post consistently (daily stories perform better)</li>
            </ul>
          </div>
          <div>
            <h6 className="font-medium text-white mb-2">🎯 Traffic Generation:</h6>
            <ul className="space-y-1">
              <li>• Add "Link in Bio" sticker with clear CTA</li>
              <li>• Use "Swipe Up" if you have 10k+ followers</li>
              <li>• Create story highlights for permanent visibility</li>
              <li>• Cross-promote on main feed and other platforms</li>
              <li>• Encourage followers to share to their stories</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}