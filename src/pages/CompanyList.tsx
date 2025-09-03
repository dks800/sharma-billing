import { useState, useMemo } from "react";
import AddCompanyForm from "../components/companies/AddCompanyForm";
import { FiPlus, FiEdit2, FiTrash2, FiDownload } from "react-icons/fi";
import Modal from "../components/common/Modal";
import { useCompanies } from "../hooks/useCompanies";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Loader from "../components/Loader";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CompanyListPDF from "../components/companies/CompanyListPDF";
import { toast } from "react-toastify";

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  branch: string;
  city: string;
  ifsc: string;
}

export interface TypeCompany {
  id: string;
  name: string;
  gstin?: string;
  msme?: string;
  address?: string;
  owner?: string;
  contactNumber?: string;
  email?: string;
  website?: string;
  establishmentDate?: string;
  lutArn?: string;
  ieCode?: string;
  bankAccounts?: BankAccount[];
}

export default function CompanyList() {
  const { data: companies, loading, error, deleteItem } = useCompanies();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editCompany, setEditCompany] = useState<TypeCompany | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TypeCompany | null>(null);
  const [detailCompany, setDetailCompany] = useState<TypeCompany | null>(null);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof TypeCompany>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const handleDelete = async (company: TypeCompany) => {
    try {
      const billsRef = collection(db, "invoices");
      const q = query(billsRef, where("companyId", "==", company.id));
      const snap = await getDocs(q);
      if (!snap.empty) {
        alert("Cannot delete. Bills exist for this company.");
        return;
      }
      await deleteItem(company.id);
      setConfirmDelete(null);
    } catch (err) {
      console.error("Error deleting company:", err);
    }
  };

  const filtered = useMemo(() => {
    if (!companies) return [];
    return companies
      .filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.gstin ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.msme ?? "").toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const aVal = (a[sortField] || "").toString().toLowerCase();
        const bVal = (b[sortField] || "").toString().toLowerCase();
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [companies, search, sortField, sortOrder]);

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filtered.length / pageSize);

  const footerDeleteButton = () => (
    <div className="flex gap-4">
      <button
        onClick={() => setConfirmDelete(null)}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Close
      </button>
      <button
        onClick={() => handleDelete(confirmDelete!)}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Confirm
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:items-center">
        <button
          onClick={() => {
            setEditCompany(null);
            setShowFormModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-1 w-full sm:w-auto justify-center"
        >
          <FiPlus /> New Company
        </button>
        <input
          type="text"
          placeholder="Search company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
        />
        <PDFDownloadLink
          document={<CompanyListPDF companies={companies} />}
          fileName="company_list.pdf"
        >
          {({ loading }) => (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
              onClick={() => {
                if (!loading) {
                  toast.success("✅ PDF download started!");
                  console.log("PDF generation started");
                }
              }}
            >
              <FiDownload className="text-lg" />
              {loading ? "Generating PDF..." : "Export List"}
            </button>
          )}
        </PDFDownloadLink>

      </div>

      {showFormModal && (
        <Modal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title={editCompany ? "Edit Company" : "Add Company"}
        >
          <AddCompanyForm
            editCompany={editCompany}
            onCompanyAdded={() => setShowFormModal(false)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          footer={footerDeleteButton()}
          title="Confirm Delete"
        >
          Are you sure you want to delete{" "}
          <strong>"{confirmDelete.name}"?</strong> This action cannot be undone.
        </Modal>
      )}
      {detailCompany && (
        <Modal
          isOpen={!!detailCompany}
          onClose={() => setDetailCompany(null)}
          title={`Company Details: ${detailCompany.name}`}
        >
          <div className="space-y-3">
            <p>
              <strong>GSTIN:</strong> {detailCompany.gstin || "-"}
            </p>
            <p>
              <strong>MSME:</strong> {detailCompany.msme || "-"}
            </p>
            <p>
              <strong>Owner:</strong> {detailCompany.owner || "-"}
            </p>
            <p>
              <strong>Contact:</strong> {detailCompany.contactNumber || "-"}
            </p>
            <p>
              <strong>Email:</strong> {detailCompany.email || "-"}
            </p>
            <p>
              <strong>Address:</strong> {detailCompany.address || "-"}
            </p>
          </div>
        </Modal>
      )}

      {/* Company List */}
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Company List</h2>
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-red-500">Error loading companies</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No companies found</p>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    {[
                      "id",
                      "name",
                      "gstin",
                      "msme",
                      "contactNumber",
                      "owner",
                    ].map((field) => (
                      <th
                        key={field}
                        className="p-2 cursor-pointer"
                        onClick={() => {
                          if (sortField === field) {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          } else {
                            setSortField(field as keyof TypeCompany);
                            setSortOrder("asc");
                          }
                        }}
                      >
                        {field.toUpperCase()}
                        {sortField === field &&
                          (sortOrder === "asc" ? " ↑" : " ↓")}
                      </th>
                    ))}
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((company, idx) => (
                    <tr
                      key={company.id}
                      className="border-t cursor-pointer hover:bg-gray-50"
                      onClick={() => setDetailCompany(company)}
                    >
                      <td className="p-2">{idx + 1}</td>
                      <td className="p-2">{company.name}</td>
                      <td className="p-2">{company.gstin || "-"}</td>
                      <td className="p-2">{company.msme || "-"}</td>
                      <td className="p-2">{company.contactNumber || "-"}</td>
                      <td className="p-2">{company.owner || "-"}</td>
                      <td
                        className="p-2 flex space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="text-blue-500 hover:underline flex items-center"
                          onClick={() => {
                            setEditCompany(company);
                            setShowFormModal(true);
                          }}
                        >
                          <FiEdit2 className="mr-1" /> Edit
                        </button>
                        <button
                          className="text-red-500 hover:underline flex items-center"
                          onClick={() => setConfirmDelete(company)}
                        >
                          <FiTrash2 className="mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {paginated.map((company, idx) => (
                <div
                  key={company.id}
                  className="border rounded-lg p-3 bg-white shadow-sm"
                  onClick={() => setDetailCompany(company)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{company.name}</h3>
                    <span className="text-sm text-gray-500">#{idx + 1}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    GSTIN: {company.gstin || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    MSME: {company.msme || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {company.contactNumber || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Owner: {company.owner || "-"}
                  </p>
                  <div
                    className="flex gap-4 mt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="text-blue-500 text-sm flex items-center"
                      onClick={() => {
                        setEditCompany(company);
                        setShowFormModal(true);
                      }}
                    >
                      <FiEdit2 className="mr-1" /> Edit
                    </button>
                    <button
                      className="text-red-500 text-sm flex items-center"
                      onClick={() => setConfirmDelete(company)}
                    >
                      <FiTrash2 className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
