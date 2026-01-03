import React, { useState } from "react";


export default function Navbar({ setPage, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white">
      <div className="flex justify-between items-center px-4 h-14">
        <div className="font-semibold">LIC Agent Assist</div>

        <div className="hidden md:flex gap-4">
          <button onClick={() => setPage("home")} className="px-3 py-1 rounded-md hover:bg-blue-500 transition" >Home</button>
          <button onClick={() => setPage("dashboard")} className="px-3 py-1 rounded-md hover:bg-blue-500 transition" >Dashboard</button>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-sm font-medium transition duration-200 shadow-sm hover:shadow"
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
          <button onClick={() => setPage("home")} className=" block w-full text-left px-3 py-2 rounded-md hover:bg-blue-600 transition">
            Home
          </button>
          <button onClick={() => setPage("dashboard")} className=" block w-full text-left px-3 py-2 rounded-md hover:bg-blue-600 transition">
            Dashboard
          </button>
          <button
            onClick={onLogout}
            className="block w-full text-left bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg font-medium transition duration-200"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
