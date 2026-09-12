import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(false);

  // FAST SEARCH
  useEffect(() => {
    if (!query.trim()) {
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
          {
            signal: controller.signal,
          }
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
  }, [query]);

  // SELECT CUSTOMER
  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setSuggestions([]);
    setQuery(customer.name);
    setCopied("");
  };

  // CLEAR SEARCH
  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setSelectedCustomer(null);
    setCopied("");
    setLoading(false);
  };

  // FORMAT DOB
  const getFormattedDOB = () => {
    if (!selectedCustomer?.dob) return "-";

    return new Date(selectedCustomer.dob).toLocaleDateString("en-GB");
  };

  // COPY TEXT
  const handleCopy = async (value, type) => {
    if (!value || value === "-") return;

    try {
      await navigator.clipboard.writeText(value.toString());

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 1500);
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

  return (
    <div className="max-w-xl mx-auto">

      {/* =========================
          SEARCH BOX
      ========================= */}
      <div className="relative">

        <input
          className="
            w-full
            border border-gray-400
            rounded-full
            px-4 py-2.5
            pr-20
            text-sm
            focus:outline-none
            focus:border-blue-600
            shadow-sm
          "
          placeholder="Search customer by name..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedCustomer(null);
            setCopied("");
          }}
        />

        {/* LOADING */}
        {loading && query && (
          <span
            className="
              absolute
              right-10
              top-1/2
              -translate-y-1/2
              text-xs
              text-gray-400
            "
          >
            Searching...
          </span>
        )}

        {/* CLEAR X */}
        {query && !loading && (
          <button
            type="button"
            onClick={clearSearch}
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-gray-500
              hover:text-red-500
            "
          >
            ✕
          </button>
        )}

        {/* =========================
            SUGGESTIONS
        ========================= */}
        {suggestions.length > 0 && (
          <div
            className="
              absolute
              z-10
              w-full
              mt-1
              bg-white
              border border-gray-300
              rounded-lg
              overflow-hidden
              shadow-lg
              max-h-80
              overflow-y-auto
            "
          >
            {suggestions.map((customer) => (
              <div
                key={customer._id}
                onClick={() => selectCustomer(customer)}
                className="
                  px-4
                  py-2.5
                  cursor-pointer
                  hover:bg-gray-100
                  border-b border-gray-200
                  last:border-b-0
                "
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
          !selectedCustomer && (
            <div
              className="
                absolute
                z-10
                w-full
                mt-1
                bg-white
                border border-gray-300
                rounded-lg
                shadow-lg
                px-4 py-3
                text-sm
                text-gray-500
              "
            >
              No customer found
            </div>
          )}
      </div>

      {/* =========================
          CUSTOMER DETAILS
      ========================= */}
      {selectedCustomer && (
        <div
          className="
            mt-6
            bg-white
            rounded-2xl
            shadow-md
            p-6
          "
        >

          {/* HEADER */}
          <div className="flex justify-between items-center mb-5">

            <h3 className="text-lg font-semibold text-gray-800">
              Customer Details
            </h3>

            <button
              type="button"
              onClick={clearSearch}
              className="
                text-sm
                text-red-500
                hover:underline
              "
            >
              Clear
            </button>

          </div>

          {/* =========================
              DETAILS
          ========================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

            {/* NAME */}
            <Detail
              label="Name"
              value={selectedCustomer.name}
            />

            {/* DOB WITH COPY */}
            <div className="flex justify-between items-center">

              <div>
                <p className="text-xs text-gray-500">
                  Date of Birth
                </p>

                <p className="font-medium text-gray-800">
                  {getFormattedDOB()}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCopy(getFormattedDOB(), "dob")
                }
                className="
                  bg-blue-600
                  text-white
                  text-xs
                  px-3
                  py-1
                  rounded
                  hover:bg-blue-700
                "
              >
                {copied === "dob" ? "Copied!" : "Copy"}
              </button>

            </div>

            {/* POLICY NUMBER WITH COPY */}
            <div className="flex justify-between items-center">

              <div>
                <p className="text-xs text-gray-500">
                  Policy Number
                </p>

                <p className="font-medium text-gray-800">
                  {selectedCustomer.policyNumber || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    selectedCustomer.policyNumber,
                    "policy"
                  )
                }
                className="
                  bg-blue-600
                  text-white
                  text-xs
                  px-3
                  py-1
                  rounded
                  hover:bg-blue-700
                "
              >
                {copied === "policy" ? "Copied!" : "Copy"}
              </button>

            </div>

            {/* POLICY NAME */}
            <Detail
              label="Policy Name"
              value={selectedCustomer.policyName || "-"}
            />

            {/* PREMIUM AMOUNT */}
            <Detail
              label="Premium Amount"
              value={
                selectedCustomer.premiumAmount !== undefined
                  ? `₹${selectedCustomer.premiumAmount}`
                  : "-"
              }
            />

            {/* PAYMENT FREQUENCY */}
            <Detail
              label="Payment Frequency"
              value={
                selectedCustomer.paymentFrequency || "-"
              }
            />

            {/* PAYMENT TYPE */}
            <Detail
              label="Payment Type"
              value={
                selectedCustomer.paymentType || "-"
              }
            />

          </div>

          {/* =========================
              PAY NOW - BOTTOM
          ========================= */}
          <div className="mt-6 pt-5 border-t border-gray-200">

            <button
              type="button"
              onClick={handlePayNow}
              className="
                w-full
                bg-orange-500
                text-white
                font-semibold
                py-3
                rounded-xl
                hover:bg-orange-600
                active:scale-[0.98]
                transition
                shadow-sm
              "
            >
              Pay Now
            </button>

          </div>

        </div>
      )}
    </div>
  );
}


// =========================
// DETAIL COMPONENT
// =========================
function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}