import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsSave } from "react-icons/bs";
import { toast } from "react-toastify";
import { useLetterpads } from "../../hooks/useInvoices";
import { formatDate } from "../../utils/commonUtils";
import { ROUTES } from "../../constants";
import Loader from "../Loader";
import Modal from "../common/Modal";

export default function AddLetterpad({
  companyId,
  companyName,
  isOpen,
  onClose,
  editLetter,
  copyFrom,
}: {
  companyId: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
  editLetter?: any;
  copyFrom?: any;
}) {
  const navigate = useNavigate();
  const [loadingSave, setLoadingSave] = useState(false);

  const isEdit = !!editLetter;

  const { addItem, updateItem, loading } = useLetterpads(companyId);

  const [form, setForm] = useState({
    letterNumber: "",
    letterDate: formatDate(new Date()),
    to: "",
    toLine1: "",
    toLine2: "",
    subject: "",
    body: "",
  });

  /** -------------------------
   *  Init form
   * ------------------------*/
  useEffect(() => {
    if (!companyId || !companyName) {
      navigate(ROUTES.SELECTCOMPANYLETTERPADS);
      return;
    }

    // Edit
    if (editLetter) {
      setForm({
        letterNumber: copyFrom.letterNumber,
        letterDate: formatDate(copyFrom.letterDate),
        to: copyFrom.to,
        toLine1: copyFrom.toLine1,
        toLine2: copyFrom.toLine2,
        subject: copyFrom.subject,
        body: copyFrom.body,
      });
      return;
    }

    // Copy
    if (copyFrom) {
      setForm((prev) => ({
        ...prev,
        to: copyFrom.to,
        toLine1: copyFrom.toLine1,
        toLine2: copyFrom.toLine2,
        subject: copyFrom.subject,
        body: copyFrom.body,
      }));
    }

    // New letter number
    // getNextLetterNumber().then((num: string) => {
    //   setForm((prev) => ({ ...prev, letterNumber: num }));
    // });
  }, []);

  /** -------------------------
   *  Handlers
   * ------------------------*/
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.to) return "Recipient is required";
    if (!form.subject) return "Subject is required";
    if (!form.body) return "Letter body is required";
    return "";
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const payload = {
      ...form,
      companyId,
      createdAt: new Date().toISOString(),
    };
    setLoadingSave(true);
    try {
      if (isEdit) {
        await updateItem(copyFrom.id, payload);
        toast.success("Letter updated successfully");
      } else {
        await addItem(payload);
        toast.success("Letter created successfully");
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoadingSave(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={companyName || ""}
      size="lg"
      footer={
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loadingSave}
            className={`px-5 py-2 bg-green-600 text-white rounded flex items-center gap-2 hover:bg-green-700 transition ${
              loadingSave ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <BsSave /> {loadingSave ? "Saving..." : "Save"}
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold">
            {isEdit ? "Edit Letterpad" : "Add Letterpad"}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded shadow p-4 space-y-4">
          <div className="flex gap-2 items-start">
            <div className="flex gap-2 items-start sm:flex-row flex-col">
              <label className="label w-[120px]">Letter No</label>
              <input
                name="letterNumber"
                type="number"
                value={form.letterNumber}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="flex gap-2 items-start sm:flex-row flex-col">
              <label className="label w-[120px]">Date</label>
              <input
                type="date"
                name="letterDate"
                value={form.letterDate}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
          </div>
          <div className="flex gap-2 items-start sm:flex-row flex-col">
            <label className="label w-[120px]">To</label>
            <input
              name="to"
              value={form.to}
              onChange={handleChange}
              placeholder="Recipient Name"
              className="w-full border rounded p-2"
            />
          </div>

          <div className="flex gap-2 items-start sm:flex-row flex-col">
            <label className="label w-[120px]">Line 1 & 2</label>
            <div className="flex w-full gap-2">
              <input
                name="toLine1"
                value={form.toLine1}
                onChange={handleChange}
                placeholder="Line 1"
                className="w-full border rounded p-2"
              />
              <input
                name="toLine2"
                value={form.toLine2}
                onChange={handleChange}
                placeholder="Line 2"
                className="w-full border rounded p-2"
              />
            </div>
          </div>
          <div className="flex gap-2 items-start sm:flex-row flex-col">
            {" "}
            <label className="label w-[120px]">Subject</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Letter subject"
              className="w-full border rounded p-2"
            />
          </div>

          <div className="flex gap-2 items-start sm:flex-row flex-col">
            <label className="label w-[120px]">Letter Body</label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              rows={10}
              placeholder="Write letter content here..."
              className="w-full border rounded p-2  resize-y-none"
              maxLength={1100}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
