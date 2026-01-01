import { useEffect, useState } from "react";
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
    policyName: "",
    premiumAmount: "",
    paymentFrequency: "",
    paymentType: ""
  });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        dob: editData.dob?.slice(0, 10),
        policyNumber: editData.policyNumber,
        policyName: editData.policyName,
        premiumAmount: editData.premiumAmount,
        paymentFrequency: editData.paymentFrequency,
        paymentType: editData.paymentType
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
    <>
      <h2 className="text-xl font-semibold mb-4">
        {editData ? "Edit Customer" : "Add Customer"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* CUSTOMER NAME */}
        <input
          className="border p-2 rounded"
          placeholder="Customer Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        {/* DOB */}
        <input
          type="date"
          className="border p-2 rounded"
          value={form.dob}
          onChange={(e) =>
            setForm({ ...form, dob: e.target.value })
          }
        />

        {/* POLICY NUMBER */}
        <input
          className="border p-2 rounded"
          placeholder="Policy Number"
          value={form.policyNumber}
          onChange={(e) =>
            setForm({ ...form, policyNumber: e.target.value })
          }
        />

        {/* POLICY NAME DROPDOWN */}
        <select
          className="border p-2 rounded"
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
          className="border p-2 rounded"
          placeholder="Premium Amount"
          value={form.premiumAmount}
          onChange={(e) =>
            setForm({ ...form, premiumAmount: e.target.value })
          }
        />

        {/* PAYMENT FREQUENCY */}
        <select
          className="border p-2 rounded"
          value={form.paymentFrequency}
          onChange={(e) =>
            setForm({ ...form, paymentFrequency: e.target.value })
          }
        >
          <option value="">Payment Frequency</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Half-Yearly">Half-Yearly</option>
          <option value="Yearly">Yearly</option>
        </select>

        {/* PAYMENT TYPE */}
        <select
          className="border p-2 rounded"
          value={form.paymentType}
          onChange={(e) =>
            setForm({ ...form, paymentType: e.target.value })
          }
        >
          <option value="">Payment Type</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
        </select>
      </div>

      <button
        onClick={submit}
        className="mt-5 bg-blue-600 hover:bg-blue-700
                   text-white px-5 py-2 rounded"
      >
        {editData ? "Update Customer" : "Add Customer"}
      </button>
    </>
  );
}
