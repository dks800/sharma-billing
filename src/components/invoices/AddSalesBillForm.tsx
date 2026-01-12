import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSalesBill } from "../../hooks/useInvoices";
import { useClients } from "../../hooks/useClients";
import { getNextBillNumber, getFinancialYear } from "../../utils/billingHelper";
import CustomerDropdown, { Client } from "../customer/CustomerDropdown";
import { formatCurrency, numberToWords } from "../../utils/commonUtils";
import Modal from "../common/Modal";
import {
  COLLECTIONS,
  globalCurrencies,
  PAYMENT_STATUSES,
  ROUTES,
  TAX_TYPES,
} from "../../constants";
import { FiTrash2 } from "react-icons/fi";
import { BsFillPlusCircleFill } from "react-icons/bs";

interface Item {
  description: string;
  hsnCode: string;
  qty: number;
  unit: string;
  rate: number;
}

interface ModalAttrType {
  type: string;
  title: string;
  footer: React.ReactNode;
  content: React.ReactNode;
}

export default function AddSalesBillForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const companyId = location.state?.companyId;
  const companyName = location.state?.companyName || "Select a Parent Company";

  const { addItem: addSalesBill, data: existingBills } = useSalesBill(
    companyId || ""
  );

  const [billNumber, setBillNumber] = useState<number>(0);
  const [currency, setCurrency] = useState("INR");
  const [autoBillNumber, setAutoBillNumber] = useState<number>(0);
  const [locationFrom, setLocationFrom] = useState("Vijapur");
  const [locationTo, setLocationTo] = useState("");
  const [ewayBillNo, setEwayBillNo] = useState("");
  const [dispatchBy, setDispatchBy] = useState("");
  const [ewayBillDateTime, setEwayBillDateTime] = useState("");
  const [modalAttr, setModalAttr] = useState<ModalAttrType>({
    title: "",
    type: "",
    content: null,
    footer: null,
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingBillNumber, setLoadingBillNumber] = useState(false);
  const [billDate, setBillDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [paymentStatus, setPaymentStatus] = useState<
    "Paid" | "Pending" | "Partially Paid"
  >("Pending");
  const [internalComments, setInternalComments] = useState<string>("");
  const [externalComments, setExternalComments] = useState<string>("");
  const [items, setItems] = useState<Item[]>([
    { description: "", hsnCode: "8464", qty: 1, unit: "pcs", rate: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [taxType, setTaxType] = useState<string>("0");
  const [customers, setCustomers] = useState<Client[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Client>(
    {} as Client
  );

  const { data: allClients = [] } = useClients();

  useEffect(() => {
    const companyClients = allClients.map(({ name, taxType, gstin }) => ({
      name,
      taxType,
      gstin,
    }));
    setCustomers(companyClients as any);
  }, [allClients]);

  useEffect(() => {
    if (!companyId) {
      navigate(ROUTES?.SELECTCOMPANYSALES);
      return;
    }

    if (!billNumber) {
      setLoadingBillNumber(true);
      getNextBillNumber(companyId, "billNumber", COLLECTIONS.SALES_BILL)
        .then((nextNo) => {
          setBillNumber(Number(nextNo));
          setAutoBillNumber(Number(nextNo));
        })
        .finally(() => setLoadingBillNumber(false));
    }
  }, [companyId, billNumber, navigate]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { description: "", hsnCode: "8464", qty: 1, unit: "", rate: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const updated: any = [...items]?.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  const handleItemChange = (index: number, field: keyof Item, value: any) => {
    const updated: any = [...items];
    updated[index][field] =
      field === "qty" || field === "rate" ? Number(value) : value;
    setItems(updated);
  };

  const calculateTotals = () => {
    let totalBeforeTax = 0;
    let totalGST = 0;

    items.forEach((item) => {
      const amount = item.qty * item.rate;
      totalBeforeTax += amount;
    });
    if (taxType === "NA" || taxType === "0") {
      totalGST = 0;
    } else if (taxType === "2.5") {
      totalGST = totalBeforeTax * 0.05;
    } else if (taxType === "9" || taxType === "18") {
      totalGST = totalBeforeTax * 0.18;
    }

    return {
      totalBeforeTax,
      totalGST,
      roundUp:
        Math.ceil(totalBeforeTax + totalGST) - (totalBeforeTax + totalGST),
      totalAmount: Math.ceil(totalBeforeTax + totalGST),
    };
  };

  const saveFinalCall = async () => {
    setLoading(true);
    await addSalesBill({
      companyId,
      companyName,
      billNumber,
      billDate,
      financialYear: getFinancialYear(new Date(billDate)),
      customerGSTIN: selectedCustomer?.gstin,
      customerName: selectedCustomer?.name,
      items,
      totalBeforeTax: totals.totalBeforeTax,
      totalGST: totals.totalGST,
      roundUp: totals.roundUp,
      totalAmount: totals.totalAmount,
      paymentStatus,
      currency,
      internalComments,
      externalComments,
      taxType,
      locationFrom,
      locationTo,
      ewayBillNo,
      dispatchBy,
      ewayBillDateTime,
      createdAt: new Date(),
    });

    setLoading(false);
    navigate(ROUTES?.SALES, { state: { companyId, companyName } });
  };

  const handleSave = async () => {
    let errorMsg = "";
    if (!companyId) errorMsg = "Select a company first!";
    if (!selectedCustomer?.gstin)
      errorMsg = "Customer Missing. Please select a customer";
    if (!addSalesBill) errorMsg = "Hook not ready. Reload App!";
    const totals = calculateTotals();
    const duplicateBill = existingBills.find(
      (b: any) => b.billNumber === billNumber
    );
    if (duplicateBill) errorMsg = "Invoice number already exists!";
    errorMsg =
      totals.totalAmount === 0 ? "Total amount cannot be zero!" : errorMsg;
    if (errorMsg && errorMsg?.length > 0) {
      setShowConfirm(true);
      return setModalAttr({
        title: "Error!",
        content: errorMsg,
        type: "error",
        footer: renderCancelButtonForModal(),
      });
    }

    const duplicateClientAmount = existingBills.find(
      (b: any) =>
        b.customerName === selectedCustomer?.name &&
        b.totalAmount === totals.totalAmount
    );
    if (duplicateClientAmount) {
      setShowConfirm(true);
      setModalAttr({
        title: "Warning!",
        content:
          "A bill for this client with the same amount exists. Do you want to save anyway?",
        type: "warning",
        footer: getBillNumberChangeWarningFooter(),
      });
      return;
      //TODO - call save bill on confirm
    }

    if (billNumber !== autoBillNumber) {
      setShowConfirm(true);
      setModalAttr({
        title: "Warning!",
        content: `You have changed the auto-generated Bill Number \nfrom: ${autoBillNumber} \nto: ${billNumber}. \nDo you want to continue?`,
        type: "warning",
        footer: getBillNumberChangeWarningFooter(),
      });
      return;
    }
    saveFinalCall();
  };

  const clearForm = () => {
    setBillDate(new Date().toISOString().substring(0, 10));
    setSelectedCustomer({} as Client);
    setPaymentStatus("Pending");
    setInternalComments("");
    setExternalComments("");
    setItems([{ description: "", hsnCode: "", qty: 1, unit: "pcs", rate: 0 }]);
  };

  const totals = calculateTotals();

  const getGstPercent = () => {
    if (!taxType) return "";
    if (taxType === "NA") return "(NA)";
    if (taxType !== "18") {
      return `(${taxType} + ${taxType})%`;
    }
    return taxType + "%";
  };

  const handleModalClose = () => {
    setShowConfirm(false);
    setModalAttr({} as ModalAttrType);
  };

  const renderCancelButtonForModal = () => {
    return (
      <button
        onClick={handleModalClose}
        className="px-4 py-2 border rounded hover:bg-gray-100"
      >
        Cancel
      </button>
    );
  };

  const getBillNumberChangeWarningFooter = () => {
    return (
      <>
        {renderCancelButtonForModal()}
        <button
          disabled={loading}
          onClick={() => {
            setShowConfirm(false);
            saveFinalCall();
          }}
          className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Saving..." : "Yes, Save Anyway"}
        </button>
      </>
    );
  };

  console.log(selectedCustomer, "selectedCustomer");

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-xl rounded-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{`${companyName} #${billNumber}`}</h1>
        <button
          className="text-blue-600 underline"
          onClick={() => navigate(ROUTES?.SELECTCOMPANYSALES)}
        >
          Change Company
        </button>
      </div>

      {/* Grid: Bill Number, Bill Date, Payment Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="mb-4">
          <label className="block font-medium mb-1">Bill Number</label>

          <div className="relative">
            <input
              type="number"
              value={billNumber}
              placeholder={
                loadingBillNumber ? "Loading..." : "Enter Bill Number"
              }
              onChange={(e) => setBillNumber(Number(e.target.value))}
              className="w-full border rounded p-2 pr-10" // add pr-10 so text doesn't overlap loader
            />

            {loadingBillNumber && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  className="animate-spin h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Bill Date</label>
          <input
            type="date"
            value={billDate}
            onChange={(e) => setBillDate(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Payment Status</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as any)}
            className="w-full border rounded p-2"
          >
            {PAYMENT_STATUSES?.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-full gap-2">
          <div className="flex-1">
            <label className="block font-medium mb-1">Tax Type %</label>
            <select
              value={taxType}
              onChange={(e) => setTaxType(e.target.value as any)}
              className="w-full border rounded p-2"
            >
              {TAX_TYPES?.map((tax) => (
                <option key={tax} value={tax}>
                  {tax === "NA" || tax === "18" ? tax : `${tax} + ${tax}`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="w-full border rounded p-2"
            >
              {globalCurrencies?.map((curr, idx) => (
                <option key={curr?.code + idx} value={curr?.code}>
                  {`${curr?.code} - ${curr?.name}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">From Location</label>
          <input
            type="input"
            value={locationFrom}
            onChange={(e) => setLocationFrom(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">To Location</label>
          <input
            type="input"
            value={locationTo}
            onChange={(e) => setLocationTo(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Dispatch By</label>
          <input
            type="input"
            value={dispatchBy}
            onChange={(e) => setDispatchBy(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Eway Bill No.</label>
          <input
            type="input"
            value={ewayBillNo}
            onChange={(e) => setEwayBillNo(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
            Eway Bill Date & Time
          </label>
          <input
            type="input"
            value={ewayBillDateTime}
            onChange={(e) => setEwayBillDateTime(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      {/* Customer */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2">
            <label className="block font-medium mb-1">Customer</label>
            {selectedCustomer && (
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">
                  - {selectedCustomer.name} -{" "}
                </span>
                {selectedCustomer.gstin && (
                  <span className="ml-2 text-gray-500">
                    {selectedCustomer.gstin}
                  </span>
                )}
              </div>
            )}
          </div>

          <CustomerDropdown
            customers={customers}
            value={selectedCustomer}
            onChange={(c) => {
              setSelectedCustomer(c);
              setTaxType(c.taxType || "NA");
            }}
          />
        </div>
        <button
          className="bg-green-500 text-white px-3 py-2 rounded sm:mt-4"
          onClick={() => navigate(ROUTES?.CUSTOMERS)}
        >
          <div className="flex flex-row items-center gap-1">
            <BsFillPlusCircleFill /> Customer
          </div>
        </button>
      </div>

      <div className="mb-4">
        {/* Table on desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 border w-[70px]">Sr No</th>
                <th className="px-2 py-1 border">Description</th>
                <th className="px-2 py-1 border w-[110px]">HSN Code</th>
                <th className="px-2 py-1 border w-[80px]">Qty</th>
                <th className="px-2 py-1 border w-[80px]">Unit</th>
                <th className="px-2 py-1 border w-[150px]">Rate</th>
                <th className="px-2 py-1 border w-[150px]">Amount</th>
                <th className="px-2 py-1 border w-[150px]"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-1 border text-center">{idx + 1}</td>
                  <td className="px-2 py-1 border">
                    <input
                      type="text"
                      value={item.description}
                      placeholder="Enter description"
                      onChange={(e) =>
                        handleItemChange(idx, "description", e.target.value)
                      }
                      className="w-full border rounded p-1"
                    />
                  </td>
                  <td className="px-2 py-1 border">
                    <input
                      type="text"
                      value={item.hsnCode}
                      placeholder="HSN Code"
                      onChange={(e) =>
                        handleItemChange(idx, "hsnCode", e.target.value)
                      }
                      className="w-full border rounded p-1"
                    />
                  </td>
                  <td className="px-2 py-1 border">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(idx, "qty", e.target.value)
                      }
                      className="w-full border rounded p-1"
                    />
                  </td>
                  <td className="px-2 py-1 border">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(idx, "unit", e.target.value)
                      }
                      className="w-full border rounded p-1"
                    />
                  </td>
                  <td className="px-2 py-1 border">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(idx, "rate", e.target.value)
                      }
                      className="w-full border rounded p-1"
                    />
                  </td>
                  <td className="px-2 py-1 border text-right">
                    {formatCurrency((item.qty * item.rate).toFixed(2))}
                  </td>
                  <td className="px-2 py-1 border text-center cursor-pointer text-red-600 hover:text-red-800">
                    {idx !== 0 && (
                      <FiTrash2
                        title="Remove this item"
                        onClick={() => handleRemoveItem(idx)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards on mobile */}
        <div className="sm:hidden flex flex-col gap-4">
          {items.map((item, idx) => (
            <div key={idx} className="border rounded p-3 shadow-sm">
              <p className="font-medium text-gray-600 mb-2">
                Item {idx + 1} – {(item.qty * item.rate).toFixed(2)}
                {idx !== 0 && (
                  <span className="float-right text-red-600 hover:text-red-800 cursor-pointer">
                    <FiTrash2
                      title="Remove this item"
                      onClick={() => handleRemoveItem(idx)}
                    />
                  </span>
                )}
              </p>
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  handleItemChange(idx, "description", e.target.value)
                }
                className="w-full border rounded p-2 mb-2"
              />
              <input
                type="text"
                placeholder="HSN Code"
                value={item.hsnCode}
                onChange={(e) =>
                  handleItemChange(idx, "hsnCode", e.target.value)
                }
                className="w-full border rounded p-2 mb-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={item.unit}
                  onChange={(e) =>
                    handleItemChange(idx, "unit", e.target.value)
                  }
                  className="border rounded p-2"
                />
              </div>
              <input
                type="number"
                placeholder="Rate"
                value={item.rate}
                onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                className="w-full border rounded p-2 mt-2"
              />
            </div>
          ))}
        </div>

        {items?.length < 17 ? (
          <button
            type="button"
            onClick={handleAddItem}
            className="mt-3 bg-blue-500 text-white px-3 py-1 rounded"
          >
            <div className="flex flex-row items-center gap-1">
              <BsFillPlusCircleFill /> Item
            </div>
          </button>
        ) : (
          <div className="bg-yellow-50 rounded text-bold p-2">
            Warning! Maximum items reached
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="bg-gray-50 p-3 rounded mb-4 text-right flex flex-col sm:flex-row gap-3 justify-between">
        <div className="w-full sm:w-1/2 flex gap-2">
          <textarea
            id="comments"
            rows={4}
            value={internalComments}
            placeholder="Internal Comments (optional)"
            onChange={(e) => setInternalComments(e.target.value)}
            className="w-full flex-1 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            id="external-comments"
            rows={4}
            value={externalComments}
            placeholder="External Comments (optional)"
            onChange={(e) => setExternalComments(e.target.value)}
            className="w-full flex-1 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full sm:w-auto text-right">
          <p>Subtotal: {formatCurrency(totals.totalBeforeTax.toFixed(2))}</p>
          <p>
            GST {getGstPercent()}: {formatCurrency(totals.totalGST.toFixed(2))}
          </p>
          <p>Round Up: {formatCurrency(totals.roundUp.toFixed(2))}</p>
          <p className="font-bold">
            Total: {formatCurrency(totals.totalAmount.toFixed(2))}
          </p>
        </div>
      </div>
      <p className="mt-4 mb-4 font-semibold text-right">
        (In words):{" "}
        {numberToWords(
          Math.round(Number(totals.totalAmount.toFixed(2))),
          currency
        )}
      </p>

      {/* Footer Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded"
          onClick={() =>
            navigate(ROUTES?.SALES, { state: { companyId, companyName } })
          }
        >
          Cancel
        </button>
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          onClick={clearForm}
        >
          Clear
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      {showConfirm && (
        <>
          <Modal
            size="sm"
            title={modalAttr.title}
            type={modalAttr?.type}
            isOpen={showConfirm}
            onClose={handleModalClose}
            footer={modalAttr.footer}
          >
            {modalAttr.content}
          </Modal>
        </>
      )}
    </div>
  );
}
