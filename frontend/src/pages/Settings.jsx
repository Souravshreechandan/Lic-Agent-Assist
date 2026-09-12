
import React, { useState } from "react";
import api from "../services/api";

export default function Settings({ onLogout }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const changePassword = async () => {
    if (!form.currentPassword) {
      return alert("Please enter current password");
    }

    if (!form.newPassword) {
      return alert("Please enter new password");
    }

    if (form.newPassword.length < 6) {
      return alert(
        "New password must be at least 6 characters"
      );
    }

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      return alert("Passwords do not match");
    }

    try {
      setSaving(true);

      await api.put("/agent/password", {
        currentPassword:
          form.currentPassword,
        newPassword:
          form.newPassword,
      });

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      alert("Password changed successfully");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] pt-[68px]">
      <main className="px-5 py-7 lg:px-7 lg:pl-[240px]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#17213f]">
            Settings
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings
          </p>
        </div>

        <div className="max-w-3xl space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Change Password
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update your account password
            </p>

            <div className="mt-5 space-y-4">
              <PasswordField
                label="Current Password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
              />

              <PasswordField
                label="New Password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
              />

              <PasswordField
                label="Confirm New Password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              type="button"
              onClick={changePassword}
              disabled={saving}
              className={`mt-5 rounded-lg px-6 py-2.5 text-sm font-semibold text-white ${
                saving
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving
                ? "Updating..."
                : "Change Password"}
            </button>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Account
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Sign out of your LIC Agent account
            </p>

            <button
              type="button"
              onClick={onLogout}
              className="mt-5 rounded-lg border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        placeholder={label}
      />
    </div>
  );
}
