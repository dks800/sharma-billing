// src/pages/InvoiceList.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AddInvoiceForm from "../components/invoices/AddInvoiceForm";
import Loader from "../components/Loader";
import Modal from "../components/common/Modal";
import { FiTrash2 } from "react-icons/fi";
import {
  AiOutlineCheckCircle,
  AiOutlineArrowUp,
  AiOutlineArrowDown,
} from "react-icons/ai";
import { useSalesBill, usePurchaseBill } from "../hooks/useInvoices";

const PAGE_LIMIT = 10;

export default function InvoiceList() {
  const { type } = useParams<{ type: string }>();
  const companyId = ""; // TODO: Replace with selected companyId from context/state

  const initialFilters = {
    companyId: "",
    startDate: "",
    endDate: "",
    searchText: "",
    financialYear: "",
  };
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [showFilter, setShowFilter] = useState(false);

  // Sorting
  const [orderByField, setOrderByField] = useState<keyof any>("date");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");

  // Pagination
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [prevStack, setPrevStack] = useState<any[]>([]);

  // Select hook: sales fallback
  const invoiceHook =
    type === "purchase"
      ? usePurchaseBill(companyId, {
          orderByField,
          orderDirection,
          limit: PAGE_LIMIT,
          startAfterDoc: lastDoc,
          financialYear: appliedFilters.financialYear || undefined,
          companyId: appliedFilters.companyId || undefined,
          dateRange:
            appliedFilters.startDate && appliedFilters.endDate
              ? {
                  start: new Date(appliedFilters.startDate),
                  end: new Date(appliedFilters.endDate),
                }
              : undefined,
        })
      : useSalesBill(companyId, {
          orderByField,
          orderDirection,
          limit: PAGE_LIMIT,
          startAfterDoc: lastDoc,
          financialYear: appliedFilters.financialYear || undefined,
          companyId: appliedFilters.companyId || undefined,
          dateRange:
            appliedFilters.startDate && appliedFilters.endDate
              ? {
                  start: new Date(appliedFilters.startDate),
                  end: new Date(appliedFilters.endDate),
                }
              : undefined,
        });

  const { data: invoices, loading, error, addItem, deleteItem } = invoiceHook;

  // Update lastDoc for pagination
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      setLastDoc(invoices[invoices.length - 1].docSnapshot || null);
    }
  }, [invoices]);

  // Form toggle
  const [showForm, setShowForm] = useState(false);

  // Filtered by search text
  const filteredInvoices = invoices.filter((inv) => {
    if (!filters.searchText) return true;
    const text = filters.searchText.toLowerCase();
    return (
      inv.id?.toLowerCase().includes(text) ||
      inv.clientGst?.toLowerCase().includes(text) ||
      inv.clientName?.toLowerCase().includes(text)
    );
  });

  // Sort toggle
  const toggleSort = (field: keyof any) => {
    if (orderByField === field) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
    } else {
      setOrderByField(field);
      setOrderDirection("asc");
    }
    // Reset pagination
    setLastDoc(null);
    setPrevStack([]);
  };

  // Pagination handlers
  const nextPage = () => {
    if (lastDoc) {
      setPrevStack((prev) => [...prev, lastDoc]);
      setLastDoc(invoices[invoices.length - 1]?.docSnapshot);
    }
  };
  const prevPage = () => {
    if (prevStack.length === 0) return;
    const newStack = [...prevStack];
    const prevDoc = newStack.pop()!;
    setPrevStack(newStack);
    setLastDoc(prevDoc);
  };

  // Filters
  const resetFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setLastDoc(null);
    setPrevStack([]);
  };

  const FooterButtons = () => (
    <div className="flex gap-2">
      <button
        onClick={() => setShowFilter(false)}
        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        Close
      </button>
      <button
        onClick={() => {
          setAppliedFilters(filters);
          setShowFilter(false);
          setLastDoc(null);
          setPrevStack([]);
        }}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Apply
      </button>
    </div>
  );

  if (loading) return <Loader />;
  if (error)
    return (
      <p className="text-red-600">Error: {error?.toString() || "Error"}</p>
    );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-3xl font-semibold">
          {type === "purchase" ? "Purchase Bills" : "Sales Bills"}
        </h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <AiOutlineCheckCircle />
            New {type === "purchase" ? "Purchase" : "Sales"} Bill
          </button>
          <button
            onClick={() => setShowFilter(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Filters
          </button>
          {Object.values(appliedFilters).some(Boolean) && (
            <button
              onClick={resetFilters}
              className="font-medium text-red-500 hover:underline"
            >
              <div className="flex items-center gap-2">
                <FiTrash2 />
                Clear Filters
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Add Invoice Form */}
      <AddInvoiceForm
        onClose={() => setShowForm(false)}
        isOpen={showForm}
        isPurchase={type === "purchase"}
        onSaved={() => setShowForm(false)}
      />

      {/* Filter Modal */}
      <Modal
        isOpen={showFilter}
        size="md"
        title="Apply Filters"
        onClose={() => setShowFilter(false)}
        footer={<FooterButtons />}
      >
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Search Invoice #, Client GSTIN, Name ..."
            className="border p-2 rounded"
            value={filters.searchText}
            onChange={(e) =>
              setFilters((f) => ({ ...f, searchText: e.target.value }))
            }
          />
          <label className="flex flex-col">
            Start Date:
            <input
              type="date"
              className="border p-2 rounded"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDate: e.target.value }))
              }
            />
          </label>
          <label className="flex flex-col">
            End Date:
            <input
              type="date"
              className="border p-2 rounded"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, endDate: e.target.value }))
              }
            />
          </label>
          <label className="flex flex-col">
            Financial Year:
            <input
              type="text"
              placeholder="e.g. 2024-2025"
              className="border p-2 rounded"
              value={filters.financialYear}
              onChange={(e) =>
                setFilters((f) => ({ ...f, financialYear: e.target.value }))
              }
            />
          </label>
        </div>
      </Modal>

      {/* Invoice Table */}
      <table className="w-full border border-gray-300 table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th
              className="border p-2 cursor-pointer"
              onClick={() => toggleSort("id")}
            >
              Invoice ID{" "}
              {orderByField === "id" &&
                (orderDirection === "asc" ? (
                  <AiOutlineArrowUp className="inline" />
                ) : (
                  <AiOutlineArrowDown className="inline" />
                ))}
            </th>
            <th
              className="border p-2 cursor-pointer"
              onClick={() => toggleSort("companyName")}
            >
              Company{" "}
              {orderByField === "companyName" &&
                (orderDirection === "asc" ? (
                  <AiOutlineArrowUp className="inline" />
                ) : (
                  <AiOutlineArrowDown className="inline" />
                ))}
            </th>
            <th
              className="border p-2 cursor-pointer"
              onClick={() => toggleSort("date")}
            >
              Date{" "}
              {orderByField === "date" &&
                (orderDirection === "asc" ? (
                  <AiOutlineArrowUp className="inline" />
                ) : (
                  <AiOutlineArrowDown className="inline" />
                ))}
            </th>
            <th
              className="border p-2 text-right cursor-pointer"
              onClick={() => toggleSort("total")}
            >
              Total{" "}
              {orderByField === "total" &&
                (orderDirection === "asc" ? (
                  <AiOutlineArrowUp className="inline" />
                ) : (
                  <AiOutlineArrowDown className="inline" />
                ))}
            </th>
            <th className="border p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4">
                No invoices found.
              </td>
            </tr>
          )}
          {filteredInvoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="border p-2">{invoice.id}</td>
              <td className="border p-2">
                {invoice.companyName || invoice.companyId}
              </td>
              <td className="border p-2">
                {new Date(invoice.date).toLocaleDateString()}
              </td>
              <td className="border p-2 text-right">
                ₹{invoice.total?.toFixed(2)}
              </td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => {
                    if (confirm("Are you sure to delete this invoice?")) {
                      deleteItem(invoice.id!);
                    }
                  }}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={prevPage}
          disabled={prevStack.length === 0}
          className={`px-4 py-2 rounded ${
            prevStack.length === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Previous
        </button>
        <button
          onClick={nextPage}
          disabled={invoices.length < PAGE_LIMIT}
          className={`px-4 py-2 rounded ${
            invoices.length < PAGE_LIMIT
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
