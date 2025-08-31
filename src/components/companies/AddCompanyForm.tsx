import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useCompanies } from "../../hooks/useCompanies";
import { TypeCompany, BankAccount } from "../../pages/CompanyList";
import { ButtonLoader } from "../Loader";

interface CompanyFormProps {
  onCompanyAdded: () => void;
  editCompany?: TypeCompany | null;
}

export default function AddCompanyForm({
  onCompanyAdded,
  editCompany,
}: CompanyFormProps) {
  const { addItem, updateItem } = useCompanies();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    gstin: "",
    owner: "",
    contactNumber: "",
    email: "",
    website: "",
    establishmentDate: "",
    lutArn: "",
    ieCode: "",
    msme: "",
    bankAccounts: [] as BankAccount[],
  });

  useEffect(() => {
    if (editCompany) {
      setFormData({
        name: editCompany.name || "",
        address: editCompany.address || "",
        gstin: editCompany.gstin || "",
        owner: editCompany.owner || "",
        contactNumber: editCompany.contactNumber || "",
        email: editCompany.email || "",
        website: editCompany.website || "",
        establishmentDate: editCompany.establishmentDate || "",
        lutArn: editCompany.lutArn || "",
        ieCode: editCompany.ieCode || "",
        msme: editCompany.msme || "",
        bankAccounts: editCompany.bankAccounts || [],
      });
    }
  }, [editCompany]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBankChange = (
    index: number,
    field: keyof BankAccount,
    value: string
  ) => {
    const updatedAccounts = [...formData.bankAccounts];
    updatedAccounts[index][field] = value;
    setFormData({ ...formData, bankAccounts: updatedAccounts });
  };

  const addBankAccount = () => {
    setFormData({
      ...formData,
      bankAccounts: [
        ...formData.bankAccounts,
        { bankName: "", accountNumber: "", branch: "", city: "", ifsc: "" },
      ],
    });
  };

  const removeBankAccount = (index: number) => {
    const updatedAccounts = [...formData.bankAccounts];
    updatedAccounts.splice(index, 1);
    setFormData({ ...formData, bankAccounts: updatedAccounts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, address, gstin, owner } = formData;
    if (!name || !address || !gstin || !owner) {
      return alert(
        "Please fill all required fields: Company Name, Address, GSTIN, Owner"
      );
    }

    try {
      setLoading(true);
      if (editCompany && editCompany.id) {
        await updateItem(editCompany.id, {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        await addItem({
          ...formData,
          createdAt: new Date(),
        });
      }

      setFormData({
        name: "",
        address: "",
        gstin: "",
        owner: "",
        contactNumber: "",
        email: "",
        website: "",
        establishmentDate: "",
        lutArn: "",
        ieCode: "",
        msme: "",
        bankAccounts: [],
      });

      onCompanyAdded();
    } catch (error) {
      console.error("Error saving company:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Company Name *"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <textarea
          name="address"
          placeholder="Address *"
          value={formData.address}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="text"
          name="gstin"
          placeholder="GSTIN *"
          value={formData.gstin}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="text"
          name="owner"
          placeholder="Owner *"
          value={formData.owner}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="tel"
          name="contactNumber"
          placeholder="Contact Number"
          value={formData.contactNumber}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="url"
          name="website"
          placeholder="Website"
          value={formData.website}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="date"
          name="establishmentDate"
          value={formData.establishmentDate}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="lutArn"
          placeholder="LUT/ARN"
          value={formData.lutArn}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="ieCode"
          placeholder="IE Code"
          value={formData.ieCode}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="msme"
          placeholder="MSME"
          value={formData.msme}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold mb-2">Bank Accounts (optional)</h3>
        <div className="space-y-4">
          {formData.bankAccounts.map((account, index) => (
            <div key={index}>
              {index > 0 && <hr className="my-2 border-gray-300" />}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={account.bankName}
                  onChange={(e) =>
                    handleBankChange(index, "bankName", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={account.accountNumber}
                  onChange={(e) =>
                    handleBankChange(index, "accountNumber", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Branch"
                  value={account.branch}
                  onChange={(e) =>
                    handleBankChange(index, "branch", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={account.city}
                  onChange={(e) =>
                    handleBankChange(index, "city", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="IFSC"
                  value={account.ifsc}
                  onChange={(e) =>
                    handleBankChange(index, "ifsc", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => removeBankAccount(index)}
                  className="text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <FiTrash2 /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addBankAccount}
          className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
        >
          <FiPlus /> Add Bank Account
        </button>
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2 justify-center ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? <ButtonLoader /> : <FiPlus />}
        {loading
          ? editCompany
            ? "Updating..."
            : "Saving..."
          : editCompany
          ? "Update"
          : "Save"}
      </button>
    </form>
  );
}
