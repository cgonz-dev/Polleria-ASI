type ModulePlaceholderProps = {
  description: string;
  module: string;
  title: string;
};

export function ModulePlaceholder({
  description,
  module,
  title,
}: ModulePlaceholderProps) {
  return (
    <section className="flex w-full flex-col gap-6">
      <div className="rounded-lg border border-[#E8DFC6] bg-white/95 p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-[#0B7A3B]">
          {module}
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-[#1F2933] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280] sm:text-base">
          {description}
        </p>
      </div>

      <div className="rounded-md border border-dashed border-[#E8DFC6] bg-[#FAF7EF] p-6 shadow-sm">
        <p className="text-sm font-bold text-[#0B7A3B]">Módulo inicial</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
          La ruta ya existe dentro del layout principal y queda lista para
          recibir formularios, tablas, reportes o flujos específicos en una
          siguiente especificación.
        </p>
      </div>
    </section>
  );
}
