import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#E53E3E","#F6AD55","#48BB78","#9F7AEA"]; // rojo, naranja, verde, morado

export default function PriorityChart({ data }) {
  const sample = data || [
    { name: "Alta", value: 10 },
    { name: "Media", value: 25 },
    { name: "Baja", value: 15 },
  ];

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Tareas por prioridad</h3>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={sample} dataKey="value" nameKey="name" outerRadius={70} label>
              {sample.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
