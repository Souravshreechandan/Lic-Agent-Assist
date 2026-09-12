import React, { useState, useEffect } from "react";
import CustomerTable from "../components/CustomerTable";
import CustomerForm from "../components/CustomerForm";
import DashboardStats from "../components/DashboardStats";
import SearchBar from "../components/SearchBar";

export default function AgentDashboard({
  autoOpenAdd,
  selectedCustomer,
  onCustomerSelect,
}) {
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

  const onDeleteSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-[84px]">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Agent Dashboard
        </h1>

        <button
          type="button"
          onClick={openAdd}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Add Customer
        </button>
      </div>

      <DashboardStats refreshKey={refreshKey} />

      {selectedCustomer && (
        <div className="mb-4">
          <SearchBar
            selectedCustomer={selectedCustomer}
            onCustomerSelect={onCustomerSelect}
            hideSearch
          />
        </div>
      )}

      <CustomerTable
        refreshKey={refreshKey}
        onDeleteSuccess={onDeleteSuccess}
      />

      {openModal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 p-4"
          onClick={() => setOpenModal(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpenModal(false)}
              className="absolute right-3 top-3 text-xl text-gray-500 hover:text-gray-900"
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