import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import AgentDashboard from "./pages/AgentDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  const [auth, setAuth] = useState("loading");
  const [page, setPage] = useState("home");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuth(token ? "authenticated" : "unauthenticated");
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setAuth("unauthenticated");
    setPage("home");
    setSelectedCustomer(null);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  if (auth === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (auth === "unauthenticated") {
    return (
      <Auth
        setAuth={() => setAuth("authenticated")}
      />
    );
  }

  return (
    <>
      <Navbar
        setPage={setPage}
        onLogout={logout}
        page={page}
        onCustomerSelect={handleCustomerSelect}
      />

      {page === "home" && (
        <Home
          setPage={setPage}
          selectedCustomer={selectedCustomer}
          onCustomerSelect={setSelectedCustomer}
        />
      )}

      {page === "dashboard" && (
        <AgentDashboard
          selectedCustomer={selectedCustomer}
          onCustomerSelect={setSelectedCustomer}
        />
      )}

      {page === "addCustomer" && (
        <AgentDashboard
          autoOpenAdd
          selectedCustomer={selectedCustomer}
          onCustomerSelect={setSelectedCustomer}
        />
      )}

      {page === "profile" && <Profile />}

      {page === "settings" && (
        <Settings onLogout={logout} />
      )}
    </>
  );
}

export default App;