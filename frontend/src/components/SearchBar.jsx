
import React, { useEffect, useState } from "react";
import api from "../services/api";
import EditCustomer from "./EditCustomer";

const icons = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4",
  close: "M18 6 6 18M6 6l12 12",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z",
  copy: "M9 9h11v11H9zM15 9V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h5",
  calendar:
    "M16 3v4M8 3v4M3 10h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2",
  document: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6",
  refresh:
    "M20 11a8 8 0 0 0-14-5L4 8M4 4v4h4M4 13a8 8 0 0 0 14 5l2-2M20 20v-4h-4",
  card: "M3 5h18v14H3zM3 10h18M7 15h4",
  check: "m5 12 4 4L19 6",
  warning: "m12 3 10 18H2L12 3ZM12 9v5M12 17h.01",
  shield:
    "M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
  rupee: "M8 5h8M8 9h8M9 5c5 0 5 7 0 7H8l7 7",
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name]} />
    </svg>
  );
}

export default function SearchBar({
  selectedCustomer = null,
  onCustomerSelect,
  hideSearch = false,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [edit, setEdit] = useState(null);
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCustomer) {
      setCustomer(selectedCustomer);
      setQuery(selectedCustomer.name || "");
      setResults([]);
    } else if (selectedCustomer === null) {
      setCustomer(null);

      if (hideSearch) {
        setQuery("");
      }
    }
  }, [selectedCustomer, hideSearch]);

  useEffect(() => {
    if (hideSearch || !query.trim() || customer) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const { data } = await api.get(
          `/customers/search?q=${encodeURIComponent(query.trim())}`
        );

        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, customer, hideSearch]);

  const selectCustomer = (item) => {
    setCustomer(item);
    setResults([]);
    setQuery(item.name || "");
    onCustomerSelect?.(item);
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setCustomer(null);
    setEdit(null);
    setCopied("");
    onCustomerSelect?.(null);
  };

  const date = (value) =>
    value ? new Date(value).toLocaleDateString("en-GB") : "-";

  const copy = async (value, type) => {
    if (!value || value === "-") return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(type);

      setTimeout(() => setCopied(""), 1200);
    } catch {}
  };

  const active = customer?.policyStatus !== "Lapsed";
  const due = Number(customer?.totalDueAmount) || 0;

  const payNow = () => {
    window.open(
      "https://www.amazon.in/apay/interstitial/insurance/LICOB?ref_=apay_interstitial_biller_search_to_form_field_insurance",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="w-full">
      {!hideSearch && (
        <div className="mx-auto max-w-xl">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <Icon name="search" size={19} />
            </div>

            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCustomer(null);
                onCustomerSelect?.(null);
              }}
              placeholder="Search customer by name..."
              className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-11 pr-11 text-sm text-gray-800 shadow-sm outline-none focus:border-blue-500"
            />

            {query && (
              <button
                type="button"
                onClick={clear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon name="close" size={17} />
              </button>
            )}

            {(loading || results.length > 0 || (query && !customer)) && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                {loading ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Searching...
                  </div>
                ) : results.length ? (
                  results.map((item) => (
                    <button
                      type="button"
                      key={item._id}
                      onClick={() => selectCustomer(item)}
                      className="w-full border-b px-4 py-3 text-left last:border-0 hover:bg-gray-50"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Policy No: {item.policyNumber}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No customer found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {customer && (
        <div
          className={`mx-auto ${
            hideSearch ? "mt-0" : "mt-5"
          } max-w-6xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm`}
        >
          <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-semibold text-blue-600">
                  {customer.name
                    ?.split(" ")
                    .slice(0, 2)
                    .map((x) => x[0])
                    .join("")
                    .toUpperCase()}
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {customer.name}
                  </h2>

                  <p className="mt-1 text-[15px] text-gray-500">
                    {customer.policyName || "LIC Policy"}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-5 py-2 text-sm font-semibold ${
                  active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                ● {active ? "Active" : "Lapsed"}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEdit(customer)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Icon name="edit" size={17} />
                Edit
              </button>

              <button
                type="button"
                onClick={clear}
                className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Icon name="close" size={17} />
                Clear
              </button>

              <button
                type="button"
                onClick={payNow}
                className="ml-auto flex items-center gap-2 rounded-lg bg-orange-500 px-7 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
              >
                <Icon name="card" size={18} />
                Pay Now
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
            <Info
              icon="document"
              label="Policy Number"
              value={customer.policyNumber}
              copy={() => copy(customer.policyNumber, "policy")}
              copied={copied === "policy"}
            />

            <Info
              icon="calendar"
              label="Date of Birth"
              value={date(customer.dob)}
              copy={() => copy(date(customer.dob), "dob")}
              copied={copied === "dob"}
            />

            <Info
              icon="calendar"
              label="Next Due Date"
              value={date(customer.dueDate)}
            />

            <Info
              icon="document"
              label="Policy Name"
              value={customer.policyName}
            />

            <Info
              icon="rupee"
              label="Premium Amount"
              value={`₹${Number(
                customer.premiumAmount || 0
              ).toLocaleString("en-IN")}`}
            />

            <Info
              icon="refresh"
              label="Payment Frequency"
              value={customer.paymentFrequency}
            />

            <Info
              icon="card"
              label="Payment Type"
              value={customer.paymentType}
            />

            <Info
              icon="check"
              label="Payment Status"
              value={
                <Status
                  text={customer.paymentStatus || "Pending"}
                  green={customer.paymentStatus === "Paid"}
                />
              }
            />

            <Info
              icon="warning"
              label="Missed Payments"
              value={
                customer.paymentStatus === "Pending"
                  ? customer.missedPaymentPeriods || 0
                  : 0
              }
            />

            <Info
              icon="rupee"
              label="Total Due Amount"
              value={`₹${due.toLocaleString("en-IN")}`}
            />

            <Info
              icon="shield"
              label="Policy Status"
              value={
                <Status
                  text={active ? "Active" : "Lapsed"}
                  green={active}
                />
              }
            />
          </div>
        </div>
      )}

      {edit && (
        <EditCustomer
          customer={edit}
          onClose={() => setEdit(null)}
          onSuccess={clear}
        />
      )}
    </div>
  );
}

function Info({ icon, label, value, copy, copied }) {
  return (
    <div className="flex min-h-[92px] items-center gap-3 rounded-xl border border-blue-50 bg-[#f8fbff] px-4 py-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-gray-700">
        <Icon name={icon} size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-gray-500">{label}</p>

        <div className="mt-1 text-[16px] font-medium text-gray-900">
          {value || "-"}
        </div>
      </div>

      {copy && (
        <button
          type="button"
          onClick={copy}
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50"
        >
          <Icon name={copied ? "check" : "copy"} size={17} />
        </button>
      )}
    </div>
  );
}

function Status({ text, green }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        green
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {text}
    </span>
  );
}
