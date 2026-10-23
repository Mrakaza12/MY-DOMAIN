"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorNote, Field, SubmitButton, TextInput } from "@/components/ui";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

type Mode = "login" | "signup";

type ApiError = { ok: false; error: string; field?: string };

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your password needs to be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setPending(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          ...(isSignup && displayName.trim() ? { displayName: displayName.trim() } : {}),
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok: true }
        | ApiError
        | null;

      if (!response.ok || !result || result.ok !== true) {
        setError(
          result && "error" in result && result.error
            ? result.error
            : "Something went wrong. Please try again.",
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rise-in w-full max-w-[430px] rounded-2xl border border-line bg-white p-7 shadow-[0_18px_50px_-30px_rgba(16,20,24,0.35)] sm:p-9">
      <h1 className="text-[24px] font-semibold tracking-[-0.015em] text-ink">
        {isSignup ? "Create your account" : "Sign in"}
      </h1>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">
        {isSignup
          ? "Use an email address and a password of 8+ characters."
          : "Enter the email and password you signed up with."}
      </p>

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

      <p className="mt-6 text-center text-[14px] text-body">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-brand hover:underline"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </section>
  );
}
