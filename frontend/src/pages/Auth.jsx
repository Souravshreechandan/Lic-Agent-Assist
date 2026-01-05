import React, { useState } from "react";
import api from "../services/api";

export default function Auth({ setAuth }) {
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");

  const submit = async () => {
    setMessage("");
    localStorage.removeItem("token");

    try {
      if (mode === "register") {
        await api.post("/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password
        });
        setMessage("Registered successfully. Please login.");
        setMode("login");
      } else {
        const res = await api.post("/auth/login", {
          email: form.email,
          password: form.password
        });
        localStorage.setItem("token", res.data.token);
        setAuth(true);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid email or password");
    }
  };

  const cancel = () => {
    setForm({ name: "", email: "", password: "" });
    setMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative bg-white w-80 p-6 rounded shadow">

        {/* Cancel */}
        <button
          onClick={cancel}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl 
          font-semibold transition duration-200"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-center mb-4">
          {mode === "login" ? "Agent Login" : "Agent Register"}
        </h2>

        {message && (
          <p className="text-sm text-center mb-3 text-red-600">
            {message}
          </p>
        )}

        {mode === "register" && (
          <input
            className="border p-2 w-full mb-2 rounded"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        )}

        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          className="border p-2 w-full mb-4 rounded"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={submit}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold w-full 
          py-2.5 rounded-lg transition duration-200 shadow-sm hover:shadow-md active:scale-95"
        >
          {mode === "login" ? "Login" : "Register"}
        </button>

        <p className="text-sm text-center mt-4">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                className="text-blue-600 hover:text-blue-700 font-medium underline-offset-2 
                hover:underline transition"
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-blue-600 hover:text-blue-700 font-medium underline-offset-2 
                hover:underline transition"
                onClick={() => setMode("login")}
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
