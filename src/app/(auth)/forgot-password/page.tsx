"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Call Supabase reset password
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="h-20 border-b border-outline-variant flex items-center px-8 md:px-20 bg-surface">
        <Link href="/" className="text-3xl font-extrabold text-primary uppercase tracking-tighter">Cloe</Link>
      </header>

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant p-8 md:p-12 shadow-sm">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Recuperar Contraseña</h1>
            <p className="text-sm text-secondary">Ingresa tu correo y te enviaremos un enlace para crear una nueva clave.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container text-sm font-semibold rounded">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="mb-6 p-4 bg-green-100 text-green-800 border border-green-200 text-sm font-semibold rounded">
                ¡Enlace enviado! Revisa tu bandeja de entrada o la carpeta de spam para continuar.
              </div>
              <Link href="/login" className="text-sm font-bold text-primary uppercase tracking-widest hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Correo Electrónico</label>
                <input required type="email" className="border border-outline-variant bg-surface p-3 text-base focus:border-primary focus:outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <button disabled={loading} type="submit" className="w-full py-4 bg-primary text-on-primary text-sm font-bold uppercase tracking-widest hover:bg-primary-container transition-colors disabled:opacity-50 mt-4">
                {loading ? "Enviando..." : "Enviar Enlace"}
              </button>

              <p className="text-center text-sm text-secondary mt-8">
                ¿Recordaste tu contraseña? <Link href="/login" className="text-primary font-bold hover:underline">Inicia Sesión</Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
