
import React, { useEffect, useState } from "react";
import api from "../services/api";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5V21H3V10.5Z" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <path d="M16 4.5a4 4 0 0 1 0 7.5" />
      <path d="M19 14a5 5 0 0 1 3 4.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 .3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export default function Navbar({
  setPage,
  onLogout,
  page,
  onCustomerSelect,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const [agent, setAgent] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const { data } = await api.get("/agent/profile");
        setAgent({
          name: data.name || "",
          email: data.email || "",
        });
      } catch (err) {
        console.error("Agent profile fetch failed", err);
      }
    };

    fetchAgent();
  }, []);

  useEffect(() => {
    if (!query.trim() || !searching) {
      setResults([]);
      setLoading(false);
      return;
    }

    const search = query.trim();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const { data } = await api.get(
          `/customers/search?q=${encodeURIComponent(search)}`
        );

        if (searching && query.trim() === search) {
          setResults(data);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, searching]);

  const selectCustomer = (customer) => {
    setSearching(false);
    setResults([]);
    setLoading(false);
    setQuery(customer.name || "");
    onCustomerSelect?.(customer);
  };

  const clearSearch = () => {
    setSearching(false);
    setQuery("");
    setResults([]);
    setLoading(false);
    onCustomerSelect?.(null);
  };

  const handleSearch = (e) => {
    const value = e.target.value;

    setQuery(value);
    setSearching(Boolean(value.trim()));

    if (!value.trim()) {
      setResults([]);
      onCustomerSelect?.(null);
    }
  };

  const goHome = () => {
    clearSearch();
    setPage("home");
  };

  const getInitials = (name) => {
    if (!name) return "AG";

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      parts[0][0] + parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const menu = [
    ["Home", <HomeIcon />, "home"],
    ["Customers", <UsersIcon />, "dashboard"],
    ["Add Customer", <PlusIcon />, "addCustomer"],
    ["Profile", <UserIcon />, "profile"],
    ["Settings", <SettingsIcon />, "settings"],
  ];

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[100] h-[68px] border-b border-gray-200 bg-white">
        <div className="flex h-[68px] items-center px-6">

          <button
            type="button"
            onClick={goHome}
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
              LIC
            </div>

            <div className="text-left">
              <p className="text-[16px] font-bold leading-tight text-[#17213f]">
                LIC Agent
              </p>

              <p className="text-[11px] text-gray-400">
                Agent Portal
              </p>
            </div>
          </button>

          <div className="relative mx-auto hidden w-full max-w-[430px] md:block">

            <div className="flex h-10 items-center rounded-full border border-gray-200 bg-gray-50 px-4 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">

              <SearchIcon />

              <input
                value={query}
                onChange={handleSearch}
                placeholder="Search customer by name..."
                className="ml-2 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />

              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon />
                </button>
              )}
            </div>

            {searching && (loading || results.length > 0) && (
              <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">

                {loading ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Searching...
                  </div>
                ) : (
                  results.map((customer) => (
                    <button
                      key={customer._id}
                      type="button"
                      onClick={() => selectCustomer(customer)}
                      className="w-full border-b px-4 py-3 text-left last:border-0 hover:bg-gray-50"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {customer.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Policy No: {customer.policyNumber || "-"}
                      </p>
                    </button>
                  ))
                )}

              </div>
            )}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#17213f] text-xs font-semibold text-white">
              {getInitials(agent.name)}
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {agent.name || "LIC Agent"}
              </p>

              <p className="text-[11px] text-gray-500">
                LIC Agent
              </p>
            </div>

            <span className="text-gray-400">⌄</span>
          </div>
        </div>
      </header>

      {page === "home" && (
        <aside className="fixed left-0 top-[68px] z-[90] h-[calc(100vh-68px)] w-[210px] border-r border-gray-200 bg-white">

          <nav className="px-3 pt-5">
            {menu.map(([label, icon, target]) => (
              <button
                key={label}
                type="button"
                onClick={() => target && setPage(target)}
                className={`mb-1.5 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  page === target
                    ? "bg-blue-50 text-blue-600"
                    : "text-[#596681] hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="absolute bottom-5 left-0 w-full px-3">

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogoutIcon />
              <span>Logout</span>
            </button>

            <p className="mt-3 text-center text-[10px] text-gray-400">
              Version 1.0.0
            </p>

          </div>
        </aside>
      )}
    </>
  );
}
