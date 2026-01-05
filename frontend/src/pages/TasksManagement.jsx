import React, { useState, useEffect } from "react"; 
import { FiEdit, FiTrash2, FiClock, FiCalendar, FiUser } from "react-icons/fi";
import api from "../services/api";
import NewTaskModal from "../components/NewTaskModal";
import ConfirmModal from "../components/ConfirmModal";
import TaskDetailModal from "../components/TaskDetailModal";
import EditTaskModal from "../components/EditTaskModal";

export default function TasksManagement() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);

  const [toast, setToast] = useState("");
  const showToast = (message, duration = 2500) => {
    setToast(message);
    setTimeout(() => setToast(""), duration);
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks/");
      setTasks(res.data);
    } catch (err) {
      console.error("Error al traer tareas:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/");
      setUsers(res.data);
    } catch (err) {
      console.error("Error al traer usuarios:", err);
    }
  };

  useEffect(() => {
  
     // carga inicial
      fetchTasks();
      fetchUsers();

      // polling de tareas cada 5 segundos
      const interval = setInterval(() => {
        fetchTasks();
      }, 5000);

      // limpieza
      return () => clearInterval(interval);

  }, []);

 const addTask = async (taskData) => {
  try {
    await api.post("/tasks/", taskData);
    await fetchTasks(); // sincroniza con backend
    showToast("Tarea creada correctamente");
  } catch (err) {
    console.error("Error al crear tarea:", err.response?.data || err);
    alert(JSON.stringify(err.response?.data, null, 2));
  }
};

  const deleteTask = async () => {
    try {
      await api.delete(`/tasks/${taskToDelete}/`);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete));
      showToast("Tarea eliminada correctamente");
    } catch (err) {
      console.error("Error al eliminar tarea:", err);
    }
    setConfirmOpen(false);
    setTaskToDelete(null);
  };

  const priorityColor = (priority, border = false) => {
    if (border) {
      switch (priority) {
        case "alta": return "border-red-500";
        case "media": return "border-yellow-500";
        case "baja": return "border-green-500";
        default: return "border-gray-300";
      }
    } else {
      switch (priority) {
        case "alta": return "bg-red-100 text-red-700";
        case "media": return "bg-yellow-100 text-yellow-700";
        case "baja": return "bg-green-100 text-green-700";
        default: return "bg-gray-100 text-gray-700";
      }
    }
  };

  const truncateWords = (text, numWords) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= numWords) return text;
    return words.slice(0, numWords).join(" ") + "...";
  };

  const [filters, setFilters] = useState({
    priority: "",
    status: "",
    assigned_to: "",
  });

  const filteredTasks = tasks.filter((task) => {
    if (filters.priority && task.priority !== filters.priority) return false;
    const isOverdue = new Date(task.due_date) < new Date() && task.status !== "completada";
    if (filters.status) {
      if (filters.status === "vencida" && !isOverdue) return false;
      else if (filters.status !== "vencida" && task.status !== filters.status) return false;
    }
    if (filters.assigned_to && task.assigned_to?.id.toString() !== filters.assigned_to) return false;
    return true;
  });

  return (
    <div className="bg-orange-50 min-h-screen p-4">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-orange-100 shadow-sm rounded-b-2xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between p-4 gap-3">
          <h1 className="text-2xl font-bold text-gray-800 flex-1">Gestión de Tareas</h1>
          <div className="flex gap-2 flex-wrap w-full md:w-auto">
            <select
              className="flex-1 min-w-[120px] border border-gray-300 rounded-2xl px-3 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-400 transition"
              value={filters.priority}
              onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
            >
              <option value="">Todas prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            <select
              className="flex-1 min-w-[120px] border border-gray-300 rounded-2xl px-3 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-400 transition"
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Todos estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
              <option value="vencida">Vencida</option>
            </select>
            <select
              className="flex-1 min-w-[120px] border border-gray-300 rounded-2xl px-3 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-400 transition"
              value={filters.assigned_to}
              onChange={(e) => setFilters((prev) => ({ ...prev, assigned_to: e.target.value }))}
            >
              <option value="">Todos usuarios</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
            <button
              onClick={() => setOpenModal(true)}
              className="flex-1 min-w-[120px] bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition shadow-sm"
            >
              Nueva Tarea
            </button>
          </div>
        </div>

        <div
          className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_0.7fr]
                     bg-orange-100 text-gray-700 text-sm font-semibold
                     px-3 py-2 border-t border-orange-300"
        >
          <div>Título</div>
          <div>Prioridad</div>
          <div>Inicio</div>
          <div>Vencimiento</div>
          <div>Estado</div>
          <div>Asignado</div>
          <div className="text-left">Acciones</div>
        </div>
      </div>

      {/* LISTADO */}
      <div className="space-y-2 pb-8 mt-2">
        {filteredTasks.length === 0 && (
          <p className="text-center text-gray-500">No hay tareas cargadas.</p>
        )}

        {filteredTasks.map((task) => {
          const isOverdue = new Date(task.due_date) < new Date() && task.status !== "completada";

          return (
            <div
              key={task.id}
              className={`shadow-md rounded-xl px-4 py-3
                grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_0.7fr]
                items-center hover:shadow-xl transition cursor-pointer
                border-l-4 ${priorityColor(task.priority, true)} 
                ${isOverdue ? "bg-rose-200" : "bg-white"}`}
              onClick={() => {
                setSelectedTask(task);
                setDetailOpen(true);
              }}
            >
              <div className="flex flex-col">
                <h2 className="font-semibold text-gray-800 truncate">{task.title}</h2>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                  {truncateWords(task.description, 12)}
                </p>
              </div>

              <div className="flex items-center mt-1">
                <span
                  className={`inline-block rounded-full text-xs font-semibold ${priorityColor(task.priority)}`}
                  style={{ padding: "2px 6px" }}
                >
                  {task.priority}
                </span>
              </div>

              <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <FiClock className="w-4 h-4 text-gray-400" /> {task.start_date}
              </div>

              <div className={`text-sm mt-1 flex items-center gap-1 ${isOverdue ? "text-red-700 font-semibold" : "text-gray-500"}`}>
                <FiCalendar className="w-4 h-4" /> {task.due_date}
              </div>

              <div
                className={`text-sm capitalize mt-1 font-semibold ${
                  task.status === "pendiente" ? "text-yellow-600" :
                  task.status === "en_progreso" ? "text-blue-600" :
                  task.status === "completada" ? "text-green-600" :
                  task.status === "vencida" ? "text-rose-700" : "text-gray-700"
                }`}
              >
                {task.status}
              </div>

              <div className="text-sm mt-1 flex items-center gap-1">
                <FiUser className="w-4 h-4 text-gray-400" /> {task.assigned_to ? task.assigned_to.username : "-"}
              </div>

              <div className="flex justify-end gap-2 mt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTask(task);
                    setEditModalOpen(true);
                  }}
                  className="px-3 py-1 bg-sky-500 text-white text-xs rounded hover:bg-sky-600 transition flex items-center gap-1"
                >
                  <FiEdit /> Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTaskToDelete(task.id);
                    setConfirmOpen(true);
                  }}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition flex items-center gap-1"
                >
                  <FiTrash2 /> Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODALES */}
      <NewTaskModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreate={addTask}
        users={users}
      />

      <TaskDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        task={selectedTask}
        onUpdate={(updatedTask) => {
          setTasks((prev) =>
            prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
          );
          setDetailOpen(false);
          showToast("Cambios guardados correctamente");
        }}
        showToast={showToast}
      />

      <EditTaskModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        task={selectedTask}
        onSave={() => {
          fetchTasks();
          setEditModalOpen(false);
          showToast("Cambios guardados correctamente");
        }}
      />

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={deleteTask}
        message="¿Seguro que deseas eliminar esta tarea?"
      />

      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-green-500/90 text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm animate-toastFade">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
