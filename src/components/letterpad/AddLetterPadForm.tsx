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
    letterDate: new Date().toISOString().split("T")[0],
    to: "",
    toLine1: "",
    toLine2: "",
    subject: "",
    body: "",
    isTable: false,
    table: {
      headers: ["Col 1"],
      rows: [{ c0: "" }],
    },
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
        isTable: copyFrom.isTable || false,
        table: copyFrom.table || { headers: ["Col 1"], rows: [{ c0: "" }] },
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
        isTable: copyFrom.isTable || false,
        table: copyFrom.table || { headers: ["Col 1"], rows: [{ c0: "" }] },
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

  const addHeader = () => {
    setForm((prev) => {
      const newIndex = prev.table.headers.length;
      return {
        ...prev,
        table: {
          headers: [...prev.table.headers, `Column ${newIndex + 1}`],
          rows: prev.table.rows.map((r) => ({
            ...r,
            [`c${newIndex}`]: "",
          })),
        },
      };
    });
  };

  const addRow = () => {
    setForm((prev: any) => {
      const newRow = {} as any;
      prev.table.headers.forEach((_: any, i: number) => {
        newRow[`c${i}`] = "";
      });

      return {
        ...prev,
        table: {
          ...prev.table,
          rows: [...prev.table.rows, newRow],
        },
      };
    });
  };

  const updateHeader = (i: number, value: string) => {
    const headers = [...form.table.headers];
    headers[i] = value;
    setForm((prev) => ({
      ...prev,
      table: { ...prev.table, headers },
    }));
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const rows = [...form.table.rows];
    rows[rowIndex] = {
      ...rows[rowIndex],
      [`c${colIndex}`]: value,
    };

    setForm((prev) => ({
      ...prev,
      table: { ...prev.table, rows },
    }));
  };

  const validate = () => {
    if (!form.letterNumber) return "Letter Number is required";
    if (!form?.isTable && !form.body) return "Letter body is required";
    if (form.isTable && (!form.table.headers.length || !form.table.rows.length))
      return "Table Data is required";
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
            {" "}
            <label className="label w-[120px]">Table Data?</label>
            <input
              type="checkbox"
              className="mt-2"
              checked={form.isTable}
              name="isTable"
              onChange={() =>
                setForm((prev) => ({ ...prev, isTable: !prev.isTable }))
              }
            />
          </div>

          <div className="flex gap-2 items-start sm:flex-row flex-col">
            <label className="label w-[120px]">Letter Body</label>

            {form.isTable ? (
              <div className="w-full border rounded p-2 overflow-x-auto space-y-3">
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addHeader}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    + Add Column
                  </button>

                  <button
                    type="button"
                    onClick={addRow}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    + Add Row
                  </button>
                </div>

                {/* Table */}
                <table className="w-full border-collapse border text-sm">
                  <thead>
                    <tr>
                      {form.table.headers.map((h, i) => (
                        <th key={i} className="border p-1">
                          <input
                            value={h}
                            onChange={(e) => updateHeader(i, e.target.value)}
                            className="w-full border rounded px-1"
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {form.table.rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx}>
                        {form.table.headers.map((_: any, cIdx: number) => (
                          <td key={cIdx} className="border p-1">
                            <input
                              value={row[`c${cIdx}`] || ""}
                              onChange={(e) =>
                                updateCell(rIdx, cIdx, e.target.value)
                              }
                              className="w-full border rounded px-1"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <textarea
                name="body"
                value={form.body}
                onChange={handleChange}
                rows={10}
                placeholder="Write letter content here..."
                className="w-full border rounded p-2 resize-none"
                maxLength={1100}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
