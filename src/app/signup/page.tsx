import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/ui";

export const metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <AuthShell>
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
