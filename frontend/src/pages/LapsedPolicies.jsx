import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value || Number.isNaN(new Date(value).getTime())) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const name = (policy) => policy?.name || "Unknown Customer";
const policyNo = (policy) => policy?.policyNumber || "—";
const frequency = (policy) =>
  policy?.paymentFrequency || policy?.frequency || policy?.mode || "—";
const paymentType = (policy) => policy?.paymentType || "Offline";
const paymentStatus = (policy) => policy?.paymentStatus || "Pending";
const policyStatus = (policy) =>
  policy?.policyStatus || policy?.status || "Lapsed";

const premium = (policy) =>
  Number(
    policy?.installmentPremium ??
      policy?.instPrem ??
      policy?.premiumAmount ??
      0
  );

const totalDue = (policy) =>
  Number(
    policy?.totalDueAmount ??
      policy?.totalDue ??
      policy?.outstandingAmount ??
      0
  );

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

function Box({ label, value }) {
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

/* -------------------- DETAILS MODAL -------------------- */

function DetailsModal({ customer, onClose }) {
  if (!customer) return null;

  const fields = [
    ["Policy Number", policyNo(customer)],
    ["Policy Name", customer.policyName || "—"],
    ["Date of Birth", formatDate(customer.dob)],
    ["Next Due Date", formatDate(customer.dueDate)],
    ["Policy Status", policyStatus(customer)],
    ["Installment Premium", money(premium(customer))],
    ["Total Due", money(totalDue(customer))],
    ["Payment Frequency", frequency(customer)],
    ["Payment Type", paymentType(customer)],
    ["Payment Status", paymentStatus(customer)],
    ["Missed Payments", customer.missedPaymentPeriods ?? "—"],
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lapsed-customer-details-title"
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-slate-50 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="bg-gradient-to-r from-blue-950 via-blue-800 to-indigo-700 p-5 text-white sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold">
                {name(customer)
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-blue-100">
                  Customer &amp; Policy Details
                </p>

                <h2
                  id="lapsed-customer-details-title"
                  className="mt-1 break-words text-xl font-bold sm:text-2xl"
                >
                  {name(customer)}
                </h2>

                <p className="mt-1 break-all text-sm text-blue-100">
                  Policy No: {policyNo(customer)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-xl bg-white/10 p-2 hover:bg-white/20"
            >
              <Icon>
                <path d="m18 6-12 12M6 6l12 12" />
              </Icon>
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-rose-400/20 px-3 py-1 text-xs font-semibold text-rose-100">
              Policy: {policyStatus(customer)}
            </span>

            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-100">
              Payment: {paymentStatus(customer)}
            </span>
          </div>
        </header>

        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-7">
          <h3 className="mb-3 font-bold text-slate-900">
            Policy Information
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map(([label, value]) => (
              <Box key={label} label={label} value={value} />
            ))}
          </div>
        </div>

        <footer className="flex justify-end border-t border-slate-200 bg-white p-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

/* -------------------- MAIN COMPONENT -------------------- */

export default function LapsedPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingPolicyId, setUpdatingPolicyId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/customers");

      const customerPolicies = Array.isArray(data)
        ? data
        : data?.customers || [];

      // Filter lapsed policies and sort customer names alphabetically (A-Z).
      const lapsedPolicies = customerPolicies
        .filter(
          (policy) => policyStatus(policy).toLowerCase() === "lapsed"
        )
        .sort((a, b) =>
          name(a).localeCompare(name(b), undefined, {
            sensitivity: "base",
          })
        );

      setPolicies(lapsedPolicies);
    } catch (err) {
      console.error("Lapsed policies error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load lapsed policies."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleMarkAsActive = async (policy) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark policy ${policyNo(policy)} as Active?`
    );

    if (!confirmed) return;

    try {
      setUpdatingPolicyId(policy._id);
      setError("");
      setSuccessMessage("");

      await api.put(`/customers/${policy._id}`, {
        policyStatus: "Active",
      });

      setPolicies((previous) =>
        previous.filter((item) => item._id !== policy._id)
      );

      setSelected((previous) =>
        previous?._id === policy._id
          ? { ...previous, policyStatus: "Active" }
          : previous
      );

      setSuccessMessage(
        `Policy ${policyNo(policy)} has been marked as Active.`
      );
    } catch (err) {
      console.error("Mark policy as active error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update policy status. Please try again."
      );
    } finally {
      setUpdatingPolicyId(null);
    }
  };

  const totalPremium = useMemo(
    () => policies.reduce((sum, policy) => sum + premium(policy), 0),
    [policies]
  );

  const totalOutstandingDue = useMemo(
    () => policies.reduce((sum, policy) => sum + totalDue(policy), 0),
    [policies]
  );

  const headings = [
    "SL No.",
    "Customer / Policy",
    "Due Date",
    "Inst. Premium",
    "Total Due",
    "Frequency",
    "Payment Type",
    "Payment Status",
    "Policy Status",
    "Action",
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-3 pb-8 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">
              Premium Management
            </p>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Lapsed Policies
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage policies marked as lapsed.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPolicies}
            disabled={loading}
            className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-60 sm:self-auto"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <span>{successMessage}</span>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="font-semibold hover:text-emerald-900"
              aria-label="Dismiss success message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchPolicies}
              className="font-semibold underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Lapsed Policies
            </p>

            <p className="mt-2 text-3xl font-bold text-rose-600">
              {loading ? "..." : policies.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Installment Premium
            </p>

            <p className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
              {loading ? "..." : money(totalPremium)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Due
            </p>

            <p className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
              {loading ? "..." : money(totalOutstandingDue)}
            </p>
          </div>
        </div>

        {/* Lapsed Policy Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:p-5">
            <h2 className="text-lg font-bold text-slate-900">
              Lapsed Policy List
            </h2>

            <p className="text-sm text-slate-500">
              Select a customer name to view policy information.
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Loading lapsed policies...
            </div>
          ) : policies.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Icon>
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </Icon>
              </div>

              <h3 className="font-bold text-slate-800">
                No Lapsed Policies
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                There are no policies currently marked as lapsed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {headings.map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-4 py-4 font-semibold"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {policies.map((policy, index) => {
                    const isUpdating =
                      updatingPolicyId === policy._id;

                    return (
                      <tr
                        key={policy._id}
                        className="transition hover:bg-blue-50/40"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => setSelected(policy)}
                            className="text-left"
                          >
                            <span className="block font-semibold text-blue-700 hover:underline">
                              {name(policy)}
                            </span>

                            <span className="mt-1 block text-xs text-slate-500">
                              Policy No: {policyNo(policy)}
                            </span>
                          </button>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                          {formatDate(policy.dueDate)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-800">
                          {money(premium(policy))}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-rose-600">
                          {money(totalDue(policy))}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {frequency(policy)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              paymentType(policy).toLowerCase() === "online"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {paymentType(policy)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              paymentStatus(policy).toLowerCase() === "paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {paymentStatus(policy)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                            {policyStatus(policy)}
                          </span>
                        </td>

                        {/* Compact Action Button */}
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() => handleMarkAsActive(policy)}
                            disabled={isUpdating}
                            className="inline-flex items-center justify-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm transition-all duration-200 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUpdating ? "Updating..." : "Active"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && policies.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Showing {policies.length} lapsed{" "}
              {policies.length === 1 ? "policy" : "policies"}.
            </div>
          )}
        </div>
      </div>

      {/* Centered Customer Details Popup */}
      {selected && (
        <DetailsModal
          customer={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}