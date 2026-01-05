import React, { useEffect, useState } from "react";
import api from "../services/api";

import DashboardCards from "../components/DashboardCards";
import TasksChart from "../components/TasksChart";
import PriorityBreakdown from "../components/PriorityBreakdown";
import UpcomingDue from "../components/UpcomingDue";
import RecentActivity from "../components/RecentActivity";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get("/tasks/");
        setTasks(data);

        const now = new Date();
        const tasksWithDays = data.map((t) => ({
          ...t,
          due_in_days: Math.ceil((new Date(t.due_date) - now) / (1000 * 60 * 60 * 24)),
        }));

        const upcomingTasks = tasksWithDays
          .filter((t) => t.due_in_days >= 0 && t.due_in_days <= 7)
          .map((t) => ({
            ...t,
            priority: t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
          }))
          .sort((a, b) => a.due_in_days - b.due_in_days);

        setUpcoming(upcomingTasks);

        setStats({
          total: data.length,
          completed: data.filter((t) => t.status === "completada").length,
          overdue: data.filter((t) => new Date(t.due_date) < now && t.status !== "completada").length,
          active: data.filter((t) => new Date(t.due_date) >= now && t.status !== "completada").length,
          upcoming: upcomingTasks.length,
        });
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 space-y-8">

      {/* TARJETAS ESTADÍSTICAS */}
      <DashboardCards stats={stats} />

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">

          {/* GRÁFICO DE TAREAS */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-orange-300
                          shadow-[0_10px_15px_-3px_rgba(251,146,60,0.4),0_4px_6px_-2px_rgba(251,146,60,0.3)]
                          hover:shadow-[0_25px_50px_-12px_rgba(251,146,60,0.4),0_10px_10px_-5px_rgba(251,146,60,0.3)]
                          transition-shadow duration-300">
            <TasksChart />
          </div>

          {/* ACTIVIDAD RECIENTE */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-orange-300 max-h-[420px] overflow-y-auto
                          shadow-[0_10px_15px_-3px_rgba(251,146,60,0.4),0_4px_6px_-2px_rgba(251,146,60,0.3)]
                          hover:shadow-[0_25px_50px_-12px_rgba(251,146,60,0.4),0_10px_10px_-5px_rgba(251,146,60,0.3)]
                          transition-shadow duration-300">
            <RecentActivity />
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">

          {/* TAREAS POR PRIORIDAD */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-orange-300
                          shadow-[0_10px_15px_-3px_rgba(251,146,60,0.4),0_4px_6px_-2px_rgba(251,146,60,0.3)]
                          hover:shadow-[0_25px_50px_-12px_rgba(251,146,60,0.4),0_10px_10px_-5px_rgba(251,146,60,0.3)]
                          transition-shadow duration-300">
            <PriorityBreakdown tasks={tasks} compact />
          </div>

          {/* PRÓXIMOS VENCIMIENTOS */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-orange-300 max-h-[520px] overflow-y-auto
                          shadow-[0_10px_15px_-3px_rgba(251,146,60,0.4),0_4px_6px_-2px_rgba(251,146,60,0.3)]
                          hover:shadow-[0_25px_50px_-12px_rgba(251,146,60,0.4),0_10px_10px_-5px_rgba(251,146,60,0.3)]
                          transition-shadow duration-300">
            <UpcomingDue tasks={upcoming} fullHeight />
          </div>
        </div>
      </div>
    </div>
  );
}
