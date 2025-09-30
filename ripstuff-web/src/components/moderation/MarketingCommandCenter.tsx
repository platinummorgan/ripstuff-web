"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/Button";

interface OutreachTemplate {
  id: string;
  name: string;
  platform: string;
  scenario: string;
  template: string;
}

const DEFAULT_TEMPLATES: OutreachTemplate[] = [
  // Twitter Templates (280 char limit) - Natural, Empathetic
  {
    id: "broken-item-twitter",
    name: "Sympathetic Response - Twitter",
    platform: "Twitter",
    scenario: "General Broken Item",
    template: "Oh no! � RIP little buddy\n\nSomeone showed me this memorial thing for dead gadgets: {PREFILL_LINK}\nKinda therapeutic tbh"
  },
  {
    id: "expensive-fail-twitter",
    name: "Expensive Tech Fail - Twitter", 
    platform: "Twitter",
    scenario: "Expensive Device Death",
    template: "That physically hurts to look at 😬💸\n\nMy friend told me about this RIP generator: {PREFILL_LINK}\nAt least you can give it a proper sendoff?"
  },
  {
    id: "collectible-twitter",
    name: "Collectible/Figurine - Twitter",
    platform: "Twitter", 
    scenario: "Collectible/Toy Damage",
    template: "Noooo not the collectible! �\n\nSaw someone do a memorial for their broken figurine here: {PREFILL_LINK}\nActually pretty cool way to honor it"
  },
  {
    id: "visual-asset-twitter",
    name: "Shared Discovery - Twitter",
    platform: "Twitter", 
    scenario: "With Image Asset",
    template: "This is genius! Someone in my group chat shared this memorial maker: {PREFILL_LINK}\nPerfect for moments like this 💀"
  },
  
  // TikTok Templates (casual, helpful)
  {
    id: "phone-drop-tiktok",
    name: "Phone Drop - TikTok",
    platform: "TikTok",
    scenario: "Phone Death",
    template: "PAIN 😭💔 My cousin did one of those RIP certificates for her dead phone and it was actually hilarious: {PREFILL_LINK}"
  },
  {
    id: "gaming-fail-tiktok", 
    name: "Gaming Death - TikTok",
    platform: "TikTok",
    scenario: "Gaming Device",
    template: "RIP to a real one 🎮💀 Someone showed me this memorial thing for dead consoles: {PREFILL_LINK} kinda fire ngl"
  },
  {
    id: "liquid-damage-tiktok",
    name: "Liquid Damage - TikTok", 
    platform: "TikTok",
    scenario: "Water/Liquid Damage",
    template: "Water damage is pure evil 💧☠️ bestie shared this memorial maker with me: {PREFILL_LINK} actually therapeutic lol"
  },

  // YouTube Templates (helpful, natural)
  {
    id: "tutorial-fail-youtube",
    name: "Tutorial Fail - YouTube",
    platform: "YouTube",
    scenario: "DIY/Repair Gone Wrong", 
    template: "Oof, been there! 😅 A friend showed me this death certificate thing for failed projects: {PREFILL_LINK}\nMight be good for a follow-up video or just for closure lol"
  },
  {
    id: "unboxing-disaster-youtube",
    name: "Unboxing Disaster - YouTube",
    platform: "YouTube",
    scenario: "Unboxing/New Item Damage",
    template: "That's brutal! 📦💔 Saw someone do a memorial for their DOA gadget: {PREFILL_LINK}\nCould make an interesting follow-up - from unboxing to obituary 😂"
  },

  // Facebook Templates (conversational, helpful)
  {
    id: "phone-liquid-facebook",
    name: "Water Damage Sympathy - Facebook",
    platform: "Facebook",
    scenario: "Phone/Liquid Damage",
    template: "Ugh, water damage is the worst! 😭 A friend told me about this quirky memorial site for dead gadgets: {PREFILL_LINK}\nMight give you some closure (and it's actually pretty funny)"
  },
  {
    id: "family-device-facebook",
    name: "Family Device Loss - Facebook",
    platform: "Facebook",
    scenario: "Family/Shared Device",
    template: "Oh no, not the family device! 😢 My neighbor did one of those RIP certificates for her broken tablet and the kids thought it was hilarious: {PREFILL_LINK}\nMight be worth a try for some closure!"
  },

  // Reddit Templates (community-focused, natural)
  {
    id: "console-reddit",
    name: "Console Death - Reddit",
    platform: "Reddit", 
    scenario: "Gaming Console",
    template: "F in chat 💀 Someone in r/gaming showed me this memorial thing: {PREFILL_LINK}\nActually therapeutic + good if you're selling for parts (shows the backstory)"
  },
  {
    id: "pc-build-reddit",
    name: "PC Build Fail - Reddit",
    platform: "Reddit",
    scenario: "PC Building/Hardware",
    template: "RIP your build � Saw someone post a death certificate for their fried motherboard here: {PREFILL_LINK}\nKinda genius way to process the grief lol"
  },

  // Discord Templates (casual gaming community)
  {
    id: "controller-discord",
    name: "Controller Death - Discord",
    platform: "Discord",
    scenario: "Gaming Controller",
    template: "RIP controller 🎮 someone in another server showed me this memorial thing: {PREFILL_LINK}\npretty funny way to honor fallen gaming gear ngl"
  },

  // Instagram Templates (visual, trendy)
  {
    id: "aesthetic-fail-instagram",
    name: "Aesthetic Item Break - Instagram", 
    platform: "Instagram",
    scenario: "Aesthetic/Decor Items",
    template: "the aesthetic is ruined 😭✨ bestie showed me this memorial maker for broken stuff: {PREFILL_LINK}\nkinda cute way to say goodbye"
  },

  // General Empathy Templates
  {
    id: "general-empathy",
    name: "General Sympathy - Any Platform",
    platform: "Any Platform",
    scenario: "General Empathy",
    template: "That's rough! 😭 Someone shared this memorial thing with me and it's actually pretty therapeutic: {PREFILL_LINK}\nMight be worth checking out for closure"
  }
];

