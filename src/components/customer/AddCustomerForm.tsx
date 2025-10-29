import { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { TAX_TYPES } from "../../constants";

interface AddCustomerFormProps {
  initialData?: any | null;
  onSave: (data: any) => Promise<void>;
}

const AddCustomerForm = ({ initialData, onSave }: AddCustomerFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    poc: "",
    email: "",
    phone: "",
    gstin: "",
    lutArn: "",
    taxType: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

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
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        placeholder="Client Name *"
        value={formData.name}
        onChange={handleChange}
        required
        className="border p-2 rounded w-full"
      />
      <input
        type="text"
        name="gstin"
        placeholder="GSTIN"
        value={formData.gstin}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      />
      <input
        type="text"
        name="lutArn"
        placeholder="Lut/ARN"
        value={formData.lutArn}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      />
      <input
        type="text"
        name="poc"
        placeholder="POC"
        value={formData.poc}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      />
      <input
        type="text"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      />
      <select
        name="taxType"
        value={formData.taxType}
        onChange={handleChange}
        className="border p-2 rounded w-full"
        required
      >
        <option value="">Select Tax Type</option>
        {
          TAX_TYPES?.map((tax) => (
            <option key={tax} value={tax}>
              {(tax === "NA" || tax === "18") ? tax : `${tax} + ${tax}`}
            </option>
          ))
        }
      </select>

      <textarea
        name="address"
        placeholder="Address *"
        value={formData.address}
        onChange={handleChange}
        required
        className="border p-2 w-full rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-green-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-green-600 ${loading ? "cursor-not-allowed opacity-70" : ""
          }`}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <FiPlus />
        )}
        {loading ? "" : initialData ? "Update" : "Save"}
      </button>
    </form>
  );
};

export default AddCustomerForm;
