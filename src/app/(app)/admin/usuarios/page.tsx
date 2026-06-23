import { AdminUsersPanel } from "@/components/admin-users/AdminUsersPanel";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function UsuariosPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminUsersPanel />
    </ProtectedRoute>
  );
}