export function MarketingCommandCenter() {
  const [selectedTemplate, setSelectedTemplate] = useState<OutreachTemplate>(DEFAULT_TEMPLATES[0]);
  const [customMessage, setCustomMessage] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("TECH_GADGETS");
  const [causeOfDeath, setCauseOfDeath] = useState("");
  const [epitaph, setEpitaph] = useState("");
  const [platform, setPlatform] = useState("facebook");
  const [generatedLink, setGeneratedLink] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [generatedAssets, setGeneratedAssets] = useState<{
    deathCert: string;
    graveCard: string;
    twitterCard: string;
  } | null>(null);

  const generatePrefillLink = () => {
    const params = new URLSearchParams();
    if (itemName) params.set('title', itemName);
    if (category) params.set('category', category);
    if (causeOfDeath) params.set('cause', causeOfDeath);
    if (epitaph) params.set('epitaph', epitaph);
    params.set('utm_source', platform);
    params.set('utm_campaign', 'outreach');
    
    const link = `https://ripstuff.net/bury?${params.toString()}`;
    setGeneratedLink(link);
    
    // Generate message with the link
    const message = selectedTemplate.template.replace('{PREFILL_LINK}', link);
    setGeneratedMessage(message);
  };

  // Auto-generate link when inputs change
  useEffect(() => {
    if (itemName.trim()) {
      generatePrefillLink();
    }
  }, [itemName, category, causeOfDeath, epitaph, platform, selectedTemplate]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  const generateMarketingAssets = () => {
    // Generate visual assets for social media
    const baseParams = new URLSearchParams();
    if (itemName) baseParams.set('title', itemName);
    if (category) baseParams.set('category', category);
    if (causeOfDeath) baseParams.set('cause', causeOfDeath);
    if (epitaph) baseParams.set('epitaph', epitaph);
    baseParams.set('utm_source', platform);
    baseParams.set('utm_campaign', 'outreach');

    // Generate different asset URLs
    const assets = {
      deathCert: `https://ripstuff.net/api/generate/death-certificate?${baseParams.toString()}&format=image&watermark=ripstuff.net`,
      graveCard: `https://ripstuff.net/api/generate/grave-card?${baseParams.toString()}&format=twitter&brand=true`,
      twitterCard: `https://ripstuff.net/api/generate/twitter-card?${baseParams.toString()}&cta=true&style=dark`
    };
    
    setGeneratedAssets(assets);
  };

  const quickFillExamples = [
    { name: "iPhone 15", category: "TECH_GADGETS", cause: "Water damage", epitaph: "Fell in the pool", platform: "🐦 Twitter" },
    { name: "PlayStation 5", category: "TOYS_GAMES", cause: "Overheating", epitaph: "Died mid-boss fight", platform: "🎵 TikTok" },
    { name: "Gaming PC", category: "TECH_GADGETS", cause: "Power surge", epitaph: "Fried trying to run Cyberpunk", platform: "🤖 Reddit" },
    { name: "MacBook Pro", category: "TECH_GADGETS", cause: "Coffee spill", epitaph: "Death by morning brew", platform: "📘 Facebook" },
    { name: "Action Figure", category: "TOYS_GAMES", cause: "Broken joints", epitaph: "Posed one too many times", platform: "🐦 Twitter" },
    { name: "AirPods Pro", category: "TECH_GADGETS", cause: "Laundry cycle", epitaph: "Got cleaned permanently", platform: "📺 YouTube" },
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Quick Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <h2 className="col-span-full text-xl font-semibold text-[var(--foreground)] mb-4">⚡ Quick Examples</h2>
          {quickFillExamples.map((example, index) => (
            <Button
              key={index}
              variant="secondary"
              onClick={() => {
                setItemName(example.name);
                setCategory(example.category);
                setCauseOfDeath(example.cause);
                setEpitaph(example.epitaph);
              }}
              className="text-left h-auto p-4 flex flex-col items-start space-y-2"
            >
              <div className="flex items-center justify-between w-full">
                <div className="font-medium text-[var(--foreground)]">{example.name}</div>
                <div className="text-xs text-[var(--accent)]">{example.platform}</div>
              </div>
              <div className="text-sm text-[var(--muted)]">{example.cause}</div>
              <div className="text-xs text-[var(--muted)] italic">"{example.epitaph}"</div>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input Form */}
          <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">📝 Create Prefilled Link</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Item Name</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., iPhone 15 Pro"
                className="w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="marketing-select w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[var(--foreground)] focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              >
                <option value="TECH_GADGETS">📱 Tech & Gadgets</option>
                <option value="TOYS_GAMES">🎮 Toys & Games</option>
                <option value="KITCHEN_FOOD">🍽️ Kitchen & Food</option>
                <option value="CAR_TOOLS">🔧 Car & Tools</option>
                <option value="CLOTHING_LAUNDRY">👕 Clothing & Laundry</option>
                <option value="PETS_CHEWABLES">🐕 Pet Items</option>
                <option value="OUTDOORS_ACCIDENTS">🏕️ Outdoor Items</option>
                <option value="MISC">📦 Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Cause of Death</label>
              <input
                type="text"
                value={causeOfDeath}
                onChange={(e) => setCauseOfDeath(e.target.value)}
                placeholder="e.g., Liquid damage, Battery bloat, Overheat"
                className="w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Epitaph (Optional)</label>
              <input
                type="text"
                value={epitaph}
                onChange={(e) => setEpitaph(e.target.value)}
                placeholder="e.g., Died updating, Water found a way"
                className="w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="marketing-select w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[var(--foreground)] focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              >
                <option value="twitter">🐦 Twitter</option>
                <option value="tiktok">🎵 TikTok</option>
                <option value="youtube">📺 YouTube</option>
                <option value="facebook">📘 Facebook</option>
                <option value="reddit">🤖 Reddit</option>
                <option value="marketplace">🛒 Marketplace</option>
                <option value="discord">💬 Discord</option>
                <option value="instagram">📸 Instagram</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button onClick={generatePrefillLink} className="w-full">
                🔗 Generate Prefill Link
              </Button>
              <Button onClick={generateMarketingAssets} variant="secondary" className="w-full">
                🎨 Generate Visual Assets
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Templates and Output */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">💬 Response Templates</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Template</label>
              <select
                value={selectedTemplate.id}
                onChange={(e) => {
                  const template = DEFAULT_TEMPLATES.find(t => t.id === e.target.value);
                  if (template) setSelectedTemplate(template);
                }}
                className="marketing-select w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[var(--foreground)] focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              >
                <optgroup label="🐦 Twitter (280 chars)">
                  {DEFAULT_TEMPLATES.filter(t => t.platform === 'Twitter').map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🎵 TikTok (Casual & Trendy)">
                  {DEFAULT_TEMPLATES.filter(t => t.platform === 'TikTok').map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="📺 YouTube (Detailed & Helpful)">
                  {DEFAULT_TEMPLATES.filter(t => t.platform === 'YouTube').map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="📘 Facebook (Community Focused)">
                  {DEFAULT_TEMPLATES.filter(t => t.platform === 'Facebook').map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🤖 Reddit (Helpful & Meme-y)">
                  {DEFAULT_TEMPLATES.filter(t => t.platform === 'Reddit').map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🛒 Business & Marketplace">
                  {DEFAULT_TEMPLATES.filter(t => t.platform === 'Marketplace' || t.platform === 'Direct Message').map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="p-4 rounded-lg border border-white/20 bg-gray-900 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">
                  Platform: {selectedTemplate.platform} | Scenario: {selectedTemplate.scenario}
                </div>
                {selectedTemplate.platform === 'Twitter' && (
                  <div className={`text-xs px-2 py-1 rounded ${
                    selectedTemplate.template.length > 280 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                  }`}>
                    {selectedTemplate.template.replace('{PREFILL_LINK}', 'https://ripstuff.net/bury?...').length}/280
                  </div>
                )}
              </div>
              <textarea
                readOnly
                className="marketing-template-text w-full resize-none"
                value={selectedTemplate.template}
                rows={Math.max(3, selectedTemplate.template.split('\n').length)}
                style={{
                  color: '#ffffff', 
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Generated Output */}
          {generatedLink && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--foreground)]">🎯 Generated Output</h3>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Prefilled Link</label>
                  <Button
                    variant="secondary"
                    onClick={() => copyToClipboard(generatedLink)}
                    className="text-xs px-3 py-1"
                  >
                    📋 Copy
                  </Button>
                </div>
                <div 
                  style={{
                    color: '#ffffff', 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    wordBreak: 'break-all',
                    fontFamily: 'inherit'
                  }}
                >
                  {generatedLink}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Complete Message</label>
                  <Button
                    variant="secondary"
                    onClick={() => copyToClipboard(generatedMessage)}
                    className="text-xs px-3 py-1"
                  >
                    📋 Copy
                  </Button>
                </div>
                <div 
                  style={{
                    color: '#ffffff', 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    whiteSpace: 'pre-line',
                    fontFamily: 'inherit'
                  }}
                >
                  {generatedMessage}
                </div>
              </div>

              <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                <div className="text-green-400 font-medium mb-2">✅ Ready to Send!</div>
                <div className="text-sm text-green-300">
                  Copy the message above and paste it as a reply. The prefilled link will take them directly to a memorial form with their item details already filled in.
                </div>
              </div>
            </div>
          )}

          {/* Generated Visual Assets */}
          {generatedAssets && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--foreground)]">🎨 Marketing Assets</h3>
              <div className="text-sm text-[var(--muted)] mb-4">
                Post these images instead of raw links for 10x better engagement!
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Death Certificate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-[var(--foreground)]">🪦 Death Certificate</h4>
                    <Button
                      variant="secondary"
                      onClick={() => copyToClipboard(generatedAssets.deathCert)}
                      className="text-xs px-3 py-1"
                    >
                      📋 Copy URL
                    </Button>
                  </div>
                  <div className="aspect-[4/3] rounded-lg border border-[var(--border)] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                    <img 
                      src={generatedAssets.deathCert} 
                      alt="Death Certificate Preview"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-center text-[var(--muted)]">
                      <div className="text-2xl mb-2">📜</div>
                      <div className="text-sm">Official Death Certificate</div>
                      <div className="text-xs">{itemName}</div>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    Professional certificate - Perfect for Twitter posts
                  </div>
                </div>

                {/* Grave Card */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-[var(--foreground)]">🎯 Grave Card</h4>
                    <Button
                      variant="secondary"
                      onClick={() => copyToClipboard(generatedAssets.graveCard)}
                      className="text-xs px-3 py-1"
                    >
                      📋 Copy URL
                    </Button>
                  </div>
                  <div className="aspect-[4/3] rounded-lg border border-[var(--border)] bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center">
                    <img 
                      src={generatedAssets.graveCard} 
                      alt="Grave Card Preview"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-center text-[var(--muted)]">
                      <div className="text-2xl mb-2">🪦</div>
                      <div className="text-sm">Memorial Card</div>
                      <div className="text-xs">{itemName}</div>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    Compact memorial - Great for replies and shares
                  </div>
                </div>

                {/* Twitter Optimized Card */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-[var(--foreground)]">🐦 Twitter Card</h4>
                    <Button
                      variant="secondary"
                      onClick={() => copyToClipboard(generatedAssets.twitterCard)}
                      className="text-xs px-3 py-1"
                    >
                      📋 Copy URL
                    </Button>
                  </div>
                  <div className="aspect-[16/9] rounded-lg border border-[var(--border)] bg-gradient-to-r from-blue-900/20 to-cyan-900/20 flex items-center justify-center">
                    <img 
                      src={generatedAssets.twitterCard} 
                      alt="Twitter Card Preview"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-center text-[var(--muted)]">
                      <div className="text-2xl mb-2">📱</div>
                      <div className="text-sm">Twitter Optimized</div>
                      <div className="text-xs">{itemName}</div>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    16:9 format with CTA - Perfect for maximum engagement
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                <div className="text-blue-400 font-medium mb-2">🚀 Pro Marketing Tip</div>
                <div className="text-sm text-blue-300">
                  Post the image first, then add your message as a comment. This gets much better engagement than posting links directly in tweets!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
