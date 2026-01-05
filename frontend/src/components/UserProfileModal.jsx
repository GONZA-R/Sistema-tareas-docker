import React from "react";

export default function UserProfileModal({ open, onClose }) {
  if (!open) return null;

  // Tomamos datos del localStorage
  const username = localStorage.getItem("username") || "Usuario";
  const email = localStorage.getItem("email") || "usuario@example.com";
  const role = localStorage.getItem("role") || "N/A";

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-yellow-100 to-orange-200 p-5 w-96 rounded-xl shadow-xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-3 text-gray-900">Mi Perfil</h2>

        <div className="space-y-2 text-sm text-gray-800">
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Rol:</strong> {role}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
