import { useEffect, useState } from "react";
import api from "../services/api";

export default function CustomerTable({
  onEdit,
  refreshKey,
  onDeleteSuccess
}) {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.get("/customers").then((res) => {
      setCustomers(res.data);
    });
  }, [refreshKey]);

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    await api.delete(`/customers/${id}`);
    onDeleteSuccess();
  };

  return (
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
                <td className="p-2 border">{i + 1}</td>
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.policyNumber}</td>
                <td className="p-2 border">{c.policyName}</td>
                <td className="p-2 border font-medium">
                  ₹{c.premiumAmount}
                </td>
                <td className="p-2 border">{c.paymentFrequency}</td>
                <td className="p-2 border">{c.paymentType}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => onEdit(c)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCustomer(c._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
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
  );
}
