import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSalesBill } from "../../hooks/useInvoices";
import { useClients } from "../../hooks/useClients";
import { getNextBillNumber, getFinancialYear } from "../../utils/billingHelper";
import CustomerDropdown, { Client } from "../customer/CustomerDropdown";
import { formatCurrency, numberToWords } from "../../utils/commonUtils";
import Modal from "../common/Modal";

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

  const [billNumber, setBillNumber] = useState<string>("");
  const [autoBillNumber, setAutoBillNumber] = useState("");
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
  const [comments, setComments] = useState<string>("");
  const [items, setItems] = useState<Item[]>([
    { description: "", hsnCode: "", qty: 1, unit: "pcs", rate: 0 },
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
      navigate("/select-company-sales");
      return;
    }

    if (!billNumber) {
      setLoadingBillNumber(true);
      getNextBillNumber(companyId)
        .then((nextNo) => {
          setBillNumber(nextNo);
          setAutoBillNumber(nextNo);
        })
        .finally(() => setLoadingBillNumber(false));
    }
  }, [companyId, billNumber, navigate]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { description: "", hsnCode: "", qty: 1, unit: "pcs", rate: 0 },
    ]);
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
      totalAmount: totalBeforeTax + totalGST,
    };
  };

  const handleSave = async () => {
    if (!companyId) return alert("Select a company first!");
    if (!selectedCustomer?.gstin) return alert("Customer is required!");
    if (!addSalesBill) return alert("Hook not ready. Reload App!");

    const totals = calculateTotals();

    const duplicateBill = existingBills.find(
      (b: any) => b.billNumber === billNumber
    );
    if (duplicateBill) {
      // return alert("Invoice number already exists!");
      setShowConfirm(true);
      setModalAttr({
        title: "Error!",
        content: "Invoice number already exists!",
        type: "error",
        footer: renderCancelButtonForModal(),
      });
      return;
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
        content:
          "You have changed the auto-generated Bill Number. Do you want to continue?",
        type: "warning",
        footer: getBillNumberChangeWarningFooter(),
      });
      return;
      //TODO - call save bill on confirm
    }

    setLoading(true);
    await addSalesBill({
      billNumber,
      billDate,
      financialYear: getFinancialYear(new Date(billDate)),
      customerGSTIN: selectedCustomer?.gstin,
      customerName: selectedCustomer?.name,
      items,
      totalBeforeTax: totals.totalBeforeTax,
      totalGST: totals.totalGST,
      totalAmount: totals.totalAmount,
      paymentStatus,
      comments,
      taxType,
      createdAt: new Date(),
    });

    setLoading(false);
    navigate("/sales", { state: { companyId } });
  };

  const clearForm = () => {
    setBillNumber(billNumber + 1);
    setBillDate(new Date().toISOString().substring(0, 10));
    setSelectedCustomer({} as Client);
    setPaymentStatus("Pending");
    setComments("");
    setItems([{ description: "", hsnCode: "", qty: 1, unit: "pcs", rate: 0 }]);
  };

  const totals = calculateTotals();

  const getGstPercent = () => {
    if (Object.keys(selectedCustomer).length < 1) return "";
    if (selectedCustomer?.taxType !== "18") {
      return `(${selectedCustomer?.taxType} + ${selectedCustomer?.taxType})%`;
    }
    return `(${selectedCustomer?.taxType})%`;
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
          onClick={() => {
            setShowConfirm(false);
            handleSave(); //TODO - call the save function here
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Yes, Save Anyway
        </button>
      </>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-xl rounded-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{companyName}</h1>
        <button
          className="text-blue-600 underline"
          onClick={() => navigate("/select-company-sales")}
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
              onChange={(e) => setBillNumber(e.target.value)}
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
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
        </div>
      </div>

      {/* Customer */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
        <div className="flex-1 w-full">
          <label className="block font-medium mb-1">Customer</label>
          <CustomerDropdown
            customers={customers}
            value={selectedCustomer}
            onChange={(c) => {
              setSelectedCustomer(c);
              setTaxType(c.taxType || "exclusive");
            }}
          />
        </div>
        <button
          className="bg-green-500 text-white px-3 py-2 rounded"
          onClick={() => navigate("/customers")}
        >
          + New Customer
        </button>
      </div>

      {/* Items */}
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

        <button
          type="button"
          onClick={handleAddItem}
          className="mt-3 bg-blue-500 text-white px-3 py-1 rounded"
        >
          + Add Item
        </button>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 p-3 rounded mb-4 text-right flex flex-row gap-3 justify-between">
        <div className="w-1/2">
          <textarea
            id="comments"
            rows={4}
            placeholder="Comments (optional)"
            onChange={(e) => setComments(e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <p>Subtotal: {formatCurrency(totals.totalBeforeTax.toFixed(2))}</p>
          <p>
            GST {getGstPercent()}: {formatCurrency(totals.totalGST.toFixed(2))}
          </p>
          <p className="font-bold">
            Total: {formatCurrency(totals.totalAmount.toFixed(2))}
          </p>
        </div>
      </div>
      <p className="mt-4 mb-4 font-semibold text-right">
        (In words):{" "}
        {numberToWords(Math.round(Number(totals.totalAmount.toFixed(2))))}
      </p>

      {/* Footer Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded"
          onClick={() => navigate("/sales", { state: { companyId } })}
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

      {/* ⚠️ Confirm Modal */}
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
          {/* <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-semibold text-red-600 mb-4">
                Warning!
              </h2>
              <p className="mb-6">
                You have changed the auto-generated Bill Number. Do you want to
                continue?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    handleSave();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes, Save Anyway
                </button>
              </div>
            </div>
          </div> */}
        </>
      )}
    </div>
  );
}
