"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const { signIn, status, user } = useAuth();
  const [logoAvailable, setLogoAvailable] = React.useState(true);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace("/ventas/pluma");
    }
  }, [router, status, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Ingresa tu email.");
      return;
    }

    if (!password) {
      setError("Ingresa tu contraseña.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password);
      router.replace("/ventas/pluma");
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "No se pudo iniciar sesión. Intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="w-full max-w-md rounded-lg border border-[#E8DFC6] bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex size-20 items-center justify-center overflow-hidden rounded-lg border border-[#E8DFC6] bg-white shadow-sm">
          {logoAvailable ? (
            <Image
              alt="Pollería ASI"
              className="max-h-full max-w-full object-contain p-1"
              height={80}
              onError={() => setLogoAvailable(false)}
              src="/brand/logo-asi.png"
              unoptimized
              width={80}
            />
          ) : (
            <span className="text-xl font-black text-[#0B7A3B]">ASI</span>
          )}
        </div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#0B7A3B]">
          Pollería ASI
        </p>
        <h1 className="mt-2 text-2xl font-black text-[#1F2933]">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Usa tu email y contraseña de acceso.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-[#1F2933]">Email</span>
          <input
            autoComplete="email"
            className="h-12 rounded-md border border-[#E8DFC6] bg-white px-3 text-base outline-none transition focus:border-[#0B7A3B] focus:ring-4 focus:ring-[#0B7A3B]/15"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="usuario@polleria-asi.com"
            type="email"
            value={email}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-[#1F2933]">
            Contraseña
          </span>
          <input
            autoComplete="current-password"
            className="h-12 rounded-md border border-[#E8DFC6] bg-white px-3 text-base outline-none transition focus:border-[#0B7A3B] focus:ring-4 focus:ring-[#0B7A3B]/15"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tu contraseña"
            type="password"
            value={password}
          />
        </label>

        {error ? (
          <div className="rounded-md border border-[#D92D20]/30 bg-white px-3 py-2 text-sm font-semibold text-[#D92D20]">
            {error}
          </div>
        ) : null}

        <Button
          className="h-12 bg-[#D92D20] text-base font-black text-white hover:bg-[#B42318]"
          disabled={isSubmitting || status === "loading"}
          type="submit"
        >
          {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </div>
    </form>
  );
}
