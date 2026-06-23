"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/formatters/money";
import {
  createPreferredCustomer,
  getLatestBusinessSettings,
  getPreferredCustomers,
  updatePreferredCustomer,
} from "@/lib/modules/clientes-preferenciales/service";
import {
  getPreferredCustomerDefaults,
  type PreferredCustomerFormInput,
} from "@/lib/modules/clientes-preferenciales/types";
import type { BusinessSettings, PremiumCustomer } from "@/lib/supabase/types";

type FormState = {
  id: string | null;
  name: string;
  phone: string;
  preferredPricePerKg: string;
  skinningPricePerChicken: string;
  breastFilletPricePerChicken: string;
  active: boolean;
  notes: string;
};

const emptyForm: FormState = {
  active: true,
  breastFilletPricePerChicken: "",
  id: null,
  name: "",
  notes: "",
  phone: "",
  preferredPricePerKg: "",
  skinningPricePerChicken: "",
};

function toMoneyInput(value: number | null | undefined) {
  return value == null ? "" : value.toFixed(2);
}

function parseMoneyInput(value: string) {
  const normalized = value.trim().replace(",", ".");
  return normalized ? Number(normalized) : Number.NaN;
}

function normalizeOptionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildCreateForm(settings: BusinessSettings | null): FormState {
  if (!settings) {
    return emptyForm;
  }

  const defaults = getPreferredCustomerDefaults(settings);

  return {
    ...emptyForm,
    breastFilletPricePerChicken: toMoneyInput(
      defaults.breastFilletPricePerChicken
    ),
    preferredPricePerKg: toMoneyInput(defaults.preferredPricePerKg),
    skinningPricePerChicken: toMoneyInput(defaults.skinningPricePerChicken),
  };
}

function buildEditForm(customer: PremiumCustomer): FormState {
  return {
    active: customer.active,
    breastFilletPricePerChicken: toMoneyInput(
      customer.breast_fillet_price_per_chicken
    ),
    id: customer.id,
    name: customer.name,
    notes: customer.notes ?? "",
    phone: customer.phone ?? "",
    preferredPricePerKg: toMoneyInput(customer.preferred_price_per_kg),
    skinningPricePerChicken: toMoneyInput(customer.skinning_price_per_chicken),
  };
}

function Field({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "tel";
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#1F2933]">{label}</span>
      <input
        className="h-12 rounded-md border border-[#E8DFC6] bg-white px-3 text-base font-semibold shadow-sm outline-none transition focus:border-[#0B7A3B] focus:ring-4 focus:ring-[#0B7A3B]/15"
        inputMode={type === "number" ? "decimal" : undefined}
        min={type === "number" ? "0" : undefined}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        step={type === "number" ? "0.01" : undefined}
        type={type === "number" ? "number" : type}
        value={value}
      />
    </label>
  );
}

