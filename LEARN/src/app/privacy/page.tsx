import type { Metadata } from "next";

import { InfoSection, InfoShell } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Ppip — Privacy",
};

export default function PrivacyPage() {
  return (
    <InfoShell
      eyebrow="Your data"
      title="Privacy"
      intro="Ppip is a small demonstration app. Here is exactly what we store and why."
    >
      <InfoSection title="What we store">
        <ul className="list-disc space-y-2 pl-5">
          <li>Your email address and, if you add one, your mobile number.</li>
          <li>
            A salted scrypt hash of your password — never the password itself. Ppip cannot read
            your password back.
          </li>
          <li>Your name, country, currency and demo account balance.</li>
          <li>A short security log of sign-ins, password changes and payments.</li>
          <li>Messages you send through the contact form.</li>
        </ul>
      </InfoSection>

      <InfoSection title="How sessions work">
        <p>
          When you sign in, a random session token is written to an httpOnly cookie. Only a SHA-256
          hash of that token is stored in the database, so a leaked database copy cannot be used to
          impersonate you. Sessions expire after 30 days, and resetting a password clears every
          active session.
        </p>
      </InfoSection>

      <InfoSection title="Your controls">
        <p>
          You can change your password from your account page, sign out at any time, or reset a
          forgotten password from the login screen. Because this is a demo environment, avoid
          reusing a real password.
        </p>
      </InfoSection>

      <InfoSection title="Retention">
        <p>
          Account data lives in the local PostgreSQL database used by this demo and stays there
          until the environment is reset.
        </p>
      </InfoSection>
    </InfoShell>
  );
}
