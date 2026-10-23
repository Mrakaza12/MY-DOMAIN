"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { changePassword, signOut } from "@/app/actions/auth";
import { addDemoFunds, sendMoney } from "@/app/actions/wallet";
import { ErrorText } from "@/components/ui";
import { errorMessages } from "@/lib/errorMessages";

const fieldClass =
  "h-[46px] w-full rounded-lg border border-[#c9cbcd] bg-white px-3.5 text-[15px] text-ink placeholder:text-[#8a8d90] transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-body";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    if (pending) return;
    setPending(true);
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="rounded-full border border-[#cfd1d3] bg-white px-5 py-2 text-[14px] font-semibold text-body transition hover:border-ink hover:text-ink disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Log out"}
    </button>
  );
}

export function AddFundsButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAddFunds() {
    if (pending) return;
    setPending(true);
    setMessage(null);
    try {
      const result = await addDemoFunds();
      if (result.ok) {
        setMessage(result.message);
        router.refresh();
      } else {
        setMessage(errorMessages[result.code] ?? errorMessages.server_error);
      }
    } catch {
      setMessage(errorMessages.server_error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleAddFunds}
        disabled={pending}
        className="flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-white px-5 py-2.5 text-[14px] font-semibold text-ink transition hover:bg-[#f4f4f4] disabled:opacity-60"
      >
        {pending ? <span className="ppip-spinner-dark !h-4 !w-4" aria-hidden /> : null}
        Add demo funds
      </button>
      {message ? <p className="text-[13px] text-[#1b7a3d]">{message}</p> : null}
    </div>
  );
}

export function SendMoneyForm({
  currency,
  defaultOpen = false,
}: {
  currency: string;
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setSuccess(null);

    if (!recipientEmail.trim()) {
      setError("Enter the email address of the person you're paying.");
      return;
    }
    if (!amount.trim() || Number.parseFloat(amount.replace(/,/g, "")) <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setPending(true);
    try {
      const result = await sendMoney({ recipientEmail, amount, note });
      if (!result.ok) {
        setError(errorMessages[result.code] ?? errorMessages.server_error);
        return;
      }
      setSuccess(result.message);
      setRecipientEmail("");
      setAmount("");
      setNote("");
      router.refresh();
    } catch {
      setError(errorMessages.server_error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-line bg-[#fbfbfa] p-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="text-[15px] font-semibold text-ink">Send money</span>
        <span className="text-[13px] font-semibold text-brand">
          {open ? "Hide" : "Open"}
        </span>
      </button>

      {open ? (
        <form onSubmit={handleSubmit} noValidate className="ppip-fade-up mt-4 space-y-3">
          <div>
            <label htmlFor="recipient" className={labelClass}>
              Recipient email
            </label>
            <input
              id="recipient"
              type="email"
              inputMode="email"
              autoComplete="off"
              placeholder="friend@example.com"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="amount" className={labelClass}>
                Amount ({currency})
              </label>
              <input
                id="amount"
                inputMode="decimal"
                placeholder="25.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="note" className={labelClass}>
                Note (optional)
              </label>
              <input
                id="note"
                placeholder="Dinner, rent…"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <ErrorText>{error}</ErrorText>
          {success ? (
            <p className="ppip-fade-up text-[14px] font-medium text-[#1b7a3d]">{success}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-brand px-6 text-[15px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-70"
          >
            {pending ? <span className="ppip-spinner !h-4 !w-4" aria-hidden /> : null}
            Send payment
          </button>
          <p className="text-[12.5px] leading-relaxed text-muted">
            Money moves instantly between Ppip accounts. Try paying another stored account.
          </p>
        </form>
      ) : null}
    </div>
  );
}

export function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setError(errorMessages.password_too_short);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(errorMessages.password_mismatch);
      return;
    }

    setPending(true);
    try {
      const result = await changePassword({ currentPassword, newPassword, confirmPassword });
      if (!result.ok) {
        setError(errorMessages[result.code] ?? errorMessages.server_error);
        return;
      }
      setSuccess("Password updated and stored securely.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError(errorMessages.server_error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-[14px] font-semibold text-ink">Change password</span>
        <span className="text-[13px] font-semibold text-brand">{open ? "Hide" : "Update"}</span>
      </button>

      {open ? (
        <form onSubmit={handleSubmit} noValidate className="ppip-fade-up mt-3 space-y-3">
          <div>
            <label htmlFor="current-password" className={labelClass}>
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="new-password" className={labelClass}>
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className={labelClass}>
              Confirm new password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={fieldClass}
            />
          </div>

          <ErrorText>{error}</ErrorText>
          {success ? (
            <p className="ppip-fade-up text-[14px] font-medium text-[#1b7a3d]">{success}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="flex h-[42px] items-center justify-center gap-2 rounded-full bg-ink px-5 text-[14px] font-semibold text-white transition hover:bg-[#0a2a52] disabled:opacity-70"
          >
            {pending ? <span className="ppip-spinner !h-4 !w-4" aria-hidden /> : null}
            Save password
          </button>
        </form>
      ) : null}
    </div>
  );
}
