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

function isPendingPolicy(policy) {
  return (
    policy.paymentStatus === "Pending" &&
    policy.policyStatus === "Active"
  );
}

export default function UpcomingPremiums() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get("/customers");

        const customerPolicies = Array.isArray(data) ? data : [];

        const pendingPolicies = customerPolicies
          .filter(isPendingPolicy)
          .sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;

            return (
              new Date(a.dueDate).getTime() -
              new Date(b.dueDate).getTime()
            );
          });

        setPolicies(pendingPolicies);
      } catch (err) {
        console.error("Upcoming premiums error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load upcoming premiums."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

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
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-[#17213f] sm:text-3xl">
                Upcoming Premiums
              </h1>

              <p className="mt-1 text-sm text-gray-500 sm:text-base">
                View all active policies with pending payments
              </p>
            </div>

            <div className="flex w-fit max-w-full items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-indigo-700">
              <CalendarIcon />
              <span className="text-sm font-medium">
                Pending Premiums
              </span>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="min-w-0 rounded-2xl border-l-4 border-indigo-600 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Pending Policies
              </p>

              <h2 className="mt-2 break-words text-3xl font-bold text-indigo-600">
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

            <div className="min-w-0 rounded-2xl border-l-4 border-red-600 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
              <p className="text-sm text-gray-500">
                Total Due Amount
              </p>

              <h2 className="mt-2 break-words text-2xl font-bold text-red-600 sm:text-3xl">
                {loading ? "..." : formatAmount(totalDue)}
              </h2>
            </div>
          </div>

          <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
              <h2 className="font-semibold text-[#17213f]">
                Pending Premium List
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">
                Loading pending premiums...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-sm text-red-600">
                {error}
              </div>
            ) : policies.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <CalendarIcon />
                </div>

                <h3 className="font-semibold text-gray-800">
                  No Pending Premiums
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  There are no active policies with pending payments.
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1150px] text-left text-sm">
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
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {policies.map((policy, index) => (
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

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                            {policy.paymentStatus || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
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