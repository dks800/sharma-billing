import React, { useState } from "react";

export interface Client {
  id: string;
  name: string;
  gstin?: string;
  taxType?: "2.5" | "9" | "18" | "NA";
}

interface CustomerDropdownProps {
  customers: Client[];
  value: Client | null;
  onChange: (client: Client) => void;
  placeholder?: string;
}

const CustomerDropdown: React.FC<CustomerDropdownProps> = ({
  customers,
  value,
  onChange,
  placeholder = "Select Customer",
}) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.gstin?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full">
      {/* Trigger */}
      <div
        className="border rounded p-2 cursor-pointer bg-white"
        onClick={() => setOpen(!open)}
      >
        {value ? (
          <div>
            <div className="font-medium">{value.name}</div>
            <div className="text-sm text-gray-500">
              {value.gstin || "No GSTIN"}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {/* Search box inside dropdown */}
          <div className="p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or GSTIN..."
              className="w-full border rounded px-2 py-1"
            />
          </div>

          {filtered.length > 0 ? (
            filtered.map((c) => (
              <div
                key={c.id}
                className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-gray-500">
                  {c.gstin || "No GSTIN"}
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">No matches</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerDropdown;
