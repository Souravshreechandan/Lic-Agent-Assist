import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import AgentDashboard from "./pages/AgentDashboard";

function App() {
  const [auth, setAuth] = useState("loading");
  const [page, setPage] = useState("home");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuth(token ? "authenticated" : "unauthenticated");
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setAuth("unauthenticated");
    setPage("home");
  };

  if (auth === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (auth === "unauthenticated") {
    return <Auth setAuth={() => setAuth("authenticated")} />;
  }

  return (
    <>
      <Navbar setPage={setPage} onLogout={logout} />

      {page === "home" && <Home setPage={setPage} />}

      {page === "dashboard" && <AgentDashboard />}

      {page === "addCustomer" && (
        <AgentDashboard autoOpenAdd />
      )}
    </>
  );
}

export default App;