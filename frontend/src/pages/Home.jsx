import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";

export default function Home({ setPage }) {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome,{" "}
            <span className="text-blue-600">Sukanti Sahoo</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Search customers and manage LIC policies easily
          </p>
        </div>

        {/* DATE & TIME */}
        <div className="mt-4 sm:mt-0 text-right">
          <p className="text-sm text-gray-500">
            {dateTime.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </p>
          <p className="text-lg font-semibold text-gray-800">
            {dateTime.toLocaleTimeString("en-IN")}
          </p>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="text-lg font-medium mb-3">
          Search Customer
        </h2>
        <SearchBar />
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setPage("dashboard")}
          className="cursor-pointer bg-white rounded-xl shadow p-5
                     hover:shadow-lg transition"
        >
          <h3 className="text-lg font-semibold text-blue-600">
            Agent Dashboard
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            View customers, policies & statistics
          </p>
        </div>

        <div
          onClick={() => setPage("dashboard")}
          className="cursor-pointer bg-white rounded-xl shadow p-5
                     hover:shadow-lg transition"
        >
          <h3 className="text-lg font-semibold text-green-600">
            Add New Customer
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Quickly add a new policy holder
          </p>
        </div>
      </div>
    </div>
  );
}
