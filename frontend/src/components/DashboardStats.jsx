import React,{ useEffect, useState } from "react";
import api from "../services/api";

export default function DashboardStats({ refreshKey }) {
  const [totalPolicies, setTotalPolicies] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/customers/stats");
        setTotalPolicies(res.data.totalPolicies);
      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };

    fetchStats();
  }, [refreshKey]); // 🔥 ONLY depends on refreshKey

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-blue-600">
        <p className="text-sm text-gray-500">Total Policies</p>
        <h2 className="text-3xl font-bold text-blue-600 mt-2">
          {totalPolicies}
        </h2>
      </div>
    </div>
  );
}
