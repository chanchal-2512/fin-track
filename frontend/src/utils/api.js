const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// Expenses
export const getExpenses = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/expenses${q ? "?" + q : ""}`);
};
export const addExpense = (data) => request("/expenses", { method: "POST", body: JSON.stringify(data) });
export const updateExpense = (id, data) => request(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteExpense = (id) => request(`/expenses/${id}`, { method: "DELETE" });
export const getCategories = () => request("/expenses/meta/categories");

// Budgets
export const getBudgets = (params) => {
  const q = new URLSearchParams(params).toString();
  return request(`/budgets?${q}`);
};
export const setBudget = (data) => request("/budgets", { method: "POST", body: JSON.stringify(data) });
export const deleteBudget = (data) => request("/budgets", { method: "DELETE", body: JSON.stringify(data) });

// Reports
export const getMonthlyReport = (month, year) =>
  request(`/reports/monthly?month=${month}&year=${year}`);
export const getYearlyReport = (year) =>
  request(`/reports/yearly?year=${year}`);
