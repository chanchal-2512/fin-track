const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { readData, writeData } = require("../utils/storage");

const FILE = "expenses";

// GET all expenses (optional filters: month, year, category)
router.get("/", (req, res) => {
  let expenses = readData(FILE);
  const { month, year, category } = req.query;

  if (year) {
    expenses = expenses.filter((e) => new Date(e.date).getFullYear() === parseInt(year));
  }
  if (month) {
    expenses = expenses.filter((e) => new Date(e.date).getMonth() + 1 === parseInt(month));
  }
  if (category) {
    expenses = expenses.filter((e) => e.category === category);
  }

  // Sort newest first
  expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(expenses);
});

// POST add expense
router.post("/", (req, res) => {
  const { title, amount, category, date, note } = req.body;

  if (!title || !amount || !category || !date) {
    return res.status(400).json({ error: "title, amount, category, date are required" });
  }
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  const expense = {
    id: uuidv4(),
    title: title.trim(),
    amount: parseFloat(parseFloat(amount).toFixed(2)),
    category: category.trim(),
    date,
    note: note ? note.trim() : "",
    createdAt: new Date().toISOString(),
  };

  const expenses = readData(FILE);
  expenses.push(expense);
  writeData(FILE, expenses);

  res.status(201).json(expense);
});

// PUT update expense
router.put("/:id", (req, res) => {
  const expenses = readData(FILE);
  const idx = expenses.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Expense not found" });

  const { title, amount, category, date, note } = req.body;
  expenses[idx] = {
    ...expenses[idx],
    title: title ?? expenses[idx].title,
    amount: amount !== undefined ? parseFloat(parseFloat(amount).toFixed(2)) : expenses[idx].amount,
    category: category ?? expenses[idx].category,
    date: date ?? expenses[idx].date,
    note: note !== undefined ? note : expenses[idx].note,
    updatedAt: new Date().toISOString(),
  };

  writeData(FILE, expenses);
  res.json(expenses[idx]);
});

// DELETE expense
router.delete("/:id", (req, res) => {
  let expenses = readData(FILE);
  const before = expenses.length;
  expenses = expenses.filter((e) => e.id !== req.params.id);
  if (expenses.length === before) return res.status(404).json({ error: "Expense not found" });
  writeData(FILE, expenses);
  res.json({ message: "Deleted successfully" });
});

// GET categories
router.get("/meta/categories", (req, res) => {
  const expenses = readData(FILE);
  const cats = [...new Set(expenses.map((e) => e.category))];
  res.json(cats);
});

module.exports = router;
