import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FiPlus } from "react-icons/fi";

export default function AddCompanyForm({
  onCompanyAdded,
}: {
  onCompanyAdded: () => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return alert("Company name is required");

    try {
      await addDoc(collection(db, "companies"), {
        name: companyName,
        gst: gstNumber || null,
        createdAt: serverTimestamp(),
      });
      setCompanyName("");
      setGstNumber("");
      onCompanyAdded();
    } catch (error) {
      console.error("Error adding company:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow-md space-y-4"
    >
      <h2 className="text-lg font-bold">Add Company</h2>
      <input
        type="text"
        placeholder="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        className="border p-2 w-full rounded"
      />
      <input
        type="text"
        placeholder="GST Number"
        value={gstNumber}
        onChange={(e) => setGstNumber(e.target.value)}
        className="border p-2 w-full rounded"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        <div className="flex items-center">
          <FiPlus className="mr-2" />
          Add
        </div>
      </button>
    </form>
  );
}
