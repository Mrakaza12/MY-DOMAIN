"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { signOut } from "@/lib/browser-auth";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  function handleSignOut() {
    if (pending) return;
    setPending(true);
    signOut();
    router.replace("/");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="rounded-xl border border-line bg-white px-4 py-2 text-[14px] font-semibold text-body transition-colors hover:border-brand hover:text-brand disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
