import React, { useState, useEffect } from "react";
import CustomerTable from "../components/CustomerTable";
import CustomerForm from "../components/CustomerForm";
import DashboardStats from "../components/DashboardStats";
import SearchBar from "../components/SearchBar";

export default function AgentDashboard({ autoOpenAdd }) {
  const [openModal, setOpenModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const openAdd = () => setOpenModal(true);

  useEffect(() => {
    if (autoOpenAdd) openAdd();
  }, [autoOpenAdd]);

  const onSuccess = () => {
    setOpenModal(false);
    setRefreshKey((k) => k + 1);
  };

  const onDeleteSuccess = () => setRefreshKey((k) => k + 1);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Agent Dashboard</h1>

        <button
          type="button"
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition duration-200 shadow-sm hover:shadow-md active:scale-95"
        >
          Add Customer
        </button>
      </div>

      {/* STATS */}
      <DashboardStats refreshKey={refreshKey} />

      {/* SEARCH */}
      <SearchBar />

      <br />

      {/* TABLE */}
      <CustomerTable
        refreshKey={refreshKey}
        onDeleteSuccess={onDeleteSuccess}
      />

      {/* ADD CUSTOMER MODAL */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setOpenModal(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-xl p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpenModal(false)}
              className="absolute top-3 right-3 text-xl text-gray-500 hover:text-gray-900"
            >
              ✕
            </button>

            <CustomerForm onSuccess={onSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}