import { AppShell } from "@/components/app/app-shell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ApplicationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
