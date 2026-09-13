
import React, { useEffect, useState } from "react";
import api from "../services/api";
import SearchBar from "../components/SearchBar";

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0M16 4.5a4 4 0 0 1 0 7.5M19 14a5 5 0 0 1 3 4.5" />
    </svg>
  );
}

function DueIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h12v18H6z" />
      <path d="M9 7h6M9 11h6M9 15h4" />
    </svg>
  );
}

export default function Home({
  setPage,
  selectedCustomer,
  onCustomerSelect,
}) {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalPolicies: 0,
    activePolicies: 0,
    lapsedPolicies: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/customers/stats");

        setStats({
          totalCustomers: data.totalCustomers || 0,
          totalPolicies: data.totalPolicies || 0,
          activePolicies: data.activePolicies || 0,
          lapsedPolicies: data.lapsedPolicies || 0,
        });
      } catch (error) {
        console.error("Dashboard stats error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const cards = [
    ["Total Customers", stats.totalCustomers, "blue"],
    ["Total Policies", stats.totalPolicies, "indigo"],
    ["Active Policies", stats.activePolicies, "green"],
    ["Lapsed Policies", stats.lapsedPolicies, "red"],
  ];

  const colors = {
    blue: "border-blue-600 text-blue-600",
    indigo: "border-indigo-600 text-indigo-600",
    green: "border-green-600 text-green-600",
    red: "border-red-600 text-red-600",
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] pt-[132px] lg:pt-[68px]">
      <main className="pl-0 lg:pl-[210px]">
        <div className="px-4 py-5 sm:px-5 sm:py-6 lg:px-7">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#17213f]">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your LIC customers and policies
            </p>
          </div>

          {selectedCustomer && (
            <div className="mb-6">
              <SearchBar
                selectedCustomer={selectedCustomer}
                onCustomerSelect={onCustomerSelect}
                hideSearch
              />
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {cards.map(([title, value, color]) => (
              <div
                key={title}
                className={`rounded-2xl border-l-4 bg-white p-5 shadow-md ${colors[color]}`}
              >
                <p className="text-sm text-gray-500">
                  {title}
                </p>

                <h2
                  className={`mt-2 text-3xl font-bold ${
                    colors[color].split(" ")[1]
                  }`}
                >
                  {loading ? "..." : value}
                </h2>
              </div>
            ))}

          </div>

          <div className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-[#17213f]">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <button
                type="button"
                onClick={() => setPage("addCustomer")}
                className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <PlusIcon />
                </div>

                <h3 className="font-semibold text-gray-900">
                  Add New Customer
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Register a new LIC policy customer
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPage("dashboard")}
                className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UsersIcon />
                </div>

                <h3 className="font-semibold text-gray-900">
                  View All Customers
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  View and manage all customers
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPage("dashboard")}
                className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-orange-200 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <DueIcon />
                </div>

                <h3 className="font-semibold text-gray-900">
                  View Policies
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  View and manage all LIC policies
                </p>
              </button>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
