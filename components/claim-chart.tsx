"use client"

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ClaimChartProps {
  type: "category" | "consistency"
  data: Record<string, number>
}

const CATEGORY_COLORS = {
  Environmental: "#10B981",
  Academic: "#3B82F6",
  Financial: "#F59E0B",
  Policy: "#8B5CF6",
}

const CONSISTENCY_COLORS = {
  Supported: "#10B981",
  Contradicted: "#EF4444",
  Unverifiable: "#6B7280",
  Unsupported: "#F59E0B",
}

export function ClaimChart({ type, data }: ClaimChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key,
    value,
    color:
      type === "category"
        ? CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS]
        : CONSISTENCY_COLORS[key as keyof typeof CONSISTENCY_COLORS],
  }))

  if (type === "category") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
