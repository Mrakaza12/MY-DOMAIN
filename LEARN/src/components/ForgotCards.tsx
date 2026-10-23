"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { lookupEmailByPhone, resetPassword } from "@/app/actions/auth";
import {
  AuthCard,
  AuthInput,
  ErrorText,
  Logo,
  PrimaryButton,
  SecondaryLink,
} from "@/components/ui";
import { errorMessages } from "@/lib/errorMessages";

function BackToLogin() {
  return (
    <p className="mt-6 text-center text-[15px] text-body">
      <Link href="/" className="font-semibold text-brand hover:underline">
        Back to log in
      </Link>
    </p>
  );
}

export function ForgotEmailCard() {
  const [phone, setPhone] = useState("");
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setMaskedEmail(null);

    if (!phone.trim()) {
      setError("Please enter the mobile number on your account.");
      return;
    }

    setPending(true);
    try {
      const result = await lookupEmailByPhone(phone);
      if (!result.ok) {
        setError(errorMessages[result.code] ?? errorMessages.server_error);
        return;
      }
      setMaskedEmail(result.maskedEmail);
    } catch {
      setError(errorMessages.server_error);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard>
      <div className="flex justify-center">
        <Logo className="text-[42px] sm:text-[46px]" />
      </div>

      <div className="mt-8 text-center">
        <h1 className="text-[24px] font-semibold text-ink">Find your email address</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Enter the mobile number linked to your account and we&apos;ll show you the email address
          on file.
        </p>
      </div>

      {maskedEmail ? (
        <div className="ppip-fade-up mt-8">
          <div className="rounded-xl border border-[#bfdcf0] bg-brand-soft px-5 py-5 text-center">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-[#0a5680]">
              Email on file
            </p>
            <p className="mt-1.5 text-[20px] font-semibold text-ink">{maskedEmail}</p>
            <p className="mt-2 text-[14px] text-[#0a5680]">
              For your security we only show part of the address.
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <SecondaryLink href="/">Log in with this email</SecondaryLink>
            <button
              type="button"
              onClick={() => {
                setMaskedEmail(null);
                setPhone("");
              }}
              className="w-full text-[15px] font-medium text-brand hover:underline"
            >
              Try another mobile number
            </button>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="mt-8">
          <label htmlFor="recovery-phone" className="mb-1.5 block text-[14px] font-medium text-body">
            Mobile number
          </label>
          <AuthInput
            id="recovery-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+44 7700 900123"
            value={phone}
            invalid={Boolean(error)}
            onChange={(event) => {
              setPhone(event.target.value);
              if (error) setError(null);
            }}
          />
          <ErrorText>{error}</ErrorText>
          <div className="mt-7">
            <PrimaryButton type="submit" pending={pending}>
              Find my email
            </PrimaryButton>
          </div>
          <BackToLogin />
        </form>
      )}
    </AuthCard>
  );
}

export function ForgotPasswordCard({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);

    if (!email.trim()) {
      setError("Please enter the email address on your account.");
      return;
    }
    if (password.length < 8) {
      setError(errorMessages.password_too_short);
      return;
    }
    if (password !== confirmPassword) {
      setError(errorMessages.password_mismatch);
      return;
    }

    setPending(true);
    try {
      const result = await resetPassword({ email, password, confirmPassword });
      if (!result.ok) {
        setError(errorMessages[result.code] ?? errorMessages.server_error);
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError(errorMessages.server_error);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard>
      <div className="flex justify-center">
        <Logo className="text-[42px] sm:text-[46px]" />
      </div>

      <div className="mt-8 text-center">
        <h1 className="text-[24px] font-semibold text-ink">
          {done ? "Password updated" : "Reset your password"}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          {done
            ? "Your new password has been stored securely. You can now log in with it."
            : "Choose a new password for your account. It will be stored as a secure hash."}
        </p>
      </div>

      {done ? (
        <div className="ppip-fade-up mt-8">
          <div className="flex items-center justify-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#e7f6ec]">
              <svg aria-hidden viewBox="0 0 24 24" className="h-8 w-8 fill-[#1b7a3d]">
                <path d="M9.5 17.6 4.4 12.5l1.6-1.6 3.5 3.5 8.5-8.5 1.6 1.6-10.1 10.1Z" />
              </svg>
            </span>
          </div>
          <div className="mt-7">
            <SecondaryLink href={`/?email=${encodeURIComponent(email)}`}>
              Continue to log in
            </SecondaryLink>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="reset-email" className="mb-1.5 block text-[14px] font-medium text-body">
              Email address
            </label>
            <AuthInput
              id="reset-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              placeholder="you@example.com"
              value={email}
              invalid={Boolean(error) && !password}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="reset-password"
              className="mb-1.5 block text-[14px] font-medium text-body"
            >
              New password
            </label>
            <AuthInput
              id="reset-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              invalid={Boolean(error)}
              onChange={(event) => setPassword(event.target.value)}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="rounded px-2 py-1 text-[14px] font-semibold text-brand hover:underline"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              }
            />
          </div>

          <div>
            <label
              htmlFor="reset-confirm"
              className="mb-1.5 block text-[14px] font-medium text-body"
            >
              Confirm new password
            </label>
            <AuthInput
              id="reset-confirm"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              invalid={Boolean(error)}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <ErrorText>{error}</ErrorText>

          <div className="pt-2">
            <PrimaryButton type="submit" pending={pending}>
              Save new password
            </PrimaryButton>
          </div>
          <BackToLogin />
        </form>
      )}
    </AuthCard>
  );
}
