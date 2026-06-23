"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/formatters/money";
import {
  getBusinessSettingsForAdmin,
  updateBusinessSettings,
} from "@/lib/modules/configuracion/service";
import type { BusinessSettings } from "@/lib/supabase/types";

type FormState = {
  businessName: string;
  phone: string;
  currentPricePerKg: string;
  preparationPricePerChicken: string;
  preferredCustomerDefaultPricePerKg: string;
  defaultSkinningPricePerChicken: string;
  defaultBreastFilletPricePerChicken: string;
};

const emptyForm: FormState = {
  businessName: "",
  currentPricePerKg: "",
  defaultBreastFilletPricePerChicken: "",
  defaultSkinningPricePerChicken: "",
  phone: "",
  preparationPricePerChicken: "",
  preferredCustomerDefaultPricePerKg: "",
};

function toMoneyInput(value: number | null | undefined) {
  return value == null ? "" : value.toFixed(2);
}

function parseMoneyInput(value: string) {
  const normalized = value.trim().replace(",", ".");
  return normalized ? Number(normalized) : Number.NaN;
}

function getPreviewMoney(value: string, fallback = 0) {
  const parsed = parseMoneyInput(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildForm(settings: BusinessSettings): FormState {
  return {
    businessName: settings.business_name,
    currentPricePerKg: toMoneyInput(settings.current_price_per_kg),
    defaultBreastFilletPricePerChicken: toMoneyInput(
      settings.default_breast_fillet_price_per_chicken
    ),
    defaultSkinningPricePerChicken: toMoneyInput(
      settings.default_skinning_price_per_chicken
    ),
    phone: settings.phone,
    preparationPricePerChicken: toMoneyInput(
      settings.preparation_price_per_chicken
    ),
    preferredCustomerDefaultPricePerKg: toMoneyInput(
      settings.preferred_customer_default_price_per_kg ??
        settings.current_price_per_kg
    ),
  };
}

function Field({
  help,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  help?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
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
        type={type}
        value={value}
      />
      {help ? <span className="text-xs text-[#6B7280]">{help}</span> : null}
    </label>
  );
}

export function SystemSettingsPage() {
  const [settings, setSettings] = React.useState<BusinessSettings | null>(null);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      setIsLoading(true);
      setError("");

      try {
        const nextSettings = await getBusinessSettingsForAdmin();

        if (!mounted) {
          return;
        }

        setSettings(nextSettings);
        setForm(buildForm(nextSettings));
      } catch {
        if (mounted) {
          setError("No se pudo cargar la configuración.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const errors: string[] = [];
    const currentPrice = parseMoneyInput(form.currentPricePerKg);
    const preparation = parseMoneyInput(form.preparationPricePerChicken);
    const preferred =
      form.preferredCustomerDefaultPricePerKg.trim().length > 0
        ? parseMoneyInput(form.preferredCustomerDefaultPricePerKg)
        : currentPrice;
    const skinning = parseMoneyInput(form.defaultSkinningPricePerChicken);
    const breastFillet = parseMoneyInput(
      form.defaultBreastFilletPricePerChicken
    );

    if (!form.businessName.trim()) {
      errors.push("Ingresa el nombre del negocio.");
    }

    if (!form.phone.trim()) {
      errors.push("Ingresa el teléfono del negocio.");
    }

    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      errors.push("El precio público por kg debe ser mayor a 0.");
    }

    if (!Number.isFinite(preparation) || preparation < 0) {
      errors.push("La preparación por pollo no puede ser negativa.");
    }

    if (!Number.isFinite(preferred) || preferred < 0) {
      errors.push("El precio default preferencial no puede ser negativo.");
    }

    if (!Number.isFinite(skinning) || skinning < 0) {
      errors.push("La despielada default no puede ser negativa.");
    }

    if (!Number.isFinite(breastFillet) || breastFillet < 0) {
      errors.push("La pechuga fileteada default no puede ser negativa.");
    }

    return {
      errors,
      values: {
        breastFillet,
        currentPrice,
        preferred,
        preparation,
        skinning,
      },
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!settings) {
      return;
    }

    setError("");
    setMessage("");

    const validation = validate();

    if (validation.errors.length > 0) {
      setError(validation.errors.join(" "));
      return;
    }

    setIsSaving(true);

    try {
      const updatedSettings = await updateBusinessSettings(settings.id, {
        businessName: form.businessName,
        currentPricePerKg: validation.values.currentPrice,
        defaultBreastFilletPricePerChicken: validation.values.breastFillet,
        defaultSkinningPricePerChicken: validation.values.skinning,
        phone: form.phone,
        preparationPricePerChicken: validation.values.preparation,
        preferredCustomerDefaultPricePerKg: validation.values.preferred,
      });
      setSettings(updatedSettings);
      setForm(buildForm(updatedSettings));
      setMessage("Configuración guardada correctamente.");
    } catch {
      setError("No se pudo guardar la configuración.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="brand-workspace rounded-lg p-3 text-[#1F2933] sm:p-5">
      <div className="mb-5 rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm sm:p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-[#0B7A3B]">
          Administración
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[#1F2933] sm:text-3xl">
          Configuración
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
          Precios generales y defaults para nuevos clientes preferenciales.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-md border border-[#E8DFC6] bg-white px-4 py-6 text-sm font-semibold text-[#6B7280] shadow-sm">
          Cargando configuración...
        </div>
      ) : (
        <form
          className="rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm sm:p-5"
          onSubmit={handleSubmit}
        >
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

          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nombre del negocio"
                onChange={(value) => updateField("businessName", value)}
                value={form.businessName}
              />
              <Field
                label="Teléfono"
                onChange={(value) => updateField("phone", value)}
                value={form.phone}
              />
            </div>

            <div className="grid gap-4 rounded-md border border-[#E8DFC6] bg-[#FAF7EF] p-4 sm:grid-cols-2 lg:grid-cols-5">
              <Field
                label="Precio público por kg"
                onChange={(value) => updateField("currentPricePerKg", value)}
                type="number"
                value={form.currentPricePerKg}
              />
              <Field
                label="Preparación público general"
                onChange={(value) =>
                  updateField("preparationPricePerChicken", value)
                }
                type="number"
                value={form.preparationPricePerChicken}
              />
              <Field
                help="Si lo dejas vacío, se usa el precio público."
                label="Precio default cliente preferencial"
                onChange={(value) =>
                  updateField("preferredCustomerDefaultPricePerKg", value)
                }
                type="number"
                value={form.preferredCustomerDefaultPricePerKg}
              />
              <Field
                label="Despielada default"
                onChange={(value) =>
                  updateField("defaultSkinningPricePerChicken", value)
                }
                type="number"
                value={form.defaultSkinningPricePerChicken}
              />
              <Field
                label="Pechuga fileteada default"
                onChange={(value) =>
                  updateField("defaultBreastFilletPricePerChicken", value)
                }
                type="number"
                value={form.defaultBreastFilletPricePerChicken}
              />
            </div>

            <div className="rounded-md border border-[#E8DFC6] bg-white px-4 py-3 text-sm text-[#6B7280]">
              <p className="font-semibold text-[#1F2933]">
                Resumen de defaults para nuevos clientes:
              </p>
              <p className="mt-1">
                Precio preferencial{" "}
                {formatMoney(
                  getPreviewMoney(
                    form.preferredCustomerDefaultPricePerKg,
                    getPreviewMoney(form.currentPricePerKg)
                  )
                )}
                /kg, despielada{" "}
                {formatMoney(
                  getPreviewMoney(form.defaultSkinningPricePerChicken)
                )}
                /pollo, pechuga fileteada{" "}
                {formatMoney(
                  getPreviewMoney(form.defaultBreastFilletPricePerChicken)
                )}
                /pollo.
              </p>
            </div>

            <Button
              className="h-12 w-full bg-[#D92D20] font-black text-white hover:bg-[#B42318] sm:w-auto sm:px-6"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Guardando..." : "Guardar configuración"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
