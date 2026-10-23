"use client";

import { useState } from "react";

import { sendContactMessage } from "@/app/actions/contact";
import { ErrorText } from "@/components/ui";
import { errorMessages } from "@/lib/errorMessages";

const fieldClass =
  "h-[50px] w-full rounded-lg border border-[#c9cbcd] bg-white px-4 text-[15.5px] text-ink placeholder:text-[#8a8d90] transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";
const labelClass = "mb-1.5 block text-[13.5px] font-semibold text-body";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Account access");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setSentMessage(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setError(errorMessages.email_required);
      return;
    }
    if (message.trim().length < 10) {
      setError("Please add a few more details so we can help (10+ characters).");
      return;
    }

    setPending(true);
    try {
      const result = await sendContactMessage({ name, email, topic, message });
      if (!result.ok) {
        setError(errorMessages[result.code] ?? errorMessages.server_error);
        return;
      }
      setSentMessage(result.message);
      setName("");
      setEmail("");
      setTopic("Account access");
      setMessage("");
    } catch {
      setError(errorMessages.server_error);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Your name
          </label>
          <input
            id="contact-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Alex Morgan"
            autoComplete="name"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email address
          </label>
          <input
            id="contact-email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-topic" className={labelClass}>
          What can we help with?
        </label>
        <select
          id="contact-topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className={`${fieldClass} appearance-none`}
        >
          <option>Account access</option>
          <option>Payments</option>
          <option>Security</option>
          <option>Something else</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          placeholder="Tell us what's happening…"
          className="w-full rounded-lg border border-[#c9cbcd] bg-white px-4 py-3 text-[15.5px] text-ink transition placeholder:text-[#8a8d90] focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <ErrorText>{error}</ErrorText>
      {sentMessage ? (
        <p className="ppip-fade-up rounded-lg border border-[#bfe6cc] bg-[#eefaf1] px-4 py-3 text-[14.5px] font-medium text-[#1b7a3d]">
          {sentMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-brand px-8 text-[16px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-70"
      >
        {pending ? <span className="ppip-spinner !h-4 !w-4" aria-hidden /> : null}
        Send message
      </button>
    </form>
  );
}
