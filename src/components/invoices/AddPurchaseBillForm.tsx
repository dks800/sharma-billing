import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PAYMENT_STATUSES, ROUTES, TAX_TYPES } from "../../constants";
import { formatDate } from "../../utils/commonUtils";
import { usePurchaseBill } from "../../hooks/useInvoices";
import CustomerDropdown, { Client } from "../customer/CustomerDropdown";
import { useClients } from "../../hooks/useClients";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { handleError } from "../../utils/errorHandler";

const AddPurchaseBillForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const companyId = location.state?.companyId;
  const companyName = location.state?.companyName;
  const [customers, setCustomers] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const { addItem } = usePurchaseBill(companyId);
  const { data: allClients = [] } = useClients();

  useEffect(() => {
    const companyClients = allClients.map(({ name, taxType, gstin }) => ({
      name,
      taxType,
      gstin,
    }));
    setCustomers(companyClients as any);
  }, [allClients]);

  const [formData, setFormData] = useState({
    supplierName: "",
    supplierGstin: "",
    paymentStatus: "Pending",
    billNumber: "",
    supplier: null as Client | null,
    billDate: formatDate(new Date().toISOString()),
    totalAmount: "",
    totalGST: "",
    remarks: "",
    taxType: "",
    ewayBillNo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.supplierName ||
      !formData.billNumber ||
      !formData.totalAmount
    ) {
      toast.error("Please fill all mandatory fields!");
      return;
    }
    try {
      setLoading(true);
      await addItem({
        ...formData,
        companyId,
        createdAt: new Date(),
      });
      toast.success("Purchase bill added successfully!");
      navigate(ROUTES?.PURCHASE, { state: { companyId, companyName } });
    } catch (error) {
      console.error("Error adding purchase bill:", error);
      handleError(error, "Failed to add purchase bill!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-xl rounded-xl">
      <h1 className="text-2xl font-bold mb-4">{companyName}</h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="flex-1 w-full">
          <label className="block mb-1 font-medium">Supplier Name *</label>
          <CustomerDropdown
            customers={customers}
            value={formData.supplier}
            onChange={(c) => {
              handleChange({
                target: {
                  name: "supplier",
                  value: c,
                },
              } as any);
              setFormData((prev) => ({
                ...prev,
                supplierName: c?.name || "",
                supplierGstin: c?.gstin || "",
              }));
            }}
          />
          <button
            className="bg-blue-500 hover:bg-blue-800 text-white px-3 py-2 mt-2 rounded"
            onClick={() => navigate(ROUTES?.CUSTOMERS)}
          >
            <div className="flex flex-row items-center gap-1">
              <BsFillPlusCircleFill /> Customer
            </div>
          </button>
        </div>
        <div>
          <label className="block mb-1 font-medium">Bill Number *</label>
          <input
            type="text"
            name="billNumber"
            placeholder="Enter Bill Number"
            value={formData.billNumber}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Bill Date *</label>
          <input
            type="date"
            name="billDate"
            placeholder="Select Bill Date"
            value={formData.billDate}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Payment Status</label>
          <select
            name="paymentStatus"
            value={formData?.paymentStatus}
            onChange={handleChange}
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
          <label className="block mb-1 font-medium">Total Amount (₹) *</label>
          <input
            type="number"
            placeholder="Enter Total Amount"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Total GST (₹)</label>
          <input
            type="number"
            placeholder="Enter Total GST"
            name="totalGST"
            value={formData.totalGST}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Tax Type %</label>
          <select
            name="taxType"
            value={formData?.taxType}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            {TAX_TYPES?.map((tax) => (
              <option key={tax} value={tax}>
                {tax === "NA" || tax === "18" ? tax : `${tax} + ${tax}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Eway Bill No.</label>
          <input
            type="text"
            placeholder="Enter Eway Bill No."
            name="ewayBillNo"
            value={formData.ewayBillNo}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block mb-1 font-medium">Remarks</label>
          <textarea
            name="remarks"
            rows={3}
            value={formData.remarks}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            placeholder="Optional notes or comments..."
          />
        </div>

        <div className="flex justify-end gap-3 sm:col-span-2 mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {loading ? "Saving..." : "Save Bill"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPurchaseBillForm;
