import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getBudgets, setBudget, deleteBudget } from "../utils/api";
import { CATEGORIES, CATEGORY_COLORS, MONTHS, formatCurrency } from "../utils/constants";

export default function Budgets() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ category: "Food & Dining", limit: "" });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getBudgets({ month, year });
      setBudgets(data.budgets || []);
    } catch {
      toast.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [month, year]);

  const handleSetBudget = async () => {
    if (!form.limit || isNaN(form.limit)) return toast.error("Enter a valid limit");
    try {
      await setBudget({ month, year, category: form.category, limit: parseFloat(form.limit) });
      toast.success("Budget saved");
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Remove budget for ${category}?`)) return;
    try {
      await deleteBudget({ month, year, category });
      toast.success("Budget removed");
      load();
    } catch {
      toast.error("Failed to remove budget");
    }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Budgets</div>
        <div className="page-sub">// set limits · track spending</div>
      </div>

      <div className="toolbar">
        <select className="form-input" style={{ width: "auto" }} value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className="form-input" style={{ width: "auto" }} value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {[2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
        </select>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Set Budget</button>
        </div>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-label">Total Budget</div>
            <div className="stat-value">{formatCurrency(totalBudget)}</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">{formatCurrency(totalSpent)}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Remaining</div>
            <div className="stat-value">{formatCurrency(totalBudget - totalSpent)}</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {loading ? (
          <div className="card"><div className="empty"><div className="empty-text">Loading...</div></div></div>
        ) : budgets.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="empty-icon">🎯</div>
              <div className="empty-text">No budgets set for {MONTHS[month - 1]} {year}. Add one!</div>
            </div>
          </div>
        ) : budgets.map((b) => {
          const color = CATEGORY_COLORS[b.category] || "#94a3b8";
          const pct = Math.min(b.percentUsed, 100);
          const overBudget = b.spent > b.limit;
          return (
            <div key={b.category} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <span className="badge" style={{ borderColor: color, color }}>{b.category}</span>
                  {overBudget && <span style={{ marginLeft: 8, fontSize: 11, color: "var(--red)", fontFamily: "var(--font-mono)" }}>⚠ OVER BUDGET</span>}
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.category)}>Remove</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>BUDGET</div>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{formatCurrency(b.limit)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>SPENT</div>
                  <div style={{ fontWeight: 700, color: overBudget ? "var(--red)" : "var(--text)", fontFamily: "var(--font-mono)" }}>{formatCurrency(b.spent)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>REMAINING</div>
                  <div style={{ fontWeight: 700, color: overBudget ? "var(--red)" : "var(--green)", fontFamily: "var(--font-mono)" }}>{formatCurrency(b.remaining)}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: overBudget ? "var(--red)" : pct > 75 ? "var(--orange)" : color,
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text2)", minWidth: 40, textAlign: "right" }}>{b.percentUsed}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-title">Set Budget</div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Limit (₹)</label>
              <input className="form-input" type="number" min="0" placeholder="e.g. 5000" value={form.limit} onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
              Month: {MONTHS[month - 1]} {year}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSetBudget}>Save Budget</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
