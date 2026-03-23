import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { SITE_URL, TERMS_OF_SERVICE_URL } from "@/lib/site";

export default function TermsOfServicePage() {
  return (
    <LegalPageShell title="Terms of service">
      <p className="text-muted-foreground">
        These terms govern your use of Infinitygap at{" "}
        <a href={SITE_URL} className="text-primary font-medium hover:underline">
          {SITE_URL}
        </a>
        . Public URL for this document:{" "}
        <a href={TERMS_OF_SERVICE_URL} className="text-primary font-medium hover:underline break-all">
          {TERMS_OF_SERVICE_URL}
        </a>
        .
      </p>

      <h2>Acceptance</h2>
      <p>
        By accessing or using the service, you agree to these Terms and our Privacy Policy. If you do not agree, do not
        use Infinitygap.
      </p>

      <h2>Description of service</h2>
      <p>
        Infinitygap provides software for market intelligence, research workflows, and related AI-assisted features.
        Outputs may be incomplete or inaccurate; you are responsible for how you use them.
      </p>

      <h2>Accounts</h2>
      <p>
        You must provide accurate registration information and safeguard your credentials. You are responsible for
        activity under your account. Notify us promptly of unauthorized use.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Violate applicable laws or third-party rights.</li>
        <li>Attempt to probe, disrupt, or overload the service or other users’ accounts.</li>
        <li>Use the service to distribute malware, spam, or misleading content at scale.</li>
        <li>Scrape, resell, or redistribute the service in ways that breach our agreements or provider terms.</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        We and our licensors own the service, branding, and underlying technology. We grant you a limited, revocable,
        non-exclusive license to use the service for your internal business purposes in line with these Terms.
      </p>

      <h2>Third-party services</h2>
      <p>
        The product may integrate with third-party APIs and providers (including authentication and AI services).
        Their terms and privacy practices also apply where relevant.
      </p>

      <h2>Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL
        WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
        NON-INFRINGEMENT. Infinitygap IS NOT FINANCIAL, LEGAL, OR INVESTMENT ADVICE.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
        CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE
        SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE AMOUNTS YOU PAID US FOR
        THE SERVICE IN THE TWELVE (12) MONTHS BEFORE THE CLAIM, OR ONE HUNDRED DOLLARS (USD $100), WHICHEVER IS GREATER,
        IF APPLICABLE.
      </p>

      <h2>Indemnity</h2>
      <p>
        You will defend and indemnify us against claims arising from your misuse of the service, your content, or your
        violation of these Terms.
      </p>

      <h2>Suspension and termination</h2>
      <p>
        We may suspend or terminate access for conduct that risks the service or other users, or for repeated violation
        of these Terms. You may stop using the service at any time.
      </p>

      <h2>Changes</h2>
      <p>
        We may modify these Terms or the service. Material changes will be indicated by updating the “Last updated” date.
        Continued use after changes constitutes acceptance.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws applicable to the operating entity you contract with, without regard to
        conflict-of-law rules, except where prohibited.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms: use the contact options on{" "}
        <a href={SITE_URL} className="text-primary font-medium hover:underline">
          {SITE_URL}
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
