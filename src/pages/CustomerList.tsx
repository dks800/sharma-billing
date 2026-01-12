import { useState, useMemo } from "react";
import AddCustomerForm from "../components/customer/AddCustomerForm";
import { useClients } from "../hooks/useClients";
import { FiEdit2, FiTrash2, FiDownload, FiEdit } from "react-icons/fi";
import Modal from "../components/common/Modal";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import Loader from "../components/Loader";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CustomerListPDF from "../components/customer/CustomerListPDF";
import { toast } from "react-toastify";
import { BsFillPlusCircleFill } from "react-icons/bs";

export default function CustomerListPage() {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [sortField, setSortField] = useState("name");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  const {
    data: clients,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
  } = useClients({
    orderByField: sortField,
    orderDirection,
  });

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter((c: any) =>
      [c.name, c.email, c.phone, c.poc]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search.toLowerCase()))
    );
  }, [clients, search]);

  const paginatedClients = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, page, pageSize]);

  const totalPages = Math.ceil(filteredClients.length / pageSize);

  const handleSave = async (clientData: any) => {
    try {
      const existingClient = clients.find(
        (c) =>
          c.gstin?.trim().toLowerCase() ===
          clientData.gstin?.trim().toLowerCase()
      );

      if (!editingClient && existingClient) {
        toast.warning(
          `Customer with GSTIN ${clientData.gstin} already exists: ${existingClient.name}`
        );
        return;
      }

      if (editingClient) {
        await updateItem(editingClient.id, clientData);
        toast.success("Client updated successfully");
      } else {
        await addItem({ ...clientData, createdAt: new Date() });
        toast.success("Client added successfully");
      }

      setEditingClient(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving client:", error);
      toast.error("Failed to save client");
    }
  };

  const toggleSortDirection = () => {
    setOrderDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const billsRef = collection(db, "invoices");
      const q = query(billsRef, where("clientId", "==", confirmDelete.id));
      const snap = await getDocs(q);

      if (!snap.empty) {
        alert(
          `Cannot delete "${confirmDelete.name}". There are sales/purchase bills linked to this client.`
        );
        setConfirmDelete(null);
        return;
      }

      await deleteItem(confirmDelete.id);
      setConfirmDelete(null);
    } catch (err) {
      console.error("Error deleting client:", err);
      alert("Something went wrong while deleting the client.");
      setConfirmDelete(null);
    }
  };

  const deleteFooter = () => (
    <div className="flex gap-4 justify-end">
      <button
        onClick={() => setConfirmDelete(null)}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Cancel
      </button>
      <button
        onClick={handleConfirmDelete}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Confirm
      </button>
    </div>
  );

  return (
    <div className="p-2 space-y-4">
      {/* Search + Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/3"
        />
        <div className="flex items-center gap-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-1"
            onClick={() => {
              setEditingClient(null);
              setIsModalOpen(true);
            }}
          >
            <BsFillPlusCircleFill /> Add Client
          </button>

          {clients?.length && (
            <PDFDownloadLink
              document={<CustomerListPDF clients={clients} />}
              fileName="client_list.pdf"
            >
              {({ loading }) => (
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center gap-2"
                  onClick={() => {
                    if (!loading) {
                      toast.success("✅ PDF download started!");
                    }
                  }}
                >
                  <FiDownload className="text-lg" />
                  {loading ? "Generating PDF..." : "Export"}
                </button>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingClient(null);
          }}
          title={editingClient ? "Edit Client Form" : "Add Client Form"}
        >
          <AddCustomerForm initialData={editingClient} onSave={handleSave} />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <Modal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          footer={deleteFooter()}
          title="Confirm Delete"
        >
          Are you sure you want to delete{" "}
          <strong>"{confirmDelete.name}"</strong>? This action cannot be undone.
        </Modal>
      )}

      {/* Client List */}
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Client List</h2>

        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-red-500">Error loading clients</p>
        ) : filteredClients.length === 0 ? (
          <p className="text-gray-500">No clients found</p>
        ) : (
          <>
            {/* Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    {[
                      "id",
                      "gstin",
                      "name",
                      "poc",
                      "phone",
                      "email",
                      "taxType",
                    ].map((field) => (
                      <th
                        key={field}
                        className="p-2 cursor-pointer"
                        onClick={() => {
                          if (sortField === field) {
                            toggleSortDirection();
                          } else {
                            setSortField(field);
                            setOrderDirection("asc");
                          }
                          setPage(1);
                        }}
                      >
                        {field.toUpperCase()}
                        {sortField === field &&
                          (orderDirection === "asc" ? " ↑" : " ↓")}
                      </th>
                    ))}
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClients.map((client, idx) => (
                    <tr
                      key={client.id}
                      className="border-t cursor-pointer hover:bg-gray-50"
                    >
                      <td className="p-2">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="p-2">{client.gstin || "-"}</td>
                      <td className="p-2">{client.name}</td>
                      <td className="p-2">{client.poc || "-"}</td>
                      <td className="p-2">{client.phone || "-"}</td>
                      <td className="p-2">{client.email || "-"}</td>
                      <td className="p-2">{client.taxType || "-"}</td>
                      <td className="p-2 flex space-x-2">
                        <button
                          title="Edit"
                          className="text-blue-500 hover:underline hover:bg-blue-500 hover:text-white rounded px-1 py-1 pt-0"
                          onClick={() => {
                            setEditingClient(client);
                            setIsModalOpen(true);
                          }}
                        >
                          <FiEdit className="inline" />
                        </button>
                        <button
                          title="Delete"
                          className="text-red-500 hover:underline hover:bg-red-500 hover:text-white rounded px-1 py-1 pt-0"
                          onClick={() => setConfirmDelete(client)}
                        >
                          <FiTrash2 className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: Card Layout */}
            <div className="grid gap-4 md:hidden">
              {paginatedClients.map((client) => (
                <div
                  key={client.id}
                  className="bg-white p-4 rounded-lg shadow border"
                >
                  <div className="font-semibold text-lg">{client.name}</div>
                  <p className="text-sm text-gray-600">
                    GSTIN: {client.gstin || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    POC: {client.poc || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {client.phone || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {client.email || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tax Type: {client.taxType || "-"}
                  </p>

                  <div className="flex gap-4 mt-3">
                    <button
                      className="text-blue-500 hover:underline flex items-center"
                      onClick={() => {
                        setEditingClient(client);
                        setIsModalOpen(true);
                      }}
                    >
                      <FiEdit2 className="mr-1" /> Edit
                    </button>
                    <button
                      className="text-red-500 hover:underline flex items-center"
                      onClick={() => setConfirmDelete(client)}
                    >
                      <FiTrash2 className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={
                  page === totalPages || filteredClients.length < pageSize
                }
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-sm">Page Size:</span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="p-1 rounded-full"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}
