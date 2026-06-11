"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecoveryRedirect() {
  const router = useRouter();

  useEffect(() => {
    // If Supabase redirects to the home page (because the specific Redirect URL wasn't whitelisted),
    // but the URL has the recovery tokens, we must redirect the user to the reset-password page.
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery") && hash.includes("access_token=")) {
      router.push(`/reset-password${hash}`);
    }
  }, [router]);

  return null;
}
