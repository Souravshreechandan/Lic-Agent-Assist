import React, { useEffect, useState } from "react";
import api from "../services/api";
import EditCustomer from "./EditCustomer";

export default function CustomerTable({
  refreshKey,
  onDeleteSuccess,
}) {
  const [customers, setCustomers] = useState([]);
  const [editCustomer, setEditCustomer] = useState(null);

  /* LOAD CUSTOMERS */
  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers");

      const sortedCustomers = res.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setCustomers(sortedCustomers);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [refreshKey]);

  /* DELETE CUSTOMER */
  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await api.delete(`/customers/${id}`);

      // Instant UI update
      setCustomers((prev) =>
        prev.filter((c) => c._id !== id)
      );

      // Trigger stats refresh
      onDeleteSuccess();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  /* EDIT SUCCESS */
  const handleEditSuccess = async () => {
    setEditCustomer(null);

    // Reload table with updated customer
    await loadCustomers();

    // Refresh dashboard statistics
    onDeleteSuccess();
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="p-3 border">S.No</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Policy No</th>
                <th className="p-3 border">Policy Name</th>
                <th className="p-3 border">Premium</th>
                <th className="p-3 border">Frequency</th>
                <th className="p-3 border">Payment</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((c, i) => (
                <tr
                  key={c._id}
                  className="hover:bg-gray-50 text-center"
                >
                  <td className="p-2 border">
                    {i + 1}
                  </td>

                  <td className="p-2 border uppercase">
                    {c.name}
                  </td>

                  <td className="p-2 border">
                    {c.policyNumber}
                  </td>

                  <td className="p-2 border">
                    {c.policyName}
                  </td>

                  <td className="p-2 border">
                    ₹{c.premiumAmount}
                  </td>

                  <td className="p-2 border">
                    {c.paymentFrequency}
                  </td>

                  <td className="p-2 border">
                    {c.paymentType}
                  </td>

                  <td className="p-2 border space-x-2">

                    {/* EDIT */}
                    <button
                      type="button"
                      onClick={() => setEditCustomer(c)}
                      className="
                        bg-amber-500
                        hover:bg-amber-600
                        text-white
                        text-xs
                        font-medium
                        px-3
                        py-1.5
                        rounded-lg
                        transition
                        duration-200
                        shadow-sm
                        hover:shadow
                      "
                    >
                      Edit
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      onClick={() => deleteCustomer(c._id)}
                      className="
                        bg-red-500
                        hover:bg-red-600
                        text-white
                        text-xs
                        font-medium
                        px-3
                        py-1.5
                        rounded-lg
                        transition
                        duration-200
                        shadow-sm
                        hover:shadow
                      "
                    >
                      Delete
                    </button>

                  </td>
                </tr>
              ))}

              {customers.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="p-4 text-center text-gray-400"
                  >
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT CUSTOMER MODAL */}
      {editCustomer && (
        <EditCustomer
          customer={editCustomer}
          onClose={() => setEditCustomer(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
