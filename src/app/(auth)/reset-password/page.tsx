"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  
  // Custom client with implicit flow
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'implicit',
      }
    }
  );

  useEffect(() => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (code) {
      console.log("Found PKCE code in URL");
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
        if (exchangeError) {
          setError(`Error validando enlace (Código): ${exchangeError.message}. Intenta pedir uno nuevo.`);
        } else {
          console.log("Successfully exchanged PKCE code for session");
        }
      });
    } else if (hash && hash.includes("access_token")) {
      console.log("Found access_token in URL hash (Implicit flow)");
      // Supabase's createBrowserClient should automatically pick this up.
      // But let's listen to the auth state change to be sure.
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          console.log("Password recovery session established!");
        }
      });
    } else {
      // Check if session is already established
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setError("No se detectó un enlace de recuperación válido. Por favor solicita uno nuevo.");
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(`Error al guardar: ${updateError.message}. Por favor pide un nuevo enlace.`);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect to account dashboard after 2 seconds
    setTimeout(() => {
      router.push("/account");
      router.refresh();
    }, 2000);
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container text-sm font-semibold rounded">
          {error}
        </div>
      )}

      {success ? (
        <div className="text-center">
          <div className="mb-6 p-4 bg-green-100 text-green-800 border border-green-200 text-sm font-semibold rounded">
            ¡Contraseña actualizada exitosamente! Redirigiendo a tu cuenta...
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Nueva Contraseña</label>
            <div className="relative">
              <input required minLength={6} type={showPassword ? "text" : "password"} className="w-full border border-outline-variant bg-surface p-3 pr-10 text-base focus:border-primary focus:outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary material-symbols-outlined">
                {showPassword ? "visibility_off" : "visibility"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Confirmar Contraseña</label>
            <input required minLength={6} type={showPassword ? "text" : "password"} className="w-full border border-outline-variant bg-surface p-3 text-base focus:border-primary focus:outline-none" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <button disabled={loading || error !== null} type="submit" className="w-full py-4 bg-primary text-on-primary text-sm font-bold uppercase tracking-widest hover:bg-primary-container transition-colors disabled:opacity-50 mt-4">
            {loading ? "Actualizando..." : "Guardar Contraseña"}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="h-20 border-b border-outline-variant flex items-center px-8 md:px-20 bg-surface">
        <Link href="/" className="text-3xl font-extrabold text-primary uppercase tracking-tighter">Cloe</Link>
      </header>

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant p-8 md:p-12 shadow-sm">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Nueva Contraseña</h1>
            <p className="text-sm text-secondary">Por favor ingresa tu nueva contraseña.</p>
          </div>
          <Suspense fallback={<div>Cargando...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
