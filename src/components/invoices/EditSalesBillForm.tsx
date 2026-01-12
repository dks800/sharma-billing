// src/pages/EditSalesBillForm.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSalesBill } from "../../hooks/useInvoices";
import { useClients } from "../../hooks/useClients";
import CustomerDropdown, { Client } from "../customer/CustomerDropdown";
import { formatCurrency, numberToWords } from "../../utils/commonUtils";
import { getFinancialYear } from "../../utils/billingHelper";
import Modal from "../common/Modal";
import { PAYMENT_STATUSES, ROUTES } from "../../constants";
import { BiPencil } from "react-icons/bi";
import { FiTrash2 } from "react-icons/fi";
import { auth } from "../../firebase";
import { getFormChanges } from "./salesBillUtils";

export interface Item {
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

export default function EditSalesBillForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bill, companyId, companyName } = location.state || {};
  const [user, setUser] = useState<any>(null);
  const { updateItem: updateSalesBill } = useSalesBill(companyId || "");
  const [billNumber, setBillNumber] = useState<string>(bill?.billNumber || "");
  const [billDate, setBillDate] = useState<string>(
    bill?.billDate?.substring(0, 10) ||
      new Date().toISOString().substring(0, 10)
  );
  const [paymentStatus, setPaymentStatus] = useState<
    "Paid" | "Pending" | "Partial"
  >((bill?.paymentStatus as any) || "Pending");
  const [ewayBillNo, setEwayBillNo] = useState<string>(bill?.ewayBillNo || "");
  const [ewayBillDateTime, setEwayBillDateTime] = useState<string>(
    bill?.ewayBillDateTime || ""
  );
  const [locationFrom, setLocationFrom] = useState<string>(
    bill?.locationFrom || ""
  );
  const [locationTo, setLocationTo] = useState<string>(bill?.locationTo || "");
  const [dispatchBy, setDispatchBy] = useState<string>(bill?.dispatchBy || "");

  const [internalComments, setInternalComments] = useState<string>(
    bill?.internalComments || ""
  );
  const [externalComments, setExternalComments] = useState<string>(
    bill?.externalComments || ""
  );
  const [items, setItems] = useState<Item[]>(bill?.items || []);
  const [taxType, setTaxType] = useState<string>(bill?.taxType || "0");
  const [customers, setCustomers] = useState<Client[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Client>(
    bill
      ? {
          id: bill.customerId || "",
          name: bill.customerName,
          taxType: bill.taxType,
          gstin: bill.customerGSTIN,
        }
      : ({} as Client)
  );
  const [loading, setLoading] = useState(false);

  const [modalAttr, setModalAttr] = useState<ModalAttrType>({
    title: "",
    type: "",
    content: null,
    footer: null,
  });
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const { data: allClients = [] } = useClients();

  useEffect(() => {
    const companyClients = allClients.map(({ name, taxType, gstin }) => ({
      name,
      taxType,
      gstin,
    }));
    setCustomers(companyClients as any);
  }, [allClients]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { description: "", hsnCode: "", qty: 1, unit: "pcs", rate: 0 },
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
      totalAmount: totalBeforeTax + totalGST,
    };
  };

  const totals = calculateTotals();

  const hasChanges =
    getFormChanges(
      bill,
      billNumber,
      billDate,
      paymentStatus,
      ewayBillNo,
      ewayBillDateTime,
      locationFrom,
      locationTo,
      dispatchBy,
      internalComments,
      externalComments,
      taxType,
      selectedCustomer,
      items
    ).length > 0;

  const handlePreview = () => {
    const changes = getFormChanges(
      bill,
      billNumber,
      billDate,
      paymentStatus,
      ewayBillNo,
      ewayBillDateTime,
      locationFrom,
      locationTo,
      dispatchBy,
      internalComments,
      externalComments,
      taxType,
      selectedCustomer,
      items
    );
    if (changes.length === 0) {
      alert("No changes detected!");
      return;
    }

    setModalAttr({
      title: "Review Changes",
      type: "info",
      content: (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {changes.map((c, idx) => (
            <div key={idx} className="p-2 border rounded">
              <p className="font-medium">{c.field}</p>
              <p className="text-sm bg-red-100 p-1 rounded">
                Before: {String(c.before || "-")}
              </p>
              <p className="text-sm bg-green-100 p-1 rounded">
                After: {String(c.after || "-")}
              </p>
            </div>
          ))}
        </div>
      ),
      footer: (
        <div className="flex gap-3 justify-end">
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={() => setShowConfirm(false)}
          >
            Cancel
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Updating..." : "Confirm Update"}
          </button>
        </div>
      ),
    });
    setShowConfirm(true);
  };

  const handleUpdate = async () => {
    if (!companyId) return alert("Select a company first!");
    if (!selectedCustomer?.gstin) return alert("Customer is required!");
    if (!updateSalesBill) return alert("Hook not ready. Reload App!");

    const totals = calculateTotals();

    setLoading(true);
    await updateSalesBill(bill.id, {
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
      internalComments,
      externalComments,
      taxType,
      ewayBillNo,
      dispatchBy,
      locationFrom,
      locationTo,
      ewayBillDateTime,
      updatedAt: new Date(),
      updatedBy: user?.email || "unknown",
    });

    setLoading(false);
    navigate(ROUTES?.SALES, { state: { companyId } });
  };

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

  const renderSaveUpdatesButton = () => (
    <button
      className={`px-5 py-2 rounded ${
        hasChanges
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "bg-gray-300 text-gray-600 cursor-not-allowed"
      }`}
      onClick={handlePreview}
      disabled={!hasChanges}
    >
      Save Changes
    </button>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-xl rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{`${companyName} #${billNumber}`}</h1>
        <div className="flex gap-4">
          <button
            className="text-blue-600 underline"
            onClick={() => navigate(ROUTES?.SELECTCOMPANYSALES)}
          >
            Change Company
          </button>
          {renderSaveUpdatesButton()}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block font-medium mb-1">Bill Number</label>
          <input
            type="number"
            value={billNumber}
            onChange={(e) => setBillNumber(e.target.value)}
            className="w-full border rounded p-2"
          />
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
              setTaxType(c.taxType || "exclusive");
            }}
          />
        </div>
        <button
          className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded"
          onClick={() => navigate(ROUTES?.CUSTOMERS)}
        >
          + New Customer
        </button>
      </div>

      {/* Items */}
      <div className="mb-4">
        {/* Desktop Table */}
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
                <th className="px-2 py-1 border w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const orig = bill.items[idx] || {};
                const isChanged =
                  item.description !== orig.description ||
                  item.hsnCode !== orig.hsnCode ||
                  item.qty !== orig.qty ||
                  item.unit !== orig.unit ||
                  item.rate !== orig.rate;

                return (
                  <tr key={idx} className="border-t">
                    <td className="px-2 py-1 border text-center">
                      {idx + 1}{" "}
                      {isChanged && (
                        <BiPencil className="inline w-4 h-4 text-orange-500 ml-1" />
                      )}
                    </td>
                    <td className="px-2 py-1 border">
                      <input
                        type="text"
                        value={item.description}
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
                    <td className="px-2 py-1 border">
                      {idx !== 0 && (
                        <div className="flex items-center justify-center h-full text-red-600 hover:text-red-800 cursor-pointer">
                          <FiTrash2
                            title="Remove this item"
                            onClick={() => handleRemoveItem(idx)}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden flex flex-col gap-4">
          {items.map((item, idx) => {
            const orig = bill.items[idx] || {};
            const isChanged =
              item.description !== orig.description ||
              item.hsnCode !== orig.hsnCode ||
              item.qty !== orig.qty ||
              item.unit !== orig.unit ||
              item.rate !== orig.rate;

            return (
              <div key={idx} className="border rounded p-3 shadow-sm">
                <p className="font-medium text-gray-600 mb-2">
                  Item {idx + 1}{" "}
                  {isChanged && (
                    <BiPencil className="inline w-4 h-4 text-orange-500 ml-1" />
                  )}
                  – {(item.qty * item.rate).toFixed(2)}
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
                    onChange={(e) =>
                      handleItemChange(idx, "qty", e.target.value)
                    }
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
                  onChange={(e) =>
                    handleItemChange(idx, "rate", e.target.value)
                  }
                  className="w-full border rounded p-2 mt-2"
                />
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded"
        >
          + Add Item
        </button>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 p-3 rounded mb-4 text-right flex flex-row gap-3 justify-between">
        <div className="w-1/2 flex gap-2">
          <textarea
            id="int-comments"
            rows={4}
            placeholder="Internal Comments (optional)"
            value={internalComments}
            onChange={(e) => setInternalComments(e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            id="external-comments"
            rows={4}
            placeholder="External Comments (optional)"
            value={externalComments}
            onChange={(e) => setExternalComments(e.target.value)}
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
          <p className="text-sm text-gray-600">
            (In words: {numberToWords(totals.totalAmount)})
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() =>
            navigate(ROUTES?.SALES, { state: { companyId, companyName } })
          }
        >
          Cancel
        </button>
        {renderSaveUpdatesButton()}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <Modal
          title={modalAttr.title}
          type={modalAttr.type}
          onClose={handleModalClose}
          footer={modalAttr.footer}
          isOpen={showConfirm}
        >
          {modalAttr.content}
        </Modal>
      )}
    </div>
  );
}
