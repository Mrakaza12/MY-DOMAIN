"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ErrorNote, Field, SubmitButton, TextInput } from "@/components/ui";
import { getSessionUser, signIn, signUp, storageProblem } from "@/lib/browser-auth";
import { MIN_PASSWORD_LENGTH, validateCredentials } from "@/lib/validation";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Already signed in? Go straight to the dashboard.
  useEffect(() => {
    if (getSessionUser()) router.replace("/dashboard/");
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);

    const validationError = validateCredentials(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);
    try {
      const result = isSignup
        ? await signUp({
            email,
            password,
            ...(displayName.trim() ? { displayName: displayName.trim() } : {}),
          })
        : await signIn({ email, password });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.replace("/dashboard/");
    } catch {
      setError("Something went wrong while saving your account in this browser.");
    } finally {
      setPending(false);
    }
  }

  const blocked = storageProblem();

  return (
    <section className="rise-in w-full max-w-[430px] rounded-2xl border border-line bg-white p-7 shadow-[0_18px_50px_-30px_rgba(16,20,24,0.35)] sm:p-9">
      <h1 className="text-[24px] font-semibold tracking-[-0.015em] text-ink">
        {isSignup ? "Create your account" : "Sign in"}
      </h1>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">
        {isSignup
          ? `Use an email address and a password of ${MIN_PASSWORD_LENGTH}+ characters.`
          : "Enter the email and password you signed up with."}
      </p>

      {blocked ? (
        <p className="mt-4 rounded-xl bg-[#fdf3e7] px-3.5 py-3 text-[13.5px] leading-relaxed text-[#8a5a12]">
          {blocked}
        </p>
      ) : null}

      <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field id="email" label="Email address">
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@example.com"
            value={email}
            invalid={Boolean(error)}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(null);
            }}
          />
        </Field>

        {isSignup ? (
          <Field id="displayName" label="Your name" hint="Optional">
            <TextInput
              id="displayName"
              name="displayName"
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </Field>
        ) : null}

        <Field
          id="password"
          label="Password"
          hint={isSignup ? `${MIN_PASSWORD_LENGTH}+ characters` : undefined}
        >
          <TextInput
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="••••••••"
            value={password}
            invalid={Boolean(error)}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError(null);
            }}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="rounded-md px-2 py-1 text-[13px] font-semibold text-brand hover:underline"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
          />
        </Field>

        <ErrorNote>{error}</ErrorNote>

        <div className="pt-1">
          <SubmitButton pending={pending}>
            {isSignup ? "Create account" : "Sign in"}
          </SubmitButton>
        </div>
      </form>

      {isSignup ? (
        <p className="mt-5 rounded-xl bg-brand-soft px-3.5 py-3 text-[13px] leading-relaxed text-[#0b4d47]">
          Accounts are saved in this browser only. Use a throwaway password — not one
          you use for email, banking or anything else.
        </p>
      ) : null}

      <p className="mt-6 text-center text-[14px] text-body">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link
          href={isSignup ? "/" : "/signup/"}
          className="font-semibold text-brand hover:underline"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </section>
  );
}
