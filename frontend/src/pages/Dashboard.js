import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { getMonthlyReport } from "../utils/api";
import { CATEGORY_COLORS, MONTHS, formatCurrency, formatDate } from "../utils/constants";

export default function Dashboard({ onNavigate }) {
  const now = new Date();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMonthlyReport(now.getMonth() + 1, now.getFullYear())
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty"><div className="empty-icon">⟳</div><div className="empty-text">Loading dashboard...</div></div>;

  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();
  const budgetPct = report?.budget?.total > 0
    ? Math.min((report.budget.spent / report.budget.total) * 100, 100)
    : 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">{month} {year}</div>
        <div className="page-sub">// financial overview</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card red">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">{formatCurrency(report?.total)}</div>
          <div className="stat-meta">{report?.count || 0} transactions</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Budget Remaining</div>
          <div className="stat-value">{formatCurrency(report?.budget?.remaining)}</div>
          <div className="stat-meta">of {formatCurrency(report?.budget?.total)} total</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Daily Average</div>
          <div className="stat-value">{formatCurrency(report?.avgPerDay)}</div>
          <div className="stat-meta">per active day</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Budget Used</div>
          <div className="stat-value">{budgetPct.toFixed(0)}%</div>
          <div className="stat-meta">
            <div className="progress-bar" style={{ marginTop: 6 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${budgetPct}%`,
                  background: budgetPct > 90 ? "var(--red)" : budgetPct > 70 ? "var(--orange)" : "var(--green)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
        {/* Daily spending chart */}
        <div className="card">
          <div className="card-title">Daily Spending</div>
          {report?.byDay?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={report.byDay} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252540" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => v.slice(8)} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: "#1a1a2e", border: "1px solid #334155", borderRadius: 8 }} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty" style={{ padding: "40px 0" }}><div className="empty-text">No spending data</div></div>}
        </div>

        {/* Category pie */}
        <div className="card">
          <div className="card-title">By Category</div>
          {report?.byCategory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={report.byCategory} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {report.byCategory.map((entry) => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: "#1a1a2e", border: "1px solid #334155", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty" style={{ padding: "40px 0" }}><div className="empty-text">No data yet</div></div>}
        </div>
      </div>

      {/* Top Expenses */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="card-title" style={{ margin: 0 }}>Top Expenses This Month</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("expenses")}>View All →</button>
        </div>
        {report?.topExpenses?.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {report.topExpenses.map((e) => (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td><span className="badge">{e.category}</span></td>
                    <td style={{ color: "var(--text2)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{formatDate(e.date)}</td>
                    <td style={{ textAlign: "right" }}><span className="amount-neg">−{formatCurrency(e.amount)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <div className="empty-text">No expenses this month yet</div>
          </div>
        )}
      </div>
    </div>
  );
}
