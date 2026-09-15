
import React, { useState } from "react";
import api from "../services/api";

export default function Auth({ setAuth }) {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setMessage("");

    if (!form.email.trim() || !form.password) {
      setMessage("Email and password are required.");
      return;
    }

    if (mode === "register" && !form.name.trim()) {
      setMessage("Name is required.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "register") {
        await api.post("/auth/register", {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });

        setMessage("Registered successfully. Please login.");

        setForm({
          name: "",
          email: form.email,
          password: "",
        });

        setMode("login");
      } else {
        const res = await api.post("/auth/login", {
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });

        if (!res.data?.token) {
          throw new Error("Login token was not received.");
        }

        localStorage.setItem("token", res.data.token);

        setAuth(true);
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          err.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => {
    setForm({
      name: "",
      email: "",
      password: "",
    });

    setMessage("");
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setMessage("");
    setForm({
      name: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="relative w-80 rounded-xl bg-white p-6 shadow-md">
        <button
          type="button"
          onClick={cancel}
          disabled={loading}
          className="absolute right-2 top-2 text-xl font-semibold text-gray-400 transition duration-200 hover:text-red-500 disabled:cursor-not-allowed"
        >
          ×
        </button>

        <h2 className="mb-4 text-center text-xl font-semibold text-gray-900">
          {mode === "login" ? "Agent Login" : "Agent Register"}
        </h2>

        {message && (
          <p
            className={`mb-3 text-center text-sm ${
              message.toLowerCase().includes("success")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={submit}>
          {mode === "register" && (
            <input
              className="mb-2 w-full rounded border p-2 outline-none focus:border-blue-500"
              placeholder="Full Name"
              value={form.name}
              disabled={loading}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          )}

          <input
            className="mb-2 w-full rounded border p-2 outline-none focus:border-blue-500"
            placeholder="Email"
            type="email"
            value={form.email}
            disabled={loading}
            autoComplete="email"
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />

          <input
            className="mb-4 w-full rounded border p-2 outline-none focus:border-blue-500"
            type="password"
            placeholder="Password"
            value={form.password}
            disabled={loading}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Registering..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-700">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                disabled={loading}
                className="font-medium text-blue-600 underline-offset-2 transition hover:text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => changeMode("register")}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                disabled={loading}
                className="font-medium text-blue-600 underline-offset-2 transition hover:text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => changeMode("login")}
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
