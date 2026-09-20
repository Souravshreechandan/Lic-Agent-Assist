import React, { useEffect, useState } from "react";
import api from "../services/api";
import EditCustomer from "./EditCustomer";

export default function CustomerTable({
  refreshKey,
  onDeleteSuccess,
  policyFilter,
}) {
  const [customers, setCustomers] = useState([]);
  const [editCustomer, setEditCustomer] = useState(null);

  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers");

      const filteredCustomers = policyFilter
        ? res.data.filter(
            (customer) => customer.policyStatus === policyFilter
          )
        : res.data;

      const sortedCustomers = filteredCustomers.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setCustomers(sortedCustomers);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [refreshKey, policyFilter]);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await api.delete(`/customers/${id}`);

      setCustomers((prev) => prev.filter((c) => c._id !== id));

      onDeleteSuccess();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const handleEditSuccess = async () => {
    setEditCustomer(null);
    await loadCustomers();
    onDeleteSuccess();
  };

  return (
    <>
      <div className="rounded-xl bg-white p-4 shadow">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="border p-3">S.No</th>
                <th className="border p-3">Name</th>
                <th className="border p-3">Policy No</th>
                <th className="border p-3">Policy Name</th>
                <th className="border p-3">Premium</th>
                <th className="border p-3">Frequency</th>
                <th className="border p-3">Payment Type</th>
                <th className="border p-3">Payment Status</th>
                <th className="border p-3">Due Date</th>
                <th className="border p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((c, i) => (
                <tr
                  key={c._id}
                  className="text-center hover:bg-gray-50"
                >
                  <td className="border p-2">{i + 1}</td>

                  <td className="border p-2 uppercase">{c.name}</td>

                  <td className="border p-2">{c.policyNumber}</td>

                  <td className="border p-2">{c.policyName}</td>

                  <td className="border p-2">
                    ₹{Number(c.premiumAmount || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="border p-2">{c.paymentFrequency}</td>

                  <td className="border p-2">{c.paymentType}</td>

                  <td className="border p-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        c.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {c.paymentStatus || "Pending"}
                    </span>
                  </td>

                  <td className="border p-2">{formatDate(c.dueDate)}</td>

                  <td className="space-x-2 border p-2">
                    <button
                      type="button"
                      onClick={() => setEditCustomer(c)}
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition duration-200 hover:bg-amber-600 hover:shadow"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteCustomer(c._id)}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition duration-200 hover:bg-red-600 hover:shadow"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {customers.length === 0 && (
                <tr>
                  <td
                    colSpan="10"
                    className="p-4 text-center text-gray-400"
                  >
                    {policyFilter === "Lapsed"
                      ? "No lapsed policies found"
                      : "No customers found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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