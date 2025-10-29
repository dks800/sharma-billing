import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEdit } from "react-icons/fi";
import { PAYMENT_STATUSES, ROUTES } from "../../constants";
import { usePurchaseBill } from "../../hooks/useInvoices";
import CustomerDropdown, { Client } from "../customer/CustomerDropdown";
import { useClients } from "../../hooks/useClients";
import { handleError } from "../../utils/errorHandler";

const EditPurchaseBillForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const bill = location.state?.bill;
  const companyId = location.state?.companyId;
  const companyName = location.state?.companyName;

  const { updateItem } = usePurchaseBill(companyId);
  const { data: allClients = [] } = useClients();

  const [customers, setCustomers] = useState<Client[]>([]);

  useEffect(() => {
    const companyClients = allClients.map(({ name, taxType, gstin }) => ({
      name,
      taxType,
      gstin,
    }));
    setCustomers(companyClients as any);
  }, [allClients]);

  const [formData, setFormData] = useState({
    supplierName: bill?.supplierName || "",
    supplierGstin: bill?.supplierGstin || "",
    paymentStatus: bill?.paymentStatus || "Pending",
    billNumber: bill?.billNumber || "",
    supplier: bill?.supplier || null,
    billDate: bill?.billDate || "",
    totalAmount: bill?.totalAmount || "",
    totalGST: bill?.totalGST || "",
    remarks: bill?.remarks || "",
    taxType: bill?.taxType || "",
    ewayBillNo: bill?.ewayBillNo || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isEdited = (field: keyof typeof formData) =>
    formData[field]?.toString().trim() !== bill?.[field]?.toString().trim();

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

    const isChanged = Object.keys(formData).some(
      (key) => (formData as any)[key] !== bill[key]
    );

    if (!isChanged) {
      toast.warn("No changes detected!");
      return;
    }

    try {
      setIsUpdating(true);
      await updateItem(bill?.id, {
        ...formData,
        updatedAt: new Date(),
      });
      toast.success("✅ Purchase bill updated successfully!");
      navigate(ROUTES?.PURCHASE, { state: { companyId, companyName } });
    } catch (error) {
      console.error("Error updating purchase bill:", error);
      handleError(error, "Failed to update purchase bill!");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-xl rounded-xl">
      <h1 className="text-2xl font-bold mb-4">{companyName}</h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* Supplier */}
        <div
          className={`flex-1 w-full ${
            isEdited("supplierName") ? "bg-blue-100 p-1 rounded" : ""
          }`}
        >
          <label className="block mb-1 font-medium flex items-center gap-1">
            Supplier Name *
            {isEdited("supplierName") && <FiEdit className="text-blue-500" />}
          </label>
          <CustomerDropdown
            customers={customers}
            value={formData.supplier}
            onChange={(c) => {
              setFormData((prev) => ({
                ...prev,
                supplier: c,
                supplierName: c?.name || "",
                supplierGstin: c?.gstin || "",
              }));
            }}
          />
        </div>
        <div
          className={`${
            isEdited("billNumber") ? "bg-blue-100 p-1 rounded" : ""
          }`}
        >
          <label className="block mb-1 font-medium flex items-center gap-1">
            Bill Number *
            {isEdited("billNumber") && <FiEdit className="text-blue-500" />}
          </label>
          <input
            type="text"
            name="billNumber"
            value={formData.billNumber}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div
          className={`${isEdited("billDate") ? "bg-blue-100 p-1 rounded" : ""}`}
        >
          <label className="block mb-1 font-medium flex items-center gap-1">
            Bill Date *
            {isEdited("billDate") && <FiEdit className="text-blue-500" />}
          </label>
          <input
            type="date"
            name="billDate"
            value={formData.billDate}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div
          className={`${
            isEdited("paymentStatus") ? "bg-blue-100 p-1 rounded" : ""
          }`}
        >
          <label className="block mb-1 font-medium flex items-center gap-1">
            Payment Status
            {isEdited("paymentStatus") && <FiEdit className="text-blue-500" />}
          </label>
          <select
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div
          className={`${
            isEdited("totalAmount") ? "bg-blue-100 p-1 rounded" : ""
          }`}
        >
          <label className="block mb-1 font-medium flex items-center gap-1">
            Total Amount (₹) *
            {isEdited("totalAmount") && <FiEdit className="text-blue-500" />}
          </label>
          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div
          className={`${
            isEdited("totalAmount") ? "bg-blue-100 p-1 rounded" : ""
          }`}
        >
          <label className="block mb-1 font-medium flex items-center gap-1">
            Total GST (₹)
            {isEdited("totalGST") && <FiEdit className="text-blue-500" />}
          </label>
          <input
            type="number"
            name="totalGST"
            value={formData.totalGST}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div
          className={`sm:col-span-2 ${
            isEdited("remarks") ? "bg-blue-100 p-1 rounded" : ""
          }`}
        >
          <label className="block mb-1 font-medium flex items-center gap-1">
            Remarks
            {isEdited("remarks") && <FiEdit className="text-blue-500" />}
          </label>
          <textarea
            name="remarks"
            rows={3}
            value={formData.remarks}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            placeholder="Optional notes..."
          />
        </div>

        {/* Actions */}
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
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Bill"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPurchaseBillForm;