export function PreferredCustomersPage() {
  const [settings, setSettings] = React.useState<BusinessSettings | null>(null);
  const [customers, setCustomers] = React.useState<PremiumCustomer[]>([]);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const filteredCustomers = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return normalizedSearch
      ? customers.filter((customer) =>
          customer.name.toLowerCase().includes(normalizedSearch)
        )
      : customers;
  }, [customers, search]);

  const isEditing = Boolean(form.id);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [nextSettings, nextCustomers] = await Promise.all([
        getLatestBusinessSettings(),
        getPreferredCustomers(),
      ]);
      setSettings(nextSettings);
      setCustomers(nextCustomers);
      setForm((current) =>
        current.id || current.name.trim()
          ? current
          : buildCreateForm(nextSettings)
      );
    } catch {
      setError("No se pudieron cargar los clientes preferenciales.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadData]);

  function updateField(field: keyof FormState, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(buildCreateForm(settings));
    setError("");
    setMessage("");
  }

  function validateForm(): {
    errors: string[];
    input: PreferredCustomerFormInput | null;
  } {
    const errors: string[] = [];
    const preferredPrice = parseMoneyInput(form.preferredPricePerKg);
    const skinningPrice = parseMoneyInput(form.skinningPricePerChicken);
    const breastFilletPrice = parseMoneyInput(
      form.breastFilletPricePerChicken
    );

    if (!form.name.trim()) {
      errors.push("Ingresa el nombre del cliente.");
    }

    if (!Number.isFinite(preferredPrice) || preferredPrice < 0) {
      errors.push("El precio por kg no puede ser negativo.");
    }

    if (!Number.isFinite(skinningPrice) || skinningPrice < 0) {
      errors.push("El precio de despielada no puede ser negativo.");
    }

    if (!Number.isFinite(breastFilletPrice) || breastFilletPrice < 0) {
      errors.push("El precio de pechuga fileteada no puede ser negativo.");
    }

    if (errors.length > 0) {
      return { errors, input: null };
    }

    return {
      errors,
      input: {
        active: form.active,
        breastFilletPricePerChicken: breastFilletPrice,
        name: form.name,
        notes: normalizeOptionalText(form.notes),
        phone: normalizeOptionalText(form.phone),
        preferredPricePerKg: preferredPrice,
        skinningPricePerChicken: skinningPrice,
      },
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const validation = validateForm();

    if (validation.errors.length > 0 || !validation.input) {
      setError(validation.errors.join(" "));
      return;
    }

    setIsSaving(true);

    try {
      const savedCustomer = form.id
        ? await updatePreferredCustomer(form.id, validation.input)
        : await createPreferredCustomer(validation.input);

      setCustomers((current) => {
        const withoutSaved = current.filter(
          (customer) => customer.id !== savedCustomer.id
        );
        return [...withoutSaved, savedCustomer].sort((left, right) =>
          left.name.localeCompare(right.name, "es-MX")
        );
      });
      setForm(buildCreateForm(settings));
      setMessage(
        form.id
          ? "Cliente preferencial actualizado."
          : "Cliente preferencial creado."
      );
    } catch {
      setError(
        form.id
          ? "No se pudo actualizar el cliente preferencial."
          : "No se pudo crear el cliente preferencial."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="brand-workspace rounded-lg p-3 text-[#1F2933] sm:p-5">
      <div className="mb-5 rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm sm:p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-[#0B7A3B]">
          Clientes
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[#1F2933] sm:text-3xl">
          Clientes Preferenciales
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
          Precios especiales por kg y servicios extra configurables por cliente.
        </p>
      </div>

      {error ? (
        <div className="mb-5 rounded-md border border-[#D92D20]/30 bg-white px-4 py-3 text-sm font-semibold text-[#D92D20]">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mb-5 rounded-md border border-[#0B7A3B]/25 bg-[#EAF7EE] px-4 py-3 text-sm font-semibold text-[#0B7A3B]">
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#1F2933]">
                Lista de clientes
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                {isLoading
                  ? "Cargando..."
                  : `${customers.length} clientes registrados.`}
              </p>
            </div>
            <label className="grid gap-2 sm:w-72">
              <span className="text-sm font-semibold text-[#1F2933]">
                Buscar
              </span>
              <input
                className="h-11 rounded-md border border-[#E8DFC6] bg-white px-3 text-sm shadow-sm outline-none transition focus:border-[#0B7A3B] focus:ring-4 focus:ring-[#0B7A3B]/15"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nombre del cliente"
                type="search"
                value={search}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-3">
            {filteredCustomers.length === 0 ? (
              <div className="rounded-md border border-[#E8DFC6] bg-[#FAF7EF] px-4 py-6 text-center text-sm text-[#6B7280]">
                No hay clientes preferenciales para mostrar.
              </div>
            ) : null}

            {filteredCustomers.map((customer) => (
              <article
                className="rounded-md border border-[#E8DFC6] bg-[#FAF7EF] p-4"
                key={customer.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-[#1F2933]">
                        {customer.name}
                      </h3>
                      <span
                        className={
                          customer.active
                            ? "rounded-full bg-[#EAF7EE] px-2 py-1 text-xs font-black text-[#0B7A3B]"
                            : "rounded-full bg-[#F4F0E6] px-2 py-1 text-xs font-black text-[#6B7280]"
                        }
                      >
                        {customer.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      {customer.phone ?? "Sin teléfono"}
                    </p>
                  </div>
                  <Button
                    className="h-10 border-[#0B7A3B] bg-white px-4 font-bold text-[#0B7A3B] hover:bg-[#EAF7EE]"
                    onClick={() => {
                      setForm(buildEditForm(customer));
                      setMessage("");
                      setError("");
                    }}
                    type="button"
                    variant="outline"
                  >
                    Editar
                  </Button>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-md bg-white px-3 py-2">
                    <p className="text-xs font-black uppercase text-[#0B7A3B]">
                      Precio por kg
                    </p>
                    <p className="mt-1 font-black">
                      {formatMoney(customer.preferred_price_per_kg)}/kg
                    </p>
                  </div>
                  <div className="rounded-md bg-white px-3 py-2">
                    <p className="text-xs font-black uppercase text-[#0B7A3B]">
                      Despielada
                    </p>
                    <p className="mt-1 font-black">
                      {formatMoney(customer.skinning_price_per_chicken)}/pollo
                    </p>
                  </div>
                  <div className="rounded-md bg-white px-3 py-2">
                    <p className="text-xs font-black uppercase text-[#0B7A3B]">
                      Pechuga fileteada
                    </p>
                    <p className="mt-1 font-black">
                      {formatMoney(customer.breast_fillet_price_per_chicken)}
                      /pollo
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <form
          className="rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm sm:p-5 xl:sticky xl:top-24 xl:self-start"
          onSubmit={handleSubmit}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#1F2933]">
                {isEditing ? "Editar cliente" : "Nuevo cliente"}
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Cada cliente conserva sus propios precios.
              </p>
            </div>
            {isEditing ? (
              <Button
                className="h-10 border-[#0B7A3B] bg-white px-3 font-bold text-[#0B7A3B] hover:bg-[#EAF7EE]"
                onClick={resetForm}
                type="button"
                variant="outline"
              >
                Nuevo
              </Button>
            ) : null}
          </div>

          <div className="grid gap-4">
            <Field
              label="Nombre"
              onChange={(value) => updateField("name", value)}
              placeholder="Ej. Don Javi"
              value={form.name}
            />
            <Field
              label="Teléfono opcional"
              onChange={(value) => updateField("phone", value)}
              type="tel"
              value={form.phone}
            />
            <Field
              label="Precio por kg"
              onChange={(value) => updateField("preferredPricePerKg", value)}
              type="number"
              value={form.preferredPricePerKg}
            />
            <Field
              label="Precio despielada por pollo"
              onChange={(value) =>
                updateField("skinningPricePerChicken", value)
              }
              type="number"
              value={form.skinningPricePerChicken}
            />
            <Field
              label="Precio pechuga fileteada por pollo"
              onChange={(value) =>
                updateField("breastFilletPricePerChicken", value)
              }
              type="number"
              value={form.breastFilletPricePerChicken}
            />
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[#1F2933]">
                Observaciones
              </span>
              <textarea
                className="min-h-24 rounded-md border border-[#E8DFC6] bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-[#0B7A3B] focus:ring-4 focus:ring-[#0B7A3B]/15"
                onChange={(event) => updateField("notes", event.target.value)}
                value={form.notes}
              />
            </label>
            <label className="flex min-h-11 items-center gap-3 rounded-md border border-[#E8DFC6] bg-[#FAF7EF] px-3 py-2 text-sm font-semibold">
              <input
                checked={form.active}
                className="h-4 w-4 accent-[#0B7A3B]"
                onChange={(event) => updateField("active", event.target.checked)}
                type="checkbox"
              />
              Cliente activo
            </label>

            <Button
              className="h-12 w-full bg-[#D92D20] font-black text-white hover:bg-[#B42318]"
              disabled={isSaving || isLoading}
              type="submit"
            >
              {isSaving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear cliente"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
