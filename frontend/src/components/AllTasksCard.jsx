import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AllTasksCard({ tasks }) {
  const [selectedTask, setSelectedTask] = useState(null);

  const sample = tasks || [
    { id: 1, title: "Configurar router 2", assignee: "Juan", due_in: "2 días", due_date: "2025-02-01T18:00:00", priority: "Alta", comments: [] },
    { id: 2, title: "Actualizar servidor", assignee: "Laura", due_in: "5 días", due_date: "2025-02-03T12:00:00", priority: "Media", comments: [] },
    { id: 3, title: "Revisar backup", assignee: "Marta", due_in: "3 días", due_date: "2025-02-02T12:00:00", priority: "Media", comments: [] },
  ];

  const priorityStyle = {
    Alta: "bg-red-100 text-red-700",
    Media: "bg-yellow-100 text-yellow-700",
    Baja: "bg-green-100 text-green-700"
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 h-full">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Todas las Tareas</h3>

        {sample.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay tareas asignadas.</p>
        ) : (
          <ul className="space-y-2 max-h-72 overflow-y-auto">
            {sample.map((t) => (
              <li
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow cursor-pointer transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                      Asignado a: {t.assignee}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${priorityStyle[t.priority]}`}>
                      {t.priority}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t.due_in}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              className="bg-white w-[600px] max-h-[85vh] overflow-y-auto rounded-xl p-6 shadow-xl border border-gray-200"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">{selectedTask.title}</h2>
              <p><strong>Asignado a:</strong> {selectedTask.assignee}</p>
              <p>
                <strong>Prioridad:</strong>{" "}
                <span className={`px-2 py-1 rounded-full text-sm ${priorityStyle[selectedTask.priority]}`}>
                  {selectedTask.priority}
                </span>
              </p>
              <p><strong>Vence en:</strong> {selectedTask.due_in}</p>
              <p><strong>Fecha de vencimiento:</strong> {new Date(selectedTask.due_date).toLocaleString()}</p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Comentarios</h3>
              <div className="space-y-2">
                {selectedTask.comments?.length > 0 ? (
                  selectedTask.comments.map(c => (
                    <div key={c.id} className="p-2 bg-gray-50 border border-gray-200 rounded">
                      <p className="font-medium">{c.user}</p>
                      <p className="text-sm text-gray-700">{c.text}</p>
                      <p className="text-xs text-gray-500">{c.date}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No hay comentarios.</p>
                )}
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
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
