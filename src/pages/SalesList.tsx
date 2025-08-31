import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSalesBill } from "../hooks/useInvoices";
import Loader from "../components/Loader";
import { FiPlus } from "react-icons/fi";
import { formatCurrency, formatDate } from "../utils/commonUtils";
import renderPaymentStatus from "../components/invoices/getPaymentStatus";
import Modal from "../components/common/Modal";
import DeleteSalesBillModal from "../components/invoices/DeleteSalesBillModal";

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

  const [search, setSearch] = useState("");
  const [orderByField, setOrderByField] = useState("billNumber");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState(50); // fetching bigger chunk, paginate client-side

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
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

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

  const handleSortChange = (field: string) => {
    if (orderByField === field) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
    } else {
      setOrderByField(field);
      setOrderDirection("asc");
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredSales.slice(start, start + rowsPerPage);
  }, [filteredSales, currentPage]);

  const totalPages = Math.ceil(filteredSales.length / rowsPerPage);

  // Helper: Get FY from bill date
  const getFinancialYear = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    let year = d.getFullYear();
    let fyStart = d.getMonth() + 1 <= 3 ? year - 1 : year;
    let fyEnd = fyStart + 1;
    return `${fyStart}-${fyEnd.toString().slice(-2)}`;
  };

  const getTaxType = () => {
    if (selectedBill?.taxType !== "18") {
      return `(${selectedBill?.taxType} + ${selectedBill?.taxType})%`;
    }
    return `(${selectedBill?.taxType})%`;
  };

  const handleConfirmDelete = () => {
    deleteItem(selectedBill.id);
  };

  const getDeleteFooter = () => {
    return (
      <div className="grid grid-cols-2 sm:flex justify-center gap-3 mt-4">
        <button
          className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          onClick={() => setConfirmDelete(false)}
        >
          Close
        </button>
        <button
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition shadow-sm"
          onClick={handleConfirmDelete}
          disabled={!selectedBill?.billNumber}
        >
          Confirm Delete
        </button>
      </div>
    );
  };

  console.log("selectedBill -->", selectedBill);

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
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // reset to first page on new search
            }}
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
                {paginatedSales.map((bill) => (
                  <tr
                    key={bill.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => {
                      if ((e?.currentTarget as any)?.type) return;
                      setShowDetailsModal(true);
                      setSelectedBill(bill);
                    }}
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
                          e.preventDefault();
                          setShowDetailsModal(false);
                          setSelectedBill(bill);
                          setConfirmDelete(true);
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
            {paginatedSales.map((bill) => (
              <div
                key={bill.id}
                className="bg-white rounded shadow p-3 cursor-pointer"
                onClick={() => {
                  setShowDetailModal(true);
                  setSelectedBill(bill);
                }}
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

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal (shared for desktop + mobile) */}

      {showDetailsModal && selectedBill && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 transition-opacity duration-300"
            onClick={() => setSelectedBill(null)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 rounded-2xl">
            <div
              className="bg-white rounded-lg shadow-lg p-4 w-11/12 max-w-md sm:max-w-2xl transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fadeInScale"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <h2 className="text-lg font-bold mb-4">
                Bill #{selectedBill.billNumber} - {companyName} - (
                {getFinancialYear(selectedBill.billDate)})
              </h2>

              {/* Content Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(selectedBill.billDate)}
                </p>
                <p>
                  <span className="font-medium">Customer:</span>{" "}
                  {selectedBill.customerName}
                </p>
                <p>
                  <span className="font-medium">GSTIN:</span>{" "}
                  {selectedBill.customerGSTIN || "-"}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {selectedBill.customerPhone || "-"}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {renderPaymentStatus(selectedBill.paymentStatus)}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-medium">Comments:</span>{" "}
                  {selectedBill.comments || "-"}
                </p>
                <div className="sm:col-span-2 bg-gray-50 rounded-lg mt-2 shadow-sm">
                  <h3 className="text-base font-semibold mb-2">Bill Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Sub Total:</span>
                      <span>{formatCurrency(selectedBill.totalBeforeTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tax {getTaxType()}:</span>
                      <span>{formatCurrency(selectedBill.totalGST)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 bg-green-50 rounded text-green-800 font-semibold">
                      <span>Grand Total:</span>
                      <span>{formatCurrency(selectedBill.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="grid grid-cols-2 sm:flex sm:justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded border border-blue-500 text-blue-600 hover:bg-blue-50"
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
                  className="px-4 py-2 rounded border border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setConfirmDelete(true);
                  }}
                >
                  Delete
                </button>
                <button className="px-4 py-2 rounded border border-gray-500 text-gray-700 hover:bg-gray-100">
                  Print
                </button>
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                  onClick={() => setSelectedBill(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {confirmDelete && (
        <DeleteSalesBillModal
          isOpen={confirmDelete}
          footerContent={getDeleteFooter()}
          selectedBill={selectedBill}
          setConfirmDelete={setConfirmDelete}
        />
      )}
    </div>
  );
}
