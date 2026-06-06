import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePurchaseBill } from "../hooks/useInvoices";
import { toast } from "react-toastify";
import { formatCurrency, formatDate } from "../utils/commonUtils";
import { ROUTES } from "../constants";
import Modal from "../components/common/Modal";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { BsFillPlusCircleFill } from "react-icons/bs";
import renderPaymentStatus from "../components/invoices/getPaymentStatus";
import { useClients } from "../hooks/useClients";
import { Client } from "../components/customer/CustomerDropdown";
import Loader from "../components/Loader";
import EmptyState from "../components/common/EmptyState";
import FiltersSection from "../components/invoices/FiltersSection";
import { CgClose } from "react-icons/cg";

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
  const [orderByField, setOrderByField] = useState("billDate");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [selectedBill, setSelectedBill] = useState<PurchaseBill | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [customerList, setCustomerList] = useState<Client[]>([]);
  const { data: allClients = [] } = useClients();
  const [filters, setFilters] = useState({
    customer: "",
    paymentStatus: "",
    dateRange: {
      start: null as Date | null,
      end: null as Date | null,
    },
  });

  useEffect(() => {
    const companyClients = allClients.map(({ name, taxType, gstin }) => ({
      name,
      taxType,
      gstin,
    }));
    setCustomerList(companyClients as any);
  }, [allClients]);

  const {
    data: purchaseBills,
    loading: loadingBills,
    deleteItem,
  } = usePurchaseBill(companyId || "", {
    orderByField,
    orderDirection,
    where: [
      ...(filters.customer ? [["supplierGstin", "==", filters.customer]] : []),
      ...(filters.paymentStatus
        ? [["paymentStatus", "==", filters.paymentStatus]]
        : []),
    ],
    dateRange:
      filters.dateRange.start && filters.dateRange.end
        ? filters.dateRange
        : undefined,
  });

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

  const appliedFilters = [
    filters.customer && {
      key: "customer",
      label: `Supplier: ${filters.customer}`,
      color: "bg-purple-100 text-purple-700",
    },

    filters.paymentStatus && {
      key: "paymentStatus",
      label: `Status: ${filters.paymentStatus}`,
      color: "bg-green-100 text-green-700",
    },

    filters.dateRange.start &&
      filters.dateRange.end && {
        key: "dateRange",
        label: `${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end.toLocaleDateString()}`,
        color: "bg-orange-100 text-orange-700",
      },
  ].filter(Boolean);

  const renderBillAggregates = () => {
    const amount = purchaseBills.reduce(
      (a, { totalAmount }) => a + Number(totalAmount),
      0,
    );
    return (
      <div className="flex justify-center w-full">
        <div className="flex gap-2 bg-sky-100 border rounded px-4 w-full max-w-md justify-between p-2 rounded-xl my-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Total Bills:{" "}
              <span className="text-lg font-semibold text-blue-600">
                {purchaseBills?.length}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Total Amount:{" "}
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(amount)}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const removeFilter = (key: string) => {
    setFilters((prev) => {
      const updated = { ...prev };

      if (key === "dateRange") {
        updated.dateRange = { start: null, end: null };
      } else {
        (updated as any)[key] = "";
      }

      return updated;
    });
  };

  const clearAllFilters = () => {
    setFilters({
      customer: "",
      paymentStatus: "",
      dateRange: { start: null, end: null },
    });
  };

// Todo - check date range selector, upon month navigation date picker closes and even selected end date is not applied correctly. Also, add option to select financial year as filter criteria.

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h2 className="text-lg font-semibold w-full sm:w-auto text-left sm:text-left">
          Purchase Bills - <b>{companyName}</b>
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* {!loading && purchaseBills?.length ? (
              <PDFDownloadLink
                document={
                  <PurchaseListPDF
                    billList={purchaseBills}
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
            ) : null} */}

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
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <FiltersSection
          showFyear={false}
          customerList={customerList}
          filters={filters}
          setFilters={setFilters}
        />
        <div>
          {appliedFilters.length ? (
            <p className="text-sm text-gray-500 m-2">
              {appliedFilters.length} filters applied
            </p>
          ) : null}
          {appliedFilters.length > 0 && (
            <div className="bg-white p-4 rounded-2xl shadow mb-4 flex flex-wrap items-center gap-2">
              {appliedFilters.map((filter: any) => (
                <div
                  key={filter.key}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${filter.color} cursor-pointer`}
                >
                  <span>{filter.label}</span>

                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="hover:bg-black/10 rounded-full px-1"
                  >
                    <CgClose />
                  </button>
                </div>
              ))}
              <button
                onClick={clearAllFilters}
                className="ml-auto text-sm text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-xl transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {loadingBills ? (
        <Loader />
      ) : purchaseBills.length === 0 ? (
        <EmptyState
          title="No Purchase Bills found"
          ctaLabel={"+ Purchase Bill"}
          onCta={() =>
            navigate(ROUTES?.ADDPURCHASE, { state: { companyId, companyName } })
          }
        />
      ) : (
        <div className="hidden sm:block overflow-x-auto bg-white rounded shadow">
          {renderBillAggregates()}
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                {[
                  { label: "Sr", field: "SrNo" },
                  { label: "Bill No", field: "billNumber" },
                  { label: "Date", field: "billDate" },
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
              {purchaseBills.map((bill, index) => (
                <tr
                  key={bill.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => {
                    if ((e?.currentTarget as any)?.type) return;
                    setSelectedBill(bill);
                  }}
                >
                  <td className="px-4 py-2 w-[30px]">{index + 1}</td>
                  <td className="px-4 py-2">{bill.billNumber}</td>
                  <td className="px-4 py-2">{formatDate(bill.billDate)}</td>
                  <td className="px-4 py-2">{bill.supplierName}</td>
                  <td className="px-4 py-2">
                    {formatCurrency(bill.totalAmount)}
                  </td>
                  <td className="px-4 py-2">
                    {renderPaymentStatus(bill.paymentStatus)}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      title="Edit"
                      className="text-blue-500 hover:underline hover:bg-blue-500 hover:text-white rounded px-1 py-1 pt-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(ROUTES.EDITPURCHASE, {
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
                        setSelectedBill(bill);
                        setConfirmDelete(true);
                      }}
                    >
                      <FiTrash2 className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {purchaseBills?.length > 10 ? renderBillAggregates() : null}
        </div>
      )}

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {renderBillAggregates()}
        {purchaseBills.map((bill) => (
          <div
            key={bill.id}
            className="bg-white rounded shadow p-3 cursor-pointer"
            onClick={() => {
              setSelectedBill(bill);
            }}
          >
            <div className="flex justify-between text-sm font-semibold">
              <span>{formatDate(bill.billDate)}</span>
              <span>Bill #{bill.billNumber}</span>
              <span className="font-bold">
                {formatCurrency(bill.totalAmount)}
              </span>
            </div>
            <div className="mt-1 text-gray-700 flex gap-2 justify-between">
              <span>{bill?.supplierName}</span>
              <span>{renderPaymentStatus(bill.paymentStatus)}</span>
            </div>
          </div>
        ))}
        {purchaseBills?.length > 10 ? renderBillAggregates() : null}
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
                Number(selectedBill.totalAmount) -
                  Number(selectedBill.totalGST),
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
