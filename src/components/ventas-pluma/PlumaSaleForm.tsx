"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { PendingTicketsAccessCard } from "@/components/caja/tickets-pendientes/PendingTicketsAccessCard";
import { CustomerTypeSelector } from "@/components/ventas-pluma/CustomerTypeSelector";
import { formatMoney } from "@/components/ventas-pluma/formatters";
import { PlumaSaleSummary } from "@/components/ventas-pluma/PlumaSaleSummary";
import { PremiumCustomerSelect } from "@/components/ventas-pluma/PremiumCustomerSelect";
import { PlumaSaleTicketModal } from "@/components/tickets/PlumaSaleTicketModal";
import { Button } from "@/components/ui/button";
import {
  calculatePlumaSale,
  roundKg,
} from "@/lib/modules/ventas-pluma/calculations";
import {
  createPlumaSale,
  getActivePremiumCustomers,
  getBusinessSettings,
} from "@/lib/modules/ventas-pluma/service";
import { markPlumaSalePrinted } from "@/lib/modules/tickets-pendientes/service";
import type {
  CustomerType,
  PlumaSaleInitialData,
} from "@/lib/modules/ventas-pluma/types";
import type {
  BusinessSettings,
  PlumaSale,
  PremiumCustomer,
} from "@/lib/supabase/types";
import { canPrintTickets as canUserPrintTickets } from "@/lib/auth/permissions";

type LoadErrors = {
  businessSettings?: string;
  premiumCustomers?: string;
};

type TicketState = {
  sale: PlumaSale;
};

const REAL_BUSINESS_PHONE = "456-106-0141";

function parseDecimalInput(value: string) {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) {
    return 0;
  }

  return Number(normalized);
}

function hasMoreThanThreeDecimals(value: string) {
  const normalized = value.trim().replace(",", ".");
  const decimals = normalized.split(".")[1];

  return decimals ? decimals.length > 3 : false;
}

function buildInitialData(
  businessSettings: BusinessSettings,
  premiumCustomers: PremiumCustomer[]
): PlumaSaleInitialData {
  return {
    businessSettings,
    premiumCustomers,
  };
}

