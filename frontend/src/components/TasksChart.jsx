import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import api from "../services/api";

export default function TasksGroupedBarChart() {
  const [data, setData] = useState([]);

  const COLORS = {
    alta: "#ff7f50",  // naranja suave
    media: "#facc15", // amarillo
    baja: "#34d399",  // verde
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/tasks/");
        const monthCounts = {};

        res.data.forEach((t) => {
          const date = new Date(t.due_date);
          const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`;

          if (!monthCounts[monthKey]) monthCounts[monthKey] = { alta: 0, media: 0, baja: 0 };
          monthCounts[monthKey][t.priority] += 1;
        });

        // Filtrar solo meses con al menos una tarea
        const filteredKeys = Object.keys(monthCounts).filter(
          (key) => monthCounts[key].alta + monthCounts[key].media + monthCounts[key].baja > 0
        );

        const sortedData = filteredKeys
          .sort((a, b) => new Date(a + "-01") - new Date(b + "-01"))
          .map((key) => {
            const [year, month] = key.split("-");
            const monthName = new Date(year, month - 1).toLocaleString("es-ES", { month: "short" });
            return { name: monthName, ...monthCounts[key] };
          });

        setData(sortedData);
      } catch (err) {
        console.error("Error al traer tareas:", err);
      }
    };

    fetchTasks();
  }, []);

  if (!data.length) return <p className="text-gray-500 text-center">Cargando gráfico...</p>;

  return (
    <div className="w-full bg-white shadow-lg rounded-3xl p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Tareas por Prioridad y Mes
      </h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fill: "#4b5563", fontSize: 13, fontWeight: 500 }} />
            <YAxis tick={{ fill: "#4b5563", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                padding: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value, name) => [
                value,
                `Prioridad: ${name.charAt(0).toUpperCase() + name.slice(1)}`,
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 13 }}
              formatter={(value) => (
                <span style={{ color: "#4b5563", fontWeight: 500 }}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
              )}
            />
            <Bar dataKey="alta" fill={COLORS.alta} radius={[6, 6, 0, 0]} />
            <Bar dataKey="media" fill={COLORS.media} radius={[6, 6, 0, 0]} />
            <Bar dataKey="baja" fill={COLORS.baja} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
