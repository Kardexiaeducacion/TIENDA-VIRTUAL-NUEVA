"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Listen for PASSWORD_RECOVERY event (implicit / email-link flow).
    // This fires when the user landed via an email recovery link and Supabase
    // processed the hash tokens.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
          setSessionReady(true);
          setError(null);
        }
      }
    );

    // Also check immediately for an existing session (PKCE flow via /auth/reset-callback
    // already exchanged the code and established the session before landing here).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        // No session yet — may arrive shortly via the onAuthStateChange listener above.
        // Wait 3 seconds before showing an error.
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (!s) {
              setError(
                "No se encontró una sesión de recuperación válida. Por favor solicita un nuevo enlace."
              );
            }
          });
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(`Error al guardar la contraseña: ${updateError.message}`);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Sign out so they log in fresh with the new password
    await supabase.auth.signOut();

    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 2500);
  };

  // No session and an error was set
  if (error && !sessionReady) {
    return (
      <div className="text-center">
        <div className="mb-6 p-4 bg-error-container text-on-error-container text-sm font-semibold rounded">
          {error}
        </div>
        <Link
          href="/forgot-password"
          className="inline-block w-full py-4 bg-primary text-on-primary text-sm font-bold uppercase tracking-widest text-center hover:bg-primary-container transition-colors"
        >
          Solicitar Nuevo Enlace
        </Link>
      </div>
    );
  }

  // Waiting for session
  if (!sessionReady && !error) {
    return (
      <div className="text-center py-8">
        <p className="text-secondary text-sm">Verificando enlace de recuperación...</p>
      </div>
    );
  }

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
            ✓ ¡Contraseña actualizada exitosamente! Redirigiendo al inicio de sesión...
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                required
                minLength={6}
                type={showPassword ? "text" : "password"}
                className="w-full border border-outline-variant bg-surface p-3 pr-10 text-base focus:border-primary focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary material-symbols-outlined"
              >
                {showPassword ? "visibility_off" : "visibility"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
              Confirmar Contraseña
            </label>
            <input
              required
              minLength={6}
              type={showPassword ? "text" : "password"}
              className="w-full border border-outline-variant bg-surface p-3 text-base focus:border-primary focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu nueva contraseña"
            />
          </div>

          <button
            disabled={loading || !sessionReady}
            type="submit"
            className="w-full py-4 bg-primary text-on-primary text-sm font-bold uppercase tracking-widest hover:bg-primary-container transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? "Guardando..." : "Guardar Nueva Contraseña"}
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
        <Link href="/" className="text-3xl font-extrabold text-primary uppercase tracking-tighter">
          Cloe
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant p-8 md:p-12 shadow-sm">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Nueva Contraseña</h1>
            <p className="text-sm text-secondary">Por favor ingresa tu nueva contraseña.</p>
          </div>
          <Suspense fallback={<div className="text-center text-secondary">Cargando...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
