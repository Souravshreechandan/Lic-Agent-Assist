
import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Profile() {
  const [form, setForm] = useState({
    name: "",
    agentCode: "",
    email: "",
    mobileNumber: "",
    address: "",
    licBranch: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/agent/profile");

        setForm({
          name: data.name || "",
          agentCode: data.agentCode || "",
          email: data.email || "",
          mobileNumber: data.mobileNumber || "",
          address: data.address || "",
          licBranch: data.licBranch || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "agentCode") {
      const digits = value.replace(/\D/g, "").slice(0, 8);

      setForm((prev) => ({
        ...prev,
        agentCode: digits,
      }));

      return;
    }

    if (name === "mobileNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 10);

      setForm((prev) => ({
        ...prev,
        mobileNumber: digits,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!/^\d{8}$/.test(form.agentCode)) {
      setError("Agent Code must be exactly 8 digits.");
      return;
    }

    if (!/^\d{10}$/.test(form.mobileNumber)) {
      setError("Phone Number must be exactly 10 digits.");
      return;
    }

    if (!form.name.trim()) {
      setError("Agent Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setSaving(true);

      const { data } = await api.put("/agent/profile", {
        name: form.name.trim(),
        agentCode: form.agentCode,
        email: form.email.trim(),
        mobileNumber: form.mobileNumber,
        address: form.address.trim(),
        licBranch: form.licBranch.trim(),
      });

      setForm((prev) => ({
        ...prev,
        ...data.agent,
        agentCode: data.agent.agentCode || "",
        mobileNumber: data.agent.mobileNumber || "",
      }));

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (!form.name.trim()) return "AG";

    const parts = form.name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      parts[0][0] + parts[parts.length - 1][0]
    ).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 pt-[84px]">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 pb-10 pt-[84px]">
      <div className="mx-auto max-w-4xl">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#17213f]">
            Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your agent information
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#17213f] text-lg font-bold text-white">
              {getInitials()}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {form.name || "LIC Agent"}
              </h2>
              <p className="text-sm text-gray-500">
                LIC Agent
              </p>
            </div>
          </div>

          {message && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Agent Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter agent name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Agent Code
                </label>

                <input
                  type="text"
                  name="agentCode"
                  value={form.agentCode}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={8}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="8 digit agent code"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Must be exactly 8 digits
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>

                <input
                  type="text"
                  name="mobileNumber"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="10 digit phone number"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Must be exactly 10 digits
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  LIC Branch
                </label>

                <input
                  type="text"
                  name="licBranch"
                  value={form.licBranch}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter LIC branch"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Address
                </label>

                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter address"
                />
              </div>

            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

