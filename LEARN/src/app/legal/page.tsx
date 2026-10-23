import type { Metadata } from "next";

import { InfoSection, InfoShell } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Ppip — Legal",
};

export default function LegalPage() {
  return (
    <InfoShell
      eyebrow="Terms"
      title="User agreement"
      intro="The short version: this is a demonstration app. Please treat it as a sandbox, not a bank."
    >
      <InfoSection title="1. Demo service">
        <p>
          Ppip is a portfolio/demonstration product built with Next.js and PostgreSQL. Balances,
          payments and account numbers are simulated. No real financial service is provided and no
          real money can be added or withdrawn.
        </p>
      </InfoSection>

      <InfoSection title="2. Your account">
        <p>
          You are responsible for the email address and password you register. Credentials are
          stored as salted scrypt hashes; you can change them from your account page. Use a unique
          demo password rather than one you use elsewhere.
        </p>
      </InfoSection>

      <InfoSection title="3. Acceptable use">
        <p>
          Do not attempt to break, overload or abuse the service. Payments can only be sent between
          registered demo accounts, and every payment attempt is logged for audit purposes.
        </p>
      </InfoSection>

      <InfoSection title="4. Availability">
        <p>
          The service is provided “as is” without warranties. Demo data may be cleared when the
          environment is reset, and balances can be topped up with the “Add demo funds” button.
        </p>
      </InfoSection>

      <InfoSection title="5. Trademarks">
        <p>
          Ppip is an independent design exercise and is not affiliated with any existing payments
          company. All branding in this project is fictional.
        </p>
      </InfoSection>
    </InfoShell>
  );
}
