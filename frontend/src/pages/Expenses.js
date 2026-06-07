import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getExpenses, addExpense, updateExpense, deleteExpense } from "../utils/api";
import { CATEGORIES, CATEGORY_COLORS, formatCurrency, formatDate } from "../utils/constants";

const EMPTY_FORM = { title: "", amount: "", category: "Food & Dining", date: new Date().toISOString().slice(0, 10), note: "" };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState({ category: "", month: "", year: new Date().getFullYear() });

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.category) params.category = filter.category;
      if (filter.month) params.month = filter.month;
      if (filter.year) params.year = filter.year;
      const data = await getExpenses(params);
      setExpenses(data);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (exp) => { setEditing(exp); setForm({ title: exp.title, amount: exp.amount, category: exp.category, date: exp.date, note: exp.note || "" }); setModal(true); };

  const handleSubmit = async () => {
    if (!form.title || !form.amount || !form.date) return toast.error("Fill all required fields");
    try {
      if (editing) {
        const updated = await updateExpense(editing.id, form);
        setExpenses((prev) => prev.map((e) => e.id === editing.id ? updated : e));
        toast.success("Expense updated");
      } else {
        const created = await addExpense(form);
        setExpenses((prev) => [created, ...prev]);
        toast.success("Expense added");
      }
      setModal(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Expenses</div>
        <div className="page-sub">// {expenses.length} records · {formatCurrency(total)} total</div>
      </div>

      <div className="toolbar">
        <select className="form-input" style={{ width: "auto" }} value={filter.month} onChange={(e) => setFilter((f) => ({ ...f, month: e.target.value }))}>
          <option value="">All Months</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("en", { month: "long" })}</option>
          ))}
        </select>
        <select className="form-input" style={{ width: "auto" }} value={filter.year} onChange={(e) => setFilter((f) => ({ ...f, year: e.target.value }))}>
          {[2023, 2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
        </select>
        <select className="form-input" style={{ width: "auto" }} value={filter.category} onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value }))}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={openAdd}>+ Add Expense</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty"><div className="empty-text">Loading...</div></div>
        ) : expenses.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">💸</div>
            <div className="empty-text">No expenses found. Add your first one!</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600 }}>{e.title}</td>
                    <td>
                      <span className="badge" style={{ borderColor: CATEGORY_COLORS[e.category] || "#94a3b8", color: CATEGORY_COLORS[e.category] || "#94a3b8" }}>
                        {e.category}
                      </span>
                    </td>
                    <td style={{ color: "var(--text2)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{formatDate(e.date)}</td>
                    <td style={{ color: "var(--text3)", fontSize: 12 }}>{e.note || "—"}</td>
                    <td style={{ textAlign: "right" }}><span className="amount-neg">−{formatCurrency(e.amount)}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)} style={{ marginRight: 4 }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-title">{editing ? "Edit Expense" : "Add Expense"}</div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="e.g. Swiggy order" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-input" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <input className="form-input" placeholder="Any details..." value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>{editing ? "Update" : "Add Expense"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
