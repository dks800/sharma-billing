import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSalesBill } from "../hooks/useInvoices";
import Loader from "../components/Loader";
import { FiDownload, FiEdit, FiPrinter, FiTrash2 } from "react-icons/fi";
import {
  formatCurrency,
  formatDate,
  formatFinYear,
} from "../utils/commonUtils";
import renderPaymentStatus from "../components/invoices/getPaymentStatus";
import Modal from "../components/common/Modal";
import DeleteSalesBillModal from "../components/invoices/DeleteSalesBillModal";
import { ROUTES } from "../constants";
import { PDFDownloadLink } from "@react-pdf/renderer";
import SalesListPDF from "../components/invoices/SalesListPDF";
import { toast } from "react-toastify";
import SingleBillPDF from "../components/invoices/SingleBillPDF";
import { BsFillPlusCircleFill } from "react-icons/bs";
import EmptyState from "../components/common/EmptyState";

export default function SalesList() {
  const navigate = useNavigate();
  const location = useLocation();
  const companyId = location.state?.companyId;
  const companyName = location.state?.companyName;

  useEffect(() => {
    if (!companyId || !companyName) {
      navigate(ROUTES?.SELECTCOMPANYSALES);
    }
  }, [companyId, navigate]);

  const [search, setSearch] = useState("");
  const [orderByField, setOrderByField] = useState("billNumber");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const {
    data: sales,
    loading,
    error,
    deleteItem,
  } = useSalesBill(companyId || "", {
    orderByField,
    orderDirection,
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

  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;

    const sortedSales = [...filteredSales].sort((a, b) => {
      return Number(b.billNumber) - Number(a.billNumber); // DESC
    });

    return sortedSales.slice(start, start + rowsPerPage);
  }, [filteredSales, currentPage, rowsPerPage]);

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
    if (selectedBill?.taxType === "NA") return "(NA)";
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

  useEffect(() => {
    if (paginatedSales?.length) setSelectedBill(paginatedSales[0] || null);
  }, [paginatedSales]);

  const renderSingleBillPrint = (bill: any) => {
    if (!bill) return null;
    return (
      <PDFDownloadLink
        document={<SingleBillPDF bill={bill} />}
        fileName={`sales_${bill?.billNumber}_${formatFinYear(
          bill?.financialYear
        )}.pdf`}
        className="flex items-center gap-1 text-gray-700 hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          toast.success("PDF download started!");
        }}
      >
        {({ loading }) => {
          return (
            <>
              <FiPrinter className="text-sm" />
              {loading ? "Loading..." : "Print"}
            </>
          );
        }}
      </PDFDownloadLink>
    );
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">Sales Bills - {companyName}</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto justify-between">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
              onClick={() =>
                navigate(ROUTES?.ADDSALES, {
                  state: { companyId, companyName },
                })
              }
            >
              <BsFillPlusCircleFill /> Sales Bill
            </button>
            {sales?.length ? (
              <PDFDownloadLink
                document={<SalesListPDF billList={sales} />}
                fileName="sales_list.pdf"
              >
                {({ loading }) => (
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                    onClick={() => {
                      if (!loading) {
                        toast.success("PDF download started!");
                      }
                    }}
                  >
                    <FiDownload className="text-lg" />
                    {loading ? "Loading..." : "Export List"}
                  </button>
                )}
              </PDFDownloadLink>
            ) : null}
          </div>
          <input
            type="text"
            placeholder="Search invoice, customer, amount, items..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded p-2 w-full sm:w-64"
          />
        </div>
      </div>
      {loading ? (
        <Loader />
      ) : error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : paginatedSales?.length === 0 ? (
        <EmptyState
          title="No sales bills found"
          ctaLabel={"+ Sales Bill"}
          onCta={() =>
            navigate(ROUTES?.ADDSALES, { state: { companyId, companyName } })
          }
        />
      ) : (
        <>
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
                    { label: "Comments", field: "internalComments" },
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
                {paginatedSales?.map((bill) => (
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
                        title="Edit"
                        className="text-blue-500 hover:underline hover:bg-blue-500 hover:text-white rounded px-1 py-1 pt-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(ROUTES?.EDITSALES, {
                            state: { bill, companyId, companyName },
                          });
                        }}
                      >
                        <FiEdit className="inline" />
                      </button>
                      <button
                        title="Delete"
                        className="text-red-500 hover:underline hover:bg-red-500 hover:text-white rounded px-1 py-1 pt-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setShowDetailsModal(false);
                          setSelectedBill(bill);
                          setConfirmDelete(true);
                        }}
                      >
                        <FiTrash2 className="inline" />
                      </button>
                      {/* <button
                        title="Copy"
                        className="text-amber-500 hover:underline hover:bg-amber-500 hover:text-white rounded px-1 py-1 pt-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          navigate(ROUTES?.ADDQUOTE, {
                            state: {
                              copyFrom: bill,
                              companyId,
                              companyName,
                            },
                          });
                        }}
                      >
                        <FiCopy className="inline" />
                      </button> */}
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
                  setShowDetailsModal(true);
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
        <Modal
          title={`Bill #${
            selectedBill.billNumber
          } - ${companyName} (${getFinancialYear(selectedBill.billDate)})`}
          type="info"
          isOpen={showDetailsModal && selectedBill}
          onClose={() => setSelectedBill(null)}
          footer={
            <div className="flex justify-between w-full">
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded border border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    navigate(ROUTES?.EDITSALES, {
                      state: { bill: selectedBill, companyId, companyName },
                    });
                    setSelectedBill(null);
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-2 rounded border border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </button>
                {renderSingleBillPrint(selectedBill)}
              </div>

              <div>
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                  onClick={() => setSelectedBill(null)}
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
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
            <p className="flex gap-2 items-center">
              <p className="flex items-center gap-2">
                <span className="font-medium">Status:</span>{" "}
                {renderPaymentStatus(selectedBill.paymentStatus)}
              </p>
            </p>
            <p>
              <span className="font-medium">Currency:</span>{" "}
              {renderPaymentStatus(selectedBill.currency)}
            </p>
            <p>
              <span className="font-medium">Eway Bill:</span>{" "}
              {selectedBill.ewayBillNo}
            </p>

            <p className="sm:col-span-2">
              <span className="font-medium">Internal Comments:</span>{" "}
              {selectedBill.internalComments || "-"}
            </p>
            <p className="sm:col-span-2">
              <span className="font-medium">External Comments:</span>{" "}
              {selectedBill.externalComments || "-"}
            </p>

            {/* Bill Summary */}
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
                {selectedBill.roundUp ? (
                  <div className="flex justify-between">
                    <span className="font-medium">Round Up:</span>
                    <span>{formatCurrency(selectedBill.roundUp)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t py-2 bg-green-50 rounded text-green-800 font-semibold">
                  <span>Grand Total:</span>
                  <span>{`${formatCurrency(selectedBill.totalAmount)} (${
                    selectedBill?.currency
                  })`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="mt-4">
            <h3 className="text-base font-semibold mb-2">Items</h3>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2 text-left">#</th>
                    <th className="border px-3 py-2 text-left">Description</th>
                    <th className="border px-3 py-2 text-right">Qty</th>
                    <th className="border px-3 py-2 text-right">Rate</th>
                    <th className="border px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="border px-3 py-2">
                        {item?.qty && item?.rate ? idx + 1 : ""}
                      </td>
                      <td
                        className={`border px-3 py-2 ${
                          !item?.qty && !item?.rate ? "italic py-0" : ""
                        }`}
                      >
                        {item.description}
                      </td>
                      <td className="border px-3 py-2 text-right">
                        {item.qty ? Number(item.qty) : ""}
                      </td>
                      <td className="border px-3 py-2 text-right">
                        {item.rate ? formatCurrency(item.rate) : ""}
                      </td>
                      <td className="border px-3 py-2 text-right">
                        {item.qty && item.rate
                          ? formatCurrency(Number(item.qty) * Number(item.rate))
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Accordion */}
            <div className="sm:hidden space-y-2">
              {selectedBill.items
                ?.filter((i: any) => i?.description)
                ?.map((item: any, idx: number) => (
                  <details
                    key={idx}
                    className="border rounded-lg p-3 shadow-sm bg-white"
                  >
                    <summary className="font-medium cursor-pointer">
                      {idx + 1}. {item.description}
                    </summary>
                    <div className="mt-2 text-sm space-y-1">
                      <p>
                        <span className="font-medium">Qty:</span> {item.qty}
                      </p>
                      <p>
                        <span className="font-medium">Rate:</span>{" "}
                        {formatCurrency(item.rate)}
                      </p>
                      <p>
                        <span className="font-medium">Total:</span>{" "}
                        {formatCurrency(item.qty * item.rate)}
                      </p>
                    </div>
                  </details>
                ))}
            </div>
          </div>
        </Modal>
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
