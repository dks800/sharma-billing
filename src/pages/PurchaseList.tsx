import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { usePurchaseBill } from "../hooks/useInvoices";
import { toast } from "react-toastify";
import { formatCurrency, formatDate } from "../utils/commonUtils";
import { PAYMENT_STATUSES, ROUTES } from "../constants";
import Modal from "../components/common/Modal";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { FiDownload, FiEye, FiEyeOff, FiSettings } from "react-icons/fi";
import { BsFillEyeSlashFill, BsFillPlusCircleFill } from "react-icons/bs";
import renderPaymentStatus from "../components/invoices/getPaymentStatus";
import { useClients } from "../hooks/useClients";
import CustomerDropdown, {
  Client,
} from "../components/customer/CustomerDropdown";
import { RiFileSettingsFill } from "react-icons/ri";
import { AiFillEyeInvisible } from "react-icons/ai";
import Loader from "../components/Loader";
import PurchaseListPDF from "../components/invoices/PurchaseListPDF";
import EmptyState from "../components/common/EmptyState";

interface PurchaseBill {
  id: string;
  billNumber: string;
  billDate: string;
  supplierName: string;
  supplierGstin: string;
  totalAmount: number;
  totalGST: number;
  paymentStatus: string;
  financialYear: string;
  [key: string]: any;
}

