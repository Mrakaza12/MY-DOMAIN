import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Sign in`,
  description: `${SITE_NAME} account sign-in and sign-up. Accounts are stored in the browser.`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
