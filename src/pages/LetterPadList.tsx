import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiEdit, FiTrash2, FiCopy } from "react-icons/fi";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { Image, PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import { ROUTES } from "../constants";
import {
  formatDate,
  getCompanyLogo,
  getCompanyStamp,
  getCompanyWatermark,
} from "../utils/commonUtils";

import { useLetterpads } from "../hooks/useInvoices";
// import LetterpadListPDF from "../components/letterpad/LetterpadListPDF";
import AddLetterpad from "../components/letterpad/AddLetterPadForm";
import SingleLetterpadPDF from "../components/letterpad/SingleLetterpadPDF";
import { useCompanyById } from "../hooks/useCompanyById";

export default function LetterpadList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLetter, setEditLetter] = useState(false);
  const companyId = location.state?.companyId;
  const companyName = location.state?.companyName;
  const { company } = useCompanyById(companyId);

  useEffect(() => {
    if (!companyId || !companyName) {
      navigate(ROUTES.SELECTCOMPANYLETTERPADS);
    }
  }, [companyId, companyName]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, loading, error, deleteItem } = useLetterpads(companyId);

  const filteredData = useMemo(() => {
    if (!data?.length) return [];
    return data.filter((l: any) =>
      [l.letterNumber, l.subject, l.to]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(search.toLowerCase()))
    );
  }, [data, search]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData
      .sort((a, b) => b?.createdAt.localeCompare(a?.createdAt))
      .slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleDelete = async () => {
    await deleteItem(selectedLetter.id);
    toast.success("Letter deleted");
    setConfirmDelete(false);
    setSelectedLetter(null);
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error.message}</p>;

  const renderActionButtons = (l: any, displayLabel = false) => {
    const onClickGeneral = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedLetter(l);
      setShowDetailsModal(false);
    };
    return (
      <div className="flex gap-2 w-full justify-between">
        <button
          title="Edit"
          className="text-blue-500 hover:underline hover:bg-blue-500 hover:text-white rounded px-1 py-1 pt-1 flex items-center gap-1"
          onClick={(e) => {
            onClickGeneral(e);
            setEditLetter(true);
            setShowAddModal(true);
          }}
        >
          <FiEdit className="inline" /> {displayLabel ? "Edit" : ""}
        </button>
        <button
          title="Delete"
          className="text-red-500 hover:underline hover:bg-red-500 hover:text-white rounded px-1 py-1 pt-1 flex items-center gap-1"
          onClick={(e) => {
            onClickGeneral(e);
            setConfirmDelete(true);
          }}
        >
          <FiTrash2 className="inline" /> {displayLabel ? "Delete" : ""}
        </button>
        <button
          title="Copy"
          className="text-amber-500 hover:underline hover:bg-amber-500 hover:text-white rounded px-1 py-1 pt-1 flex items-center gap-1"
          onClick={(e) => {
            onClickGeneral(e);
            setShowAddModal(true);
          }}
        >
          <FiCopy className="inline" /> {displayLabel ? "Copy" : ""}
        </button>
      </div>
    );
  };

  const companyWatermarkNode = (
    <Image
      src={getCompanyWatermark(company?.gstin || "")}
      style={{
        position: "absolute",
        top: "35%",
        left: "20%",
        width: "60%",
        opacity: 0.06,
      }}
    />
  );

  const companyLogoNode = (
    <Image src={getCompanyLogo(company?.gstin)} style={{ width: 60 }} />
  );

  const companyStampNode = (
    <Image src={getCompanyStamp(company?.gstin)} style={{ width: 80 }} />
  );

  return (
    <div className="p-4">
      {/* {paginatedData?.length > 0 && (
        <PDFViewer width="100%" height="100%" style={{ position: "absolute" }}>
          <SingleLetterpadPDF
            letter={paginatedData[0]}
            company={company}
            companyLogoNode={companyLogoNode}
            companyWatermarkNode={companyWatermarkNode}
            companyStampNode={companyStampNode}
          />
        </PDFViewer>
      )} */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold">Letter Pads – {companyName}</h1>

        <div className="flex gap-2">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <BsFillPlusCircleFill /> Letter Pad
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        className="border p-2 rounded w-full sm:w-64 mb-4"
        placeholder="Search letter number / subject / to"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />
      {/* Empty */}
      {paginatedData.length === 0 ? (
        <EmptyState
          title="No Letter Pads found"
          subtitle="Create letterpads to manage your correspondence."
          ctaLabel="+ Letterpad"
          onCta={() => setShowAddModal(true)}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">To</th>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((l: any) => (
                  <tr
                    key={l.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedLetter(l);
                      setShowDetailsModal(true);
                    }}
                  >
                    <td className="px-4 py-2">{l.letterNumber}</td>
                    <td className="px-4 py-2">{formatDate(l.letterDate)}</td>
                    <td className="px-4 py-2">{l.to}</td>
                    <td className="px-4 py-2 truncate max-w-[200px]">
                      {l.subject}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      {renderActionButtons(l, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {paginatedData.map((l: any) => (
              <div
                key={l.id}
                className="bg-white p-3 rounded shadow"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedLetter(l);
                  setShowDetailsModal(true);
                }}
              >
                <div className="flex justify-between items-start flex-col">
                  <div>
                    <div className="flex gap-2 items-start flex-rows">
                      <p className="text-sm font-bold">
                        Letter #{l.letterNumber}
                      </p>
                      <p className="text-sm">{formatDate(l.letterDate)}</p>
                    </div>
                    <p className="text-sm text-gray-600">{l.subject}</p>
                  </div>
                  <div className="w-full text-sm mt-1">
                    {renderActionButtons(l, true)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Preview Modal */}
      {selectedLetter && showDetailsModal && (
        <Modal
          title={`Letter #${selectedLetter.letterNumber}`}
          isOpen={!!selectedLetter}
          onClose={() => setSelectedLetter(null)}
          footer={
            <PDFDownloadLink
              document={
                <SingleLetterpadPDF
                  letter={selectedLetter}
                  company={company}
                  companyLogoNode={companyLogoNode}
                  companyWatermarkNode={companyWatermarkNode}
                  companyStampNode={companyStampNode}
                />
              }
              fileName={`letter_${selectedLetter.letterNumber}.pdf`}
            >
              {({ loading }) => (
                <button className="px-4 py-2 bg-blue-600 text-white rounded">
                  {loading ? "Loading..." : "Print"}
                </button>
              )}
            </PDFDownloadLink>
          }
        >
          <p>
            <b>To:</b> {selectedLetter.to}
          </p>
          <p>
            <b>Date:</b> {formatDate(selectedLetter.letterDate)}
          </p>
          <p>
            <b>Subject:</b> {selectedLetter.subject}
          </p>
          <hr className="my-2" />
          <p className="whitespace-pre-wrap">{selectedLetter.body}</p>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <Modal
          title="Confirm Delete"
          isOpen={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          footer={
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          }
        >
          Are you sure you want to delete this letter?
        </Modal>
      )}
      {showAddModal && (
        <AddLetterpad
          companyId={company?.gstin}
          companyName={company?.name}
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedLetter(null);
            setEditLetter(false);
          }}
          editLetter={editLetter}
          copyFrom={selectedLetter}
        />
      )}
    </div>
  );
}
