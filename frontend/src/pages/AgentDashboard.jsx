import { useState } from "react";
import CustomerTable from "../components/CustomerTable";
import CustomerForm from "../components/CustomerForm";
import DashboardStats from "../components/DashboardStats";

export default function AgentDashboard() {
  const [openModal, setOpenModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const openAdd = () => {
    setEditCustomer(null);
    setOpenModal(true);
  };

  const openEdit = (customer) => {
    setEditCustomer(customer);
    setOpenModal(true);
  };

  const onSuccess = () => {
    setOpenModal(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Agent Dashboard</h1>

        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Customer
        </button>
      </div>

      {/* DASHBOARD STATS */}
      <DashboardStats refreshKey={refreshKey} />

      {/* CUSTOMER TABLE */}
      <CustomerTable
        onEdit={openEdit}
        refreshKey={refreshKey}
      />

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
                        bg-black/30 backdrop-blur-sm">
          <div className="bg-white/90 w-full max-w-2xl rounded-xl
                          shadow-lg p-6 relative">

            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-3 right-3 text-xl"
            >
              ✕
            </button>

            <CustomerForm
              editData={editCustomer}
              onSuccess={onSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
