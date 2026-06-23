import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PreferredCustomersPage } from "@/components/clientes-preferenciales/PreferredCustomersPage";

export default function ClientesPreferencialesPage() {
  return (
    <ProtectedRoute requireAdmin>
      <PreferredCustomersPage />
    </ProtectedRoute>
  );
}
