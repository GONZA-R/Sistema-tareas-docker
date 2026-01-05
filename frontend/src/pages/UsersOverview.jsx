import { useEffect, useState } from "react";
import api from "../services/api";

export default function UsersOverview() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
  });

  const loggedUsername = localStorage.getItem("username"); // 👈 usuario logueado

  useEffect(() => {
    api
      .get("/users/")
      .then((res) => {
        const mapped = res.data.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role_display,
          is_active: u.is_active,
        }));
        setUsers(mapped);
      })
      .catch(() => console.error("Error al cargar usuarios"));
  }, []);

  const filteredUsers = users.filter((u) => {
    if (filters.role && u.role !== filters.role) return false;
    if (filters.status === "activo" && !u.is_active) return false;
    if (filters.status === "inactivo" && u.is_active) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-orange-50/20 p-6">
      {/* HEADER */}
      <div className="bg-white border border-orange-200 rounded-2xl p-6 mb-6 shadow-lg">
        <h1 className="text-2xl font-bold text-orange-800">
          Usuarios del sistema
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Vista general — solo lectura
        </p>

        <div className="flex flex-wrap gap-3 mt-5">
          <select
            className="border border-orange-200 rounded-xl px-4 py-2 text-sm bg-white shadow-sm hover:shadow-md transition"
            value={filters.role}
            onChange={(e) =>
              setFilters((p) => ({ ...p, role: e.target.value }))
            }
          >
            <option value="">Todos los roles</option>
            {[...new Set(users.map((u) => u.role))].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            className="border border-orange-200 rounded-xl px-4 py-2 text-sm bg-white shadow-sm hover:shadow-md transition"
            value={filters.status}
            onChange={(e) =>
              setFilters((p) => ({ ...p, status: e.target.value }))
            }
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-lg">
        <div className="grid grid-cols-[1.5fr_2fr_1fr_1fr] bg-orange-200/50 px-5 py-3 text-sm font-semibold text-orange-800">
          <div>Usuario</div>
          <div>Email</div>
          <div>Rol</div>
          <div>Estado</div>
        </div>

        {filteredUsers.length === 0 && (
          <p className="text-center py-8 text-gray-500">
            No hay usuarios para mostrar
          </p>
        )}

        {filteredUsers.map((u, index) => {
          const isLoggedUser = u.username === loggedUsername;

          return (
            <div
              key={u.id}
              className={`grid grid-cols-[1.5fr_2fr_1fr_1fr] px-5 py-3 border-t text-sm transition-all
                ${
                  isLoggedUser
                    ? "bg-indigo-50 ring-1 ring-indigo-200"
                    : index % 2 === 0
                    ? "bg-white"
                    : "bg-orange-50/30"
                }
                hover:bg-orange-50
              `}
            >
              <div className="font-medium truncate flex items-center gap-2">
                {u.username}
                {isLoggedUser && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white font-semibold">
                    Vos
                  </span>
                )}
              </div>

              <div className="truncate text-gray-600">
                {u.email || "-"}
              </div>

              <div className="capitalize">{u.role}</div>

              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    u.is_active
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {u.is_active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
