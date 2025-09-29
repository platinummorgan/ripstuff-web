"use client";

import { useState } from "react";

interface TikTokEmbedProps {
  graveId: string;
  graveTitle: string;
}

interface TikTokVideo {
  id: string;
  url: string;
  embedCode: string;
  username: string;
  description: string;
  addedAt: string;
  verified: boolean;
}

export function TikTokEmbed({ graveId, graveTitle }: TikTokEmbedProps) {
  const [tikTokUrl, setTikTokUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  // Mock data - in real implementation, this would come from your database
  const mockVideos: TikTokVideo[] = [
    {
      id: '1',
      url: 'https://www.tiktok.com/@username/video/1234567890',
      embedCode: '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@username/video/1234567890" data-video-id="1234567890"><section></section></blockquote>',
      username: '@phonebreaker123',
      description: 'RIP my iPhone 12 💔 Dramatic funeral service #RIPMyStuff',
      addedAt: '2025-09-28',
      verified: true
    }
  ];

  const extractTikTokId = (url: string): string | null => {
    // Extract TikTok video ID from various URL formats
    const patterns = [
      /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
      /vm\.tiktok\.com\/(\w+)/,
      /tiktok\.com\/t\/(\w+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const submitTikTok = async () => {
    if (!tikTokUrl) return;
    
    setIsLoading(true);
    
    try {
      // In real implementation, this would call your API
      const videoId = extractTikTokId(tikTokUrl);
      if (!videoId) {
        alert('Invalid TikTok URL format');
        return;
      }

      // Mock API call - replace with actual implementation
      const newVideo: TikTokVideo = {
        id: Date.now().toString(),
        url: tikTokUrl,
        embedCode: generateEmbedCode(videoId),
        username: '@user', // Would be extracted from TikTok API
        description: `Memorial TikTok for ${graveTitle}`,
        addedAt: new Date().toISOString().split('T')[0],
        verified: false // Needs moderation
      };

      setVideos([...videos, newVideo]);
      setTikTokUrl('');
      setShowSubmissionForm(false);
      
    } catch (error) {
      console.error('Failed to submit TikTok:', error);
      alert('Failed to submit TikTok. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmbedCode = (videoId: string): string => {
    return `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@user/video/${videoId}" data-video-id="${videoId}"><section></section></blockquote>`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">🎬 Community TikToks</h3>
        <p className="text-sm text-gray-400">
          TikTok burial ceremonies created by the community for this memorial
        </p>
      </div>

      {/* Submit TikTok Section */}
      <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg p-4">
        {!showSubmissionForm ? (
          <div className="text-center">
            <h4 className="font-semibold text-white mb-2">📱 Created a TikTok for this memorial?</h4>
            <p className="text-sm text-gray-300 mb-3">
              Share your burial ceremony video with the community!
            </p>
            <button
              onClick={() => setShowSubmissionForm(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Submit Your TikTok
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Submit Your TikTok</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">TikTok URL</label>
                <input
                  type="url"
                  value={tikTokUrl}
                  onChange={(e) => setTikTokUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@username/video/1234567890"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={submitTikTok}
                  disabled={isLoading || !tikTokUrl}
                  className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  onClick={() => {
                    setShowSubmissionForm(false);
                    setTikTokUrl('');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              ⚠️ Videos will be reviewed before appearing publicly
            </p>
          </div>
        )}
      </div>

      {/* Embedded TikToks */}
      {videos.length > 0 ? (
        <div className="space-y-4">
          <h4 className="font-semibold text-white">Community Videos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">{video.username}</p>
                      <p className="text-sm text-gray-400">{video.description}</p>
                    </div>
                    {video.verified && (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
                
                {/* TikTok Embed */}
                <div className="aspect-[9/16] max-w-[300px] mx-auto bg-black rounded-lg overflow-hidden">
                  {/* This would be the actual TikTok embed */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600">
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2">🎬</div>
                      <p className="text-sm">TikTok Video</p>
                      <p className="text-xs opacity-75">Click to play</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-400 hover:text-pink-300 text-sm"
                  >
                    View on TikTok →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-800/30 rounded-lg border border-gray-700">
          <div className="text-4xl mb-3">🎭</div>
          <p className="text-gray-400 mb-2">No community TikToks yet</p>
          <p className="text-sm text-gray-500">Be the first to create a burial ceremony video!</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h5 className="font-semibold text-blue-400 mb-2">📋 How to Submit Your TikTok</h5>
        <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
          <li>Create your burial ceremony using our templates above</li>
          <li>Post to TikTok with hashtags including #RIPMyStuff</li>
          <li>Copy your TikTok video URL</li>
          <li>Submit it here - we'll review and embed it</li>
          <li>Your video will appear for other mourners to see!</li>
        </ol>
      </div>
    </div>
  );
}

// You would also need to add the TikTok embed script to your layout
export function TikTokScript() {
  return (
    <script
      async
      src="https://www.tiktok.com/embed.js"
    />
  );
}