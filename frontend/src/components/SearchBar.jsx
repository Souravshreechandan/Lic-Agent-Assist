import React,{ useState } from "react";
import api from "../services/api";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleSearch = async (value) => {
    setQuery(value);
    setSelectedCustomer(null);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const res = await api.get(`/customers/search?q=${value}`);
    setSuggestions(res.data);
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setSuggestions([]);
    setQuery(customer.name);
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setSelectedCustomer(null);
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* SEARCH INPUT */}
      <div className="relative">
        <input
          className="
            w-full
            border border-gray-400
            rounded-full
            px-4 py-2.5 pr-10
            text-sm
            focus:outline-none
            focus:border-blue-600
            shadow-sm
          "
          placeholder="Search customer by name..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />

        {/* CLEAR BUTTON */}
        {query && (
          <button
            onClick={clearSearch}
            className="
              absolute right-4 top-1/2 -translate-y-1/2
              text-gray-500 hover:text-red-500
              text-sm
            "
          >
            ✕
          </button>
        )}

        {/* SUGGESTIONS */}
        {suggestions.length > 0 && (
          <div
            className="
              absolute z-10 w-full mt-1
              bg-white
              border border-gray-300
              rounded-lg
              overflow-hidden
            "
          >
            {suggestions.map((c) => (
              <div
                key={c._id}
                onClick={() => selectCustomer(c)}
                className="
                  px-4 py-2
                  cursor-pointer
                  hover:bg-gray-100
                  border-b border-gray-200
                  last:border-b-0
                "
              >
                <p className="text-sm font-medium text-gray-800">
                  {c.name}
                </p>
                <p className="text-xs text-gray-600">
                  Policy No: {c.policyNumber}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CUSTOMER DETAILS */}
      {selectedCustomer && (
        <div className="mt-6 bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Customer Details
            </h3>

            {/* CLEAR DETAILS */}
            <button
              onClick={clearSearch}
              className="text-sm text-red-500 hover:underline"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Detail label="Name" value={selectedCustomer.name} />
            <Detail
              label="Date of Birth"
              value={new Date(
                selectedCustomer.dob
              ).toLocaleDateString()}
            />
            <Detail
              label="Policy Number"
              value={selectedCustomer.policyNumber}
            />
            <Detail
              label="Policy Name"
              value={selectedCustomer.policyName}
            />
            <Detail
              label="Premium Amount"
              value={`₹${selectedCustomer.premiumAmount}`}
            />
            <Detail
              label="Payment Frequency"
              value={selectedCustomer.paymentFrequency}
            />
            <Detail
              label="Payment Type"
              value={selectedCustomer.paymentType}
            />
          </div>
        </div>
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
