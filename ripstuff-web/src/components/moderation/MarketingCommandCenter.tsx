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
  {
    id: "phone-liquid-facebook",
    name: "Phone Liquid Damage - Facebook",
    platform: "Facebook",
    scenario: "Phone/Liquid Damage",
    template: "Ouch. I built a free Death Certificate maker for dead gadgets—gives you a shareable card (cause, age, roast vs condolences).\nPrefilled for yours: {PREFILL_LINK}\nIf you post it, I'll feature it on the homepage today."
  },
  {
    id: "console-reddit",
    name: "Console Death - Reddit",
    platform: "Reddit", 
    scenario: "Gaming Console",
    template: "Been there. Make a clean RIP card in 30s (great for the story + selling for parts).\nPrefilled: {PREFILL_LINK}\nI can also drop it into our \"Console Week\" spotlight if you want."
  },
  {
    id: "marketplace-seller",
    name: "Marketplace Seller - Any Platform",
    platform: "Marketplace",
    scenario: "Selling for Parts",
    template: "Selling for parts? A Death Certificate pic helps buyers get the story fast.\nPrefilled for your listing: {PREFILL_LINK}\nDownload the image and add it to your photos; it shows cause + age at a glance."
  },
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
    { name: "PlayStation 5", category: "TOYS_GAMES", cause: "Liquid damage", epitaph: "Slipped into a Pepsi Max" },
    { name: "iPhone 15", category: "TECH_GADGETS", cause: "Battery bloat", epitaph: "Swollen like a pufferfish" },
    { name: "AirPods Pro", category: "TECH_GADGETS", cause: "Laundry cycle", epitaph: "Took a spin too far" },
    { name: "MacBook Pro", category: "TECH_GADGETS", cause: "Coffee spill", epitaph: "Death by morning brew" },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <h2 className="col-span-full text-xl font-semibold text-white mb-4">⚡ Quick Examples</h2>
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
            <div className="font-medium text-white">{example.name}</div>
            <div className="text-sm text-[var(--muted)]">{example.cause}</div>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">📝 Create Prefilled Link</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Item Name</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., iPhone 15 Pro"
                className="w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-white placeholder:text-[var(--muted)] focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-white focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
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
              <label className="block text-sm font-medium text-white mb-2">Cause of Death</label>
              <input
                type="text"
                value={causeOfDeath}
                onChange={(e) => setCauseOfDeath(e.target.value)}
                placeholder="e.g., Liquid damage, Battery bloat, Overheat"
                className="w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-white placeholder:text-[var(--muted)] focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Epitaph (Optional)</label>
              <input
                type="text"
                value={epitaph}
                onChange={(e) => setEpitaph(e.target.value)}
                placeholder="e.g., Died updating, Water found a way"
                className="w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-white placeholder:text-[var(--muted)] focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-white focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              >
                <option value="facebook">Facebook</option>
                <option value="reddit">Reddit</option>
                <option value="twitter">Twitter</option>
                <option value="tiktok">TikTok</option>
                <option value="marketplace">Marketplace</option>
                <option value="discord">Discord</option>
              </select>
            </div>

            <Button onClick={generatePrefillLink} className="w-full">
              🔗 Generate Prefill Link
            </Button>
          </div>
        </div>

        {/* Right Column: Templates and Output */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">💬 Response Templates</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Template</label>
              <select
                value={selectedTemplate.id}
                onChange={(e) => {
                  const template = DEFAULT_TEMPLATES.find(t => t.id === e.target.value);
                  if (template) setSelectedTemplate(template);
                }}
                className="w-full rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-white focus:border-[rgba(154,230,180,0.5)] focus:outline-none"
              >
                {DEFAULT_TEMPLATES.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.02)]">
              <div className="text-sm text-[var(--muted)] mb-2">
                Platform: {selectedTemplate.platform} | Scenario: {selectedTemplate.scenario}
              </div>
              <div className="text-sm text-white whitespace-pre-line">
                {selectedTemplate.template}
              </div>
            </div>
          </div>

          {/* Generated Output */}
          {generatedLink && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">🎯 Generated Output</h3>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Prefilled Link</label>
                  <Button
                    variant="secondary"
                    onClick={() => copyToClipboard(generatedLink)}
                    className="text-xs px-3 py-1"
                  >
                    📋 Copy
                  </Button>
                </div>
                <div className="p-3 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.02)] text-sm text-white break-all">
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
                <div className="p-3 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.02)] text-sm text-white whitespace-pre-line">
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
  );
}