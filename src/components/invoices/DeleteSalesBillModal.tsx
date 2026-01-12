import { formatCurrency, formatDate } from "../../utils/commonUtils";
import Modal from "../common/Modal";

type typeDeleteSalesBill = {
  isOpen: boolean;
  footerContent: React.ReactNode;
  selectedBill: any;
  setConfirmDelete: (val: boolean) => void;
};

const DeleteSalesBillModal = ({
  isOpen,
  footerContent,
  selectedBill,
  setConfirmDelete,
}: typeDeleteSalesBill) => {
  if (!selectedBill) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setConfirmDelete(false)}
      footer={footerContent}
      title="Confirm Delete"
    >
      <p className="mb-4 text-gray-700">
        Are you sure you want to delete this? This action cannot be undone.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-lg">
        <div>
          <span className="font-medium">Number:</span>{" "}
          {selectedBill?.billNumber}
        </div>
        <div>
          <span className="font-medium">Date:</span>{" "}
          {selectedBill?.billDate ? formatDate(selectedBill.billDate) : "-"}
        </div>
        <div>
          <span className="font-medium">Customer:</span>{" "}
          {selectedBill?.customerName || "-"}
        </div>
        <div>
          <span className="font-medium">Total Amount:</span>{" "}
          {selectedBill ? formatCurrency(selectedBill.totalAmount) : "-"}
        </div>
        {selectedBill?.title && (
          <div>
            <span className="font-medium">Title:</span> {selectedBill?.title}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DeleteSalesBillModal;
