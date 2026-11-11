"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderIcon, LogOutIcon } from "./icons";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    if (pending) return;
    setPending(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="btn-ghost h-10 px-4 text-sm disabled:opacity-60"
    >
      {pending ? <LoaderIcon className="size-4" /> : <LogOutIcon className="size-4" />}
      Sign out
    </button>
  );
}
