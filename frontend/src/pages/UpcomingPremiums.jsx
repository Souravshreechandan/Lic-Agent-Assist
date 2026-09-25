import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const PAY_URL =
  "https://www.amazon.in/apay/interstitial/insurance/LICOB?ref_=apay_interstitial_biller_search_to_form_field_insurance";

const money = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const date = (v) =>
  v && !Number.isNaN(new Date(v).getTime())
    ? new Date(v).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const name = (c) => c?.name || "Unknown Customer";
const policyNo = (c) => c?.policyNumber || "—";
const status = (c) => c?.paymentStatus || "Pending";
const policyStatus = (c) => c?.policyStatus || c?.status || "Active";

const frequency = (c) =>
  c?.paymentFrequency || c?.frequency || c?.mode || "—";

const type = (c) => c?.paymentType || "—";

// Read one instalment premium directly from the API record.
const premium = (c) =>
  Number(
    c?.installmentPremium ??
      c?.instPrem ??
      c?.premiumAmount ??
      0
  );

// Read missed-payment count directly from the API record.
const missedCount = (c) =>
  Number(
    c?.missedPaymentPeriods ??
      c?.missedPayments ??
      c?.missedPaymentCount ??
      0
  );

// Read total outstanding amount directly from the API record.
const totalDue = (c) =>
  Number(
    c?.totalDueAmount ??
      c?.totalDue ??
      c?.outstandingAmount ??
      0
  );

const id = (c) => c?._id || c?.id;

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

  const customerName = name(customer);
  const currentPolicyStatus = policyStatus(customer);
  const paymentStatus = status(customer);

  const active = currentPolicyStatus.toLowerCase() === "active";
  const paid = paymentStatus.toLowerCase() === "paid";

  const fields = [
    ["Policy Number", policyNo(customer)],
    ["Policy Name", customer.policyName],
    ["Date of Birth", date(customer.dob)],
    ["Next Due Date", date(customer.dueDate)],
    ["Policy Status", currentPolicyStatus],
    ["Installment Premium", money(premium(customer))],
    ["Total Due", money(totalDue(customer))],
    ["Payment Frequency", frequency(customer)],
    ["Payment Type", type(customer)],
    ["Payment Status", paymentStatus],
    ["Missed Payments", missedCount(customer)],
  ];

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
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-950 via-blue-800 to-indigo-700 p-5 text-white sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold">
                {customerName
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
                  id="customer-details-title"
                  className="mt-1 break-words text-xl font-bold sm:text-2xl"
                >
                  {customerName}
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
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                active
                  ? "bg-emerald-400/20 text-emerald-100"
                  : "bg-rose-400/20 text-rose-100"
              }`}
            >
              Policy: {currentPolicyStatus}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                paid
                  ? "bg-emerald-400/20 text-emerald-100"
                  : "bg-amber-400/20 text-amber-100"
              }`}
            >
              Payment: {paymentStatus}
            </span>
          </div>
        </header>

        {/* Policy Information */}
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

        {/* Footer */}
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

export default function UpcomingPremiums() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("Offline");
  const [updating, setUpdating] = useState(null);

  const loadCustomers = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/customers");

      setCustomers(Array.isArray(data) ? data : data?.customers || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load upcoming payments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter pending active policies, then sort customer names alphabetically.
  const upcoming = useMemo(
    () =>
      customers
        .filter(
          (c) =>
            policyStatus(c).toLowerCase() === "active" &&
            status(c).toLowerCase() !== "paid" &&
            (filter === "Both" ||
              type(c).toLowerCase() === filter.toLowerCase())
        )
        .sort((a, b) =>
          name(a).localeCompare(name(b), undefined, {
            sensitivity: "base",
          })
        ),
    [customers, filter]
  );

  const markPaid = async (customer) => {
    const customerId = id(customer);

    if (!customerId) {
      return alert("Customer ID is missing.");
    }

    if (!window.confirm(`Mark ${name(customer)}'s payment as paid?`)) {
      return;
    }

    try {
      setUpdating(customerId);

      await api.put(`/customers/${customerId}`, {
        paymentStatus: "Paid",
      });

      setCustomers((prev) =>
        prev.map((c) =>
          id(c) === customerId ? { ...c, paymentStatus: "Paid" } : c
        )
      );

      setSelected((prev) =>
        prev && id(prev) === customerId
          ? { ...prev, paymentStatus: "Paid" }
          : prev
      );
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to update payment status."
      );
    } finally {
      setUpdating(null);
    }
  };

  // Summary values are based on the values returned by the API.
  const totalInstallmentPremium = upcoming.reduce(
    (sum, c) => sum + premium(c),
    0
  );

  const totalMissedPayments = upcoming.reduce(
    (sum, c) => sum + missedCount(c),
    0
  );

  const totalOutstandingDue = upcoming.reduce(
    (sum, c) => sum + totalDue(c),
    0
  );

  // Original three summary cards preserved.
  const summary = [
    ["Pending Policies", upcoming.length],
    ["Total Installment Premium", money(totalInstallmentPremium)],
    ["Total Due", money(totalOutstandingDue)],
  ];

  const headings = [
    "SL No.",
    "Customer / Policy",
    "Due Date",
    "Inst. Premium",
    "Total Due",
    "Frequency",
    "Payment Type",
    "Payment Status",
    "Action",
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-3 pb-8 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Heading */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">
              Premium Management
            </p>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Upcoming Payments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track pending premiums and manage customer payments.
            </p>
          </div>

          <button
            onClick={loadCustomers}
            disabled={loading}
            className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-60 sm:self-auto"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p>{error}</p>

            <button
              onClick={loadCustomers}
              className="font-semibold underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summary.map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{label}</p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {value}
              </p>

              {label === "Total Due" && (
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Total missed payments: {totalMissedPayments}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Payments Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pending Premium List
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a customer name to view policy information.
              </p>
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter by payment type"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="Both">Both Payment Types</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Loading upcoming payments...
            </div>
          ) : upcoming.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <h3 className="font-bold text-slate-800">
                No pending payments found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No active policies match the selected payment type.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
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
                  {upcoming.map((c, i) => (
                    <tr
                      key={id(c) || i}
                      className="hover:bg-blue-50/40"
                    >
                      <td className="px-4 py-4 text-sm text-slate-500">
                        {i + 1}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelected(c)}
                          className="text-left"
                        >
                          <span className="block font-semibold text-blue-700 hover:underline">
                            {name(c)}
                          </span>

                          <span className="mt-1 block text-xs text-slate-500">
                            Policy No: {policyNo(c)}
                          </span>
                        </button>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        {date(c.dueDate)}
                      </td>

                      {/* One instalment premium from the API */}
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold">
                        {money(premium(c))}
                      </td>

                      {/* Outstanding total from the API */}
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold">
                        {money(totalDue(c))}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {frequency(c)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {type(c)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            status(c).toLowerCase() === "paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {status(c)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={PAY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                          >
                            Pay
                          </a>

                          <button
                            onClick={() => markPaid(c)}
                            disabled={updating === id(c)}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {updating === id(c)
                              ? "Updating..."
                              : "Mark as Paid"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && upcoming.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Showing {upcoming.length} pending{" "}
              {upcoming.length === 1 ? "policy" : "policies"}.
            </div>
          )}
        </div>
      </div>

      {selected && (
        <DetailsModal
          customer={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}