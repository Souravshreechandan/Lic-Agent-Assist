import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function DashboardStats({ refreshKey }) {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalPolicies: 0,
    activePolicies: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/customers/stats");

        setStats({
          totalCustomers: data.totalCustomers || 0,
          totalPolicies: data.totalPolicies || 0,
          activePolicies: data.activePolicies || 0,
        });
      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };

    fetchStats();
  }, [refreshKey]);

  const cards = [
    ["Total Customers", stats.totalCustomers, "blue"],
    ["Total Policies", stats.totalPolicies, "indigo"],
    ["Active Policies", stats.activePolicies, "green"],
  ];

  const colors = {
    blue: "border-blue-600 text-blue-600",
    indigo: "border-indigo-600 text-indigo-600",
    green: "border-green-600 text-green-600",
  };

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(([title, value, color]) => (
        <div
          key={title}
          className={`rounded-2xl border-l-4 bg-white p-5 shadow-md ${colors[color]}`}
        >
          <p className="text-sm text-gray-500">{title}</p>

          <h2
            className={`mt-2 text-3xl font-bold ${
              colors[color].split(" ")[1]
            }`}
          >
            {value}
          </h2>
        </div>
      ))}
    </div>
  );
}