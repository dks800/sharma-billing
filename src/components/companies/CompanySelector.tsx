import React from "react";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "../../hooks/useCompanies";
import Loader from "../Loader";
import { ROUTES } from "../../constants";

export default function CompanySelectorPage({
  redirectTo,
}: {
  redirectTo: "sales" | "purchase";
}) {
  const navigate = useNavigate();
  //   const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const { data: companies, loading, error } = useCompanies();

  const handleSelect = (gstin: string, name: string) => {
    navigate(`/${redirectTo}`, { state: { companyId: gstin, companyName: name } });
  };

  const handleClose = () => {
    navigate(ROUTES?.DASHBOARD);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <h2 className="text-xl font-bold mb-4">Select Company</h2>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✖
        </button>

        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-red-500">Error loading companies</p>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-auto">
            {companies.map((company: any) => (
              <li
                key={company.id}
                className="p-2 bg-blue-100 rounded cursor-pointer hover:bg-blue-200"
                onClick={() => handleSelect(company?.gstin, company?.name)}
              >
                {company.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
