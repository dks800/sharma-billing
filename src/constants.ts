export const COLLECTIONS = {
  COMPANIES: "companies",
  CLIENTS: "clients",
  INVOICES: "invoices",
  SALES_BILL: "sales",
  PURCHASE_BILL: "purchase",
  QUOTATIONS: "quotations",
  PROFORMAS: "proformas",
  PURCHASEORDERS: "purchaseOrders",
  CHALLANS: "challans",
};
export const GST_OPTIONS = [0, 2.5, 5, 9, 18, 28];
export const UNIT_OPTIONS = [
  "pcs",
  "kg",
  "liters",
  "boxes",
  "meters",
  "set",
  "nos",
];

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",
  SELECTCOMPANYSALES: "/select-company-sales",
  SELECTCOMPANYPURCHASE: "/select-company-purchase",
  SELECTCOMPANYQUOTE: "/select-company-quotation",
  SALES: "/sales",
  PURCHASE: "/purchase",
  CUSTOMERS: "/customers",
  COMPANIES: "/companies",
  ADDSALES: "/add-sales",
  EDITSALES: "/edit-sales",
  ADDPURCHASE: "/add-purchase",
  EDITPURCHASE: "/edit-purchase",
  ADDCUSTOMER: "/add-customer",
  EDITCUSTOMER: "/edit-customer",
};

export const PAYMENT_STATUSES = ["Pending", "Partial", "Paid"];

export const TAX_TYPES = ["2.5", "6", "9", "14", "18", "NA"];

export const globalCurrencies = [
  { code: "INR", name: "Indian Rupee" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "Pound Sterling" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
];
