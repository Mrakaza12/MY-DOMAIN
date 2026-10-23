import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { SignInCard } from "@/components/SignInCard";
import { AuthShell } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getStrings } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  const cookieStore = await cookies();
  const locale = getLocale(cookieStore.get("ppip_locale")?.value);
  const strings = getStrings(locale);
  const params = await searchParams;

  return (
    <AuthShell>
      <SignInCard
        locale={locale}
        strings={strings}
        initialIdentifier={params.email ?? ""}
      />
    </AuthShell>
  );
}
