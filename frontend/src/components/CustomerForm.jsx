
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
  "Dont Know",
];

const emptyForm = {
  name: "",
  dob: "",
  policyNumber: "",
  policyName: "Dont Know",
  premiumAmount: "",
  paymentFrequency: "Quarterly",
  paymentType: "Offline",
  paymentStatus: "Pending",
  policyStatus: "Active",
  dueDate: "",
};

const inputClass =
  "w-full h-10 border border-gray-300 rounded-lg px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function CustomerForm({ editData, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        dob: editData.dob ? editData.dob.slice(0, 10) : "",
        policyNumber: editData.policyNumber || "",
        policyName: editData.policyName || "Dont Know",
        premiumAmount: editData.premiumAmount ?? "",
        paymentFrequency: editData.paymentFrequency || "Quarterly",
        paymentType: editData.paymentType || "Offline",
        paymentStatus: editData.paymentStatus || "Pending",
        policyStatus: editData.policyStatus || "Active",
        dueDate: editData.dueDate
          ? editData.dueDate.slice(0, 10)
          : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async () => {
    try {
      if (!form.name.trim()) return alert("Please enter customer name");
      if (!form.dob) return alert("Please select date of birth");
      if (!form.policyNumber.trim())
        return alert("Please enter policy number");
      if (
        form.premiumAmount === "" ||
        Number(form.premiumAmount) <= 0
      )
        return alert("Please enter a valid premium amount");
      if (!form.dueDate) return alert("Please select next due date");

      const dataToSend = {
        ...form,
        premiumAmount: Number(form.premiumAmount),
        policyStatus: form.policyStatus || "Active",
      };

      setSaving(true);

      if (editData) {
        await api.put(`/customers/${editData._id}`, dataToSend);
      } else {
        await api.post("/customers", dataToSend);
      }

      onSuccess();
    } catch (err) {
      console.error("Customer save error:", err);
      alert(err.response?.data?.message || "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {editData ? "Edit Customer" : "Add Customer"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter customer and policy information
          </p>
        </div>

        <span
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            form.policyStatus === "Lapsed"
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              form.policyStatus === "Lapsed"
                ? "bg-red-500"
                : "bg-green-500"
            }`}
          />
          {form.policyStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Customer Name">
          <input
            name="name"
            className={inputClass}
            placeholder="Customer Name"
            value={form.name}
            onChange={handleChange}
          />
        </Field>

        <DateInput
          label="Date of Birth"
          name="dob"
          value={form.dob}
          onChange={handleChange}
        />

        <Field label="Policy Number">
          <input
            name="policyNumber"
            className={inputClass}
            placeholder="Policy Number"
            value={form.policyNumber}
            onChange={handleChange}
          />
        </Field>

        <Field label="Policy Name">
          <select
            name="policyName"
            className={inputClass}
            value={form.policyName}
            onChange={handleChange}
          >
            {POLICY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                LIC {p}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Premium Amount">
          <input
            name="premiumAmount"
            type="number"
            min="1"
            className={inputClass}
            placeholder="Premium Amount"
            value={form.premiumAmount}
            onChange={handleChange}
          />
        </Field>

        <Field label="Payment Frequency">
          <select
            name="paymentFrequency"
            className={inputClass}
            value={form.paymentFrequency}
            onChange={handleChange}
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Half-Yearly">Half-Yearly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </Field>

        <Field label="Payment Type">
          <select
            name="paymentType"
            className={inputClass}
            value={form.paymentType}
            onChange={handleChange}
          >
            <option value="Offline">Offline</option>
            <option value="Online">Online</option>
          </select>
        </Field>

        <Field label="Payment Status">
          <select
            name="paymentStatus"
            className={inputClass}
            value={form.paymentStatus}
            onChange={handleChange}
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
        </Field>

        <Field label="Policy Status">
          <select
            name="policyStatus"
            value={form.policyStatus}
            onChange={handleChange}
            className={`${inputClass} ${
              form.policyStatus === "Lapsed"
                ? "text-red-600 font-semibold"
                : "text-green-600 font-semibold"
            }`}
          >
            <option value="Active">🟢 Active</option>
            <option value="Lapsed">🔴 Lapsed</option>
          </select>
        </Field>

        <DateInput
          label="Next Due Date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={saving}
        className={`mt-6 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition shadow-sm active:scale-95 ${
          saving
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {saving
          ? "Saving..."
          : editData
          ? "Update Customer"
          : "Add Customer"}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function DateInput({ label, name, value, onChange }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        <input
          name={name}
          type="date"
          value={value}
          onChange={onChange}
          className={`${inputClass} pr-10 appearance-none cursor-pointer`}
          aria-label={label}
        />

        {!value && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm bg-white pr-1">
            DD/MM/YYYY
          </span>
        )}

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          📅
        </span>
      </div>
    </div>
  );
}

