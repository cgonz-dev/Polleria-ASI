import * as React from "react";

import type { PremiumCustomer } from "@/lib/supabase/types";
import { formatMoney } from "@/components/ventas-pluma/formatters";

type PremiumCustomerSelectProps = {
  customers: PremiumCustomer[];
  onChange: (customerId: string) => void;
  value: string;
};

export function PremiumCustomerSelect({
  customers,
  onChange,
  value,
}: PremiumCustomerSelectProps) {
  const [search, setSearch] = React.useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredCustomers = normalizedSearch
    ? customers.filter((customer) =>
        customer.name.toLowerCase().includes(normalizedSearch)
      )
    : customers;

  return (
    <div className="grid gap-2">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-[#1F2933]">
          Buscar cliente premium
        </span>
        <input
          className="h-12 rounded-md border border-[#E8DFC6] bg-white px-3 text-base shadow-sm outline-none transition focus:border-[#0B7A3B] focus:ring-4 focus:ring-[#0B7A3B]/15"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nombre del cliente"
          type="search"
          value={search}
        />
      </label>

      <select
        className="h-12 rounded-md border border-[#E8DFC6] bg-white px-3 text-base shadow-sm outline-none transition focus:border-[#0B7A3B] focus:ring-4 focus:ring-[#0B7A3B]/15"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">Selecciona un cliente premium</option>
        {filteredCustomers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name} - descuento {formatMoney(customer.discount_per_kg)}/kg
          </option>
        ))}
      </select>

      {customers.length === 0 ? (
        <p className="text-sm text-[#D92D20]">
          No hay clientes premium activos para seleccionar.
        </p>
      ) : null}
    </div>
  );
}
