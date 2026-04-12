import { useNavigate } from "react-router-dom";
import { useCompanies } from "../../hooks/useCompanies";
import { useEffect } from "react";
import Loader from "../Loader";
import { ROUTES } from "../../constants";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { getCompanyLogo } from "../../utils/commonUtils";

export default function CompanySelectorPage({
  redirectTo,
}: {
  redirectTo: "sales" | "purchase" | "quotations" | "letterpads";
}) {
  const navigate = useNavigate();
  const { data: companies, loading, error } = useCompanies();

  const handleSelect = (gstin: string, name: string) => {
    navigate(`/${redirectTo}`, {
      state: { companyId: gstin, companyName: name },
    });
  };

  const handleClose = () => {
    navigate(ROUTES?.DASHBOARD);
  };

  // ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Select Company ({redirectTo?.toUpperCase()})
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-700 transition"
            >
              <FiX size={22} />
            </button>
          </div>

          {/* Stats */}
          <div className="mb-4 text-xs text-gray-400">
            Total Companies: {companies?.length || 0}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-6">
                Error loading companies
              </div>
            ) : companies?.length === 0 ? (
              <div className="text-center text-gray-400 py-6">
                No companies found
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {companies.map((company: any) => (
                  <div
                    title={company.name}
                    key={company.id}
                    onClick={() => handleSelect(company?.gstin, company?.name)}
                    className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-200 bg-white 
                 hover:border-indigo-500 hover:shadow-md 
                 transition-all duration-200 cursor-pointer"
                  >
                    {/* Company Logo */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                      <img
                        src={getCompanyLogo(company?.gstin)}
                        alt={company.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition">
                        {company.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        GSTIN: {company.gstin}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
