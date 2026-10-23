import type { Metadata } from "next";

import { ContactForm } from "@/components/ContactForm";
import { InfoSection, InfoShell } from "@/components/InfoPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ppip — Contact us",
};

export default function ContactPage() {
  return (
    <InfoShell
      eyebrow="Support"
      title="Contact us"
      intro="Questions about logging in, a payment or your stored credentials? Send us a note and it will be saved to our support inbox."
    >
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <ContactForm />
        <div className="space-y-6">
          <InfoSection title="Forgotten your password?">
            <p>
              Reset it in a few seconds from the{" "}
              <a href="/forgot-password" className="font-medium text-brand hover:underline">
                password reset page
              </a>
              . Your new password is hashed and stored immediately.
            </p>
          </InfoSection>
          <InfoSection title="Can&apos;t remember your email?">
            <p>
              Use the{" "}
              <a href="/forgot-email" className="font-medium text-brand hover:underline">
                email finder
              </a>{" "}
              with the mobile number linked to your account.
            </p>
          </InfoSection>
          <InfoSection title="Demo notice">
            <p className="rounded-lg bg-[#fbfbfa] px-4 py-3 text-[13.5px] text-muted">
              This is a demonstration product. No real money moves and no real emails are sent —
              messages are stored in the local PostgreSQL database.
            </p>
          </InfoSection>
        </div>
      </div>
    </InfoShell>
  );
}