export function PlumaSaleForm() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [initialData, setInitialData] =
    React.useState<PlumaSaleInitialData | null>(null);
  const [loadErrors, setLoadErrors] = React.useState<LoadErrors>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMarkingPrinted, setIsMarkingPrinted] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [customerType, setCustomerType] =
    React.useState<CustomerType>("PUBLICO_GENERAL");
  const [premiumCustomerId, setPremiumCustomerId] = React.useState("");
  const [chickenQuantityInput, setChickenQuantityInput] = React.useState("");
  const [totalWeightInput, setTotalWeightInput] = React.useState("");
  const [formErrors, setFormErrors] = React.useState<string[]>([]);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [ticketState, setTicketState] = React.useState<TicketState | null>(
    null
  );
  const quantityInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      const [settingsResult, customersResult] = await Promise.allSettled([
        getBusinessSettings(),
        getActivePremiumCustomers(),
      ]);

      if (!isMounted) {
        return;
      }

      const nextErrors: LoadErrors = {};
      const settings =
        settingsResult.status === "fulfilled" ? settingsResult.value : null;
      const customers =
        customersResult.status === "fulfilled" ? customersResult.value : [];

      if (settingsResult.status === "rejected") {
        nextErrors.businessSettings =
          "No se pudo cargar la configuración del negocio.";
      }

      if (customersResult.status === "rejected") {
        nextErrors.premiumCustomers =
          "No se pudieron cargar los clientes premium activos.";
      }

      setLoadErrors(nextErrors);
      setInitialData(settings ? buildInitialData(settings, customers) : null);
      setIsLoading(false);
      setTimeout(() => quantityInputRef.current?.focus(), 0);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const businessSettings = initialData?.businessSettings ?? null;
  const premiumCustomers = initialData?.premiumCustomers ?? [];
  const selectedPremiumCustomer = premiumCustomers.find(
    (customer) => customer.id === premiumCustomerId
  );
  const chickenQuantity = Number(chickenQuantityInput);
  const parsedWeight = parseDecimalInput(totalWeightInput);
  const basePricePerKg = businessSettings?.current_price_per_kg ?? 0;
  const preparationUnitPrice =
    businessSettings?.preparation_price_per_chicken ?? 0;
  const discountPerKg =
    customerType === "CLIENTE_PREMIUM"
      ? selectedPremiumCustomer?.discount_per_kg ?? 0
      : 0;
  const calculation = calculatePlumaSale({
    basePricePerKg,
    chickenQuantity: Number.isInteger(chickenQuantity) ? chickenQuantity : 0,
    discountPerKg,
    preparationUnitPrice,
    totalWeightKg: Number.isFinite(parsedWeight) ? parsedWeight : 0,
  });
  const customerName =
    customerType === "CLIENTE_PREMIUM"
      ? selectedPremiumCustomer?.name ?? "Cliente premium"
      : "Público general";
  const businessPhone =
    businessSettings?.phone?.trim() &&
    businessSettings.phone.trim() !== "000-000-0000"
      ? businessSettings.phone.trim()
      : REAL_BUSINESS_PHONE;
  const userCanPrintTickets = canUserPrintTickets(currentUser);

  function resetForNewSale() {
    setChickenQuantityInput("");
    setTotalWeightInput("");
    setCustomerType("PUBLICO_GENERAL");
    setPremiumCustomerId("");
    setFormErrors([]);
    setTicketState(null);
    setTimeout(() => quantityInputRef.current?.focus(), 0);
  }

  function validateForm() {
    const errors: string[] = [];
    const quantityText = chickenQuantityInput.trim();
    const weightText = totalWeightInput.trim();
    const quantityValue = Number(quantityText);
    const weightValue = parseDecimalInput(weightText);

    if (!currentUser) {
      errors.push("No se pudo cargar el usuario actual.");
    }

    if (!quantityText) {
      errors.push("Ingresa la cantidad de pollos.");
    } else if (
      !Number.isInteger(quantityValue) ||
      quantityValue <= 0 ||
      quantityText.includes(".") ||
      quantityText.includes(",")
    ) {
      errors.push("Ingresa una cantidad válida de pollos.");
    }

    if (!weightText || !Number.isFinite(weightValue) || weightValue <= 0) {
      errors.push("El peso total debe ser mayor a 0.");
    } else if (hasMoreThanThreeDecimals(weightText)) {
      errors.push("El peso total debe ser mayor a 0.");
    }

    if (customerType === "CLIENTE_PREMIUM" && !selectedPremiumCustomer) {
      errors.push("Selecciona un cliente premium.");
    }

    if (!businessSettings || basePricePerKg <= 0) {
      errors.push("No se pudo cargar el precio actual del pollo.");
    }

    if (calculation.appliedPricePerKg <= 0) {
      errors.push("El precio aplicado debe ser mayor a 0.");
    }

    return errors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");

    const errors = validateForm();
    setFormErrors(errors);

    if (errors.length > 0 || !businessSettings || !currentUser) {
      return;
    }

    setIsSaving(true);

    try {
      const quantityValue = Number(chickenQuantityInput);
      const totalWeightKg = roundKg(parseDecimalInput(totalWeightInput));
      const createdSale = await createPlumaSale({
        appliedPricePerKg: calculation.appliedPricePerKg,
        basePricePerKg,
        cashierUserId: currentUser.id,
        chickenQuantity: quantityValue,
        chickenSubtotal: calculation.chickenSubtotal,
        customerId:
          customerType === "CLIENTE_PREMIUM" ? selectedPremiumCustomer!.id : null,
        customerNameSnapshot:
          customerType === "CLIENTE_PREMIUM"
            ? selectedPremiumCustomer!.name
            : "Público general",
        discountPerKg,
        grandTotal: calculation.grandTotal,
        preparationTotal: calculation.preparationTotal,
        preparationUnitPrice,
        totalWeightKg,
      });

      setSuccessMessage(
        createdSale.sale_number
          ? userCanPrintTickets
            ? `Venta ${createdSale.sale_number} registrada correctamente.`
            : `Venta ${createdSale.sale_number} registrada correctamente. Ticket pendiente de imprimir en caja.`
          : "Venta registrada correctamente."
      );
      setFormErrors([]);
      setTicketState({
        sale: createdSale,
      });
    } catch {
      setFormErrors(["No se pudo registrar la venta. Intenta de nuevo."]);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMarkPrinted(sale: PlumaSale) {
    if (!userCanPrintTickets) {
      return;
    }

    setIsMarkingPrinted(true);
    setFormErrors([]);

    try {
      const printedSale = await markPlumaSalePrinted(sale.id);
      setTicketState({ sale: printedSale });
      setSuccessMessage(`Ticket ${printedSale.sale_number} marcado como impreso.`);
    } catch {
      setFormErrors(["No se pudo marcar el ticket como impreso."]);
    } finally {
      setIsMarkingPrinted(false);
    }
  }

  return (
    <section className="brand-workspace rounded-lg p-3 text-[#1F2933] sm:p-5">
      <PlumaSaleTicketModal
        businessName={businessSettings?.business_name ?? "Pollería ASI"}
        businessPhone={businessPhone}
        canPrintTickets={userCanPrintTickets}
        isMarkingPrinted={isMarkingPrinted}
        onMarkPrinted={(sale) => void handleMarkPrinted(sale)}
        onNewSale={resetForNewSale}
        onViewPendingTickets={() => router.push("/caja/tickets-pendientes")}
        sale={ticketState?.sale ?? null}
      />

      <div className="no-print mb-5 rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#0B7A3B]">
              Pollería ASI
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#1F2933] sm:text-3xl">
              Venta rápida en Pluma
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Captura rápida para caja con cálculo automático y guardado en
              Supabase. Al terminar se abre el ticket imprimible.
            </p>
          </div>
          <div className="grid gap-3 sm:min-w-[22rem]">
            <div className="rounded-md border border-[#E8DFC6] bg-[#FAF7EF] px-4 py-3 text-sm">
              <p className="font-semibold text-[#0B7A3B]">
                {businessSettings?.business_name ?? "Pollería ASI"}
              </p>
              <p className="text-[#6B7280]">
                Precio kg: {formatMoney(basePricePerKg)}
              </p>
              <p className="text-[#6B7280]">
                Preparación: {formatMoney(preparationUnitPrice)} por pollo
              </p>
            </div>
            <PendingTicketsAccessCard canPrintTickets={userCanPrintTickets} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="no-print mb-5 rounded-md border border-[#E8DFC6] bg-white px-4 py-3 text-sm font-medium text-[#1F2933]">
          Cargando información de venta...
        </div>
      ) : null}

      {Object.values(loadErrors).filter(Boolean).length > 0 ? (
        <div className="no-print mb-5 rounded-md border border-[#D92D20]/30 bg-white px-4 py-3 text-sm text-[#D92D20]">
          {Object.values(loadErrors)
            .filter(Boolean)
            .map((error) => (
              <p key={error}>{error}</p>
            ))}
        </div>
      ) : null}

      {successMessage ? (
        <div
          aria-live="polite"
          className="no-print mb-5 rounded-md border border-[#0B7A3B]/25 bg-[#EAF7EE] px-4 py-3 text-sm font-semibold text-[#0B7A3B]"
        >
          {successMessage}
        </div>
      ) : null}

      {formErrors.length > 0 ? (
        <div
          aria-live="assertive"
          className="no-print mb-5 rounded-md border border-[#D92D20]/30 bg-white px-4 py-3 text-sm font-semibold text-[#D92D20]"
        >
          {formErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <form
          className="no-print rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm sm:p-5"
          onSubmit={handleSubmit}
        >
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#E8DFC6] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0B7A3B]">
                Captura de venta
              </h2>
              <p className="text-sm text-[#6B7280]">
                Campos grandes para registrar en caja con teclado o tablet.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-md border border-[#E8DFC6] bg-[#FAF7EF] p-4">
              <p className="text-xs font-bold uppercase text-[#0B7A3B]">
                Atiende
              </p>
              <p className="mt-1 text-lg font-black text-[#1F2933]">
                {currentUser?.name ?? "Usuario no cargado"}
              </p>
              <p className="text-sm text-[#6B7280]">
                {currentUser?.role === "ADMIN" ? "Administrador" : "Cajero"} ·{" "}
                {userCanPrintTickets
                  ? "Impresión habilitada"
                  : "Solo captura"}
              </p>
            </div>

            <CustomerTypeSelector
              onChange={(type) => {
                setCustomerType(type);
                if (type === "PUBLICO_GENERAL") {
                  setPremiumCustomerId("");
                }
              }}
              value={customerType}
            />

            {customerType === "CLIENTE_PREMIUM" ? (
              <PremiumCustomerSelect
                customers={premiumCustomers}
                onChange={setPremiumCustomerId}
                value={premiumCustomerId}
              />
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#1F2933]">
                  Cantidad de pollos
                </span>
                <input
                  className="h-14 rounded-md border border-[#E8DFC6] bg-white px-4 text-xl font-semibold shadow-sm outline-none transition focus:border-[#0B7A3B] focus:ring-4 focus:ring-[#0B7A3B]/15"
                  inputMode="numeric"
                  min="1"
                  onChange={(event) =>
                    setChickenQuantityInput(event.target.value)
                  }
                  placeholder="Ej. 2"
                  ref={quantityInputRef}
                  type="number"
                  value={chickenQuantityInput}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#1F2933]">
                  Peso total kg
                </span>
                <input
                  className="h-14 rounded-md border border-[#E8DFC6] bg-white px-4 text-xl font-semibold shadow-sm outline-none transition focus:border-[#0B7A3B] focus:ring-4 focus:ring-[#0B7A3B]/15"
                  inputMode="decimal"
                  min="0.001"
                  onChange={(event) => setTotalWeightInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="Ej. 5.500"
                  step="0.001"
                  type="number"
                  value={totalWeightInput}
                />
              </label>
            </div>

            <div className="grid gap-4 rounded-md border border-[#E8DFC6] bg-[#FAF7EF] p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-bold uppercase text-[#0B7A3B]">
                  Precio por kg
                </p>
                <p className="mt-1 text-lg font-black">
                  {formatMoney(basePricePerKg)}/kg
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[#0B7A3B]">
                  Descuento por kg
                </p>
                <p className="mt-1 text-lg font-black">
                  -{formatMoney(discountPerKg)}/kg
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[#0B7A3B]">
                  Precio aplicado
                </p>
                <p className="mt-1 text-lg font-black">
                  {formatMoney(calculation.appliedPricePerKg)}/kg
                </p>
              </div>
            </div>

            <Button
              className="h-14 w-full bg-[#D92D20] text-base font-black text-white shadow-sm hover:bg-[#B42318] disabled:opacity-60"
              disabled={isLoading || isSaving || !businessSettings}
              type="submit"
            >
              {isSaving ? "Registrando venta..." : "Registrar venta"}
            </Button>
          </div>
        </form>

        <PlumaSaleSummary
          attendantName={currentUser?.name ?? ""}
          basePricePerKg={basePricePerKg}
          calculation={calculation}
          chickenQuantity={
            Number.isInteger(chickenQuantity) && chickenQuantity > 0
              ? chickenQuantity
              : 0
          }
          customerName={customerName}
          discountPerKg={discountPerKg}
          preparationUnitPrice={preparationUnitPrice}
          totalWeightKg={Number.isFinite(parsedWeight) ? parsedWeight : 0}
        />
      </div>
    </section>
  );
}
