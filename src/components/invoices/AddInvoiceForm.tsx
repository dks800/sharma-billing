import React, { useState, useEffect } from "react";
// import { useInvoices } from "../../hooks/useInvoices";
import { useCompanies } from "../../hooks/useCompanies";
import { GST_OPTIONS, UNIT_OPTIONS } from "../../constants";
import { getFinancialYear } from "../../utils/commonUtils";
import Modal from "../common/Modal";

type InvoiceItem = {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  unit: string;
  gstRate: number;
  amount: number;
};

type AddInvoiceFormProps = {
  onSaved?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isPurchase?: boolean;
};

export default function AddInvoiceForm({
  onSaved,
  isOpen,
  onClose,
  isPurchase,
}: AddInvoiceFormProps) {
  // const { addItem: addInvoice } = useInvoices();
  const { data: companies } = useCompanies();
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [showSelectCompany, setShowSelectCompany] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const finYear = getFinancialYear(new Date(date));
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 1,
      description: "",
      quantity: 1,
      rate: 0,
      gstRate: 0,
      amount: 0,
      unit: "set",
    },
  ]);
  const [roundoff, setRoundoff] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = items.reduce(
    (sum, item) => sum + (item.amount * item.gstRate) / 100,
    0
  );
  const total = subtotal + gstAmount + roundoff;

  useEffect(() => {
    if (companies?.length && companyId) {
      const selected = companies?.find((c) => c.id === companyId);
      setSelectedCompanyName(selected?.name || "");
    }
  }, [companyId]);
  console.log("isOpen --->", isOpen);

  const handleItemChange = (
    id: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "rate" || field === "gstRate"
                  ? Number(value)
                  : value,
              amount:
                field === "quantity" || field === "rate"
                  ? (field === "quantity" ? Number(value) : item.quantity) *
                    (field === "rate" ? Number(value) : item.rate)
                  : item.amount,
            }
          : item
      )
    );
  };

  const addNewItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        description: "",
        quantity: 0,
        rate: 0,
        gstRate: 0,
        amount: 0,
        unit: "set",
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      alert("Please select a company");
      return;
    }
    try {
      // await addInvoice({
      //   companyId,
      //   date,
      //   items,
      //   subtotal,
      //   gstAmount,
      //   total,
      //   roundoff,
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      //   financialYear: finYear,
      // });
      alert("Invoice saved!");
      onSaved && onSaved(); // Close modal
    } catch (error) {
      alert("Error saving invoice");
    }
  };

  if (!isOpen) return null;

  const ActionButtons = () => {
    return (
      <div className="flex gap-4 flex-row justify-end">
        <button
          onClick={() => {
            setCompanyId("");
            onClose?.();
          }}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save Invoice
        </button>
      </div>
    );
  };

  if (!companyId || showSelectCompany) {
    return (
      <Modal isOpen={true} onClose={() => false}>
        <h2 className="text-2xl font-semibold mb-4">Select Company</h2>
        <select
          className="block w-full border rounded p-2"
          value={companyId}
          onChange={(e) => {
            setCompanyId(e.target.value);
            setShowSelectCompany(false);
          }}
          required
        >
          <option value="">Select Company</option>
          {companies?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Modal>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="p-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Create Invoice</h2>
          <ActionButtons />

          {/* Company select */}
          <label className="block mb-2">Company: {selectedCompanyName}</label>
          <button
            onClick={() => setShowSelectCompany(true)}
            className="bg-gray-300 px-2 py-2 rounded"
          >
            Change Company
          </button>

          {/* Date */}
          <label className="block mb-4">
            Invoice Date
            <input
              type="date"
              className="block w-full border rounded p-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <table className="w-full border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Sr No</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Unit</th>
                <th className="border p-2">Rate</th>
                <th className="border p-2">GST %</th>
                <th className="border p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map(
                ({
                  id,
                  description,
                  quantity,
                  rate,
                  gstRate,
                  amount,
                  unit,
                }) => (
                  <tr key={id}>
                    <td className="border p-2 text-center">{id}</td>
                    <td className="border p-2">
                      <input
                        type="text"
                        className="w-full p-1 border rounded"
                        value={description}
                        onChange={(e) =>
                          handleItemChange(id, "description", e.target.value)
                        }
                        required
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        className="w-full p-1 border rounded"
                        value={quantity}
                        min={1}
                        onChange={(e) =>
                          handleItemChange(id, "quantity", e.target.value)
                        }
                        required
                      />
                    </td>
                    <td className="border p-2">
                      <select
                        className="w-full p-1 border rounded"
                        value={unit}
                        onChange={(e) =>
                          handleItemChange(id, "unit", e.target.value)
                        }
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        className="w-full p-1 border rounded"
                        value={rate}
                        min={0}
                        step="0.01"
                        onChange={(e) =>
                          handleItemChange(id, "rate", e.target.value)
                        }
                        required
                      />
                    </td>
                    <td className="border p-2">
                      <select
                        className="w-full p-1 border rounded"
                        value={gstRate}
                        onChange={(e) =>
                          handleItemChange(id, "gstRate", e.target.value)
                        }
                      >
                        {GST_OPTIONS.map((rate) => (
                          <option key={rate} value={rate}>
                            {rate}%
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border p-2 text-right">
                      {amount.toFixed(2)}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <button
            type="button"
            onClick={addNewItem}
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Item
          </button>

          <div className="mb-4 flex gap-4">
            <label className="flex flex-col flex-1">
              Roundoff
              <input
                type="number"
                value={roundoff}
                step="0.01"
                className="p-2 border rounded"
                onChange={(e) => setRoundoff(Number(e.target.value))}
              />
            </label>
          </div>

          {/* Totals */}
          <div className="text-right mb-4 space-y-1">
            <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
            <div>GST Amount: ₹{gstAmount.toFixed(2)}</div>
            <div>Total: ₹{total.toFixed(2)}</div>
          </div>
          <ActionButtons />
        </form>
      </div>
    </div>
  );
}
