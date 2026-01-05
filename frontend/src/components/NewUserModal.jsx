import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";

export default function NewUserModal({ open, onClose, onSave }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("empleado");
  const [isActive, setIsActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Cada vez que se abra el modal, resetea los campos
  useEffect(() => {
    if (open) {
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("empleado");
      setIsActive(true);
      setShowPassword(false);
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    const payload = { 
      username, 
      email: email.toLowerCase(), // <-- Aquí forzamos a minúsculas
      role, 
      is_active: isActive, 
      password 
    };
    onSave(payload);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl w-96 p-6 relative shadow-2xl border border-orange-200 animate-fadeIn">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Nuevo Usuario</h2>
          <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            Nuevo
          </span>
        </div>

        {/* Formulario */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Nombre de usuario */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa nombre de usuario"
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition outline-none shadow-sm"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition outline-none shadow-sm"
            />
          </div>

          {/* Contraseña con ojo */}
          <div className="flex flex-col relative">
            <label className="text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition outline-none shadow-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Rol */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition outline-none bg-white shadow-sm"
            >
              <option value="admin_general">Administrador General</option>
              <option value="admin">Administrador</option>
              <option value="empleado">Empleado</option>
              
            </select>
          </div>

          {/* Estado */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={isActive ? "true" : "false"}
              onChange={(e) => setIsActive(e.target.value === "true")}
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition outline-none bg-white shadow-sm"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          {/* Botón Guardar */}
          <button
            type="submit"
            className="w-full bg-orange-400 text-white px-4 py-2 rounded-2xl hover:bg-orange-500 transition font-semibold shadow-md mt-2"
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}
