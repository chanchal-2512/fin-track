const express = require("express");
const cors = require("cors");
const path = require("path");

const expensesRouter = require("./routes/expenses");
const budgetsRouter  = require("./routes/budgets");
const reportsRouter  = require("./routes/reports");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/expenses", expensesRouter);
app.use("/api/budgets",  budgetsRouter);
app.use("/api/reports",  reportsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Serve React build in production ──────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "public");
  app.use(express.static(buildPath));
  // All non-API routes go to React
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Finance Tracker API running on http://localhost:${PORT}`);
});
