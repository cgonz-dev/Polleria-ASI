import { SystemSettingsPage } from "@/components/admin/configuracion/SystemSettingsPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ConfiguracionPage() {
  return (
    <ProtectedRoute requireAdmin>
      <SystemSettingsPage />
    </ProtectedRoute>
  );
}
