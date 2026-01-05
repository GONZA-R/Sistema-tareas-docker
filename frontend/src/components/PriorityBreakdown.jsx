import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const CONFIG = {
  completed: {
    label: "Completadas",
    color: "#22C55E",
    bg: "bg-green-50",
    text: "text-green-600",
  },
  active: {
    label: "Activas",
    color: "#FB923C",
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  overdue: {
    label: "Vencidas",
    color: "#EF4444",
    bg: "bg-red-50",
    text: "text-red-600",
  },
};

export default function TaskStatusChart({ tasks = [] }) {
  const now = new Date();

  const counts = {
    completed: 0,
    active: 0,
    overdue: 0,
  };

  tasks.forEach((t) => {
    const due = new Date(t.due_date);

    if (t.status === "completada") {
      counts.completed++;
    } else if (due < now) {
      counts.overdue++;
    } else {
      counts.active++;
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      key: k,
      name: CONFIG[k].label,
      value: v,
      color: CONFIG[k].color,
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const { name, value } = payload[0];
    return (
      <div className="bg-white rounded-xl shadow-lg px-4 py-2 text-sm border">
        <p className="font-bold text-gray-800">{name}</p>
        <p className="text-gray-600">
          {value} tareas ({((value / total) * 100).toFixed(0)}%)
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-5">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Estado de tareas
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* DONUT */}
        <div className="relative h-[220px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={5}
                stroke="none"
              >
                {data.map((e) => (
                  <Cell key={e.key} fill={e.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* TOTAL */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-gray-800">
              {total}
            </span>
            <span className="text-sm text-gray-500">
              tareas
            </span>
          </div>
        </div>

        {/* CARDS */}
        <div className="space-y-3">
          {Object.entries(counts).map(([key, value]) => {
            const cfg = CONFIG[key];
            const percent = total ? ((value / total) * 100).toFixed(0) : 0;

            return (
              <div
                key={key}
                className={`flex items-center justify-between p-3 rounded-xl border 
                transition hover:shadow-md ${cfg.bg}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span className={`font-semibold ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>

                <div className="text-sm text-gray-700">
                  <strong>{value}</strong> • {percent}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
