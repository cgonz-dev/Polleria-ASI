import * as React from "react";

import { formatMoney } from "@/components/ventas-pluma/formatters";
import type { PremiumCustomer } from "@/lib/supabase/types";

type PreferredCustomerSelectProps = {
  customers: PremiumCustomer[];
  onChange: (customerId: string) => void;
  value: string;
};

export function PreferredCustomerSelect({
  customers,
  onChange,
  value,
}: PreferredCustomerSelectProps) {
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
          Buscar cliente preferencial
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
        <option value="">Selecciona un cliente preferencial</option>
        {filteredCustomers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name} - {formatMoney(customer.preferred_price_per_kg)}/kg
          </option>
        ))}
      </select>

      {value ? (
        <p className="text-xs text-[#6B7280]">
          Los servicios extra usan los precios configurados del cliente.
        </p>
      ) : null}

      {customers.length === 0 ? (
        <p className="text-sm text-[#D92D20]">
          No hay clientes preferenciales activos para seleccionar.
        </p>
      ) : null}
    </div>
  );
}
