import { redirect } from "next/navigation";

import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell>
      <AuthForm mode="login" />
    </AuthShell>
  );
}
