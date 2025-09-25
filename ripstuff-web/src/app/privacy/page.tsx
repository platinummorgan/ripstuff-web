import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <PageHero
        title="Privacy Policy"
        description="How we handle your data and protect your privacy"
      />

      <div className="mx-auto max-w-3xl px-6 py-12 space-y-12">
        <section>
          <SectionHeader title="Overview" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              RipStuff respects your privacy and is committed to protecting your personal information.
              This policy explains how we collect, use, and safeguard your data when you use our service.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="Information We Collect" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>We collect and store the following types of information:</p>
            <ul>
              <li>
                <strong>Device Information:</strong> We use anonymous device identifiers to track interactions
                and prevent abuse. This helps us enforce rate limits and moderation actions.
              </li>
              <li>
                <strong>User Content:</strong> When you create a virtual grave, write eulogies, or leave
                sympathies, this content is stored on our servers and displayed publicly.
              </li>
              <li>
                <strong>Usage Data:</strong> We collect anonymous data about how users interact with the
                site to improve our services and prevent abuse.
              </li>
              <li>
                <strong>Images:</strong> Photos uploaded to graves are stored securely and processed
                through content moderation systems.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <SectionHeader title="How We Use Your Information" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>Your information is used for the following purposes:</p>
            <ul>
              <li>To provide and maintain the RipStuff service</li>
              <li>To prevent abuse and enforce our content guidelines</li>
              <li>To improve and optimize our website</li>
              <li>To respond to your requests or questions</li>
            </ul>
          </div>
        </section>

        <section>
          <SectionHeader title="Content Moderation" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              All content posted to RipStuff is subject to our content guidelines and moderation policies.
              We reserve the right to review, edit, or remove content that violates our guidelines.
            </p>
            <p>
              Automated systems and human moderators work together to ensure content remains appropriate
              and respectful.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="Data Storage & Security" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              Your data is stored securely in modern cloud infrastructure. We implement appropriate
              security measures to protect against unauthorized access, alteration, or destruction
              of your information.
            </p>
            <p>
              While we strive to protect your personal information, no method of internet transmission
              is 100% secure. We cannot guarantee absolute security.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="Contact Information" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              If you have questions about this privacy policy or our practices, please contact us
              using the Contact button in the footer. Our moderation team will review and respond
              to your inquiry.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="Changes to This Policy" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              We may update this privacy policy from time to time. We will notify users of any
              material changes by posting the new policy on this page.
            </p>
            <p className="text-sm text-[var(--muted)]">
              Last updated: September 24, 2025
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}