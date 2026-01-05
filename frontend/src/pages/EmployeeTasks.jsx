import React, { useState, useEffect } from "react";
import TaskModal from "../components/TaskModal";
import api from "../services/api";

// Calcula días restantes para vencimiento
const daysLeft = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatDate = (d) => {
  if (!d) return "Sin fecha";
  try {
    return new Date(d).toLocaleDateString("es-AR");
  } catch {
    return d;
  }
};

const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

const EmployeeTaskList = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) throw new Error("No se encontró token");

        const response = await api.get("/tasks/");

        const tasksFromBackend = response.data.map((t) => ({
          ...t,
          due_date: t.due_date,
          created_by: t.created_by,
          assigned_to: t.assigned_to,
          attachments: t.attachments || [],
          comments: t.comments || [],
        }));

        // Ordenar por fecha de creación (más recientes primero)
        tasksFromBackend.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setTasks(tasksFromBackend);
      } catch (error) {
        console.error("Error al traer tareas:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const updateTask = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    closeModal();
  };

  const formatStatus = (status) => {
    if (!status) return "";
    return status
      .replace("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch =
      statusFilter === "" ||
      task.status === statusFilter ||
      (statusFilter === "vencida" && isOverdue(task.due_date));
    const priorityMatch =
      priorityFilter === "" || task.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  if (loading)
    return (
      <p className="text-orange-700 font-medium p-6 text-center">
        Cargando tareas...
      </p>
    );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-orange-50 via-orange-100 to-orange-50">
      <h2 className="text-3xl font-bold mb-6 text-orange-800 tracking-tight">
        Mis Tareas
      </h2>

      {/* FILTROS MODERNOS */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="relative w-48">
          <select
            className="w-full bg-orange-400 text-white border border-orange-500 rounded-2xl px-4 py-2 shadow-md focus:ring-2 focus:ring-orange-300 hover:bg-orange-500 transition appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completada">Completada</option>
            <option value="vencida">Vencida</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white">
            ▼
          </div>
        </div>

        <div className="relative w-48">
          <select
            className="w-full bg-orange-400 text-white border border-orange-500 rounded-2xl px-4 py-2 shadow-md focus:ring-2 focus:ring-orange-300 hover:bg-orange-500 transition appearance-none"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white">
            ▼
          </div>
        </div>
      </div>

      {/* LISTA DE TAREAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const leftDays = daysLeft(task.due_date);
            const urgent =
              leftDays !== null && leftDays <= 7 && !isOverdue(task.due_date);

            return (
              <div
                key={task.id}
                onClick={() => openModal(task)}
                className="p-5 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition cursor-pointer border-l-4 border-orange-300 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg text-orange-800 truncate">
                    {task.title}
                  </h3>
                  {isOverdue(task.due_date) && (
                    <span className="bg-red-200 text-red-800 text-xs px-3 py-1 rounded-full font-bold">
                      VENCIDA
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {task.description}
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                  <div>
                    Estado:{" "}
                    <span
                      className={`font-semibold ${
                        isOverdue(task.due_date)
                          ? "text-red-600"
                          : task.status === "pendiente"
                          ? "text-orange-500"
                          : task.status === "en_progreso"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {isOverdue(task.due_date)
                        ? "VENCIDA"
                        : formatStatus(task.status)}
                    </span>
                  </div>

                  <div>
                    Prioridad:{" "}
                    <span
                      className={`font-semibold ${
                        task.priority === "alta"
                          ? "text-red-500"
                          : task.priority === "media"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div>
                    Vence: {formatDate(task.due_date)}{" "}
                    {!isOverdue(task.due_date) && leftDays !== null && (
                      <span
                        className={`ml-1 px-2 py-1 text-xs rounded-full font-semibold ${
                          urgent
                            ? "bg-red-200 text-red-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {leftDays} día(s)
                      </span>
                    )}
                  </div>

                  <div>Creado por: {task.created_by?.username || "Desconocido"}</div>
                  <div>Asignado a: {task.assigned_to?.username || "Sin asignar"}</div>

                  {task.attachments && task.attachments.length > 0 && (
                    <div>Archivos: {task.attachments.length}</div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 italic col-span-full text-center">
            No hay tareas disponibles.
          </p>
        )}
      </div>

      {/* MODAL */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        task={selectedTask}
        onUpdate={updateTask}
      />
    </div>
  );
};

export default EmployeeTaskList;
