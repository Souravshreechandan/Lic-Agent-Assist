import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import AgentDashboard from "./pages/AgentDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Duedate from "./pages/Duedate";
import UpcomingPremiums from "./pages/UpcomingPremiums";
import LapsedPolicies from "./pages/LapsedPolicies";
import api from "./services/api";

function App() {
  const [auth, setAuth] = useState("loading");
  const [page, setPage] = useState("home");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuth("unauthenticated");
        return;
      }

      try {
        await api.get("/agent/profile");
        setAuth("authenticated");
      } catch (error) {
        localStorage.removeItem("token");
        setAuth("unauthenticated");
      }
    };

    checkAuthentication();
  }, []);

  const handleLogin = () => {
    setSelectedCustomer(null);
    setPage("home");
    setAuth("authenticated");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setSelectedCustomer(null);
    setPage("home");
    setAuth("unauthenticated");
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  if (auth === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (auth === "unauthenticated") {
    return <Auth setAuth={handleLogin} />;
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

      {page === "settings" && <Settings onLogout={logout} />}

      {page === "dueDate" && <Duedate />}

      {page === "upcomingPremiums" && <UpcomingPremiums />}

      {page === "lapsedPolicies" && <LapsedPolicies />}
    </>
  );
}

export default App;