import { useState } from "react";
import { PAYMENT_STATUSES } from "../../constants";
import CustomerDropdown, { Client } from "../customer/CustomerDropdown";
import { getFinancialYearsList } from "../../utils/commonUtils";

type typeFilterSection = {
  filters: Record<string, any>;
  setFilters: (val: any) => void;
  customerList: Client[];
  showFyear?: boolean;
};

const FiltersSection = ({
  showFyear = true,
  filters,
  setFilters,
  customerList,
}: typeFilterSection) => {
  const [open, setOpen] = useState(false);

  const FiltersContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {showFyear && (
        <select
          className="border rounded-xl px-3 py-2"
          value={filters.financialYear}
          onChange={(e) =>
            setFilters((prev: any) => ({
              ...prev,
              financialYear: e.target.value,
            }))
          }
        >
          <option value="">All FY</option>
          {getFinancialYearsList?.()?.map((fy) => (
            <option key={fy} value={fy}>
              {fy}
            </option>
          ))}
        </select>
      )}

      <select
        value={filters.paymentStatus}
        onChange={(e) =>
          setFilters((prev: any) => ({
            ...prev,
            paymentStatus: e.target.value,
          }))
        }
        className="border rounded-xl px-3 py-2"
      >
        <option value="">All Status</option>
        {PAYMENT_STATUSES?.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <CustomerDropdown
        showGstin={false}
        customers={customerList}
        className="border rounded-xl px-3 py-2"
        value={
          filters.customer
            ? customerList.find((c) => c.gstin === filters.customer) || null
            : null
        }
        onChange={(cust) =>
          setFilters((prev: any) => ({
            ...prev,
            customer: cust.gstin || "",
          }))
        }
      />

      <input
        type="date"
        className="border rounded-xl px-3 py-2"
        value={
          filters.dateRange.start
            ? filters.dateRange.start.toISOString().split("T")[0]
            : ""
        }
        onChange={(e) =>
          setFilters((prev: any) => ({
            ...prev,
            dateRange: {
              ...prev.dateRange,
              start: e.target.value ? new Date(e.target.value) : null,
            },
          }))
        }
      />

      <input
        type="date"
        className="border rounded-xl px-3 py-2"
        value={
          filters.dateRange.end
            ? filters.dateRange.end.toISOString().split("T")[0]
            : ""
        }
        onChange={(e) =>
          setFilters((prev: any) => ({
            ...prev,
            dateRange: {
              ...prev.dateRange,
              end: e.target.value ? new Date(e.target.value) : null,
            },
          }))
        }
      />
    </div>
  );

  return (
    <div className="bg-white p-2 rounded-2xl shadow">
      <div className="md:hidden flex justify-between items-center px-2 py-2">
        <span className="font-medium">Filters</span>
        <button
          onClick={() => setOpen(!open)}
          className="text-sm text-blue-600"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      <div className={`${open ? "block" : "hidden"} md:hidden`}>
        <FiltersContent />
      </div>

      <div className="hidden md:block">
        <FiltersContent />
      </div>
    </div>
  );
};

export default FiltersSection;
