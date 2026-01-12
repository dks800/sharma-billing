import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuotations } from "../hooks/useInvoices";
import Loader from "../components/Loader";
import {
  FiCopy,
  FiDownload,
  FiEdit,
  FiPrinter,
  FiTrash2,
} from "react-icons/fi";
import { formatCurrency, formatDate } from "../utils/commonUtils";
import renderPaymentStatus from "../components/invoices/getPaymentStatus";
import Modal from "../components/common/Modal";
import DeleteSalesBillModal from "../components/invoices/DeleteSalesBillModal";
import { ROUTES } from "../constants";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { BsFillPlusCircleFill } from "react-icons/bs";
import EmptyState from "../components/common/EmptyState";
import SingleQuotationPDF from "../components/quotations/SingleQuotationPDF";
import { useCompanyById } from "../hooks/useCompanyById";
import { useClientById } from "../hooks/useClientById";
import QuotationListPDF from "../components/quotations/QuotationListPDF";

export default function QuotationList() {
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
  const [orderByField, setOrderByField] = useState("quoteNumber");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;
  const {
    data: quotationList,
    loading,
    error,
    deleteItem,
  } = useQuotations(companyId || "", {
    orderByField,
    orderDirection,
  });

  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [printGst, setPrintGst] = useState<boolean>(true);
  const [printBill, setPrintBill] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const { company } = useCompanyById(companyId || "");
  const { client } = useClientById(selectedBill?.customerGSTIN || "");

  const filteredSales = useMemo(() => {
    if (!quotationList || !quotationList?.length) return [];
    return quotationList.filter((bill: any) =>
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
  }, [quotationList, search]);

  useEffect(() => {
    if (showDetailsModal && selectedBill) {
      setPrintBill(structuredClone(selectedBill));
    } else {
      setPrintBill(null);
    }
  }, [showDetailsModal, selectedBill]);

  const handleSortChange = (field: string) => {
    if (orderByField === field) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
    } else {
      setOrderByField(field);
      setOrderDirection("asc");
    }
  };

  const mapBillData = (data: any) => {
    if (!data) return null;
    return {
      billNumber: data?.quoteNumber,
      billDate: data?.quoteDate,
      customerName: data?.customerName,
      totalAmount: data?.totalAmount,
      title: data?.title,
    };
  };

  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredSales.slice(start, start + rowsPerPage);
  }, [filteredSales, currentPage]);

  const totalPages = Math.ceil(filteredSales.length / rowsPerPage);

  const getTaxType = () => {
    if (selectedBill?.taxType === "NA") return "(NA)";
    if (selectedBill?.taxType !== "18") {
      return `(${selectedBill?.taxType} + ${selectedBill?.taxType})%`;
    }
    return `(${selectedBill?.taxType})%`;
  };

  // const handleConfirmDelete = async () => {
  //   if (!selectedBill?.id) return;
  //   await deleteItem(selectedBill.id);
  //   setConfirmDelete(false);
  //   setShowDetailsModal(false);
  //   setTimeout(() => {
  //     setSelectedBill(null);
  //   }, 500);
  // };

  const handleConfirmDelete = async () => {
    if (!selectedBill?.id) return;

    setIsDeleting(true);

    // 🔥 CLOSE UI FIRST (prevents render)
    setShowDetailsModal(false);
    setSelectedBill(null);

    // 🔥 WAIT for UI to unmount
    await new Promise((r) => setTimeout(r, 0));

    // 🔥 THEN delete
    await deleteItem(selectedBill.id);

    setConfirmDelete(false);
    setIsDeleting(false);
  };

  const getDeleteFooter = () => {
    return (
      <div className="grid grid-cols-2 sm:flex justify-center gap-3 mt-4">
        <button
          className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          onClick={() => {
            setConfirmDelete(false);
            if (selectedBill) setShowDetailsModal(true);
          }}
        >
          Close
        </button>
        <button
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition shadow-sm"
          onClick={handleConfirmDelete}
          disabled={!selectedBill?.quoteNumber}
        >
          Confirm Delete
        </button>
      </div>
    );
  };

  const renderSingleBillPrint = () => {
    if (!printBill || !printBill?.quoteNumber) return null;
    return (
      <PDFDownloadLink
        document={
          <SingleQuotationPDF
            data={preparedPrintData}
            calculateGst={printGst}
          />
        }
        fileName={`quote#${printBill?.quoteNumber}-${printBill?.customerName}-${printBill?.title}.pdf`}
        className="flex gap-2 items-center px-4 py-2 rounded border border-green-500 text-green-600 hover:bg-green-50"
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

  const prepareBillForPrint = (bill: any, maxRows = 23) => {
    if (!bill) return null;

    const items = [...(bill.items || [])];

    const emptyRows = Math.max(0, maxRows - items.length);

    for (let i = 0; i < emptyRows; i++) {
      items.push({
        description: "",
        hsnCode: "",
        qty: "",
        rate: "",
        unit: "",
      });
    }

    return {
      ...bill,
      items,
    };
  };

  const preparedPrintData = useMemo(() => {
    if (!printBill || !company || !client) return null;

    return {
      billData: prepareBillForPrint(printBill, 23),
      selectedCompany: company,
      selectedClient: client,
    };
  }, [printBill, company, client]);

  const printableQuotationList = useMemo(() => {
    if (!quotationList || !company) return [];
    return quotationList.map((quote: any) => ({
      quoteNumber: quote?.quoteNumber,
      date: formatDate(quote?.quoteDate),
      currency: quote?.currency,
      customerName: quote?.customerName,
      totalBeforeTax: formatCurrency(quote?.totalBeforeTax),
      totalGST: formatCurrency(quote?.totalGST),
      totalAmount: formatCurrency(quote?.totalAmount),
      companyName: quote?.companyName,
      title: quote?.title,
    }));
  }, [quotationList, company]);

  return (
    <div className="p-4">
      {/* {quotationList?.length && (
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <QuotationListPDF list={printableQuotationList} />
        </PDFViewer>
      )} */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">Quotations - {companyName}</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto justify-between">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
              onClick={() =>
                navigate(ROUTES?.ADDQUOTE, {
                  state: { companyId, companyName },
                })
              }
            >
              <BsFillPlusCircleFill /> Quotation
            </button>
            {quotationList?.length ? (
              <PDFDownloadLink
                document={<QuotationListPDF list={printableQuotationList} />}
                fileName="quoteList.pdf"
              >
                {({ loading }) => (
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
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
      ) : filteredSales.length === 0 ? (
        <EmptyState
          title="No quotes found"
          ctaLabel={"+ Quotation"}
          onCta={() =>
            navigate(ROUTES?.ADDQUOTE, { state: { companyId, companyName } })
          }
        />
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    { label: "Sr#", field: "quoteNumber" },
                    { label: "Date", field: "quoteDate" },
                    { label: "Customer", field: "customerName" },
                    { label: "Title", field: "title" },
                    { label: "Amount", field: "totalAmount" },
                  ].map((col) => (
                    <th
                      key={col.field}
                      onClick={() => handleSortChange(col.field)}
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
                      setPrintGst(true);
                      setSelectedBill(bill);
                    }}
                  >
                    <td className="px-4 py-2">{bill?.quoteNumber}</td>
                    <td className="px-4 py-2">{formatDate(bill?.quoteDate)}</td>
                    <td className="px-4 py-2">{bill?.customerName}</td>
                    <td className="px-4 py-2">{bill?.title}</td>
                    <td className="px-4 py-2">
                      {formatCurrency(bill.totalAmount)}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        title="Edit"
                        className="text-blue-500 hover:underline hover:bg-blue-500 hover:text-white rounded px-1 py-1 pt-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(ROUTES?.EDITQUOTE, {
                            state: { quotation: bill, companyId, companyName },
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
                          setConfirmDelete(false);
                          setShowDetailsModal(false);
                          setSelectedBill(bill);
                          // setItemForDelete(bill?.id);
                          setConfirmDelete(true);
                        }}
                      >
                        <FiTrash2 className="inline" />
                      </button>
                      <button
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
                  setShowDetailsModal(true);
                  setSelectedBill(bill);
                }}
              >
                <div className="flex justify-between text-sm font-semibold">
                  <span>Quote #{bill.quoteNumber}</span>
                  <span>{formatDate(bill.quoteDate)}</span>
                </div>
                <div className="mt-1 text-gray-700">
                  <p>{bill?.title}</p>
                  <div className="flex items-center gap-2">
                    <span>{bill.customerName}</span>
                    <span className="font-bold mt-1">
                      {formatCurrency(bill.totalAmount)}
                    </span>
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
      {!isDeleting && showDetailsModal && selectedBill && (
        <Modal
          title={`Quote#${selectedBill.quoteNumber} - ${companyName}`}
          type="info"
          isOpen={showDetailsModal && selectedBill}
          onClose={() => {
            setSelectedBill(null);
            setConfirmDelete(false);
            setShowDetailsModal(false);
          }}
          footer={
            <div className="flex justify-between w-full flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded border border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    navigate(ROUTES?.EDITQUOTE, {
                      state: {
                        quotation: selectedBill,
                        companyId,
                        companyName,
                      },
                    });
                    setSelectedBill(null);
                    setShowDetailsModal(false);
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-2 rounded border border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setConfirmDelete(true);
                    // setItemForDelete(selectedBill?.id);
                    setShowDetailsModal(false);
                  }}
                >
                  Delete
                </button>
                {selectedBill?.id ? (
                  <div className="flex items-center gap-4">
                    {printBill && !isDeleting ? renderSingleBillPrint() : null}

                    {/* GST Toggle */}
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <span className="text-sm font-medium text-gray-700">
                        Print GST
                      </span>

                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={printGst}
                          onChange={() => setPrintGst(!printGst)}
                          className="sr-only peer"
                        />
                        <div
                          className="
            w-11 h-6 rounded-full bg-gray-300
            peer-checked:bg-green-600
            transition-colors
          "
                        />
                        <div
                          className="
            absolute left-1 top-1
            w-4 h-4 bg-white rounded-full
            transition-transform
            peer-checked:translate-x-5
          "
                        />
                      </div>
                    </label>
                  </div>
                ) : null}
              </div>

              <div>
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                  onClick={() => {
                    setSelectedBill(null);
                    setShowDetailsModal(false);
                    setConfirmDelete(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <p className="mb-2 p-1 bg-green-100 text-center">
            <span className="font-medium">Title:</span> {selectedBill?.title}
          </p>
          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <p>
              <span className="font-medium">Date:</span>{" "}
              {formatDate(selectedBill?.quoteDate)}
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
              <>
                <span className="font-medium">Currency:</span>{" "}
                {renderPaymentStatus(selectedBill.currency)}
              </>
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
          selectedBill={selectedBill ? mapBillData(selectedBill) : null}
          setConfirmDelete={setConfirmDelete}
        />
      )}
    </div>
  );
}
