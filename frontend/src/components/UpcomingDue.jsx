import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, User, AlertTriangle } from "lucide-react";

export default function UpcomingDue({ tasks, fullHeight = false }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  const priorityStyle = {
    Alta: {
      badge: "bg-red-600 text-white",
      dot: "bg-red-600",
      glow: "shadow-[0_0_15px_rgba(220,38,38,0.5)]",
      text: "text-red-600",
    },
    Media: {
      badge: "bg-yellow-500 text-gray-900",
      dot: "bg-yellow-500",
      glow: "shadow-[0_0_15px_rgba(250,204,21,0.5)]",
      text: "text-yellow-600",
    },
    Baja: {
      badge: "bg-green-500 text-white",
      dot: "bg-green-500",
      glow: "shadow-[0_0_15px_rgba(34,197,94,0.5)]",
      text: "text-green-600",
    },
  };

  const calculateDueInDays = (dueDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const processed = (tasks || [])
      .map((task) => {
        const due_in_days = calculateDueInDays(task.due_date);
        return {
          ...task,
          due_in_days,
          due_in: `${due_in_days} ${due_in_days === 1 ? "día" : "días"}`,
        };
      })
      .filter((task) => task.due_in_days >= 0 && task.due_in_days <= 7)
      .sort((a, b) => a.due_in_days - b.due_in_days);

    setUpcomingTasks(processed);
  }, [tasks]);

  const getAssigneeName = (task) => {
    if (!task) return "Sin asignar";
    if (typeof task.assignee === "string") return task.assignee;
    if (task.assignee?.username) return task.assignee.username;
    if (task.assigned_to?.username) return task.assigned_to.username;
    return "Sin asignar";
  };

  const StickyHeader = () => (
    <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Calendar size={18} />
        Próximos vencimientos
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        Tareas que vencen en los próximos 7 días
      </p>
    </div>
  );

  const ScrollableTasks = () => (
    <ul className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "300px" }}>
      {upcomingTasks.map((t, index) => (
        <motion.li
          key={t.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
          whileHover={{
            scale: 1.03,
            boxShadow: `0 8px 25px rgba(0,0,0,0.15), ${priorityStyle[t.priority]?.glow}`,
          }}
          onClick={() => setSelectedTask(t)}
          className={`cursor-pointer rounded-2xl p-4 bg-gradient-to-r from-white via-gray-50 to-white border border-gray-200 hover:border-gray-300 transition-transform duration-300`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${priorityStyle[t.priority]?.dot}`} />
              <div>
                <p className="font-semibold text-gray-900">{t.title}</p>
                <p className={`text-xs flex items-center gap-1 mt-1 ${priorityStyle[t.priority]?.text}`}>
                  <User size={12} />
                  {getAssigneeName(t)}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs px-2 py-1 rounded-full ${priorityStyle[t.priority]?.badge}`}>
                {t.priority}
              </span>
              <span className={`text-xs font-medium ${t.due_in_days <= 1 ? "text-red-600" : priorityStyle[t.priority]?.text}`}>
                {t.due_in}
              </span>
            </div>
          </div>
        </motion.li>
      ))}
    </ul>
  );

  if (!upcomingTasks.length) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
        No hay tareas próximas a vencer
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-3xl shadow-xl ${fullHeight ? "h-full flex flex-col" : "w-full"} flex flex-col`}>
        <StickyHeader />
        <ScrollableTasks />
      </div>

      <AnimatePresence>
  {selectedTask && (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setSelectedTask(null)}
    >
      <motion.div
        className="bg-gradient-to-br from-orange-50 via-orange-100 to-white w-[640px] max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-6 border border-orange-200"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-semibold text-orange-800">{selectedTask.title}</h2>
          {selectedTask.due_in_days <= 1 && (
            <span className="flex items-center gap-1 text-orange-600 font-semibold text-sm">
              <AlertTriangle size={16} /> Urgente
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
          <div>
            <strong>Prioridad:</strong> {selectedTask.priority}
          </div>
          <div>
            <strong>Vence en:</strong> {selectedTask.due_in}
          </div>
          <div>
            <strong>Asignado a:</strong> {getAssigneeName(selectedTask)}
          </div>
          <div>
            <strong>Fecha límite:</strong>{" "}
            {new Date(selectedTask.due_date).toLocaleDateString("es-AR")}
          </div>
        </div>

        <button
          className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-xl font-semibold shadow-lg transition"
          onClick={() => setSelectedTask(null)}
        >
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </>
  );
}
