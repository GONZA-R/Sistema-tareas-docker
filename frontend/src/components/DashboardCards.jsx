import React, { useEffect, useState } from "react";
import { FiList, FiCheckCircle, FiClock, FiTrendingUp, FiAlertTriangle } from "react-icons/fi";
import api from "../services/api";

export default function DashboardCards() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Traer tareas del backend
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await api.get("/tasks/");
        setTasks(res.data);
      } catch (err) {
        console.error("Error al cargar tareas:", err);
      }
    }
    fetchTasks();
  }, []);

  // Calcular estadísticas
  useEffect(() => {
    if (!tasks.length) return;

    const now = new Date();
    const upcomingThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const statsObj = tasks.reduce(
      (acc, t) => {
        const due = new Date(t.due_date);
        acc.total += 1;
        if (t.status === "completada") acc.completed += 1;
        if (t.status !== "completada" && due < now) acc.overdue += 1;
        if ((t.status === "pendiente" || t.status === "en_progreso") && due >= now) acc.active += 1;
        if ((t.status === "pendiente" || t.status === "en_progreso") && due >= now && due <= upcomingThreshold) acc.upcoming += 1;
        return acc;
      },
      { total: 0, active: 0, overdue: 0, upcoming: 0, completed: 0 }
    );

    setStats(statsObj);
    setLoading(false);
  }, [tasks]);

  if (loading || !stats) {
    return <div className="text-gray-600 text-center py-10">Cargando estadísticas...</div>;
  }

  const items = [
    { title: "Total tareas", value: stats.total, icon: <FiList className="w-5 h-5 text-orange-600" /> },
    { title: "Tareas activas", value: stats.active, icon: <FiTrendingUp className="w-5 h-5 text-yellow-600" /> },
    { title: "Tareas vencidas", value: stats.overdue, icon: <FiAlertTriangle className="w-5 h-5 text-red-600" /> },
    { title: "Próximos venc.", value: stats.upcoming, icon: <FiClock className="w-5 h-5 text-blue-600" /> },
    { title: "Completadas", value: stats.completed, icon: <FiCheckCircle className="w-5 h-5 text-green-600" /> },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
      {items.map((it) => (
        <div
          key={it.title}
          className="flex items-center gap-3 p-3 rounded-xl shadow-md border border-orange-200
                     bg-gradient-to-br from-yellow-100 to-orange-200
                     hover:scale-105 transition-transform"
        >
          <div>{it.icon}</div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-700">{it.title}</span>
            <span className="text-xl font-bold text-gray-900">{it.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
