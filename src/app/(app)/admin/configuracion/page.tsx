import { ModulePlaceholder } from "@/components/app/module-placeholder";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ConfiguracionPage() {
  return (
    <ProtectedRoute requireAdmin>
      <ModulePlaceholder
        description="Base para parámetros del negocio, ticket, caja y futuras integraciones."
        module="Administración"
        title="Configuración"
      />
    </ProtectedRoute>
  );
}
