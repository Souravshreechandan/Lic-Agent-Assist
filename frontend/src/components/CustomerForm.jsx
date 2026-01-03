import React, { useEffect, useState } from "react";
import api from "../services/api";

const POLICY_OPTIONS = [
  "Jeevan Anand",
  "New Jeevan Anand",
  "Jeevan Lakshya",
  "Jeevan Utsav",
  "Jeevan Labh",
  "Jeevan Umang",
  "New Money Back Plan – 20 Years",
  "New Money Back Plan – 25 Years",
  "New Children’s Money Back Plan",
  "Jeevan Tarun",
  "Aadhaar Stambh",
  "Aadhaar Shila",
  "Micro Bachat Plan",
  "SIIP",
  "Jeevan Pragati",
  "Bima Jyoti",
  "Endowment Plus",
  "Dont Know"
];

export default function CustomerForm({ editData, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    dob: "",
    policyNumber: "",
    policyName: "Dont Know",
    premiumAmount: "",
    paymentFrequency: "Quarterly",
    paymentType: "Offline"
  });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        dob: editData.dob?.slice(0, 10),
        policyNumber: editData.policyNumber,
        policyName: editData.policyName || "Dont Know",
        premiumAmount: editData.premiumAmount,
        paymentFrequency: editData.paymentFrequency,
        paymentType: editData.paymentType || "Offline"
      });
    }
  }, [editData]);

  const submit = async () => {
    if (editData) {
      await api.put(`/customers/${editData._id}`, form);
    } else {
      await api.post("/customers", form);
    }
    onSuccess();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
      {editData ? "Edit Customer" : "Add Customer"}
      </h2>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CUSTOMER NAME */}
        <input
          className="
            w-full border border-gray-300 rounded-lg
            px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          placeholder="Customer Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        {/* DOB */}
        <input
          type="date"
          className="
            w-full border border-gray-300 rounded-lg
            px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          value={form.dob}
          onChange={(e) =>
            setForm({ ...form, dob: e.target.value })
          }
        />

        {/* POLICY NUMBER */}
        <input
          className="
            w-full border border-gray-300 rounded-lg
            px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          placeholder="Policy Number"
          value={form.policyNumber}
          onChange={(e) =>
            setForm({ ...form, policyNumber: e.target.value })
          }
        />

        {/* POLICY NAME */}
        <select
          className="
            w-full border border-gray-300 rounded-lg
            px-3 py-2 text-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          value={form.policyName}
          onChange={(e) =>
            setForm({ ...form, policyName: e.target.value })
          }
        >
          <option value="">Select Policy Name</option>
          {POLICY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              LIC {p}
            </option>
          ))}
        </select>

        {/* PREMIUM */}
        <input
          type="number"
          className="
            w-full border border-gray-300 rounded-lg
            px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          placeholder="Premium Amount"
          value={form.premiumAmount}
          onChange={(e) =>
            setForm({ ...form, premiumAmount: e.target.value })
          }
        />

        {/* PAYMENT FREQUENCY */}
        <select
          className="
            w-full border border-gray-300 rounded-lg
            px-3 py-2 text-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          value={form.paymentFrequency}
          onChange={(e) =>
            setForm({ ...form, paymentFrequency: e.target.value })
          }
        >
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Half-Yearly">Half-Yearly</option>
          <option value="Yearly">Yearly</option>
        </select>

        {/* PAYMENT TYPE */}
        <select
          className="
            w-full border border-gray-300 rounded-lg
            px-3 py-2 text-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          value={form.paymentType}
          onChange={(e) =>
            setForm({ ...form, paymentType: e.target.value })
          }
        >
          <option value="Offline">Offline</option>
          <option value="Online">Online</option>
        </select>
      </div>

      <button
        onClick={submit}
        className="
          mt-8
          bg-blue-600 hover:bg-blue-700
          text-white text-sm font-semibold
          px-6 py-2.5 rounded-lg
          transition duration-200
          shadow-sm hover:shadow-md
          active:scale-95
        "
      >
        {editData ? "Update Customer" : "Add Customer"}
      </button>
    </div>
  );
}