const PurchaseList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const companyId = location.state?.companyId;
  const companyName = location.state?.companyName;
  const [loading, setLoading] = useState(false);
  const [orderByField, setOrderByField] = useState("billNumber");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState(50); // fetching bigger chunk, paginate client-side

  const [selectedBill, setSelectedBill] = useState<PurchaseBill | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState({} as Client);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [customers, setCustomers] = useState<Client[]>([]);
  const { data: allClients = [] } = useClients();

  useEffect(() => {
    const companyClients = allClients.map(({ name, taxType, gstin }) => ({
      name,
      taxType,
      gstin,
    }));
    setCustomers(companyClients as any);
  }, [allClients]);

  const {
    data: purchaseBills,
    loading: loadingBills,
    error,
    deleteItem,
  } = usePurchaseBill(companyId || "", {
    orderByField,
    orderDirection,
    limit,
  });

  const filteredBills = React.useMemo(() => {
    let list =
      purchaseBills?.sort((a, b) => (a.billDate < b.billDate ? 1 : -1)) || [];

    if (searchQuery) {
      list = list.filter((b) =>
        [
          b.billNumber,
          b.supplierName,
          b.supplierGstin,
          b.totalAmount.toString(),
        ].some((field) =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (selectedSupplier?.gstin)
      list = list.filter((b) => b.supplierGstin === selectedSupplier?.gstin);
    if (selectedStatus)
      list = list.filter((b) => b.paymentStatus === selectedStatus);
    if (fromDate)
      list = list.filter((b) => new Date(b.billDate) >= new Date(fromDate));
    if (toDate)
      list = list.filter((b) => new Date(b.billDate) <= new Date(toDate));

    return list;
  }, [
    purchaseBills,
    selectedSupplier?.gstin,
    selectedStatus,
    fromDate,
    toDate,
    searchQuery,
  ]);

  const handleClearFilters = () => {
    setSelectedSupplier({} as Client);
    setSelectedStatus("");
    setFromDate("");
    setToDate("");
    setSearchQuery("");
  };

  const handleDelete = async () => {
    if (!selectedBill) return toast.warning("No selected Purchase bill!");
    setLoading(true);
    await deleteItem(selectedBill.id);
    setLoading(false);
    handleCloseModals();
    toast.success("Purchase bill deleted successfully!");
  };

  const handleSortChange = (field: string) => {
    if (orderByField === field) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
    } else {
      setOrderByField(field);
      setOrderDirection("asc");
    }
  };

  const handleCloseModals = () => {
    setConfirmDelete(false);
    setSelectedBill(null);
  };

  const renderAdditionalFilters = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <CustomerDropdown
          customers={customers}
          value={selectedSupplier}
          onChange={(c) => setSelectedSupplier(c)}
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-40"
        >
          <option value="">All Status</option>
          {PAYMENT_STATUSES?.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-36"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-36"
        />
        <input
          type="text"
          placeholder="Search by supplier or bill no."
          className="border p-2 rounded w-full sm:w-64 mt-2 sm:mt-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center justify-center gap-2 w-[48%] sm:w-auto"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h2 className="text-lg font-semibold w-full sm:w-auto text-left sm:text-left">
          Purchase Bills - <b>{companyName}</b>
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {!loading && filteredBills?.length ? (
              <PDFDownloadLink
                document={
                  <PurchaseListPDF
                    billList={filteredBills}
                    companyName={companyName}
                  />
                }
                fileName="purchase_list.pdf"
              >
                {({ loading }) => (
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 text-blue-700 rounded hover:bg-yellow-600 flex items-center justify-center gap-2 w-[48%] sm:w-auto hover:border-transparent rounded hover:text-white"
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

            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2 w-[48%] sm:w-auto"
              onClick={() =>
                navigate(ROUTES?.ADDPURCHASE, {
                  state: { companyId, companyName },
                })
              }
            >
              <BsFillPlusCircleFill /> Purchase Bill
            </button>

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 w-[48%] sm:w-auto"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              {!showFilters ? <FiEye /> : <FiEyeOff />} Filters
            </button>
          </div>
        </div>
      </div>
      {/* {filteredBills && <PDFViewer style={{ width: "100%", height: "100vh" }}>
        <PurchaseListPDF billList={filteredBills} companyName={companyName} />
      </PDFViewer>} */}
      <div
        className={`${
          !showFilters ? "hidden" : ""
        } transition-all duration-300`}
      >
        <p>
          <b>Filters:</b>
        </p>
        {renderAdditionalFilters()}
      </div>

      {loadingBills ? (
        <Loader />
      ) : filteredBills.length === 0 ? (
        <EmptyState
          title="No Purchase Bills found"
          ctaLabel={"+ Purchase Bill"}
          onCta={() =>
            navigate(ROUTES?.ADDPURCHASE, { state: { companyId, companyName } })
          }
        />
      ) : (
        <div className="hidden sm:block overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                {[
                  { label: "Bill No", field: "billNumber" },
                  { label: "Date", field: "date" },
                  { label: "Supplier", field: "SupplierName" },
                  { label: "Total", field: "totalAmount" },
                  { label: "Payment Status", field: "paymentStatus" },
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
              {filteredBills.map((bill) => (
                <tr
                  key={bill.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => {
                    if ((e?.currentTarget as any)?.type) return;
                    setSelectedBill(bill);
                  }}
                >
                  <td className="px-4 py-2">{bill.billNumber}</td>
                  <td className="px-4 py-2">{formatDate(bill.billDate)}</td>
                  <td className="px-4 py-2">{bill.supplierName}</td>
                  <td className="px-4 py-2">
                    {formatCurrency(bill.totalAmount)}
                  </td>
                  <td className="px-4 py-2">
                    {renderPaymentStatus(bill.paymentStatus)}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="px-2 py-1 text-blue-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(ROUTES.EDITPURCHASE, {
                          state: { bill, companyId, companyName },
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 text-red-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBill(bill);
                        setConfirmDelete(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filteredBills.map((bill) => (
          <div
            key={bill.id}
            className="bg-white rounded shadow p-3 cursor-pointer"
            onClick={() => {
              setSelectedBill(bill);
            }}
          >
            <div className="flex justify-between text-sm font-semibold">
              <span>Bill #{bill.billNumber}</span>
              <span>{formatDate(bill.billDate)}</span>
            </div>
            <div className="mt-1 text-gray-700">
              <p>
                {bill?.supplierName}{" "}
                <span style={{ fontSize: 12 }}>({bill.supplierGstin})</span>
              </p>
              <p className="font-bold mt-1">
                {formatCurrency(bill.totalAmount)} -{" "}
                {renderPaymentStatus(bill.paymentStatus)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Details Modal */}
      {selectedBill && !confirmDelete && (
        <Modal
          isOpen={selectedBill && !confirmDelete}
          title={`Purchase Bill #${selectedBill.billNumber}`}
          onClose={handleCloseModals}
          footer={
            <div className="flex justify-between w-full">
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded border border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    navigate(ROUTES.EDITPURCHASE, {
                      state: { bill: selectedBill, companyId, companyName },
                    });
                    handleCloseModals();
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
              </div>
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                onClick={() => setSelectedBill(null)}
              >
                Close
              </button>
            </div>
          }
        >
          <div className="text-sm space-y-1">
            <p className="pb-1">
              <b>Supplier:</b> {selectedBill.supplierName}
            </p>
            <p className="pb-1">
              <b>Date:</b> {formatDate(selectedBill.billDate)}
            </p>
            <p className="pb-1">
              <b>Payment:</b> {renderPaymentStatus(selectedBill.paymentStatus)}
            </p>
            <p className="pb-1">
              <b>Sub Total:</b>{" "}
              {formatCurrency(
                Number(selectedBill.totalAmount) - Number(selectedBill.totalGST)
              )}
            </p>
            <p className="pb-1">
              <b>GST Amount:</b> {formatCurrency(selectedBill.totalGST)}
            </p>
            <p className="pb-1">
              <b>Total:</b> {formatCurrency(selectedBill.totalAmount)}
            </p>
            <hr />
            <p className="pb-1">
              <b>Remarks:</b> {selectedBill.remarks}
            </p>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <Modal
          isOpen={confirmDelete}
          title="Confirm Delete"
          onClose={handleCloseModals}
          footer={
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={handleCloseModals}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          }
        >
          <p>Are you sure you want to delete this purchase bill?</p>
          <p>
            Supplier: <b>{selectedBill?.supplierName}</b>
          </p>
          <p>
            Bill No.:{" "}
            <b>
              {selectedBill?.billNumber} ({formatDate(selectedBill?.billDate!)})
            </b>
          </p>
          <p>
            Total Amount:{" "}
            <b>{formatCurrency(Number(selectedBill?.totalAmount))}</b>
          </p>
        </Modal>
      )}
    </div>
  );
};

export default PurchaseList;
