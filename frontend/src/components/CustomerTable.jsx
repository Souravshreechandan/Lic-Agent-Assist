import React, { useEffect, useState } from "react";
import api from "../services/api";
import EditCustomer from "./EditCustomer";

/* -------------------- HELPERS -------------------- */

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

const formatMoney = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const getPolicyStatusClass = (status) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700";
    case "Lapsed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

/* -------------------- ICON -------------------- */

function Icon({ children, className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* -------------------- DETAILS BOX -------------------- */

function DetailsBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="break-words text-sm font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

/* -------------------- CUSTOMER DETAILS POPUP -------------------- */

function CustomerDetailsModal({
  customer,
  onClose,
  onEdit,
  onDelete,
  deleting,
}) {
  if (!customer) return null;

  const fields = [
    ["Policy Number", customer.policyNumber],
    ["Policy Name", customer.policyName],
    ["Date of Birth", formatDate(customer.dob)],
    ["Due Date", formatDate(customer.dueDate)],
    ["Installment Premium", formatMoney(customer.premiumAmount)],
    ["Payment Frequency", customer.paymentFrequency],
    ["Payment Type", customer.paymentType],
    ["Payment Status", customer.paymentStatus || "Pending"],
    ["Policy Status", customer.policyStatus || "Not Set"],
    ["Missed Payments", customer.missedPaymentPeriods ?? "—"],
  ];

  const initials = (customer.name || "C")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const handleDelete = () => {
    onDelete(customer);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-details-title"
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-slate-50 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Modal Header */}
        <header className="bg-gradient-to-r from-blue-950 via-blue-800 to-indigo-700 p-5 text-white sm:p-7">
          <div className="flex items-start justify-between gap-4">
            {/* Customer Information */}
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-blue-100">
                  Customer &amp; Policy Details
                </p>

                <h2
                  id="customer-details-title"
                  className="mt-1 break-words text-xl font-bold sm:text-2xl"
                >
                  {customer.name || "Unknown Customer"}
                </h2>

                <p className="mt-1 break-all text-sm text-blue-100">
                  Policy No: {customer.policyNumber || "—"}
                </p>
              </div>
            </div>

            {/* Top-right Actions */}
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {/* Edit Button */}
              <button
                type="button"
                onClick={() => onEdit(customer)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600 sm:px-4 sm:text-sm"
              >
                <Icon className="h-4 w-4">
                  <path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
                </Icon>
                Edit
              </button>

              {/* Delete Button */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                <Icon className="h-4 w-4">
                  <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6" />
                </Icon>
                {deleting ? "Deleting..." : "Delete"}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
              >
                <Icon>
                  <path d="m18 6-12 12M6 6l12 12" />
                </Icon>
              </button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                customer.policyStatus === "Active"
                  ? "bg-emerald-400/20 text-emerald-100"
                  : customer.policyStatus === "Lapsed"
                  ? "bg-rose-400/20 text-rose-100"
                  : "bg-white/15 text-white"
              }`}
            >
              Policy: {customer.policyStatus || "Not Set"}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                customer.paymentStatus === "Paid"
                  ? "bg-emerald-400/20 text-emerald-100"
                  : "bg-amber-400/20 text-amber-100"
              }`}
            >
              Payment: {customer.paymentStatus || "Pending"}
            </span>
          </div>
        </header>

        {/* Modal Content */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-7">
          <h3 className="mb-3 font-bold text-slate-900">
            Policy Information
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map(([label, value]) => (
              <DetailsBox
                key={label}
                label={label}
                value={value}
              />
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <footer className="flex justify-end border-t border-slate-200 bg-white p-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

/* -------------------- MAIN CUSTOMER TABLE -------------------- */

export default function CustomerTable({
  refreshKey,
  onDeleteSuccess,
}) {
  const [customers, setCustomers] = useState([]);
  const [editCustomer, setEditCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /* -------------------- LOAD CUSTOMERS -------------------- */

  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers");

      const customerData = Array.isArray(res.data)
        ? res.data
        : res.data?.customers || [];

      const sortedCustomers = [...customerData].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );

      setCustomers(sortedCustomers);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [refreshKey]);

  /* -------------------- DELETE CUSTOMER -------------------- */

  const deleteCustomer = async (customer) => {
    if (!customer?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        customer.name || "this customer"
      }?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(customer._id);

      await api.delete(`/customers/${customer._id}`);

      setCustomers((prev) =>
        prev.filter((c) => c._id !== customer._id)
      );

      setSelectedCustomer(null);

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  /* -------------------- EDIT SUCCESS -------------------- */

  const handleEditSuccess = async () => {
    setEditCustomer(null);
    setSelectedCustomer(null);

    await loadCustomers();

    if (onDeleteSuccess) {
      onDeleteSuccess();
    }
  };

  /* -------------------- OPEN EDIT FROM POPUP -------------------- */

  const handleEditFromPopup = (customer) => {
    setSelectedCustomer(null);
    setEditCustomer(customer);
  };

  /* -------------------- RENDER -------------------- */

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
                <th className="border p-3">Policy Status</th>
                <th className="border p-3">Due Date</th>
                <th className="border p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((c, i) => (
                <tr
                  key={c._id}
                  className="text-center transition hover:bg-blue-50/40"
                >
                  <td className="border p-2">{i + 1}</td>

                  {/* Clickable Customer Name */}
                  <td className="border p-2 uppercase">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(c)}
                      className="font-semibold text-blue-700 transition hover:text-blue-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    >
                      {c.name || "—"}
                    </button>
                  </td>

                  <td className="border p-2">
                    {c.policyNumber || "—"}
                  </td>

                  <td className="border p-2">
                    {c.policyName || "—"}
                  </td>

                  <td className="border p-2">
                    {formatMoney(c.premiumAmount)}
                  </td>

                  <td className="border p-2">
                    {c.paymentFrequency || "—"}
                  </td>

                  <td className="border p-2">
                    {c.paymentType || "—"}
                  </td>

                  <td className="border p-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        c.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {c.paymentStatus || "Pending"}
                    </span>
                  </td>

                  <td className="border p-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getPolicyStatusClass(
                        c.policyStatus
                      )}`}
                    >
                      {c.policyStatus || "Not Set"}
                    </span>
                  </td>

                  <td className="border p-2">
                    {formatDate(c.dueDate)}
                  </td>

                  {/* Existing Table Actions */}
                  <td className="space-x-2 whitespace-nowrap border p-2">
                    <button
                      type="button"
                      onClick={() => setEditCustomer(c)}
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition duration-200 hover:bg-amber-600 hover:shadow"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteCustomer(c)}
                      disabled={deletingId === c._id}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition duration-200 hover:bg-red-600 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === c._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}

              {customers.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="p-8 text-center text-gray-400"
                  >
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Popup */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onEdit={handleEditFromPopup}
          onDelete={deleteCustomer}
          deleting={deletingId === selectedCustomer._id}
        />
      )}

      {/* Existing Edit Customer Modal */}
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