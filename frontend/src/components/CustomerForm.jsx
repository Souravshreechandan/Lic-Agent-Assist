import React, { useEffect, useState } from "react";
import api from "../services/api";

const POLICY_OPTIONS = [
  "Jeevan Anand", "New Jeevan Anand", "Jeevan Lakshya", "Jeevan Utsav",
  "Jeevan Labh", "Jeevan Umang", "New Money Back Plan – 20 Years",
  "New Money Back Plan – 25 Years", "New Children’s Money Back Plan",
  "Jeevan Tarun", "Aadhaar Stambh", "Aadhaar Shila", "Micro Bachat Plan",
  "SIIP", "Jeevan Pragati", "Bima Jyoti", "Endowment Plus", "Dont Know",
];

const emptyForm = {
  name: "", dob: "", policyNumber: "", policyName: "Dont Know",
  premiumAmount: "", paymentFrequency: "Quarterly",
  paymentType: "Offline", paymentStatus: "Pending", dueDate: "",
};

const inputClass = "w-full h-10 border border-gray-300 rounded-lg px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function CustomerForm({ editData, onSuccess }) {
  const [form, setForm] = useState(emptyForm);

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
        dueDate: editData.dueDate ? editData.dueDate.slice(0, 10) : "",
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
      if (!form.policyNumber.trim()) return alert("Please enter policy number");
      if (form.premiumAmount === "" || Number(form.premiumAmount) <= 0)
        return alert("Please enter a valid premium amount");
      if (!form.dueDate) return alert("Please select next due date");

      const dataToSend = { ...form, premiumAmount: Number(form.premiumAmount) };

      if (editData) await api.put(`/customers/${editData._id}`, dataToSend);
      else await api.post("/customers", dataToSend);

      onSuccess();
    } catch (err) {
      console.error("Customer save error:", err);
      alert(err.response?.data?.message || "Failed to save customer");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-5">
        {editData ? "Edit Customer" : "Add Customer"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" className={inputClass} placeholder="Customer Name" value={form.name} onChange={handleChange} />

        <DateInput label="Date of Birth" name="dob" value={form.dob} onChange={handleChange} />

        <input name="policyNumber" className={inputClass} placeholder="Policy Number" value={form.policyNumber} onChange={handleChange} />

        <select name="policyName" className={inputClass} value={form.policyName} onChange={handleChange}>
          {POLICY_OPTIONS.map((p) => <option key={p} value={p}>LIC {p}</option>)}
        </select>

        <input name="premiumAmount" type="number" min="1" className={inputClass} placeholder="Premium Amount" value={form.premiumAmount} onChange={handleChange} />

        <select name="paymentFrequency" className={inputClass} value={form.paymentFrequency} onChange={handleChange}>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Half-Yearly">Half-Yearly</option>
          <option value="Yearly">Yearly</option>
        </select>

        <select name="paymentType" className={inputClass} value={form.paymentType} onChange={handleChange}>
          <option value="Offline">Offline</option>
          <option value="Online">Online</option>
        </select>

        <select name="paymentStatus" className={inputClass} value={form.paymentStatus} onChange={handleChange}>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
        </select>

        <DateInput label="Next Due Date" name="dueDate" value={form.dueDate} onChange={handleChange} />
      </div>

      <button type="button" onClick={submit} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition shadow-sm active:scale-95">
        {editData ? "Update Customer" : "Add Customer"}
      </button>
    </div>
  );
}

function DateInput({ label, name, value, onChange }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
