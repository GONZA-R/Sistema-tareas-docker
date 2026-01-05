import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../services/api";

export default function EditTaskModal({ open, onClose, task, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("media");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("pendiente");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (open && task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStartDate(task.start_date ? task.start_date.split("T")[0] : "");
      setDueDate(task.due_date ? task.due_date.split("T")[0] : "");
      setPriority(task.priority || "media");
      setAssignedTo(task.assigned_to ? task.assigned_to.id : "");
      setStatus(task.status || "pendiente");
    }
  }, [open, task]);

  useEffect(() => {
    api.get("/users/").then((res) => setUsers(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      description,
      start_date: startDate,
      due_date: dueDate,
      priority,
      assigned_to: assignedTo || null,
      status,
      delegated_to: task.delegated_to ? task.delegated_to.id : null,
    };

    try {
      await api.put(`/tasks/${task.id}/`, payload);
      onSave();
      onClose();
    } catch (err) {
      console.error("Error al actualizar tarea", err);
      alert("No se pudo actualizar la tarea. Intenta nuevamente.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-3xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-4 sm:p-6 relative shadow-2xl border border-orange-200 animate-fadeIn overflow-y-auto max-h-[90vh]">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center sm:text-left">
          Editar Tarea
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Título */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition outline-none shadow-sm"
              required
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition outline-none shadow-sm"
              rows={4}
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition outline-none shadow-sm"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition outline-none shadow-sm"
                required
              />
            </div>
          </div>

          {/* Prioridad y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition outline-none shadow-sm"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition outline-none shadow-sm"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          </div>

          {/* Asignado a */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Asignado a</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition outline-none shadow-sm"
            >
              <option value="">No asignado</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-400 text-white px-4 py-2 rounded-2xl hover:bg-orange-500 transition font-semibold shadow-md mt-2"
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}
