import type { Metadata } from "next";

import { ForgotPasswordCard } from "@/components/ForgotCards";
import { AuthShell } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ppip — Reset your password",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell>
      <ForgotPasswordCard initialEmail={params.email ?? ""} />
    </AuthShell>
  );
}
