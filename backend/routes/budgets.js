const express = require("express");
const router = express.Router();
const { readSingleDoc, writeSingleDoc, readData } = require("../utils/storage");

const FILE = "budgets";
const EXPENSES_FILE = "expenses";

// GET budgets for a month/year  (e.g. ?month=6&year=2026)
router.get("/", (req, res) => {
  const budgets = readSingleDoc(FILE);
  const { month, year } = req.query;

  if (month && year) {
    const key = `${year}-${String(month).padStart(2, "0")}`;
    const monthBudgets = budgets[key] || {};

    // Enrich with actual spending
    const expenses = readData(EXPENSES_FILE).filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month);
    });

    const spending = {};
    expenses.forEach((e) => {
      spending[e.category] = (spending[e.category] || 0) + e.amount;
    });

    const result = Object.entries(monthBudgets).map(([category, limit]) => ({
      category,
      limit,
      spent: parseFloat((spending[category] || 0).toFixed(2)),
      remaining: parseFloat((limit - (spending[category] || 0)).toFixed(2)),
      percentUsed: limit > 0 ? parseFloat(((spending[category] || 0) / limit * 100).toFixed(1)) : 0,
    }));

    return res.json({ key, budgets: result });
  }

  res.json(budgets);
});

// POST set/update budget for a category in a month
router.post("/", (req, res) => {
  const { month, year, category, limit } = req.body;
  if (!month || !year || !category || limit === undefined) {
    return res.status(400).json({ error: "month, year, category, limit are required" });
  }
  if (isNaN(parseFloat(limit)) || parseFloat(limit) < 0) {
    return res.status(400).json({ error: "limit must be a non-negative number" });
  }

  const key = `${year}-${String(month).padStart(2, "0")}`;
  const budgets = readSingleDoc(FILE);
  if (!budgets[key]) budgets[key] = {};
  budgets[key][category] = parseFloat(parseFloat(limit).toFixed(2));
  writeSingleDoc(FILE, budgets);

  res.json({ key, category, limit: budgets[key][category] });
});
// PUT update budget limit for a category in a month
// DELETE a budget category for a month
router.delete("/", (req, res) => {
  const { month, year, category } = req.body;
  const key = `${year}-${String(month).padStart(2, "0")}`;
  const budgets = readSingleDoc(FILE);
  if (!budgets[key] || !budgets[key][category]) {
    return res.status(404).json({ error: "Budget not found" });
  }
  delete budgets[key][category];
  writeSingleDoc(FILE, budgets);
  res.json({ message: "Budget removed" });
});

module.exports = router;
