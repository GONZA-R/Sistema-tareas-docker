import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function NewTaskModal({ open, onClose, onCreate, users }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media");
  const [status, setStatus] = useState("pendiente");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedToId, setAssignedToId] = useState("");

  // 👉 fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setPriority("media");
      setStatus("pendiente");
      setStartDate("");
      setDueDate("");
      setAssignedToId("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      title,
      description,
      priority,
      status,
      start_date: startDate,
      due_date: dueDate || null,
      assigned_to_id: assignedToId ? Number(assignedToId) : null,
    };

    onCreate(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl overflow-auto flex flex-col border border-orange-200 animate-fadeIn">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-orange-50">
          <h2 className="text-xl font-bold text-gray-800">Nueva Tarea</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* TÍTULO */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none shadow-sm"
              required
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none shadow-sm"
              required
            />
          </div>

          {/* PRIORIDAD / ESTADO */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none shadow-sm bg-white"
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none shadow-sm bg-white"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          </div>

          {/* FECHAS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Inicio *</label>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => {
                  setStartDate(e.target.value);

                  // si el vencimiento queda inválido, se limpia
                  if (dueDate && e.target.value > dueDate) {
                    setDueDate("");
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none shadow-sm"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
              <input
                type="date"
                value={dueDate}
                min={startDate || today}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none shadow-sm"
              />
            </div>
          </div>

          {/* ASIGNADO */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Asignado a</label>
            <select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none shadow-sm bg-white"
            >
              <option value="">Sin asignar</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          {/* BOTONES */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2 rounded-2xl hover:bg-gray-100 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-400 text-white py-2 rounded-2xl hover:bg-orange-500 transition font-semibold shadow-md"
            >
              Crear Tarea
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
