import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignUpCard } from "@/components/SignUpCard";
import { AuthShell } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getLocaleContext } from "@/lib/server-locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ppip — Sign up",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  const { locale, strings } = await getLocaleContext();
  const params = await searchParams;

  return (
    <AuthShell>
      <SignUpCard
        locale={locale}
        strings={strings}
        initialEmail={params.email ?? ""}
        initialCountry={locale === "en-US" ? "US" : "GB"}
      />
    </AuthShell>
  );
}
