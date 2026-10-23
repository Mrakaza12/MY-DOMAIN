"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { signUp } from "@/app/actions/auth";
import { LanguagePicker } from "@/components/LanguagePicker";
import {
  AuthCard,
  AuthInput,
  ErrorText,
  Logo,
  OrDivider,
  PrimaryButton,
} from "@/components/ui";
import { countries, getCountry } from "@/lib/countries";
import type { AuthStrings, LocaleCode } from "@/lib/i18n";

export function SignUpCard({
  locale,
  strings,
  initialEmail = "",
  initialCountry = "GB",
}: {
  locale: LocaleCode;
  strings: AuthStrings;
  initialEmail?: string;
  initialCountry?: string;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(initialCountry);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function messageFor(code: string): string {
    switch (code) {
      case "name_required":
        return strings.firstNameRequired;
      case "email_required":
        return strings.emailRequired;
      case "email_invalid":
        return strings.emailInvalid;
      case "email_taken":
        return strings.emailTaken;
      case "phone_invalid":
        return strings.phoneInvalid;
      case "password_too_short":
        return strings.passwordTooShort;
      case "password_mismatch":
        return strings.passwordMismatch;
      case "terms_required":
        return strings.termsRequired;
      default:
        return "Something went wrong while creating your account. Please try again.";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setErrorField(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError(strings.firstNameRequired);
      setErrorField("name");
      return;
    }
    if (!email.trim()) {
      setError(strings.emailRequired);
      setErrorField("email");
      return;
    }
    if (password.length < 8) {
      setError(strings.passwordTooShort);
      setErrorField("password");
      return;
    }
    if (password !== confirmPassword) {
      setError(strings.passwordMismatch);
      setErrorField("confirm");
      return;
    }
    if (!acceptedTerms) {
      setError(strings.termsRequired);
      setErrorField("terms");
      return;
    }

    setPending(true);
    try {
      const selected = getCountry(country);
      const result = await signUp({
        firstName,
        lastName,
        email,
        phone,
        country: selected.code,
        currency: selected.currency,
        password,
        confirmPassword,
        acceptedTerms,
      });

      if (!result.ok) {
        const fields: Record<string, string> = {
          name_required: "name",
          email_required: "email",
          email_invalid: "email",
          email_taken: "email",
          phone_invalid: "phone",
          phone_taken: "phone",
          password_too_short: "password",
          password_mismatch: "confirm",
          terms_required: "terms",
        };
        setError(messageFor(result.code));
        setErrorField(fields[result.code] ?? null);
        return;
      }

      router.push(result.redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong while creating your account. Please try again.");
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
        <h1 className="text-[24px] font-semibold text-ink">Create your account</h1>
        <p className="mt-1.5 text-[15px] text-muted">
          Your details and password are stored securely.
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-[14px] font-medium text-body">
              {strings.firstName}
            </label>
            <AuthInput
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              placeholder="Alex"
              value={firstName}
              invalid={errorField === "name"}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-[14px] font-medium text-body">
              {strings.lastName}
            </label>
            <AuthInput
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              placeholder="Morgan"
              value={lastName}
              invalid={errorField === "name"}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-[14px] font-medium text-body">
            Email address
          </label>
          <AuthInput
            id="signup-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="you@example.com"
            value={email}
            invalid={errorField === "email"}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="signup-phone" className="mb-1.5 block text-[14px] font-medium text-body">
            {strings.mobileOptional}
          </label>
          <AuthInput
            id="signup-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+44 7700 900123"
            value={phone}
            invalid={errorField === "phone"}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="country" className="mb-1.5 block text-[14px] font-medium text-body">
            {strings.country}
          </label>
          <div className="relative">
            <select
              id="country"
              name="country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="h-[58px] w-full appearance-none rounded-lg border border-[#c4c6c8] bg-white px-4 pr-10 text-[17px] text-ink transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {countries.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.flag} {item.name} ({item.currency})
                </option>
              ))}
            </select>
            <svg
              aria-hidden
              viewBox="0 0 12 8"
              className="pointer-events-none absolute right-4 top-1/2 h-2.5 w-3 -translate-y-1/2 fill-none stroke-[#5f6368] stroke-[1.6]"
            >
              <path d="M1 1.5 6 6.5l5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div>
          <label htmlFor="signup-password" className="mb-1.5 block text-[14px] font-medium text-body">
            {strings.createPassword}
          </label>
          <AuthInput
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            invalid={errorField === "password"}
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
            htmlFor="signup-confirm"
            className="mb-1.5 block text-[14px] font-medium text-body"
          >
            {strings.confirmPassword}
          </label>
          <AuthInput
            id="signup-confirm"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            invalid={errorField === "confirm"}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        <label htmlFor="terms" className="flex cursor-pointer items-start gap-3 pt-1">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#0070ba]"
          />
          <span className="text-[14px] leading-relaxed text-body">
            I agree to the{" "}
            <Link href="/legal" className="font-medium text-brand hover:underline">
              User Agreement
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-brand hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <ErrorText>{error}</ErrorText>

        <div className="pt-2">
          <PrimaryButton type="submit" pending={pending}>
            {strings.createAccount}
          </PrimaryButton>
        </div>
      </form>

      <div className="mt-7">
        <OrDivider label={strings.or} />
      </div>

      <p className="mt-6 text-center text-[15px] text-body">
        {strings.alreadyHaveAccount}{" "}
        <Link
          href="/"
          className="font-semibold text-brand hover:underline"
        >
          {strings.logIn}
        </Link>
      </p>

      <div className="mt-8">
        <LanguagePicker locale={locale} />
      </div>
    </AuthCard>
  );
}
