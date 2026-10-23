"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { authEvents, transfers, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isEmail, normalizeEmail } from "@/lib/validation";

export type WalletResult =
  | { ok: true; message: string }
  | { ok: false; code: string };

export async function addDemoFunds(): Promise<WalletResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "account_not_found" };

  try {
    await db
      .update(users)
      .set({
        balanceCents: sql`${users.balanceCents} + 100000`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await db.insert(authEvents).values({
      userId: user.id,
      identifier: user.email,
      type: "top_up",
      detail: "Added 1,000.00 demo funds",
    });

    revalidatePath("/account");
    return { ok: true, message: "Demo funds added to your balance." };
  } catch {
    return { ok: false, code: "server_error" };
  }
}

export async function sendMoney(input: {
  recipientEmail: string;
  amount: string;
  note: string;
}): Promise<WalletResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "account_not_found" };

  const recipientEmail = normalizeEmail(input.recipientEmail);
  if (!recipientEmail || !isEmail(recipientEmail)) return { ok: false, code: "recipient_required" };
  if (recipientEmail === user.email) return { ok: false, code: "self_transfer" };

  const parsed = Number.parseFloat(input.amount.replace(/,/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) return { ok: false, code: "amount_invalid" };
  const amountCents = Math.round(parsed * 100);

  try {
    const rows = await db
      .select({ id: users.id, firstName: users.firstName })
      .from(users)
      .where(eq(users.email, recipientEmail))
      .limit(1);
    const recipient = rows[0];
    if (!recipient) return { ok: false, code: "recipient_not_found" };
    if (user.balanceCents < amountCents) return { ok: false, code: "insufficient_funds" };

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          balanceCents: sql`${users.balanceCents} - ${amountCents}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      await tx
        .update(users)
        .set({
          balanceCents: sql`${users.balanceCents} + ${amountCents}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, recipient.id));

      await tx.insert(transfers).values({
        fromUserId: user.id,
        toUserId: recipient.id,
        amountCents,
        note: input.note.trim() || null,
      });

      await tx.insert(authEvents).values({
        userId: user.id,
        identifier: user.email,
        type: "payment_sent",
        detail: `Sent ${(amountCents / 100).toFixed(2)} ${user.currency} to ${recipientEmail}`,
      });
    });

    revalidatePath("/account");
    return { ok: true, message: `Payment sent to ${recipient.firstName}.` };
  } catch {
    return { ok: false, code: "server_error" };
  }
}
