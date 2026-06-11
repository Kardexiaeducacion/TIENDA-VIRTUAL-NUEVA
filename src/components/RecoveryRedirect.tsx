"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function RecoveryRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Supabase clears the URL hash immediately for security reasons, so checking window.location.hash
    // directly might fail if Supabase processes it first.
    // The robust way is to listen to the PASSWORD_RECOVERY event triggered by the Supabase client.
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'implicit',
        }
      }
    );

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // We caught the recovery session! Redirect to the reset password page.
        router.push("/reset-password");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
