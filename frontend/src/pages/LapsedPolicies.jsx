import React, { useEffect, useState } from "react";
import api from "../services/api";

function CalendarIcon() {
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
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatAmount(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "₹0";

  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function LapsedPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingPolicyId, setUpdatingPolicyId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch lapsed policies
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/customers");

      const customerPolicies = Array.isArray(data) ? data : [];

      const lapsedPolicies = customerPolicies
        .filter((policy) => policy.policyStatus === "Lapsed")
        .sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;

          return (
            new Date(a.dueDate).getTime() -
            new Date(b.dueDate).getTime()
          );
        });

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

  // Mark a lapsed policy as active
  const handleMarkAsActive = async (policy) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark policy ${
        policy.policyNumber || ""
      } as Active?`
    );

    if (!confirmed) return;

    try {
      setUpdatingPolicyId(policy._id);
      setError("");
      setSuccessMessage("");

      await api.put(`/customers/${policy._id}`, {
        policyStatus: "Active",
      });

      // Remove the policy from the lapsed list after successful update
      setPolicies((prevPolicies) =>
        prevPolicies.filter((item) => item._id !== policy._id)
      );

      setSuccessMessage(
        `Policy ${policy.policyNumber || ""} has been marked as Active.`
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

  const totalPremium = policies.reduce(
    (sum, policy) => sum + Number(policy.premiumAmount || 0),
    0
  );

  const totalDue = policies.reduce(
    (sum, policy) => sum + Number(policy.totalDueAmount || 0),
    0
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f7fb] pt-[132px] lg:pt-[68px]">
      <main className="mx-auto w-full min-w-0">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-5 sm:px-5 sm:py-6 md:px-7 lg:px-8 xl:px-10">

          {/* Page Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-[#17213f] sm:text-3xl">
                Lapsed Policies
              </h1>

              <p className="mt-1 text-sm text-gray-500 sm:text-base">
                View and manage all policies marked as lapsed
              </p>
            </div>

            <div className="flex w-fit max-w-full items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-red-700">
              <CalendarIcon />
              <span className="text-sm font-medium">
                Lapsed Policies
              </span>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <span>{successMessage}</span>

              <button
                type="button"
                onClick={() => setSuccessMessage("")}
                className="font-semibold text-emerald-700 hover:text-emerald-900"
                aria-label="Dismiss success message"
              >
                ✕
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="font-semibold text-red-700 hover:text-red-900"
                aria-label="Dismiss error message"
              >
                ✕
              </button>
            </div>
          )}

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="min-w-0 rounded-2xl border-l-4 border-red-600 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Lapsed Policies
              </p>

              <h2 className="mt-2 break-words text-3xl font-bold text-red-600">
                {loading ? "..." : policies.length}
              </h2>
            </div>

            <div className="min-w-0 rounded-2xl border-l-4 border-amber-500 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Premium Amount
              </p>

              <h2 className="mt-2 break-words text-2xl font-bold text-amber-600 sm:text-3xl">
                {loading ? "..." : formatAmount(totalPremium)}
              </h2>
            </div>

            <div className="min-w-0 rounded-2xl border-l-4 border-indigo-600 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
              <p className="text-sm text-gray-500">
                Total Due Amount
              </p>

              <h2 className="mt-2 break-words text-2xl font-bold text-indigo-600 sm:text-3xl">
                {loading ? "..." : formatAmount(totalDue)}
              </h2>
            </div>
          </div>

          {/* Lapsed Policy Table */}
          <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
              <h2 className="font-semibold text-[#17213f]">
                Lapsed Policy List
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">
                Loading lapsed policies...
              </div>
            ) : error && policies.length === 0 ? (
              <div className="p-8 text-center text-sm text-red-600">
                {error}
              </div>
            ) : policies.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <CalendarIcon />
                </div>

                <h3 className="font-semibold text-gray-800">
                  No Lapsed Policies
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  There are no policies currently marked as lapsed.
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1350px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-4">
                        SL No.
                      </th>

                      <th className="whitespace-nowrap px-5 py-4">
                        Customer
                      </th>

                      <th className="whitespace-nowrap px-5 py-4">
                        Policy Number
                      </th>

                      <th className="whitespace-nowrap px-5 py-4">
                        Policy Name
                      </th>

                      <th className="whitespace-nowrap px-5 py-4">
                        Due Date
                      </th>

                      <th className="whitespace-nowrap px-5 py-4">
                        Inst. Premium
                      </th>

                      <th className="whitespace-nowrap px-5 py-4">
                        Total Due
                      </th>

                      <th className="whitespace-nowrap px-5 py-4">
                        Frequency
                      </th>

                      <th className="whitespace-nowrap px-5 py-4">
                        Payment Type
                      </th>

                      <th className="whitespace-nowrap px-5 py-4">
                        Payment Status
                      </th>

                      <th className="whitespace-nowrap px-5 py-4">
                        Policy Status
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 text-center">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {policies.map((policy, index) => {
                      const isUpdating =
                        updatingPolicyId === policy._id;

                      return (
                        <tr
                          key={policy._id}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                            {index + 1}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
                            {policy.name || "—"}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                            {policy.policyNumber || "—"}
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {policy.policyName || "—"}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                            {formatDate(policy.dueDate)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
                            {formatAmount(policy.premiumAmount)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-medium text-red-600">
                            {formatAmount(policy.totalDueAmount)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                            {policy.paymentFrequency || "—"}
                          </td>

                          {/* Payment Type */}
                          <td className="whitespace-nowrap px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                policy.paymentType === "Online"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-purple-50 text-purple-700"
                              }`}
                            >
                              {policy.paymentType || "Offline"}
                            </span>
                          </td>

                          {/* Payment Status */}
                          <td className="whitespace-nowrap px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                policy.paymentStatus === "Paid"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {policy.paymentStatus || "Pending"}
                            </span>
                          </td>

                          {/* Policy Status */}
                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                              {policy.policyStatus || "Lapsed"}
                            </span>
                          </td>

                          {/* Mark as Active Button */}
                          <td className="whitespace-nowrap px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleMarkAsActive(policy)}
                              disabled={isUpdating}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdating ? (
                                <>
                                  <svg
                                    className="h-4 w-4 animate-spin"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />

                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                  </svg>

                                  Updating...
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M20 6L9 17l-5-5" />
                                  </svg>

                                  Mark as Active
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}