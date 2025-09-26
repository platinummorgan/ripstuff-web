import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <PageHero
        title="Data Deletion Instructions"
        description="How to request deletion of your personal data from RipStuff"
      />

      <div className="mx-auto max-w-3xl px-6 py-12 space-y-12">
        <section>
          <SectionHeader title="Your Right to Data Deletion" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              You have the right to request deletion of your personal data from RipStuff.
              This page explains how to request data deletion and what information will be removed.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="What Data Can Be Deleted" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>When you request data deletion, we will remove:</p>
            <ul>
              <li>Your account information (if you have an account)</li>
              <li>Profile information from social media login</li>
              <li>Personal identifying information</li>
              <li>Contact information</li>
              <li>Usage analytics tied to your identity</li>
            </ul>
            <p>
              <strong>Note:</strong> Content you've created (graves, eulogies, messages) may remain on the platform
              if it serves a legitimate memorial purpose, but will be anonymized and no longer linked to your identity.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="How to Request Data Deletion" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>To request deletion of your personal data:</p>
            <ol>
              <li>
                <strong>Contact Us:</strong> Send a deletion request using the Contact button
                in the footer of our website, or email us directly at privacy@ripstuff.net
              </li>
              <li>
                <strong>Verification:</strong> We may need to verify your identity to process
                the request. Please provide information that helps us locate your data.
              </li>
              <li>
                <strong>Processing:</strong> We will process your request within 30 days
                and confirm when your data has been deleted.
              </li>
            </ol>
          </div>
        </section>

        <section>
          <SectionHeader title="Account Deletion" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              If you have a user account and want to delete it entirely:
            </p>
            <ul>
              <li>Sign in to your account</li>
              <li>Go to your profile settings</li>
              <li>Look for the "Delete Account" option</li>
              <li>Follow the confirmation process</li>
            </ul>
            <p>
              Account deletion will remove your personal information but memorial content
              may be preserved for the benefit of others who are grieving.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="Memorial Content Policy" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              Memorial content serves an important purpose for grieving families and friends.
              While we will delete your personal information upon request, memorial content
              may remain available in an anonymized form to preserve the memorial's value.
            </p>
            <p>
              If you need specific memorial content removed, please include details in your
              deletion request and we will review each case individually.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="Contact Information" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              To request data deletion or if you have questions about this policy:
            </p>
            <ul>
              <li>Email: privacy@ripstuff.net</li>
              <li>Use the Contact form in our website footer</li>
              <li>Subject line: "Data Deletion Request"</li>
            </ul>
            <p>
              Please allow up to 30 days for processing deletion requests.
              We will confirm when your request has been completed.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="Questions" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              If you have questions about data deletion or our privacy practices,
              please don't hesitate to contact us. We're committed to protecting
              your privacy and responding to your concerns.
            </p>
            <p className="text-sm text-[var(--muted)]">
              Last updated: September 25, 2025
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}