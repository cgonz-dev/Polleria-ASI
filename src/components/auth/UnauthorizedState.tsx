import Link from "next/link";

export function UnauthorizedState() {
  return (
    <section className="rounded-lg border border-[#E8DFC6] bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-bold uppercase tracking-wide text-[#D92D20]">
        Acceso restringido
      </p>
      <h1 className="mt-2 text-2xl font-black text-[#1F2933]">
        No tienes permiso para acceder a esta sección.
      </h1>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#6B7280]">
        Si necesitas acceso, pide a un administrador que actualice tus permisos
        internos.
      </p>
      <Link
        className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[#0B7A3B] px-4 text-sm font-bold text-white hover:bg-[#096732]"
        href="/ventas/pluma"
      >
        Volver a Venta en Pluma
      </Link>
    </section>
  );
}
