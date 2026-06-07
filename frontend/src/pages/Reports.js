import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { getMonthlyReport, getYearlyReport } from "../utils/api";
import { CATEGORY_COLORS, MONTHS, formatCurrency } from "../utils/constants";

export default function Reports() {
  const now = new Date();
  const [view, setView] = useState("monthly");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setReport(null);
    const p = view === "monthly"
      ? getMonthlyReport(month, year)
      : getYearlyReport(year);
    p.then(setReport).catch(() => setReport(null)).finally(() => setLoading(false));
  }, [view, month, year]);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Reports</div>
        <div className="page-sub">// analytics · insights</div>
      </div>

      <div className="toolbar" style={{ marginBottom: 24 }}>
        <button className={`btn ${view === "monthly" ? "btn-primary" : "btn-ghost"}`} onClick={() => setView("monthly")}>Monthly</button>
        <button className={`btn ${view === "yearly" ? "btn-primary" : "btn-ghost"}`} onClick={() => setView("yearly")}>Yearly</button>

        {view === "monthly" && (
          <>
            <select className="form-input" style={{ width: "auto", marginLeft: 8 }} value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select className="form-input" style={{ width: "auto" }} value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
              {[2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
            </select>
          </>
        )}
        {view === "yearly" && (
          <select className="form-input" style={{ width: "auto", marginLeft: 8 }} value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
          </select>
        )}
      </div>

      {loading && <div className="empty"><div className="empty-text">Generating report...</div></div>}

      {!loading && !report && (
        <div className="empty">
          <div className="empty-icon">📊</div>
          <div className="empty-text">No data found for this period.</div>
        </div>
      )}

      {!loading && report && view === "monthly" && <MonthlyReport report={report} />}
      {!loading && report && view === "yearly" && <YearlyReport report={report} />}
    </div>
  );
}

function MonthlyReport({ report }) {
  return (
    <div>
      {/* Summary stats */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card red">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">{formatCurrency(report.total)}</div>
          <div className="stat-meta">{report.count} transactions</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Daily Avg</div>
          <div className="stat-value">{formatCurrency(report.avgPerDay)}</div>
          <div className="stat-meta">per spending day</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Budget Left</div>
          <div className="stat-value">{formatCurrency(report.budget?.remaining)}</div>
          <div className="stat-meta">of {formatCurrency(report.budget?.total)}</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
        {/* Daily spending line */}
        <div className="card">
          <div className="card-title">Spending Over Month</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={report.byDay} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252540" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => v.slice(8)} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: "#1a1a2e", border: "1px solid #334155", borderRadius: 8 }} />
              <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="card">
          <div className="card-title">Category Breakdown</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={report.byCategory} dataKey="amount" nameKey="category" cx="45%" cy="50%" outerRadius={80} innerRadius={35}>
                {report.byCategory.map((e) => (
                  <Cell key={e.category} fill={CATEGORY_COLORS[e.category] || "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: "#1a1a2e", border: "1px solid #334155", borderRadius: 8 }} />
              <Legend formatter={(v) => <span style={{ fontSize: 11, color: "#94a3b8" }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category table */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Category Details</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "right" }}>% of Total</th>
                <th style={{ width: "30%" }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {report.byCategory.map((c) => (
                <tr key={c.category}>
                  <td>
                    <span className="badge" style={{ borderColor: CATEGORY_COLORS[c.category], color: CATEGORY_COLORS[c.category] }}>
                      {c.category}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{formatCurrency(c.amount)}</td>
                  <td style={{ textAlign: "right", color: "var(--text2)", fontFamily: "var(--font-mono)" }}>{c.percent}%</td>
                  <td>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${c.percent}%`, background: CATEGORY_COLORS[c.category] || "#94a3b8" }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 5 */}
      {report.topExpenses?.length > 0 && (
        <div className="card">
          <div className="card-title">Top 5 Expenses</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Title</th><th>Category</th><th style={{ textAlign: "right" }}>Amount</th></tr>
              </thead>
              <tbody>
                {report.topExpenses.map((e, i) => (
                  <tr key={e.id}>
                    <td style={{ color: "var(--text3)", fontFamily: "var(--font-mono)" }}>{i + 1}</td>
                    <td>{e.title}</td>
                    <td><span className="badge">{e.category}</span></td>
                    <td style={{ textAlign: "right" }}><span className="amount-neg">−{formatCurrency(e.amount)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function YearlyReport({ report }) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = report.byMonth.map((m) => ({ ...m, name: monthNames[m.month - 1] }));

  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card red">
          <div className="stat-label">Total {report.year}</div>
          <div className="stat-value">{formatCurrency(report.total)}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Monthly Avg</div>
          <div className="stat-value">{formatCurrency(report.total / 12)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Peak Month</div>
          <div className="stat-value" style={{ fontSize: 20 }}>
            {monthNames[(chartData.sort((a, b) => b.total - a.total)[0]?.month ?? 1) - 1]}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Monthly Spending — {report.year}</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={[...report.byMonth].map((m) => ({ ...m, name: monthNames[m.month - 1] }))} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252540" />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: "#1a1a2e", border: "1px solid #334155", borderRadius: 8 }} />
            <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2" style={{ gap: 16 }}>
        <div className="card">
          <div className="card-title">Yearly Category Split</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={report.byCategory} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80}>
                {report.byCategory.map((e) => (
                  <Cell key={e.category} fill={CATEGORY_COLORS[e.category] || "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: "#1a1a2e", border: "1px solid #334155", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">Category Totals</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {report.byCategory.slice(0, 6).map((c) => (
              <div key={c.category}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{c.category}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13 }}>{formatCurrency(c.amount)}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(c.amount / report.total * 100).toFixed(0)}%`, background: CATEGORY_COLORS[c.category] || "#94a3b8" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
