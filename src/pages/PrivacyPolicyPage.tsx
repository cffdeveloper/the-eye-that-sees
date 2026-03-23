import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { PRIVACY_POLICY_URL, SITE_URL } from "@/lib/site";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy policy">
      <p className="text-muted-foreground">
        This policy describes how Infinitygap (“we”, “us”) handles information when you use our service at{" "}
        <a href={SITE_URL} className="text-primary font-medium hover:underline">
          {SITE_URL}
        </a>
        . Public URL for this document:{" "}
        <a href={PRIVACY_POLICY_URL} className="text-primary font-medium hover:underline break-all">
          {PRIVACY_POLICY_URL}
        </a>
        .
      </p>

      <h2>Information we collect</h2>
      <p>
        We collect information you provide when you create an account (such as name, email, and profile details),
        content you submit to the product (for example research prompts and preferences), and technical data needed
        to run the service (such as device/browser type, approximate region if you enable geo features, and standard
        server logs).
      </p>

      <h2>How we use information</h2>
      <p>
        We use account and usage data to provide and improve Infinitygap, personalize your experience, secure the
        platform, communicate with you about the service, and comply with law. AI-assisted features process your inputs
        according to our infrastructure and provider terms.
      </p>

      <h2>Sharing</h2>
      <p>
        We may share data with subprocessors that host or operate the service (for example cloud and authentication
        providers), when required by law, or to protect rights and safety. We do not sell your personal information.
      </p>

      <h2>Retention</h2>
      <p>
        We retain information as long as your account is active or as needed to provide the service, comply with legal
        obligations, resolve disputes, and enforce our agreements.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Access or update profile information in the product where available.</li>
        <li>Request deletion of your account by contacting us (we may retain certain records where required).</li>
        <li>Opt out of non-essential communications via links in our emails, where applicable.</li>
      </ul>

      <h2>Security</h2>
      <p>
        We use industry-standard measures appropriate to the nature of the service. No method of transmission over the
        internet is completely secure.
      </p>

      <h2>International users</h2>
      <p>
        If you access the service from outside the country where our providers operate, your information may be
        transferred and processed in those regions.
      </p>

      <h2>Children</h2>
      <p>Infinitygap is not directed at children under 16, and we do not knowingly collect their personal data.</p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. We will post the revised version on this page and update the “Last
        updated” date.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions, contact us through the channels listed on{" "}
        <a href={SITE_URL} className="text-primary font-medium hover:underline">
          {SITE_URL}
        </a>
        .
      </p>

      <p className="text-xs text-muted-foreground pt-4">
        Infinitygap provides market intelligence tools for informational purposes only. Nothing on this site is
        financial, legal, or investment advice.
      </p>
    </LegalPageShell>
  );
}
