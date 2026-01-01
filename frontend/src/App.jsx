import { useState } from "react";
import Navbar from "./components/Navbar";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import AgentDashboard from "./pages/AgentDashboard";

function App() {
  const [auth, setAuth] = useState(
    localStorage.getItem("token") ? true : false
  );
  const [page, setPage] = useState("home");

  const logout = () => {
    localStorage.removeItem("token");
    setAuth(false);
  };

  if (!auth) {
    return <Auth setAuth={setAuth} />;
  }

  return (
    <>
      <Navbar setPage={setPage} onLogout={logout} />
      {page === "home" && <Home setPage={setPage} />}
      {page === "dashboard" && <AgentDashboard />}
    </>
  );
}

export default App;
