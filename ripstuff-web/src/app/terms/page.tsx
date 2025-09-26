import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <PageHero
        title="Terms of Service"
        description="Terms and conditions for using RipStuff"
      />

      <div className="mx-auto max-w-3xl px-6 py-12 space-y-12">
        <section>
          <SectionHeader title="Agreement to Terms" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              By accessing and using RipStuff, you accept and agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
            <p className="text-sm text-[var(--muted)]">
              Last updated: September 25, 2025
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="Description of Service" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              RipStuff is a digital memorial platform that allows users to create virtual graves,
              share eulogies, and commemorate loved ones who have passed away. Our service provides:
            </p>
            <ul>
              <li>Virtual grave creation and customization</li>
              <li>Eulogy writing and sharing</li>
              <li>Community sympathy messages</li>
              <li>Memorial photo sharing</li>
              <li>Interactive memorial experiences</li>
            </ul>
          </div>
        </section>

        <section>
          <SectionHeader title="User Accounts" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              You may use RipStuff without creating an account, but some features require authentication
              through social media login (Google, Facebook). When you create content on RipStuff:
            </p>
            <ul>
              <li>You are responsible for the accuracy and appropriateness of your content</li>
              <li>You grant us permission to display your content on the platform</li>
              <li>You retain ownership of your original content</li>
              <li>You must respect the memorial nature of the platform</li>
            </ul>
          </div>
        </section>

        <section>
          <SectionHeader title="Content Guidelines" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              RipStuff is designed to be a respectful memorial space. The following content is prohibited:
            </p>
            <ul>
              <li>Hate speech, harassment, or discriminatory content</li>
              <li>Spam, commercial advertising, or promotional material</li>
              <li>False, misleading, or defamatory information</li>
              <li>Content that violates applicable laws or regulations</li>
              <li>Inappropriate or disrespectful content regarding the deceased</li>
              <li>Copyright infringing material</li>
            </ul>
            <p>
              We reserve the right to review, edit, or remove content that violates these guidelines
              without prior notice.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="Memorial Content Policy" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              Memorial content serves an important purpose for grieving families and communities:
            </p>
            <ul>
              <li>Memorial content may remain on the platform indefinitely</li>
              <li>We aim to preserve memorials for their ongoing value to survivors</li>
              <li>Families may request modifications to memorial content</li>
              <li>We will work with families to resolve disputes about memorial content</li>
            </ul>
          </div>
        </section>

        <section>
          <SectionHeader title="Privacy and Data" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              Your privacy is important to us. Please review our Privacy Policy for information
              about how we collect, use, and protect your data. By using RipStuff, you consent
              to our data practices as described in our Privacy Policy.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="Moderation and Enforcement" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              To maintain a respectful environment, we employ both automated systems and human
              moderators. We may:
            </p>
            <ul>
              <li>Remove content that violates our guidelines</li>
              <li>Suspend or ban users who repeatedly violate terms</li>
              <li>Report illegal activity to appropriate authorities</li>
              <li>Preserve evidence of violations for legal purposes</li>
            </ul>
          </div>
        </section>

        <section>
          <SectionHeader title="Intellectual Property" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              The RipStuff platform, including its design, features, and functionality, is owned
              by us and protected by intellectual property laws. Users retain rights to their
              original content but grant us a license to display and preserve it on the platform.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="Disclaimers and Limitations" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              RipStuff is provided "as is" without warranties of any kind. We cannot guarantee:
            </p>
            <ul>
              <li>Uninterrupted or error-free service</li>
              <li>Complete security of user data</li>
              <li>Permanent preservation of all content</li>
              <li>Compatibility with all devices and browsers</li>
            </ul>
            <p>
              We are not responsible for user-generated content or disputes between users.
              Our liability is limited to the maximum extent permitted by law.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="Changes to Terms" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              We may update these Terms of Service from time to time. We will notify users
              of material changes by posting the updated terms on this page. Your continued
              use of RipStuff after changes constitutes acceptance of the new terms.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader title="Contact Information" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              If you have questions about these Terms of Service or need to report a violation:
            </p>
            <ul>
              <li>Use the Contact form in our website footer</li>
              <li>Email: support@ripstuff.net</li>
              <li>Our moderation team will review and respond to your inquiry</li>
            </ul>
          </div>
        </section>

        <section>
          <SectionHeader title="Governing Law" />
          <div className="prose prose-invert max-w-none space-y-4">
            <p>
              These terms are governed by applicable laws. Any disputes will be resolved
              according to the jurisdiction where RipStuff operates. By using our service,
              you agree to submit to the jurisdiction of our courts for dispute resolution.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}