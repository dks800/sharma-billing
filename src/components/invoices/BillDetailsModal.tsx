// import { useLocation, useNavigate } from "react-router-dom";
// import { getFinancialYear } from "../../utils/billingHelper";
// import { formatCurrency } from "../../utils/commonUtils";
// import Modal from "../common/Modal";

// export const BillDetailsModal = ({ selectedBill, onClose }) => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const companyId = location.state?.companyId;
//     const companyName = location.state?.companyName;

//     return <Modal
//         title={`Bill #${selectedBill.billNumber} - ${companyName} (${getFinancialYear(
//             selectedBill.billDate
//         )})`}
//         type="info"
//         isOpen={true}
//         onClose={() => setSelectedBill(null)}
//         footer={
//             <div className="flex justify-between w-full">
//                 <div className="flex gap-2">
//                     <button
//                         className="px-4 py-2 rounded border border-blue-500 text-blue-600 hover:bg-blue-50"
//                         onClick={() => {
//                             navigate(ROUTES?.EDITSALES, {
//                                 state: { bill: selectedBill, companyId },
//                             });
//                             setSelectedBill(null);
//                         }}
//                     >
//                         Edit
//                     </button>
//                     <button
//                         className="px-4 py-2 rounded border border-red-500 text-red-600 hover:bg-red-50"
//                         onClick={() => setConfirmDelete(true)}
//                     >
//                         Delete
//                     </button>
//                     <button className="px-4 py-2 rounded border border-gray-500 text-gray-700 hover:bg-gray-100">
//                         Print
//                     </button>
//                 </div>

//                 <div>
//                     <button
//                         className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
//                         onClick={() => setSelectedBill(null)}
//                     >
//                         Close
//                     </button>
//                 </div>
//             </div>
//         }
//     >
//         {/* Content Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
//             <p>
//                 <span className="font-medium">Date:</span>{" "}
//                 {formatDate(selectedBill.billDate)}
//             </p>
//             <p>
//                 <span className="font-medium">Customer:</span>{" "}
//                 {selectedBill.customerName}
//             </p>
//             <p>
//                 <span className="font-medium">GSTIN:</span>{" "}
//                 {selectedBill.customerGSTIN || "-"}
//             </p>
//             <p>
//                 <span className="font-medium">Phone:</span>{" "}
//                 {selectedBill.customerPhone || "-"}
//             </p>
//             <p>
//                 <span className="font-medium">Status:</span>{" "}
//                 {renderPaymentStatus(selectedBill.paymentStatus)}
//             </p>
//             <p className="sm:col-span-2">
//                 <span className="font-medium">Comments:</span>{" "}
//                 {selectedBill.comments || "-"}
//             </p>

//             {/* Bill Summary */}
//             <div className="sm:col-span-2 bg-gray-50 rounded-lg mt-2 shadow-sm">
//                 <h3 className="text-base font-semibold mb-2">Bill Summary</h3>
//                 <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                         <span className="font-medium">Sub Total:</span>
//                         <span>{formatCurrency(selectedBill.totalBeforeTax)}</span>
//                     </div>
//                     <div className="flex justify-between">
//                         <span className="font-medium">Tax {getTaxType()}:</span>
//                         <span>{formatCurrency(selectedBill.totalGST)}</span>
//                     </div>
//                     <div className="flex justify-between border-t pt-2 bg-green-50 rounded text-green-800 font-semibold">
//                         <span>Grand Total:</span>
//                         <span>{formatCurrency(selectedBill.totalAmount)}</span>
//                     </div>
//                 </div>
//             </div>
//         </div>

//         {/* Items Section */}
//         <div className="mt-4">
//             <h3 className="text-base font-semibold mb-2">Items</h3>

//             {/* Desktop Table */}
//             <div className="hidden sm:block overflow-x-auto">
//                 <table className="min-w-full border border-gray-200 text-sm">
//                     <thead className="bg-gray-100">
//                         <tr>
//                             <th className="border px-3 py-2 text-left">#</th>
//                             <th className="border px-3 py-2 text-left">Description</th>
//                             <th className="border px-3 py-2 text-right">Qty</th>
//                             <th className="border px-3 py-2 text-right">Rate</th>
//                             <th className="border px-3 py-2 text-right">Total</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {selectedBill.items?.map((item, idx) => (
//                             <tr key={idx}>
//                                 <td className="border px-3 py-2">{idx + 1}</td>
//                                 <td className="border px-3 py-2">{item.description}</td>
//                                 <td className="border px-3 py-2 text-right">{item.qty}</td>
//                                 <td className="border px-3 py-2 text-right">
//                                     {formatCurrency(item.rate)}
//                                 </td>
//                                 <td className="border px-3 py-2 text-right">
//                                     {formatCurrency(item.total)}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Mobile Accordion */}
//             <div className="sm:hidden space-y-2">
//                 {selectedBill.items?.map((item, idx) => (
//                     <details
//                         key={idx}
//                         className="border rounded-lg p-3 shadow-sm bg-white"
//                     >
//                         <summary className="font-medium cursor-pointer">
//                             {idx + 1}. {item.description}
//                         </summary>
//                         <div className="mt-2 text-sm space-y-1">
//                             <p>
//                                 <span className="font-medium">Qty:</span> {item.quantity}
//                             </p>
//                             <p>
//                                 <span className="font-medium">Rate:</span>{" "}
//                                 {formatCurrency(item.rate)}
//                             </p>
//                             <p>
//                                 <span className="font-medium">GST:</span> {item.gstRate}%
//                             </p>
//                             <p>
//                                 <span className="font-medium">Total:</span>{" "}
//                                 {formatCurrency(item.total)}
//                             </p>
//                         </div>
//                     </details>
//                 ))}
//             </div>
//         </div>
//     </Modal>

// }