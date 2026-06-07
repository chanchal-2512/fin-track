export const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Utilities",
  "Education",
  "Travel",
  "Rent",
  "Savings",
  "Other",
];

export const CATEGORY_COLORS = {
  "Food & Dining": "#f97316",
  "Transport": "#3b82f6",
  "Shopping": "#8b5cf6",
  "Entertainment": "#ec4899",
  "Health": "#10b981",
  "Utilities": "#f59e0b",
  "Education": "#06b6d4",
  "Travel": "#84cc16",
  "Rent": "#ef4444",
  "Savings": "#22c55e",
  "Other": "#94a3b8",
};

export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val || 0);

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};
