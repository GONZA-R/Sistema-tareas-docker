import React, { useState, useEffect } from "react";
import UserModal from "../components/UserModal";
import NewUserModal from "../components/NewUserModal";
import ConfirmModal from "../components/ConfirmModal";
import api from "../services/api";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newEmployeeModalOpen, setNewEmployeeModalOpen] = useState(false);
  const [employeeParent, setEmployeeParent] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const [filters, setFilters] = useState({ role: "", status: "", assignedTo: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api
      .get("/users/")
      .then((res) => {
        const mapped = res.data.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role_display,
          is_active: u.is_active,
          assigned_to: u.assigned_to || null,
        }));
        setUsers(mapped);
      })
      .catch((err) => console.error("Error al traer usuarios:", err));
  };

  const handleSaveUser = async (userData, isNew = false) => {
    try {
      const payload = { ...userData };
      payload.assigned_to_id = payload.assigned_to ?? null;
      delete payload.assigned_to;

      if (isNew) await api.post("/users/", payload);
      else if (userToEdit) await api.put(`/users/${userToEdit.id}/`, payload);

      fetchUsers();
      setEditModalOpen(false);
      setUserToEdit(null);
      setNewModalOpen(false);
      setNewEmployeeModalOpen(false);
      setEmployeeParent(null);
    } catch {
      alert("Error al guardar usuario");
    }
  };

  const handleDeleteUser = () => {
    api
      .delete(`/users/${userToDelete}/`)
      .then(() => fetchUsers())
      .catch(() => alert("Error al eliminar"));
    setConfirmOpen(false);
    setUserToDelete(null);
  };

  const filteredUsers = users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status) {
      if (filters.status === "activo" && !user.is_active) return false;
      if (filters.status === "inactivo" && user.is_active) return false;
    }
    if (filters.assignedTo) {
      if (user.assigned_to !== parseInt(filters.assignedTo)) return false;
    }
    return true;
  });

  const getAssignedEmployees = (adminId) =>
    users.filter((u) => u.assigned_to === adminId);

  const getAssignedToName = (assignedId) => {
    if (!assignedId) return "Sin asignar";
    const user = users.find((u) => u.id === assignedId);
    return user ? user.username : "Desconocido";
  };

  const roleColor = (role) => {
    switch (role.toLowerCase()) {
      case "admin_general":
        return "bg-orange-200 text-orange-900";
      case "admin":
        return "bg-yellow-200 text-yellow-900";
      case "empleado":
        return "bg-blue-200 text-blue-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-6">

      {/* HEADER */}
      <div className="bg-orange-100/60 rounded-3xl p-6 shadow-lg border border-orange-300 mb-6">
        <h1 className="text-3xl font-bold text-orange-900">Administración General</h1>
        <p className="text-sm text-orange-800 mt-1">Control completo de usuarios del sistema</p>

        {/* FILTROS */}
        <div className="flex flex-wrap gap-3 mt-6 items-center">
          <select
            className="bg-white text-orange-900 border border-orange-300 text-sm rounded-lg px-3 py-2 focus:outline-none"
            value={filters.role}
            onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value="">Todos los roles</option>
            {[...new Set(users.map((u) => u.role))].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            className="bg-white text-orange-900 border border-orange-300 text-sm rounded-lg px-3 py-2 focus:outline-none"
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>

          <select
            className="bg-white text-orange-900 border border-orange-300 text-sm rounded-lg px-3 py-2 focus:outline-none"
            value={filters.assignedTo}
            onChange={(e) => setFilters((prev) => ({ ...prev, assignedTo: e.target.value }))}
          >
            <option value="">Todos los asignados</option>
            {users
              .filter((u) => u.role.toLowerCase() === "admin")
              .map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
          </select>

          <button
            onClick={() => setNewModalOpen(true)}
            className="ml-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition"
          >
            + Crear Usuario
          </button>
        </div>
      </div>

      {/* LISTA DE CARDS */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 cursor-pointer border border-orange-200 transition-all hover:scale-[1.01]"
            onClick={() => { setUserDetails(user); setUserDetailsModalOpen(true); }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-6 sm:gap-4 flex-1 items-center">
              <div className="font-medium text-orange-900 truncate">{user.username}</div>
              <div className="text-sm text-orange-700 truncate">{user.email || "-"}</div>
              <div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${roleColor(user.role)}`}>{user.role}</span>
              </div>
              <div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${user.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                  {user.is_active ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="text-sm text-orange-700 truncate">Asignado a: {getAssignedToName(user.assigned_to)}</div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={(e) => { e.stopPropagation(); setUserToEdit(user); setEditModalOpen(true); }}
                  className="px-3 py-1 text-xs rounded-md bg-orange-500 text-white hover:bg-orange-600 transition"
                >
                  Editar
                </button>

                {user.role.toLowerCase() === "admin" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setEmployeeParent(user); setNewEmployeeModalOpen(true); }}
                    className="px-3 py-1 text-xs rounded-md bg-blue-200 text-blue-900 hover:bg-blue-300 transition"
                  >
                    + Empleado
                  </button>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); setUserToDelete(user.id); setConfirmOpen(true); }}
                  className="px-3 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DETALLES DEL ADMIN */}
      {userDetailsModalOpen && userDetails && userDetails.role.toLowerCase().includes("admin") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-orange-50 rounded-3xl shadow-2xl w-96 p-6 relative animate-fadeIn border border-orange-200">
            <button
              className="absolute top-3 right-3 text-orange-900 hover:text-orange-700 text-2xl font-bold transition"
              onClick={() => setUserDetailsModalOpen(false)}
            >
              ×
            </button>

            <div className="flex flex-col items-center text-center mb-4">
              <div className="bg-yellow-200 text-yellow-900 px-4 py-2 rounded-full font-semibold mb-2">{userDetails.role}</div>
              <h2 className="text-2xl font-bold text-orange-900">{userDetails.username}</h2>
              <p className="text-sm text-orange-700">{userDetails.email}</p>
              <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold ${userDetails.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                {userDetails.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-orange-900 mb-2">Empleados asignados</h3>
              {getAssignedEmployees(userDetails.id).length === 0 ? (
                <p className="text-orange-500 text-sm">No hay empleados asignados</p>
              ) : (
                <ul className="list-disc list-inside text-sm text-orange-800 max-h-48 overflow-y-auto space-y-1">
                  {getAssignedEmployees(userDetails.id).map(emp => (
                    <li key={emp.id} className="hover:bg-orange-100 rounded px-2 py-1 transition">{emp.username}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES DEL EMPLEADO */}
      {userDetailsModalOpen && userDetails && userDetails.role.toLowerCase() === "empleado" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-orange-50 rounded-2xl shadow-xl w-80 p-5 relative animate-fadeIn border border-orange-200">
            <button
              className="absolute top-3 right-3 text-orange-900 hover:text-orange-700 text-xl font-bold transition"
              onClick={() => setUserDetailsModalOpen(false)}
            >
              ×
            </button>

            <div className="flex flex-col items-center text-center mb-3">
              <div className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full font-semibold mb-2">{userDetails.role}</div>
              <h2 className="text-xl font-bold text-orange-900">{userDetails.username}</h2>
              <p className="text-sm text-orange-700">{userDetails.email}</p>
              <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold ${userDetails.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                {userDetails.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="mt-3">
              <h3 className="font-semibold text-orange-900 mb-1">Administrador asignado</h3>
              <p className="text-orange-700 text-sm">{getAssignedToName(userDetails.assigned_to)}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODALES EXISTENTES */}
      <UserModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setUserToEdit(null); }}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
        users={users}
      />

      <NewUserModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onSave={(data) => handleSaveUser(data, true)}
      />

      <NewUserModal
        open={newEmployeeModalOpen}
        onClose={() => setNewEmployeeModalOpen(false)}
        onSave={(data) => {
          if (employeeParent) data.assigned_to = employeeParent.id;
          handleSaveUser(data, true);
        }}
      />

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteUser}
        message="¿Confirmar eliminación del usuario?"
      />
    </div>
  );
}
