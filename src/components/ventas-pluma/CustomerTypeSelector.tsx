import type { CustomerType } from "@/lib/modules/ventas-pluma/types";
import { cn } from "@/lib/utils";

type CustomerTypeSelectorProps = {
  onChange: (type: CustomerType) => void;
  value: CustomerType;
};

const options: { label: string; value: CustomerType }[] = [
  { label: "Público general", value: "PUBLICO_GENERAL" },
  { label: "Cliente premium", value: "CLIENTE_PREMIUM" },
];

export function CustomerTypeSelector({
  onChange,
  value,
}: CustomerTypeSelectorProps) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-[#1F2933]">
        Tipo de cliente
      </span>
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#FAF7EF] p-1">
        {options.map((option) => (
          <button
            className={cn(
              "h-12 rounded-md border px-3 text-sm font-semibold transition",
              value === option.value
                ? "border-[#0B7A3B] bg-[#EAF7EE] text-[#0B7A3B] shadow-sm"
                : "border-transparent bg-white text-[#1F2933] hover:border-[#E8DFC6]"
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
