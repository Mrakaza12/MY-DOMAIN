"use server";

import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { isEmail, normalizeEmail } from "@/lib/validation";

export type ContactResult =
  | { ok: true; message: string }
  | { ok: false; code: string };

export async function sendContactMessage(input: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): Promise<ContactResult> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const message = input.message.trim();

  if (!name) return { ok: false, code: "name_required" };
  if (!email) return { ok: false, code: "email_required" };
  if (!isEmail(email)) return { ok: false, code: "email_invalid" };
  if (message.length < 10) return { ok: false, code: "message_required" };

  try {
    await db.insert(contactMessages).values({
      name,
      email,
      topic: input.topic || "General",
      message,
    });
    return {
      ok: true,
      message: "Thanks — your message has been saved. We'll reply within 24 hours.",
    };
  } catch {
    return { ok: false, code: "server_error" };
  }
}
