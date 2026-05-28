"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "female",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Calcular la edad basada en la fecha de nacimiento
  const calculateAge = (dobString: string) => {
    if (!dobString) return "";
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(formData.dob);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          dob: formData.dob,
          age: age,
          gender: formData.gender,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Automatically log in or redirect after successful registration
    router.push("/account");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="h-20 border-b border-outline-variant flex items-center px-8 md:px-20 bg-surface">
        <Link href="/" className="text-3xl font-extrabold text-primary uppercase tracking-tighter">Cloe</Link>
      </header>

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant p-8 md:p-12 shadow-sm">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Crear Cuenta</h1>
            <p className="text-sm text-secondary">Únete al ecosistema Cloe y accede a colecciones exclusivas.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container text-sm font-semibold rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Nombre Completo</label>
                <input required type="text" className="border border-outline-variant bg-surface p-3 text-base focus:border-primary focus:outline-none" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Fecha de Nacimiento</label>
                  <input required type="date" className="border border-outline-variant bg-surface p-3 text-base focus:border-primary focus:outline-none" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Edad</label>
                  <input disabled type="text" className="border border-outline-variant bg-surface-container p-3 text-base text-secondary cursor-not-allowed" value={age} placeholder="Autocalculada" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Género</label>
                <select className="border border-outline-variant bg-surface p-3 text-base focus:border-primary focus:outline-none" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                  <option value="female">Femenino</option>
                  <option value="male">Masculino</option>
                  <option value="non-binary">No binario</option>
                  <option value="prefer-not-to-say">Prefiero no decir</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Correo Electrónico</label>
                <input required type="email" className="border border-outline-variant bg-surface p-3 text-base focus:border-primary focus:outline-none" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Contraseña</label>
                <input required type="password" minLength={6} className="border border-outline-variant bg-surface p-3 text-base focus:border-primary focus:outline-none" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-4 bg-primary text-on-primary text-sm font-bold uppercase tracking-widest hover:bg-primary-container transition-colors disabled:opacity-50 mt-4">
              {loading ? "Creando cuenta..." : "Registrarme"}
            </button>

            <p className="text-center text-sm text-secondary mt-8">
              ¿Ya tienes cuenta? <Link href="/login" className="text-primary font-bold hover:underline">Inicia Sesión</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
