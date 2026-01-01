import { useState } from "react";

export default function Navbar({ setPage, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white">
      <div className="flex justify-between items-center px-4 h-14">
        <div className="font-semibold">LIC Agent Assist</div>

        <div className="hidden md:flex gap-4">
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("dashboard")}>Dashboard</button>
          <button
            onClick={onLogout}
            className="bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-blue-700 p-3 space-y-2">
          <button onClick={() => setPage("home")} className="block w-full text-left">
            Home
          </button>
          <button onClick={() => setPage("dashboard")} className="block w-full text-left">
            Dashboard
          </button>
          <button
            onClick={onLogout}
            className="block w-full text-left bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
