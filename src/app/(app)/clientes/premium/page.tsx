import { redirect } from "next/navigation";

export default function ClientesLegacyRedirectPage() {
  redirect("/clientes/preferenciales");
}
