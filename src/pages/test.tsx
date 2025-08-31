import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSalesBill } from "../hooks/useInvoices";
import Loader from "../components/Loader";
import { FiPlus } from "react-icons/fi";
import { formatCurrency, formatDate } from "../utils/commonUtils";

export default function SalesList() {
  const navigate = useNavigate();
  const location = useLocation();
  const companyId = location.state?.companyId;
  const companyName = location.state?.companyName;

  // Redirect if no company selected
  useEffect(() => {
    if (!companyId) {
      navigate("/select-company-sales");
    }
  }, [companyId, navigate]);
  console.log("location.state --->", location.state);

  const [search, setSearch] = useState("");
  const [orderByField, setOrderByField] = useState("billNumber");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState(10);

  const {
    data: sales,
    loading,
    error,
    deleteItem,
  } = useSalesBill(companyId || "", {
    orderByField,
    orderDirection,
    limit,
  });

  const [selectedBill, setSelectedBill] = useState<any | null>(null);

  const filteredSales = useMemo(() => {
    if (!sales || !sales?.length) return [];
    return sales.filter((bill: any) =>
      [
        bill.billNumber,
        bill.customerName,
        bill.customerPhone,
        bill.totalAmount?.toString(),
        bill.items?.map((i: any) => i.name).join(" "),
      ]
        .filter(Boolean)
        .some((field) =>
          String(field)?.toLowerCase()?.includes(search?.toLowerCase())
        )
    );
  }, [sales, search]);
  console.log("sales --->>", sales);

  const handleSortChange = (field: string) => {
    if (orderByField === field) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
    } else {
      setOrderByField(field);
      setOrderDirection("asc");
    }
  };

  // Helper: Get FY from bill date
  const getFinancialYear = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    let year = d.getFullYear();
    let fyStart = d.getMonth() + 1 <= 3 ? year - 1 : year;
    let fyEnd = fyStart + 1;
    return `${fyStart}-${fyEnd.toString().slice(-2)}`;
  };

  // Helper: Render Payment Status with styles + icon
  const renderPaymentStatus = (status: string) => {
    if (!status) return "-";
    const baseClass =
      "inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium";
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <span className={`${baseClass} bg-green-100 text-green-700`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Paid
          </span>
        );
      case "partially paid":
        return (
          <span className={`${baseClass} bg-yellow-100 text-yellow-700`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M12 5a7 7 0 110 14a7 7 0 010-14z"
              />
            </svg>
            Partially Paid
          </span>
        );
      case "pending":
        return (
          <span className={`${baseClass} bg-red-100 text-red-700`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Pending
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">Sales Bills - {companyName}</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
            onClick={() =>
              navigate("/add-sales", { state: { companyId, companyName } })
            }
          >
            <FiPlus /> Add Sales Bill
          </button>
          <input
            type="text"
            placeholder="Search invoice, customer, amount, items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded p-2 w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : filteredSales.length === 0 ? (
        <p className="text-gray-500">No sales bills found</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    { label: "Bill No", field: "billNumber" },
                    { label: "FY", field: "fy" },
                    { label: "Date", field: "date" },
                    { label: "Customer", field: "customerName" },
                    { label: "Amount", field: "totalAmount" },
                    { label: "Payment Status", field: "paymentStatus" },
                    { label: "Comments", field: "comments" },
                  ].map((col) => (
                    <th
                      key={col.field}
                      onClick={() =>
                        col.field !== "fy" && handleSortChange(col.field)
                      }
                      className="px-4 py-2 text-left cursor-pointer"
                    >
                      {col.label}{" "}
                      {orderByField === col.field &&
                        (orderDirection === "asc" ? "▲" : "▼")}
                    </th>
                  ))}
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((bill) => (
                  <tr
                    key={bill.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedBill(bill)}
                  >
                    <td className="px-4 py-2">{bill?.billNumber}</td>
                    <td className="px-4 py-2">
                      {getFinancialYear(bill?.billDate)}
                    </td>
                    <td className="px-4 py-2">{formatDate(bill?.billDate)}</td>
                    <td className="px-4 py-2">{bill?.customerName}</td>
                    <td className="px-4 py-2">
                      {formatCurrency(bill.totalAmount)}
                    </td>
                    <td className="px-4 py-2">
                      {renderPaymentStatus(bill.paymentStatus)}
                    </td>
                    <td className="px-4 py-2 max-w-[200px] truncate">
                      {bill.comments || "-"}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/edit-sales-bill", {
                            state: { bill, companyId },
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(bill.id);
                        }}
                      >
                        Delete
                      </button>
                      <button
                        className="text-gray-700 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Print {/* placeholder */}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {filteredSales.map((bill) => (
              <div
                key={bill.id}
                className="bg-white rounded shadow p-3 cursor-pointer"
                onClick={() => setSelectedBill(bill)}
              >
                <div className="flex justify-between text-sm font-semibold">
                  <span>Bill #{bill.billNumber}</span>
                  <span>{formatDate(bill.billDate)}</span>
                </div>
                <div className="mt-1 text-gray-700">
                  <p>{bill.customerName}</p>
                  <p className="text-sm text-gray-500">
                    FY: {getFinancialYear(bill.billDate)}
                  </p>
                  <p className="font-bold mt-1">
                    {formatCurrency(bill.totalAmount)}
                  </p>
                  <div className="mt-1">
                    {renderPaymentStatus(bill.paymentStatus)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal (shared for desktop + mobile) */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-11/12 max-w-md">
            <h2 className="text-lg font-bold mb-2">
              Bill #{selectedBill.billNumber}
            </h2>
            <p>Date: {formatDate(selectedBill.billDate)}</p>
            <p>FY: {getFinancialYear(selectedBill.billDate)}</p>
            <p>Customer: {selectedBill.customerName}</p>
            <p>Phone: {selectedBill.customerPhone || "-"}</p>
            <p>GSTIN: {selectedBill.gstin || "-"}</p>
            <p>Amount: {formatCurrency(selectedBill.totalAmount)}</p>
            <p>Status: {renderPaymentStatus(selectedBill.paymentStatus)}</p>
            <p>Comments: {selectedBill.comments || "-"}</p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="text-blue-500"
                onClick={() => {
                  navigate("/edit-sales-bill", {
                    state: { bill: selectedBill, companyId },
                  });
                  setSelectedBill(null);
                }}
              >
                Edit
              </button>
              <button
                className="text-red-500"
                onClick={() => {
                  deleteItem(selectedBill.id);
                  setSelectedBill(null);
                }}
              >
                Delete
              </button>
              <button className="text-gray-700">Print</button>
              <button
                className="bg-gray-200 px-3 py-1 rounded"
                onClick={() => setSelectedBill(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
