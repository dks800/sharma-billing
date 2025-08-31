import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { TypeCompany } from "../../pages/CompanyList";

interface CompanyTablePrintProps {
  companies: TypeCompany[];
}

const CompanyTablePrint: React.FC<CompanyTablePrintProps> = ({ companies }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  // const handlePrint = useReactToPrint({
  //   // @ts-expect-error react-to-print types not updated for React 19
  //   content: () => componentRef.current,
  //   documentTitle: "Company_List",
  //   onAfterPrint: () => console.log("Print completed"),
  // });

  const handlePrint = () => {
    if (componentRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Company List</title>
            </head>
            <body>
              ${componentRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div>
      <button
        onClick={handlePrint}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mb-3"
      >
        Print All Companies
      </button>

      {/* Hidden Printable Content */}
      <div ref={componentRef} className="hidden print:block">
        <div className="p-6 text-sm">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Company Records Report
          </h1>
          <table className="w-full border-collapse border text-xs">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">GSTIN</th>
                <th className="border px-2 py-1">Owner</th>
                <th className="border px-2 py-1">Contact</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Address</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c, i) => (
                <tr key={c.id}>
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">{c.name}</td>
                  <td className="border px-2 py-1">{c.gstin || "-"}</td>
                  <td className="border px-2 py-1">{c.owner || "-"}</td>
                  <td className="border px-2 py-1">{c.contactNumber || "-"}</td>
                  <td className="border px-2 py-1">{c.email || "-"}</td>
                  <td className="border px-2 py-1">{c.address || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyTablePrint;
