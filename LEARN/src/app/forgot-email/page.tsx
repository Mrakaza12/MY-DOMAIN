import type { Metadata } from "next";

import { ForgotEmailCard } from "@/components/ForgotCards";
import { AuthShell } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ppip — Find your email address",
};

export default function ForgotEmailPage() {
  return (
    <AuthShell>
      <ForgotEmailCard />
    </AuthShell>
  );
}
