const express = require("express");
const router = express.Router();
const { readData, readSingleDoc } = require("../utils/storage");

// GET monthly summary report
router.get("/monthly", (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ error: "month and year required" });

  const allExpenses = readData("expenses");
  const expenses = allExpenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month);
  });

  // Totals by category
  const byCategory = {};
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  // Daily spending
  const byDay = {};
  expenses.forEach((e) => {
    const day = e.date.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + e.amount;
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const avgPerDay = expenses.length > 0 ? total / Object.keys(byDay).length : 0;

  // Budget comparison
  const budgets = readSingleDoc("budgets");
  const key = `${year}-${String(month).padStart(2, "0")}`;
  const monthBudgets = budgets[key] || {};
  const totalBudget = Object.values(monthBudgets).reduce((s, v) => s + v, 0);

  res.json({
    month: parseInt(month),
    year: parseInt(year),
    total: parseFloat(total.toFixed(2)),
    count: expenses.length,
    avgPerDay: parseFloat(avgPerDay.toFixed(2)),
    byCategory: Object.entries(byCategory).map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2)),
      percent: parseFloat((amount / total * 100).toFixed(1)),
    })).sort((a, b) => b.amount - a.amount),
    byDay: Object.entries(byDay).map(([date, amount]) => ({
      date,
      amount: parseFloat(amount.toFixed(2)),
    })).sort((a, b) => a.date.localeCompare(b.date)),
    budget: {
      total: parseFloat(totalBudget.toFixed(2)),
      spent: parseFloat(total.toFixed(2)),
      remaining: parseFloat((totalBudget - total).toFixed(2)),
    },
    topExpenses: [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5),
  });
});

// GET yearly overview
router.get("/yearly", (req, res) => {
  const { year } = req.query;
  if (!year) return res.status(400).json({ error: "year required" });

  const allExpenses = readData("expenses");
  const expenses = allExpenses.filter(
    (e) => new Date(e.date).getFullYear() === parseInt(year)
  );

  const byMonth = {};
  for (let m = 1; m <= 12; m++) {
    byMonth[m] = { month: m, total: 0, count: 0 };
  }
  expenses.forEach((e) => {
    const m = new Date(e.date).getMonth() + 1;
    byMonth[m].total += e.amount;
    byMonth[m].count++;
  });

  const totalYear = expenses.reduce((s, e) => s + e.amount, 0);

  const byCategory = {};
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  res.json({
    year: parseInt(year),
    total: parseFloat(totalYear.toFixed(2)),
    byMonth: Object.values(byMonth).map((m) => ({
      ...m,
      total: parseFloat(m.total.toFixed(2)),
    })),
    byCategory: Object.entries(byCategory).map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2)),
    })).sort((a, b) => b.amount - a.amount),
  });
});

module.exports = router;
