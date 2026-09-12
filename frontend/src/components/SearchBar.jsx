import React, { useState, useEffect } from "react";
import api from "../services/api";
import EditCustomer from "./EditCustomer";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // SEARCH
  useEffect(() => {
    if (!query.trim() || isSelected) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/customers/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        setSuggestions(res.data);
      } catch (err) {
        if (
          err.name !== "CanceledError" &&
          err.name !== "AbortError" &&
          err.code !== "ERR_CANCELED"
        ) {
          console.error("Search error:", err);
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [query, isSelected]);

  // SELECT CUSTOMER
  const selectCustomer = (customer) => {
    setIsSelected(true);
    setSelectedCustomer(customer);
    setSuggestions([]);
    setQuery(customer.name);
    setCopied("");
    setLoading(false);
  };

  // CLEAR
  const clearSearch = () => {
    setIsSelected(false);
    setQuery("");
    setSuggestions([]);
    setSelectedCustomer(null);
    setCopied("");
    setLoading(false);
  };

  // DOB
  const getFormattedDOB = () =>
    selectedCustomer?.dob
      ? new Date(selectedCustomer.dob).toLocaleDateString("en-GB")
      : "-";

  // DUE DATE
  const getFormattedDueDate = () =>
    selectedCustomer?.dueDate
      ? new Date(selectedCustomer.dueDate).toLocaleDateString("en-GB")
      : "-";

  // COPY
  const handleCopy = async (value, type) => {
    if (!value || value === "-") return;

    try {
      await navigator.clipboard.writeText(value.toString());
      setCopied(type);
      setTimeout(() => setCopied(""), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // PAY NOW
  const handlePayNow = () => {
    window.open(
      "https://www.amazon.in/apay/interstitial/insurance/LICOB?ref_=apay_interstitial_biller_search_to_form_field_insurance",
      "_blank",
      "noopener,noreferrer"
    );
  };

  // TOTAL DUE
  const getTotalDue = () => {
    const amount = Number(selectedCustomer?.totalDueAmount);
    return Number.isFinite(amount) ? amount : 0;
  };

  // EDIT SUCCESS
  const handleEditSuccess = () => {
    setEditCustomer(null);
    clearSearch();
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* SEARCH BOX */}
      <div className="relative">
        <input
          className="w-full border border-gray-400 rounded-full px-4 py-2.5 pr-20 text-sm focus:outline-none focus:border-blue-600 shadow-sm"
          placeholder="Search customer by name..."
          value={query}
          onChange={(e) => {
            setIsSelected(false);
            setQuery(e.target.value);
            setSelectedCustomer(null);
            setCopied("");
          }}
        />

        {loading && query && (
          <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            Searching...
          </span>
        )}

        {query && !loading && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 text-sm"
          >
            ✕
          </button>
        )}

        {/* SUGGESTIONS */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg overflow-hidden shadow-lg max-h-80 overflow-y-auto">
            {suggestions.map((customer) => (
              <div
                key={customer._id}
                onClick={() => selectCustomer(customer)}
                className="px-4 py-2.5 cursor-pointer hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
              >
                <p className="text-sm font-medium text-gray-800">
                  {customer.name}
                </p>
                <p className="text-xs text-gray-600">
                  Policy No: {customer.policyNumber}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* NO RESULTS */}
        {!loading &&
          query.trim() &&
          suggestions.length === 0 &&
          !selectedCustomer &&
          !isSelected && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-500">
              No customer found
            </div>
          )}
      </div>

      {/* CUSTOMER DETAILS */}
      {selectedCustomer && (
        <div className="mt-6 bg-white rounded-2xl shadow-md p-6">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-800">
              Customer Details
            </h3>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditCustomer(selectedCustomer)}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={clearSearch}
                className="text-sm text-red-500 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          {/* DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Detail label="Name" value={selectedCustomer.name || "-"} />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="font-medium text-gray-800">
                  {getFormattedDOB()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(getFormattedDOB(), "dob")}
                className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
              >
                {copied === "dob" ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Policy Number</p>
                <p className="font-medium text-gray-800">
                  {selectedCustomer.policyNumber || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCopy(selectedCustomer.policyNumber, "policy")
                }
                className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
              >
                {copied === "policy" ? "Copied!" : "Copy"}
              </button>
            </div>

            <Detail
              label="Policy Name"
              value={selectedCustomer.policyName || "-"}
            />

            <Detail
              label="Premium Amount"
              value={
                selectedCustomer.premiumAmount !== undefined
                  ? `₹${Number(selectedCustomer.premiumAmount).toLocaleString(
                      "en-IN"
                    )}`
                  : "-"
              }
            />

            <Detail
              label="Payment Frequency"
              value={selectedCustomer.paymentFrequency || "-"}
            />

            <Detail
              label="Payment Type"
              value={selectedCustomer.paymentType || "-"}
            />

            {/* PAYMENT STATUS */}
            <div>
              <p className="text-xs text-gray-500">Payment Status</p>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                  selectedCustomer.paymentStatus === "Paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {selectedCustomer.paymentStatus || "Pending"}
              </span>
            </div>

            <Detail
              label="Next Due Date"
              value={getFormattedDueDate()}
            />

            <Detail
              label="Missed Payments"
              value={
                selectedCustomer.paymentStatus === "Pending"
                  ? `${selectedCustomer.missedPaymentPeriods || 0} ${
                      (selectedCustomer.missedPaymentPeriods || 0) === 1
                        ? "Payment"
                        : "Payments"
                    }`
                  : "0 Payments"
              }
            />

            {/* TOTAL DUE */}
            <div className="sm:col-span-2 mt-2 p-4 rounded-xl border border-red-200 bg-red-50">
              <p className="text-xs text-red-600 font-medium">
                Total Payment Due
              </p>

              <p className="text-2xl font-bold text-red-700 mt-1">
                ₹{getTotalDue().toLocaleString("en-IN")}
              </p>

              {selectedCustomer.paymentStatus === "Pending" &&
                selectedCustomer.missedPaymentPeriods > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    {selectedCustomer.missedPaymentPeriods} unpaid payment
                    {selectedCustomer.missedPaymentPeriods > 1 ? "s" : ""}
                  </p>
                )}

              {selectedCustomer.paymentStatus === "Paid" && (
                <p className="text-xs text-green-600 mt-1">
                  No payment due
                </p>
              )}
            </div>
          </div>

          {/* PAY NOW */}
          <div className="mt-6 pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePayNow}
              className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 active:scale-[0.98] transition shadow-sm"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER */}
      {editCustomer && (
        <EditCustomer
          customer={editCustomer}
          onClose={() => setEditCustomer(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}
