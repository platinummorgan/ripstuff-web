"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

interface OutreachTemplate {
  id: string;
  name: string;
  platform: string;
  scenario: string;
  template: string;
}

const DEFAULT_TEMPLATES: OutreachTemplate[] = [
  // Twitter Templates (280 char limit)
  {
    id: "broken-item-twitter",
    name: "Broken Item - Twitter",
    platform: "Twitter",
    scenario: "General Broken Item",
    template: "Ouch! Built a free Death Certificate maker for broken stuff like this 😅\nPrefilled: {PREFILL_LINK}\nRIP little guy 🪦"
  },
  {
    id: "expensive-fail-twitter",
    name: "Expensive Tech Fail - Twitter", 
    platform: "Twitter",
    scenario: "Expensive Device Death",
    template: "That's a $200+ oops 😬\nFree memorial maker: {PREFILL_LINK}\nAt least get a shareable RIP card out of it 💀📱"
  },
  {
    id: "collectible-twitter",
    name: "Collectible/Figurine - Twitter",
    platform: "Twitter", 
    scenario: "Collectible/Toy Damage",
    template: "F in the chat 💀\nMade a Death Certificate generator for moments like this: {PREFILL_LINK}\nTurn your L into a W 📜✨"
  },
  
  // TikTok Templates (casual, emoji-heavy)
  {
    id: "phone-drop-tiktok",
    name: "Phone Drop - TikTok",
    platform: "TikTok",
    scenario: "Phone Death",
    template: "NOOO not the phone 😭💔 Made this for u: {PREFILL_LINK} Get ur RIP certificate bestie ✨📱⚰️"
  },
  {
    id: "gaming-fail-tiktok", 
    name: "Gaming Death - TikTok",
    platform: "TikTok",
    scenario: "Gaming Device",
    template: "RIP to a real one 🎮💀 Free death cert here: {PREFILL_LINK} Post it and tag me! 🔥📜"
  },
  {
    id: "liquid-damage-tiktok",
    name: "Liquid Damage - TikTok", 
    platform: "TikTok",
    scenario: "Water/Liquid Damage",
    template: "Water said ✨violence✨ 💧☠️ Get a memorial card: {PREFILL_LINK} ur device deserves a proper funeral fr 🪦"
  },

  // YouTube Templates (longer, helpful tone)
  {
    id: "tutorial-fail-youtube",
    name: "Tutorial Fail - YouTube",
    platform: "YouTube",
    scenario: "DIY/Repair Gone Wrong", 
    template: "Oof, that tutorial didn't go as planned! 😅 I built a Death Certificate generator for moments like this: {PREFILL_LINK}\nPerfect for the thumbnail or just for closure. RIP to your project! 🔧⚰️"
  },
  {
    id: "unboxing-disaster-youtube",
    name: "Unboxing Disaster - YouTube",
    platform: "YouTube",
    scenario: "Unboxing/New Item Damage",
    template: "That's the worst unboxing ever! 📦💔 Made a memorial maker for dead gadgets: {PREFILL_LINK}\nMight make a good follow-up video - 'Death Certificate for My Dead [Device]' 😂🪦"
  },

  // Facebook Templates (detailed, friendly)
  {
    id: "phone-liquid-facebook",
    name: "Phone Liquid Damage - Facebook",
    platform: "Facebook",
    scenario: "Phone/Liquid Damage",
    template: "Ouch. I built a free Death Certificate maker for dead gadgets—gives you a shareable card (cause, age, roast vs condolences).\nPrefilled for yours: {PREFILL_LINK}\nIf you post it, I'll feature it on the homepage today."
  },
  {
    id: "family-device-facebook",
    name: "Family Device Death - Facebook",
    platform: "Facebook",
    scenario: "Family/Shared Device",
    template: "Oh no! The family [device] has passed 😢 I made a Death Certificate generator that might give you some closure: {PREFILL_LINK}\nIt's free and kind of therapeutic. Plus you get a shareable memorial card!"
  },

  // Reddit Templates (community-focused, helpful)
  {
    id: "console-reddit",
    name: "Console Death - Reddit",
    platform: "Reddit", 
    scenario: "Gaming Console",
    template: "Been there. Make a clean RIP card in 30s (great for the story + selling for parts).\nPrefilled: {PREFILL_LINK}\nI can also drop it into our \"Console Week\" spotlight if you want."
  },
  {
    id: "pc-build-reddit",
    name: "PC Build Fail - Reddit",
    platform: "Reddit",
    scenario: "PC Building/Hardware",
    template: "F for your build 💀 Made a Death Certificate maker for these exact moments: {PREFILL_LINK}\nMight help with the grieving process, plus you get a meme-worthy certificate to share."
  },

  // Marketplace Templates (business-focused)
  {
    id: "marketplace-seller",
    name: "Marketplace Seller - Any Platform", 
    platform: "Marketplace",
    scenario: "Selling for Parts",
    template: "Selling for parts? A Death Certificate pic helps buyers get the story fast.\nPrefilled for your listing: {PREFILL_LINK}\nDownload the image and add it to your photos; it shows cause + age at a glance."
  },

  // Partnership Templates
  {
    id: "repair-shop",
    name: "Repair Shop Partnership",
    platform: "Direct Message",
    scenario: "Business Partnership", 
    template: "I run RIPStuff—we generate a clean certificate for dead devices (cause, age, roast/sympathy meter).\nHere's a co-branded link for your customers: https://ripstuff.net/bury?ref={SHOP_NAME}\nIt's free; they get a shareable image. I'll feature a few weekly and shout out your shop."
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
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

            <Button onClick={generatePrefillLink} className="w-full">
              🔗 Generate Prefill Link
            </Button>
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
        </div>
      </div>
    </div>
    </>
  );
}
