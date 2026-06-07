import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import "./App.css";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "expenses", label: "Expenses", icon: "↕" },
  { id: "budgets", label: "Budgets", icon: "◎" },
  { id: "reports", label: "Reports", icon: "▦" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{ style: { background: "#1a1a2e", color: "#e2e8f0", border: "1px solid #334155" } }} />
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">₹</span>
          <div>
            <div className="brand-name">FinTrack</div>
            <div className="brand-sub">Personal Finance</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-tip">💡 Track daily to stay on budget</div>
        </div>
      </aside>
      <main className="main">
        {page === "dashboard" && <Dashboard onNavigate={setPage} />}
        {page === "expenses" && <Expenses />}
        {page === "budgets" && <Budgets />}
        {page === "reports" && <Reports />}
      </main>
    </div>
  );
}
