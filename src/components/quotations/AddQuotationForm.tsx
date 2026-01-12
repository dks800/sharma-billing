import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuotations } from "../../hooks/useInvoices";
import { useClients } from "../../hooks/useClients";
import { getNextBillNumber, getFinancialYear } from "../../utils/billingHelper";
import CustomerDropdown, { Client } from "../customer/CustomerDropdown";
import { formatCurrency, numberToWords } from "../../utils/commonUtils";
import Modal from "../common/Modal";
import {
  COLLECTIONS,
  globalCurrencies,
  ROUTES,
  TAX_TYPES,
} from "../../constants";
import { FiTrash2 } from "react-icons/fi";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { auth } from "../../firebase";
import { toast } from "react-toastify";
import Loader from "../Loader";

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

export default function AddQuotationForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const copyFrom = location?.state?.copyFrom;
  const companyId = location.state?.companyId;
  const companyName = location.state?.companyName || "Select a Parent Company";
  const [user, setUser] = useState<any>(null);
  const { data: allClients = [] } = useClients();
  if (!companyId) {
    return <Loader />;
  }
  const {
    addItem: addQuotation,
    error,
    data: existingQuotations,
  } = useQuotations(companyId || null);

  const [autoQuoteNumber, setAutoQuoteNumber] = useState("");
  const [loadingBillNumber, setLoadingBillNumber] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<any>({
    quoteNumber: "",
    quoteDate: new Date().toISOString().substring(0, 10),
    currency: "INR",
    taxType: "0",
    title: "",
    subTitle: "As per your requirements",
    internalComments: "",
    externalComments: "",
    items: [{ description: "", hsnCode: "8464", qty: 1, unit: "pcs", rate: 0 }],
    delivery:
      "Within 1 month after receiving Purchase Order and advance payment",
    paymentTerms: "60% Advance Payment with PO and 40% before dispatch",
    freight: "Extra and Ex-works HQT Factory",
    validity: "Document is valid up to next 15 days from quotation date",
  });

  useEffect(() => {
    if (
      copyFrom &&
      Object.keys(copyFrom).length > 0 &&
      copyFrom?.items?.length > 0
    ) {
      setFormData({ ...copyFrom });
    }
  }, [copyFrom]);

  const [modalAttr, setModalAttr] = useState<ModalAttrType>({
    title: "",
    type: "",
    content: null,
    footer: null,
  });

  const [customers, setCustomers] = useState<Client[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Client>(
    {} as Client
  );

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

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

    if (!formData?.quoteNumber) {
      setLoadingBillNumber(true);
      getNextBillNumber(companyId, "quoteNumber", COLLECTIONS.QUOTATIONS)
        .then((nextNo) => {
          setFormData((prev: any) => ({ ...prev, quoteNumber: nextNo }));
          setAutoQuoteNumber(nextNo);
        })
        .finally(() => setLoadingBillNumber(false));
    }
  }, [companyId, formData?.quoteNumber, navigate]);

  const MAX_ITEMS = 170;

  const handleAddItem = (count = 1) => {
    setFormData((prev: any) => {
      if (prev.items.length + count > MAX_ITEMS) {
        toast.warning("Maximum items limit reached");
        return prev;
      }

      const newItems = Array.from({ length: count }, () => ({
        description: "",
        hsnCode: "8464",
        qty: 1,
        unit: "",
        rate: 0,
      }));

      return {
        ...prev,
        items: [...prev.items, ...newItems],
      };
    });
  };

  const handleRemoveItem = (index: number) => {
    const updated: any = [...formData?.items]?.filter(
      (_, idx) => idx !== index
    );
    setFormData((prev: any) => ({ ...prev, items: updated }));
  };

  const handleItemChange = (index: number, field: keyof Item, value: any) => {
    const updated: any = [...formData?.items];
    updated[index][field] =
      field === "qty" || field === "rate" ? Number(value) : value;
    setFormData((prev: any) => ({ ...prev, items: updated }));
  };

  const calculateTotals = () => {
    let totalBeforeTax = 0;
    let totalGST = 0;

    formData?.items.forEach((item: any) => {
      const amount = item.qty * item.rate;
      totalBeforeTax += amount;
    });
    if (formData?.taxType === "NA" || formData?.taxType === "0") {
      totalGST = 0;
    } else if (formData?.taxType === "2.5") {
      totalGST = totalBeforeTax * 0.05;
    } else if (formData?.taxType === "9" || formData?.taxType === "18") {
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
    // pass whole formData here
    await addQuotation({
      companyId,
      companyName,
      title: formData?.title,
      subTitle: formData?.subTitle || "",
      quoteNumber: formData?.quoteNumber,
      quoteDate: formData?.quoteDate,
      financialYear: getFinancialYear(new Date(formData?.quoteDate)),
      customerGSTIN: selectedCustomer?.gstin,
      customerName: selectedCustomer?.name,
      items: formData?.items,
      totalBeforeTax: totals.totalBeforeTax,
      totalGST: totals.totalGST,
      roundUp: totals.roundUp,
      totalAmount: totals.totalAmount,
      currency: formData?.currency,
      internalComments: formData?.internalComments,
      externalComments: formData?.externalComments,
      delivery: formData.delivery,
      paymentTerms: formData.paymentTerms,
      freight: formData.freight,
      validity: formData.validity,
      taxType: formData?.taxType,
      createdAt: new Date(),
      createdBy: user?.email || "unknown",
    });
    setLoading(false);

    if (!error) {
      toast.success("Quotation saved successfully!");
      navigate(ROUTES?.QUOTATIONS, { state: { companyId, companyName } });
    } else {
      toast.error(`Something went wrong! - ${error ?? ""}`);
    }
  };

  const handleSave = async () => {
    let errorMsg = "";
    if (!companyId) errorMsg = "Select a company first!";
    if (!selectedCustomer?.gstin)
      errorMsg = "Customer Missing. Please select a customer";
    if (!addQuotation) errorMsg = "Hook not ready. Reload App!";
    const totals = calculateTotals();
    const duplicateBill = existingQuotations.find(
      (b: any) => b.quoteNumber === formData?.quoteNumber
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

    const duplicateClientAmount = existingQuotations.find(
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

    if (formData?.quoteNumber !== autoQuoteNumber) {
      setShowConfirm(true);
      setModalAttr({
        title: "Warning!",
        content: `You have changed the auto-generated Bill Number \nfrom: ${autoQuoteNumber} \nto: ${formData?.quoteNumber}. \nDo you want to continue?`,
        type: "warning",
        footer: getBillNumberChangeWarningFooter(),
      });
      return;
    }
    saveFinalCall();
  };

  const clearForm = () => {
    handleInputChange("quoteDate", new Date().toISOString().substring(0, 10));
    setFormData((prev: any) => ({
      ...prev,
      items: [{ description: "", hsnCode: "", qty: 1, unit: "pcs", rate: 0 }],
    }));
    // todo: set formdata here - internalComments,  externalComments, quoteDate, items
    setSelectedCustomer({} as Client);
    // setItems([{ description: "", hsnCode: "", qty: 1, unit: "pcs", rate: 0 }]);
  };

  const totals = calculateTotals();

  const getGstPercent = () => {
    if (!formData?.taxType) return "";
    if (formData?.taxType === "NA") return "(NA)";
    if (formData?.taxType !== "18") {
      return `(${formData?.taxType} + ${formData?.taxType})%`;
    }
    return formData?.taxType + "%";
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
          className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Saving..." : "Yes, Save Anyway"}
        </button>
      </>
    );
  };

  const handleInputChange = (name: string, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-xl rounded-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{`${companyName} #${formData?.quoteNumber}`}</h1>
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
          <label className="block font-medium mb-1">Quote Number</label>

          <div className="relative">
            <input
              type="number"
              value={formData?.quoteNumber}
              name="quoteNumber"
              placeholder={
                loadingBillNumber ? "Loading..." : "Enter Quote Number"
              }
              onChange={(e) =>
                handleInputChange(e.target?.name, e.target.value)
              }
              className="w-full border rounded p-2 pr-10"
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
          <label className="block font-medium mb-1">Quote Date</label>
          <input
            type="date"
            name="quoteDate"
            value={formData?.quoteDate}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="flex w-full gap-2">
          <div className="flex-1">
            <label className="block font-medium mb-1">Tax Type %</label>
            <select
              name="taxType"
              value={formData?.taxType}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
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
              value={formData?.currency}
              name="currency"
              onChange={(e) =>
                handleInputChange(e?.target?.name, e?.target?.value)
              }
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
          <label className="block font-medium mb-1">Quotation Title</label>
          <input
            type="text"
            value={formData?.title}
            name="title"
            placeholder={"Enter Quotation Title"}
            onChange={(e) => handleInputChange(e.target?.name, e.target.value)}
            className="w-full border rounded p-2 pr-10"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Quotation Subtitle</label>
          <input
            type="text"
            value={formData?.subTitle}
            name="subTitle"
            placeholder={"Enter Quotation Subtitle"}
            onChange={(e) => handleInputChange(e.target?.name, e.target.value)}
            className="w-full border rounded p-2 pr-10"
          />
        </div>
      </div>

      {/* Customer */}
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

          <CustomerDropdown
            customers={customers}
            value={selectedCustomer}
            onChange={(c) => {
              setSelectedCustomer(c);
              handleInputChange("taxType", c.taxType || "NA");
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
                <th className="px-2 py-1 border w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              {formData?.items.map((item: any, idx: number) => (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-1 border text-center">{idx + 1}</td>
                  <td className="px-2 py-1 border">
                    <input
                      type="text"
                      value={item.description}
                      maxLength={56}
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards on mobile */}
        <div className="sm:hidden flex flex-col gap-4">
          {formData?.items.map((item: any, idx: number) => (
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

        {formData?.items?.length < 170 ? ( //todo: update max items
          <div className="flex flex-row gap-3">
            <button
              type="button"
              onClick={() => handleAddItem(1)}
              className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              <div className="flex flex-row items-center gap-1">
                <BsFillPlusCircleFill /> Item
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleAddItem(5)}
              className="mt-3 bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded"
            >
              <div className="flex flex-row items-center gap-1">
                <BsFillPlusCircleFill /> 5 Items
              </div>
            </button>
          </div>
        ) : (
          <div className="bg-yellow-50 rounded text-bold p-2">
            Warning! Maximum items reached
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
        <div>
          <label className="block font-medium mb-1">Delivery</label>
          <input
            type="text"
            name="delivery"
            value={formData.delivery}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className="border rounded px-2 py-1 w-full"
            placeholder="Delivery terms"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Payment Terms</label>
          <input
            type="text"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className="border rounded px-2 py-1 w-full"
            placeholder="Payment terms"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Freight</label>
          <input
            type="text"
            name="freight"
            value={formData.freight}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className="border rounded px-2 py-1 w-full"
            placeholder="Freight details"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Validity</label>
          <input
            type="text"
            name="validity"
            value={formData.validity}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className="border rounded px-2 py-1 w-full"
            placeholder="Validity period"
          />
        </div>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 p-3 rounded mb-4 text-right flex flex-col sm:flex-row gap-3 justify-between">
        <div className="w-full sm:w-1/2 flex gap-2 flex-wrap">
          <textarea
            id="comments"
            rows={4}
            name="internalComments"
            value={formData?.internalComments}
            placeholder="Internal Comments (optional)"
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            id="external-comments"
            rows={4}
            name="externalComments"
            value={formData?.externalComments}
            placeholder="External Comments (optional)"
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <p className="mt-4 mb-8 sm:mb-4 font-semibold text-right">
        (In words):{" "}
        {numberToWords(
          Math.round(Number(totals.totalAmount.toFixed(2))),
          formData?.currency
        )}
      </p>

      {/* Footer Buttons */}
      {/* <div className="flex flex-col sm:flex-row gap-3 justify-end"> */}
      <div className=" fixed bottom-0 left-0 right-0 z-30 bg-white border-t px-4 py-3 flex justify-around sm:justify-end gap-3 md:static md:mt-6 md:border-0 md:bg-transparent">

        <button
          className="bg-gray-400 text-white px-4 py-2 rounded"
          onClick={() =>
            navigate(ROUTES?.QUOTATIONS, { state: { companyId, companyName } })
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
          disabled={loading || loadingBillNumber}
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
