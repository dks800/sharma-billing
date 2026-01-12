import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuotations } from "../../hooks/useInvoices";
import { useClients } from "../../hooks/useClients";
import CustomerDropdown, { Client } from "../customer/CustomerDropdown";
import { formatCurrency, numberToWords } from "../../utils/commonUtils";
import { globalCurrencies, ROUTES, TAX_TYPES } from "../../constants";
import { FiTrash2 } from "react-icons/fi";
import { BsFillPlusCircleFill } from "react-icons/bs";
import Modal from "../common/Modal";
import { auth } from "../../firebase";
import { toast } from "react-toastify";
import Loader from "../Loader";
import { getQuotationChanges } from "../invoices/salesBillUtils";
import { RxReset } from "react-icons/rx";

const InputWrap: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="relative w-full group">{children}</div>
);

export default function EditQuotationForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const quotation = location.state?.quotation;
  const companyId = quotation?.companyId;
  const companyName = quotation?.companyName;

  const { data: allClients = [] } = useClients();
  const { updateItem } = useQuotations(companyId);
  const [modalAttr, setModalAttr] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [originalData, setOriginalData] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);

  const [customers, setCustomers] = useState<Client[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Client>(
    {} as Client
  );

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!quotation) return;

    setFormData({
      ...quotation,
      items: quotation.items.map((i: any, idx: number) => ({ ...i, id: idx })),
    });

    setOriginalData({
      ...quotation,
      items: quotation.items.map((i: any, idx: number) => ({ ...i, id: idx })),
    });

    setSelectedCustomer({
      id: quotation?.customerId,
      name: quotation.customerName,
      gstin: quotation.customerGSTIN,
      taxType: quotation.taxType,
    });
  }, [quotation]);

  useEffect(() => {
    const mapped = allClients.map(({ name, gstin, taxType }) => ({
      name,
      gstin,
      taxType,
    }));
    setCustomers(mapped as Client[]);
  }, [allClients]);

  /* ---------------- HELPERS ---------------- */
  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const updatedItems = prev.items.map((item: any, index: number) =>
        index === idx
          ? {
              ...item,
              [field]:
                field === "qty" || field === "rate" ? Number(value) : value,
            }
          : item
      );

      return { ...prev, items: updatedItems };
    });
  };

  const handleAddItem = () => {
    setFormData((prev: any) => ({
      ...prev,
      items: [
        ...prev.items,
        { description: "", hsnCode: "", qty: 1, unit: "pcs", rate: 0 },
      ],
    }));
  };

  const handleRemoveItem = (idx: number) => {
    setFormData((prev: any) => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== idx),
    }));
  };

  const calculateTotals = () => {
    let totalBeforeTax = 0;
    let totalGST = 0;
    if (!formData)
      return {
        totalBeforeTax: 0,
        totalGST: 0,
        roundUp: 0,
        totalAmount: 0,
      };
    formData.items.forEach((i: any) => {
      totalBeforeTax += i.qty * i.rate;
    });

    if (formData.taxType === "2.5") totalGST = totalBeforeTax * 0.05;
    else if (formData.taxType === "9" || formData.taxType === "18")
      totalGST = totalBeforeTax * 0.18;

    const totalAmount = Math.ceil(totalBeforeTax + totalGST);
    return {
      totalBeforeTax,
      totalGST,
      roundUp: totalAmount - (totalBeforeTax + totalGST),
      totalAmount,
    };
  };

  const totals = useMemo(calculateTotals, [formData]);

  /* ---------------- CHANGE DETECTION ---------------- */
  const isEdited = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  /* ---------------- SAVE ---------------- */
  const saveChanges = async () => {
    if (!updateItem) return;

    setLoading(true);
    await updateItem(quotation.id, {
      ...formData,
      customerName: selectedCustomer.name,
      customerGSTIN: selectedCustomer.gstin,
      updatedAt: new Date(),
      updatedBy: user?.email || "unknown",
    });
    setLoading(false);

    toast.success("Quotation updated successfully");
    navigate(ROUTES.QUOTATIONS, { state: { companyId, companyName } });
  };
  const renderActionButtons = () => {
    return (
      <>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
        >
          Cancel
        </button>
        <button
          disabled={!isEdited || loading}
          onClick={handlePreview}
          className={`px-4 py-2 rounded text-white ${
            !isEdited
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Update
        </button>
      </>
    );
  };

  useEffect(() => {
    if (loading) {
      handlePreview();
    }
  }, [loading]);

  const handlePreview = () => {
    const changes = getQuotationChanges(originalData, formData);

    if (changes.length === 0) {
      toast.info("No changes detected");
      return;
    }

    setModalAttr({
      title: "Review Changes",
      type: "info",
      content: (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {changes.map((c, idx) => (
            <div key={idx} className="p-3 border rounded">
              <p className="font-medium">{c.field}</p>
              <div className="flex gap-1 flex-col sm:flex-row">
                <p className="text-sm bg-red-100 p-1 rounded mt-1 sm:[width:50%] [width:100%]">
                  <span className="font-bold">Before: </span>
                  {String(c.before)}
                </p>
                <p className="text-sm bg-green-100 p-1 rounded mt-1 sm:[width:50%] [width:100%]">
                  <span className="font-bold">After: </span>
                  {String(c.after)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ),
      footer: (
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 border rounded"
            onClick={() => setShowConfirm(false)}
          >
            Cancel
          </button>
          <button
            className={
              "px-4 py-2 bg-green-600 text-white rounded " +
              (loading ? "opacity-50 cursor-not-allowed" : "")
            }
            onClick={saveChanges}
            disabled={loading}
          >
            {loading ? "Updating..." : "Confirm Update"}
          </button>
        </div>
      ),
    });

    setShowConfirm(true);
  };

  const handleModalClose = () => {
    setShowConfirm(false);
    setModalAttr({});
  };

  const isItemFieldChanged = (idx: number, field: string) => {
    return (
      formData?.items?.[idx]?.[field] !== originalData?.items?.[idx]?.[field]
    );
  };

  const resetItemField = (idx: number, field: string) => {
    setFormData((prev: any) => {
      const items = prev.items.map((item: any, i: number) =>
        i === idx
          ? {
              ...item,
              [field]: originalData.items[idx][field],
            }
          : item
      );

      return { ...prev, items };
    });
  };

  const renderItemChangesButton = (idx: number, field: string) => (
    <button
      type="button"
      onClick={() => resetItemField(idx, field)}
      className="absolute right-1 top-1/2 -translate-y-1/2 mr-2 bg-red-300 hover:bg-red-400 p-1 rounded-full
                   text-red-600 hover:text-white transition"
      title="Reset"
    >
      <RxReset size={12} />
    </button>
  );

  const getItemInputClass = (idx: number, field: string) =>
    isItemFieldChanged(idx, field) ? "bg-red-100 border-red-400 pr-8" : "";

  if (!formData) return <Loader />;

  const isInputChanged = (name: string) =>
    formData[name] !== originalData?.[name];

  const resetOriginalValue = (name: string) =>
    handleInputChange(name, originalData[name]);

  const renderResetInputButton = (name: string) => (
    <button
      type="button"
      onClick={() => {
        resetOriginalValue(name);
        if (name === "customerGSTIN") {
          setSelectedCustomer({
            id: originalData?.customerGSTIN,
            name: originalData?.customerName,
            gstin: originalData?.customerGSTIN,
            taxType: originalData?.taxType,
          });
          handleInputChange("taxType", originalData?.taxType);
        }
      }}
      className="absolute right-2 top-1/2 -translate-y-1/2 mr-5 bg-red-300 p-2 rounded text-red-500 hover:text-white hover:bg-red-400 transition opacity-0 pointer-events-none
      group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
      title="Reset to original"
    >
      <RxReset size={16} />
    </button>
  );

  const applyChangeItemClass = (name: string) =>
    isInputChanged(name) ? "bg-red-100 border-red-400" : "bg-white";

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-xl rounded-xl">
      <div className="flex gap-2 justify-between mb-4 items-start">
        <h1 className="text-2xl font-bold">Edit Quotation - {companyName}</h1>
        <div className="hidden md:flex gap-2">{renderActionButtons()}</div>
      </div>

      {/* Quote Info */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block font-medium mb-1">Quote Number</label>
          <InputWrap>
            <input
              type="number"
              value={formData.quoteNumber}
              onChange={(e) => handleInputChange("quoteNumber", e.target.value)}
              className={`w-full border rounded p-2 transition ${applyChangeItemClass(
                "quoteNumber"
              )}`}
            />
            {isInputChanged("quoteNumber")
              ? renderResetInputButton("quoteNumber")
              : null}
          </InputWrap>
        </div>
        <div>
          <label className="block font-medium mb-1">Quote Date</label>
          <InputWrap>
            <input
              type="date"
              value={formData.quoteDate}
              onChange={(e) => handleInputChange("quoteDate", e.target.value)}
              className={`w-full border rounded p-2 transition ${applyChangeItemClass(
                "quoteDate"
              )}`}
            />
            {isInputChanged("quoteDate")
              ? renderResetInputButton("quoteDate")
              : null}
          </InputWrap>
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1">Tax Type %</label>
          <InputWrap>
            <select
              value={formData.taxType}
              onChange={(e) => handleInputChange("taxType", e.target.value)}
              className={`w-full border rounded p-2 transition ${applyChangeItemClass(
                "taxType"
              )}`}
            >
              {TAX_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {isInputChanged("taxType")
              ? renderResetInputButton("taxType")
              : null}
          </InputWrap>
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1">Currency</label>
          <InputWrap>
            <select
              value={formData?.currency}
              name="currency"
              onChange={(e) =>
                handleInputChange(e?.target?.name, e?.target?.value)
              }
              className={`w-full border rounded p-2 transition ${applyChangeItemClass(
                "currency"
              )}`}
            >
              {globalCurrencies?.map((curr, idx) => (
                <option key={curr?.code + idx} value={curr?.code}>
                  {`${curr?.code} - ${curr?.name}`}
                </option>
              ))}
            </select>
            {isInputChanged("currency")
              ? renderResetInputButton("currency")
              : null}
          </InputWrap>
        </div>
        <div>
          <label className="block font-medium mb-1">Quotation Title</label>
          <InputWrap>
            <input
              type="text"
              value={formData?.title}
              name="title"
              placeholder={"Enter Quotation Title"}
              onChange={(e) =>
                handleInputChange(e.target?.name, e.target.value)
              }
              className={`w-full border rounded p-2 transition ${applyChangeItemClass(
                "title"
              )}`}
            />
            {isInputChanged("title") ? renderResetInputButton("title") : null}
          </InputWrap>
        </div>
        <div>
          <label className="block font-medium mb-1">Quotation Subtitle</label>
          <InputWrap>
            <input
              type="text"
              value={formData?.subTitle}
              name="subTitle"
              placeholder={"Enter Quotation Subtitle"}
              onChange={(e) =>
                handleInputChange(e.target?.name, e.target.value)
              }
              className={`w-full border rounded p-2 transition ${applyChangeItemClass(
                "subTitle"
              )}`}
            />
            {isInputChanged("subTitle")
              ? renderResetInputButton("subTitle")
              : null}
          </InputWrap>
        </div>
        <div>
          <label className="block font-medium mb-1">Delivery Terms</label>
          <InputWrap>
            <input
              type="text"
              name="delivery"
              value={formData.delivery}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              className={`w-full border rounded p-2 transition ${applyChangeItemClass(
                "delivery"
              )}`}
              placeholder="Delivery terms"
            />
            {isInputChanged("delivery")
              ? renderResetInputButton("delivery")
              : null}
          </InputWrap>
        </div>

        <div>
          <label className="block font-medium mb-1">Payment Terms</label>
          <InputWrap>
            <input
              type="text"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              className={`w-full border rounded p-2 transition ${applyChangeItemClass(
                "paymentTerms"
              )}`}
              placeholder="Payment terms"
            />
            {isInputChanged("paymentTerms")
              ? renderResetInputButton("paymentTerms")
              : null}
          </InputWrap>
        </div>

        <div>
          <label className="block font-medium mb-1">Freight</label>
          <InputWrap>
            <input
              type="text"
              name="freight"
              value={formData.freight}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              className={`w-full border rounded p-2 transition ${applyChangeItemClass(
                "freight"
              )}`}
              placeholder="Freight details"
            />
            {isInputChanged("freight")
              ? renderResetInputButton("freight")
              : null}
          </InputWrap>
        </div>

        <div>
          <label className="block font-medium mb-1">Validity</label>
          <InputWrap>
            <input
              type="text"
              name="validity"
              value={formData.validity}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              className={`w-full border rounded p-2 transition ${applyChangeItemClass(
                "validity"
              )}`}
              placeholder="Validity period"
            />
          </InputWrap>
          {isInputChanged("validity")
            ? renderResetInputButton("validity")
            : null}
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2">
            <label className="block font-medium mb-1">Customer</label>
            {selectedCustomer?.name && (
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">
                  - {selectedCustomer?.name} -{" "}
                </span>
                {selectedCustomer.gstin && (
                  <span className="ml-2 text-gray-500">
                    {selectedCustomer.gstin}
                  </span>
                )}
              </div>
            )}
          </div>
          <InputWrap>
            <CustomerDropdown
              customers={customers}
              value={selectedCustomer}
              onChange={(c) => {
                setSelectedCustomer(c);
                handleInputChange("taxType", c.taxType);
                handleInputChange("customerGSTIN", c.gstin);
                handleInputChange("customerName", c.name);
              }}
              className={`w-full border rounded p-2 transition ${applyChangeItemClass(
                "customerGSTIN"
              )}`}
            />
            {isInputChanged("customerGSTIN")
              ? renderResetInputButton("customerGSTIN")
              : null}
          </InputWrap>
        </div>
      </div>

      {/* Items */}
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 border w-[70px]">Sr</th>
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
            {formData.items.map((i: any, idx: number) => {
              return (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-1 border text-center">{idx + 1} </td>
                  <td className="px-2 py-1 border">
                    <InputWrap>
                      <input
                        type="text"
                        value={i.description}
                        onChange={(e) =>
                          handleItemChange(idx, "description", e.target.value)
                        }
                        className={`w-full border rounded p-1 transition ${getItemInputClass(
                          idx,
                          "description"
                        )}`}
                      />
                      {isItemFieldChanged(idx, "description")
                        ? renderItemChangesButton(idx, "description")
                        : null}
                    </InputWrap>
                  </td>
                  <td className="px-2 py-1 border">
                    <InputWrap>
                      <input
                        type="text"
                        value={i.hsnCode}
                        onChange={(e) =>
                          handleItemChange(idx, "hsnCode", e.target.value)
                        }
                        className={`w-full border rounded p-1 transition ${getItemInputClass(
                          idx,
                          "hsnCode"
                        )}`}
                      />
                      {isItemFieldChanged(idx, "hsnCode")
                        ? renderItemChangesButton(idx, "hsnCode")
                        : null}
                    </InputWrap>
                  </td>
                  <td className="px-2 py-1 border">
                    <InputWrap>
                      <input
                        type="number"
                        value={i.qty}
                        onChange={(e) =>
                          handleItemChange(idx, "qty", e.target.value)
                        }
                        className={`w-full border rounded p-1 transition ${getItemInputClass(
                          idx,
                          "qty"
                        )}`}
                      />
                      {isItemFieldChanged(idx, "qty")
                        ? renderItemChangesButton(idx, "qty")
                        : null}
                    </InputWrap>
                  </td>
                  <td className="px-2 py-1 border">
                    <InputWrap>
                      <input
                        type="text"
                        value={i.unit}
                        onChange={(e) =>
                          handleItemChange(idx, "unit", e.target.value)
                        }
                        className={`w-full border rounded p-1 transition ${getItemInputClass(
                          idx,
                          "unit"
                        )}`}
                      />
                      {isItemFieldChanged(idx, "unit")
                        ? renderItemChangesButton(idx, "unit")
                        : null}
                    </InputWrap>
                  </td>
                  <td className="px-2 py-1 border">
                    <InputWrap>
                      <input
                        type="number"
                        value={i.rate}
                        onChange={(e) =>
                          handleItemChange(idx, "rate", e.target.value)
                        }
                        className={`w-full border rounded p-1 transition ${getItemInputClass(
                          idx,
                          "rate"
                        )}`}
                      />
                      {isItemFieldChanged(idx, "rate")
                        ? renderItemChangesButton(idx, "rate")
                        : null}
                    </InputWrap>
                  </td>
                  <td className="px-2 py-1 border text-right">
                    {formatCurrency((i.qty * i.rate).toFixed(2))}
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
        {formData?.items.map((item: any, idx: number) => {
          return (
            <div key={idx} className="border rounded p-3 shadow-sm">
              <div className="flex gap-2 justify-between">
                <p className="font-medium text-gray-600 mb-2">
                  Item {idx + 1} - {(item.qty * item.rate).toFixed(2)}
                </p>
                {idx !== 0 && (
                  <div className="flex items-center justify-center h-full text-red-600 hover:text-red-800 cursor-pointer">
                    <FiTrash2
                      title="Remove this item"
                      onClick={() => handleRemoveItem(idx)}
                    />
                  </div>
                )}
              </div>
              <InputWrap>
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(idx, "description", e.target.value)
                  }
                  className={`w-full border rounded p-2 mb-2 transition ${getItemInputClass(
                    idx,
                    "description"
                  )}`}
                />
                {isItemFieldChanged(idx, "description")
                  ? renderItemChangesButton(idx, "description")
                  : null}
              </InputWrap>
              <InputWrap>
                <input
                  type="text"
                  placeholder="HSN Code"
                  value={item.hsnCode}
                  onChange={(e) =>
                    handleItemChange(idx, "hsnCode", e.target.value)
                  }
                  className={`w-full border rounded p-2 mb-2 transition ${getItemInputClass(
                    idx,
                    "hsnCode"
                  )}`}
                />
                {isItemFieldChanged(idx, "hsnCode")
                  ? renderItemChangesButton(idx, "hsnCode")
                  : null}
              </InputWrap>
              <div className="grid grid-cols-2 gap-2">
                <InputWrap>
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) =>
                      handleItemChange(idx, "qty", e.target.value)
                    }
                    className={`w-full border rounded p-2 mb-2 transition ${getItemInputClass(
                      idx,
                      "qty"
                    )}`}
                  />
                  {isItemFieldChanged(idx, "qty")
                    ? renderItemChangesButton(idx, "qty")
                    : null}
                </InputWrap>
                <InputWrap>
                  <input
                    type="text"
                    placeholder="Unit"
                    value={item.unit}
                    onChange={(e) =>
                      handleItemChange(idx, "unit", e.target.value)
                    }
                    className={`w-full border rounded p-2 mb-2 transition ${getItemInputClass(
                      idx,
                      "unit"
                    )}`}
                  />
                  {isItemFieldChanged(idx, "unit")
                    ? renderItemChangesButton(idx, "unit")
                    : null}
                </InputWrap>
              </div>
              <InputWrap>
                <input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) =>
                    handleItemChange(idx, "rate", e.target.value)
                  }
                  className={`w-full border rounded p-2 mb-2 transition ${getItemInputClass(
                    idx,
                    "rate"
                  )}`}
                />
                {isItemFieldChanged(idx, "rate")
                  ? renderItemChangesButton(idx, "rate")
                  : null}
              </InputWrap>{" "}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleAddItem}
        className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"
      >
        <BsFillPlusCircleFill /> Item
      </button>

      {/* Totals */}
      <div className="text-right mt-4">
        <p>Subtotal: {formatCurrency(totals.totalBeforeTax)}</p>
        <p>GST: {formatCurrency(totals.totalGST)}</p>
        <p>Round Up: {formatCurrency(totals.roundUp)}</p>
        <p className="font-bold">Total: {formatCurrency(totals.totalAmount)}</p>
      </div>

      <p className="text-right mt-2">
        (In words): {numberToWords(totals.totalAmount, formData.currency)}
      </p>

      {/* Footer */}
      <div className=" fixed bottom-0 left-0 right-0 z-30 bg-white border-t px-4 py-3 flex justify-around sm:justify-end gap-3 md:static md:mt-6 md:border-0 md:bg-transparent">
        {renderActionButtons()}
      </div>

      {/* Confirm Modal */}
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
