"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// ... (I will need to restructure the component)

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if there is an error in URL
    const errorParam = searchParams.get('error');
    if (errorParam === 'invalid_link') {
      setError('El enlace de seguridad es inválido o ya expiró (algunos correos abren los enlaces automáticamente por seguridad). Por favor solicita uno nuevo e inténtalo pronto.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    // Redirect to account dashboard
    router.push("/account");
    router.refresh();
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container text-sm font-semibold rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Correo Electrónico</label>
          <input required type="email" className="border border-outline-variant bg-surface p-3 text-base focus:border-primary focus:outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Contraseña</label>
          <div className="relative">
            <input required type={showPassword ? "text" : "password"} className="w-full border border-outline-variant bg-surface p-3 pr-10 text-base focus:border-primary focus:outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary material-symbols-outlined">
              {showPassword ? "visibility_off" : "visibility"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 border-outline text-primary focus:ring-0" />
            <span className="text-sm text-secondary">Recordarme</span>
          </label>
          <Link href="/forgot-password" className="text-sm text-primary font-bold hover:underline">¿Olvidaste tu contraseña?</Link>
        </div>

        <button disabled={loading} type="submit" className="w-full py-4 bg-primary text-on-primary text-sm font-bold uppercase tracking-widest hover:bg-primary-container transition-colors disabled:opacity-50 mt-4">
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-sm text-secondary mt-8">
          ¿No tienes cuenta? <Link href="/register" className="text-primary font-bold hover:underline">Regístrate</Link>
        </p>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="h-20 border-b border-outline-variant flex items-center px-8 md:px-20 bg-surface">
        <Link href="/" className="text-3xl font-extrabold text-primary uppercase tracking-tighter">Cloe</Link>
      </header>

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant p-8 md:p-12 shadow-sm">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Iniciar Sesión</h1>
            <p className="text-sm text-secondary">Bienvenido de vuelta a Cloe.</p>
          </div>
          <Suspense fallback={<div>Cargando...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
