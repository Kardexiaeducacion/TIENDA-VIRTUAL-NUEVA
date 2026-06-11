"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/**
 * This component sits in the root layout and listens globally for the
 * PASSWORD_RECOVERY auth event emitted by Supabase when the user opens a
 * password-reset email link (implicit flow).
 *
 * When caught on any page other than /reset-password, it immediately redirects
 * the user there so they can set a new password instead of being left logged in.
 */
export default function RecoveryRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && pathname !== "/reset-password") {
        // Recovery session established - send user to the reset page immediately
        router.replace("/reset-password");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  return null;
}
