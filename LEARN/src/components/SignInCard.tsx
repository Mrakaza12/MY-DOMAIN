"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LanguagePicker } from "@/components/LanguagePicker";
import {
  AuthCard,
  AuthInput,
  ErrorText,
  Logo,
  OrDivider,
  PrimaryButton,
  SecondaryLink,
} from "@/components/ui";
import {
  checkIdentifier,
  createQuickAccount,
  signInWithPassword,
} from "@/app/actions/auth";
import { errorMessages } from "@/lib/errorMessages";
import type { AuthStrings, LocaleCode } from "@/lib/i18n";

type Step = "identifier" | "password";

export function SignInCard({
  locale,
  strings,
  initialIdentifier = "",
}: {
  locale: LocaleCode;
  strings: AuthStrings;
  initialIdentifier?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [confirmedIdentifier, setConfirmedIdentifier] = useState("");
  const [isKnownAccount, setIsKnownAccount] = useState(true);
  const [firstName, setFirstName] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [highlightSignUp, setHighlightSignUp] = useState(false);

  function localMessage(code: string): string {
    const map: Record<string, string | undefined> = {
      identifier_required: strings.emailRequired,
      identifier_invalid: strings.emailInvalid,
      account_not_found: strings.accountNotFound,
      password_required: strings.passwordRequired,
      password_incorrect: strings.passwordIncorrect,
      first_name_required: strings.firstNameRequired,
      email_taken: strings.emailTaken,
    };
    return map[code] ?? errorMessages[code] ?? errorMessages.server_error;
  }

  async function handleIdentifierSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setHighlightSignUp(false);

    const value = identifier.trim();
    if (!value) {
      setError(strings.emailRequired);
      return;
    }

    setPending(true);
    try {
      const result = await checkIdentifier(value);
      if (!result.ok) {
        setError(localMessage(result.code));
        if (result.code === "account_not_found") setHighlightSignUp(true);
        return;
      }

      setConfirmedIdentifier(result.identifier);
      setIdentifier(result.identifier);
      setIsKnownAccount(result.exists);
      setFirstName(result.firstName);
      setPassword("");
      setError(null);
      setStep("password");
    } catch {
      setError(errorMessages.server_error);
    } finally {
      setPending(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);

    if (!password) {
      setError(strings.passwordRequired);
      return;
    }

    setPending(true);
    try {
      const signIn = await signInWithPassword(confirmedIdentifier, password);
      if (signIn.ok) {
        router.push(signIn.redirectTo);
        router.refresh();
        return;
      }

      if (signIn.code === "account_not_found" && !isKnownAccount) {
        const created = await createQuickAccount(confirmedIdentifier, password);
        if (created.ok) {
          router.push(created.redirectTo);
          router.refresh();
          return;
        }
        setError(localMessage(created.code));
        return;
      }

      setError(localMessage(signIn.code));
    } catch {
      setError(errorMessages.server_error);
    } finally {
      setPending(false);
    }
  }

  function backToIdentifier() {
    setStep("identifier");
    setPassword("");
    setError(null);
  }

  const heading = isKnownAccount
    ? firstName
      ? `${strings.welcomeBack}, ${firstName}`
      : strings.welcomeBack
    : "Let's save your credentials";

  return (
    <AuthCard>
      <div className="flex justify-center">
        <Logo className="text-[42px] sm:text-[46px]" />
      </div>

      {step === "identifier" ? (
        <form noValidate onSubmit={handleIdentifierSubmit} className="mt-10 sm:mt-12">
          <label htmlFor="identifier" className="sr-only">
            {strings.emailPlaceholder}
          </label>
          <AuthInput
            id="identifier"
            name="identifier"
            type="text"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={strings.emailPlaceholder}
            value={identifier}
            invalid={Boolean(error)}
            onChange={(event) => {
              setIdentifier(event.target.value);
              if (error) setError(null);
            }}
          />
          <ErrorText>{error}</ErrorText>

          <div className="mt-4">
            <Link
              href="/forgot-email"
              className="text-[16px] font-medium text-brand hover:underline"
            >
              {strings.forgotEmail}
            </Link>
          </div>

          <div className="mt-8">
            <PrimaryButton type="submit" pending={pending}>
              {strings.next}
            </PrimaryButton>
          </div>

          {highlightSignUp ? (
            <p className="mt-4 text-[15px] text-body">
              Need an account?{" "}
              <Link
                href={`/signup?email=${encodeURIComponent(identifier.trim())}`}
                className="font-semibold text-brand hover:underline"
              >
                Sign Up
              </Link>{" "}
              to store your credentials.
            </p>
          ) : null}
        </form>
      ) : (
        <form noValidate onSubmit={handlePasswordSubmit} className="mt-8 sm:mt-10">
          <div className="mb-5 text-center">
            <h1 className="text-[20px] font-semibold leading-snug text-ink">{heading}</h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[15px] text-[#4d5155]">
              <span className="font-medium">{confirmedIdentifier}</span>
              <button
                type="button"
                onClick={backToIdentifier}
                className="font-semibold text-brand hover:underline"
              >
                {strings.changeEmail}
              </button>
            </div>
          </div>

          {!isKnownAccount ? (
            <div className="ppip-fade-up mb-4 rounded-lg border border-[#bfdcf0] bg-brand-soft px-4 py-3 text-[14.5px] leading-relaxed text-[#084b73]">
              We couldn&apos;t find this email yet. Enter a password (8+ characters) and we&apos;ll
              safely store your credentials, then open your account.
            </div>
          ) : null}

          <label htmlFor="password" className="sr-only">
            {strings.passwordPlaceholder}
          </label>
          <AuthInput
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={isKnownAccount ? "current-password" : "new-password"}
            placeholder={strings.passwordPlaceholder}
            value={password}
            invalid={Boolean(error)}
            autoFocus
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError(null);
            }}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="rounded px-2 py-1 text-[14px] font-semibold text-brand hover:underline"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
          />
          <ErrorText>{error}</ErrorText>

          <div className="mt-4">
            <Link
              href={`/forgot-password?email=${encodeURIComponent(confirmedIdentifier)}`}
              className="text-[16px] font-medium text-brand hover:underline"
            >
              {strings.forgotPassword}
            </Link>
          </div>

          <div className="mt-8">
            <PrimaryButton type="submit" pending={pending}>
              {isKnownAccount ? strings.logIn : strings.createAccount}
            </PrimaryButton>
          </div>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={backToIdentifier}
              className="text-[15px] font-medium text-[#4d5155] hover:text-brand hover:underline"
            >
              Use a different email or mobile number
            </button>
          </div>
        </form>
      )}

      <div className="mt-9">
        <OrDivider label={strings.or} />
      </div>

      <div className="mt-9">
        <SecondaryLink
          href={`/signup${
            (step === "password" ? confirmedIdentifier : identifier).trim()
              ? `?email=${encodeURIComponent(
                  (step === "password" ? confirmedIdentifier : identifier).trim(),
                )}`
              : ""
          }`}
          className={highlightSignUp ? "ring-2 ring-brand ring-offset-2" : ""}
        >
          {strings.signUp}
        </SecondaryLink>
      </div>

      <div className="mt-10">
        <LanguagePicker locale={locale} />
      </div>
    </AuthCard>
  );
}
