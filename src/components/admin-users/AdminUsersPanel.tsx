"use client";

import * as React from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { APP_USER_ROLES, type AppUser } from "@/lib/supabase/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type UserPatch = Partial<Pick<AppUser, "active" | "can_print_tickets" | "role">>;

function roleLabel(role: AppUser["role"]) {
  return role === "ADMIN" ? "Administrador" : "Cajero";
}

export function AdminUsersPanel() {
  const supabase = React.useMemo(() => createBrowserSupabaseClient(), []);
  const { refreshUser, user: currentUser } = useAuth();
  const [users, setUsers] = React.useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("app_users")
      .select("*")
      .order("name", { ascending: true });

    if (loadError) {
      setError("No se pudieron cargar los usuarios.");
      setUsers([]);
    } else {
      setUsers(data ?? []);
    }

    setIsLoading(false);
  }, [supabase]);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadUsers]);

  async function updateUser(userId: string, patch: UserPatch) {
    setUpdatingId(userId);
    setError("");
    setSuccessMessage("");

    const { data, error: updateError } = await supabase
      .from("app_users")
      .update(patch)
      .eq("id", userId)
      .select("*")
      .single();

    if (updateError || !data) {
      setError("No se pudo actualizar el usuario.");
    } else {
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === userId ? data : user))
      );
      setSuccessMessage("Usuario actualizado correctamente.");

      if (currentUser?.id === userId) {
        await refreshUser();
      }
    }

    setUpdatingId(null);
  }

  return (
    <section className="brand-workspace rounded-lg p-3 text-[#1F2933] sm:p-5">
      <div className="mb-5 rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#0B7A3B]">
              Administración
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#1F2933] sm:text-3xl">
              Usuarios
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Administra roles, usuarios activos y permiso de impresión. Las
              cuentas de acceso se crean por ahora desde Supabase Auth.
            </p>
          </div>
          <Button
            className="h-11 border-[#0B7A3B] bg-white px-4 font-bold text-[#0B7A3B] hover:bg-[#EAF7EE]"
            onClick={() => void loadUsers()}
            type="button"
            variant="outline"
          >
            Recargar
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-5 rounded-md border border-[#D92D20]/30 bg-white px-4 py-3 text-sm font-semibold text-[#D92D20]">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-5 rounded-md border border-[#0B7A3B]/25 bg-[#EAF7EE] px-4 py-3 text-sm font-semibold text-[#0B7A3B]">
          {successMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-[#E8DFC6] bg-white shadow-sm">
        {isLoading ? (
          <div className="px-4 py-6 text-sm font-semibold text-[#6B7280]">
            Cargando usuarios...
          </div>
        ) : null}

        {!isLoading && users.length === 0 ? (
          <div className="px-4 py-6 text-sm text-[#6B7280]">
            No hay usuarios internos registrados en app_users.
          </div>
        ) : null}

        {!isLoading && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-[#FAF7EF] text-xs font-black uppercase text-[#0B7A3B]">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Activo</th>
                  <th className="px-4 py-3">Imprime tickets</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isUpdating = updatingId === user.id;

                  return (
                    <tr className="border-t border-[#E8DFC6]" key={user.id}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-[#1F2933]">{user.name}</p>
                        <p className="text-xs text-[#6B7280]">
                          {user.username ?? "Sin username"} ·{" "}
                          {user.auth_user_id
                            ? "Vinculado a Auth"
                            : "Sin Auth vinculado"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-[#6B7280]">
                        {user.email ?? "Sin email"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="h-10 rounded-md border border-[#E8DFC6] bg-white px-3 font-semibold text-[#1F2933] outline-none transition focus:border-[#0B7A3B] focus:ring-4 focus:ring-[#0B7A3B]/15"
                          disabled={isUpdating}
                          onChange={(event) =>
                            void updateUser(user.id, {
                              role: event.target.value as AppUser["role"],
                            })
                          }
                          value={user.role}
                        >
                          {APP_USER_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {roleLabel(role)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <label className="inline-flex items-center gap-2 font-semibold text-[#1F2933]">
                          <input
                            checked={user.active}
                            className="size-5 accent-[#0B7A3B]"
                            disabled={isUpdating}
                            onChange={(event) =>
                              void updateUser(user.id, {
                                active: event.target.checked,
                              })
                            }
                            type="checkbox"
                          />
                          {user.active ? "Activo" : "Inactivo"}
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <label className="inline-flex items-center gap-2 font-semibold text-[#1F2933]">
                          <input
                            checked={user.can_print_tickets}
                            className="size-5 accent-[#0B7A3B]"
                            disabled={isUpdating}
                            onChange={(event) =>
                              void updateUser(user.id, {
                                can_print_tickets: event.target.checked,
                              })
                            }
                            type="checkbox"
                          />
                          {user.can_print_tickets ? "Sí" : "No"}
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
