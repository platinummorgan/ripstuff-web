import { PageHero } from "@/components/PageHero";

export default function GuidelinesPage() {
  return (
    <div className="space-y-12">
      <PageHero
        eyebrow="Community"
        title="Virtual Graveyard Guidelines"
        description="Help us maintain a respectful and meaningful memorial space for everyone."
      />

      <div className="mx-auto max-w-4xl">
        <div className="space-y-10">
          {/* Core Principles */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Core Principles</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-[var(--muted)] leading-relaxed">
                Virtual Graveyard is a space for celebrating the objects that served us well 
                and sharing the stories behind them. We believe in treating every memorial 
                with dignity and respect.
              </p>
            </div>
          </section>

          {/* What to Memorial */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">What Can Be Memorialized</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-6">
                <h3 className="mb-3 text-lg font-semibold text-green-400">✓ Encouraged</h3>
                <ul className="space-y-2 text-sm text-[var(--muted)]">
                  <li>• Household items and appliances</li>
                  <li>• Technology and gadgets</li>
                  <li>• Clothing and accessories</li>
                  <li>• Tools and equipment</li>
                  <li>• Toys and collectibles</li>
                  <li>• Vehicle parts or whole vehicles</li>
                  <li>• Kitchen items and cookware</li>
                  <li>• Musical instruments</li>
                </ul>
              </div>
              
              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-6">
                <h3 className="mb-3 text-lg font-semibold text-red-400">✗ Not Allowed</h3>
                <ul className="space-y-2 text-sm text-[var(--muted)]">
                  <li>• Living beings (people, pets, plants)</li>
                  <li>• Explicit or adult content</li>
                  <li>• Illegal items or substances</li>
                  <li>• Hate symbols or discriminatory content</li>
                  <li>• Weapons designed to harm people</li>
                  <li>• Items used for harassment</li>
                  <li>• Copyrighted material without permission</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Community Standards */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Community Standards</h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-6">
                <h3 className="mb-3 text-lg font-semibold text-white">Be Respectful</h3>
                <p className="text-sm text-[var(--muted)]">
                  Every memorial represents something meaningful to someone. Treat all graves 
                  with respect, even if the item seems trivial to you. Avoid mocking or 
                  dismissive comments.
                </p>
              </div>
              
              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-6">
                <h3 className="mb-3 text-lg font-semibold text-white">Share Genuine Stories</h3>
                <p className="text-sm text-[var(--muted)]">
                  We value authentic experiences. Share real stories about items that actually 
                  belonged to you or someone you know. Fictional or joke submissions may be removed.
                </p>
              </div>
              
              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-6">
                <h3 className="mb-3 text-lg font-semibold text-white">Keep It Clean</h3>
                <p className="text-sm text-[var(--muted)]">
                  Use appropriate language and avoid excessive profanity. Remember that people 
                  of all ages may visit these memorials.
                </p>
              </div>
              
              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-6">
                <h3 className="mb-3 text-lg font-semibold text-white">No Spam or Self-Promotion</h3>
                <p className="text-sm text-[var(--muted)]">
                  Don't use memorials to advertise products or services. Focus on the genuine 
                  story of the item's life and service.
                </p>
              </div>
            </div>
          </section>

          {/* Moderation */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Moderation & Reporting</h2>
            <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-6 space-y-4">
              <p className="text-sm text-[var(--muted)]">
                Our community helps keep Virtual Graveyard a respectful space:
              </p>
              <ul className="space-y-2 text-sm text-[var(--muted)] ml-4">
                <li>• Report inappropriate content using the flag button on any grave</li>
                <li>• All reports are reviewed by our moderation team</li>
                <li>• Repeated violations may result in content removal</li>
                <li>• Appeals can be submitted through our contact form</li>
              </ul>
            </div>
          </section>

          {/* Privacy */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Privacy & Safety</h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-6">
                <h3 className="mb-3 text-lg font-semibold text-white">Personal Information</h3>
                <p className="text-sm text-[var(--muted)]">
                  Don't include personal information like full names, addresses, phone numbers, 
                  or financial details in your memorial stories.
                </p>
              </div>
              
              <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-6">
                <h3 className="mb-3 text-lg font-semibold text-white">Public Nature</h3>
                <p className="text-sm text-[var(--muted)]">
                  All memorials are public and may be viewed by anyone on the internet. 
                  Only share stories you're comfortable having publicly associated with you.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="border-t border-[rgba(255,255,255,0.1)] pt-8">
            <div className="text-center space-y-4">
              <p className="text-sm text-[var(--muted)]">
                These guidelines help us maintain Virtual Graveyard as a meaningful space 
                for everyone. Thank you for being part of our community.
              </p>
              <p className="text-xs text-[var(--muted)]">
                Last updated: January 2024
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}