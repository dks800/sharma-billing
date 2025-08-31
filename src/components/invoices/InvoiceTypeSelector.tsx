// src/pages/InvoiceTypeSelector.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function InvoiceTypeSelector() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
      <h1 className="text-3xl font-semibold">Select Invoice Type</h1>
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/invoices/sales")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow"
        >
          Sales Bill
        </button>
        <button
          onClick={() => navigate("/invoices/purchase")}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 shadow"
        >
          Purchase Bill
        </button>
      </div>
    </div>
  );
}
